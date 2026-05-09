import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const careType = searchParams.get('careType')
    const search = searchParams.get('search')
    // Only clinical/admin roles can access patient data
    const allowedDepts = ['PATIENT_CARE', 'CRD', 'MANAGEMENT', 'HOSPITAL_RELATIONS']
    const userDeptCode = session.user.departmentCode
    if (!['SUPERADMIN', 'ADMIN'].includes(session.user.role) && !allowedDepts.includes(userDeptCode)) {
      return NextResponse.json({ error: 'Access denied. Patient data is restricted to clinical departments.' }, { status: 403 })
    }

    const where = { isActive: true }
    if (careType) where.careType = careType
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { patientId: { contains: search, mode: 'insensitive' } },
        { guardianName: { contains: search, mode: 'insensitive' } },
      ]
    }
    const patients = await prisma.patient.findMany({
      where,
      include: {
        admissions: { orderBy: { createdAt: 'desc' }, take: 1 },
        observations: { where: { status: 'ACTIVE' }, take: 1 },
        dayCareRecords: { where: { status: 'CHECKED_IN' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(patients)
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { firstName, lastName, dateOfBirth, guardianName, guardianPhone, address, gender, bloodType, allergies, careType } = body
    const count = await prisma.patient.count()
    const patientId = `GSCH-${String(count + 1).padStart(5, '0')}`
    const patient = await prisma.patient.create({
      data: {
        patientId,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        guardianName,
        guardianPhone,
        address: address || '',
        gender: gender || 'UNKNOWN',
        bloodType: bloodType || null,
        allergies: allergies || null,
        careType: careType || 'OUTPATIENT',
      },
    })
    return NextResponse.json(patient, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
