import { NextRequest, NextResponse } from 'next/server'
import { initializeProviders } from '@/lib/integrations'
import { runJobDiscovery } from '@/lib/services/job-discovery'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Verify Vercel Cron Secret if configured
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const authHeader = request.headers.get('authorization')
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized cron invocation' }, { status: 401 })
      }
    }

    initializeProviders()

    // Fetch user preferences for default search query
    const prefs = await prisma.careerPreference.findFirst()
    const targetRoles: string[] = prefs ? JSON.parse(prefs.targetRoles) : ['Backend Engineer']
    const query = targetRoles[0] || 'Backend Engineer'

    const result = await runJobDiscovery({
      query,
      triggeredBy: 'scheduled',
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      runSummary: result.runSummary,
      newJobsCount: result.newJobs.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cron execution failed'
    console.error('Scheduled job discovery error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
