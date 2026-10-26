/**
 * API Route: GET /api/dashboard
 * 
 * Aggregated dashboard data.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
    const startOfWeek = new Date(startOfDay.getTime() - startOfDay.getDay() * 24 * 60 * 60 * 1000)

    // Today's tasks
    const todayTasks = await prisma.task.findMany({
      where: {
        OR: [
          { dueDate: { gte: startOfDay, lt: endOfDay } },
          { dueDate: { lt: startOfDay }, status: { in: ['todo', 'in_progress'] } },
        ],
      },
      orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
      take: 10,
    })

    // Overdue count
    const overdueCount = await prisma.task.count({
      where: {
        dueDate: { lt: startOfDay },
        status: { in: ['todo', 'in_progress'] },
      },
    })

    // Recent job matches (top matches from last discovery)
    const recentMatches = await prisma.job.findMany({
      where: {
        isActive: true,
        savedJobs: { none: { status: 'dismissed' } },
      },
      include: {
        matches: true,
        savedJobs: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Application pipeline summary
    const applicationsByStage = await prisma.application.groupBy({
      by: ['stage'],
      _count: true,
    })

    // Applications needing follow-up
    const followUps = await prisma.application.findMany({
      where: {
        nextFollowUp: { lte: endOfDay },
        stage: { notIn: ['rejected', 'withdrawn', 'offer'] },
      },
      select: { id: true, company: true, role: true, nextFollowUp: true, stage: true },
      take: 5,
    })

    // Weekly completion stats
    const completedThisWeek = await prisma.task.count({
      where: {
        completedAt: { gte: startOfWeek },
        status: 'done',
      },
    })

    const totalTasksThisWeek = await prisma.task.count({
      where: {
        OR: [
          { dueDate: { gte: startOfWeek, lt: endOfDay } },
          { completedAt: { gte: startOfWeek } },
        ],
      },
    })

    // Last integration run
    const lastRun = await prisma.integrationRun.findFirst({
      orderBy: { startedAt: 'desc' },
      select: {
        type: true,
        status: true,
        startedAt: true,
        totalCreated: true,
        errorSummary: true,
        source: { select: { name: true } },
      },
    })

    // Total counts
    const totalJobs = await prisma.job.count({ where: { isActive: true } })
    const totalApplications = await prisma.application.count()
    const bookmarkedJobs = await prisma.savedJob.count({ where: { status: 'bookmarked' } })

    return NextResponse.json({
      todayTasks: todayTasks.map(t => ({
        ...t,
        priorityOrder: { urgent: 0, high: 1, medium: 2, low: 3 }[t.priority] ?? 2,
      })).sort((a, b) => a.priorityOrder - b.priorityOrder),
      overdueCount,
      recentMatches: recentMatches.map(j => ({
        id: j.id,
        title: j.title,
        company: j.company,
        location: j.location,
        matchScore: j.matches[0]?.overallScore ?? 0,
        recommendation: j.matches[0]?.recommendation ?? 'unknown',
        savedStatus: j.savedJobs[0]?.status ?? null,
      })),
      applicationPipeline: applicationsByStage.reduce(
        (acc, item) => ({ ...acc, [item.stage]: item._count }),
        {} as Record<string, number>
      ),
      followUps,
      weeklyStats: {
        completed: completedThisWeek,
        total: totalTasksThisWeek,
        rate: totalTasksThisWeek > 0 ? Math.round((completedThisWeek / totalTasksThisWeek) * 100) : 0,
      },
      lastIntegrationRun: lastRun,
      totals: {
        jobs: totalJobs,
        applications: totalApplications,
        bookmarked: bookmarkedJobs,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
