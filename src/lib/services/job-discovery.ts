/**
 * Job Discovery Service
 * 
 * Orchestrates job discovery: fetches from providers, normalizes, deduplicates,
 * matches against profile, and persists to database.
 */

import { prisma } from '@/lib/db'
import { providerRegistry } from '@/lib/integrations/provider-registry'
import { calculateMatch, type UserMatchProfile } from '@/lib/matching/engine'
import type { NormalizedJob, RunSummary } from '@/lib/types/job'
import { v4 as uuid } from 'uuid'

export interface DiscoveryOptions {
  query: string
  location?: string
  remoteOnly?: boolean
  datePosted?: string
  providerName?: string
  triggeredBy?: 'manual' | 'scheduled' | 'api'
}

export interface DiscoveryResult {
  runSummary: RunSummary
  newJobs: Array<{
    id: string
    title: string
    company: string
    matchScore: number
    recommendation: string
  }>
}

/**
 * Load the user's match profile from the database
 */
export async function getUserMatchProfile(): Promise<UserMatchProfile> {
  const prefs = await prisma.careerPreference.findFirst()
  const skills = await prisma.skill.findMany()

  return {
    targetRoles: prefs ? JSON.parse(prefs.targetRoles) : ['Backend Engineer', 'Full-Stack Engineer', 'Software Engineer', 'Forward Deployed Engineer'],
    skills: skills.map(s => ({ name: s.name, category: s.category, proficiency: s.proficiency })),
    preferredLocations: prefs ? JSON.parse(prefs.preferredLocations) : ['Hyderabad', 'Bengaluru'],
    remotePreference: prefs?.remotePreference ?? 'any',
    minExperience: prefs?.minExperience ?? 0,
    maxExperience: prefs?.maxExperience ?? 3,
    preferredStack: prefs ? JSON.parse(prefs.preferredStack) : ['Node.js', 'TypeScript'],
  }
}

/**
 * Check if a job already exists in the database (deduplication)
 */
async function findExistingJob(sourceId: string, job: NormalizedJob): Promise<string | null> {
  // Check by source + external ID
  if (job.externalId) {
    const existing = await prisma.job.findUnique({
      where: { sourceId_externalId: { sourceId, externalId: job.externalId } },
      select: { id: true },
    })
    if (existing) return existing.id
  }

  // Fallback: check by similar title + company + application URL
  if (job.applicationUrl) {
    const existing = await prisma.job.findFirst({
      where: {
        applicationUrl: job.applicationUrl,
      },
      select: { id: true },
    })
    if (existing) return existing.id
  }

  // Final fallback: title + company match within recent period
  const existing = await prisma.job.findFirst({
    where: {
      title: job.title,
      company: job.company,
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // last 30 days
    },
    select: { id: true },
  })

  return existing?.id ?? null
}

/**
 * Ensure a job source exists in the database
 */
async function ensureJobSource(providerName: string, providerType: string): Promise<string> {
  const existing = await prisma.jobSource.findUnique({
    where: { name: providerName },
    select: { id: true },
  })

  if (existing) return existing.id

  const created = await prisma.jobSource.create({
    data: {
      name: providerName,
      type: providerType,
      isActive: true,
    },
  })

  return created.id
}

/**
 * Run job discovery: fetch, normalize, deduplicate, match, persist
 */
export async function runJobDiscovery(options: DiscoveryOptions): Promise<DiscoveryResult> {
  const correlationId = uuid()
  const startedAt = new Date()
  
  // Select provider
  const provider = options.providerName
    ? providerRegistry.get(options.providerName)
    : providerRegistry.getBestAvailable()

  if (!provider) {
    throw new Error('No job provider available. Configure a job API key or ensure the fixture provider is registered.')
  }

  // Ensure source record exists
  const sourceId = await ensureJobSource(provider.name, provider.type)

  // Create integration run record
  const run = await prisma.integrationRun.create({
    data: {
      sourceId,
      type: 'job_discovery',
      status: 'running',
      triggeredBy: options.triggeredBy ?? 'manual',
      correlationId,
    },
  })

  let totalProcessed = 0
  let totalCreated = 0
  const totalUpdated = 0
  let totalSkipped = 0
  let totalFailed = 0
  let errorSummary: string | undefined
  const newJobs: DiscoveryResult['newJobs'] = []

  try {
    // Fetch jobs from provider
    const result = await provider.search({
      query: options.query,
      location: options.location,
      remoteOnly: options.remoteOnly,
      datePosted: options.datePosted,
    })

    // Load user profile for matching
    const matchProfile = await getUserMatchProfile()

    // Process each job
    for (const normalizedJob of result.jobs) {
      totalProcessed++

      try {
        // Deduplication check
        const existingId = await findExistingJob(sourceId, normalizedJob)

        if (existingId) {
          // Update lastSeenAt for existing job
          await prisma.job.update({
            where: { id: existingId },
            data: { lastSeenAt: new Date() },
          })
          totalSkipped++
          continue
        }

        // Create job record
        const job = await prisma.job.create({
          data: {
            sourceId,
            externalId: normalizedJob.externalId,
            title: normalizedJob.title,
            company: normalizedJob.company,
            location: normalizedJob.location,
            remoteStatus: normalizedJob.remoteStatus,
            employmentType: normalizedJob.employmentType,
            experienceMin: normalizedJob.experienceMin,
            experienceMax: normalizedJob.experienceMax,
            description: normalizedJob.description,
            requiredSkills: JSON.stringify(normalizedJob.requiredSkills),
            preferredSkills: JSON.stringify(normalizedJob.preferredSkills),
            salaryMin: normalizedJob.salaryMin,
            salaryMax: normalizedJob.salaryMax,
            salaryCurrency: normalizedJob.salaryCurrency,
            salaryPeriod: normalizedJob.salaryPeriod,
            applicationUrl: normalizedJob.applicationUrl,
            postingUrl: normalizedJob.postingUrl,
            postedAt: normalizedJob.postedAt,
            rawData: normalizedJob.rawData ? JSON.stringify(normalizedJob.rawData) : undefined,
          },
        })

        // Calculate and store match
        const matchResult = calculateMatch(normalizedJob, matchProfile)
        await prisma.jobMatch.create({
          data: {
            jobId: job.id,
            overallScore: matchResult.overallScore,
            roleScore: matchResult.roleScore,
            skillScore: matchResult.skillScore,
            experienceScore: matchResult.experienceScore,
            locationScore: matchResult.locationScore,
            stackScore: matchResult.stackScore,
            seniorityScore: matchResult.seniorityScore,
            matchedSkills: JSON.stringify(matchResult.matchedSkills),
            missingSkills: JSON.stringify(matchResult.missingSkills),
            strongPoints: JSON.stringify(matchResult.strongPoints),
            concerns: JSON.stringify(matchResult.concerns),
            recommendation: matchResult.recommendation,
            explanation: matchResult.explanation,
          },
        })

        totalCreated++
        newJobs.push({
          id: job.id,
          title: job.title,
          company: job.company,
          matchScore: matchResult.overallScore,
          recommendation: matchResult.recommendation,
        })
      } catch (error) {
        totalFailed++
        const msg = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Failed to process job "${normalizedJob.title}" from ${normalizedJob.company}: ${msg}`)
      }
    }

    // Update source lastRunAt
    await prisma.jobSource.update({
      where: { id: sourceId },
      data: { lastRunAt: new Date() },
    })
  } catch (error) {
    errorSummary = error instanceof Error ? error.message : 'Unknown error during discovery'
    console.error(`Job discovery run failed: ${errorSummary}`)
  }

  const completedAt = new Date()
  const durationMs = completedAt.getTime() - startedAt.getTime()
  const status = errorSummary && totalCreated === 0 ? 'failed' : 'completed'

  // Update integration run
  await prisma.integrationRun.update({
    where: { id: run.id },
    data: {
      status,
      completedAt,
      durationMs,
      totalProcessed,
      totalCreated,
      totalUpdated,
      totalSkipped,
      totalFailed,
      errorSummary,
    },
  })

  return {
    runSummary: {
      runId: run.id,
      source: provider.name,
      status: status as RunSummary['status'],
      startedAt,
      completedAt,
      durationMs,
      totalProcessed,
      totalCreated,
      totalUpdated,
      totalSkipped,
      totalFailed,
      errorSummary,
      triggeredBy: options.triggeredBy ?? 'manual',
    },
    newJobs,
  }
}
