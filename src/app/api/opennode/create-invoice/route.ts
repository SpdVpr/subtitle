import { NextRequest, NextResponse } from 'next/server'
import { openNodeClient, getPackageByCredits, convertUSDToSatoshis } from '@/lib/opennode'

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

    // Convert USD to satoshis using fixed rates
    const satoshiAmount = convertUSDToSatoshis(packageConfig.priceUSD)
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.subtitlebot.com'
    
    // Create OpenNode invoice
    const invoice = await openNodeClient.createInvoice({
      amount: satoshiAmount,
      description: `${packageConfig.description} - SubtitleBot Credits`,
      callback_url: `${baseUrl}/api/opennode/webhook`,
      success_url: `${baseUrl}/success?success=true&credits=${credits}&payment=bitcoin&invoice_id={id}`,
      metadata: {
        userId,
        credits,
        packageName: packageConfig.packageName,
        priceUSD: packageConfig.priceUSD,
        source: 'subtitlebot_credits'
      },
      auto_settle: true,
      ttl: 3600 // 1 hour expiry
    })

    console.log(`✅ Bitcoin invoice created:`, {
      invoiceId: invoice.id,
      amount: satoshiAmount,
      credits,
      userId,
      checkoutUrl: invoice.hosted_checkout_url
    })

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        amount: satoshiAmount,
        amountBTC: satoshiAmount / 100000000,
        priceUSD: packageConfig.priceUSD,
        credits,
        packageName: packageConfig.packageName,
        description: invoice.description,
        checkoutUrl: invoice.hosted_checkout_url,
        lightningInvoice: invoice.lightning_invoice?.payreq,
        expiresAt: invoice.lightning_invoice?.expires_at,
        status: invoice.status
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
  const invoiceId = searchParams.get('invoiceId')

  if (!invoiceId) {
    return NextResponse.json({
      message: 'OpenNode invoice creation endpoint',
      usage: 'POST with { userId, credits }',
      supportedCredits: [100, 500, 1200, 2500],
      example: {
        userId: 'firebase-user-id',
        credits: 100
      }
    })
  }

  try {
    // Get invoice status
    const invoice = await openNodeClient.getInvoice(invoiceId)
    
    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        status: invoice.status,
        amount: invoice.amount,
        description: invoice.description,
        checkoutUrl: invoice.hosted_checkout_url,
        lightningInvoice: invoice.lightning_invoice?.payreq,
        expiresAt: invoice.lightning_invoice?.expires_at,
        settledAt: invoice.settled_at,
        metadata: invoice.metadata
      }
    })

  } catch (error) {
    console.error('🚨 Failed to get Bitcoin invoice:', error)
    return NextResponse.json({
      error: 'Failed to get Bitcoin invoice',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
