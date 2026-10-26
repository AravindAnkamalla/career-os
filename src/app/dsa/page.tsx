'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Code2, 
  Plus, 
  ExternalLink, 
  Search
} from 'lucide-react'

interface ProblemItem {
  id: string
  title: string
  url?: string
  platform: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  notes?: string
  attempts: Array<{
    id: string
    status: string
    approach?: string
    complexity?: string
    attemptDate: string
  }>
}

export default function DsaPage() {
  const [problems, setProblems] = useState<ProblemItem[]>([])
  const [stats, setStats] = useState<{ total: number; solved: number; byDifficulty: Record<string, number> }>({
    total: 0,
    solved: 0,
    byDifficulty: { easy: 0, medium: 0, hard: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [topicFilter, setTopicFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [platform, setPlatform] = useState('leetcode')
  const [topic, setTopic] = useState('arrays')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [approach, setApproach] = useState('')
  const [complexity, setComplexity] = useState('')
  const [status, setStatus] = useState<'solved' | 'partially_solved' | 'unsolved'>('solved')

  const fetchProblems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/dsa')
      if (res.ok) {
        const data = await res.json()
        setProblems(data.problems)
        if (data.stats) setStats(data.stats)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProblems()
  }, [fetchProblems])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    try {
      const res = await fetch('/api/dsa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          url,
          platform,
          topic,
          difficulty,
          approach,
          complexity,
          status,
        }),
      })

      if (res.ok) {
        setIsModalOpen(false)
        setTitle('')
        setUrl('')
        setApproach('')
        setComplexity('')
        fetchProblems()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = problems.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.topic.toLowerCase().includes(search.toLowerCase())
    const matchesTopic = topicFilter === 'all' || p.topic === topicFilter
    return matchesSearch && matchesTopic
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">DSA Practice & Spaced Review (Java)</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track pattern mastery, time/space complexity, and mistakes rather than raw problem count.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Log Problem</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-xs text-muted-foreground block">Total Tracked</span>
          <span className="text-2xl font-bold mt-1 block">{stats.total}</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-xs text-muted-foreground block">Solved Independently</span>
          <span className="text-2xl font-bold mt-1 block text-emerald-600">{stats.solved}</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-xs text-muted-foreground block">Mediums Solved</span>
          <span className="text-2xl font-bold mt-1 block text-amber-600">{stats.byDifficulty.medium ?? 0}</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-xs text-muted-foreground block">Hards Solved</span>
          <span className="text-2xl font-bold mt-1 block text-red-600">{stats.byDifficulty.hard ?? 0}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems by name or pattern..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-border bg-background focus:outline-hidden"
          />
        </div>

        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="text-xs bg-background border border-border rounded-md px-2.5 py-1.5 text-foreground focus:outline-hidden"
        >
          <option value="all">All Patterns & Topics</option>
          <option value="arrays">Arrays & Hashing</option>
          <option value="two_pointers">Two Pointers & Sliding Window</option>
          <option value="trees">Binary Trees & BST</option>
          <option value="graphs">Graphs (BFS/DFS)</option>
          <option value="dp">Dynamic Programming</option>
          <option value="recursion">Recursion & Backtracking</option>
        </select>
      </div>

      {/* Problems Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Code2 className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-3" />
          <h3 className="text-sm font-semibold">No problems recorded yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Click &quot;Log Problem&quot; to track your first LeetCode or Java DSA problem.
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border divide-y divide-border shadow-xs overflow-hidden">
          {filtered.map((prob) => {
            const latestAttempt = prob.attempts[0]
            const isSolved = latestAttempt?.status === 'solved'

            return (
              <div key={prob.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`h-2 w-2 rounded-full ${isSolved ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <h3 className="font-semibold text-sm text-foreground hover:text-primary transition-colors">
                      {prob.title}
                    </h3>
                    {prob.url && (
                      <a href={prob.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                    <span className="capitalize font-medium text-foreground px-1.5 py-0.5 rounded bg-muted">
                      {prob.topic.replace('_', ' ')}
                    </span>
                    <span className="capitalize">{prob.platform}</span>
                    {latestAttempt?.complexity && (
                      <span>Time/Space: {latestAttempt.complexity}</span>
                    )}
                  </div>

                  {latestAttempt?.approach && (
                    <p className="text-[11px] text-muted-foreground/80 line-clamp-1 italic">
                      Approach: {latestAttempt.approach}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    prob.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-800' :
                    prob.difficulty === 'medium' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {prob.difficulty}
                  </span>

                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                    isSolved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-muted text-muted-foreground'
                  }`}>
                    {latestAttempt ? latestAttempt.status.replace('_', ' ') : 'unattempted'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Log Problem Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl border border-border max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base">Log DSA Problem (Java)</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-foreground block mb-1">Problem Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lowest Common Ancestor of a Binary Tree"
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Problem URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://leetcode.com/problems/..."
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-foreground block mb-1">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                  >
                    <option value="leetcode">LeetCode</option>
                    <option value="hackerrank">HackerRank</option>
                    <option value="neetcode">NeetCode</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-foreground block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as typeof status)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                  >
                    <option value="solved">Solved Independently</option>
                    <option value="partially_solved">Partially Solved / Needed Hints</option>
                    <option value="unsolved">Unsolved</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-foreground block mb-1">Pattern / Topic</label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                  >
                    <option value="arrays">Arrays & Hashing</option>
                    <option value="two_pointers">Two Pointers</option>
                    <option value="sliding_window">Sliding Window</option>
                    <option value="trees">Binary Trees</option>
                    <option value="graphs">Graphs</option>
                    <option value="dp">Dynamic Programming</option>
                    <option value="heaps">Heaps & PriorityQueue</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-foreground block mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Approach / Pattern Notes</label>
                <textarea
                  value={approach}
                  onChange={(e) => setApproach(e.target.value)}
                  placeholder="Recursion with post-order traversal; return root if either p or q matches..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Time & Space Complexity</label>
                <input
                  type="text"
                  value={complexity}
                  onChange={(e) => setComplexity(e.target.value)}
                  placeholder="O(N) time, O(H) recursion stack space"
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
                  Save Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
