import { NextResponse } from 'next/server'
import { orderService } from '@/services/order.service'
import { checkoutSchema } from '@/lib/validations/checkout'
import { signOrderAccessToken } from '@/lib/auth'
import { getCurrentCustomer } from '@/lib/customer-auth'
import { sendOrderConfirmationEmail, sendOrderNotificationEmail } from '@/lib/email'

export async function GET() {
  /*
   * Orders are currently created as guest orders and the application does not
   * yet have a customer session to identify the requester. Returning an empty
   * collection is intentional: exposing every customer's order history here
   * would leak order data. This handler also gives the orders page a valid
   * response until customer authentication and scoped order lookup are added.
   */
  return NextResponse.json({ orders: [] })
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 },
    )
  }

  try {
    // Validate checkout form values
    const validationResult = checkoutSchema.safeParse((body as { formData?: unknown }).formData)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid form data fields submitted' },
        { status: 400 },
      )
    }

    const customer = await getCurrentCustomer()

    const result = await orderService.createOrder({
      ...(body as Parameters<typeof orderService.createOrder>[0]),
      customerId: customer?.id ?? null,
    })
    const response = NextResponse.json(result)
    if (result.success && result.order?.id) {
      response.cookies.set(`order_access_${result.order.id}`, signOrderAccessToken(result.order.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })

      // Dispatch emails (customer confirmation + admin notification)
      try {
        const fullOrder = await orderService.getOrderById(result.order.id)
        if (fullOrder) {
          // 1. Dispatch order confirmation email if customer provided an email address
          if (fullOrder.customerEmail?.trim()) {
            try {
              await sendOrderConfirmationEmail(fullOrder)
            } catch (emailErr) {
              console.error(
                '[ORDER_EMAIL_CUSTOMER] Failed to send customer confirmation email for order:',
                result.order.id,
                emailErr instanceof Error ? emailErr.message : emailErr,
              )
            }
          }

          // 2. Dispatch admin order notification email to ORDER_NOTIFICATION_EMAIL
          try {
            await sendOrderNotificationEmail(fullOrder)
          } catch (adminEmailErr) {
            console.error(
              '[ORDER_EMAIL_ADMIN] Failed to send admin notification email for order:',
              result.order.id,
              adminEmailErr instanceof Error ? adminEmailErr.message : adminEmailErr,
            )
          }
        } else {
          console.warn('[ORDER_EMAIL] Order created but could not retrieve fullOrder for email dispatch:', result.order.id)
        }
      } catch (fetchErr) {
        console.error(
          '[ORDER_EMAIL] Failed to retrieve full order for email dispatch:',
          result.order.id,
          fetchErr instanceof Error ? fetchErr.message : fetchErr,
        )
      }
    }
    return response
  } catch (error) {
    console.error('Error placing order:', error)

    // Validation/business-rule failures are the client's fault; only
    // unexpected (e.g. DB) failures should surface as 500. Business-rule
    // messages are safe to return; system/DB errors must not leak internals.
    const CLIENT_ERRORS = new Set([
      'Your cart is empty',
      'Invalid product quantity',
      'Invalid niqab quantity',
      'A selected product is unavailable',
      'A selected niqab is unavailable',
      'This product does not allow niqab add-ons',
      'Please select a valid product variant',
      'Please select a valid niqab variant',
      'The requested product quantity is no longer in stock',
      'The requested niqab quantity is no longer in stock',
      'Invalid city selected',
      'Selected city does not belong to the selected region',
    ])
    const msg = error instanceof Error ? error.message : 'Failed to place order'
    const isClientError = CLIENT_ERRORS.has(msg)
    return NextResponse.json(
      { success: false, error: isClientError ? msg : 'Failed to place order' },
      { status: isClientError ? 422 : 500 },
    )
  }
}
