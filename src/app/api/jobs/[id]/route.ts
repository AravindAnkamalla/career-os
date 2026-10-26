/**
 * API Route: GET /api/jobs/[id]
 * 
 * Get a single job with full details and match explanation.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        matches: true,
        savedJobs: true,
        source: true,
        applications: {
          select: { id: true, stage: true, createdAt: true },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const transformed = {
      ...job,
      requiredSkills: job.requiredSkills ? JSON.parse(job.requiredSkills) : [],
      preferredSkills: job.preferredSkills ? JSON.parse(job.preferredSkills) : [],
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
    }

    return NextResponse.json(transformed)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
