import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const admissionId = searchParams.get('admissionId')
  if (!admissionId) return NextResponse.json({ error: 'admissionId required' }, { status: 400 })
  try {
    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
      include: {
        patient: true
      }
    })
    if (!admission) return NextResponse.json({ error: 'Admission not found' }, { status: 404 })

    // Fetch linked data
    const [medications, observations, vitals] = await Promise.all([
      prisma.medication.findMany({ where: { patientId: admission.patientId }, orderBy: { createdAt: 'asc' } }),
      prisma.observation.findMany({ where: { patientId: admission.patientId }, orderBy: { startDate: 'asc' } }),
    ])

    return NextResponse.json({ admission, medications, observations })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
