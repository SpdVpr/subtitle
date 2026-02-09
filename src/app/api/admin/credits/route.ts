import { NextRequest, NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/admin-auth-email'

// Force Node.js runtime for Firebase Admin SDK
export const runtime = 'nodejs'

// Server-side Firebase Admin (bypasses client security rules)
async function getServerFirestore() {
  try {
    const { getAdminDb } = await import('@/lib/firebase-admin')
    return getAdminDb()
  } catch (error) {
    console.warn('⚠️ Falling back to client Firestore. Admin SDK not configured:', error)
    const { db } = await import('@/lib/firebase')
    return db
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, deltaCredits, description, relatedJobId, batchNumber, adminEmail } = body || {}

    if (!userId || typeof deltaCredits !== 'number') {
      return NextResponse.json({ error: 'userId and deltaCredits are required' }, { status: 400 })
    }

    // Basic admin check: either header or body adminEmail must be in allowed list
    const headerEmail = req.headers.get('x-admin-email') || adminEmail
    if (!headerEmail || !isAdminEmail(headerEmail)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('🔧 Admin Credits Adjustment:', { userId, deltaCredits, description, adminEmail: headerEmail })

    // Get Firestore instance (Admin SDK or client fallback)
    const db = await getServerFirestore()

    // Adjust credits using the same pattern as user-management
    const result = await adjustUserCredits(db, userId, deltaCredits, description || 'Admin adjustment', headerEmail)

    return NextResponse.json({
      success: true,
      userId,
      deltaCredits,
      previousCredits: result.previousCredits,
      creditsBalance: result.newCredits,
      description,
      adminEmail: headerEmail
    })
  } catch (e: any) {
    console.error('Admin credits adjustment error:', e)
    return NextResponse.json({ error: e?.message || 'Failed to adjust credits' }, { status: 500 })
  }
}

async function adjustUserCredits(db: any, userId: string, deltaCredits: number, description: string, adminEmail: string) {
  const userRef = db.collection ? db.collection('users').doc(userId) : null

  if (!userRef) {
    // Client SDK fallback
    const { doc, updateDoc, getDoc } = await import('firebase/firestore')
    const { db: clientDb } = await import('@/lib/firebase')
    const userDocRef = doc(clientDb, 'users', userId)

    const userDoc = await getDoc(userDocRef)
    if (!userDoc.exists()) {
      throw new Error('User not found')
    }

    const currentCredits = userDoc.data()?.creditsBalance || 0
    const newCredits = Math.max(0, currentCredits + deltaCredits)

    await updateDoc(userDocRef, {
      creditsBalance: newCredits,
      updatedAt: new Date()
    })

    // Log the transaction
    await logCreditTransaction(db, userId, deltaCredits, description, adminEmail)

    return {
      previousCredits: currentCredits,
      newCredits,
      deltaCredits,
      description
    }
  } else {
    // Admin SDK
    const userDoc = await userRef.get()
    if (!userDoc.exists) {
      throw new Error('User not found')
    }

    const currentCredits = userDoc.data()?.creditsBalance || 0
    const newCredits = Math.max(0, currentCredits + deltaCredits)

    await userRef.update({
      creditsBalance: newCredits,
      updatedAt: new Date()
    })

    // Log the transaction
    await logCreditTransaction(db, userId, deltaCredits, description, adminEmail)

    return {
      previousCredits: currentCredits,
      newCredits,
      deltaCredits,
      description
    }
  }
}

async function logCreditTransaction(db: any, userId: string, deltaCredits: number, description: string, adminEmail: string) {
  // Get current user balance for transaction log
  let balanceBefore = 0
  let balanceAfter = 0

  try {
    if (db.collection) {
      // Admin SDK
      const userDoc = await db.collection('users').where('userId', '==', userId).limit(1).get()
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data()
        balanceBefore = userData.creditsBalance || 0
        balanceAfter = Math.max(0, balanceBefore + deltaCredits)
      }
    } else {
      // Client SDK
      const { collection, query, where, limit, getDocs } = await import('firebase/firestore')
      const { db: clientDb } = await import('@/lib/firebase')
      const userQuery = query(collection(clientDb, 'users'), where('userId', '==', userId), limit(1))
      const userSnapshot = await getDocs(userQuery)
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data()
        balanceBefore = userData.creditsBalance || 0
        balanceAfter = Math.max(0, balanceBefore + deltaCredits)
      }
    }
  } catch (error) {
    console.warn('Failed to get user balance for transaction log:', error)
  }

  const transaction = {
    userId,
    type: deltaCredits > 0 ? 'topup' : 'deduction',
    amount: Math.abs(deltaCredits),
    balanceBefore,
    balanceAfter,
    reason: description || 'Admin adjustment',
    adminEmail,
    createdAt: new Date()
  }

  if (db.collection) {
    // Admin SDK
    await db.collection('creditTransactions').add(transaction)
  } else {
    // Client SDK fallback
    const { collection, addDoc } = await import('firebase/firestore')
    const { db: clientDb } = await import('@/lib/firebase')
    await addDoc(collection(clientDb, 'creditTransactions'), transaction)
  }
}

