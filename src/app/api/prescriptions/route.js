import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get('patientId')
  const status = searchParams.get('status')
  const where = {}
  if (patientId) where.patientId = patientId
  if (status) where.status = status
  try {
    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        patient: { select: { id: true, patientId: true, firstName: true, lastName: true, allergies: true } },
        pharmacyItem: true,
        prescribedBy: { select: { id: true, name: true, role: true } },
        dispensedBy: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(prescriptions)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { patientId, pharmacyItemId, dosage, frequency, duration, route, quantity, notes, allergyChecked } = body
  if (!patientId || !pharmacyItemId || !dosage || !quantity) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  try {
    const prescription = await prisma.prescription.create({
      data: {
        patientId, pharmacyItemId,
        prescribedById: session.user.id,
        dosage, frequency: frequency || '', duration: duration || '',
        route: route || 'ORAL',
        quantity: parseInt(quantity),
        notes: notes || null,
        allergyChecked: allergyChecked || false
      },
      include: {
        patient: { select: { id: true, patientId: true, firstName: true, lastName: true, allergies: true } },
        pharmacyItem: true,
        prescribedBy: { select: { id: true, name: true } }
      }
    })
    return NextResponse.json(prescription, { status: 201 })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, action, ...rest } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const updateData = { ...rest }
  if (action === 'DISPENSE') {
    const prescription = await prisma.prescription.findUnique({
      where: { id }, include: { pharmacyItem: true }
    })
    if (!prescription) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (prescription.status === 'DISPENSED') return NextResponse.json({ error: 'Already dispensed' }, { status: 400 })
    if (prescription.pharmacyItem.stockLevel < prescription.quantity) {
      return NextResponse.json({ error: `Insufficient stock. Available: ${prescription.pharmacyItem.stockLevel}` }, { status: 400 })
    }
    // Deduct stock and mark dispensed in transaction
    await prisma.$transaction([
      prisma.pharmacyItem.update({ where: { id: prescription.pharmacyItemId }, data: { stockLevel: { decrement: prescription.quantity } } }),
      prisma.prescription.update({ where: { id }, data: { status: 'DISPENSED', dispensedById: session.user.id, dispensedAt: new Date() } })
    ])
    const updated = await prisma.prescription.findUnique({ where: { id }, include: { patient: { select: { id: true, patientId: true, firstName: true, lastName: true } }, pharmacyItem: true, prescribedBy: { select: { id: true, name: true } }, dispensedBy: { select: { id: true, name: true } } } })
    return NextResponse.json(updated)
  }
  if (action === 'CANCEL') updateData.status = 'CANCELLED'
  try {
    const updated = await prisma.prescription.update({ where: { id }, data: updateData, include: { pharmacyItem: true, prescribedBy: { select: { id: true, name: true } } } })
    return NextResponse.json(updated)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
