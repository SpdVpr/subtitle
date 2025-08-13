'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Settings } from 'lucide-react'

export function AdminSetup() {
  const [adminEmail, setAdminEmail] = useState('')
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load saved admin email
    const saved = localStorage.getItem('adminEmail')
    if (saved) {
      setAdminEmail(saved)
    }
  }, [])

  const saveAdminEmail = () => {
    localStorage.setItem('adminEmail', adminEmail)
    alert('Admin email saved! Refresh the page to apply changes.')
  }

  const testAdminAccess = async () => {
    setLoading(true)
    try {
      // Test admin endpoint
      const adminResponse = await fetch('/api/debug/admin', {
        headers: { 'x-admin-email': adminEmail }
      })
      const adminData = await adminResponse.json()

      // Test mock users endpoint
      const mockResponse = await fetch('/api/admin/users-mock', {
        headers: { 'x-admin-email': adminEmail }
      })
      const mockData = await mockResponse.json()

      setDebugInfo({
        admin: adminData,
        mockUsers: mockData,
        canUseMockData: mockResponse.ok
      })
    } catch (error) {
      setDebugInfo({ error: 'Failed to test admin access' })
    } finally {
      setLoading(false)
    }
  }

  const quickSetup = (email: string) => {
    setAdminEmail(email)
    localStorage.setItem('adminEmail', email)
    alert(`Admin email set to: ${email}. Refresh the page!`)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Admin Setup</span>
        </CardTitle>
        <CardDescription>
          Configure admin access for dashboard functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Enter admin email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
          />
          <Button onClick={saveAdminEmail}>Save</Button>
          <Button variant="outline" onClick={testAdminAccess} disabled={loading}>
            {loading ? 'Testing...' : 'Test'}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => quickSetup('premium@test.com')}>
            Use premium@test.com
          </Button>
          <Button size="sm" variant="outline" onClick={() => quickSetup('pro@test.com')}>
            Use pro@test.com
          </Button>
          <Button size="sm" variant="outline" onClick={() => quickSetup('admin@subtitle-ai.com')}>
            Use admin@subtitle-ai.com
          </Button>
        </div>

        {debugInfo && (
          <Alert className={debugInfo.admin?.debug?.isValidAdmin ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {debugInfo.admin?.debug?.isValidAdmin ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <strong>Admin Status:</strong> {debugInfo.admin?.debug?.isValidAdmin ? 'Valid Admin' : 'Access Denied'}
                </div>
                <div>
                  <strong>Email:</strong> {debugInfo.admin?.debug?.receivedEmail || 'None'}
                </div>

                {debugInfo.canUseMockData && (
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="text-blue-800">
                      <strong>✅ Mock Data Available:</strong> Found {debugInfo.mockUsers?.count || 0} test users
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                      You can use mock data while setting up Firestore rules
                    </div>
                  </div>
                )}

                <div>
                  <strong>Allowed Emails:</strong>
                  <ul className="list-disc list-inside ml-4 text-sm">
                    {debugInfo.admin?.debug?.allowedEmails?.map((email: string) => (
                      <li key={email}>{email}</li>
                    ))}
                  </ul>
                </div>

                {debugInfo.error && (
                  <div className="text-red-600">
                    <strong>Error:</strong> {debugInfo.error}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Make sure you have published the Firestore Security Rules 
            in Firebase Console → Firestore → Rules. Without proper rules, admin access will be denied.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
