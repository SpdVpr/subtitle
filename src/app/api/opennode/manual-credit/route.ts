import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { openNodeClient, getPackageByCredits } from '@/lib/opennode'

export async function POST(request: NextRequest) {
  try {
    const { userId, chargeId } = await request.json()

    if (!userId || !chargeId) {
      return NextResponse.json({
        error: 'Missing userId or chargeId'
      }, { status: 400 })
    }

    console.log(`🔧 Manual credit addition for Bitcoin payment: ${chargeId}`)

    // Get charge details from OpenNode
    const response = await openNodeClient.getCharge(chargeId)
    const charge = response.data

    if (charge.status !== 'paid') {
      return NextResponse.json({
        error: 'Charge is not paid',
        status: charge.status
      }, { status: 400 })
    }

    const metadata = charge.metadata
    if (!metadata?.credits) {
      return NextResponse.json({
        error: 'No credits found in charge metadata'
      }, { status: 400 })
    }

    const credits = parseInt(metadata.credits)
    const packageName = metadata.packageName || 'Bitcoin Package'
    const priceUSD = parseFloat(metadata.priceUSD || '0')

    console.log(`🟠 Adding ${credits} credits for user ${userId} from charge ${chargeId}`)

    // Add credits to user account
    await addCreditsToUser(userId, credits, {
      chargeId: charge.id,
      amount: charge.amount,
      currency: charge.currency || 'USD',
      fiatValue: charge.fiat_value || priceUSD,
      amountUSD: priceUSD,
      packageName,
      paymentMethod: 'bitcoin_lightning_manual',
      settledAt: charge.settled_at || new Date().toISOString()
    })

    console.log(`✅ Successfully added ${credits} credits to user ${userId} manually`)

    return NextResponse.json({
      success: true,
      message: `Added ${credits} credits to user ${userId}`,
      chargeId: charge.id,
      credits,
      packageName
    })

  } catch (error) {
    console.error('🚨 Manual credit addition failed:', error)
    return NextResponse.json({
      error: 'Failed to add credits manually',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Manual credit addition endpoint for Bitcoin payments',
    usage: 'POST with { userId, chargeId }',
    description: 'Manually adds credits for paid Bitcoin charges when webhook fails'
  })
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

  // Update user credits (same as Stripe)
  const userRef = adminDb.collection('users').doc(userId)
  batch.update(userRef, {
    creditsBalance: FieldValue.increment(credits),
    creditsTotalPurchased: FieldValue.increment(credits),
    updatedAt: FieldValue.serverTimestamp(),
  })

  // Add credit transaction record (same structure as Stripe)
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

  // Add payment record for admin tracking (same structure as Stripe)
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
