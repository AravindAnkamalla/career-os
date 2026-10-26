import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const UpdateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  repoUrl: z.string().url().optional().or(z.literal('')),
  liveUrl: z.string().url().optional().or(z.literal('')),
  techStack: z.array(z.string()).optional(),
  problemSolved: z.string().optional(),
  architecture: z.string().optional(),
  features: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  outcomes: z.string().optional(),
  status: z.enum(['active', 'completed', 'paused', 'archived']).optional(),
  notes: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = UpdateProjectSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid update data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data: Record<string, unknown> = {}
    if (parsed.data.name !== undefined) data.name = parsed.data.name
    if (parsed.data.description !== undefined) data.description = parsed.data.description
    if (parsed.data.repoUrl !== undefined) data.repoUrl = parsed.data.repoUrl || null
    if (parsed.data.liveUrl !== undefined) data.liveUrl = parsed.data.liveUrl || null
    if (parsed.data.techStack !== undefined) data.techStack = JSON.stringify(parsed.data.techStack)
    if (parsed.data.problemSolved !== undefined) data.problemSolved = parsed.data.problemSolved
    if (parsed.data.architecture !== undefined) data.architecture = parsed.data.architecture
    if (parsed.data.features !== undefined) data.features = JSON.stringify(parsed.data.features)
    if (parsed.data.challenges !== undefined) data.challenges = JSON.stringify(parsed.data.challenges)
    if (parsed.data.outcomes !== undefined) data.outcomes = parsed.data.outcomes
    if (parsed.data.status !== undefined) data.status = parsed.data.status
    if (parsed.data.notes !== undefined) data.notes = parsed.data.notes

    const updated = await prisma.project.update({
      where: { id },
      data,
    })

    return NextResponse.json({
      ...updated,
      techStack: updated.techStack ? JSON.parse(updated.techStack) : [],
      features: updated.features ? JSON.parse(updated.features) : [],
      challenges: updated.challenges ? JSON.parse(updated.challenges) : [],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
