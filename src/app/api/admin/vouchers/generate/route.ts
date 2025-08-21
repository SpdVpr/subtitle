import { NextRequest, NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/admin-auth-email'

// Force Node.js runtime for Firebase Admin SDK
export const runtime = 'nodejs'

// Server-side Firebase Admin (bypasses client security rules)
async function getServerFirestore() {
  const { getAdminDb } = await import('@/lib/firebase-admin')
  return getAdminDb()
}

interface VoucherGenerationRequest {
  creditAmount: number
  quantity: number
  campaignName: string
  expirationDays?: number
  usageLimit?: number
  description?: string
}

interface Voucher {
  code: string
  creditAmount: number
  campaignName: string
  description: string
  createdAt: Date
  expiresAt: Date | null
  usageLimit: number
  usedCount: number
  isActive: boolean
  createdBy: string
  usedBy: string[]
}

export async function POST(req: NextRequest) {
  try {
    // Check admin authentication
    const adminEmail = req.headers.get('x-admin-email')
    if (!adminEmail || !isAdminEmail(adminEmail)) {
      return NextResponse.json({ 
        error: 'Admin access required',
        debug: { receivedEmail: adminEmail, isValidAdmin: adminEmail ? isAdminEmail(adminEmail) : false }
      }, { status: 403 })
    }

    const body: VoucherGenerationRequest = await req.json()
    const { creditAmount, quantity, campaignName, expirationDays, usageLimit = 1, description = '' } = body

    // Validation
    if (!creditAmount || creditAmount <= 0) {
      return NextResponse.json({ error: 'Credit amount must be positive' }, { status: 400 })
    }
    if (!quantity || quantity <= 0 || quantity > 1000) {
      return NextResponse.json({ error: 'Quantity must be between 1 and 1000' }, { status: 400 })
    }
    if (!campaignName || campaignName.trim().length === 0) {
      return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 })
    }

    console.log('🎫 Generating vouchers:', { creditAmount, quantity, campaignName, adminEmail })

    // Get Firestore instance
    const db = await getServerFirestore()

    // Calculate expiration date
    const expiresAt = expirationDays ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000) : null

    // Generate voucher codes
    const vouchers: Voucher[] = []
    const generatedCodes = new Set<string>()

    for (let i = 0; i < quantity; i++) {
      let code: string
      do {
        code = generateVoucherCode()
      } while (generatedCodes.has(code))

      generatedCodes.add(code)

      const voucher: Voucher = {
        code,
        creditAmount,
        campaignName: campaignName.trim(),
        description: description.trim(),
        createdAt: new Date(),
        expiresAt,
        usageLimit,
        usedCount: 0,
        isActive: true,
        createdBy: adminEmail,
        usedBy: []
      }

      vouchers.push(voucher)
    }

    // Save vouchers to Firestore
    const batch = db.batch()
    vouchers.forEach(voucher => {
      const docRef = db.collection('vouchers').doc(voucher.code)
      batch.set(docRef, voucher)
    })
    await batch.commit()

    // Log the generation activity
    await logVoucherActivity(db, {
      type: 'generation',
      adminEmail,
      campaignName,
      quantity,
      creditAmount,
      totalCreditsGenerated: quantity * creditAmount,
      timestamp: new Date()
    })

    return NextResponse.json({
      success: true,
      vouchers: vouchers.map(v => ({
        code: v.code,
        creditAmount: v.creditAmount,
        campaignName: v.campaignName,
        expiresAt: v.expiresAt,
        usageLimit: v.usageLimit
      })),
      summary: {
        quantity,
        creditAmount,
        totalCredits: quantity * creditAmount,
        campaignName,
        expiresAt,
        createdBy: adminEmail
      },
      message: 'Vouchers generated and saved successfully'
    })

  } catch (error: any) {
    console.error('Voucher generation error:', error)
    return NextResponse.json({ 
      error: error?.message || 'Failed to generate vouchers' 
    }, { status: 500 })
  }
}

function generateVoucherCode(): string {
  // Generate a 12-character voucher code: XXXX-XXXX-XXXX
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) {
      code += '-'
    }
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return code
}

async function logVoucherActivity(db: any, activity: any) {
  try {
    await db.collection('voucherActivity').add(activity)
  } catch (error) {
    console.error('Failed to log voucher activity:', error)
    // Don't throw - this is not critical
  }
}
