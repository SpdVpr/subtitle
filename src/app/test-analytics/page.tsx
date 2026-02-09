'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function TestAnalyticsPage() {
  const { user } = useAuth()
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runTest = async (testName: string, endpoint: string) => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch(`${endpoint}?userId=${user.uid}`)
      const data = await response.json()
      
      setResults(prev => ({
        ...prev,
        [testName]: {
          success: response.ok,
          status: response.status,
          data: data
        }
      }))
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [testName]: {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }
      }))
    }
    setLoading(false)
  }

  const runAllTests = async () => {
    if (!user) return

    setResults({})
    setLoading(true)

    const tests = [
      { name: 'Firebase Test', endpoint: '/api/test-firebase' },
      { name: 'Analytics Diagnostics', endpoint: '/api/test-analytics' },
      { name: 'Working Analytics', endpoint: '/api/analytics-working' },
      { name: 'Original Analytics', endpoint: '/api/analytics' },
      { name: 'Debug Translation Jobs', endpoint: '/api/debug/translation-jobs' }
    ]

    for (const test of tests) {
      await runTest(test.name, test.endpoint)
      await new Promise(resolve => setTimeout(resolve, 500)) // Small delay between tests
    }

    setLoading(false)
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Analytics Diagnostics</CardTitle>
            <CardDescription>Please log in to run analytics tests</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analytics Diagnostics</CardTitle>
          <CardDescription>
            Test suite to diagnose analytics issues for user: {user.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button onClick={runAllTests} disabled={loading}>
              {loading ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => runTest('Firebase Test', '/api/test-firebase')}
              disabled={loading}
            >
              Test Firebase
            </Button>
            <Button 
              variant="outline" 
              onClick={() => runTest('Working Analytics', '/api/analytics-working')}
              disabled={loading}
            >
              Test Working Analytics
            </Button>
          </div>

          {results && (
            <div className="space-y-4">
              {Object.entries(results).map(([testName, result]: [string, any]) => (
                <Card key={testName}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{testName}</CardTitle>
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? 'PASS' : 'FAIL'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {result.status && (
                      <p className="text-sm text-gray-600 mb-2">
                        Status: {result.status}
                      </p>
                    )}
                    
                    {result.error && (
                      <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded mb-3">
                        <p className="text-red-800 dark:text-red-300 font-medium">Error:</p>
                        <p className="text-red-700 dark:text-red-400 text-sm">{result.error}</p>
                      </div>
                    )}
                    
                    {result.data && (
                      <div className="bg-gray-50 dark:bg-muted p-3 rounded">
                        <p className="font-medium mb-2">Response Data:</p>
                        <pre className="text-xs overflow-auto max-h-96">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
