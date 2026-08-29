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
 * Sends the order confirmation email (OrderConfirmationEmail template) via Resend
 * to the CUSTOMER ONLY.
 *
 * - Recipient comes exclusively from `order.customerEmail` (never the admin email).
 * - If the customer did not provide an email, no email is sent (returns
 *   success:false without throwing, so the order flow proceeds).
 *
 * The email content is rendered from the untouched `order`, so it always shows
 * the REAL customer data. This function NEVER sends to the admin mailbox.
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<SendEmailResult> {
  const customerRecipient = order.customerEmail?.trim()

  if (!customerRecipient) {
    console.info('[EMAIL_CONFIRM] Skipping customer confirmation (no email provided) for order:', order.orderNumber)
    return { success: false, error: 'No customer email provided' }
  }

  const resend = getResendClient()
  if (!resend) {
    console.warn('[EMAIL_CONFIRM] RESEND_API_KEY is not configured in environment variables. Skipping customer confirmation for order:', order.orderNumber)
    return { success: false, error: 'RESEND_API_KEY is not configured' }
  }

  try {
    const { subject, html } = renderOrderConfirmationEmail({ order })
    const from = getEmailFromAddress()
    const replyTo = process.env.EMAIL_REPLY_TO?.trim() || undefined

    console.info(`[EMAIL_CONFIRM] Dispatching customer confirmation for order #${order.orderNumber} to: ${customerRecipient}`)
    const response = await resend.emails.send({ from, to: customerRecipient, subject, html, replyTo })

    if (response.error) {
      console.error('[EMAIL_CONFIRM] Resend API returned an error for order:', order.orderNumber, response.error.message)
      return { success: false, error: response.error.message }
    }

    console.info('[EMAIL_CONFIRM] Successfully dispatched customer confirmation for order:', order.orderNumber, 'Message ID:', response.data?.id)
    return { success: true, id: response.data?.id }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown email dispatch error'
    console.error('[EMAIL_CONFIRM] Failed to dispatch customer confirmation for order:', order.orderNumber, errorMsg)
    return { success: false, error: errorMsg }
  }
}

/**
 * Sends the admin order notification email (OrderNotificationEmail template) via
 * Resend to the ADMIN ONLY. This is the single admin email for each order.
 *
 * - Recipient: `ORDER_NOTIFICATION_EMAIL` from the environment, with a safe
 *   fallback to `ms3243737@gmail.com`. This address is a DESTINATION ONLY —
 *   it is never merged into the order and never used as customer data.
 * - The email content is rendered from the untouched `order`, so it shows the
 *   REAL customer information (name, phone, address, items, totals, ...).
 *
 * Never throws: failures are caught so the order flow proceeds regardless.
 */
export async function sendOrderNotificationEmail(order: Order): Promise<SendEmailResult> {
  const adminRecipient = getOrderNotificationEmail()

  const resend = getResendClient()
  if (!resend) {
    console.warn('[EMAIL_ADMIN] RESEND_API_KEY is not configured in environment variables. Skipping admin notification for order:', order.orderNumber)
    return { success: false, error: 'RESEND_API_KEY is not configured' }
  }

  try {
    const { subject, html } = renderOrderNotificationEmail({ order })
    const from = getEmailFromAddress()
    const replyTo = process.env.EMAIL_REPLY_TO?.trim() || undefined

    console.info(`[EMAIL_ADMIN] Dispatching order notification for order #${order.orderNumber} to: ${adminRecipient}`)
    const response = await resend.emails.send({ from, to: adminRecipient, subject, html, replyTo })

    if (response.error) {
      console.error('[EMAIL_ADMIN] Resend API returned an error for order:', order.orderNumber, response.error.message)
      return { success: false, error: response.error.message }
    }

    console.info('[EMAIL_ADMIN] Successfully dispatched admin notification for order:', order.orderNumber, 'Message ID:', response.data?.id)
    return { success: true, id: response.data?.id }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown email dispatch error'
    console.error('[EMAIL_ADMIN] Failed to dispatch admin notification for order:', order.orderNumber, errorMsg)
    return { success: false, error: errorMsg }
  }
}

