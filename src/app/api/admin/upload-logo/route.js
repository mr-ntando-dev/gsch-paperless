import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession, isSuperAdmin } from '@/lib/auth'

export const config = { api: { bodyParser: false } }

// POST /api/admin/upload-logo — SUPERADMIN only
// Accepts multipart/form-data with a "logo" file field
// Stores the image as a base64 data URL in the SiteSettings.logoUrl field
export async function POST(request) {
  try {
    const session = await getSession()
    if (!session || !isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized — SUPERADMIN only' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('logo')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No logo file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use PNG, JPG, GIF, WebP or SVG.' }, { status: 400 })
    }

    // Validate file size (max 2 MB)
    const MAX_SIZE = 2 * 1024 * 1024
    const arrayBuffer = await file.arrayBuffer()
    if (arrayBuffer.byteLength > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 2 MB.' }, { status: 400 })
    }

    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'singleton' },
      update: { logoUrl: dataUrl },
      create: { id: 'singleton', siteName: 'MediFile', logoUrl: dataUrl },
    })

    // Audit log
    try {
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'UPLOAD_LOGO',
          resource: 'SiteSettings',
          resourceId: 'singleton',
          details: { fileType: file.type, fileName: file.name },
        }
      })
    } catch (_) {}

    return NextResponse.json({ logoUrl: settings.logoUrl, message: 'Logo updated successfully' })
  } catch (error) {
    console.error('upload-logo POST error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
