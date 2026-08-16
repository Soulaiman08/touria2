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
  try {
    const body = await request.json()

    // Validate checkout form values
    const validationResult = checkoutSchema.safeParse(body.formData)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid form data fields submitted' },
        { status: 400 },
      )
    }

    const result = await orderService.createOrder(body)
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
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 },
    )
  }
}
