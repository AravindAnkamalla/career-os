/**
 * API Route: GET /api/jobs
 * 
 * Fetches discovered jobs with their match scores.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)
    const search = searchParams.get('search') ?? ''
    const sortBy = searchParams.get('sortBy') ?? 'matchScore' // matchScore, date, company
    const status = searchParams.get('status') // bookmarked, dismissed, all
    const minScore = parseInt(searchParams.get('minScore') ?? '0', 10)

    const where: Record<string, unknown> = {
      isActive: true,
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { company: { contains: search } },
        { location: { contains: search } },
      ]
    }

    // Filter by saved status if specified
    if (status === 'bookmarked') {
      where.savedJobs = { some: { status: 'bookmarked' } }
    } else if (status === 'dismissed') {
      where.savedJobs = { some: { status: 'dismissed' } }
    } else if (status === 'unsaved') {
      where.savedJobs = { none: {} }
    }

    // Min match score filter
    if (minScore > 0) {
      where.matches = { some: { overallScore: { gte: minScore } } }
    }

    const orderBy: Record<string, unknown> = {}
    if (sortBy === 'date') {
      orderBy.createdAt = 'desc'
    } else if (sortBy === 'company') {
      orderBy.company = 'asc'
    }
    // Default sort by match score is handled after fetch

    const total = await prisma.job.count({ where: where as never })

    const jobs = await prisma.job.findMany({
      where: where as never,
      include: {
        matches: true,
        savedJobs: true,
        source: { select: { name: true, type: true } },
        _count: { select: { applications: true } },
      },
      orderBy: sortBy === 'date' ? { createdAt: 'desc' } : { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Transform and sort
    const transformed = jobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      remoteStatus: job.remoteStatus,
      employmentType: job.employmentType,
      experienceMin: job.experienceMin,
      experienceMax: job.experienceMax,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryCurrency: job.salaryCurrency,
      salaryPeriod: job.salaryPeriod,
      applicationUrl: job.applicationUrl,
      postingUrl: job.postingUrl,
      postedAt: job.postedAt,
      firstSeenAt: job.firstSeenAt,
      lastSeenAt: job.lastSeenAt,
      requiredSkills: job.requiredSkills ? JSON.parse(job.requiredSkills) : [],
      preferredSkills: job.preferredSkills ? JSON.parse(job.preferredSkills) : [],
      source: job.source,
      match: job.matches[0] ? {
        overallScore: job.matches[0].overallScore,
        roleScore: job.matches[0].roleScore,
        skillScore: job.matches[0].skillScore,
        experienceScore: job.matches[0].experienceScore,
        locationScore: job.matches[0].locationScore,
        stackScore: job.matches[0].stackScore,
        seniorityScore: job.matches[0].seniorityScore,
        matchedSkills: JSON.parse(job.matches[0].matchedSkills ?? '[]'),
        missingSkills: JSON.parse(job.matches[0].missingSkills ?? '[]'),
        strongPoints: JSON.parse(job.matches[0].strongPoints ?? '[]'),
        concerns: JSON.parse(job.matches[0].concerns ?? '[]'),
        recommendation: job.matches[0].recommendation,
        explanation: job.matches[0].explanation,
      } : null,
      savedStatus: job.savedJobs[0]?.status ?? null,
      savedReason: job.savedJobs[0]?.reason ?? null,
      hasApplication: job._count.applications > 0,
    }))

    // Sort by match score if requested
    if (sortBy === 'matchScore') {
      transformed.sort((a, b) => (b.match?.overallScore ?? 0) - (a.match?.overallScore ?? 0))
    }

    return NextResponse.json({
      jobs: transformed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Fetch jobs error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
