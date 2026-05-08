import { NextResponse } from 'next/server'

// Self-registration is disabled. User accounts are created by administrators only.
export async function POST() {
  return NextResponse.json(
    { error: 'Registration is not available. Please contact your administrator.' },
    { status: 403 }
  )
}
