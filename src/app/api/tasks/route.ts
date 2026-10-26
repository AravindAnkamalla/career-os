/**
 * API Route: POST/GET /api/tasks
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const CreateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().default('career_admin'),
  priority: z.string().default('medium'),
  dueDate: z.string().optional(),
  estimatedMinutes: z.number().int().optional(),
  applicationId: z.string().optional(),
  relatedJobId: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = CreateTaskSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        priority: parsed.data.priority,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
        estimatedMinutes: parsed.data.estimatedMinutes,
        applicationId: parsed.data.applicationId || undefined,
        relatedJobId: parsed.data.relatedJobId || undefined,
        notes: parsed.data.notes,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const view = searchParams.get('view') ?? 'today' // today, upcoming, overdue, all
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
    const endOfWeek = new Date(startOfDay.getTime() + 7 * 24 * 60 * 60 * 1000)

    const where: Record<string, unknown> = {}

    if (view === 'today') {
      where.OR = [
        { dueDate: { gte: startOfDay, lt: endOfDay } },
        { dueDate: { lt: startOfDay }, status: { in: ['todo', 'in_progress'] } },
      ]
    } else if (view === 'upcoming') {
      where.dueDate = { gte: endOfDay, lt: endOfWeek }
      where.status = { in: ['todo', 'in_progress'] }
    } else if (view === 'overdue') {
      where.dueDate = { lt: startOfDay }
      where.status = { in: ['todo', 'in_progress'] }
    }

    if (category) where.category = category
    if (status) where.status = status

    const tasks = await prisma.task.findMany({
      where: where as never,
      include: {
        application: {
          select: { id: true, company: true, role: true },
        },
      },
      orderBy: [
        { priority: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    // Sort priority properly (urgent > high > medium > low)
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
    tasks.sort((a, b) => {
      const pa = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2
      const pb = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2
      if (pa !== pb) return pa - pb
      if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime()
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      return 0
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
