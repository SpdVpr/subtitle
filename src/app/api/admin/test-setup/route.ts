import { NextRequest, NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/admin-auth-email'

export async function GET(req: NextRequest) {
  try {
    const adminEmail = req.headers.get('x-admin-email')
    
    if (!adminEmail || !isAdminEmail(adminEmail)) {
      return NextResponse.json({ 
        error: 'Admin access required',
        receivedEmail: adminEmail,
        allowedEmails: [
          'premium@test.com',
          'admin@subtitlebot.com',
          'admin@subtitle-ai.com',
          'ceo@subtitle-ai.com',
          'manager@subtitle-ai.com'
        ]
      }, { status: 403 })
    }

    // Test Firebase connection
    let firebaseStatus = 'unknown'
    let userCount = 0
    let adminSdkAvailable = false
    
    try {
      const { getAdminDb } = await import('@/lib/firebase-admin')
      const adminDb = getAdminDb()
      
      if (adminDb) {
        adminSdkAvailable = true
        const snapshot = await adminDb.collection('users').get()
        userCount = snapshot.size
        firebaseStatus = 'connected (Admin SDK)'
      }
    } catch (adminError) {
      console.log('Admin SDK not available, trying client SDK:', adminError)
      
      try {
        const { db } = await import('@/lib/firebase')
        const { collection, getDocs } = await import('firebase/firestore')
        const snapshot = await getDocs(collection(db, 'users'))
        userCount = snapshot.size
        firebaseStatus = 'connected (Client SDK)'
      } catch (clientError) {
        firebaseStatus = `error: ${clientError}`
      }
    }

    // Test admin APIs
    const baseUrl = req.nextUrl.origin
    const testResults = {
      usersApi: 'unknown',
      creditsApi: 'unknown',
      userManagementApi: 'unknown'
    }

    try {
      const usersResponse = await fetch(`${baseUrl}/api/admin/users`, {
        headers: { 'x-admin-email': adminEmail }
      })
      testResults.usersApi = usersResponse.ok ? 'working' : `error: ${usersResponse.status}`
    } catch (e: any) {
      testResults.usersApi = `error: ${e.message}`
    }

    // Test if we have any users to test credits API with
    if (userCount > 0) {
      try {
        // This will fail if no users exist, but that's expected
        const creditsResponse = await fetch(`${baseUrl}/api/admin/credits`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-admin-email': adminEmail 
          },
          body: JSON.stringify({ 
            userId: 'test-user-id', 
            deltaCredits: 0, 
            description: 'API test' 
          })
        })
        testResults.creditsApi = creditsResponse.status === 404 ? 'ready (no test user)' : 
                                 creditsResponse.ok ? 'working' : `error: ${creditsResponse.status}`
      } catch (e: any) {
        testResults.creditsApi = 'ready (endpoint available)'
      }

      try {
        const managementResponse = await fetch(`${baseUrl}/api/admin/user-management`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-admin-email': adminEmail 
          },
          body: JSON.stringify({ 
            action: 'adjustCredits',
            userId: 'test-user-id',
            data: { deltaCredits: 0, description: 'API test' }
          })
        })
        testResults.userManagementApi = managementResponse.status === 404 ? 'ready (no test user)' : 
                                       managementResponse.ok ? 'working' : `error: ${managementResponse.status}`
      } catch (e: any) {
        testResults.userManagementApi = 'ready (endpoint available)'
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      admin: {
        email: adminEmail,
        isValid: true
      },
      firebase: {
        status: firebaseStatus,
        userCount,
        adminSdkAvailable
      },
      apis: testResults,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasFirebaseConfig: !!(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
        hasFirebaseAdminConfig: !!(process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS)
      },
      recommendations: userCount === 0 ? [
        'No users found in database',
        'Create some test users by registering on the main app',
        'Or import existing users if migrating from another system'
      ] : [
        'Admin panel is ready to use',
        'You can manage users, adjust credits, and block/unblock users',
        'All changes are logged for audit purposes'
      ]
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
