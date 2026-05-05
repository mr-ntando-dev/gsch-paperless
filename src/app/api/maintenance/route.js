import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requests = await prisma.maintenanceRequest.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(requests)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, location, priority } = body

    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        title,
        description,
        location,
        priority: priority || 'MEDIUM',
        requestedBy: session.user.name,
      },
    })

    return NextResponse.json(maintenanceRequest, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
