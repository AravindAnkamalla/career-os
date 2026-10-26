'use client'

import { useState, useEffect } from 'react'
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  Briefcase
} from 'lucide-react'

interface TaskItem {
  id: string
  title: string
  description?: string
  category: string
  priority: string
  status: string
  dueDate?: string
  application?: {
    id: string
    company: string
    role: string
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'today' | 'upcoming' | 'overdue' | 'all'>('today')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)

  // New Task form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('career_admin')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (view !== 'all') params.set('view', view)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)

      const res = await fetch(`/api/tasks?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [view, categoryFilter])

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done'
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchTasks()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      fetchTasks()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          priority,
          dueDate: dueDate || undefined,
        }),
      })

      if (res.ok) {
        setIsNewModalOpen(false)
        setTitle('')
        setDescription('')
        setDueDate('')
        fetchTasks()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const categories = [
    { key: 'all', label: 'All Categories' },
    { key: 'job_search', label: 'Job Search' },
    { key: 'backend', label: 'Backend' },
    { key: 'system_design', label: 'System Design' },
    { key: 'dsa', label: 'DSA' },
    { key: 'interview_prep', label: 'Interview' },
    { key: 'career_admin', label: 'Admin' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Execution & Task Planner</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Turn your career goals, job preparation, and upskilling roadmap into concrete daily actions.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setView('today')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
              view === 'today' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setView('upcoming')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
              view === 'upcoming' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Upcoming (7 Days)
          </button>
          <button
            onClick={() => setView('overdue')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
              view === 'overdue' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Overdue
          </button>
          <button
            onClick={() => setView('all')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
              view === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            All Tasks
          </button>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs bg-background border border-border rounded-md px-2.5 py-1.5 text-foreground focus:outline-hidden"
        >
          {categories.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <CheckSquare className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-3" />
          <h3 className="text-sm font-semibold">No tasks found for this view</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            You&apos;re all caught up! Add a new task to plan your day.
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border divide-y divide-border shadow-xs">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <button
                  onClick={() => toggleStatus(task.id, task.status)}
                  className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                    task.status === 'done'
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-muted-foreground/40 hover:border-primary'
                  }`}
                >
                  {task.status === 'done' && <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>

                <div className="min-w-0">
                  <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5 flex-wrap">
                    <span className="capitalize px-1.5 py-0.5 rounded bg-muted">
                      {task.category.replace('_', ' ')}
                    </span>
                    {task.application && (
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Briefcase className="h-3 w-3" />
                        {task.application.company}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                  task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                  task.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {task.priority}
                </span>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 transition-opacity"
                  title="Delete task"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Task Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl border border-border max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-foreground block mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement rate limiting on API endpoints"
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                >
                  <option value="job_search">Job Search</option>
                  <option value="backend">Backend Engineering</option>
                  <option value="system_design">System Design</option>
                  <option value="dsa">DSA Practice</option>
                  <option value="interview_prep">Interview Preparation</option>
                  <option value="career_admin">Career Administration</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
