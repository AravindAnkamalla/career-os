'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Search, 
  Kanban, 
  CheckSquare, 
  GraduationCap, 
  Code2, 
  MessageSquare, 
  FolderGit2, 
  LineChart, 
  Settings,
  ChevronRight,
  Briefcase
} from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/jobs', label: 'Discover Jobs', icon: Search },
  { href: '/applications', label: 'Applications', icon: Kanban },
  { href: '/tasks', label: 'Daily Planner', icon: CheckSquare },
  { href: '/learning', label: 'Upskilling', icon: GraduationCap },
  { href: '/dsa', label: 'DSA Tracker', icon: Code2 },
  { href: '/interviews', label: 'Interview Prep', icon: MessageSquare },
  { href: '/projects', label: 'Projects', icon: FolderGit2 },
  { href: '/analytics', label: 'Weekly Review', icon: LineChart },
  { href: '/profile', label: 'Profile & Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-border">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Briefcase className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight tracking-tight">CareerOS</h1>
          <p className="text-xs text-muted-foreground">Personal Operating System</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
            AA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">Aravind Ankamalla</p>
            <p className="text-[10px] text-muted-foreground truncate">Full Stack / Backend</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
