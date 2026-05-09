import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()
    if (!q || q.length < 2) return NextResponse.json([])

    const mode = 'insensitive'

    const [patients, documents, tasks, maintenance, users] = await Promise.all([
      prisma.patient.findMany({
        where: {
          isActive: true,
          OR: [
            { firstName: { contains: q, mode } },
            { lastName: { contains: q, mode } },
            { patientId: { contains: q, mode } },
            { guardianName: { contains: q, mode } },
          ],
        },
        take: 5,
        select: { id: true, patientId: true, firstName: true, lastName: true, careType: true },
      }),
      prisma.document.findMany({
        where: {
          OR: [
            { title: { contains: q, mode } },
            { content: { contains: q, mode } },
          ],
        },
        take: 5,
        select: { id: true, title: true, status: true, type: true, createdAt: true },
      }),
      prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: q, mode } },
            { description: { contains: q, mode } },
          ],
        },
        take: 5,
        select: { id: true, title: true, status: true, priority: true },
      }),
      prisma.maintenanceRequest.findMany({
        where: {
          OR: [
            { title: { contains: q, mode } },
            { description: { contains: q, mode } },
            { location: { contains: q, mode } },
          ],
        },
        take: 5,
        select: { id: true, title: true, status: true, location: true, priority: true },
      }),
      prisma.user.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q, mode } },
            { email: { contains: q, mode } },
          ],
        },
        take: 5,
        select: { id: true, name: true, email: true, role: true },
      }),
    ])

    const results = [
      ...patients.map(p => ({ type: 'Patient', label: `${p.firstName} ${p.lastName}`, sub: p.patientId, href: '/dashboard/patients', id: p.id })),
      ...documents.map(d => ({ type: 'Document', label: d.title, sub: d.status, href: '/dashboard/documents', id: d.id })),
      ...tasks.map(t => ({ type: 'Task', label: t.title, sub: t.status, href: '/dashboard/tasks', id: t.id })),
      ...maintenance.map(m => ({ type: 'Maintenance', label: m.title, sub: m.location, href: '/dashboard/maintenance', id: m.id })),
      ...users.map(u => ({ type: 'User', label: u.name, sub: u.email, href: '/dashboard/users', id: u.id })),
    ]

    return NextResponse.json(results)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
