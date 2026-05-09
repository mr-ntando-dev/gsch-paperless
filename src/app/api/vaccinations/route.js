import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const babyName = searchParams.get('babyName')
  const parentPhone = searchParams.get('parentPhone')
  const vaccine = searchParams.get('vaccine')
  const where = {}
  if (babyName) where.babyName = { contains: babyName, mode: 'insensitive' }
  if (parentPhone) where.parentPhone = { contains: parentPhone }
  if (vaccine) where.vaccine = { contains: vaccine, mode: 'insensitive' }
  try {
    const vax = await prisma.vaccination.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(vax)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const { babyName, dob, parentName, parentPhone, vaccine, dose, batchNo, site, givenBy, givenDate, nextDueDate, notes } = body
    if (!babyName || !vaccine || !givenBy || !givenDate) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    const vax = await prisma.vaccination.create({
      data: { babyName, dob: dob || '', parentName: parentName || '', parentPhone: parentPhone || '', vaccine, dose: dose || '1st', batchNo: batchNo || null, site: site || null, givenBy, givenDate, nextDueDate: nextDueDate || null, notes: notes || null }
    })
    return NextResponse.json(vax, { status: 201 })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id, ...updates } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const vax = await prisma.vaccination.update({ where: { id }, data: updates })
    return NextResponse.json(vax)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
