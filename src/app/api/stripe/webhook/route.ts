import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-server'
import { UserService } from '@/lib/database'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const plan = session.metadata?.plan

  if (!userId || !plan) {
    console.error('Missing metadata in checkout session')
    return
  }

  try {
    // Update user subscription in database
    await UserService.updateUser(userId, {
      subscriptionPlan: plan as any,
      subscriptionStatus: 'active',
      stripeCustomerId: session.customer as string,
      updatedAt: new Date() as any
    })

    console.log(`Subscription activated for user ${userId}: ${plan}`)
  } catch (error) {
    console.error('Failed to update user subscription:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  const plan = subscription.metadata?.plan

  if (!userId || !plan) {
    console.error('Missing metadata in subscription')
    return
  }

  try {
    await UserService.updateUser(userId, {
      subscriptionPlan: plan as any,
      subscriptionStatus: 'active',
      subscriptionId: subscription.id,
      updatedAt: new Date() as any
    })

    console.log(`Subscription created for user ${userId}: ${plan}`)
  } catch (error) {
    console.error('Failed to handle subscription creation:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('Missing userId in subscription metadata')
    return
  }

  try {
    const status = subscription.status === 'active' ? 'active' : 'canceled'
    
    await UserService.updateUser(userId, {
      subscriptionStatus: status,
      updatedAt: new Date() as any
    })

    console.log(`Subscription updated for user ${userId}: ${status}`)
  } catch (error) {
    console.error('Failed to handle subscription update:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('Missing userId in subscription metadata')
    return
  }

  try {
    await UserService.updateUser(userId, {
      subscriptionPlan: 'free',
      subscriptionStatus: 'canceled',
      subscriptionId: undefined,
      updatedAt: new Date() as any
    })

    console.log(`Subscription canceled for user ${userId}`)
  } catch (error) {
    console.error('Failed to handle subscription deletion:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = typeof invoice.subscription === 'string'
    ? invoice.subscription
    : invoice.subscription?.id

  if (!subscriptionId) return

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const userId = subscription.metadata?.userId

    if (userId) {
      await UserService.updateUser(userId, {
        subscriptionStatus: 'active',
        updatedAt: new Date() as any
      })

      console.log(`Payment succeeded for user ${userId}`)
    }
  } catch (error) {
    console.error('Failed to handle payment success:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = typeof invoice.subscription === 'string'
    ? invoice.subscription
    : invoice.subscription?.id

  if (!subscriptionId) return

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const userId = subscription.metadata?.userId

    if (userId) {
      await UserService.updateUser(userId, {
        subscriptionStatus: 'past_due',
        updatedAt: new Date() as any
      })

      console.log(`Payment failed for user ${userId}`)
    }
  } catch (error) {
    console.error('Failed to handle payment failure:', error)
  }
}
