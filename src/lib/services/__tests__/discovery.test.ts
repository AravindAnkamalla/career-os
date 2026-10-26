import { describe, it, expect, beforeAll } from 'vitest'
import { prisma } from '@/lib/db'
import { seedInitialProfile } from '../seed'
import { initializeProviders } from '@/lib/integrations'
import { runJobDiscovery } from '../job-discovery'

describe('End-to-End Vertical Slice: Seed -> Discovery -> Match -> Application -> Task', () => {
  beforeAll(() => {
    initializeProviders()
  })

  it('seeds initial profile and preferences correctly', async () => {
    const seedResult = await seedInitialProfile()
    expect(seedResult.created || seedResult.message.includes('exists')).toBe(true)

    const profile = await prisma.userProfile.findFirst()
    expect(profile).not.toBeNull()
    expect(profile?.name).toBe('Aravind Ankamalla')

    const prefs = await prisma.careerPreference.findFirst()
    expect(prefs).not.toBeNull()
    const targetRoles = JSON.parse(prefs!.targetRoles)
    expect(targetRoles).toContain('Backend Engineer')
  })

  it('runs job discovery, normalizes, deduplicates and computes match explanations', async () => {
    const discovery = await runJobDiscovery({
      query: 'backend engineer',
      triggeredBy: 'manual',
    })

    expect(discovery.runSummary.status).toBe('completed')
    expect(discovery.runSummary.totalProcessed).toBeGreaterThan(0)

    const jobs = await prisma.job.findMany({
      include: { matches: true, source: true },
    })

    expect(jobs.length).toBeGreaterThan(0)

    // Inspect match computation on first job
    const firstJob = jobs[0]
    expect(firstJob.matches.length).toBe(1)
    const match = firstJob.matches[0]
    expect(match.overallScore).toBeGreaterThanOrEqual(0)
    expect(match.overallScore).toBeLessThanOrEqual(100)
    expect(match.explanation).toBeDefined()
    expect(match.recommendation).toBeDefined()

    // Test deduplication: running discovery again skips duplicates
    const secondDiscovery = await runJobDiscovery({
      query: 'backend engineer',
      triggeredBy: 'manual',
    })

    expect(secondDiscovery.runSummary.totalSkipped).toBeGreaterThan(0)
  })

  it('creates an application from a discovered job and adds a preparation task', async () => {
    const job = await prisma.job.findFirst({
      where: { matches: { some: { overallScore: { gte: 70 } } } },
    })
    expect(job).not.toBeNull()

    // Create application
    const app = await prisma.application.create({
      data: {
        jobId: job!.id,
        company: job!.company,
        role: job!.title,
        stage: 'shortlisted',
        notes: 'Shortlisted based on strong match score',
      },
    })

    expect(app.id).toBeDefined()
    expect(app.stage).toBe('shortlisted')

    // Create preparation task
    const task = await prisma.task.create({
      data: {
        title: `Prepare interview answers for ${app.company}`,
        category: 'interview_prep',
        priority: 'high',
        applicationId: app.id,
        relatedJobId: job!.id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
    })

    expect(task.id).toBeDefined()
    expect(task.applicationId).toBe(app.id)

    // Verify relations in DB
    const fetchedApp = await prisma.application.findUnique({
      where: { id: app.id },
      include: { tasks: true, job: true },
    })

    expect(fetchedApp?.tasks.length).toBe(1)
    expect(fetchedApp?.job?.id).toBe(job!.id)
  })
})
