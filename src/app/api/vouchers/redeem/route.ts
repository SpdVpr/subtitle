import { NextRequest, NextResponse } from 'next/server'

// Force Node.js runtime for Firebase Admin SDK
export const runtime = 'nodejs'

// Server-side Firebase Admin (bypasses client security rules)
async function getServerFirestore() {
  const { getAdminDb } = await import('@/lib/firebase-admin')
  return getAdminDb()
}

interface VoucherRedemptionRequest {
  voucherCode: string
  userId: string
}

export async function POST(req: NextRequest) {
  try {
    const body: VoucherRedemptionRequest = await req.json()
    const { voucherCode, userId } = body

    // Validation
    if (!voucherCode || !userId) {
      return NextResponse.json({ 
        error: 'Voucher code and user ID are required' 
      }, { status: 400 })
    }

    const cleanCode = voucherCode.trim().toUpperCase()
    console.log('🎫 Redeeming voucher:', { code: cleanCode, userId })

    // Get Firestore instance
    const db = await getServerFirestore()

    // Get voucher document
    const voucherDoc = await db.collection('vouchers').doc(cleanCode).get()
    if (!voucherDoc.exists) {
      return NextResponse.json({
        error: 'Invalid voucher code'
      }, { status: 404 })
    }
    const voucherData = voucherDoc.data()

    // Check voucher validity
    if (!voucherData.isActive) {
      return NextResponse.json({ 
        error: 'This voucher has been deactivated' 
      }, { status: 400 })
    }

    if (voucherData.expiresAt && new Date() > voucherData.expiresAt.toDate()) {
      return NextResponse.json({ 
        error: 'This voucher has expired' 
      }, { status: 400 })
    }

    if (voucherData.usedCount >= voucherData.usageLimit) {
      return NextResponse.json({ 
        error: 'This voucher has reached its usage limit' 
      }, { status: 400 })
    }

    // Check if user already used this voucher
    if (voucherData.usedBy && voucherData.usedBy.includes(userId)) {
      return NextResponse.json({ 
        error: 'You have already used this voucher' 
      }, { status: 400 })
    }

    // Update user credits with voucher details
    const creditResult = await addCreditsToUser(db, userId, voucherData.creditAmount, `Voucher redemption: ${cleanCode}`, {
      voucherCode: cleanCode,
      campaignName: voucherData.campaignName,
      voucherDescription: voucherData.description
    })

    // Update voucher usage
    await updateVoucherUsage(db, cleanCode, userId)

    // Log the redemption activity
    await logVoucherActivity(db, {
      type: 'redemption',
      voucherCode: cleanCode,
      userId,
      creditAmount: voucherData.creditAmount,
      campaignName: voucherData.campaignName,
      timestamp: new Date()
    })

    return NextResponse.json({
      success: true,
      message: 'Voucher redeemed successfully!',
      creditsAdded: voucherData.creditAmount,
      newBalance: creditResult.newCredits,
      voucher: {
        code: cleanCode,
        creditAmount: voucherData.creditAmount,
        campaignName: voucherData.campaignName,
        description: voucherData.description
      }
    })

  } catch (error: any) {
    console.error('Voucher redemption error:', error)
    return NextResponse.json({ 
      error: error?.message || 'Failed to redeem voucher' 
    }, { status: 500 })
  }
}

async function addCreditsToUser(db: any, userId: string, creditAmount: number, description: string, voucherDetails?: any) {
  const userRef = db.collection('users').doc(userId)
  const userDoc = await userRef.get()

  if (!userDoc.exists) {
    throw new Error('User not found')
  }

  const currentCredits = userDoc.data()?.creditsBalance || 0
  const newCredits = currentCredits + creditAmount

  await userRef.update({
    creditsBalance: newCredits,
    updatedAt: new Date()
  })

  // Log credit transaction with voucher details
  await db.collection('creditTransactions').add({
    userId,
    type: 'topup',
    amount: creditAmount,
    balanceBefore: currentCredits,
    balanceAfter: newCredits,
    reason: description,
    source: 'voucher',
    voucherDetails: voucherDetails || null,
    createdAt: new Date()
  })

  return { previousCredits: currentCredits, newCredits }
}

async function updateVoucherUsage(db: any, voucherCode: string, userId: string) {
  const voucherRef = db.collection('vouchers').doc(voucherCode)
  const voucherDoc = await voucherRef.get()
  const voucherData = voucherDoc.data()

  await voucherRef.update({
    usedCount: (voucherData?.usedCount || 0) + 1,
    usedBy: [...(voucherData?.usedBy || []), userId],
    lastUsedAt: new Date()
  })
}

async function logVoucherActivity(db: any, activity: any) {
  try {
    await db.collection('voucherActivity').add(activity)
  } catch (error) {
    console.error('Failed to log voucher activity:', error)
    // Don't throw - this is not critical
  }
}




