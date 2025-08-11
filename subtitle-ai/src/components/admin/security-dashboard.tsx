'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Lock, 
  Eye,
  TrendingUp,
  Clock
} from 'lucide-react'

interface SecurityEvent {
  id: string
  type: 'rate_limit' | 'suspicious_activity' | 'invalid_origin' | 'validation_error'
  timestamp: Date
  ip: string
  userAgent: string
  details: Record<string, any>
  severity: 'low' | 'medium' | 'high'
}

interface SecurityMetrics {
  totalEvents: number
  rateLimitViolations: number
  suspiciousActivities: number
  blockedRequests: number
  uniqueIPs: number
  topThreats: Array<{ type: string; count: number }>
}

export function SecurityDashboard() {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSecurityData()
  }, [])

  const loadSecurityData = async () => {
    try {
      setLoading(true)
      
      // Mock security data (in production, fetch from API)
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'rate_limit',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          details: { endpoint: '/api/translate', limit: 10 },
          severity: 'medium'
        },
        {
          id: '2',
          type: 'suspicious_activity',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          ip: '10.0.0.50',
          userAgent: 'curl/7.68.0',
          details: { patterns: ['sql_injection_attempt'] },
          severity: 'high'
        },
        {
          id: '3',
          type: 'invalid_origin',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          ip: '203.0.113.1',
          userAgent: 'PostmanRuntime/7.28.0',
          details: { origin: 'https://malicious-site.com' },
          severity: 'high'
        }
      ]

      const mockMetrics: SecurityMetrics = {
        totalEvents: 156,
        rateLimitViolations: 45,
        suspiciousActivities: 12,
        blockedRequests: 8,
        uniqueIPs: 89,
        topThreats: [
          { type: 'Rate Limit', count: 45 },
          { type: 'Bot Activity', count: 23 },
          { type: 'Invalid Origin', count: 15 },
          { type: 'SQL Injection', count: 8 }
        ]
      }

      setEvents(mockEvents)
      setMetrics(mockMetrics)
    } catch (error) {
      console.error('Failed to load security data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'rate_limit':
        return <Clock className="h-4 w-4" />
      case 'suspicious_activity':
        return <AlertTriangle className="h-4 w-4" />
      case 'invalid_origin':
        return <Shield className="h-4 w-4" />
      case 'validation_error':
        return <Eye className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Security Metrics */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalEvents}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rate Limits</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.rateLimitViolations}</div>
              <p className="text-xs text-muted-foreground">Violations detected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blocked Requests</CardTitle>
              <Shield className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.blockedRequests}</div>
              <p className="text-xs text-muted-foreground">Malicious attempts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.uniqueIPs}</div>
              <p className="text-xs text-muted-foreground">Active sources</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Threats */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Top Security Threats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topThreats.map((threat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-sm font-medium">{threat.type}</span>
                  </div>
                  <Badge variant="secondary">{threat.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <Alert key={event.id} className={getSeverityColor(event.severity)}>
                <div className="flex items-start space-x-3">
                  {getEventIcon(event.type)}
                  <div className="flex-1">
                    <AlertDescription>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium capitalize">
                          {event.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs">
                          {event.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>IP: <code className="bg-gray-100 px-1 rounded">{event.ip}</code></div>
                        <div className="text-xs text-gray-600 truncate">
                          UA: {event.userAgent}
                        </div>
                        {Object.entries(event.details).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            {key}: <code className="bg-gray-100 px-1 rounded">
                              {Array.isArray(value) ? value.join(', ') : String(value)}
                            </code>
                          </div>
                        ))}
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
