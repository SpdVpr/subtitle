import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'Test webhook endpoint is working',
    timestamp: new Date().toISOString(),
    url: request.url,
    method: 'GET'
  })
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString()
  console.log('🧪 TEST WEBHOOK RECEIVED:', timestamp)
  
  try {
    const body = await request.text()
    console.log('🧪 WEBHOOK BODY LENGTH:', body.length)
    console.log('🧪 WEBHOOK BODY PREVIEW:', body.substring(0, 200))
    
    return NextResponse.json({ 
      status: 'Test webhook received',
      timestamp,
      bodyLength: body.length,
      received: true
    })
  } catch (error) {
    console.error('🧪 TEST WEBHOOK ERROR:', error)
    return NextResponse.json({ 
      error: 'Test webhook failed',
      timestamp
    }, { status: 500 })
  }
}
