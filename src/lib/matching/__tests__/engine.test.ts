import { describe, it, expect } from 'vitest'
import { calculateMatch, type UserMatchProfile } from '../engine'
import type { NormalizedJob } from '@/lib/types/job'

const mockProfile: UserMatchProfile = {
  targetRoles: ['Backend Engineer', 'Full-Stack Engineer', 'Software Engineer', 'Forward Deployed Engineer'],
  skills: [
    { name: 'Node.js', category: 'Backend', proficiency: 3 },
    { name: 'TypeScript', category: 'Backend', proficiency: 3 },
    { name: 'PostgreSQL', category: 'Database', proficiency: 3 },
    { name: 'REST APIs', category: 'Backend', proficiency: 3 },
    { name: 'React', category: 'Frontend', proficiency: 4 },
  ],
  preferredLocations: ['Hyderabad', 'Bengaluru'],
  remotePreference: 'any',
  minExperience: 0,
  maxExperience: 3,
  preferredStack: ['Node.js', 'TypeScript'],
}

describe('Deterministic Matching Engine', () => {
  it('gives high score for strong match (title, skills, experience, location fit)', () => {
    const job: NormalizedJob = {
      title: 'Backend Engineer',
      company: 'Acme Corp',
      location: 'Hyderabad, India',
      remoteStatus: 'hybrid',
      employmentType: 'full-time',
      experienceMin: 1,
      experienceMax: 3,
      description: 'Building robust RESTful APIs in Node.js and TypeScript with PostgreSQL database.',
      requiredSkills: ['Node.js', 'TypeScript', 'PostgreSQL'],
      preferredSkills: ['REST APIs', 'Docker'],
    }

    const match = calculateMatch(job, mockProfile)

    expect(match.overallScore).toBeGreaterThanOrEqual(75)
    expect(match.recommendation).toBe('strong_match')
    expect(match.matchedSkills).toContain('Node.js')
    expect(match.matchedSkills).toContain('TypeScript')
    expect(match.matchedSkills).toContain('PostgreSQL')
    expect(match.missingSkills).toContain('Docker')
    expect(match.explanation).toContain('Backend Engineer')
  })

  it('correctly notes missing skills and experience gap for senior role', () => {
    const job: NormalizedJob = {
      title: 'Senior Distributed Systems Architect',
      company: 'Enterprise MegaCorp',
      location: 'Remote',
      remoteStatus: 'remote',
      employmentType: 'full-time',
      experienceMin: 8,
      experienceMax: 12,
      description: 'Architecting distributed consensus engines using Go, C++, and Kubernetes.',
      requiredSkills: ['Go', 'C++', 'Kubernetes', 'Raft'],
      preferredSkills: ['Rust'],
    }

    const match = calculateMatch(job, mockProfile)

    expect(match.overallScore).toBeLessThan(50)
    expect(match.recommendation).toBe('weak_match')
    expect(match.concerns.length).toBeGreaterThan(0)
    expect(match.missingSkills).toEqual(expect.arrayContaining(['Go', 'C++', 'Kubernetes', 'Raft']))
  })

  it('handles remote role matching preference correctly', () => {
    const job: NormalizedJob = {
      title: 'Full-Stack Engineer',
      company: 'Remote First Inc',
      location: 'Remote',
      remoteStatus: 'remote',
      employmentType: 'full-time',
      experienceMin: 0,
      experienceMax: 2,
      description: 'React and Node.js full-stack development.',
      requiredSkills: ['React', 'Node.js'],
      preferredSkills: [],
    }

    const match = calculateMatch(job, mockProfile)

    expect(match.locationScore).toBe(100)
    expect(match.overallScore).toBeGreaterThanOrEqual(75)
  })

  it('gracefully handles missing optional fields without crashing', () => {
    const job: NormalizedJob = {
      title: 'Software Developer',
      company: 'Stealth Startup',
      description: 'Looking for a general developer.',
      requiredSkills: [],
      preferredSkills: [],
      remoteStatus: 'unknown',
      employmentType: 'unknown',
    }

    const match = calculateMatch(job, mockProfile)

    expect(match.overallScore).toBeGreaterThanOrEqual(0)
    expect(match.overallScore).toBeLessThanOrEqual(100)
    expect(match.explanation).toBeDefined()
  })
})
