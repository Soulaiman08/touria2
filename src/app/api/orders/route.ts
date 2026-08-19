import { NextResponse } from 'next/server'
import { orderService } from '@/services/order.service'
import { checkoutSchema } from '@/lib/validations/checkout'
import { signOrderAccessToken } from '@/lib/auth'

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

    const result = await orderService.createOrder(body as Parameters<typeof orderService.createOrder>[0])
    const response = NextResponse.json(result)
    if (result.success && result.order?.id) {
      response.cookies.set(`order_access_${result.order.id}`, signOrderAccessToken(result.order.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })
    }
    return response
  } catch (error) {
    console.error('Error placing order:', error)
    const msg = error instanceof Error ? error.message : 'Failed to place order'

    // Validation/business-rule failures are the client's fault; only
    // unexpected (e.g. DB) failures should surface as 500.
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
    return NextResponse.json(
      { success: false, error: msg },
      { status: CLIENT_ERRORS.has(msg) ? 422 : 500 },
    )
  }
}
