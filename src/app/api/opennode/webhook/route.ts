import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { OpenNodeWebhookEvent } from '@/lib/opennode'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'OpenNode webhook endpoint is working',
    timestamp: new Date().toISOString(),
    url: request.url
  })
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString()
  console.log('🟠 OPENNODE WEBHOOK RECEIVED AT:', timestamp)

  try {
    const body = await request.text()
    console.log('🟠 WEBHOOK BODY:', body)

    let event: OpenNodeWebhookEvent
    try {
      event = JSON.parse(body)
    } catch (error) {
      console.error('🚨 Failed to parse webhook body:', error)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    console.log('🟠 OPENNODE WEBHOOK EVENT:', {
      type: event.type,
      invoiceId: event.data.id,
      status: event.data.status,
      amount: event.data.amount,
      metadata: event.data.metadata
    })

    // Handle successful Bitcoin payment
    if (event.type === 'charge:paid' && event.data.status === 'paid') {
      const charge = event.data
      const metadata = charge.metadata

      if (!metadata?.userId || !metadata?.credits) {
        console.error('🚨 Missing metadata in OpenNode charge')
        return NextResponse.json({
          error: 'Missing required metadata',
          received: true
        }, { status: 400 })
      }

      const userId = metadata.userId
      const credits = parseInt(metadata.credits)
      const packageName = metadata.packageName || 'Bitcoin Package'
      const priceUSD = parseFloat(metadata.priceUSD || '0')

      console.log(`🟠 Processing Bitcoin payment: ${credits} credits for user ${userId}`)

      try {
        // Add credits to user account
        await addCreditsToUser(userId, credits, {
          chargeId: charge.id,
          amount: charge.amount,
          currency: charge.currency,
          fiatValue: charge.fiat_value || priceUSD,
          amountUSD: priceUSD,
          packageName,
          paymentMethod: 'bitcoin_lightning',
          settledAt: charge.settled_at || timestamp
        })

        console.log(`✅ Successfully added ${credits} credits to user ${userId} via Bitcoin`)

        return NextResponse.json({
          success: true,
          message: `Added ${credits} credits to user ${userId}`,
          chargeId: charge.id
        })

      } catch (error) {
        console.error('🚨 Failed to add credits for Bitcoin payment:', error)
        return NextResponse.json({
          error: 'Failed to add credits',
          chargeId: charge.id
        }, { status: 500 })
      }
    }

    // Handle expired charges
    if (event.type === 'charge:expired') {
      console.log(`🟠 Bitcoin charge expired: ${event.data.id}`)
      // Could implement cleanup logic here if needed
    }

    // Handle failed charges
    if (event.type === 'charge:failed') {
      console.log(`🟠 Bitcoin charge failed: ${event.data.id}`)
      // Could implement cleanup logic here if needed
    }

    // Handle other webhook events
    console.log(`🟠 Unhandled OpenNode webhook event type: ${event.type}`)
    return NextResponse.json({ 
      success: true, 
      message: 'Event received but not processed',
      type: event.type
    })

  } catch (error) {
    console.error('🚨 OpenNode webhook processing error:', error)
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function addCreditsToUser(
  userId: string,
  credits: number,
  paymentDetails: {
    chargeId: string
    amount: number
    currency: string
    fiatValue: number
    amountUSD: number
    packageName: string
    paymentMethod: string
    settledAt: string
  }
) {
  const adminDb = getAdminDb()
  const batch = adminDb.batch()

  // Update user credits
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
    description: `Purchased ${credits} credits - ${paymentDetails.packageName} (Bitcoin Lightning)`,
    source: 'bitcoin_lightning',
    openNodeChargeId: paymentDetails.chargeId,
    amount: paymentDetails.amount,
    currency: paymentDetails.currency,
    fiatValue: paymentDetails.fiatValue,
    amountUSD: paymentDetails.amountUSD,
    paymentMethod: paymentDetails.paymentMethod,
    createdAt: FieldValue.serverTimestamp(),
    settledAt: paymentDetails.settledAt,
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
  })

  // Add payment record for admin tracking
  const paymentRef = adminDb.collection('payments').doc()
  batch.set(paymentRef, {
    userId,
    openNodeChargeId: paymentDetails.chargeId,
    amount: paymentDetails.amount,
    currency: paymentDetails.currency,
    fiatValue: paymentDetails.fiatValue,
    amountUSD: paymentDetails.amountUSD,
    credits,
    packageName: paymentDetails.packageName,
    paymentMethod: paymentDetails.paymentMethod,
    status: 'completed',
    settledAt: paymentDetails.settledAt,
    createdAt: FieldValue.serverTimestamp(),
  })

  await batch.commit()
}
