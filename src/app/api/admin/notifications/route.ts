import { NextResponse } from 'next/server'
import { notificationService } from '@/services/notification.service'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const data = await notificationService.getNotifications(30)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to get notifications:', error)
    return NextResponse.json({ error: 'Failed to get notifications' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const body = await request.json() as {
      action: 'mark_all' | 'mark_one'
      id?: string
    }

    if (body.action === 'mark_all') {
      await notificationService.markAllAsRead()
      return NextResponse.json({ success: true })
    }

    if (body.action === 'mark_one' && body.id) {
      await notificationService.markAsRead(body.id)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Failed to update notification:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
