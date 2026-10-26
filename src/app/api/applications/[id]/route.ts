/**
 * API Route: PATCH /api/applications/[id]
 * 
 * Update an application's stage or details.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const UpdateApplicationSchema = z.object({
  stage: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  resumeVersion: z.string().optional(),
  salaryExpected: z.string().optional(),
  salaryOffered: z.string().optional(),
  nextFollowUp: z.string().optional(), // ISO date string
  interviewDate: z.string().optional(),
  rejectionReason: z.string().optional(),
  notes: z.string().optional(),
  applicationDate: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = UpdateApplicationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.application.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    
    if (parsed.data.stage !== undefined) updateData.stage = parsed.data.stage
    if (parsed.data.contactName !== undefined) updateData.contactName = parsed.data.contactName
    if (parsed.data.contactEmail !== undefined) updateData.contactEmail = parsed.data.contactEmail
    if (parsed.data.contactPhone !== undefined) updateData.contactPhone = parsed.data.contactPhone
    if (parsed.data.resumeVersion !== undefined) updateData.resumeVersion = parsed.data.resumeVersion
    if (parsed.data.salaryExpected !== undefined) updateData.salaryExpected = parsed.data.salaryExpected
    if (parsed.data.salaryOffered !== undefined) updateData.salaryOffered = parsed.data.salaryOffered
    if (parsed.data.rejectionReason !== undefined) updateData.rejectionReason = parsed.data.rejectionReason
    if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes
    if (parsed.data.nextFollowUp) updateData.nextFollowUp = new Date(parsed.data.nextFollowUp)
    if (parsed.data.interviewDate) updateData.interviewDate = new Date(parsed.data.interviewDate)
    if (parsed.data.applicationDate) updateData.applicationDate = new Date(parsed.data.applicationDate)

    const updated = await prisma.application.update({
      where: { id },
      data: updateData,
    })

    // Record stage change event
    if (parsed.data.stage && parsed.data.stage !== existing.stage) {
      await prisma.applicationEvent.create({
        data: {
          applicationId: id,
          fromStage: existing.stage,
          toStage: parsed.data.stage,
          notes: parsed.data.notes,
        },
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            matches: true,
          },
        },
        events: {
          orderBy: { occurredAt: 'desc' },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
