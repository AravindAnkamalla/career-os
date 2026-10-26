/**
 * API Route: POST /api/applications
 * 
 * Create an application from a job or manually.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const CreateApplicationSchema = z.object({
  jobId: z.string().optional(),
  company: z.string().min(1),
  role: z.string().min(1),
  postingUrl: z.string().url().optional().or(z.literal('')),
  stage: z.string().default('discovered'),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = CreateApplicationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Check for duplicate application
    if (parsed.data.jobId) {
      const existing = await prisma.application.findFirst({
        where: { jobId: parsed.data.jobId },
      })
      if (existing) {
        return NextResponse.json(
          { error: 'An application already exists for this job', existingId: existing.id },
          { status: 409 }
        )
      }
    }

    const application = await prisma.application.create({
      data: {
        jobId: parsed.data.jobId || undefined,
        company: parsed.data.company,
        role: parsed.data.role,
        postingUrl: parsed.data.postingUrl || undefined,
        stage: parsed.data.stage,
        notes: parsed.data.notes,
      },
    })

    // Create initial event
    await prisma.applicationEvent.create({
      data: {
        applicationId: application.id,
        toStage: application.stage,
        notes: 'Application created',
      },
    })

    // Update saved job status if from a job
    if (parsed.data.jobId) {
      await prisma.savedJob.upsert({
        where: { jobId: parsed.data.jobId },
        update: { status: 'applied' },
        create: {
          jobId: parsed.data.jobId,
          status: 'applied',
        },
      })
    }

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const stage = searchParams.get('stage')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (stage && stage !== 'all') {
      where.stage = stage
    }
    if (search) {
      where.OR = [
        { company: { contains: search } },
        { role: { contains: search } },
      ]
    }

    const applications = await prisma.application.findMany({
      where: where as never,
      include: {
        job: {
          select: { title: true, company: true, location: true },
        },
        events: {
          orderBy: { occurredAt: 'desc' },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ applications })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
