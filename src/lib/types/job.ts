import { z } from 'zod'

// ============ Normalized Job Model ============

export const NormalizedJobSchema = z.object({
  externalId: z.string().optional(),
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().optional(),
  remoteStatus: z.enum(['remote', 'hybrid', 'onsite', 'unknown']).default('unknown'),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'unknown']).default('unknown'),
  experienceMin: z.number().int().min(0).optional(),
  experienceMax: z.number().int().min(0).optional(),
  description: z.string().min(1),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryCurrency: z.string().optional(),
  salaryPeriod: z.enum(['yearly', 'monthly', 'hourly']).optional(),
  applicationUrl: z.string().url().optional(),
  postingUrl: z.string().url().optional(),
  postedAt: z.date().optional(),
  expiresAt: z.date().optional(),
  rawData: z.record(z.unknown()).optional(),
})

export type NormalizedJob = z.infer<typeof NormalizedJobSchema>

// ============ Match Result ============

export const MatchResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  roleScore: z.number().min(0).max(100),
  skillScore: z.number().min(0).max(100),
  experienceScore: z.number().min(0).max(100),
  locationScore: z.number().min(0).max(100),
  stackScore: z.number().min(0).max(100),
  seniorityScore: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  strongPoints: z.array(z.string()),
  concerns: z.array(z.string()),
  recommendation: z.enum(['strong_match', 'good_match', 'possible_match', 'weak_match']),
  explanation: z.string(),
})

export type MatchResult = z.infer<typeof MatchResultSchema>

// ============ Job Provider Interface ============

export interface JobProviderConfig {
  name: string
  type: 'api' | 'feed' | 'fixture'
  isConfigured: boolean
  rateLimitInfo?: string
}

export interface JobSearchParams {
  query: string
  location?: string
  remoteOnly?: boolean
  datePosted?: string // e.g., 'today', '3days', 'week', 'month'
  employmentType?: string
  page?: number
  numPages?: number
}

export interface JobSearchResult {
  jobs: NormalizedJob[]
  totalFound: number
  page: number
  hasMore: boolean
  source: string
}

export interface JobProvider {
  readonly name: string
  readonly type: 'api' | 'feed' | 'fixture'
  
  isConfigured(): boolean
  getConfig(): JobProviderConfig
  search(params: JobSearchParams): Promise<JobSearchResult>
  testConnection(): Promise<{ ok: boolean; message: string }>
}

// ============ Integration Run Summary ============

export interface RunSummary {
  runId: string
  source: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt: Date
  completedAt?: Date
  durationMs?: number
  totalProcessed: number
  totalCreated: number
  totalUpdated: number
  totalSkipped: number
  totalFailed: number
  errorSummary?: string
  triggeredBy: 'manual' | 'scheduled' | 'api'
}

// ============ Application Stages ============

export const APPLICATION_STAGES = [
  'discovered',
  'shortlisted',
  'preparing',
  'applied',
  'recruiter_screen',
  'technical_interview',
  'final_interview',
  'offer',
  'rejected',
  'withdrawn',
  'on_hold',
] as const

export type ApplicationStage = typeof APPLICATION_STAGES[number]

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  discovered: 'Discovered',
  shortlisted: 'Shortlisted',
  preparing: 'Preparing',
  applied: 'Applied',
  recruiter_screen: 'Recruiter Screen',
  technical_interview: 'Technical Interview',
  final_interview: 'Final Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  on_hold: 'On Hold',
}

// ============ Task Categories ============

export const TASK_CATEGORIES = [
  'job_search',
  'dsa',
  'backend',
  'system_design',
  'project',
  'interview_prep',
  'communication',
  'career_admin',
] as const

export type TaskCategory = typeof TASK_CATEGORIES[number]

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  job_search: 'Job Search',
  dsa: 'DSA',
  backend: 'Backend Engineering',
  system_design: 'System Design',
  project: 'Project Development',
  interview_prep: 'Interview Preparation',
  communication: 'Communication',
  career_admin: 'Career Administration',
}

// ============ Skill Categories ============

export const SKILL_CATEGORIES = [
  'Backend',
  'Frontend',
  'Database',
  'Cloud',
  'DevOps',
  'Languages',
  'Tools',
  'Concepts',
  'Soft Skills',
] as const

export type SkillCategory = typeof SKILL_CATEGORIES[number]
