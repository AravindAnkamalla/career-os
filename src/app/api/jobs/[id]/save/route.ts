/**
 * API Route: POST /api/jobs/[id]/save
 * 
 * Save (bookmark/dismiss) a job.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const SaveRequestSchema = z.object({
  status: z.enum(['bookmarked', 'dismissed']),
  reason: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = SaveRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Verify job exists
    const job = await prisma.job.findUnique({ where: { id } })
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Upsert saved job
    const saved = await prisma.savedJob.upsert({
      where: { jobId: id },
      update: {
        status: parsed.data.status,
        reason: parsed.data.reason,
        notes: parsed.data.notes,
      },
      create: {
        jobId: id,
        status: parsed.data.status,
        reason: parsed.data.reason,
        notes: parsed.data.notes,
      },
    })

    return NextResponse.json(saved)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.savedJob.deleteMany({ where: { jobId: id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
