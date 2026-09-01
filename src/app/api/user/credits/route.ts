import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/database-admin'
import { verifyUser } from '@/lib/user-auth-server'
import { getAdminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = authUser.uid

    console.log('💳 Getting credits for user:', userId)

    const user = await UserService.getUser(userId)
    
    if (!user) {
      // Graceful fallback for demo/unknown users - give them credits for testing
      const isDemo = userId.includes('demo') || userId === 'premium-user-demo'
      const demoCredits = isDemo ? 1000 : 0 // Give demo users 1000 credits

      return NextResponse.json({
        success: true,
        credits: demoCredits,
        totalPurchased: demoCredits,
        user: { uid: userId, email: null, displayName: null }
      })
    }

    let actualPurchasedCredits = 0
    try {
      const purchases = await getAdminDb().collection('creditTransactions')
        .where('userId', '==', userId)
        .select('credits', 'description')
        .get()
      purchases.forEach((doc) => {
        const data = doc.data()
        if (/^Purchased \d+ credits - /.test(data.description || '') && !/simulated/i.test(data.description || '')) {
          actualPurchasedCredits += Number(data.credits || 0)
        }
      })
    } catch (error) {
      console.warn('Failed to calculate purchased credits:', error)
    }

    const freeClaimedAt = (user.freeTranslationClaimedAt as any)?.toDate?.() || null
    const hasActiveFreeClaim = Boolean(
      user.freeTranslationClaimId &&
      freeClaimedAt &&
      Date.now() - freeClaimedAt.getTime() < 15 * 60 * 1000
    )

    return NextResponse.json({
      success: true,
      credits: user.creditsBalance || 0,
      totalPurchased: actualPurchasedCredits,
      freeTranslationAvailable:
        !user.freeTranslationUsed &&
        !hasActiveFreeClaim &&
        Number(user.usage?.translationsUsed || 0) === 0 &&
        Number(user.registrationTracking?.suspiciousScore || 0) < 50,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      }
    })

  } catch (error) {
    console.error('❌ Error getting user credits:', error)
    return NextResponse.json({
      error: 'Failed to get user credits',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
