'use client'

import { useState, useEffect, useCallback } from 'react'
import { Award } from 'lucide-react'

interface AnalyticsData {
  summary: {
    totalJobs: number
    totalApplications: number
    totalTasks: number
    completedTasks: number
    completionRate: number
    totalDsa: number
    totalProjects: number
  }
  applicationsByStage: Array<{ stage: string; count: number }>
  tasksByCategory: Array<{ category: string; count: number }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/analytics')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight">Performance Analytics & Weekly Review</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Objective operational metrics and realistic weekly retrospectives to keep momentum high.
        </p>
      </div>

      {/* High-Level KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border">
          <span className="text-[11px] text-muted-foreground block font-medium">Jobs Discovered</span>
          <span className="text-2xl font-bold mt-1 block">{data?.summary.totalJobs ?? 0}</span>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <span className="text-[11px] text-muted-foreground block font-medium">In Pipeline</span>
          <span className="text-2xl font-bold mt-1 block text-blue-600">{data?.summary.totalApplications ?? 0}</span>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <span className="text-[11px] text-muted-foreground block font-medium">Execution Rate</span>
          <span className="text-2xl font-bold mt-1 block text-emerald-600">{data?.summary.completionRate ?? 0}%</span>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <span className="text-[11px] text-muted-foreground block font-medium">Tasks Completed</span>
          <span className="text-2xl font-bold mt-1 block">{data?.summary.completedTasks ?? 0}</span>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <span className="text-[11px] text-muted-foreground block font-medium">DSA Problems</span>
          <span className="text-2xl font-bold mt-1 block text-amber-600">{data?.summary.totalDsa ?? 0}</span>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <span className="text-[11px] text-muted-foreground block font-medium">Projects Tracked</span>
          <span className="text-2xl font-bold mt-1 block text-purple-600">{data?.summary.totalProjects ?? 0}</span>
        </div>
      </div>

      {/* Weekly Review Retrospective Card */}
      <div className="bg-card p-6 rounded-xl border border-border space-y-4 shadow-xs">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          Weekly Retrospective & Action Focus
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
            <span className="font-bold text-emerald-900 block mb-1">What Moved Forward This Week</span>
            <ul className="text-emerald-800 space-y-1 list-disc list-inside">
              <li>Configured CareerOS with verified skill matrix</li>
              <li>Scored job opportunities using multi-factor matching</li>
              <li>Shortlisted target backend & FDE applications</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200">
            <span className="font-bold text-amber-900 block mb-1">What Stalled or Needs Attention</span>
            <ul className="text-amber-800 space-y-1 list-disc list-inside">
              <li>DSA recursion and graph cycle problems in Java</li>
              <li>Preparing concise STAR answers for behavioral screens</li>
              <li>Follow-up dates on pending recruiter communications</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200">
            <span className="font-bold text-blue-900 block mb-1">Top 3 Priorities for Next Week</span>
            <ol className="text-blue-800 space-y-1 list-decimal list-inside">
              <li>Submit applications to 3 high-match roles (≥75%)</li>
              <li>Complete 5 Java sliding window & tree problems</li>
              <li>Document architecture challenge on Event Management System</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
