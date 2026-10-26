import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const CreateInterviewSchema = z.object({
  company: z.string().min(1),
  role: z.string().optional(),
  type: z.enum(['recruiter_screen', 'behavioral', 'technical', 'system_design', 'dsa', 'fde', 'final']).default('technical'),
  scheduledAt: z.string().optional(),
  topicAreas: z.array(z.string()).default([]),
  practiceQs: z.array(z.string()).default([]),
  answerNotes: z.string().optional(),
  reflection: z.string().optional(),
  struggled: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
})

export async function GET() {
  try {
    const interviews = await prisma.interview.findMany({
      orderBy: { scheduledAt: 'asc' },
    })

    const transformed = interviews.map((i) => ({
      ...i,
      topicAreas: i.topicAreas ? JSON.parse(i.topicAreas) : [],
      practiceQs: i.practiceQs ? JSON.parse(i.practiceQs) : [],
    }))

    return NextResponse.json({ interviews: transformed })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = CreateInterviewSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const interview = await prisma.interview.create({
      data: {
        company: parsed.data.company,
        role: parsed.data.role,
        type: parsed.data.type,
        scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : undefined,
        topicAreas: JSON.stringify(parsed.data.topicAreas),
        practiceQs: JSON.stringify(parsed.data.practiceQs),
        answerNotes: parsed.data.answerNotes,
        reflection: parsed.data.reflection,
        struggled: parsed.data.struggled,
        status: parsed.data.status,
      },
    })

    return NextResponse.json(interview, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
