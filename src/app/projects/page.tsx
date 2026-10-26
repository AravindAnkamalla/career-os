'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  FolderGit2, 
  Plus, 
  ExternalLink, 
  Github, 
  Trash2,
  Edit3,
  CheckSquare
} from 'lucide-react'

interface ProjectItem {
  id: string
  name: string
  description?: string
  repoUrl?: string
  liveUrl?: string
  techStack: string[]
  problemSolved?: string
  architecture?: string
  features: string[]
  challenges: string[]
  outcomes?: string
  status: 'active' | 'completed' | 'paused' | 'archived'
  notes?: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [liveUrl, setLiveUrl] = useState('')
  const [techStackStr, setTechStackStr] = useState('')
  const [problemSolved, setProblemSolved] = useState('')
  const [architecture, setArchitecture] = useState('')
  const [featuresStr, setFeaturesStr] = useState('')
  const [challengesStr, setChallengesStr] = useState('')
  const [status, setStatus] = useState<'active' | 'completed' | 'paused' | 'archived'>('active')

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data.projects)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const openNewModal = () => {
    setEditingProject(null)
    setName('')
    setDescription('')
    setRepoUrl('')
    setLiveUrl('')
    setTechStackStr('')
    setProblemSolved('')
    setArchitecture('')
    setFeaturesStr('')
    setChallengesStr('')
    setStatus('active')
    setIsModalOpen(true)
  }

  const openEditModal = (proj: ProjectItem) => {
    setEditingProject(proj)
    setName(proj.name)
    setDescription(proj.description || '')
    setRepoUrl(proj.repoUrl || '')
    setLiveUrl(proj.liveUrl || '')
    setTechStackStr(proj.techStack.join(', '))
    setProblemSolved(proj.problemSolved || '')
    setArchitecture(proj.architecture || '')
    setFeaturesStr(proj.features.join('\n'))
    setChallengesStr(proj.challenges.join('\n'))
    setStatus(proj.status)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    const payload = {
      name,
      description,
      repoUrl: repoUrl || undefined,
      liveUrl: liveUrl || undefined,
      techStack: techStackStr.split(',').map(s => s.trim()).filter(Boolean),
      problemSolved,
      architecture,
      features: featuresStr.split('\n').map(s => s.trim()).filter(Boolean),
      challenges: challengesStr.split('\n').map(s => s.trim()).filter(Boolean),
      status,
    }

    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects'
      const method = editingProject ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setIsModalOpen(false)
        fetchProjects()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (res.ok) fetchProjects()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateTask = async (proj: ProjectItem) => {
    const taskTitle = prompt(`Enter preparation task for ${proj.name}:`, `Prepare architectural deep-dive explanation for ${proj.name}`)
    if (!taskTitle) return

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          category: 'project',
          priority: 'high',
          relatedProjectId: proj.id,
        }),
      })

      if (res.ok) {
        alert('Task added! View and manage it on the Daily Planner.')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = projects.filter(p => {
    if (statusFilter === 'all') return true
    return p.status === statusFilter
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Portfolio & System Architecture</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track your real-world engineering projects, architecture decisions, and interview explanations.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto bg-card p-3 rounded-xl border border-border">
        {['all', 'active', 'completed', 'paused'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`text-xs px-3 py-1.5 rounded-md font-medium capitalize transition-colors ${
              statusFilter === st ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {st} ({st === 'all' ? projects.length : projects.filter(p => p.status === st).length})
          </button>
        ))}
      </div>

      {/* Project Cards */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <FolderGit2 className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-3" />
          <h3 className="text-sm font-semibold">No projects found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Click &quot;Add Project&quot; or click &quot;Seed Profile&quot; in the header to load your projects.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((proj) => (
            <div
              key={proj.id}
              className="bg-card rounded-xl border border-border p-5 flex flex-col justify-between shadow-xs hover:border-primary/40 transition-colors"
            >
              <div className="space-y-3.5">
                {/* Title & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-foreground">{proj.name}</h3>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded mt-1 inline-block ${
                      proj.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                      proj.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-zinc-100 text-zinc-800'
                    }`}>
                      {proj.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {proj.repoUrl && (
                      <a
                        href={proj.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                        title="Repository"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                        title="Live Demo"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Description */}
                {proj.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {proj.description}
                  </p>
                )}

                {/* Problem Solved */}
                {proj.problemSolved && (
                  <div className="text-xs p-2.5 rounded-lg bg-muted/40 border border-border/60">
                    <span className="font-semibold text-foreground block mb-0.5 text-[11px]">
                      Problem Solved:
                    </span>
                    <p className="text-muted-foreground text-[11px]">{proj.problemSolved}</p>
                  </div>
                )}

                {/* Architecture Notes */}
                {proj.architecture && (
                  <div className="text-xs p-2.5 rounded-lg bg-muted/40 border border-border/60">
                    <span className="font-semibold text-foreground block mb-0.5 text-[11px]">
                      Architecture:
                    </span>
                    <p className="text-muted-foreground text-[11px]">{proj.architecture}</p>
                  </div>
                )}

                {/* Tech Stack Tags */}
                {proj.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {proj.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-secondary text-secondary-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Key Technical Challenges */}
                {proj.challenges.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-border">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Engineering Challenges:
                    </span>
                    <ul className="text-[11px] text-muted-foreground space-y-0.5 list-disc list-inside">
                      {proj.challenges.slice(0, 2).map((ch, idx) => (
                        <li key={idx} className="line-clamp-1">{ch}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs">
                <button
                  onClick={() => handleCreateTask(proj)}
                  className="inline-flex items-center gap-1 text-primary hover:underline font-medium text-[11px]"
                >
                  <CheckSquare className="h-3 w-3" />
                  <span>Prep Task</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(proj)}
                    className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                    title="Edit project"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id)}
                    className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-card rounded-xl border border-border max-w-lg w-full p-6 space-y-4 shadow-xl my-8">
            <h3 className="font-bold text-base">
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs max-h-[80vh] overflow-y-auto pr-1">
              <div>
                <label className="font-medium text-foreground block mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Distributed Task Scheduler"
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of the application..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-foreground block mb-1">GitHub Repo URL</label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-medium text-foreground block mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  value={techStackStr}
                  onChange={(e) => setTechStackStr(e.target.value)}
                  placeholder="Node.js, TypeScript, PostgreSQL, Docker"
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Problem Solved</label>
                <textarea
                  value={problemSolved}
                  onChange={(e) => setProblemSolved(e.target.value)}
                  placeholder="What user or business friction does this solve?"
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Architecture Notes</label>
                <textarea
                  value={architecture}
                  onChange={(e) => setArchitecture(e.target.value)}
                  placeholder="Architecture overview, data flow, queue design..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Engineering Challenges (one per line)</label>
                <textarea
                  value={challengesStr}
                  onChange={(e) => setChallengesStr(e.target.value)}
                  placeholder="Concurrency race conditions&#10;Query optimization on millions of records"
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-md border border-border hover:bg-muted font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
