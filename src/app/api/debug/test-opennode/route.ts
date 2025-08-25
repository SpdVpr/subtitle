import { NextRequest, NextResponse } from 'next/server'
import { openNodeClient } from '@/lib/opennode'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing OpenNode API connection...')
    
    // Test creating a small invoice
    const testInvoice = await openNodeClient.createInvoice({
      amount: 1,
      currency: 'USD',
      description: 'Test invoice - SubtitleBot',
      metadata: {
        test: true,
        source: 'debug_endpoint'
      },
      ttl: 300 // 5 minutes
    })

    console.log('✅ OpenNode test invoice created:', testInvoice)

    return NextResponse.json({
      success: true,
      message: 'OpenNode API is working!',
      testInvoice: {
        id: testInvoice.id,
        amount: testInvoice.amount,
        description: testInvoice.description,
        status: testInvoice.status,
        checkoutUrl: testInvoice.hosted_checkout_url,
        lightningInvoice: testInvoice.lightning_invoice?.payreq,
        expiresAt: testInvoice.lightning_invoice?.expires_at
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
