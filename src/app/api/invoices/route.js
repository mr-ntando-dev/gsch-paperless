import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // Only billing/admin roles can access invoice data
    const allowedDepts = ['BILLING', 'ACCOUNTS', 'MANAGEMENT']
    const userDeptCode = session.user.departmentCode
    if (!['SUPERADMIN', 'ADMIN'].includes(session.user.role) && !allowedDepts.includes(userDeptCode)) {
      return NextResponse.json({ error: 'Access denied. Invoice data is restricted to billing and finance departments.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const patientId = searchParams.get('patientId')
    const where = {}
    if (status) where.status = status
    if (patientId) where.patientId = patientId
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        patient: { select: { id: true, patientId: true, firstName: true, lastName: true } },
        lineItems: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(invoices)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { patientId, admissionId, dueDate, notes, lineItems } = body
    if (!patientId || !lineItems || lineItems.length === 0)
      return NextResponse.json({ error: 'Patient and at least one line item required' }, { status: 400 })

    const count = await prisma.invoice.count()
    const invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`
    const totalAmount = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        patientId,
        admissionId: admissionId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes || null,
        totalAmount,
        createdBy: session.user.name || session.user.email,
        lineItems: {
          create: lineItems.map(item => ({
            description: item.description,
            quantity: parseFloat(item.quantity) || 1,
            unitPrice: parseFloat(item.unitPrice) || 0,
            total: (parseFloat(item.quantity) || 1) * (parseFloat(item.unitPrice) || 0),
            category: item.category || 'GENERAL',
          })),
        },
      },
      include: { patient: true, lineItems: true },
    })
    return NextResponse.json(invoice, { status: 201 })
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
    const { id, status, paidAmount } = body
    if (!id) return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 })

    const existing = await prisma.invoice.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updateData = {}
    if (status) updateData.status = status
    if (paidAmount !== undefined) {
      updateData.paidAmount = parseFloat(paidAmount)
      if (parseFloat(paidAmount) >= existing.totalAmount) {
        updateData.status = 'PAID'
        updateData.paidAt = new Date()
      } else if (parseFloat(paidAmount) > 0) {
        updateData.status = 'PARTIAL'
      }
    }
    if (status === 'PAID' && !updateData.paidAt) updateData.paidAt = new Date()

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: { patient: true, lineItems: true },
    })
    return NextResponse.json(invoice)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
