/**
 * API Route: POST /api/seed
 * 
 * Seeds initial profile data. Safe to call multiple times.
 */

import { NextResponse } from 'next/server'
import { seedInitialProfile } from '@/lib/services/seed'

export async function POST() {
  try {
    const result = await seedInitialProfile()
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
