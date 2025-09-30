'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, TrendingUp, Users, Shield, DollarSign } from 'lucide-react'

interface RegistrationRecord {
  id: string
  userId: string
  email: string
  ipAddress: string
  browserFingerprint: string
  suspiciousScore: number
  duplicateIpCount: number
  duplicateFingerprintCount: number
  creditsAwarded: number
  creditsReduced: boolean
  registrationMethod: 'email' | 'google'
  createdAt: any
}

interface Stats {
  total: number
  suspicious: number
  creditsAwarded: number
  creditsSaved: number
  averageSuspiciousScore: number
}

export default function RegistrationMonitoringPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([])
  const [stats, setStats] = useState<Stats | null>(null)

  // Check if user is admin
  const isAdmin = user?.email && [
    'admin@subtitlebot.com',
    'admin@subtitle-ai.com',
    'ceo@subtitle-ai.com',
    'manager@subtitle-ai.com'
  ].includes(user.email)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!isAdmin) {
      router.push('/')
      return
    }

    loadData()
  }, [user, isAdmin, router])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load suspicious registrations
      const response = await fetch('/api/admin/registration-monitoring')
      if (response.ok) {
        const data = await response.json()
        setRegistrations(data.registrations || [])
        setStats(data.stats || null)
      }
    } catch (error) {
      console.error('Error loading registration data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user || !isAdmin) {
    return null
  }

  const getSuspiciousScoreBadge = (score: number) => {
    if (score >= 80) {
      return <Badge variant="destructive">Very High ({score})</Badge>
    } else if (score >= 50) {
      return <Badge variant="default" className="bg-orange-500">High ({score})</Badge>
    } else if (score >= 30) {
      return <Badge variant="secondary">Medium ({score})</Badge>
    } else {
      return <Badge variant="outline">Low ({score})</Badge>
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Registration Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">
            Anti-abuse system for detecting suspicious registrations
          </p>
        </div>
        <Button onClick={loadData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Registrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Suspicious
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.suspicious}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? ((stats.suspicious / stats.total) * 100).toFixed(1) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                Credits Awarded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.creditsAwarded}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                Credits Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.creditsSaved}</div>
              <p className="text-xs text-muted-foreground">
                Prevented abuse
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Avg. Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageSuspiciousScore.toFixed(1)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Suspicious Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Suspicious Registrations</CardTitle>
          <CardDescription>
            Registrations with suspicious score ≥ 50 (reduced credits)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-lg font-medium">No suspicious registrations found</p>
              <p className="text-muted-foreground">All registrations look legitimate!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Email</th>
                    <th className="text-left py-3 px-2">Method</th>
                    <th className="text-left py-3 px-2">Score</th>
                    <th className="text-left py-3 px-2">IP Duplicates</th>
                    <th className="text-left py-3 px-2">Browser Duplicates</th>
                    <th className="text-left py-3 px-2">Credits</th>
                    <th className="text-left py-3 px-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 font-mono text-sm">{reg.email}</td>
                      <td className="py-3 px-2">
                        <Badge variant="outline">{reg.registrationMethod}</Badge>
                      </td>
                      <td className="py-3 px-2">
                        {getSuspiciousScoreBadge(reg.suspiciousScore)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {reg.duplicateIpCount > 0 ? (
                          <Badge variant="destructive">{reg.duplicateIpCount}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {reg.duplicateFingerprintCount > 0 ? (
                          <Badge variant="destructive">{reg.duplicateFingerprintCount}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <span className={reg.creditsReduced ? 'text-orange-500 font-bold' : ''}>
                          {reg.creditsAwarded}
                        </span>
                        {reg.creditsReduced && (
                          <span className="text-xs text-muted-foreground ml-1">(reduced)</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">
                        {reg.createdAt?.toDate ? 
                          new Date(reg.createdAt.toDate()).toLocaleDateString() :
                          'N/A'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

