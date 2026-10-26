/**
 * API Route: GET /api/status
 * 
 * System health and configuration status.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { initializeProviders, providerRegistry } from '@/lib/integrations'

export async function GET() {
  try {
    initializeProviders()

    // Check database
    let dbStatus = { ok: false, message: 'Not checked' }
    try {
      await prisma.$queryRaw`SELECT 1`
      const jobCount = await prisma.job.count()
      const appCount = await prisma.application.count()
      dbStatus = { ok: true, message: `Connected. ${jobCount} jobs, ${appCount} applications.` }
    } catch (error) {
      dbStatus = { ok: false, message: error instanceof Error ? error.message : 'Connection failed' }
    }

    // Check providers
    const providers = providerRegistry.getStatus()

    // Check profile
    const profile = await prisma.userProfile.findFirst()
    const profileStatus = profile ? { ok: true, message: `Profile: ${profile.name}` } : { ok: false, message: 'No profile configured. Run seed first.' }

    // Last integration run
    const lastRun = await prisma.integrationRun.findFirst({
      orderBy: { startedAt: 'desc' },
      select: {
        type: true,
        status: true,
        startedAt: true,
        completedAt: true,
        totalCreated: true,
        totalFailed: true,
        errorSummary: true,
      },
    })

    return NextResponse.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      profile: profileStatus,
      providers,
      lastIntegrationRun: lastRun,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasJSearchKey: !!process.env.JSEARCH_API_KEY,
        hasAdzunaKey: !!process.env.ADZUNA_APP_ID,
        hasResendKey: !!process.env.RESEND_API_KEY,
        hasAiKey: !!process.env.AI_PROVIDER_API_KEY,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: message,
    }, { status: 500 })
  }
}
