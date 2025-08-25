import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    url: '/api/stripe/payment-links-webhook'
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    console.log('Test webhook received:', {
      method: 'POST',
      headers: Object.fromEntries(request.headers.entries()),
      body: body.substring(0, 200) + '...',
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: true,
      message: 'Test webhook received successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test webhook error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
