import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const DEFAULT_TRACKS = [
  {
    name: 'Node.js & TypeScript Backend Engineering',
    category: 'backend',
    description: 'Event loop mechanics, worker threads, async streams, middleware architecture, and robust typing.',
    items: [
      { title: 'Event Loop & Libuv execution phases deep dive', type: 'concept', difficulty: 'intermediate' },
      { title: 'Build a bounded streaming file upload handler', type: 'exercise', difficulty: 'intermediate' },
      { title: 'Implement custom rate limiting with sliding window', type: 'exercise', difficulty: 'advanced' },
    ],
  },
  {
    name: 'PostgreSQL, SQL & Data Modeling',
    category: 'database',
    description: 'Relational schema design, indexes (B-Tree, GIN), EXPLAIN ANALYZE, transaction isolation, and query tuning.',
    items: [
      { title: 'Analyze slow queries with EXPLAIN (ANALYZE, BUFFERS)', type: 'exercise', difficulty: 'intermediate' },
      { title: 'Understand transaction isolation levels & race conditions', type: 'concept', difficulty: 'intermediate' },
      { title: 'Design an idempotent deduplication schema', type: 'project', difficulty: 'advanced' },
    ],
  },
  {
    name: 'API Design, Webhooks & Reliability',
    category: 'api',
    description: 'REST & GraphQL contract design, OAuth2 / JWT authentication, webhook signatures, and retry backoffs.',
    items: [
      { title: 'Design idempotent POST APIs using Idempotency-Key headers', type: 'exercise', difficulty: 'intermediate' },
      { title: 'Implement HMAC webhook signature verification', type: 'exercise', difficulty: 'intermediate' },
      { title: 'API versioning and breaking change migration strategies', type: 'concept', difficulty: 'intermediate' },
    ],
  },
  {
    name: 'System Design & Distributed Systems',
    category: 'system_design',
    description: 'Scalability fundamentals, caching strategies (Redis), message queues, consensus, and horizontal scaling.',
    items: [
      { title: 'Design a distributed rate limiter (Token Bucket vs Leaky Bucket)', type: 'concept', difficulty: 'advanced' },
      { title: 'Design a background job queue with retry & dead-letter queue', type: 'exercise', difficulty: 'advanced' },
      { title: 'Cache invalidation patterns (Write-Through vs Cache-Aside)', type: 'concept', difficulty: 'intermediate' },
    ],
  },
  {
    name: 'DSA in Java',
    category: 'dsa',
    description: 'Core patterns in Java: Two Pointers, Sliding Window, Trees, Graphs, and Dynamic Programming.',
    items: [
      { title: 'Two Pointers & Sliding Window mastery (10 problems)', type: 'practice', difficulty: 'medium' },
      { title: 'Binary Tree traversals (BFS, DFS, Lowest Common Ancestor)', type: 'practice', difficulty: 'medium' },
      { title: 'Graph cycle detection and Topological Sort in Java', type: 'practice', difficulty: 'hard' },
    ],
  },
  {
    name: 'Forward Deployed Engineering (FDE)',
    category: 'fde',
    description: 'Customer problem discovery, complex data integrations, production debugging under pressure, and rapid prototyping.',
    items: [
      { title: 'Integrate a flaky external API with circuit breaker pattern', type: 'project', difficulty: 'advanced' },
      { title: 'Customer API troubleshooting runbook and triage workflow', type: 'concept', difficulty: 'intermediate' },
      { title: 'Build a live integration monitoring and sync health dashboard', type: 'project', difficulty: 'advanced' },
    ],
  },
]

export async function GET() {
  try {
    const existing = await prisma.learningTrack.findMany({
      include: {
        items: true,
      },
      orderBy: { order: 'asc' },
    })

    if (existing.length > 0) {
      return NextResponse.json({ tracks: existing })
    }

    // Seed default tracks if empty
    const tracks = []
    for (let i = 0; i < DEFAULT_TRACKS.length; i++) {
      const dt = DEFAULT_TRACKS[i]
      const created = await prisma.learningTrack.create({
        data: {
          name: dt.name,
          category: dt.category,
          description: dt.description,
          order: i,
          items: {
            create: dt.items.map((it, idx) => ({
              title: it.title,
              type: it.type,
              difficulty: it.difficulty,
              order: idx,
            })),
          },
        },
        include: { items: true },
      })
      tracks.push(created)
    }

    return NextResponse.json({ tracks })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { itemId, status } = await request.json()
    const updated = await prisma.learningItem.update({
      where: { id: itemId },
      data: {
        status,
        completedAt: status === 'completed' ? new Date() : null,
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
