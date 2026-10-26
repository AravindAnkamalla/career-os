/**
 * Fixture Job Provider
 * 
 * Provides clearly-labeled development/test data when no live API is configured.
 * This is NOT mock data pretending to be live — it's explicitly fixture data
 * for development and testing purposes.
 * 
 * Every job from this provider is marked with source "fixture" and carries
 * a clear label in the UI.
 */

import type { JobProvider, JobProviderConfig, JobSearchParams, JobSearchResult, NormalizedJob } from '@/lib/types/job'

const FIXTURE_JOBS: NormalizedJob[] = [
  {
    externalId: 'fixture-001',
    title: 'Backend Engineer',
    company: 'TechCorp Solutions',
    location: 'Hyderabad, Telangana, India',
    remoteStatus: 'hybrid',
    employmentType: 'full-time',
    experienceMin: 1,
    experienceMax: 3,
    description: `We are looking for a Backend Engineer to join our platform team. You will work on building scalable APIs, database optimization, and third-party integrations.

Responsibilities:
- Design and implement RESTful APIs using Node.js and TypeScript
- Write and optimize PostgreSQL queries
- Build integration pipelines with external services
- Participate in code reviews and system design discussions
- Monitor and improve application performance

Requirements:
- 1-3 years of experience in backend development
- Strong knowledge of Node.js and TypeScript
- Experience with PostgreSQL and SQL
- Familiarity with REST API design
- Understanding of authentication and authorization patterns`,
    requiredSkills: ['Node.js', 'TypeScript', 'PostgreSQL', 'REST APIs'],
    preferredSkills: ['Docker', 'AWS', 'GraphQL', 'Redis'],
    salaryMin: 800000,
    salaryMax: 1500000,
    salaryCurrency: 'INR',
    salaryPeriod: 'yearly',
    applicationUrl: 'https://example.com/apply/fixture-001',
    postingUrl: 'https://example.com/jobs/fixture-001',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    externalId: 'fixture-002',
    title: 'Full Stack Engineer',
    company: 'StartupHub India',
    location: 'Bengaluru, Karnataka, India',
    remoteStatus: 'remote',
    employmentType: 'full-time',
    experienceMin: 0,
    experienceMax: 2,
    description: `Join our fast-growing startup as a Full Stack Engineer. Work directly with the founding team to build customer-facing features and internal tools.

Responsibilities:
- Build and maintain web applications using React and Next.js
- Develop backend services with Node.js
- Collaborate with product and design teams
- Deploy and monitor applications on AWS

Requirements:
- 0-2 years of experience in full-stack development
- Proficiency in React and TypeScript
- Backend experience with Node.js or similar
- Familiarity with SQL databases
- Good communication skills`,
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'SQL'],
    preferredSkills: ['Next.js', 'Tailwind CSS', 'AWS', 'Prisma'],
    salaryMin: 600000,
    salaryMax: 1200000,
    salaryCurrency: 'INR',
    salaryPeriod: 'yearly',
    applicationUrl: 'https://example.com/apply/fixture-002',
    postingUrl: 'https://example.com/jobs/fixture-002',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    externalId: 'fixture-003',
    title: 'Forward Deployed Engineer',
    company: 'DataPlatform Inc',
    location: 'Remote, India',
    remoteStatus: 'remote',
    employmentType: 'full-time',
    experienceMin: 1,
    experienceMax: 4,
    description: `We're hiring a Forward Deployed Engineer to work directly with our enterprise customers. You'll solve complex data integration problems, build custom solutions, and act as the technical bridge between our product and our customers' needs.

Responsibilities:
- Work onsite or remotely with enterprise customers
- Diagnose and solve complex integration problems
- Build custom data pipelines and workflows
- Translate customer requirements into technical solutions
- Contribute improvements back to the core product
- Debug production issues under time pressure

Requirements:
- 1-4 years of software engineering experience
- Strong problem-solving and debugging skills
- Experience with APIs, databases, and data pipelines
- Excellent communication skills
- Comfortable working directly with customers
- Willingness to travel occasionally`,
    requiredSkills: ['APIs', 'SQL', 'Problem Solving', 'Communication'],
    preferredSkills: ['Python', 'Node.js', 'Data Pipelines', 'AWS', 'TypeScript'],
    salaryMin: 1000000,
    salaryMax: 2000000,
    salaryCurrency: 'INR',
    salaryPeriod: 'yearly',
    applicationUrl: 'https://example.com/apply/fixture-003',
    postingUrl: 'https://example.com/jobs/fixture-003',
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    externalId: 'fixture-004',
    title: 'Software Engineer II',
    company: 'CloudScale Technologies',
    location: 'Hyderabad, Telangana, India',
    remoteStatus: 'hybrid',
    employmentType: 'full-time',
    experienceMin: 2,
    experienceMax: 5,
    description: `Software Engineer II for our cloud infrastructure team. Build and maintain microservices that power our platform.

Requirements:
- 2-5 years of experience
- Java or Go proficiency
- Experience with Kubernetes and Docker
- Strong understanding of distributed systems
- Experience with CI/CD pipelines`,
    requiredSkills: ['Java', 'Kubernetes', 'Docker', 'Distributed Systems'],
    preferredSkills: ['Go', 'Terraform', 'gRPC', 'Kafka'],
    salaryMin: 1200000,
    salaryMax: 2500000,
    salaryCurrency: 'INR',
    salaryPeriod: 'yearly',
    applicationUrl: 'https://example.com/apply/fixture-004',
    postingUrl: 'https://example.com/jobs/fixture-004',
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    externalId: 'fixture-005',
    title: 'Senior Backend Engineer',
    company: 'FinTech Global',
    location: 'Bengaluru, Karnataka, India',
    remoteStatus: 'onsite',
    employmentType: 'full-time',
    experienceMin: 5,
    experienceMax: 8,
    description: `Senior Backend Engineer for our payments team. Lead the design and implementation of our core transaction processing system.

Requirements:
- 5-8 years of backend development experience
- Expert-level Java or Python
- Deep knowledge of database internals
- Experience with high-throughput systems
- Strong system design skills`,
    requiredSkills: ['Java', 'Python', 'System Design', 'Database Internals'],
    preferredSkills: ['Kafka', 'Redis', 'PostgreSQL', 'Microservices'],
    salaryMin: 3000000,
    salaryMax: 5000000,
    salaryCurrency: 'INR',
    salaryPeriod: 'yearly',
    applicationUrl: 'https://example.com/apply/fixture-005',
    postingUrl: 'https://example.com/jobs/fixture-005',
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    externalId: 'fixture-006',
    title: 'Backend Developer - Node.js',
    company: 'EduTech Solutions',
    location: 'Remote',
    remoteStatus: 'remote',
    employmentType: 'full-time',
    experienceMin: 1,
    experienceMax: 3,
    description: `Backend developer to build and maintain our learning management platform APIs.

Responsibilities:
- Build RESTful and GraphQL APIs
- Design database schemas
- Implement authentication and authorization
- Write automated tests
- Deploy to AWS

Requirements:
- 1-3 years experience with Node.js
- TypeScript proficiency
- PostgreSQL experience
- Understanding of API security
- Experience with Express.js or similar frameworks`,
    requiredSkills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Express.js'],
    preferredSkills: ['GraphQL', 'AWS', 'Testing', 'Docker'],
    salaryMin: 700000,
    salaryMax: 1400000,
    salaryCurrency: 'INR',
    salaryPeriod: 'yearly',
    applicationUrl: 'https://example.com/apply/fixture-006',
    postingUrl: 'https://example.com/jobs/fixture-006',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    externalId: 'fixture-007',
    title: 'React Developer',
    company: 'DesignStudio Co',
    location: 'Mumbai, Maharashtra, India',
    remoteStatus: 'onsite',
    employmentType: 'full-time',
    experienceMin: 1,
    experienceMax: 3,
    description: `Frontend React developer for our design tools platform.

Requirements:
- 1-3 years experience with React
- TypeScript proficiency
- Experience with state management
- CSS/Tailwind CSS skills
- Understanding of responsive design`,
    requiredSkills: ['React', 'TypeScript', 'CSS', 'Responsive Design'],
    preferredSkills: ['Next.js', 'Tailwind CSS', 'Figma', 'Testing'],
    applicationUrl: 'https://example.com/apply/fixture-007',
    postingUrl: 'https://example.com/jobs/fixture-007',
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    externalId: 'fixture-008',
    title: 'Software Engineer - API Platform',
    company: 'PaymentsTech',
    location: 'Hyderabad, India',
    remoteStatus: 'hybrid',
    employmentType: 'full-time',
    experienceMin: 1,
    experienceMax: 3,
    description: `Join our API platform team to build reliable, developer-friendly APIs for our payments infrastructure.

Responsibilities:
- Design and build public-facing APIs
- Write comprehensive API documentation
- Implement rate limiting, auth, and versioning
- Ensure API reliability and performance
- Work with external partners on integrations

Requirements:
- 1-3 years of backend experience
- Node.js or Python proficiency
- Strong understanding of REST API design principles
- Experience with API security (OAuth2, API keys)
- PostgreSQL or similar RDBMS experience`,
    requiredSkills: ['Node.js', 'REST APIs', 'PostgreSQL', 'API Security'],
    preferredSkills: ['TypeScript', 'OpenAPI', 'Docker', 'CI/CD'],
    salaryMin: 900000,
    salaryMax: 1600000,
    salaryCurrency: 'INR',
    salaryPeriod: 'yearly',
    applicationUrl: 'https://example.com/apply/fixture-008',
    postingUrl: 'https://example.com/jobs/fixture-008',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
]

export class FixtureProvider implements JobProvider {
  readonly name = 'fixture'
  readonly type = 'fixture' as const

  isConfigured(): boolean {
    return true // Always available
  }

  getConfig(): JobProviderConfig {
    return {
      name: this.name,
      type: this.type,
      isConfigured: true,
      rateLimitInfo: 'Development fixture — no rate limits. Data is clearly labeled as non-live.',
    }
  }

  async search(params: JobSearchParams): Promise<JobSearchResult> {
    let filtered = [...FIXTURE_JOBS]

    // Apply basic filtering
    if (params.query) {
      const q = params.query.toLowerCase()
      filtered = filtered.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.requiredSkills.some(s => s.toLowerCase().includes(q)) ||
        j.preferredSkills.some(s => s.toLowerCase().includes(q))
      )
    }

    if (params.location) {
      const loc = params.location.toLowerCase()
      filtered = filtered.filter(j =>
        j.location?.toLowerCase().includes(loc) ||
        j.remoteStatus === 'remote'
      )
    }

    if (params.remoteOnly) {
      filtered = filtered.filter(j => j.remoteStatus === 'remote')
    }

    // Paginate
    const page = params.page ?? 1
    const pageSize = 10
    const start = (page - 1) * pageSize
    const paged = filtered.slice(start, start + pageSize)

    return {
      jobs: paged,
      totalFound: filtered.length,
      page,
      hasMore: start + pageSize < filtered.length,
      source: this.name,
    }
  }

  async testConnection(): Promise<{ ok: boolean; message: string }> {
    return {
      ok: true,
      message: `Fixture provider is active with ${FIXTURE_JOBS.length} development jobs. These are clearly labeled as fixture data — not live job postings.`,
    }
  }
}
