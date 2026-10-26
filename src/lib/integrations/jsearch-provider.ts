/**
 * JSearch API Provider (via RapidAPI)
 * 
 * Provides: Job search via Google Jobs aggregation
 * Free tier: 200 requests/month
 * Auth: RapidAPI key (X-RapidAPI-Key header)
 * Rate limit: 200 req/month on free tier, 1000 req/hour
 * Data freshness: Real-time from Google Jobs
 * Failure: Returns error status, app falls back to fixture or cached data
 * Testing: Use testConnection() method
 * When unavailable: Fixture provider serves development data
 */

import type { JobProvider, JobProviderConfig, JobSearchParams, JobSearchResult, NormalizedJob } from '@/lib/types/job'

const JSEARCH_BASE_URL = 'https://jsearch.p.rapidapi.com'

interface JSearchJob {
  job_id?: string
  employer_name?: string
  job_title?: string
  job_description?: string
  job_city?: string
  job_state?: string
  job_country?: string
  job_is_remote?: boolean
  job_employment_type?: string
  job_min_salary?: number
  job_max_salary?: number
  job_salary_currency?: string
  job_salary_period?: string
  job_apply_link?: string
  job_google_link?: string
  job_posted_at_datetime_utc?: string
  job_offer_expiration_datetime_utc?: string
  job_required_skills?: string[] | null
  job_required_experience?: {
    no_experience_required?: boolean
    required_experience_in_months?: number
    experience_mentioned?: boolean
    experience_preferred?: boolean
  }
  job_highlights?: {
    Qualifications?: string[]
    Responsibilities?: string[]
    Benefits?: string[]
  }
}

interface JSearchResponse {
  status: string
  request_id: string
  data: JSearchJob[]
  parameters?: Record<string, unknown>
}

function normalizeJSearchJob(raw: JSearchJob): NormalizedJob {
  const locationParts = [raw.job_city, raw.job_state, raw.job_country].filter(Boolean)
  const location = locationParts.join(', ') || undefined

  let remoteStatus: NormalizedJob['remoteStatus'] = 'unknown'
  if (raw.job_is_remote === true) remoteStatus = 'remote'
  else if (raw.job_is_remote === false) remoteStatus = 'onsite'

  let employmentType: NormalizedJob['employmentType'] = 'unknown'
  if (raw.job_employment_type) {
    const et = raw.job_employment_type.toUpperCase()
    if (et.includes('FULL')) employmentType = 'full-time'
    else if (et.includes('PART')) employmentType = 'part-time'
    else if (et.includes('CONTRACT') || et.includes('CONTRACTOR')) employmentType = 'contract'
    else if (et.includes('INTERN')) employmentType = 'internship'
  }

  let experienceMin: number | undefined
  let experienceMax: number | undefined
  if (raw.job_required_experience?.required_experience_in_months) {
    const months = raw.job_required_experience.required_experience_in_months
    experienceMin = Math.floor(months / 12)
    experienceMax = Math.ceil(months / 12)
  }

  // Extract skills from highlights and required_skills
  const requiredSkills: string[] = []
  const preferredSkills: string[] = []
  
  if (raw.job_required_skills) {
    requiredSkills.push(...raw.job_required_skills)
  }
  
  // Try to extract skill-like terms from qualifications
  if (raw.job_highlights?.Qualifications) {
    for (const q of raw.job_highlights.Qualifications.slice(0, 10)) {
      // Only add short qualification strings as they're likely skill names
      if (q.length < 50 && !requiredSkills.includes(q)) {
        preferredSkills.push(q)
      }
    }
  }

  return {
    externalId: raw.job_id ?? undefined,
    title: raw.job_title ?? 'Unknown Title',
    company: raw.employer_name ?? 'Unknown Company',
    location,
    remoteStatus,
    employmentType,
    experienceMin,
    experienceMax,
    description: raw.job_description ?? '',
    requiredSkills,
    preferredSkills,
    salaryMin: raw.job_min_salary ?? undefined,
    salaryMax: raw.job_max_salary ?? undefined,
    salaryCurrency: raw.job_salary_currency ?? undefined,
    salaryPeriod: raw.job_salary_period?.toLowerCase() as NormalizedJob['salaryPeriod'],
    applicationUrl: raw.job_apply_link ?? undefined,
    postingUrl: raw.job_google_link ?? undefined,
    postedAt: raw.job_posted_at_datetime_utc ? new Date(raw.job_posted_at_datetime_utc) : undefined,
    expiresAt: raw.job_offer_expiration_datetime_utc ? new Date(raw.job_offer_expiration_datetime_utc) : undefined,
    rawData: raw as unknown as Record<string, unknown>,
  }
}

export class JSearchProvider implements JobProvider {
  readonly name = 'jsearch'
  readonly type = 'api' as const
  
  private apiKey: string | undefined
  private apiHost: string

  constructor() {
    this.apiKey = process.env.JSEARCH_API_KEY || undefined
    this.apiHost = process.env.JSEARCH_API_HOST || 'jsearch.p.rapidapi.com'
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0
  }

  getConfig(): JobProviderConfig {
    return {
      name: this.name,
      type: this.type,
      isConfigured: this.isConfigured(),
      rateLimitInfo: 'Free tier: 200 requests/month. Each page of results costs 1 request.',
    }
  }

  async search(params: JobSearchParams): Promise<JobSearchResult> {
    if (!this.isConfigured()) {
      throw new Error('JSearch API is not configured. Set JSEARCH_API_KEY in environment variables.')
    }

    const searchParams = new URLSearchParams({
      query: params.query,
      page: String(params.page ?? 1),
      num_pages: String(params.numPages ?? 1),
    })

    if (params.location) {
      searchParams.set('query', `${params.query} in ${params.location}`)
    }
    if (params.remoteOnly) {
      searchParams.set('remote_jobs_only', 'true')
    }
    if (params.datePosted) {
      searchParams.set('date_posted', params.datePosted)
    }
    if (params.employmentType) {
      searchParams.set('employment_types', params.employmentType.toUpperCase())
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

    try {
      const response = await fetch(`${JSEARCH_BASE_URL}/search?${searchParams}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey!,
          'X-RapidAPI-Host': this.apiHost,
        },
        signal: controller.signal,
      })

      if (response.status === 429) {
        throw new Error('JSearch API rate limit exceeded. Free tier allows 200 requests/month.')
      }

      if (!response.ok) {
        throw new Error(`JSearch API error: ${response.status} ${response.statusText}`)
      }

      const data: JSearchResponse = await response.json()

      if (!data.data || !Array.isArray(data.data)) {
        return { jobs: [], totalFound: 0, page: params.page ?? 1, hasMore: false, source: this.name }
      }

      const jobs = data.data.map(normalizeJSearchJob)

      return {
        jobs,
        totalFound: jobs.length, // JSearch doesn't always return total count
        page: params.page ?? 1,
        hasMore: jobs.length >= 10, // JSearch returns up to 10 per page
        source: this.name,
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async testConnection(): Promise<{ ok: boolean; message: string }> {
    if (!this.isConfigured()) {
      return { ok: false, message: 'JSEARCH_API_KEY is not set. Get a free key at rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch' }
    }

    try {
      const result = await this.search({ query: 'software engineer', page: 1, numPages: 1 })
      return { ok: true, message: `Connected successfully. Found ${result.totalFound} jobs in test query.` }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return { ok: false, message: `Connection failed: ${message}` }
    }
  }
}
