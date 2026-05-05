import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'unknown',
  }

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    health.database = 'connected'
  } catch (error) {
    health.status = 'degraded'
    health.database = 'disconnected'
    health.dbError = error.message
  }

  const statusCode = health.status === 'ok' ? 200 : 503
  return NextResponse.json(health, { status: statusCode })
}
