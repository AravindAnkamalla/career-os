'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  CheckCircle2, 
  Circle
} from 'lucide-react'

interface LearningItem {
  id: string
  title: string
  type: string
  status: string
  difficulty?: string
}

interface LearningTrack {
  id: string
  name: string
  description?: string
  category: string
  items: LearningItem[]
}

export default function LearningPage() {
  const [tracks, setTracks] = useState<LearningTrack[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTracks = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/learning')
      if (res.ok) {
        const data = await res.json()
        setTracks(data.tracks)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTracks()
  }, [fetchTracks])

  const toggleItem = async (itemId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'not_started' : 'completed'
    try {
      await fetch('/api/learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, status: newStatus }),
      })
      fetchTracks()
    } catch (err) {
      console.error(err)
    }
  }

  const totalItems = tracks.reduce((acc, t) => acc + t.items.length, 0)
  const completedItems = tracks.reduce(
    (acc, t) => acc + t.items.filter(i => i.status === 'completed').length,
    0
  )
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Structured Upskilling Roadmap</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Hands-on implementation, debugging, and system design tracks tailored to your target engineering roles.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-xl border border-border shadow-xs">
          <div className="text-right">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Total Progress</span>
            <span className="text-base font-extrabold text-foreground">{completedItems} / {totalItems} Units ({progressPct}%)</span>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center font-bold text-xs text-primary">
            {progressPct}%
          </div>
        </div>
      </div>

      {/* Tracks Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tracks.map((track) => {
            const trackCompleted = track.items.filter(i => i.status === 'completed').length
            const trackPct = track.items.length > 0 ? Math.round((trackCompleted / track.items.length) * 100) : 0

            return (
              <div key={track.id} className="bg-card rounded-xl border border-border p-5 space-y-4 shadow-xs">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-foreground">{track.name}</h3>
                    <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                      {trackPct}%
                    </span>
                  </div>
                  {track.description && (
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {track.description}
                    </p>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-300" style={{ width: `${trackPct}%` }} />
                </div>

                {/* Items */}
                <div className="space-y-2 pt-1">
                  {track.items.map((item) => {
                    const isDone = item.status === 'completed'
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(item.id, item.status)}
                        className="flex items-start gap-3 p-2.5 rounded-lg border border-border/80 hover:bg-muted/40 transition-colors cursor-pointer group"
                      >
                        <button className="mt-0.5 text-muted-foreground group-hover:text-primary transition-colors">
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground/60" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-medium ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                            <span className="capitalize px-1.5 py-0.2 rounded bg-muted">
                              {item.type}
                            </span>
                            {item.difficulty && (
                              <span className="capitalize">{item.difficulty}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
