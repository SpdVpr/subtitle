import { NextRequest, NextResponse } from 'next/server'
import { stripe, SUBSCRIPTION_PLANS } from '@/lib/stripe-server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { plan, userId, userEmail } = await request.json()

    // Validate plan
    if (!plan || !SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]) {
      return NextResponse.json(
        { error: 'Invalid subscription plan' },
        { status: 400 }
      )
    }

    // Validate user
    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'User information required' },
        { status: 400 }
      )
    }

    const planConfig = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]

    // Free plan doesn't need checkout
    if (plan === 'free') {
      return NextResponse.json(
        { error: 'Free plan does not require payment' },
        { status: 400 }
      )
    }

    // Get the origin for redirect URLs
    const headersList = await headers()
    const origin = headersList.get('origin') || 'http://localhost:3001'

    // For demo purposes, create a mock session if no real Stripe key
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('demo_key') || process.env.STRIPE_SECRET_KEY.includes('your_stripe_secret_key_here')) {
      const mockSession = {
        id: 'cs_demo_' + Date.now(),
        url: `${origin}/dashboard?success=true&plan=${plan}&demo=true`,
        payment_status: 'paid',
        customer_email: userEmail,
      }

      return NextResponse.json({
        success: true,
        sessionId: mockSession.id,
        url: mockSession.url
      })
    }

    // Create checkout session (real Stripe)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${planConfig.name} Plan`,
              description: planConfig.features.join(', '),
            },
            unit_amount: Math.round(planConfig.price * 100), // Convert to cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard?success=true&plan=${plan}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
        plan: plan,
      },
      subscription_data: {
        metadata: {
          userId: userId,
          plan: plan,
        },
      },
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
