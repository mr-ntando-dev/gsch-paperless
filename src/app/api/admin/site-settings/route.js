import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession, isSuperAdmin } from '@/lib/auth'

// GET /api/admin/site-settings — public read (used by Sidebar/Header)
export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: 'singleton', siteName: 'MediFile', logoUrl: null }
      })
    }
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ siteName: 'MediFile', logoUrl: null })
  }
}

// PATCH /api/admin/site-settings — SUPERADMIN only
export async function PATCH(request) {
  try {
    const session = await getSession()
    if (!session || !isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized — SUPERADMIN only' }, { status: 403 })
    }

    const body = await request.json()
    const { siteName, logoUrl } = body

    const updateData = {}
    if (siteName !== undefined) updateData.siteName = siteName.trim() || 'MediFile'
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'singleton' },
      update: updateData,
      create: { id: 'singleton', siteName: updateData.siteName || 'MediFile', logoUrl: updateData.logoUrl || null },
    })

    // Audit log
    try {
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'UPDATE_SITE_SETTINGS',
          resource: 'SiteSettings',
          resourceId: 'singleton',
          details: { updatedFields: Object.keys(updateData) },
        }
      })
    } catch (_) {}

    return NextResponse.json(settings)
  } catch (error) {
    console.error('site-settings PATCH error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
