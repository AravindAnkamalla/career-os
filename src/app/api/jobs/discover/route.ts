/**
 * API Route: POST /api/jobs/discover
 * 
 * Triggers job discovery from the configured provider.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { initializeProviders } from '@/lib/integrations'
import { runJobDiscovery } from '@/lib/services/job-discovery'

const DiscoverRequestSchema = z.object({
  query: z.string().min(1).default('software engineer'),
  location: z.string().optional(),
  remoteOnly: z.boolean().optional(),
  datePosted: z.string().optional(),
  providerName: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    initializeProviders()

    const body = await request.json().catch(() => ({}))
    const parsed = DiscoverRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await runJobDiscovery({
      ...parsed.data,
      triggeredBy: 'manual',
    })

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Job discovery error:', message)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
