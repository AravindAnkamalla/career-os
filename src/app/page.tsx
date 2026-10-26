'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Briefcase, 
  ArrowRight, 
  Sparkles,
  TrendingUp,
  ExternalLink,
  Plus
} from 'lucide-react'

interface DashboardData {
  todayTasks: Array<{
    id: string
    title: string
    priority: string
    status: string
    category: string
    dueDate?: string
  }>
  overdueCount: number
  recentMatches: Array<{
    id: string
    title: string
    company: string
    location?: string
    matchScore: number
    recommendation: string
    savedStatus?: string | null
  }>
  applicationPipeline: Record<string, number>
  followUps: Array<{
    id: string
    company: string
    role: string
    nextFollowUp: string
    stage: string
  }>
  weeklyStats: {
    completed: number
    total: number
    rate: number
  }
  lastIntegrationRun?: {
    type: string
    status: string
    startedAt: string
    totalCreated: number
    source?: { name: string }
  }
  totals: {
    jobs: number
    applications: number
    bookmarked: number
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/dashboard')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done'
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchDashboard()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const stages = [
    { key: 'discovered', label: 'Discovered', color: 'bg-zinc-100 text-zinc-800' },
    { key: 'shortlisted', label: 'Shortlisted', color: 'bg-blue-100 text-blue-800' },
    { key: 'applied', label: 'Applied', color: 'bg-indigo-100 text-indigo-800' },
    { key: 'recruiter_screen', label: 'Screening', color: 'bg-purple-100 text-purple-800' },
    { key: 'technical_interview', label: 'Interview', color: 'bg-amber-100 text-amber-800' },
    { key: 'offer', label: 'Offer', color: 'bg-emerald-100 text-emerald-800' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Today&apos;s Focus & Action Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Clear next steps, matching opportunities, and application follow-ups.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Discover Jobs</span>
          </Link>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-md border border-border bg-card hover:bg-muted transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Task</span>
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Pipeline Applications</span>
            <Briefcase className="h-4 w-4" />
          </div>
          <div className="text-2xl font-bold">{data?.totals.applications ?? 0}</div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Across {Object.keys(data?.applicationPipeline ?? {}).length} active stages
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Today&apos;s Tasks</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="text-2xl font-bold">
            {data?.todayTasks.filter(t => t.status !== 'done').length ?? 0}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {data?.overdueCount ? (
              <span className="text-destructive font-medium">{data.overdueCount} overdue</span>
            ) : (
              'No overdue tasks'
            )}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">High Match Opportunities</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold">
            {data?.recentMatches.filter(m => m.matchScore >= 70).length ?? 0}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {data?.totals.jobs ?? 0} active listings discovered
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Weekly Action Rate</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold">{data?.weeklyStats.rate ?? 0}%</div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {data?.weeklyStats.completed ?? 0} of {data?.weeklyStats.total ?? 0} tasks done this week
          </p>
        </div>
      </div>

      {/* Main Grid: Tasks & Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Prioritized Tasks + Follow-ups */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">Today&apos;s Action Items</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium text-muted-foreground">
                  {data?.todayTasks.filter(t => t.status !== 'done').length ?? 0} pending
                </span>
              </div>
              <Link href="/tasks" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {(!data?.todayTasks || data.todayTasks.length === 0) ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                No tasks scheduled for today. Create a task to plan your day.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {data.todayTasks.map((task) => (
                  <div key={task.id} className="py-2.5 flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleTaskStatus(task.id, task.status)}
                        className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                          task.status === 'done'
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-muted-foreground/40 hover:border-primary'
                        }`}
                      >
                        {task.status === 'done' && <CheckCircle2 className="h-3 w-3" />}
                      </button>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        <span className="text-[11px] text-muted-foreground capitalize">
                          {task.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                      task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                      task.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Follow-up Alerts */}
          {data?.followUps && data.followUps.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <h2 className="text-sm font-semibold text-amber-900">Follow-up Reminders Due</h2>
              </div>
              <div className="space-y-2">
                {data.followUps.map((item) => (
                  <div key={item.id} className="bg-card p-3 rounded-lg border border-amber-200/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold">{item.company}</span> — {item.role}
                      <p className="text-[11px] text-muted-foreground">Due: {new Date(item.nextFollowUp).toLocaleDateString()}</p>
                    </div>
                    <Link
                      href={`/applications`}
                      className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                    >
                      Update <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Application Pipeline Overview */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Application Pipeline</h2>
              <Link href="/applications" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                Open Kanban <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center">
              {stages.map((st) => {
                const count = data?.applicationPipeline[st.key] ?? 0
                return (
                  <div key={st.key} className="p-3 rounded-lg border border-border bg-muted/40">
                    <span className="text-[11px] font-medium text-muted-foreground block truncate">
                      {st.label}
                    </span>
                    <span className="text-xl font-bold mt-1 block">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Top Job Matches & Feed Status */}
        <div className="space-y-6">
          {/* Recent Matches */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Top Job Matches</h2>
              <Link href="/jobs" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                Explore <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {(!data?.recentMatches || data.recentMatches.length === 0) ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No jobs discovered yet.
                <div className="mt-3">
                  <Link
                    href="/jobs"
                    className="inline-flex text-xs font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground"
                  >
                    Run Discovery
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentMatches.map((job) => (
                  <div key={job.id} className="p-3 rounded-lg border border-border hover:border-primary/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link href="/jobs" className="font-semibold text-sm hover:underline truncate block">
                          {job.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">{job.company}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${
                        job.matchScore >= 75 ? 'bg-emerald-100 text-emerald-800' :
                        job.matchScore >= 55 ? 'bg-blue-100 text-blue-800' :
                        'bg-zinc-100 text-zinc-800'
                      }`}>
                        {job.matchScore}%
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="truncate max-w-[150px]">{job.location || 'Remote'}</span>
                      <Link href="/jobs" className="text-primary hover:underline font-medium">
                        View Match →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sync & Operational Status */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs text-xs space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Integration Status</h3>
            <div className="flex items-center justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Source Provider</span>
              <span className="font-medium">{data?.lastIntegrationRun?.source?.name ?? 'Fixture (Local)'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Last Run Status</span>
              <span className="capitalize font-medium text-emerald-600">
                {data?.lastIntegrationRun?.status ?? 'Ready'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-muted-foreground">Last Discovered</span>
              <span className="font-medium">
                {data?.lastIntegrationRun?.startedAt
                  ? new Date(data.lastIntegrationRun.startedAt).toLocaleTimeString()
                  : 'Ready to run'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
