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
  // Check if profile already exists
  const existingProfile = await prisma.userProfile.findFirst()
  if (existingProfile) {
    return { created: false, message: 'Profile already exists. Skipping seed.' }
  }

  // Create profile
  await prisma.userProfile.create({
    data: {
      name: 'Aravind Ankamalla',
      portfolioUrl: 'https://aravind-devspace.vercel.app/',
      githubUrl: 'https://github.com/AravindAnkamalla',
      linkedinUrl: 'https://www.linkedin.com/in/aravind-ankamalla-245a9023b/',
      bio: 'Software engineer with experience across full-stack development, backend APIs, database work, third-party integrations, and production debugging.',
    },
  })

  // Create career preferences
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

  // Create skills
  for (const skill of INITIAL_SKILLS) {
    await prisma.skill.upsert({
      where: { name_category: { name: skill.name, category: skill.category } },
      update: { proficiency: skill.proficiency },
      create: skill,
    })
  }

  return { created: true, message: 'Initial profile, preferences, and skills created successfully.' }
}
