import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const deptId = searchParams.get('departmentId')
    const status = searchParams.get('status')

    const where = {}
    if (deptId) where.departmentId = deptId
    if (status) where.status = status

    if (!['SUPERADMIN','ADMIN','MANAGER'].includes(session.user.role)) {
      where.departmentId = session.user.departmentId
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        author: { select: { name: true } },
        department: { select: { name: true, code: true } }
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(documents)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { title, content, type, departmentId, priority, tags } = body

    const document = await prisma.document.create({
      data: {
        title,
        content,
        type: type || 'General',
        departmentId: departmentId || session.user.departmentId,
        priority: priority || 'MEDIUM',
        tags: tags || [],
        authorId: session.user.id,
        versionHistory: [{ version: 1, content, title, editedBy: session.user.name, editedAt: new Date().toISOString(), note: 'Initial version' }],
      },
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { id, title, content, status, priority, note } = body
    if (!id) return NextResponse.json({ error: 'Document ID required' }, { status: 400 })

    const existing = await prisma.document.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updateData = {}
    if (status) updateData.status = status
    if (priority) updateData.priority = priority

    // If content or title changed, bump version
    if (content && content !== existing.content || title && title !== existing.title) {
      const prevHistory = Array.isArray(existing.versionHistory) ? existing.versionHistory : []
      const newVersion = existing.version + 1
      updateData.version = newVersion
      if (content) updateData.content = content
      if (title) updateData.title = title
      updateData.versionHistory = [
        ...prevHistory,
        {
          version: newVersion,
          content: content || existing.content,
          title: title || existing.title,
          editedBy: session.user.name,
          editedAt: new Date().toISOString(),
          note: note || `Version ${newVersion}`,
        },
      ]
    }

    const document = await prisma.document.update({
      where: { id },
      data: updateData,
      include: { author: { select: { name: true } }, department: { select: { name: true } } },
    })
    return NextResponse.json(document)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
