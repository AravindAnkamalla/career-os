'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Search, 
  Sparkles, 
  Bookmark, 
  X, 
  Send, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Building,
  Briefcase,
  Layers
} from 'lucide-react'

interface JobItem {
  id: string
  title: string
  company: string
  location?: string
  remoteStatus?: string
  employmentType?: string
  experienceMin?: number
  experienceMax?: number
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  applicationUrl?: string
  postingUrl?: string
  postedAt?: string
  requiredSkills: string[]
  preferredSkills: string[]
  source: { name: string; type: string }
  match: {
    overallScore: number
    roleScore: number
    skillScore: number
    experienceScore: number
    locationScore: number
    stackScore: number
    seniorityScore: number
    matchedSkills: string[]
    missingSkills: string[]
    strongPoints: string[]
    concerns: string[]
    recommendation: string
    explanation: string
  } | null
  savedStatus?: 'bookmarked' | 'dismissed' | 'applied' | null
  hasApplication: boolean
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [loading, setLoading] = useState(true)
  const [discovering, setDiscovering] = useState(false)
  const [search, setSearch] = useState('')
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'high_match' | 'bookmarked'>('all')

  // Discovery inputs
  const [query, setQuery] = useState('Backend Engineer')
  const [location, setLocation] = useState('India')

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)

      const res = await fetch(`/api/jobs?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs)
      }
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleRunDiscovery = async () => {
    try {
      setDiscovering(true)
      const res = await fetch('/api/jobs/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, location }),
      })
      if (res.ok) {
        await fetchJobs()
      }
    } finally {
      setDiscovering(false)
    }
  }

  const handleSaveJob = async (jobId: string, status: 'bookmarked' | 'dismissed') => {
    try {
      await fetch(`/api/jobs/${jobId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      fetchJobs()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateApplication = async (job: JobItem) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          company: job.company,
          role: job.title,
          postingUrl: job.postingUrl || job.applicationUrl,
          stage: 'shortlisted',
          notes: `Added from job discovery with ${job.match?.overallScore ?? 0}% match score.`,
        }),
      })
      if (res.ok) {
        alert(`Application created for ${job.company}! Find it in your Applications pipeline.`)
        fetchJobs()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to create application')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const displayedJobs = jobs.filter(j => {
    if (activeTab === 'high_match') return (j.match?.overallScore ?? 0) >= 70
    if (activeTab === 'bookmarked') return j.savedStatus === 'bookmarked'
    return true
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Discovery & Fit Analysis</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Transparent algorithmic matching against your skills, target roles, and experience.
          </p>
        </div>

        {/* Discovery Action Panel */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Target role..."
            className="text-xs px-3 py-1.5 rounded-md border border-border bg-card w-36 sm:w-44 focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location..."
            className="text-xs px-3 py-1.5 rounded-md border border-border bg-card w-28 focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleRunDiscovery}
            disabled={discovering}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{discovering ? 'Discovering...' : 'Run Discovery'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, company, or location..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            All Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('high_match')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'high_match' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            High Match ≥70% ({jobs.filter(j => (j.match?.overallScore ?? 0) >= 70).length})
          </button>
          <button
            onClick={() => setActiveTab('bookmarked')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'bookmarked' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Saved ({jobs.filter(j => j.savedStatus === 'bookmarked').length})
          </button>
        </div>
      </div>

      {/* Job Cards List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : displayedJobs.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Briefcase className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-3" />
          <h3 className="text-sm font-semibold">No jobs match your filter</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or click &quot;Run Discovery&quot; to fetch fresh opportunities.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedJobs.map((job) => {
            const isExpanded = expandedMatchId === job.id
            const score = job.match?.overallScore ?? 0

            return (
              <div
                key={job.id}
                className={`rounded-xl border transition-all duration-200 bg-card ${
                  job.savedStatus === 'bookmarked'
                    ? 'border-primary/50 shadow-xs'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                {/* Job Card Header */}
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-foreground hover:text-primary transition-colors">
                          {job.title}
                        </h2>
                        {job.source.name === 'fixture' && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            Dev Fixture
                          </span>
                        )}
                        {job.hasApplication && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                            In Pipeline
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="font-semibold text-foreground flex items-center gap-1">
                          <Building className="h-3.5 w-3.5 text-muted-foreground" />
                          {job.company}
                        </span>
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.location}
                          </span>
                        )}
                        {job.remoteStatus && (
                          <span className="capitalize px-1.5 py-0.5 rounded bg-muted text-[11px]">
                            {job.remoteStatus}
                          </span>
                        )}
                        {(job.experienceMin !== undefined || job.experienceMax !== undefined) && (
                          <span>
                            Exp: {job.experienceMin ?? 0}–{job.experienceMax ?? 'Any'} yrs
                          </span>
                        )}
                        {job.salaryMin && (
                          <span className="flex items-center font-medium text-foreground">
                            ₹{(job.salaryMin / 100000).toFixed(1)}L - ₹{((job.salaryMax ?? job.salaryMin) / 100000).toFixed(1)}L
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className={`text-base font-extrabold px-2.5 py-0.5 rounded-md ${
                            score >= 75 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            score >= 55 ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            'bg-zinc-100 text-zinc-800 border border-zinc-200'
                          }`}>
                            {score}% Match
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground capitalize mt-0.5 block">
                          {job.match?.recommendation.replace('_', ' ') ?? 'Evaluating'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                    {job.match?.matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        {skill}
                      </span>
                    ))}
                    {job.match?.missingSkills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60"
                      >
                        + {skill}
                      </span>
                    ))}
                    {job.match && job.match.missingSkills.length > 4 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{job.match.missingSkills.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCreateApplication(job)}
                        disabled={job.hasApplication}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        <Send className="h-3 w-3" />
                        <span>{job.hasApplication ? 'In Pipeline' : 'Track Application'}</span>
                      </button>

                      <button
                        onClick={() => handleSaveJob(job.id, 'bookmarked')}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-colors ${
                          job.savedStatus === 'bookmarked'
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'border-border hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        <Bookmark className="h-3 w-3" />
                        <span>{job.savedStatus === 'bookmarked' ? 'Saved' : 'Bookmark'}</span>
                      </button>

                      <button
                        onClick={() => handleSaveJob(job.id, 'dismissed')}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-border hover:bg-muted text-muted-foreground transition-colors"
                        title="Dismiss job"
                      >
                        <X className="h-3 w-3" />
                        <span>Dismiss</span>
                      </button>

                      {(job.postingUrl || job.applicationUrl) && (
                        <a
                          href={job.postingUrl || job.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5"
                        >
                          <span>Original Link</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => setExpandedMatchId(isExpanded ? null : job.id)}
                      className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                    >
                      <span>{isExpanded ? 'Hide Fit Breakdown' : 'Explain Match Breakdown'}</span>
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                {/* Detailed Transparent Match Explanation */}
                {isExpanded && job.match && (
                  <div className="bg-muted/30 border-t border-border p-5 rounded-b-xl space-y-4 text-xs">
                    {/* Dimension Scores Bar */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-primary" />
                        Multi-Factor Scoring Components
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center">
                        <div className="p-2.5 rounded-lg border border-border bg-card">
                          <span className="text-[10px] text-muted-foreground block">Role Fit</span>
                          <span className="font-bold text-sm text-foreground">{job.match.roleScore}%</span>
                        </div>
                        <div className="p-2.5 rounded-lg border border-border bg-card">
                          <span className="text-[10px] text-muted-foreground block">Skills Overlap</span>
                          <span className="font-bold text-sm text-foreground">{job.match.skillScore}%</span>
                        </div>
                        <div className="p-2.5 rounded-lg border border-border bg-card">
                          <span className="text-[10px] text-muted-foreground block">Experience</span>
                          <span className="font-bold text-sm text-foreground">{job.match.experienceScore}%</span>
                        </div>
                        <div className="p-2.5 rounded-lg border border-border bg-card">
                          <span className="text-[10px] text-muted-foreground block">Location/Mode</span>
                          <span className="font-bold text-sm text-foreground">{job.match.locationScore}%</span>
                        </div>
                        <div className="p-2.5 rounded-lg border border-border bg-card">
                          <span className="text-[10px] text-muted-foreground block">Preferred Stack</span>
                          <span className="font-bold text-sm text-foreground">{job.match.stackScore}%</span>
                        </div>
                        <div className="p-2.5 rounded-lg border border-border bg-card">
                          <span className="text-[10px] text-muted-foreground block">Seniority Fit</span>
                          <span className="font-bold text-sm text-foreground">{job.match.seniorityScore}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Strong points & Concerns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {job.match.strongPoints.length > 0 && (
                        <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40">
                          <span className="font-semibold text-emerald-900 block mb-1.5 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            Strong Alignment Evidence
                          </span>
                          <ul className="space-y-1 text-emerald-800 list-disc list-inside">
                            {job.match.strongPoints.map((pt, idx) => (
                              <li key={idx}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {job.match.concerns.length > 0 && (
                        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/40">
                          <span className="font-semibold text-amber-900 block mb-1.5 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                            Potential Mismatches or Uncertainties
                          </span>
                          <ul className="space-y-1 text-amber-800 list-disc list-inside">
                            {job.match.concerns.map((c, idx) => (
                              <li key={idx}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
