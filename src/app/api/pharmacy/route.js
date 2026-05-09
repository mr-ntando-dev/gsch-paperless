import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only clinical/admin roles can access pharmacy data
  const allowedDepts = ['PATIENT_CARE', 'CRD', 'MANAGEMENT']
  const userDeptCode = session.user.departmentCode
  if (!['SUPERADMIN', 'ADMIN'].includes(session.user.role) && !allowedDepts.includes(userDeptCode)) {
    return NextResponse.json({ error: 'Access denied. Pharmacy data is restricted to clinical departments.' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const lowStock = searchParams.get('lowStock') === 'true'
  const search = searchParams.get('search')
  const where = { isActive: true }
  if (category) where.category = category
  if (lowStock) where.stockLevel = { lte: prisma.pharmacyItem.fields?.reorderLevel }
  if (search) where.name = { contains: search, mode: 'insensitive' }
  try {
    const items = await prisma.pharmacyItem.findMany({
      where,
      include: { _count: { select: { prescriptions: true } } },
      orderBy: { name: 'asc' }
    })
    // Flag low stock manually
    const enriched = items.map(i => ({ ...i, isLowStock: i.stockLevel <= i.reorderLevel }))
    return NextResponse.json(enriched)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['SUPERADMIN', 'ADMIN', 'MANAGER'].includes(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const { name, genericName, category, unit, stockLevel, reorderLevel, expiryDate, batchNumber, supplier, unitCost } = body
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  try {
    const item = await prisma.pharmacyItem.create({
      data: {
        name, genericName: genericName || null,
        category: category || 'MEDICATION',
        unit: unit || 'tablet',
        stockLevel: parseInt(stockLevel) || 0,
        reorderLevel: parseInt(reorderLevel) || 10,
        expiryDate: expiryDate || null,
        batchNumber: batchNumber || null,
        supplier: supplier || null,
        unitCost: unitCost ? parseFloat(unitCost) : null
      }
    })
    return NextResponse.json(item, { status: 201 })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['SUPERADMIN', 'ADMIN', 'MANAGER'].includes(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, stockAdjust, ...rest } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const updateData = { ...rest }
  if (typeof stockAdjust === 'number') {
    const current = await prisma.pharmacyItem.findUnique({ where: { id }, select: { stockLevel: true } })
    updateData.stockLevel = Math.max(0, (current?.stockLevel || 0) + stockAdjust)
  }
  try {
    const item = await prisma.pharmacyItem.update({ where: { id }, data: updateData })
    return NextResponse.json(item)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['SUPERADMIN', 'ADMIN'].includes(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  try {
    await prisma.pharmacyItem.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
