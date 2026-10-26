import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const CreateProblemSchema = z.object({
  title: z.string().min(1),
  url: z.string().url().optional().or(z.literal('')),
  platform: z.string().default('leetcode'),
  topic: z.string().default('arrays'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  notes: z.string().optional(),
  approach: z.string().optional(),
  complexity: z.string().optional(),
  solvedIndependently: z.boolean().default(true),
  status: z.enum(['solved', 'partially_solved', 'unsolved']).default('solved'),
})

export async function GET() {
  try {
    const problems = await prisma.dsaProblem.findMany({
      include: {
        attempts: {
          orderBy: { attemptDate: 'desc' },
          take: 5,
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const totalSolved = problems.filter(p => p.attempts.some(a => a.status === 'solved')).length

    return NextResponse.json({
      problems,
      stats: {
        total: problems.length,
        solved: totalSolved,
        byDifficulty: {
          easy: problems.filter(p => p.difficulty === 'easy').length,
          medium: problems.filter(p => p.difficulty === 'medium').length,
          hard: problems.filter(p => p.difficulty === 'hard').length,
        },
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = CreateProblemSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const problem = await prisma.dsaProblem.upsert({
      where: {
        title_platform: {
          title: parsed.data.title,
          platform: parsed.data.platform,
        },
      },
      update: {
        topic: parsed.data.topic,
        difficulty: parsed.data.difficulty,
        notes: parsed.data.notes,
        url: parsed.data.url || undefined,
      },
      create: {
        title: parsed.data.title,
        platform: parsed.data.platform,
        topic: parsed.data.topic,
        difficulty: parsed.data.difficulty,
        notes: parsed.data.notes,
        url: parsed.data.url || undefined,
      },
    })

    // Record attempt
    await prisma.dsaAttempt.create({
      data: {
        problemId: problem.id,
        status: parsed.data.status,
        approach: parsed.data.approach,
        complexity: parsed.data.complexity,
        solvedIndependently: parsed.data.solvedIndependently,
        needsReview: parsed.data.status !== 'solved',
      },
    })

    return NextResponse.json(problem, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
