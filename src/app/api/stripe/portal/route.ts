import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_demo_key', {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const { returnUrl } = await request.json()

    // Mock portal session for demo
    const mockPortalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?demo=portal`

    // In production, you would create a real Stripe customer portal session:
    /*
    const session = await stripe.billingPortal.sessions.create({
      customer: customerStripeId, // from authenticated user's subscription
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })
    */

    return NextResponse.json({
      url: mockPortalUrl,
    })

  } catch (error) {
    console.error('Stripe portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
