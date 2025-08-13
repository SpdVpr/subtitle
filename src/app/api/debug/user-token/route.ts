import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    // Get Firebase Auth token from request
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        error: 'No auth token provided',
        debug: {
          authHeader: authHeader,
          headers: Object.fromEntries(req.headers.entries())
        }
      })
    }

    const token = authHeader.split('Bearer ')[1]
    
    // Verify token with Firebase Admin (if available)
    try {
      const admin = await import('firebase-admin')
      
      if (!admin.apps.length) {
        // Initialize Firebase Admin if not already done
        // For now, just return token info without verification
        return NextResponse.json({
          message: 'Firebase Admin not initialized',
          tokenReceived: !!token,
          tokenLength: token?.length || 0
        })
      }
      
      const decodedToken = await admin.auth().verifyIdToken(token)
      
      return NextResponse.json({
        success: true,
        userInfo: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
          name: decodedToken.name,
          picture: decodedToken.picture
        },
        tokenClaims: decodedToken
      })
    } catch (adminError) {
      return NextResponse.json({
        error: 'Token verification failed',
        adminError: adminError instanceof Error ? adminError.message : String(adminError),
        tokenReceived: !!token,
        tokenLength: token?.length || 0
      })
    }
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
