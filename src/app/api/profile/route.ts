/**
 * API Route: GET /api/profile, PUT /api/profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const UpdateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  resumeUrl: z.string().url().optional().or(z.literal('')),
})

export async function GET() {
  try {
    const profile = await prisma.userProfile.findFirst()
    const preferences = await prisma.careerPreference.findFirst()
    const skills = await prisma.skill.findMany({
      include: { evidence: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json({
      profile,
      preferences: preferences ? {
        ...preferences,
        targetRoles: JSON.parse(preferences.targetRoles),
        preferredLocations: JSON.parse(preferences.preferredLocations),
        preferredStack: JSON.parse(preferences.preferredStack),
      } : null,
      skills,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = UpdateProfileSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.userProfile.findFirst()

    let profile
    if (existing) {
      profile = await prisma.userProfile.update({
        where: { id: existing.id },
        data: parsed.data,
      })
    } else {
      profile = await prisma.userProfile.create({
        data: {
          name: parsed.data.name ?? 'User',
          ...parsed.data,
        },
      })
    }

    return NextResponse.json(profile)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
