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
    try {
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
    } catch (error) {
      console.error('[NotificationService] Failed to create notification:', error)
      return null
    }
  },

  /**
   * Fetches recent notifications (default: 20) along with unread count.
   */
  async getNotifications(limit = 20) {
    try {
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
    } catch (error) {
      console.error('[NotificationService] Failed to fetch notifications:', error)
      return { notifications: [], unreadCount: 0 }
    }
  },

  /**
   * Marks a single notification as read.
   */
  async markAsRead(id: string) {
    try {
      return await prisma.adminNotification.update({
        where: { id },
        data: { isRead: true, readAt: new Date() },
      })
    } catch (error) {
      console.error('[NotificationService] Failed to mark notification as read:', error)
      return null
    }
  },

  /**
   * Marks all unread notifications as read.
   */
  async markAllAsRead() {
    try {
      return await prisma.adminNotification.updateMany({
        where: { isRead: false },
        data: { isRead: true, readAt: new Date() },
      })
    } catch (error) {
      console.error('[NotificationService] Failed to mark all as read:', error)
      return null
    }
  },
}
