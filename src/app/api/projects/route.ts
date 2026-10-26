import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const CreateProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  repoUrl: z.string().url().optional().or(z.literal('')),
  liveUrl: z.string().url().optional().or(z.literal('')),
  techStack: z.array(z.string()).default([]),
  problemSolved: z.string().optional(),
  architecture: z.string().optional(),
  features: z.array(z.string()).default([]),
  challenges: z.array(z.string()).default([]),
  outcomes: z.string().optional(),
  status: z.enum(['active', 'completed', 'paused', 'archived']).default('active'),
  notes: z.string().optional(),
})

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const transformed = projects.map((p) => ({
      ...p,
      techStack: p.techStack ? JSON.parse(p.techStack) : [],
      features: p.features ? JSON.parse(p.features) : [],
      challenges: p.challenges ? JSON.parse(p.challenges) : [],
    }))

    return NextResponse.json({ projects: transformed })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = CreateProjectSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid project data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        repoUrl: parsed.data.repoUrl || undefined,
        liveUrl: parsed.data.liveUrl || undefined,
        techStack: JSON.stringify(parsed.data.techStack),
        problemSolved: parsed.data.problemSolved,
        architecture: parsed.data.architecture,
        features: JSON.stringify(parsed.data.features),
        challenges: JSON.stringify(parsed.data.challenges),
        outcomes: parsed.data.outcomes,
        status: parsed.data.status,
        notes: parsed.data.notes,
      },
    })

    return NextResponse.json(
      {
        ...project,
        techStack: JSON.parse(project.techStack ?? '[]'),
        features: JSON.parse(project.features ?? '[]'),
        challenges: JSON.parse(project.challenges ?? '[]'),
      },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
