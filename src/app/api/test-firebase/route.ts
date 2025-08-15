import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasFirebaseConfig: !!process.env.FIREBASE_PROJECT_ID,
      hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    }
  }

  const addTest = (name: string, success: boolean, data?: any, error?: any) => {
    results.tests.push({
      name,
      success,
      data,
      error: error?.message || error,
      timestamp: new Date().toISOString()
    })
  }

  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') || '06qbus30g5eFf3QlN6TQouOYF6s2'

    // Test 1: Check environment variables
    try {
      const envVars = {
        FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
        FIREBASE_SERVICE_ACCOUNT_KEY: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
        NODE_ENV: process.env.NODE_ENV
      }
      addTest('Environment variables', true, envVars)
    } catch (error) {
      addTest('Environment variables', false, null, error)
    }

    // Test 2: Test Firebase Admin initialization
    try {
      const { getAdminApp, getAdminDb } = await import('@/lib/firebase-admin')
      const app = getAdminApp()
      const db = getAdminDb()
      
      addTest('Firebase Admin init', true, {
        appName: app.name,
        hasDb: !!db
      })
    } catch (error) {
      addTest('Firebase Admin init', false, null, error)
    }

    // Test 3: Test database connection
    try {
      const { getAdminDb } = await import('@/lib/firebase-admin')
      const db = getAdminDb()
      
      // Try to read from users collection
      const usersSnapshot = await db.collection('users').limit(1).get()
      
      addTest('Database connection', true, {
        canConnect: true,
        usersCollectionExists: !usersSnapshot.empty,
        userCount: usersSnapshot.size
      })
    } catch (error) {
      addTest('Database connection', false, null, error)
    }

    // Test 4: Test translation_jobs collection
    try {
      const { getAdminDb } = await import('@/lib/firebase-admin')
      const db = getAdminDb()
      
      const jobsSnapshot = await db.collection('translation_jobs').limit(5).get()
      const jobs = jobsSnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }))
      
      addTest('Translation jobs collection', true, {
        jobCount: jobsSnapshot.size,
        hasJobs: !jobsSnapshot.empty,
        sampleJobs: jobs.slice(0, 2)
      })
    } catch (error) {
      addTest('Translation jobs collection', false, null, error)
    }

    // Test 5: Test specific user's jobs
    try {
      const { getAdminDb } = await import('@/lib/firebase-admin')
      const db = getAdminDb()
      
      const userJobsSnapshot = await db.collection('translation_jobs')
        .where('userId', '==', userId)
        .limit(10)
        .get()
      
      const userJobs = userJobsSnapshot.docs.map(doc => ({
        id: doc.id,
        userId: doc.data().userId,
        fileName: doc.data().originalFileName,
        status: doc.data().status,
        createdAt: doc.data().createdAt,
        targetLanguage: doc.data().targetLanguage
      }))
      
      addTest('User specific jobs', true, {
        userId,
        jobCount: userJobsSnapshot.size,
        jobs: userJobs
      })
    } catch (error) {
      addTest('User specific jobs', false, null, error)
    }

    // Test 6: Test TranslationJobService
    try {
      const { TranslationJobService } = await import('@/lib/database-admin')
      const jobs = await TranslationJobService.getUserJobs(userId, 5)
      
      addTest('TranslationJobService', true, {
        serviceWorks: true,
        jobCount: jobs.length,
        jobs: jobs.map(job => ({
          id: job.id,
          fileName: job.originalFileName,
          status: job.status,
          targetLanguage: job.targetLanguage,
          createdAt: job.createdAt
        }))
      })
    } catch (error) {
      addTest('TranslationJobService', false, null, error)
    }

    return NextResponse.json(results)

  } catch (error) {
    console.error('❌ Firebase test failed:', error)
    addTest('Overall Firebase test', false, null, error)
    return NextResponse.json(results, { status: 500 })
  }
}
