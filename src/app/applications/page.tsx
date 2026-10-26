'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  CheckSquare, 
  ExternalLink
} from 'lucide-react'

interface ApplicationItem {
  id: string
  company: string
  role: string
  postingUrl?: string
  stage: string
  applicationDate?: string
  nextFollowUp?: string
  notes?: string
  job?: {
    title: string
    company: string
    location?: string
  }
  _count?: {
    tasks: number
  }
}

const STAGES = [
  { id: 'shortlisted', label: 'Shortlisted', color: 'border-blue-500/40 bg-blue-50/20' },
  { id: 'preparing', label: 'Preparing', color: 'border-amber-500/40 bg-amber-50/20' },
  { id: 'applied', label: 'Applied', color: 'border-indigo-500/40 bg-indigo-50/20' },
  { id: 'recruiter_screen', label: 'Screening', color: 'border-purple-500/40 bg-purple-50/20' },
  { id: 'technical_interview', label: 'Technical Interview', color: 'border-pink-500/40 bg-pink-50/20' },
  { id: 'offer', label: 'Offer', color: 'border-emerald-500/40 bg-emerald-50/20' },
]

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [selectedAppForTask, setSelectedAppForTask] = useState<ApplicationItem | null>(null)

  // New Application Form
  const [newCompany, setNewCompany] = useState('')
  const [newRole, setNewRole] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newStage, setNewStage] = useState('shortlisted')
  const [newNotes, setNewNotes] = useState('')

  // New Task Form
  const [taskTitle, setTaskTitle] = useState('')
  const [taskPriority, setTaskPriority] = useState('high')
  const [taskCategory, setTaskCategory] = useState('interview_prep')

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/applications')
      if (res.ok) {
        const data = await res.json()
        setApplications(data.applications)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const handleUpdateStage = async (id: string, newStage: string) => {
    try {
      await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      fetchApplications()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCompany || !newRole) return

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: newCompany,
          role: newRole,
          postingUrl: newUrl,
          stage: newStage,
          notes: newNotes,
        }),
      })

      if (res.ok) {
        setIsNewModalOpen(false)
        setNewCompany('')
        setNewRole('')
        setNewUrl('')
        setNewNotes('')
        fetchApplications()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAppForTask || !taskTitle) return

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          category: taskCategory,
          priority: taskPriority,
          applicationId: selectedAppForTask.id,
        }),
      })

      if (res.ok) {
        setSelectedAppForTask(null)
        setTaskTitle('')
        fetchApplications()
        alert('Task added! You can view and manage it on the Daily Planner.')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = applications.filter(a =>
    a.company.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Application Pipeline & Tracking</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your recruitment stages, follow-up deadlines, and preparation milestones.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Application</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by company or role..."
          className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-border bg-card focus:outline-hidden focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[350px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
        {STAGES.map((stage) => {
          const stageApps = filtered.filter(a => a.stage === stage.id)

          return (
            <div
              key={stage.id}
              className={`rounded-xl border p-3 flex flex-col min-h-[450px] ${stage.color}`}
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-semibold text-xs text-foreground">{stage.label}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-card border border-border text-foreground">
                  {stageApps.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-2.5 flex-1">
                {stageApps.length === 0 ? (
                  <div className="h-24 border border-dashed border-border/80 rounded-lg flex items-center justify-center text-[11px] text-muted-foreground/60">
                    Empty
                  </div>
                ) : (
                  stageApps.map((app) => (
                    <div
                      key={app.id}
                      className="bg-card rounded-lg border border-border p-3 shadow-xs space-y-2.5"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-xs text-foreground hover:text-primary transition-colors">
                            {app.company}
                          </h4>
                          {app.postingUrl && (
                            <a
                              href={app.postingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground shrink-0"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{app.role}</p>
                      </div>

                      {app.notes && (
                        <p className="text-[10px] text-muted-foreground/80 line-clamp-2 bg-muted/30 p-1.5 rounded">
                          {app.notes}
                        </p>
                      )}

                      {/* Move Stage Selector */}
                      <div className="pt-2 border-t border-border flex items-center justify-between gap-1 text-[11px]">
                        <select
                          value={app.stage}
                          onChange={(e) => handleUpdateStage(app.id, e.target.value)}
                          className="text-[10px] bg-muted/60 border border-border rounded px-1.5 py-1 text-foreground focus:outline-hidden max-w-[100px]"
                        >
                          {STAGES.map(s => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>

                        <button
                          onClick={() => {
                            setSelectedAppForTask(app)
                            setTaskTitle(`Follow up with ${app.company}`)
                          }}
                          className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline font-medium"
                          title="Add preparation or follow-up task"
                        >
                          <CheckSquare className="h-2.5 w-2.5" />
                          <span>Task</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
      )}

      {/* New Application Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl border border-border max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base">Add New Application</h3>
            <form onSubmit={handleCreateApplication} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-foreground block mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="e.g. Backend Engineer"
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Job Posting / Application URL</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Initial Stage</label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                >
                  {STAGES.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Notes</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Referral contact, recruiter info, tech stack notes..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3 py-1.5 rounded-md border border-border hover:bg-muted font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Task for Application Modal */}
      {selectedAppForTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl border border-border max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base">
              Add Task for {selectedAppForTask.company}
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-foreground block mb-1">Task Description *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Review system design questions"
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Category</label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                >
                  <option value="interview_prep">Interview Preparation</option>
                  <option value="job_search">Job Search / Follow-up</option>
                  <option value="system_design">System Design</option>
                  <option value="backend">Backend Engineering</option>
                  <option value="dsa">DSA Practice</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAppForTask(null)}
                  className="px-3 py-1.5 rounded-md border border-border hover:bg-muted font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
