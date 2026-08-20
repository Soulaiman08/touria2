import { prisma } from '@/lib/prisma'

export interface CreateNotificationParams {
  type: 'ORDER' | 'CUSTOMER' | 'LOW_STOCK' | 'OUT_OF_STOCK'
  title: string
  description?: string
  targetUrl: string
  referenceId?: string
}

export const notificationService = {
  /**
   * Creates a notification with smart deduplication.
   * If a notification with the same referenceId exists in the last 24 hours, skips creation.
   */
  async createNotification(params: CreateNotificationParams) {
    if (params.referenceId) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const existing = await prisma.adminNotification.findFirst({
        where: {
          referenceId: params.referenceId,
          createdAt: { gte: oneDayAgo },
        },
      })
      if (existing) {
        return existing
      }
    }

    return await prisma.adminNotification.create({
      data: {
        type: params.type,
        title: params.title,
        description: params.description || null,
        targetUrl: params.targetUrl,
        referenceId: params.referenceId || null,
        isRead: false,
      },
    })
  },

  /**
   * Fetches recent notifications along with unread count.
   */
  async getNotifications(limit = 20) {
    const [notifications, unreadCount] = await Promise.all([
      prisma.adminNotification.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.adminNotification.count({
        where: { isRead: false },
      }),
    ])
    return { notifications, unreadCount }
  },

  /**
   * Marks a single notification as read.
   */
  async markAsRead(id: string) {
    return await prisma.adminNotification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    })
  },

  /**
   * Marks all unread notifications as read.
   */
  async markAllAsRead() {
    return await prisma.adminNotification.updateMany({
      where: { isRead: false },
      data: { isRead: true, readAt: new Date() },
    })
  },
}