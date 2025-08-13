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
    // Check admin permissions
    const adminEmail = req.headers.get('x-admin-email')
    if (!adminEmail || !isAdminEmail(adminEmail)) {
      return NextResponse.json({ 
        error: 'Admin access required',
        debug: { receivedEmail: adminEmail, isValidAdmin: adminEmail ? isAdminEmail(adminEmail) : false }
      }, { status: 403 })
    }

    const body = await req.json()
    const { action, userId, data } = body

    console.log('🔧 Admin User Management:', { action, userId, adminEmail })

    // Get Firestore instance
    const db = await getServerFirestore()
    if (!db) {
      throw new Error('Firestore not available')
    }

    let result: any = {}

    switch (action) {
      case 'adjustCredits':
        result = await adjustUserCredits(db, userId, data, adminEmail)
        break
      
      case 'blockUser':
        result = await blockUser(db, userId, data, adminEmail)
        break
      
      case 'unblockUser':
        result = await unblockUser(db, userId, adminEmail)
        break
      
      case 'updateUserPlan':
        result = await updateUserPlan(db, userId, data, adminEmail)
        break
      
      case 'resetUserUsage':
        result = await resetUserUsage(db, userId, adminEmail)
        break
      
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return NextResponse.json({
      success: true,
      action,
      userId,
      result,
      timestamp: new Date().toISOString(),
      adminEmail
    })

  } catch (error: any) {
    console.error('Admin User Management error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Check server logs for more information'
    }, { status: 500 })
  }
}

// Helper functions for user management actions
async function adjustUserCredits(db: any, userId: string, data: any, adminEmail: string) {
  const { deltaCredits, description } = data
  
  if (typeof deltaCredits !== 'number') {
    throw new Error('deltaCredits must be a number')
  }

  // Get user document reference
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

async function blockUser(db: any, userId: string, data: any, adminEmail: string) {
  const { reason } = data
  
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
    
    await updateDoc(userDocRef, {
      isBlocked: true,
      blockReason: reason || 'Blocked by admin',
      blockedAt: new Date(),
      blockedBy: adminEmail,
      updatedAt: new Date()
    })
  } else {
    // Admin SDK
    const userDoc = await userRef.get()
    if (!userDoc.exists) {
      throw new Error('User not found')
    }
    
    await userRef.update({
      isBlocked: true,
      blockReason: reason || 'Blocked by admin',
      blockedAt: new Date(),
      blockedBy: adminEmail,
      updatedAt: new Date()
    })
  }
  
  return { blocked: true, reason, blockedBy: adminEmail }
}

async function unblockUser(db: any, userId: string, adminEmail: string) {
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
    
    await updateDoc(userDocRef, {
      isBlocked: false,
      blockReason: null,
      blockedAt: null,
      blockedBy: null,
      unblockedAt: new Date(),
      unblockedBy: adminEmail,
      updatedAt: new Date()
    })
  } else {
    // Admin SDK
    const userDoc = await userRef.get()
    if (!userDoc.exists) {
      throw new Error('User not found')
    }
    
    await userRef.update({
      isBlocked: false,
      blockReason: null,
      blockedAt: null,
      blockedBy: null,
      unblockedAt: new Date(),
      unblockedBy: adminEmail,
      updatedAt: new Date()
    })
  }
  
  return { blocked: false, unblockedBy: adminEmail }
}

async function updateUserPlan(db: any, userId: string, data: any, adminEmail: string) {
  const { plan } = data
  
  if (!['free', 'premium', 'pro'].includes(plan)) {
    throw new Error('Invalid plan. Must be: free, premium, or pro')
  }
  
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
    
    const previousPlan = userDoc.data()?.subscriptionPlan || 'free'
    
    await updateDoc(userDocRef, {
      subscriptionPlan: plan,
      planUpdatedAt: new Date(),
      planUpdatedBy: adminEmail,
      updatedAt: new Date()
    })
    
    return { previousPlan, newPlan: plan, updatedBy: adminEmail }
  } else {
    // Admin SDK
    const userDoc = await userRef.get()
    if (!userDoc.exists) {
      throw new Error('User not found')
    }
    
    const previousPlan = userDoc.data()?.subscriptionPlan || 'free'
    
    await userRef.update({
      subscriptionPlan: plan,
      planUpdatedAt: new Date(),
      planUpdatedBy: adminEmail,
      updatedAt: new Date()
    })
    
    return { previousPlan, newPlan: plan, updatedBy: adminEmail }
  }
}

async function resetUserUsage(db: any, userId: string, adminEmail: string) {
  const userRef = db.collection ? db.collection('users').doc(userId) : null
  
  const resetUsage = {
    translationsUsed: 0,
    storageUsed: 0,
    batchJobsUsed: 0,
    resetDate: new Date(),
    resetBy: adminEmail
  }
  
  if (!userRef) {
    // Client SDK fallback
    const { doc, updateDoc, getDoc } = await import('firebase/firestore')
    const { db: clientDb } = await import('@/lib/firebase')
    const userDocRef = doc(clientDb, 'users', userId)
    
    const userDoc = await getDoc(userDocRef)
    if (!userDoc.exists()) {
      throw new Error('User not found')
    }
    
    await updateDoc(userDocRef, {
      usage: resetUsage,
      updatedAt: new Date()
    })
  } else {
    // Admin SDK
    const userDoc = await userRef.get()
    if (!userDoc.exists) {
      throw new Error('User not found')
    }
    
    await userRef.update({
      usage: resetUsage,
      updatedAt: new Date()
    })
  }
  
  return { usage: resetUsage }
}

async function logCreditTransaction(db: any, userId: string, deltaCredits: number, description: string, adminEmail: string) {
  const transaction = {
    userId,
    type: deltaCredits > 0 ? 'admin_credit' : 'admin_debit',
    credits: Math.abs(deltaCredits),
    description: description || 'Admin adjustment',
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
