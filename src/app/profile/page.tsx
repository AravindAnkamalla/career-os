'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Settings, 
  Save, 
  Layers
} from 'lucide-react'

interface ProfileData {
  profile: {
    id: string
    name: string
    email?: string
    phone?: string
    location?: string
    bio?: string
    portfolioUrl?: string
    githubUrl?: string
    linkedinUrl?: string
  } | null
  preferences: {
    targetRoles: string[]
    preferredLocations: string[]
    remotePreference: string
    minExperience: number
    maxExperience: number
    preferredStack: string[]
  } | null
  skills: Array<{
    id: string
    name: string
    category: string
    proficiency: number
  }>
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Profile form
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')

  // Preferences form
  const [targetRolesStr, setTargetRolesStr] = useState('')
  const [locationsStr, setLocationsStr] = useState('')
  const [remotePref, setRemotePref] = useState('any')
  const [minExp, setMinExp] = useState(0)
  const [maxExp, setMaxExp] = useState(3)
  const [stackStr, setStackStr] = useState('')

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/profile')
      if (res.ok) {
        const json: ProfileData = await res.json()
        setData(json)
        if (json.profile) {
          setName(json.profile.name || '')
          setBio(json.profile.bio || '')
          setPortfolioUrl(json.profile.portfolioUrl || '')
          setGithubUrl(json.profile.githubUrl || '')
          setLinkedinUrl(json.profile.linkedinUrl || '')
        }
        if (json.preferences) {
          setTargetRolesStr(json.preferences.targetRoles.join(', '))
          setLocationsStr(json.preferences.preferredLocations.join(', '))
          setRemotePref(json.preferences.remotePreference || 'any')
          setMinExp(json.preferences.minExperience)
          setMaxExp(json.preferences.maxExperience)
          setStackStr(json.preferences.preferredStack.join(', '))
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      // Save profile
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          bio,
          portfolioUrl,
          githubUrl,
          linkedinUrl,
        }),
      })

      // Save preferences
      await fetch('/api/profile/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRoles: targetRolesStr.split(',').map(s => s.trim()).filter(Boolean),
          preferredLocations: locationsStr.split(',').map(s => s.trim()).filter(Boolean),
          remotePreference: remotePref,
          minExperience: Number(minExp),
          maxExperience: Number(maxExp),
          preferredStack: stackStr.split(',').map(s => s.trim()).filter(Boolean),
        }),
      })

      alert('Profile and matching preferences updated successfully!')
      fetchProfile()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  type SkillItem = NonNullable<ProfileData['skills']>[number]

  const skillsByCategory = (data?.skills ?? []).reduce((acc, skill) => {
    acc[skill.category] = acc[skill.category] || []
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, SkillItem[]>)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight">Career Profile & Matching Preferences</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          All settings directly calibrate the job discovery and matching scoring algorithm.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-xs">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Personal Background
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-medium text-foreground block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">Portfolio URL</label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">GitHub Profile</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">LinkedIn Profile</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-medium text-foreground block mb-1">Professional Bio / Summary</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Career & Matching Preferences */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-xs">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            Job Search & Algorithm Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-medium text-foreground block mb-1">
                Target Roles (comma-separated)
              </label>
              <input
                type="text"
                value={targetRolesStr}
                onChange={(e) => setTargetRolesStr(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Weights in Title Matching algorithm
              </span>
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">
                Preferred Locations (comma-separated)
              </label>
              <input
                type="text"
                value={locationsStr}
                onChange={(e) => setLocationsStr(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">Work Mode Preference</label>
              <select
                value={remotePref}
                onChange={(e) => setRemotePref(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
              >
                <option value="any">Any (Remote, Hybrid, or On-site)</option>
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid Preferred</option>
                <option value="onsite">On-site Preferred</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-medium text-foreground block mb-1">Min Exp (Yrs)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={minExp}
                  onChange={(e) => setMinExp(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                />
              </div>
              <div>
                <label className="font-medium text-foreground block mb-1">Max Exp (Yrs)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={maxExp}
                  onChange={(e) => setMaxExp(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="font-medium text-foreground block mb-1">
                Preferred Backend / Core Stack (comma-separated)
              </label>
              <input
                type="text"
                value={stackStr}
                onChange={(e) => setStackStr(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Verified Skills Matrix */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Technical Skills Inventory ({data?.skills.length ?? 0})
          </h2>
          <span className="text-xs text-muted-foreground">Used for Job Skill Overlap Scoring</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(skillsByCategory).map(([category, skills]) => (
            <div key={category} className="border border-border rounded-lg p-3 bg-muted/20">
              <h3 className="font-bold text-xs text-foreground uppercase tracking-wider mb-2">
                {category}
              </h3>
              <div className="space-y-1.5">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{skill.name}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`w-1.5 h-3 rounded-xs ${
                            lvl <= skill.proficiency ? 'bg-primary' : 'bg-muted-foreground/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
