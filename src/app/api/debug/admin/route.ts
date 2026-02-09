import { NextRequest, NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/admin-auth-email'

export async function GET(req: NextRequest) {
  try {
    const adminEmail = req.headers.get('x-admin-email')
    
    return NextResponse.json({
      success: true,
      debug: {
        receivedEmail: adminEmail,
        isValidAdmin: adminEmail ? isAdminEmail(adminEmail) : false,
        allowedEmails: [
          'premium@test.com',
          'admin@subtitlebot.com',
          'admin@subtitle-ai.com',
          'ceo@subtitle-ai.com',
          'manager@subtitle-ai.com'
        ],
        headers: Object.fromEntries(req.headers.entries())
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      debug: {
        receivedEmail: req.headers.get('x-admin-email'),
        headers: Object.fromEntries(req.headers.entries())
      }
    }, { status: 500 })
  }
}
