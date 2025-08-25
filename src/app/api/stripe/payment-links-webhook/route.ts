import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString()
  console.log('🔗 Webhook received at:', timestamp)

  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    console.log('📝 Webhook details:', {
      timestamp,
      hasSignature: !!signature,
      bodyLength: body.length,
      bodyPreview: body.substring(0, 100) + '...'
    })

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Received Stripe webhook event:', event.type)

    // Handle successful payment from Payment Links
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      console.log('Processing completed checkout session:', {
        sessionId: session.id,
        clientReferenceId: session.client_reference_id,
        amountTotal: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
      })

      // Extract user ID from client_reference_id
      const userId = session.client_reference_id
      if (!userId) {
        console.error('No client_reference_id found in session')
        return NextResponse.json({ error: 'No user ID found' }, { status: 400 })
      }

      // Extract credits from metadata
      const creditsToAdd = parseInt(session.metadata?.credits || '0')
      if (!creditsToAdd) {
        console.error('No credits found in session metadata')
        return NextResponse.json({ error: 'No credits found' }, { status: 400 })
      }

      try {
        // Add credits to user account
        await addCreditsToUser(userId, creditsToAdd, {
          sessionId: session.id,
          amountPaid: session.amount_total || 0,
          currency: session.currency || 'usd',
          packageName: session.metadata?.package_name || 'Unknown Package',
          paymentMethod: 'stripe_payment_link',
        })

        console.log(`Successfully added ${creditsToAdd} credits to user ${userId}`)
        
        return NextResponse.json({ 
          success: true, 
          message: `Added ${creditsToAdd} credits to user ${userId}` 
        })
      } catch (error) {
        console.error('Failed to add credits to user:', error)
        return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 })
      }
    }

    // Handle other webhook events if needed
    console.log(`Unhandled webhook event type: ${event.type}`)
    return NextResponse.json({ success: true, message: 'Event received but not processed' })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function addCreditsToUser(
  userId: string,
  credits: number,
  paymentDetails: {
    sessionId: string
    amountPaid: number
    currency: string
    packageName: string
    paymentMethod: string
  }
) {
  const adminDb = getAdminDb()
  const batch = adminDb.batch()

  // Update user credits (using correct field names)
  const userRef = adminDb.collection('users').doc(userId)
  batch.update(userRef, {
    creditsBalance: FieldValue.increment(credits),
    creditsTotalPurchased: FieldValue.increment(credits),
    updatedAt: FieldValue.serverTimestamp(),
  })

  // Add credit transaction record
  const transactionRef = adminDb.collection('creditTransactions').doc()
  batch.set(transactionRef, {
    userId,
    type: 'credit',
    credits,
    description: `Purchased ${credits} credits - ${paymentDetails.packageName}`,
    source: 'stripe_payment_link',
    stripeSessionId: paymentDetails.sessionId,
    amountPaid: paymentDetails.amountPaid,
    currency: paymentDetails.currency,
    paymentMethod: paymentDetails.paymentMethod,
    createdAt: FieldValue.serverTimestamp(),
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
  })

  // Add payment record for admin tracking
  const paymentRef = adminDb.collection('payments').doc()
  batch.set(paymentRef, {
    userId,
    stripeSessionId: paymentDetails.sessionId,
    amount: paymentDetails.amountPaid,
    currency: paymentDetails.currency,
    credits,
    packageName: paymentDetails.packageName,
    paymentMethod: paymentDetails.paymentMethod,
    status: 'completed',
    createdAt: FieldValue.serverTimestamp(),
  })

  await batch.commit()
}
