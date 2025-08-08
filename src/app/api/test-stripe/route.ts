import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET(req: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe secret key not configured' },
        { status: 500 }
      )
    }

    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      return NextResponse.json(
        { error: 'Stripe publishable key not configured' },
        { status: 500 }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    })

    // Test Stripe connection by retrieving account info
    const account = await stripe.accounts.retrieve()

    return NextResponse.json({
      success: true,
      message: 'Stripe is configured correctly!',
      account: {
        id: account.id,
        country: account.country,
        email: account.email,
        type: account.type,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled
      },
      keys: {
        secret_key_configured: !!process.env.STRIPE_SECRET_KEY,
        publishable_key_configured: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        webhook_secret_configured: !!process.env.STRIPE_WEBHOOK_SECRET,
        premium_price_id_configured: !!process.env.STRIPE_PREMIUM_PRICE_ID,
        pro_price_id_configured: !!process.env.STRIPE_PRO_PRICE_ID
      }
    })

  } catch (error) {
    console.error('Stripe test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Stripe test failed',
      keys: {
        secret_key_configured: !!process.env.STRIPE_SECRET_KEY,
        publishable_key_configured: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        webhook_secret_configured: !!process.env.STRIPE_WEBHOOK_SECRET,
        premium_price_id_configured: !!process.env.STRIPE_PREMIUM_PRICE_ID,
        pro_price_id_configured: !!process.env.STRIPE_PRO_PRICE_ID
      }
    }, { status: 500 })
  }
}

// Disabled in production build to avoid Stripe API type conflicts
export async function POST(req: NextRequest) {
  try {
    const { priceId, userId, userEmail } = await req.json()

    if (!priceId || !userId) {
      return NextResponse.json(
        { error: 'Missing priceId or userId' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe secret key not configured' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    })

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
      },
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Checkout creation failed'
    }, { status: 500 })
  }
}
