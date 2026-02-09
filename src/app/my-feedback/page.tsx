'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, RefreshCw, Reply, Clock, CheckCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface FeedbackItem {
  id: string
  feedback: string
  timestamp: any
  submittedAt: string
  locale: string
  url?: string
  status: 'new' | 'read' | 'resolved' | 'replied'
  priority: 'low' | 'normal' | 'high'
  adminReply?: string
  adminId?: string
  adminName?: string
  repliedAt?: string
  adminResponse?: {
    message: string
    respondedBy: string
    respondedAt: any
    notificationSent: boolean
  }
}

export default function MyFeedbackPage() {
  const { user, loading: authLoading } = useAuth()
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadFeedback = async () => {
    if (!user?.uid) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/user/feedback?userId=${user.uid}`)

      if (!response.ok) {
        throw new Error('Failed to load feedback')
      }

      const data = await response.json()
      setFeedback(data.feedback || [])
    } catch (error) {
      console.error('Failed to load feedback:', error)
      toast.error('Failed to load feedback')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      loadFeedback()
    } else if (!authLoading && !user) {
      setIsLoading(false)
    }
  }, [user, authLoading])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="h-4 w-4" />
      case 'read': return <MessageSquare className="h-4 w-4" />
      case 'resolved': return <CheckCircle className="h-4 w-4" />
      case 'replied': return <Reply className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'read': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'replied': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const formatDate = (timestamp: any) => {
    try {
      if (timestamp && timestamp.toDate) {
        return timestamp.toDate().toLocaleString('en-US')
      }
      if (timestamp) {
        return new Date(timestamp).toLocaleString('en-US')
      }
      return 'N/A'
    } catch {
      return 'N/A'
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
              <CardDescription>
                You need to be logged in to view your feedback.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  My Feedback
                </CardTitle>
                <CardDescription>
                  View your submitted feedback and responses from our team
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadFeedback}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {feedback.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No feedback yet</p>
                <p className="text-muted-foreground mb-4">
                  You haven't submitted any feedback yet
                </p>
                <Button asChild>
                  <Link href="/feedback">Submit Feedback</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {feedback.map((item) => (
                  <Card key={item.id} className="border-l-4 border-l-primary/20">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(item.status)}>
                              {getStatusIcon(item.status)}
                              <span className="ml-1 capitalize">{item.status}</span>
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(item.timestamp)}
                          </div>
                        </div>

                        {/* Your feedback */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Your message:</p>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">{item.feedback}</p>
                          </div>
                        </div>

                        {/* Admin Response - New format */}
                        {item.adminReply && (
                          <div className="border-l-2 border-purple-500 pl-3 py-2 bg-purple-50 dark:bg-purple-950/20 rounded">
                            <div className="flex items-center gap-2 mb-2">
                              <Reply className="h-4 w-4 text-purple-600" />
                              <span className="text-xs font-medium text-purple-600">
                                {item.adminName || 'Team'} replied
                              </span>
                              {item.repliedAt && (
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(item.repliedAt)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{item.adminReply}</p>
                          </div>
                        )}

                        {/* Admin Response - Old format (backward compatibility) */}
                        {!item.adminReply && item.adminResponse && (
                          <div className="border-l-2 border-purple-500 pl-3 py-2 bg-purple-50 dark:bg-purple-950/20 rounded">
                            <div className="flex items-center gap-2 mb-2">
                              <Reply className="h-4 w-4 text-purple-600" />
                              <span className="text-xs font-medium text-purple-600">Team Response</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(item.adminResponse.respondedAt)}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{item.adminResponse.message}</p>
                          </div>
                        )}

                        {/* Waiting for response */}
                        {!item.adminReply && !item.adminResponse && item.status !== 'resolved' && (
                          <div className="text-xs text-muted-foreground italic">
                            ⏳ Waiting for response from our team...
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info box */}
        <Card className="mt-6 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">💡 Tip</p>
                <p className="text-muted-foreground">
                  When you're logged in, we can respond to your feedback. 
                  You'll see responses here on this page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

