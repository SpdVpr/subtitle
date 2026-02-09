'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, RefreshCw, TrendingUp, Users, Shield, DollarSign, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

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

export function RegistrationMonitoring() {
  const [loading, setLoading] = useState(true)
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([])
  const [stats, setStats] = useState<Stats | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
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

  useEffect(() => {
    loadData()
  }, [])

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
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Anti-Abuse System:</strong> Automaticky detekuje podezřelé registrace na základě IP adresy a browser fingerprinting.
          <br />
          <strong>Kredity:</strong> Normální (100) • Podezřelé 50-79 (20) • Velmi podezřelé 80+ (0)
        </AlertDescription>
      </Alert>

      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Registration Anti-Abuse
          </h2>
          <p className="text-muted-foreground mt-1">
            Monitoring podezřelých registrací a duplicitních účtů
          </p>
        </div>
        <Button onClick={loadData} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Registrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Last 30 days
              </p>
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
              <p className="text-xs text-muted-foreground mt-1">
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
              <p className="text-xs text-muted-foreground mt-1">
                Total given out
              </p>
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
              <p className="text-xs text-muted-foreground mt-1">
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
              <p className="text-xs text-muted-foreground mt-1">
                Suspicious score
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Suspicious Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Suspicious Registrations</CardTitle>
          <CardDescription>
            Registrace s suspicious score ≥ 50 (snížené kredity na 20)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-lg font-medium">No suspicious registrations found</p>
              <p className="text-muted-foreground">All registrations look legitimate! 🎉</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Email</th>
                    <th className="text-left py-3 px-2 font-medium">Method</th>
                    <th className="text-left py-3 px-2 font-medium">Score</th>
                    <th className="text-center py-3 px-2 font-medium">IP Dupes</th>
                    <th className="text-center py-3 px-2 font-medium">Browser Dupes</th>
                    <th className="text-left py-3 px-2 font-medium">Credits</th>
                    <th className="text-left py-3 px-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-2 font-mono text-sm">{reg.email}</td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className="capitalize">
                          {reg.registrationMethod}
                        </Badge>
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
                        <span className={reg.creditsReduced ? 'text-orange-500 font-bold' : 'font-medium'}>
                          {reg.creditsAwarded}
                        </span>
                        {reg.creditsReduced && (
                          <span className="text-xs text-muted-foreground ml-1">(reduced)</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">
                        {reg.createdAt?.toDate ? 
                          new Date(reg.createdAt.toDate()).toLocaleDateString('cs-CZ', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }) :
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

      {/* Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Normal Credits:</span>
            <span className="font-medium">100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Suspicious Credits:</span>
            <span className="font-medium text-orange-500">20</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Suspicious Threshold:</span>
            <span className="font-medium">Score ≥ 50</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rate Limit:</span>
            <span className="font-medium">3 registrations/hour per IP</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

