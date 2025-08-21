import { NextRequest, NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/admin-auth-email'

// Force Node.js runtime for Firebase Admin SDK
export const runtime = 'nodejs'

// Server-side Firebase Admin (bypasses client security rules)
async function getServerFirestore() {
  const { getAdminDb } = await import('@/lib/firebase-admin')
  return getAdminDb()
}

// GET - List all vouchers with filtering and pagination
export async function GET(req: NextRequest) {
  try {
    // Check admin authentication
    const adminEmail = req.headers.get('x-admin-email')
    if (!adminEmail || !isAdminEmail(adminEmail)) {
      return NextResponse.json({ 
        error: 'Admin access required',
        debug: { receivedEmail: adminEmail, isValidAdmin: adminEmail ? isAdminEmail(adminEmail) : false }
      }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const campaign = searchParams.get('campaign')
    const status = searchParams.get('status') // 'active', 'expired', 'used', 'all'
    const limit = parseInt(searchParams.get('limit') || '50')

    console.log('📋 Listing vouchers:', { campaign, status, limit, adminEmail })

    // Get Firestore instance
    const db = await getServerFirestore()

    let vouchers: any[] = []
    let stats = {
      total: 0,
      active: 0,
      expired: 0,
      used: 0,
      totalCreditsGenerated: 0,
      totalCreditsRedeemed: 0
    }

    if (db.collection) {
      // Admin SDK
      let query = db.collection('vouchers').orderBy('createdAt', 'desc')
      
      if (campaign) {
        query = query.where('campaignName', '==', campaign)
      }
      
      if (limit > 0) {
        query = query.limit(limit)
      }

      const snapshot = await query.get()
      const now = new Date()

      snapshot.forEach((doc: any) => {
        const data = doc.data()
        const isExpired = data.expiresAt && now > data.expiresAt.toDate()
        const isUsed = data.usedCount >= data.usageLimit
        
        // Apply status filter
        if (status === 'active' && (!data.isActive || isExpired || isUsed)) return
        if (status === 'expired' && !isExpired) return
        if (status === 'used' && !isUsed) return
        
        vouchers.push({
          ...data,
          id: doc.id,
          isExpired,
          isUsed,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          expiresAt: data.expiresAt?.toDate?.() || data.expiresAt,
          lastUsedAt: data.lastUsedAt?.toDate?.() || data.lastUsedAt
        })

        // Update stats
        stats.total++
        stats.totalCreditsGenerated += data.creditAmount
        stats.totalCreditsRedeemed += data.usedCount * data.creditAmount
        
        if (data.isActive && !isExpired && !isUsed) stats.active++
        if (isExpired) stats.expired++
        if (isUsed) stats.used++
      })
    } else {
      // Client SDK fallback
      const { collection, query, orderBy, where, limit: firestoreLimit, getDocs } = await import('firebase/firestore')
      const { db: clientDb } = await import('@/lib/firebase')
      
      let q = query(collection(clientDb, 'vouchers'), orderBy('createdAt', 'desc'))
      
      if (campaign) {
        q = query(q, where('campaignName', '==', campaign))
      }
      
      if (limit > 0) {
        q = query(q, firestoreLimit(limit))
      }

      const snapshot = await getDocs(q)
      const now = new Date()

      snapshot.forEach((doc) => {
        const data = doc.data()
        const isExpired = data.expiresAt && now > data.expiresAt.toDate()
        const isUsed = data.usedCount >= data.usageLimit
        
        // Apply status filter
        if (status === 'active' && (!data.isActive || isExpired || isUsed)) return
        if (status === 'expired' && !isExpired) return
        if (status === 'used' && !isUsed) return
        
        vouchers.push({
          ...data,
          id: doc.id,
          isExpired,
          isUsed,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          expiresAt: data.expiresAt?.toDate?.() || data.expiresAt,
          lastUsedAt: data.lastUsedAt?.toDate?.() || data.lastUsedAt
        })

        // Update stats
        stats.total++
        stats.totalCreditsGenerated += data.creditAmount
        stats.totalCreditsRedeemed += data.usedCount * data.creditAmount
        
        if (data.isActive && !isExpired && !isUsed) stats.active++
        if (isExpired) stats.expired++
        if (isUsed) stats.used++
      })
    }

    return NextResponse.json({
      success: true,
      vouchers,
      stats,
      filters: { campaign, status, limit }
    })

  } catch (error: any) {
    console.error('Voucher listing error:', error)
    return NextResponse.json({ 
      error: error?.message || 'Failed to list vouchers' 
    }, { status: 500 })
  }
}

// DELETE - Delete/deactivate vouchers
export async function DELETE(req: NextRequest) {
  try {
    // Check admin authentication
    const adminEmail = req.headers.get('x-admin-email')
    if (!adminEmail || !isAdminEmail(adminEmail)) {
      return NextResponse.json({ 
        error: 'Admin access required',
        debug: { receivedEmail: adminEmail, isValidAdmin: adminEmail ? isAdminEmail(adminEmail) : false }
      }, { status: 403 })
    }

    const { voucherCodes, action } = await req.json()
    
    if (!voucherCodes || !Array.isArray(voucherCodes) || voucherCodes.length === 0) {
      return NextResponse.json({ 
        error: 'Voucher codes array is required' 
      }, { status: 400 })
    }

    if (!action || !['deactivate', 'delete'].includes(action)) {
      return NextResponse.json({ 
        error: 'Action must be either "deactivate" or "delete"' 
      }, { status: 400 })
    }

    console.log('🗑️ Managing vouchers:', { action, codes: voucherCodes, adminEmail })

    // Get Firestore instance
    const db = await getServerFirestore()
    if (!db) {
      throw new Error('Firestore not available')
    }

    const results = []

    if (db.collection) {
      // Admin SDK
      const batch = db.batch()
      
      for (const code of voucherCodes) {
        const docRef = db.collection('vouchers').doc(code.toUpperCase())
        
        if (action === 'delete') {
          batch.delete(docRef)
        } else {
          batch.update(docRef, { 
            isActive: false, 
            deactivatedAt: new Date(),
            deactivatedBy: adminEmail
          })
        }
        
        results.push({ code, action, success: true })
      }
      
      await batch.commit()
    } else {
      // Client SDK fallback
      const { doc, deleteDoc, updateDoc } = await import('firebase/firestore')
      const { db: clientDb } = await import('@/lib/firebase')
      
      for (const code of voucherCodes) {
        try {
          const docRef = doc(clientDb, 'vouchers', code.toUpperCase())
          
          if (action === 'delete') {
            await deleteDoc(docRef)
          } else {
            await updateDoc(docRef, { 
              isActive: false, 
              deactivatedAt: new Date(),
              deactivatedBy: adminEmail
            })
          }
          
          results.push({ code, action, success: true })
        } catch (error) {
          results.push({ code, action, success: false, error: error instanceof Error ? error.message : 'Unknown error' })
        }
      }
    }

    // Log the management activity
    await logVoucherActivity(db, {
      type: action,
      adminEmail,
      voucherCodes,
      timestamp: new Date()
    })

    return NextResponse.json({
      success: true,
      action,
      results,
      summary: {
        total: voucherCodes.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    })

  } catch (error: any) {
    console.error('Voucher management error:', error)
    return NextResponse.json({ 
      error: error?.message || 'Failed to manage vouchers' 
    }, { status: 500 })
  }
}

async function logVoucherActivity(db: any, activity: any) {
  try {
    await db.collection('voucherActivity').add(activity)
  } catch (error) {
    console.error('Failed to log voucher activity:', error)
    // Don't throw - this is not critical
  }
}




