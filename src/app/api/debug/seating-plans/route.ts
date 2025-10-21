import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

/**
 * Debug endpoint to check seating plans for a specific user
 * GET /api/debug/seating-plans?userId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || '6ZwHtHVn1yNgH7kPCeIUKdDnkfk2'
    const planId = searchParams.get('planId') || 'seating_1759578964811_ns2o9a80g'

    console.log('🔍 Debugging seating plans for user:', userId)
    console.log('🔍 Looking for plan:', planId)

    const db = getAdminDb()
    const results: any = {
      userId,
      planId,
      timestamp: new Date().toISOString(),
      collections: {}
    }

    // Check all possible collection names where seating data might be stored
    const possibleCollections = [
      'seating',
      'seating_plans',
      'seatings',
      'plans',
      'user_plans',
      'cinema_seating',
      'theater_seating'
    ]

    for (const collectionName of possibleCollections) {
      try {
        console.log(`📂 Checking collection: ${collectionName}`)
        
        // Try to get all documents for this user
        const userDocsSnapshot = await db.collection(collectionName)
          .where('userId', '==', userId)
          .limit(10)
          .get()

        if (!userDocsSnapshot.empty) {
          results.collections[collectionName] = {
            found: true,
            count: userDocsSnapshot.size,
            documents: userDocsSnapshot.docs.map(doc => ({
              id: doc.id,
              data: doc.data()
            }))
          }
          console.log(`✅ Found ${userDocsSnapshot.size} documents in ${collectionName}`)
        } else {
          results.collections[collectionName] = {
            found: false,
            count: 0
          }
        }

        // Also try to get the specific plan by ID
        const specificPlanDoc = await db.collection(collectionName).doc(planId).get()
        if (specificPlanDoc.exists) {
          results.collections[collectionName].specificPlan = {
            found: true,
            id: specificPlanDoc.id,
            data: specificPlanDoc.data()
          }
          console.log(`✅ Found specific plan ${planId} in ${collectionName}`)
        }

      } catch (error: any) {
        results.collections[collectionName] = {
          error: error.message
        }
        console.log(`❌ Error checking ${collectionName}:`, error.message)
      }
    }

    // Also check if there's a subcollection under the user document
    try {
      console.log(`📂 Checking user subcollections`)
      const userDoc = await db.collection('users').doc(userId).get()
      
      if (userDoc.exists) {
        results.userDocument = {
          found: true,
          data: userDoc.data()
        }

        // Try to get subcollections
        const subcollections = await userDoc.ref.listCollections()
        results.userSubcollections = subcollections.map(col => col.id)
        
        // Check each subcollection for seating-related data
        for (const subcol of subcollections) {
          if (subcol.id.toLowerCase().includes('seat') || subcol.id.toLowerCase().includes('plan')) {
            const subcolDocs = await subcol.limit(10).get()
            results.collections[`users/${userId}/${subcol.id}`] = {
              found: true,
              count: subcolDocs.size,
              documents: subcolDocs.docs.map(doc => ({
                id: doc.id,
                data: doc.data()
              }))
            }
          }
        }
      } else {
        results.userDocument = {
          found: false
        }
      }
    } catch (error: any) {
      results.userDocument = {
        error: error.message
      }
    }

    // Summary
    const foundCollections = Object.entries(results.collections)
      .filter(([_, value]: [string, any]) => value.found && value.count > 0)
      .map(([key]) => key)

    results.summary = {
      totalCollectionsChecked: possibleCollections.length,
      collectionsWithData: foundCollections.length,
      foundIn: foundCollections
    }

    return NextResponse.json(results, { status: 200 })

  } catch (error: any) {
    console.error('❌ Error in seating plans debug:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

