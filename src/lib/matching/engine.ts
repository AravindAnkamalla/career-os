/**
 * CareerOS — Deterministic Job Matching Engine
 * 
 * Calculates a transparent, explainable match score between a job
 * and the user's career profile + preferences.
 * 
 * No LLM required. Scores are a prioritization aid, not a probability.
 */

import type { MatchResult, NormalizedJob } from '@/lib/types/job'

// ============ Types ============

export interface UserMatchProfile {
  targetRoles: string[]
  skills: Array<{ name: string; category: string; proficiency: number }>
  preferredLocations: string[]
  remotePreference: string // remote, hybrid, onsite, any
  minExperience: number
  maxExperience: number
  preferredStack: string[]
}

export interface MatchWeights {
  role: number
  skills: number
  experience: number
  location: number
  stack: number
  seniority: number
}

const DEFAULT_WEIGHTS: MatchWeights = {
  role: 0.25,
  skills: 0.25,
  experience: 0.15,
  location: 0.15,
  stack: 0.10,
  seniority: 0.10,
}

// ============ Scoring Functions ============

function normalizeString(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s+#.]/g, '')
}

function tokenize(s: string): string[] {
  return normalizeString(s).split(/\s+/).filter(Boolean)
}

/**
 * Role relevance: how well does the job title match target roles?
 */
function scoreRole(jobTitle: string, targetRoles: string[]): { score: number; reasons: string[] } {
  const normalizedTitle = normalizeString(jobTitle)
  const reasons: string[] = []

  // Direct match
  for (const role of targetRoles) {
    const normalizedRole = normalizeString(role)
    if (normalizedTitle.includes(normalizedRole) || normalizedRole.includes(normalizedTitle)) {
      reasons.push(`Title "${jobTitle}" matches target role "${role}"`)
      return { score: 100, reasons }
    }
  }

  // Partial token match
  const titleTokens = new Set(tokenize(jobTitle))
  let bestTokenOverlap = 0
  let bestRole = ''

  for (const role of targetRoles) {
    const roleTokens = tokenize(role)
    const overlap = roleTokens.filter(t => titleTokens.has(t)).length
    const overlapRatio = roleTokens.length > 0 ? overlap / roleTokens.length : 0
    if (overlapRatio > bestTokenOverlap) {
      bestTokenOverlap = overlapRatio
      bestRole = role
    }
  }

  if (bestTokenOverlap >= 0.5) {
    const score = Math.round(bestTokenOverlap * 80)
    reasons.push(`Title "${jobTitle}" partially matches "${bestRole}" (${Math.round(bestTokenOverlap * 100)}% overlap)`)
    return { score, reasons }
  }

  // Engineering-adjacent roles get some credit
  const engineeringTerms = ['engineer', 'developer', 'programmer', 'sde', 'swe']
  if (engineeringTerms.some(term => normalizedTitle.includes(term))) {
    reasons.push(`"${jobTitle}" is an engineering role but doesn't match target roles directly`)
    return { score: 30, reasons }
  }

  reasons.push(`"${jobTitle}" does not match any target role`)
  return { score: 0, reasons }
}

/**
 * Skill overlap: how many of the job's required/preferred skills match user skills?
 */
function scoreSkills(
  requiredSkills: string[],
  preferredSkills: string[],
  userSkills: Array<{ name: string; proficiency: number }>
): { score: number; matched: string[]; missing: string[] } {
  const userSkillNames = new Set(userSkills.map(s => normalizeString(s.name)))

  const allJobSkills = [...new Set([...requiredSkills, ...preferredSkills])]
  const matched: string[] = []
  const missing: string[] = []

  for (const skill of allJobSkills) {
    const normalized = normalizeString(skill)
    // Check exact match or substring match
    let found = false
    for (const userSkill of userSkillNames) {
      if (userSkill.includes(normalized) || normalized.includes(userSkill)) {
        matched.push(skill)
        found = true
        break
      }
    }
    if (!found) {
      missing.push(skill)
    }
  }

  if (allJobSkills.length === 0) {
    // No skills listed — give neutral score
    return { score: 50, matched: [], missing: [] }
  }

  const requiredMatched = requiredSkills.filter(s => {
    const n = normalizeString(s)
    return [...userSkillNames].some(u => u.includes(n) || n.includes(u))
  })

  // Required skills weigh more
  const requiredWeight = 0.7
  const preferredWeight = 0.3

  const requiredScore = requiredSkills.length > 0
    ? (requiredMatched.length / requiredSkills.length) * 100
    : 100

  const prefMatched = preferredSkills.filter(s => {
    const n = normalizeString(s)
    return [...userSkillNames].some(u => u.includes(n) || n.includes(u))
  })
  const preferredScore = preferredSkills.length > 0
    ? (prefMatched.length / preferredSkills.length) * 100
    : 100

  const score = Math.round(requiredScore * requiredWeight + preferredScore * preferredWeight)
  return { score, matched, missing }
}

/**
 * Experience compatibility
 */
function scoreExperience(
  jobMinExp: number | undefined,
  jobMaxExp: number | undefined,
  userMinExp: number,
  userMaxExp: number
): { score: number; reasons: string[] } {
  const reasons: string[] = []

  if (jobMinExp === undefined && jobMaxExp === undefined) {
    reasons.push('No experience requirement specified')
    return { score: 70, reasons }
  }

  const jobMin = jobMinExp ?? 0
  const jobMax = jobMaxExp ?? jobMin + 5
  const userMid = (userMinExp + userMaxExp) / 2

  // Perfect fit
  if (userMid >= jobMin && userMid <= jobMax) {
    reasons.push(`Your experience (~${userMid} years) fits the ${jobMin}-${jobMax} year requirement`)
    return { score: 100, reasons }
  }

  // Slightly under
  if (userMid < jobMin) {
    const gap = jobMin - userMid
    if (gap <= 1) {
      reasons.push(`Slightly under the ${jobMin}-${jobMax} year requirement by ~${gap} year(s) — worth applying`)
      return { score: 70, reasons }
    }
    if (gap <= 2) {
      reasons.push(`Under the ${jobMin}-${jobMax} year requirement by ~${gap} years — possible stretch`)
      return { score: 45, reasons }
    }
    reasons.push(`Significantly under the ${jobMin}-${jobMax} year requirement`)
    return { score: 20, reasons }
  }

  // Over-qualified
  const overBy = userMid - jobMax
  if (overBy <= 2) {
    reasons.push(`Slightly over the ${jobMin}-${jobMax} year requirement — likely fine`)
    return { score: 75, reasons }
  }

  reasons.push(`May be over-qualified for the ${jobMin}-${jobMax} year requirement`)
  return { score: 40, reasons }
}

/**
 * Location compatibility
 */
function scoreLocation(
  jobLocation: string | undefined,
  jobRemoteStatus: string | undefined,
  preferredLocations: string[],
  remotePreference: string
): { score: number; reasons: string[] } {
  const reasons: string[] = []
  const normalizedRemote = (jobRemoteStatus ?? 'unknown').toLowerCase()

  // Remote job + user wants remote
  if (normalizedRemote === 'remote') {
    if (remotePreference === 'remote' || remotePreference === 'any' || remotePreference === 'hybrid') {
      reasons.push('Remote role matches your remote preference')
      return { score: 100, reasons }
    }
    reasons.push('Remote role, but you prefer on-site')
    return { score: 50, reasons }
  }

  // Check location match
  if (jobLocation) {
    const normalizedJobLoc = normalizeString(jobLocation)
    for (const loc of preferredLocations) {
      if (normalizedJobLoc.includes(normalizeString(loc)) || normalizeString(loc).includes(normalizedJobLoc)) {
        reasons.push(`Location "${jobLocation}" matches your preference "${loc}"`)
        return { score: 100, reasons }
      }
    }

    // India but different city
    if (normalizedJobLoc.includes('india') || normalizedJobLoc.includes('in')) {
      reasons.push(`Location "${jobLocation}" is in India but not in your preferred cities`)
      return { score: 50, reasons }
    }

    reasons.push(`Location "${jobLocation}" doesn't match your preferred locations`)
    return { score: 20, reasons }
  }

  // Unknown location
  if (normalizedRemote === 'unknown') {
    reasons.push('Location and work mode not specified')
    return { score: 40, reasons }
  }

  reasons.push('On-site role with no specified location')
  return { score: 30, reasons }
}

/**
 * Preferred stack overlap
 */
function scoreStack(
  requiredSkills: string[],
  preferredSkills: string[],
  preferredStack: string[]
): { score: number; reasons: string[] } {
  const reasons: string[] = []
  const allSkills = [...requiredSkills, ...preferredSkills].map(normalizeString)

  if (allSkills.length === 0) {
    reasons.push('No tech stack information available')
    return { score: 50, reasons }
  }

  const stackMatches = preferredStack.filter(tech => {
    const normalized = normalizeString(tech)
    return allSkills.some(s => s.includes(normalized) || normalized.includes(s))
  })

  if (stackMatches.length > 0) {
    const ratio = stackMatches.length / preferredStack.length
    const score = Math.round(ratio * 100)
    reasons.push(`Stack overlap: ${stackMatches.join(', ')} (${Math.round(ratio * 100)}% of your preferred stack)`)
    return { score: Math.min(score + 20, 100), reasons }
  }

  reasons.push('No overlap with your preferred tech stack')
  return { score: 15, reasons }
}

/**
 * Seniority fit — does the job title suggest a level that's too senior/junior?
 */
function scoreSeniority(jobTitle: string, userMaxExp: number): { score: number; reasons: string[] } {
  const reasons: string[] = []
  const normalized = normalizeString(jobTitle)

  const seniorIndicators = ['senior', 'staff', 'principal', 'lead', 'architect', 'director', 'vp', 'head of', 'manager']
  const juniorIndicators = ['junior', 'jr', 'intern', 'trainee', 'fresher', 'entry level', 'graduate']

  const isSenior = seniorIndicators.some(i => normalized.includes(i))
  const isJunior = juniorIndicators.some(i => normalized.includes(i))

  if (isSenior && userMaxExp <= 3) {
    reasons.push(`"${jobTitle}" appears to be a senior role — may be a stretch with ${userMaxExp} years experience`)
    return { score: 30, reasons }
  }

  if (isJunior && userMaxExp >= 2) {
    reasons.push(`"${jobTitle}" appears to be a junior role — you may be slightly overqualified`)
    return { score: 60, reasons }
  }

  if (!isSenior && !isJunior) {
    reasons.push('Seniority level appears appropriate')
    return { score: 85, reasons }
  }

  if (isJunior && userMaxExp < 2) {
    reasons.push('Junior/entry-level role — good fit for your experience level')
    return { score: 100, reasons }
  }

  reasons.push('Seniority level is unclear')
  return { score: 70, reasons }
}

// ============ Main Matching Engine ============

export function calculateMatch(
  job: NormalizedJob,
  profile: UserMatchProfile,
  weights: MatchWeights = DEFAULT_WEIGHTS
): MatchResult {
  const roleResult = scoreRole(job.title, profile.targetRoles)
  const skillResult = scoreSkills(job.requiredSkills, job.preferredSkills, profile.skills)
  const expResult = scoreExperience(job.experienceMin, job.experienceMax, profile.minExperience, profile.maxExperience)
  const locResult = scoreLocation(job.location, job.remoteStatus, profile.preferredLocations, profile.remotePreference)
  const stackResult = scoreStack(job.requiredSkills, job.preferredSkills, profile.preferredStack)
  const seniorityResult = scoreSeniority(job.title, profile.maxExperience)

  const overallScore = Math.round(
    roleResult.score * weights.role +
    skillResult.score * weights.skills +
    expResult.score * weights.experience +
    locResult.score * weights.location +
    stackResult.score * weights.stack +
    seniorityResult.score * weights.seniority
  )

  const strongPoints = [
    ...roleResult.reasons.filter(() => roleResult.score >= 70),
    ...expResult.reasons.filter(() => expResult.score >= 70),
    ...locResult.reasons.filter(() => locResult.score >= 70),
    ...stackResult.reasons.filter(() => stackResult.score >= 50),
    ...(skillResult.matched.length > 0 ? [`Matching skills: ${skillResult.matched.join(', ')}`] : []),
  ].filter(Boolean)

  const concerns = [
    ...roleResult.reasons.filter(() => roleResult.score < 50),
    ...expResult.reasons.filter(() => expResult.score < 50),
    ...locResult.reasons.filter(() => locResult.score < 50),
    ...seniorityResult.reasons.filter(() => seniorityResult.score < 50),
    ...(skillResult.missing.length > 0 ? [`Missing skills: ${skillResult.missing.join(', ')}`] : []),
  ].filter(Boolean)

  let recommendation: MatchResult['recommendation']
  if (overallScore >= 75) recommendation = 'strong_match'
  else if (overallScore >= 55) recommendation = 'good_match'
  else if (overallScore >= 35) recommendation = 'possible_match'
  else recommendation = 'weak_match'

  const explanation = buildExplanation(
    job, overallScore, recommendation,
    roleResult, skillResult, expResult, locResult
  )

  return {
    overallScore,
    roleScore: roleResult.score,
    skillScore: skillResult.score,
    experienceScore: expResult.score,
    locationScore: locResult.score,
    stackScore: stackResult.score,
    seniorityScore: seniorityResult.score,
    matchedSkills: skillResult.matched,
    missingSkills: skillResult.missing,
    strongPoints,
    concerns,
    recommendation,
    explanation,
  }
}

function buildExplanation(
  job: NormalizedJob,
  overallScore: number,
  recommendation: string,
  role: { score: number; reasons: string[] },
  skills: { score: number; matched: string[]; missing: string[] },
  exp: { score: number; reasons: string[] },
  loc: { score: number; reasons: string[] }
): string {
  const parts: string[] = []
  
  parts.push(`${job.title} at ${job.company}: ${overallScore}/100 (${recommendation.replace('_', ' ')}).`)
  
  if (role.score >= 70) parts.push(`✓ ${role.reasons[0]}`)
  else if (role.reasons[0]) parts.push(`△ ${role.reasons[0]}`)

  if (skills.matched.length > 0) parts.push(`✓ You have ${skills.matched.length} matching skill(s): ${skills.matched.slice(0, 5).join(', ')}`)
  if (skills.missing.length > 0) parts.push(`△ Missing: ${skills.missing.slice(0, 5).join(', ')}`)
  
  if (exp.reasons[0]) {
    const prefix = exp.score >= 70 ? '✓' : '△'
    parts.push(`${prefix} ${exp.reasons[0]}`)
  }

  if (loc.reasons[0]) {
    const prefix = loc.score >= 70 ? '✓' : '△'
    parts.push(`${prefix} ${loc.reasons[0]}`)
  }

  return parts.join('\n')
}
