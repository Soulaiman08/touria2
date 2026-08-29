import { Resend } from 'resend'
import type { Order } from '@/types/order'
import { renderOrderConfirmationEmail } from '@/emails/OrderConfirmationEmail'
import { renderOrderNotificationEmail } from '@/emails/OrderNotificationEmail'

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
 * Returns the configured admin order notification email address from environment variables.
 * Checks ORDER_NOTIFICATION_EMAIL first, then ADMIN_EMAIL as fallback.
 */
export function getOrderNotificationEmail(): string | null {
  const email = process.env.ORDER_NOTIFICATION_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim()
  return email || null
}

export interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * Sends order confirmation email via Resend to the customer.
 * 
 * Safety guarantees:
 * - Does not throw unhandled exceptions.
 * - Does not leak API keys or secrets in logs.
 * - Returns success: false if email cannot be sent (allowing the order flow to proceed).
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<SendEmailResult> {
  const recipient = order.customerEmail?.trim()

  if (!recipient) {
    return { success: false, error: 'No recipient email specified' }
  }

  const resend = getResendClient()
  if (!resend) {
    console.warn('[EMAIL_CUSTOMER] RESEND_API_KEY is not configured in environment variables. Skipping customer email for order:', order.orderNumber)
    return { success: false, error: 'RESEND_API_KEY is not configured' }
  }

  try {
    const { subject, html } = renderOrderConfirmationEmail({ order })
    const from = getEmailFromAddress()
    const replyTo = process.env.EMAIL_REPLY_TO?.trim() || undefined

    const response = await resend.emails.send({
      from,
      to: recipient,
      subject,
      html,
      replyTo,
    })

    if (response.error) {
      console.error('[EMAIL_CUSTOMER] Resend API returned an error for order:', order.orderNumber, response.error.message)
      return { success: false, error: response.error.message }
    }

    console.info('[EMAIL_CUSTOMER] Successfully dispatched customer confirmation for order:', order.orderNumber, 'Message ID:', response.data?.id)
    return { success: true, id: response.data?.id }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown email dispatch error'
    console.error('[EMAIL_CUSTOMER] Failed to dispatch order confirmation email for order:', order.orderNumber, errorMsg)
    return { success: false, error: errorMsg }
  }
}

/**
 * Sends a detailed order notification email via Resend to the admin (ORDER_NOTIFICATION_EMAIL).
 * 
 * Safety guarantees:
 * - Reads ORDER_NOTIFICATION_EMAIL from environment variables.
 * - Does not throw unhandled exceptions (failure does not block order creation).
 * - Safe logging without leaking API keys or secrets.
 * - Independent from the customer email flow.
 */
export async function sendOrderNotificationEmail(order: Order): Promise<SendEmailResult> {
  const isConfigured = Boolean(getOrderNotificationEmail())
  console.info(`[ORDER_EMAIL_ADMIN] ORDER_NOTIFICATION_EMAIL configured: ${isConfigured}`)

  const recipient = getOrderNotificationEmail()

  if (!recipient) {
    console.warn(`[ORDER_EMAIL_ADMIN] ORDER_NOTIFICATION_EMAIL is not configured in environment variables. Skipping admin notification for order: #${order.orderNumber}`)
    return { success: false, error: 'ORDER_NOTIFICATION_EMAIL is not configured' }
  }

  const resend = getResendClient()
  if (!resend) {
    console.warn(`[ORDER_EMAIL_ADMIN] RESEND_API_KEY is not configured in environment variables. Skipping admin notification for order: #${order.orderNumber}`)
    return { success: false, error: 'RESEND_API_KEY is not configured' }
  }

  try {
    console.info(`[ORDER_EMAIL_ADMIN] Attempting admin email for order: #${order.orderNumber}`)

    const { subject, html } = renderOrderNotificationEmail({ order })
    const from = getEmailFromAddress()
    const replyTo = order.customerEmail?.trim() || process.env.EMAIL_REPLY_TO?.trim() || undefined

    const response = await resend.emails.send({
      from,
      to: recipient,
      subject,
      html,
      replyTo,
    })

    if (response.error) {
      console.error(`[ORDER_EMAIL_ADMIN] Resend API result: error for order #${order.orderNumber}:`, response.error.message)
      return { success: false, error: response.error.message }
    }

    console.info(`[ORDER_EMAIL_ADMIN] Resend API result: success for order #${order.orderNumber} | Resend email ID: ${response.data?.id}`)
    return { success: true, id: response.data?.id }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown admin email dispatch error'
    console.error(`[ORDER_EMAIL_ADMIN] Resend API result: error (exception) for order #${order.orderNumber}:`, errorMsg)
    return { success: false, error: errorMsg }
  }
}

