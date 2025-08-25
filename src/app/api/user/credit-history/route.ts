import { NextRequest, NextResponse } from 'next/server'

async function getServerFirestore() {
  const { getAdminDb } = await import('@/lib/firebase-admin')
  return getAdminDb()
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userId) {
      return NextResponse.json({
        error: 'Missing userId parameter'
      }, { status: 400 })
    }

    console.log('💳 Getting credit history for user:', userId)

    // Get Firestore instance
    const db = await getServerFirestore()

    // Get credit transactions for this user
    // Note: We'll sort in memory to avoid needing a composite index
    const snapshot = await db.collection('creditTransactions')
      .where('userId', '==', userId)
      .limit(limit * 2) // Get more to account for sorting
      .get()

    const transactions = []

    for (const doc of snapshot.docs) {
      const data = doc.data()

      // Convert Firestore timestamp to Date
      const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date()

      transactions.push({
        id: doc.id,
        type: data.type || 'unknown', // 'topup', 'deduction', 'purchase', etc.
        amount: Number(data.credits || data.amount) || 0, // FIXED: credits first, then amount
        balanceBefore: Number(data.balanceBefore) || 0,
        balanceAfter: Number(data.balanceAfter) || 0,
        reason: data.reason || data.description || 'No description',
        source: data.source || null, // 'voucher', 'purchase', 'admin', 'usage', etc.
        createdAt,
        // Include voucher details if available
        voucherDetails: data.voucherDetails || null,
        // Include admin info if it was an admin adjustment
        adminEmail: data.adminEmail || null,
        // Include job info if it was usage-related
        relatedJobId: data.relatedJobId || null,
        batchNumber: data.batchNumber || null
      })
    }

    // Sort by createdAt descending and limit results
    transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    const limitedTransactions = transactions.slice(0, limit)

    console.log(`💳 Loaded ${limitedTransactions.length} credit transactions for user ${userId}`)

    return NextResponse.json({
      success: true,
      transactions: limitedTransactions,
      total: limitedTransactions.length
    })

  } catch (error) {
    console.error('❌ Error getting user credit history:', error)
    return NextResponse.json({
      error: 'Failed to get credit history',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
