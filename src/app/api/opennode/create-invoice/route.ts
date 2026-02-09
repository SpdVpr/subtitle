import { NextRequest, NextResponse } from 'next/server'
import { openNodeClient, getPackageByCredits } from '@/lib/opennode'

export async function POST(request: NextRequest) {
  try {
    const { userId, credits } = await request.json()

    if (!userId || !credits) {
      return NextResponse.json({
        error: 'Missing userId or credits'
      }, { status: 400 })
    }

    // Get package configuration
    const packageConfig = getPackageByCredits(credits)
    if (!packageConfig) {
      return NextResponse.json({
        error: 'Invalid credits amount'
      }, { status: 400 })
    }

    console.log(`🟠 Creating Bitcoin invoice for ${credits} credits (${packageConfig.packageName})`)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.subtitlebot.com'

    // Create OpenNode charge using USD currency (OpenNode handles conversion)
    // Include metadata in success_url since OpenNode webhooks use form-urlencoded
    const successUrl = `${baseUrl}/success?success=true&credits=${credits}&payment=bitcoin&charge_id={id}&userId=${userId}&package=${encodeURIComponent(packageConfig.packageName)}&price=${packageConfig.priceUSD}`

    const response = await openNodeClient.createCharge({
      amount: packageConfig.priceUSD,
      currency: 'USD',
      description: `${packageConfig.description} - SubtitleBot Credits`,
      callback_url: `${baseUrl}/api/opennode/webhook`,
      success_url: successUrl,
      // Add metadata as custom fields for webhook
      metadata_userId: userId,
      metadata_credits: credits.toString(),
      metadata_packageName: packageConfig.packageName,
      metadata_priceUSD: packageConfig.priceUSD.toString(),
      metadata_source: 'subtitlebot_credits',
      auto_settle: true,
      ttl: 3600 // 1 hour expiry
    })

    const charge = response.data

    // Create hosted checkout URL according to OpenNode documentation
    const hostedCheckoutUrl = `https://checkout.opennode.com/${charge.id}?ln=1`

    console.log(`✅ Bitcoin charge created:`, {
      chargeId: charge.id,
      amount: packageConfig.priceUSD,
      currency: 'USD',
      credits,
      userId,
      hostedCheckoutUrl,
      originalCheckoutUrl: charge.hosted_checkout_url,
      fullCharge: charge // Debug: log full response
    })

    return NextResponse.json({
      success: true,
      charge: {
        id: charge.id,
        amount: charge.amount,
        currency: charge.currency,
        fiatValue: charge.fiat_value,
        sourceFiatValue: charge.source_fiat_value,
        priceUSD: packageConfig.priceUSD,
        credits,
        packageName: packageConfig.packageName,
        description: charge.description,
        checkoutUrl: hostedCheckoutUrl, // Use our constructed URL with Lightning default
        lightningInvoice: charge.lightning_invoice?.payreq,
        expiresAt: charge.lightning_invoice?.expires_at,
        status: charge.status
      }
    })

  } catch (error) {
    console.error('🚨 Failed to create Bitcoin invoice:', error)
    return NextResponse.json({
      error: 'Failed to create Bitcoin invoice',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const chargeId = searchParams.get('chargeId')

  if (!chargeId) {
    return NextResponse.json({
      message: 'OpenNode charge creation endpoint',
      usage: 'POST with { userId, credits }',
      supportedCredits: [100, 500, 1200, 2500],
      example: {
        userId: 'firebase-user-id',
        credits: 100
      },
      hostedCheckout: 'https://checkout.opennode.com/{id}?ln=1'
    })
  }

  try {
    // Get charge status
    const response = await openNodeClient.getCharge(chargeId)
    const charge = response.data

    return NextResponse.json({
      success: true,
      charge: {
        id: charge.id,
        status: charge.status,
        amount: charge.amount,
        currency: charge.currency,
        description: charge.description,
        checkoutUrl: `https://checkout.opennode.com/${charge.id}?ln=1`,
        lightningInvoice: charge.lightning_invoice?.payreq,
        expiresAt: charge.lightning_invoice?.expires_at,
        settledAt: charge.settled_at,
        metadata: charge.metadata
      }
    })

  } catch (error) {
    console.error('🚨 Failed to get Bitcoin charge:', error)
    return NextResponse.json({
      error: 'Failed to get Bitcoin charge',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
