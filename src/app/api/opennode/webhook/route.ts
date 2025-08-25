import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import crypto from 'crypto'

// OpenNode webhook payload structure (application/x-www-form-urlencoded)
interface OpenNodeWebhookPayload {
  id: string
  callback_url: string
  success_url: string
  status: 'paid' | 'expired' | 'underpaid' | 'processing' | 'refunded'
  order_id: string
  description: string
  price: string // in satoshis
  fee: string
  auto_settle: string
  hashed_order: string
  // Additional fields for metadata (custom fields)
  [key: string]: string
}

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
    console.log('🟠 WEBHOOK BODY RAW:', body)
    console.log('🟠 WEBHOOK HEADERS:', Object.fromEntries(request.headers.entries()))

    if (!body) {
      return NextResponse.json({ error: 'Empty body' }, { status: 400 })
    }

    // Parse form-urlencoded data (OpenNode sends application/x-www-form-urlencoded)
    const formData = new URLSearchParams(body)
    const payload: OpenNodeWebhookPayload = {
      id: formData.get('id') || '',
      callback_url: formData.get('callback_url') || '',
      success_url: formData.get('success_url') || '',
      status: formData.get('status') as any || 'expired',
      order_id: formData.get('order_id') || '',
      description: formData.get('description') || '',
      price: formData.get('price') || '0',
      fee: formData.get('fee') || '0',
      auto_settle: formData.get('auto_settle') || '0',
      hashed_order: formData.get('hashed_order') || ''
    }

    // Add any additional metadata fields
    for (const [key, value] of formData.entries()) {
      if (!['id', 'callback_url', 'success_url', 'status', 'order_id', 'description', 'price', 'fee', 'auto_settle', 'hashed_order'].includes(key)) {
        payload[key] = value
      }
    }

    console.log('🟠 OPENNODE WEBHOOK PAYLOAD:', payload)

    // Validate webhook signature according to OpenNode docs
    const apiKey = process.env.OPENNODE_API_KEY
    if (!apiKey) {
      console.error('🚨 OpenNode API key not found')
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const calculatedHash = crypto.createHmac('sha256', apiKey).update(payload.id).digest('hex')
    if (payload.hashed_order !== calculatedHash) {
      console.error('🚨 Invalid webhook signature:', {
        received: payload.hashed_order,
        calculated: calculatedHash,
        chargeId: payload.id
      })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    console.log('✅ Webhook signature validated')

    // Handle successful Bitcoin payment
    if (payload.status === 'paid') {
      // Extract metadata from success_url or custom fields
      let userId = payload.userId || ''
      let credits = 0
      let packageName = 'Bitcoin Package'
      let priceUSD = 0

      // Try to extract from success_url
      if (payload.success_url) {
        try {
          const url = new URL(payload.success_url)
          userId = userId || url.searchParams.get('userId') || ''
          credits = parseInt(url.searchParams.get('credits') || '0')
          packageName = url.searchParams.get('package') || packageName
          priceUSD = parseFloat(url.searchParams.get('price') || '0')
        } catch (error) {
          console.error('🚨 Failed to parse success_url:', error)
        }
      }

      // Try to extract from custom fields
      userId = userId || payload.metadata_userId || ''
      credits = credits || parseInt(payload.metadata_credits || '0')
      packageName = payload.metadata_packageName || packageName
      priceUSD = priceUSD || parseFloat(payload.metadata_priceUSD || '0')

      if (!userId || !credits) {
        console.error('🚨 Missing userId or credits in OpenNode webhook:', {
          userId,
          credits,
          payload
        })
        return NextResponse.json({
          error: 'Missing required metadata',
          received: true
        }, { status: 400 })
      }

      console.log(`🟠 Processing Bitcoin payment: ${credits} credits for user ${userId}`)

      try {
        // Add credits to user account
        await addCreditsToUser(userId, credits, {
          chargeId: payload.id,
          amount: parseInt(payload.price),
          currency: 'BTC',
          fiatValue: priceUSD,
          amountUSD: priceUSD,
          packageName,
          paymentMethod: 'bitcoin_lightning',
          settledAt: timestamp
        })

        console.log(`✅ Successfully added ${credits} credits to user ${userId} via Bitcoin`)

        return NextResponse.json({
          success: true,
          message: `Added ${credits} credits to user ${userId}`,
          chargeId: payload.id
        })

      } catch (error) {
        console.error('🚨 Failed to add credits for Bitcoin payment:', error)
        return NextResponse.json({
          error: 'Failed to add credits',
          chargeId: payload.id
        }, { status: 500 })
      }
    }

    // Handle other statuses
    if (payload.status === 'expired') {
      console.log(`🟠 Bitcoin charge expired: ${payload.id}`)
    }

    if (payload.status === 'underpaid') {
      console.log(`🟠 Bitcoin charge underpaid: ${payload.id}`)
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
