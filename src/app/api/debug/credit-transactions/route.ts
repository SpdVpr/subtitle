import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    console.log('🔍 Debug: Fetching all credit transactions for user:', userId)

    const adminDb = await getAdminDb()
    
    // Get ALL credit transactions for this user (without orderBy to avoid index requirement)
    const transactionsSnapshot = await adminDb.collection('credit_transactions')
      .where('userId', '==', userId)
      .limit(50)
      .get()

    const transactions = []
    transactionsSnapshot.forEach(doc => {
      const data = doc.data()
      const transaction = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        // Show all possible field names
        credits_field: data.credits,
        amount_field: data.amount,
        type_field: data.type,
        description_field: data.description,
        reason_field: data.reason,
        relatedJobId_field: data.relatedJobId
      }
      transactions.push(transaction)
    })

    console.log('🔍 Debug: Found', transactions.length, 'transactions')
    
    // Also get translation jobs for comparison (without orderBy to avoid index requirement)
    const jobsSnapshot = await adminDb.collection('translationJobs')
      .where('userId', '==', userId)
      .limit(10)
      .get()

    const jobs = []
    jobsSnapshot.forEach(doc => {
      const data = doc.data()
      jobs.push({
        id: doc.id,
        status: data.status,
        aiService: data.aiService,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        subtitleCount: data.subtitleCount,
        originalFileName: data.originalFileName
      })
    })

    return NextResponse.json({
      userId,
      totalTransactions: transactions.length,
      totalJobs: jobs.length,
      transactions,
      jobs,
      debug: {
        message: 'This endpoint shows all credit transactions and recent jobs for debugging',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Debug endpoint error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch debug data', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
