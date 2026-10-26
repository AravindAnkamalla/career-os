import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const totalJobs = await prisma.job.count()
    const totalApplications = await prisma.application.count()
    const totalTasks = await prisma.task.count()
    const completedTasks = await prisma.task.count({ where: { status: 'done' } })
    const totalDsa = await prisma.dsaProblem.count()
    const totalProjects = await prisma.project.count()

    const applicationsByStage = await prisma.application.groupBy({
      by: ['stage'],
      _count: true,
    })

    const tasksByCategory = await prisma.task.groupBy({
      by: ['category'],
      _count: true,
    })

    return NextResponse.json({
      summary: {
        totalJobs,
        totalApplications,
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalDsa,
        totalProjects,
      },
      applicationsByStage: applicationsByStage.map(a => ({ stage: a.stage, count: a._count })),
      tasksByCategory: tasksByCategory.map(t => ({ category: t.category, count: t._count })),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
