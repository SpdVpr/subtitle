import { NextRequest, NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/admin-auth-email'

// Mock users data for development/testing when Firestore rules are blocking access
const MOCK_USERS = [
  {
    userId: 'user-1',
    email: 'test@example.com',
    plan: 'credits',
    lastActive: new Date('2024-01-15'),
    translationsCount: 5,
    creditsBalance: 150.5
  },
  {
    userId: 'user-2', 
    email: 'premium@test.com',
    plan: 'credits',
    lastActive: new Date('2024-01-14'),
    translationsCount: 25,
    creditsBalance: 75.2
  },
  {
    userId: 'user-3',
    email: 'newuser@gmail.com', 
    plan: 'credits',
    lastActive: new Date('2024-01-13'),
    translationsCount: 2,
    creditsBalance: 200.0
  },
  {
    userId: 'user-4',
    email: 'poweruser@company.com',
    plan: 'credits', 
    lastActive: new Date('2024-01-12'),
    translationsCount: 50,
    creditsBalance: 25.8
  },
  {
    userId: 'user-5',
    email: 'student@university.edu',
    plan: 'free',
    lastActive: new Date('2024-01-10'),
    translationsCount: 0,
    creditsBalance: 0.0
  }
]

export async function GET(req: NextRequest) {
  try {
    // Check admin permissions
    const adminEmail = req.headers.get('x-admin-email')
    if (!adminEmail || !isAdminEmail(adminEmail)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('🎭 Using mock users data for admin:', adminEmail)

    // Return mock data with realistic structure
    return NextResponse.json({
      success: true,
      count: MOCK_USERS.length,
      users: MOCK_USERS,
      note: 'This is mock data for development. Real Firestore data requires proper security rules setup.'
    })
  } catch (error: any) {
    console.error('Mock admin users error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to get mock users'
    }, { status: 500 })
  }
}
