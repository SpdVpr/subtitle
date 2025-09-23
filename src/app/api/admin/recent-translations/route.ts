import { NextRequest, NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/admin-auth-email'
import { TranslationJobService } from '@/lib/database-admin'

// Force Node.js runtime for Firebase Admin SDK
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    // Check admin permissions
    const adminEmail = req.headers.get('x-admin-email')
    console.log('🔍 Recent translations API request from:', adminEmail)

    if (!adminEmail || !isAdminEmail(adminEmail)) {
      console.log('❌ Admin access denied for:', adminEmail)
      return NextResponse.json({
        error: 'Admin access required',
        debug: {
          receivedEmail: adminEmail,
          isValidAdmin: adminEmail ? isAdminEmail(adminEmail) : false,
          allowedEmails: [
            'premium@test.com',
            'admin@subtitlebot.com',
            'admin@subtitle-ai.com',
            'ceo@subtitle-ai.com',
            'manager@subtitle-ai.com'
          ]
        }
      }, { status: 403 })
    }

    console.log('✅ Admin access granted for:', adminEmail)

    console.log('🔑 Admin API access granted for:', adminEmail)

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    console.log('📋 Fetching recent translations, limit:', limit, 'page:', page, 'offset:', offset)

    // Get recent translations with user info
    try {
      const result = await TranslationJobService.getRecentTranslations(limit, offset)
      console.log('✅ Found', result.translations.length, 'recent translations, total:', result.totalCount)

    // Format the response data
    const formattedTranslations = result.translations.map(translation => {
      // Convert Firestore timestamps to ISO strings for JSON serialization
      const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return null
        if (timestamp.seconds) {
          // Firestore Timestamp
          return new Date(timestamp.seconds * 1000).toISOString()
        } else if (timestamp._seconds) {
          // Alternative Firestore Timestamp format
          return new Date(timestamp._seconds * 1000).toISOString()
        } else if (timestamp instanceof Date) {
          return timestamp.toISOString()
        } else {
          return new Date(timestamp).toISOString()
        }
      }

      return {
        id: translation.id,
        originalFileName: translation.originalFileName,
        translatedFileName: translation.translatedFileName,
        sourceLanguage: translation.sourceLanguage || 'auto',
        targetLanguage: translation.targetLanguage,
        userEmail: translation.userEmail,
        userDisplayName: translation.userDisplayName,
        userId: translation.userId,
        status: translation.status,
        aiService: translation.aiService,
        subtitleCount: translation.subtitleCount,
        characterCount: translation.characterCount,
        processingTimeMs: translation.processingTimeMs,
        createdAt: formatTimestamp(translation.createdAt),
        completedAt: formatTimestamp(translation.completedAt),
        translatedContent: translation.translatedContent, // For download functionality
        confidence: translation.confidence
      }
    })

      return NextResponse.json({
        success: true,
        count: result.translations.length,
        totalCount: result.totalCount,
        currentPage: page,
        totalPages: Math.ceil(result.totalCount / limit),
        hasMore: result.hasMore,
        translations: formattedTranslations
      })
    } catch (dbError) {
      console.error('❌ Database error in recent translations:', dbError)

      // Check if it's a permissions error
      if (dbError instanceof Error && dbError.message.includes('Missing or insufficient permissions')) {
        console.error('🔒 Firebase permissions error - Admin SDK may not be configured properly')
        return NextResponse.json({
          success: false,
          error: 'Database permissions error. Please check Firebase Admin SDK configuration.',
          details: dbError.message,
          suggestion: 'Ensure FIREBASE_ADMIN_PRIVATE_KEY and FIREBASE_ADMIN_CLIENT_EMAIL are set correctly'
        }, { status: 500 })
      }

      return NextResponse.json({
        success: false,
        error: dbError instanceof Error ? dbError.message : 'Database error occurred'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ Recent translations API error:', error)

    // Check if it's a permissions error
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      console.error('🔒 Firebase permissions error - Admin SDK may not be configured properly')
      return NextResponse.json({
        success: false,
        error: 'Database permissions error. Please check Firebase Admin SDK configuration.',
        details: error.message,
        suggestion: 'Ensure FIREBASE_ADMIN_PRIVATE_KEY and FIREBASE_ADMIN_CLIENT_EMAIL are set correctly'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get recent translations'
    }, { status: 500 })
  }
}
