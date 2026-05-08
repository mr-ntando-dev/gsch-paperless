import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(request, { params }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { status } = body

    if (!['PENDING', 'ACKNOWLEDGED', 'ACTIONED', 'RETURNED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const route = await prisma.documentRoute.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === 'ACKNOWLEDGED' ? { acknowledgedAt: new Date() } : {}),
        // updatedAt is handled automatically by @updatedAt in the schema
      }
    })

    return NextResponse.json(route)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
