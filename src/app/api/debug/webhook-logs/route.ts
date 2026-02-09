import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory log storage for debugging
let webhookLogs: any[] = []

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      totalLogs: webhookLogs.length,
      logs: webhookLogs.slice(-10), // Last 10 logs
      lastCheck: new Date().toISOString()
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: 'POST',
      headers: {
        'stripe-signature': headers['stripe-signature'] || 'Missing',
        'content-type': headers['content-type'] || 'Missing',
        'user-agent': headers['user-agent'] || 'Missing'
      },
      bodyLength: body.length,
      bodyPreview: body.substring(0, 200) + (body.length > 200 ? '...' : ''),
      rawBody: body.length < 1000 ? body : 'Too large to store'
    }
    
    webhookLogs.push(logEntry)
    
    // Keep only last 50 logs
    if (webhookLogs.length > 50) {
      webhookLogs = webhookLogs.slice(-50)
    }
    
    console.log('🔗 Webhook log captured:', logEntry.timestamp)
    
    return NextResponse.json({
      success: true,
      message: 'Webhook logged successfully',
      timestamp: logEntry.timestamp
    })
  } catch (error) {
    console.error('Webhook log error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE() {
  webhookLogs = []
  return NextResponse.json({
    success: true,
    message: 'Webhook logs cleared'
  })
}
