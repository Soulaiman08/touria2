import { NextResponse } from 'next/server'
import { notificationService } from '@/services/notification.service'

export async function GET() {
  try {
    const data = await notificationService.getNotifications(30)
    return NextResponse.json(data)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to get notifications'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
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
    const msg = error instanceof Error ? error.message : 'Failed to update notification'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
