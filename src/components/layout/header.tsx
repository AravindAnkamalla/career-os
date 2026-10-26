'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Activity, RefreshCw } from 'lucide-react'

export function Header() {
  const [status, setStatus] = useState<{
    database?: { ok: boolean; message: string }
    providers?: Array<{ name: string; isConfigured: boolean; isDefault: boolean }>
  } | null>(null)
  const [seeding, setSeeding] = useState(false)

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status')
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch {
      // Ignore initial error if server starting
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleSeed = async () => {
    try {
      setSeeding(true)
      const res = await fetch('/api/seed', { method: 'POST' })
      if (res.ok) {
        await fetchStatus()
        window.location.reload()
      }
    } finally {
      setSeeding(false)
    }
  }

  const activeProvider = status?.providers?.find(p => p.isDefault)

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status?.database?.ok ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${status?.database?.ok ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            System {status?.database?.ok ? 'Healthy' : 'Initializing'}
          </span>
        </div>

        {activeProvider && (
          <div className="text-xs px-2.5 py-0.5 rounded-full bg-secondary border border-border text-secondary-foreground font-medium flex items-center gap-1.5">
            <Activity className="h-3 w-3" />
            <span>Feed: {activeProvider.name === 'fixture' ? 'Fixture (Dev Mode)' : activeProvider.name}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50"
          title="Seed initial profile & preferences"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>{seeding ? 'Seeding...' : 'Seed Profile'}</span>
        </button>
      </div>
    </header>
  )
}
