import { NextRequest, NextResponse } from 'next/server'
import { openNodeClient } from '@/lib/opennode'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing OpenNode API connection...')
    
    // Test creating a small charge
    const response = await openNodeClient.createCharge({
      amount: 1,
      currency: 'USD',
      description: 'Test charge - SubtitleBot',
      metadata: {
        test: true,
        source: 'debug_endpoint'
      },
      ttl: 300 // 5 minutes
    })

    const testCharge = response.data
    const hostedCheckoutUrl = `https://checkout.opennode.com/${testCharge.id}?ln=1`

    console.log('✅ OpenNode test charge created:', testCharge)

    return NextResponse.json({
      success: true,
      message: 'OpenNode API is working!',
      testCharge: {
        id: testCharge.id,
        amount: testCharge.amount,
        currency: testCharge.currency,
        description: testCharge.description,
        status: testCharge.status,
        checkoutUrl: hostedCheckoutUrl,
        originalCheckoutUrl: testCharge.hosted_checkout_url,
        lightningInvoice: testCharge.lightning_invoice?.payreq,
        expiresAt: testCharge.lightning_invoice?.expires_at
      }
    })

  } catch (error) {
    console.error('🚨 OpenNode API test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'OpenNode API test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      apiKey: process.env.OPENNODE_API_KEY ? 'Present' : 'Missing'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: 'Use GET to test OpenNode API connection'
  })
}
