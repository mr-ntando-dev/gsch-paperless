import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { id, vitals } = body
    if (!id) return NextResponse.json({ error: 'Observation ID required' }, { status: 400 })

    const obs = await prisma.observation.findUnique({ where: { id } })
    if (!obs) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Append new reading to existing vitals array
    const existing = Array.isArray(obs.vitals) ? obs.vitals : []
    const newReading = {
      ...vitals,
      recordedAt: new Date().toISOString(),
      recordedBy: session.user.name || session.user.email,
    }
    const updated = await prisma.observation.update({
      where: { id },
      data: { vitals: [...existing, newReading] },
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
