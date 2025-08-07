import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { UserService } from '@/lib/database'
// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  free: {
    limits: {
      translationsPerMonth: 10,
      storageLimit: 100 * 1024 * 1024, // 100MB
      batchJobs: 0
    }
  },
  premium: {
    limits: {
      translationsPerMonth: 500,
      storageLimit: 1024 * 1024 * 1024, // 1GB
      batchJobs: 10
    }
  },
  pro: {
    limits: {
      translationsPerMonth: -1, // unlimited
      storageLimit: 10 * 1024 * 1024 * 1024, // 10GB
      batchJobs: -1 // unlimited
    }
  }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = headers()
  const sig = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const userId = await getUserIdFromCustomerId(customerId)
  
  if (!userId) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Determine plan from price ID
  const priceId = subscription.items.data[0]?.price.id
  let plan: 'free' | 'premium' | 'pro' = 'free'
  
  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
    plan = 'premium'
  } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    plan = 'pro'
  }

  // Update user subscription
  await UserService.updateUser(userId, {
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status as any,
    subscriptionPlan: plan,
    subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000) as any,
    
    // Update usage limits based on plan
    usage: {
      translationsUsed: 0, // Keep current usage
      translationsLimit: SUBSCRIPTION_PLANS[plan].limits.translationsPerMonth,
      storageUsed: 0, // Keep current usage  
      storageLimit: SUBSCRIPTION_PLANS[plan].limits.storageLimit,
      batchJobsUsed: 0, // Keep current usage
      batchJobsLimit: SUBSCRIPTION_PLANS[plan].limits.batchJobs,
      resetDate: new Date() as any
    } as any
  })

  console.log(`Updated subscription for user ${userId} to ${plan}`)
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const userId = await getUserIdFromCustomerId(customerId)
  
  if (!userId) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Downgrade to free plan
  await UserService.updateUser(userId, {
    subscriptionStatus: 'canceled',
    subscriptionPlan: 'free',
    
    // Reset to free plan limits
    usage: {
      translationsUsed: 0, // Keep current usage but limit future
      translationsLimit: SUBSCRIPTION_PLANS.free.limits.translationsPerMonth,
      storageUsed: 0, // Keep current usage
      storageLimit: SUBSCRIPTION_PLANS.free.limits.storageLimit,
      batchJobsUsed: 0,
      batchJobsLimit: SUBSCRIPTION_PLANS.free.limits.batchJobs,
      resetDate: new Date() as any
    } as any
  })

  console.log(`Cancelled subscription for user ${userId}`)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const userId = await getUserIdFromCustomerId(customerId)
  
  if (!userId) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Reset monthly usage on successful payment
  const user = await UserService.getUser(userId)
  if (user) {
    await UserService.updateUser(userId, {
      usage: {
        ...user.usage,
        translationsUsed: 0,
        batchJobsUsed: 0,
        resetDate: new Date() as any
      } as any
    })
  }

  console.log(`Payment succeeded for user ${userId}`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const userId = await getUserIdFromCustomerId(customerId)
  
  if (!userId) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Update subscription status
  await UserService.updateUser(userId, {
    subscriptionStatus: 'past_due'
  })

  // TODO: Send email notification about failed payment
  console.log(`Payment failed for user ${userId}`)
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  // Store customer ID mapping if needed
  console.log(`Customer created: ${customer.id}`)
}

async function getUserIdFromCustomerId(customerId: string): Promise<string | null> {
  // In a real implementation, you'd query Firestore to find the user
  // For now, we'll store the mapping in the user profile
  
  // This is a simplified approach - in production you might want a separate mapping table
  try {
    // Query users collection for matching stripeCustomerId
    // This would require a composite index in Firestore
    
    // For now, return null and handle this case
    console.warn('getUserIdFromCustomerId not fully implemented')
    return null
  } catch (error) {
    console.error('Error finding user by customer ID:', error)
    return null
  }
}

// Helper function to validate webhook in development
export async function GET() {
  return NextResponse.json({ 
    message: 'Stripe webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}
