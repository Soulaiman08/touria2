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
    console.warn('[EMAIL] RESEND_API_KEY is not configured in environment variables. Skipping email delivery for order:', order.orderNumber)
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
      console.error('[EMAIL] Resend API returned an error for order:', order.orderNumber, response.error.message)
      return { success: false, error: response.error.message }
    }

    return { success: true, id: response.data?.id }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown email dispatch error'
    console.error('[EMAIL] Failed to dispatch order confirmation email for order:', order.orderNumber, errorMsg)
    return { success: false, error: errorMsg }
  }
}
