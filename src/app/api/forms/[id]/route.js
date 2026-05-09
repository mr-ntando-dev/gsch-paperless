import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// SUPERADMIN: update any forms record
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'SUPERADMIN') return NextResponse.json({ error: 'Forbidden – SUPERADMIN only' }, { status: 403 })
  try {
    const body = await req.json()
    const updated = await prisma.form.update({
      where: { id: params.id },
      data: body,
    })
    // Audit
    try {
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'SUPERADMIN_UPDATE_FORM',
          resource: 'Form',
          resourceId: params.id,
          details: { updatedFields: Object.keys(body) },
        }
      })
    } catch (_) {}
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// SUPERADMIN: permanently delete any forms record
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'SUPERADMIN') return NextResponse.json({ error: 'Forbidden – SUPERADMIN only' }, { status: 403 })
  try {
    await prisma.form.delete({ where: { id: params.id } })
    // Audit
    try {
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'SUPERADMIN_DELETE_FORM',
          resource: 'Form',
          resourceId: params.id,
        }
      })
    } catch (_) {}
    return NextResponse.json({ message: 'Form deleted' })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
