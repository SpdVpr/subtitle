'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, RefreshCw, Clock, CheckCircle, AlertTriangle, Flag, Reply, Send, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface FeedbackItem {
  id: string
  feedback: string
  timestamp: any
  submittedAt: string
  locale: string
  url?: string
  ipHash: string
  userAgent?: string
  status: 'new' | 'read' | 'resolved' | 'replied'
  priority: 'low' | 'normal' | 'high'
  userId?: string
  userEmail?: string
  userName?: string
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

export function FeedbackManagement() {
  const { user } = useAuth()
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [isSendingReply, setIsSendingReply] = useState(false)

  const loadFeedback = async () => {
    if (!user?.email) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('limit', '100')
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/admin/feedback?${params}`, {
        headers: {
          'x-admin-email': user.email
        }
      })

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

  const updateFeedbackStatus = async (feedbackId: string, status: string, priority?: string) => {
    if (!user?.email) return

    try {
      const response = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': user.email
        },
        body: JSON.stringify({
          feedbackId,
          status,
          priority
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update feedback')
      }

      toast.success('Feedback updated successfully')
      loadFeedback() // Reload data
    } catch (error) {
      console.error('Failed to update feedback:', error)
      toast.error('Failed to update feedback')
    }
  }

  const sendReply = async (feedbackId: string) => {
    if (!user?.email || !user?.uid) return
    if (replyMessage.trim().length < 10) {
      toast.error('Reply must be at least 10 characters')
      return
    }

    setIsSendingReply(true)
    try {
      const response = await fetch(`/api/feedback/${feedbackId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reply: replyMessage.trim(),
          adminId: user.uid,
          adminName: user.displayName || user.email || 'Admin'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send reply')
      }

      const result = await response.json()

      if (result.notificationSent) {
        toast.success('Reply sent and user notified!')
      } else {
        toast.success('Reply sent successfully!')
      }

      setReplyingTo(null)
      setReplyMessage('')
      loadFeedback() // Reload data
    } catch (error) {
      console.error('Failed to send reply:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send reply')
    } finally {
      setIsSendingReply(false)
    }
  }

  useEffect(() => {
    loadFeedback()
  }, [user, statusFilter])

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'normal': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const formatDate = (timestamp: any, submittedAt: string) => {
    try {
      // Try to use Firestore timestamp first
      if (timestamp && timestamp.toDate) {
        return timestamp.toDate().toLocaleString()
      }
      // Fallback to submitted timestamp
      return new Date(submittedAt).toLocaleString()
    } catch {
      return 'Unknown date'
    }
  }

  const newCount = feedback.filter(f => f.status === 'new').length
  const readCount = feedback.filter(f => f.status === 'read').length
  const resolvedCount = feedback.filter(f => f.status === 'resolved').length

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">New</p>
                <p className="text-2xl font-bold">{newCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Read</p>
                <p className="text-2xl font-bold">{readCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Resolved</p>
                <p className="text-2xl font-bold">{resolvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{feedback.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                User Feedback
              </CardTitle>
              <CardDescription>
                Anonymous feedback from users to help improve the platform
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={loadFeedback}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Loading feedback...</p>
            </div>
          ) : feedback.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No feedback found</p>
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
                          <Badge variant="outline">
                            {item.locale === 'cs' ? '🇨🇿 Czech' : '🇺🇸 English'}
                          </Badge>
                          <Flag className={`h-4 w-4 ${getPriorityColor(item.priority)}`} />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(item.timestamp, item.submittedAt)}
                        </div>
                      </div>

                      {/* User info (if available) */}
                      {(item.userId || item.userEmail) && (
                        <div className="flex items-center gap-2 text-xs">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {item.userName && <span className="font-medium">{item.userName}</span>}
                            {item.userEmail && <span className="ml-1">({item.userEmail})</span>}
                            {!item.userName && !item.userEmail && item.userId && <span>User ID: {item.userId.substring(0, 8)}...</span>}
                          </span>
                          <Badge variant="secondary" className="text-xs">Registered User</Badge>
                        </div>
                      )}

                      {/* Feedback content */}
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{item.feedback}</p>
                      </div>

                      {/* Admin Response - New format */}
                      {item.adminReply && (
                        <div className="border-l-2 border-purple-500 pl-3 py-2 bg-purple-50 dark:bg-purple-950/20 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <Reply className="h-4 w-4 text-purple-600" />
                            <span className="text-xs font-medium text-purple-600">Admin Response</span>
                            <span className="text-xs text-muted-foreground">
                              by {item.adminName || 'Admin'} • {formatDate(item.repliedAt, '')}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{item.adminReply}</p>
                        </div>
                      )}

                      {/* Admin Response - Old format (backward compatibility) */}
                      {!item.adminReply && item.adminResponse && (
                        <div className="border-l-2 border-purple-500 pl-3 py-2 bg-purple-50 dark:bg-purple-950/20 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <Reply className="h-4 w-4 text-purple-600" />
                            <span className="text-xs font-medium text-purple-600">Admin Response</span>
                            <span className="text-xs text-muted-foreground">
                              by {item.adminResponse.respondedBy} • {formatDate(item.adminResponse.respondedAt, '')}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{item.adminResponse.message}</p>
                        </div>
                      )}

                      {/* Reply Form */}
                      {(item.userId || item.userEmail) && !item.adminReply && !item.adminResponse && replyingTo === item.id && (
                        <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
                          <label className="text-sm font-medium">Your Reply</label>
                          <Textarea
                            placeholder="Write your response to the user..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            rows={4}
                            disabled={isSendingReply}
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => sendReply(item.id)}
                              disabled={isSendingReply || replyMessage.trim().length < 10}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              {isSendingReply ? 'Sending...' : 'Send Reply'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setReplyingTo(null)
                                setReplyMessage('')
                              }}
                              disabled={isSendingReply}
                            >
                              Cancel
                            </Button>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {replyMessage.length}/2000 characters
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          {item.url && (
                            <span>Page: {item.url}</span>
                          )}
                          <span>IP: {item.ipHash.substring(0, 8)}...</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={item.status}
                            onValueChange={(status) => updateFeedbackStatus(item.id, status)}
                          >
                            <SelectTrigger className="w-24 h-7">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="read">Read</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="replied">Replied</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select
                            value={item.priority}
                            onValueChange={(priority) => updateFeedbackStatus(item.id, item.status, priority)}
                          >
                            <SelectTrigger className="w-20 h-7">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          {/* Reply button (only for registered users without response) */}
                          {(item.userId || item.userEmail) && !item.adminReply && !item.adminResponse && (
                            <Button
                              size="sm"
                              variant={replyingTo === item.id ? "secondary" : "outline"}
                              onClick={() => {
                                if (replyingTo === item.id) {
                                  setReplyingTo(null)
                                  setReplyMessage('')
                                } else {
                                  setReplyingTo(item.id)
                                  setReplyMessage('')
                                }
                              }}
                            >
                              <Reply className="h-4 w-4 mr-1" />
                              Reply
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
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
