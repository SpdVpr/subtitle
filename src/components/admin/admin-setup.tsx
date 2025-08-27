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
      const response = await fetch('/api/admin/test-setup', {
        headers: { 'x-admin-email': adminEmail }
      })
      const data = await response.json()
      setDebugInfo(data)
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
          <Button size="sm" variant="outline" onClick={() => quickSetup('admin@subtitle-ai.com')}>
            Use admin@subtitle-ai.com
          </Button>
        </div>

        {debugInfo && (
          <Alert className={debugInfo.success ? 'border-green-200 dark:border-green-800/30 bg-green-50 dark:bg-green-950/30' : 'border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-950/30'}>
            {debugInfo.success ? (
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <strong>Admin Status:</strong> {debugInfo.success ? 'Valid Admin' : 'Access Denied'}
                </div>
                <div>
                  <strong>Email:</strong> {debugInfo.admin?.email || debugInfo.receivedEmail || 'None'}
                </div>

                {debugInfo.firebase && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800/30">
                    <div className="text-blue-800 dark:text-blue-300">
                      <strong>🔥 Firebase:</strong> {debugInfo.firebase.status}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Found {debugInfo.firebase.userCount} users • Admin SDK: {debugInfo.firebase.adminSdkAvailable ? 'Available' : 'Not Available'}
                    </div>
                  </div>
                )}

                {debugInfo.apis && (
                  <div className="p-3 bg-gray-50 dark:bg-muted rounded border border-gray-200 dark:border-border">
                    <div className="text-gray-800 dark:text-foreground">
                      <strong>🔧 API Status:</strong>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-muted-foreground mt-1 space-y-1">
                      <div>Users API: {debugInfo.apis.usersApi}</div>
                      <div>Credits API: {debugInfo.apis.creditsApi}</div>
                      <div>User Management API: {debugInfo.apis.userManagementApi}</div>
                    </div>
                  </div>
                )}

                {debugInfo.recommendations && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded border border-yellow-200 dark:border-yellow-800/30">
                    <div className="text-yellow-800 dark:text-yellow-300">
                      <strong>💡 Recommendations:</strong>
                    </div>
                    <ul className="list-disc list-inside ml-4 text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                      {debugInfo.recommendations.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

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
