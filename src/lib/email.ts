import { Resend } from 'resend'
import type { Order } from '@/types/order'
import { renderOrderConfirmationEmail } from '@/emails/OrderConfirmationEmail'

// Lazy-initialized Resend client singleton
let resendClient: Resend | null = null

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return null
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

/**
 * Returns the configured 'From' email address.
 * Priority:
 * 1. process.env.EMAIL_FROM (e.g. 'Thuraya Al Maghribi <orders@yourdomain.com>')
 * 2. Fallback for unconfigured/dev: 'Thuraya Al Maghribi <onboarding@resend.dev>'
 */
export function getEmailFromAddress(): string {
  const customFrom = process.env.EMAIL_FROM?.trim()
  if (customFrom) {
    return customFrom
  }
  return 'Thuraya Al Maghribi <onboarding@resend.dev>'
}

/**
 * Returns the admin email address that should always receive a copy of the
 * order confirmation email. Reads ORDER_NOTIFICATION_EMAIL from the
 * environment and falls back to the default admin mailbox.
 */
export function getOrderNotificationEmail(): string {
  return process.env.ORDER_NOTIFICATION_EMAIL?.trim() || 'ms3243737@gmail.com'
}

export interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * Sends the order confirmation email (OrderConfirmationEmail template) via Resend.
 *
 * Recipients:
 * - The admin (ms3243737@gmail.com by default) ALWAYS receives a copy, regardless
 *   of whether the customer provided an email.
 * - The customer receives a copy only if they provided an email address.
 *
 * Both sends are isolated in their own try/catch so a failure on one never
 * blocks the other or throws an unhandled exception (the order flow proceeds).
 * Each send renders the SAME OrderConfirmationEmail template from the full order.
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<SendEmailResult> {
  const resend = getResendClient()
  if (!resend) {
    console.warn('[EMAIL_CONFIRM] RESEND_API_KEY is not configured in environment variables. Skipping order confirmation emails for order:', order.orderNumber)
    return { success: false, error: 'RESEND_API_KEY is not configured' }
  }

  const { subject, html } = renderOrderConfirmationEmail({ order })
  const from = getEmailFromAddress()
  const replyTo = process.env.EMAIL_REPLY_TO?.trim() || undefined
  const adminEmail = getOrderNotificationEmail()
  const customerEmail = order.customerEmail?.trim()

  const results: SendEmailResult[] = []

  // 1. Admin copy — always sent.
  try {
    console.info(`[EMAIL_ADMIN] Dispatching confirmation for order #${order.orderNumber} to: ${adminEmail}`)
    const adminResponse = await resend.emails.send({ from, to: adminEmail, subject, html, replyTo })
    if (adminResponse.error) {
      results.push({ success: false, error: adminResponse.error.message })
      console.error('[EMAIL_ADMIN] Resend API returned an error for order:', order.orderNumber, adminResponse.error.message)
    } else {
      results.push({ success: true, id: adminResponse.data?.id })
      console.info('[EMAIL_ADMIN] Successfully dispatched admin confirmation for order:', order.orderNumber, 'Message ID:', adminResponse.data?.id)
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown email dispatch error'
    results.push({ success: false, error: errorMsg })
    console.error('[EMAIL_ADMIN] Failed to dispatch admin confirmation for order:', order.orderNumber, errorMsg)
  }

  // 2. Customer copy — only when the customer provided an email.
  if (!customerEmail) {
    console.info('[EMAIL_CUSTOMER] Skipping customer confirmation (no email provided) for order:', order.orderNumber)
  } else {
    try {
      console.info(`[EMAIL_CUSTOMER] Dispatching confirmation for order #${order.orderNumber} to: ${customerEmail}`)
      const customerResponse = await resend.emails.send({ from, to: customerEmail, subject, html, replyTo })
      if (customerResponse.error) {
        results.push({ success: false, error: customerResponse.error.message })
        console.error('[EMAIL_CUSTOMER] Resend API returned an error for order:', order.orderNumber, customerResponse.error.message)
      } else {
        results.push({ success: true, id: customerResponse.data?.id })
        console.info('[EMAIL_CUSTOMER] Successfully dispatched customer confirmation for order:', order.orderNumber, 'Message ID:', customerResponse.data?.id)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown email dispatch error'
      results.push({ success: false, error: errorMsg })
      console.error('[EMAIL_CUSTOMER] Failed to dispatch customer confirmation for order:', order.orderNumber, errorMsg)
    }
  }

  const successful = results.find((r) => r.success)
  if (successful) {
    return { success: true, id: successful.id }
  }
  return {
    success: false,
    error: results.map((r) => r.error).filter(Boolean).join('; ') || 'Order confirmation email dispatch failed',
  }
}

