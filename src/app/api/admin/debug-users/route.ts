import { NextRequest, NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/admin-auth-email'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    // Check admin permissions
    const adminEmail = req.headers.get('x-admin-email')
    
    if (!adminEmail || !isAdminEmail(adminEmail)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('🔍 Debug: Checking Firebase configuration...')

    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET',
        FIREBASE_ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID ? 'SET' : 'NOT SET',
        FIREBASE_ADMIN_CLIENT_EMAIL: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ? 'SET' : 'NOT SET',
        FIREBASE_ADMIN_PRIVATE_KEY: process.env.FIREBASE_ADMIN_PRIVATE_KEY ? 'SET' : 'NOT SET'
      },
      tests: []
    }

    // Test 1: Try Firebase Admin SDK
    try {
      const { getAdminDb } = await import('@/lib/firebase-admin')
      const db = getAdminDb()
      
      const snapshot = await db.collection('users').limit(1).get()
      debugInfo.tests.push({
        name: 'Firebase Admin SDK',
        status: 'SUCCESS',
        userCount: snapshot.size,
        message: 'Firebase Admin SDK working'
      })
    } catch (error: any) {
      debugInfo.tests.push({
        name: 'Firebase Admin SDK',
        status: 'FAILED',
        error: error.message
      })
    }

    // Test 2: Try direct Firebase Admin initialization
    try {
      const admin = await import('firebase-admin')
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      
      if (!admin.default.apps.length && projectId) {
        admin.default.initializeApp({ projectId })
      }
      
      const db = admin.default.firestore()
      const snapshot = await db.collection('users').limit(1).get()
      
      debugInfo.tests.push({
        name: 'Direct Firebase Admin',
        status: 'SUCCESS',
        userCount: snapshot.size,
        message: 'Direct Firebase Admin working'
      })
    } catch (error: any) {
      debugInfo.tests.push({
        name: 'Direct Firebase Admin',
        status: 'FAILED',
        error: error.message
      })
    }

    // Test 3: Check if we can find any users with translation data
    try {
      const admin = await import('firebase-admin')
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      
      if (projectId) {
        if (!admin.default.apps.length) {
          admin.default.initializeApp({ projectId })
        }
        
        const db = admin.default.firestore()
        const snapshot = await db.collection('users')
          .where('usage.translationsUsed', '>', 0)
          .limit(5)
          .get()
        
        const usersWithTranslations = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            userId: doc.id,
            email: data.email,
            translationsUsed: data.usage?.translationsUsed || 0,
            creditsBalance: data.creditsBalance || 0
          }
        })
        
        debugInfo.tests.push({
          name: 'Users with translations',
          status: 'SUCCESS',
          userCount: snapshot.size,
          users: usersWithTranslations,
          message: `Found ${snapshot.size} users with translations`
        })
      }
    } catch (error: any) {
      debugInfo.tests.push({
        name: 'Users with translations',
        status: 'FAILED',
        error: error.message
      })
    }

    return NextResponse.json(debugInfo)

  } catch (error: any) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
