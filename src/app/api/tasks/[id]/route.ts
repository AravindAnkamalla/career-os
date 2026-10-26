/**
 * API Route: PATCH /api/tasks/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const UpdateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  dueDate: z.string().nullable().optional(),
  estimatedMinutes: z.number().int().optional(),
  actualMinutes: z.number().int().optional(),
  notes: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = UpdateTaskSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = { ...parsed.data }

    if (parsed.data.dueDate !== undefined) {
      updateData.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null
    }

    if (parsed.data.status === 'done') {
      updateData.completedAt = new Date()
    }

    delete updateData.dueDate
    if (parsed.data.dueDate !== undefined) {
      updateData.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(task)
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
    await prisma.task.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
