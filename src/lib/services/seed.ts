/**
 * Seed Service — Sets up initial profile data
 */

import { prisma } from '@/lib/db'

const INITIAL_SKILLS = [
  // Backend
  { name: 'Node.js', category: 'Backend', proficiency: 3 },
  { name: 'TypeScript', category: 'Backend', proficiency: 3 },
  { name: 'JavaScript', category: 'Backend', proficiency: 4 },
  { name: 'Express.js', category: 'Backend', proficiency: 3 },
  { name: 'REST APIs', category: 'Backend', proficiency: 3 },
  { name: 'GraphQL', category: 'Backend', proficiency: 2 },
  { name: 'Authentication', category: 'Backend', proficiency: 3 },
  { name: 'Webhooks', category: 'Backend', proficiency: 2 },
  { name: 'Background Jobs', category: 'Backend', proficiency: 2 },
  // Database
  { name: 'PostgreSQL', category: 'Database', proficiency: 3 },
  { name: 'SQL', category: 'Database', proficiency: 3 },
  { name: 'Prisma', category: 'Database', proficiency: 3 },
  { name: 'Query Optimization', category: 'Database', proficiency: 2 },
  // Frontend
  { name: 'React', category: 'Frontend', proficiency: 4 },
  { name: 'Next.js', category: 'Frontend', proficiency: 3 },
  { name: 'React Native', category: 'Frontend', proficiency: 2 },
  { name: 'Tailwind CSS', category: 'Frontend', proficiency: 3 },
  { name: 'Zustand', category: 'Frontend', proficiency: 2 },
  { name: 'TanStack Query', category: 'Frontend', proficiency: 2 },
  { name: 'Apollo Client', category: 'Frontend', proficiency: 2 },
  // Cloud
  { name: 'AWS Lambda', category: 'Cloud', proficiency: 2 },
  { name: 'AWS API Gateway', category: 'Cloud', proficiency: 2 },
  { name: 'AWS AppSync', category: 'Cloud', proficiency: 2 },
  { name: 'SST/CDK', category: 'Cloud', proficiency: 2 },
  // Tools
  { name: 'Git', category: 'Tools', proficiency: 4 },
  { name: 'GitHub', category: 'Tools', proficiency: 4 },
  { name: 'Testing', category: 'Tools', proficiency: 2 },
  { name: 'Debugging', category: 'Tools', proficiency: 3 },
]

export async function seedInitialProfile(): Promise<{ created: boolean; message: string }> {
  // Create profile if missing
  const existingProfile = await prisma.userProfile.findFirst()
  if (!existingProfile) {
    await prisma.userProfile.create({
      data: {
        name: 'Aravind Ankamalla',
        portfolioUrl: 'https://aravind-devspace.vercel.app/',
        githubUrl: 'https://github.com/AravindAnkamalla',
        linkedinUrl: 'https://www.linkedin.com/in/aravind-ankamalla-245a9023b/',
        bio: 'Software engineer with experience across full-stack development, backend APIs, database work, third-party integrations, and production debugging.',
      },
    })
  }

  // Create career preferences if missing
  const existingPrefs = await prisma.careerPreference.findFirst()
  if (!existingPrefs) {
    await prisma.careerPreference.create({
      data: {
        targetRoles: JSON.stringify(['Backend Engineer', 'Forward Deployed Engineer', 'Full-Stack Engineer', 'Software Engineer']),
        preferredLocations: JSON.stringify(['Hyderabad', 'Bengaluru']),
        remotePreference: 'any',
        minExperience: 0,
        maxExperience: 3,
        preferredStack: JSON.stringify(['Node.js', 'TypeScript']),
        salaryCurrency: 'INR',
      },
    })
  }

  // Create skills
  for (const skill of INITIAL_SKILLS) {
    await prisma.skill.upsert({
      where: { name_category: { name: skill.name, category: skill.category } },
      update: { proficiency: skill.proficiency },
      create: skill,
    })
  }

  // Create initial projects
  const INITIAL_PROJECTS = [
    {
      name: 'Event Management System',
      description: 'End-to-end event discovery, registration, and ticketing platform with automated workflows.',
      repoUrl: 'https://github.com/AravindAnkamalla',
      liveUrl: 'https://aravind-devspace.vercel.app/',
      techStack: JSON.stringify(['Node.js', 'TypeScript', 'Next.js', 'PostgreSQL', 'Prisma', 'Tailwind CSS']),
      problemSolved: 'Streamlines event scheduling, attendee registrations, and email confirmation dispatch without race conditions.',
      architecture: 'Next.js App Router full-stack architecture with Prisma ORM and relational schema design.',
      features: JSON.stringify(['Event creation & management', 'Attendee registration', 'Ticket issuance', 'Search & categorization']),
      challenges: JSON.stringify(['Concurrency control on limited ticket inventories', 'Database query optimization']),
      status: 'active',
    },
    {
      name: 'Dealership Management System Integrations',
      description: 'Software workflows and third-party integration pipelines for dealership management operations.',
      repoUrl: 'https://github.com/AravindAnkamalla',
      techStack: JSON.stringify(['Node.js', 'TypeScript', 'REST APIs', 'PostgreSQL', 'Webhooks']),
      problemSolved: 'Automated bi-directional data synchronization between external DMS platforms and internal inventory pipelines.',
      architecture: 'Event-driven webhook ingest service with bounded retries, idempotency keys, and failure observability.',
      features: JSON.stringify(['Automated vehicle inventory sync', 'Customer lead processing', 'Webhook delivery verification']),
      challenges: JSON.stringify(['Handling flaky third-party partner APIs', 'Data schema transformation across heterogeneous systems']),
      status: 'completed',
    },
    {
      name: 'B2B Healthcare Benefits Platform',
      description: 'Enterprise healthcare benefits platform supporting employee enrollments and policy management.',
      repoUrl: 'https://github.com/AravindAnkamalla',
      techStack: JSON.stringify(['Node.js', 'Express.js', 'GraphQL', 'AWS Lambda', 'PostgreSQL']),
      problemSolved: 'Reduced manual administrative overhead for corporate employee insurance and wellness benefits enrollment.',
      architecture: 'Microservices with GraphQL API gateway and role-based access control.',
      features: JSON.stringify(['Employee benefits portal', 'Policy claim workflows', 'Role-based authorization']),
      challenges: JSON.stringify(['Strict data privacy and HIPAA-aligned security', 'Complex policy calculation rules']),
      status: 'completed',
    },
  ]

  for (const proj of INITIAL_PROJECTS) {
    await prisma.project.upsert({
      where: { name: proj.name },
      update: {},
      create: proj,
    })
  }

  return { created: true, message: 'Initial profile, preferences, skills, and projects created successfully.' }
}
