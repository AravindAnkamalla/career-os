'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  MessageSquare, 
  Plus, 
  Calendar, 
  BookOpen
} from 'lucide-react'

interface InterviewItem {
  id: string
  company: string
  role?: string
  type: string
  scheduledAt?: string
  status: string
  topicAreas: string[]
  practiceQs: string[]
  answerNotes?: string
  reflection?: string
  struggled?: string
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [type, setType] = useState('technical')
  const [scheduledAt, setScheduledAt] = useState('')
  const [topicAreasStr, setTopicAreasStr] = useState('')
  const [answerNotes, setAnswerNotes] = useState('')

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/interviews')
      if (res.ok) {
        const data = await res.json()
        setInterviews(data.interviews)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInterviews()
  }, [fetchInterviews])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company) return

    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          role,
          type,
          scheduledAt: scheduledAt || undefined,
          topicAreas: topicAreasStr.split(',').map(s => s.trim()).filter(Boolean),
          answerNotes,
        }),
      })

      if (res.ok) {
        setIsModalOpen(false)
        setCompany('')
        setRole('')
        setScheduledAt('')
        setTopicAreasStr('')
        setAnswerNotes('')
        fetchInterviews()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interview Preparation & Reflection</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Prepare tailored talking points, STAR behavioral stories, and conduct post-interview reflection.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Schedule / Log Interview</span>
        </button>
      </div>

      {/* Recruiter Talking Points Reference Guide */}
      <div className="p-4 rounded-xl border border-border bg-card space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          Quick Talking Points Framework (FDE & Backend Engineering)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
            <span className="font-bold block mb-1">1. Elevator Self-Intro</span>
            <p className="text-muted-foreground">
              &quot;Full-stack engineer with strong backend & database focus, specializing in Node.js, TypeScript, PostgreSQL, and third-party integrations with production debugging experience.&quot;
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
            <span className="font-bold block mb-1">2. FDE Problem Solving</span>
            <p className="text-muted-foreground">
              &quot;I treat customer integrations as mission-critical pipelines: investigate actual constraints, build minimal reliable prototypes, and observe failure modes in production.&quot;
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
            <span className="font-bold block mb-1">3. STAR Behavioral Formula</span>
            <p className="text-muted-foreground">
              <strong>Situation:</strong> Dealership sync failure. <strong>Task:</strong> Prevent inventory drift. <strong>Action:</strong> Implemented idempotent webhook processing. <strong>Result:</strong> Zero duplicate records.
            </p>
          </div>
        </div>
      </div>

      {/* Scheduled Interviews List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-3" />
          <h3 className="text-sm font-semibold">No interviews logged yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Log an upcoming recruiter screen or technical round to prepare role-specific talking points.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((item) => (
            <div key={item.id} className="bg-card p-5 rounded-xl border border-border space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base text-foreground">{item.company}</h3>
                  <p className="text-xs text-muted-foreground">{item.role || 'Software Engineer'}</p>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                  {item.type.replace('_', ' ')}
                </span>
              </div>

              {item.scheduledAt && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>Scheduled: {new Date(item.scheduledAt).toLocaleString()}</span>
                </div>
              )}

              {item.topicAreas.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.topicAreas.map((topic) => (
                    <span key={topic} className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              {item.answerNotes && (
                <div className="text-xs p-3 rounded-lg bg-muted/40 border border-border/60">
                  <span className="font-semibold text-foreground block mb-1 text-[11px]">Preparation Notes:</span>
                  <p className="text-muted-foreground text-[11px] whitespace-pre-wrap">{item.answerNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Log Interview Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl border border-border max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base">Schedule / Log Interview</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-foreground block mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Stripe, Razorpay, or Swiggy"
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Role Title</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Backend Engineer / FDE"
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-foreground block mb-1">Interview Round</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                  >
                    <option value="recruiter_screen">Recruiter Screen</option>
                    <option value="technical">Backend Technical</option>
                    <option value="system_design">System Design</option>
                    <option value="dsa">DSA (Java/Node)</option>
                    <option value="fde">FDE / Case Study</option>
                    <option value="behavioral">Behavioral (STAR)</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-foreground block mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Key Focus Topics (comma-separated)</label>
                <input
                  type="text"
                  value={topicAreasStr}
                  onChange={(e) => setTopicAreasStr(e.target.value)}
                  placeholder="PostgreSQL indexing, Event loops, Redis caching"
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Key Talking Points & Answer Drafts</label>
                <textarea
                  value={answerNotes}
                  onChange={(e) => setAnswerNotes(e.target.value)}
                  placeholder="Draft answers to 'Tell me about yourself' and 'Tell me about an integration challenge you debugged'..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
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
                  Save Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
