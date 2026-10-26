/**
 * API Route: PUT /api/profile/preferences
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const UpdatePreferencesSchema = z.object({
  targetRoles: z.array(z.string()).optional(),
  preferredLocations: z.array(z.string()).optional(),
  remotePreference: z.string().optional(),
  minExperience: z.number().int().optional(),
  maxExperience: z.number().int().optional(),
  preferredStack: z.array(z.string()).optional(),
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  salaryCurrency: z.string().optional(),
  willingToRelocate: z.boolean().optional(),
  notes: z.string().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = UpdatePreferencesSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data: Record<string, unknown> = {}
    if (parsed.data.targetRoles) data.targetRoles = JSON.stringify(parsed.data.targetRoles)
    if (parsed.data.preferredLocations) data.preferredLocations = JSON.stringify(parsed.data.preferredLocations)
    if (parsed.data.preferredStack) data.preferredStack = JSON.stringify(parsed.data.preferredStack)
    if (parsed.data.remotePreference) data.remotePreference = parsed.data.remotePreference
    if (parsed.data.minExperience !== undefined) data.minExperience = parsed.data.minExperience
    if (parsed.data.maxExperience !== undefined) data.maxExperience = parsed.data.maxExperience
    if (parsed.data.minSalary !== undefined) data.minSalary = parsed.data.minSalary
    if (parsed.data.maxSalary !== undefined) data.maxSalary = parsed.data.maxSalary
    if (parsed.data.salaryCurrency) data.salaryCurrency = parsed.data.salaryCurrency
    if (parsed.data.willingToRelocate !== undefined) data.willingToRelocate = parsed.data.willingToRelocate
    if (parsed.data.notes !== undefined) data.notes = parsed.data.notes

    const existing = await prisma.careerPreference.findFirst()

    let preferences
    if (existing) {
      preferences = await prisma.careerPreference.update({
        where: { id: existing.id },
        data,
      })
    } else {
      preferences = await prisma.careerPreference.create({
        data: {
          targetRoles: JSON.stringify(parsed.data.targetRoles ?? []),
          preferredLocations: JSON.stringify(parsed.data.preferredLocations ?? []),
          preferredStack: JSON.stringify(parsed.data.preferredStack ?? []),
          ...data,
        },
      })
    }

    return NextResponse.json({
      ...preferences,
      targetRoles: JSON.parse(preferences.targetRoles),
      preferredLocations: JSON.parse(preferences.preferredLocations),
      preferredStack: JSON.parse(preferences.preferredStack),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
