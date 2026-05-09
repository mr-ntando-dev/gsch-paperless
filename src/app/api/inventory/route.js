import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const condition = searchParams.get('condition')
    const search = searchParams.get('search')
    const where = { isActive: true }
    if (category) where.category = category
    if (condition) where.condition = condition
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { assetTag: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { assignedTo: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ]
    }
    const assets = await prisma.inventoryAsset.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(assets)
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const count = await prisma.inventoryAsset.count()
    const assetTag = body.assetTag || `ASSET-${String(count + 1).padStart(4, '0')}`
    const asset = await prisma.inventoryAsset.create({
      data: {
        assetTag,
        name: body.name,
        category: body.category || 'COMPUTER',
        brand: body.brand || null,
        model: body.model || null,
        serialNumber: body.serialNumber || null,
        location: body.location,
        assignedTo: body.assignedTo || null,
        condition: body.condition || 'GOOD',
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        warrantyExpiry: body.warrantyExpiry ? new Date(body.warrantyExpiry) : null,
        notes: body.notes || null,
      },
    })
    return NextResponse.json(asset, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    if (data.purchaseDate) data.purchaseDate = new Date(data.purchaseDate)
    if (data.warrantyExpiry) data.warrantyExpiry = new Date(data.warrantyExpiry)
    const asset = await prisma.inventoryAsset.update({ where: { id }, data })
    return NextResponse.json(asset)
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    await prisma.inventoryAsset.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
