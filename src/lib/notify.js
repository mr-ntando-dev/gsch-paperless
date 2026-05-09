/**
 * Notification helper — creates in-app notifications in the DB.
 * Call this from any API route after a meaningful action.
 */
import prisma from './prisma'

/**
 * Create a notification for a single user.
 * @param {object} opts
 * @param {string} opts.userId
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {string} opts.type  e.g. 'TASK' | 'DOCUMENT' | 'PATIENT' | 'SYSTEM'
 * @param {string} [opts.link]
 */
export async function notify({ userId, title, message, type, link }) {
  try {
    await prisma.notification.create({
      data: { userId, title, message, type, link: link || null },
    })
  } catch {
    // Never let notification errors bubble up and break the main action
  }
}

/**
 * Notify all active users in a department (by departmentId).
 * Skips the sender (excluderUserId).
 */
export async function notifyDept({ departmentId, excludeUserId, title, message, type, link }) {
  try {
    const users = await prisma.user.findMany({
      where: { departmentId, isActive: true, id: { not: excludeUserId } },
      select: { id: true },
    })
    if (!users.length) return
    await prisma.notification.createMany({
      data: users.map(u => ({ userId: u.id, title, message, type, link: link || null })),
    })
  } catch {}
}
