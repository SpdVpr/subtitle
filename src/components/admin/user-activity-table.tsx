'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserActivity } from '@/lib/admin-stats'
import { formatDistanceToNow } from 'date-fns'
import { Info } from 'lucide-react'

interface UserActivityTableProps {
  users: UserActivity[]
  onRefresh?: () => void
}

function UserActionsCell({ userId, email, isBlocked, onUpdate }: {
  userId: string;
  email: string;
  isBlocked?: boolean;
  onUpdate?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const performAction = async (action: string, data?: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/user-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': (typeof window !== 'undefined' ? localStorage.getItem('adminEmail') || '' : '')
        },
        body: JSON.stringify({ action, userId, data })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed')

      console.log(`✅ User ${action}:`, result)

      // Trigger parent component refresh
      if (onUpdate) {
        setTimeout(onUpdate, 500)
      }
    } catch (e: any) {
      setError(e.message)
      setTimeout(() => setError(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  const blockUser = () => {
    const reason = prompt('Reason for blocking user:')
    if (reason !== null) {
      performAction('blockUser', { reason })
    }
  }

  const unblockUser = () => {
    if (confirm(`Unblock user ${email}?`)) {
      performAction('unblockUser')
    }
  }

  const resetUsage = () => {
    if (confirm(`Reset usage statistics for ${email}?`)) {
      performAction('resetUserUsage')
    }
  }

  return (
    <div className="flex items-center gap-1">
      {!isBlocked ? (
        <button
          onClick={blockUser}
          disabled={loading}
          className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50"
        >
          Block
        </button>
      ) : (
        <button
          onClick={unblockUser}
          disabled={loading}
          className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-50"
        >
          Unblock
        </button>
      )}

      <button
        onClick={resetUsage}
        disabled={loading}
        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50"
      >
        Reset
      </button>

      {error && (
        <span className="text-xs text-red-600" title={error}>⚠️</span>
      )}
    </div>
  )
}

function EditableCreditsCell({ userId, initial, onUpdate }: { userId: string; initial: number; onUpdate?: () => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState<number>(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { setValue(initial) }, [initial])

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const deltaCredits = value - initial
      const res = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-email': (typeof window !== 'undefined' ? localStorage.getItem('adminEmail') || '' : '') },
        body: JSON.stringify({ userId, deltaCredits, description: `Admin adjustment: ${deltaCredits > 0 ? '+' : ''}${deltaCredits} credits` })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')

      console.log('✅ Credits adjusted:', data)
      setEditing(false)

      // Trigger parent component refresh
      if (onUpdate) {
        setTimeout(onUpdate, 500) // Small delay to allow server to update
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div className="text-sm font-medium text-gray-900 cursor-pointer" onClick={() => setEditing(true)}>
        {value.toFixed(2)}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input type="number" step="0.1" value={value} onChange={e => setValue(parseFloat(e.target.value))} className="w-24 border rounded px-2 py-1 text-sm" />
      <button className="text-blue-600 text-sm" disabled={saving} onClick={save}>Save</button>
      <button className="text-gray-500 text-sm" onClick={() => { setEditing(false); setValue(initial) }}>Cancel</button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}

export function UserActivityTable({ users, onRefresh }: UserActivityTableProps) {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [debugLoading, setDebugLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage, setUsersPerPage] = useState(20) // Zobrazit 20 uživatelů na stránku

  const runDebug = async () => {
    setDebugLoading(true)
    try {
      let adminEmail = ''
      if (typeof window !== 'undefined') {
        adminEmail = localStorage.getItem('adminEmail') || 'premium@test.com'
      }

      const response = await fetch('/api/admin/debug-users', {
        headers: { 'x-admin-email': adminEmail }
      })

      const data = await response.json()
      setDebugInfo(data)
      setShowDebug(true)
    } catch (error) {
      console.error('Debug failed:', error)
    } finally {
      setDebugLoading(false)
    }
  }

  // Stránkování logika
  const totalUsers = users?.length || 0
  const totalPages = Math.ceil(totalUsers / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const endIndex = startIndex + usersPerPage
  const currentUsers = users?.slice(startIndex, endIndex) || []

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'pro':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'premium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'free':
        return 'bg-gray-100 text-gray-800 dark:bg-muted dark:text-muted-foreground'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-muted dark:text-muted-foreground'
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">
              User Activity ({totalUsers} users)
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Showing {startIndex + 1}-{Math.min(endIndex, totalUsers)} of {totalUsers} users
            </p>
          </div>
          <button
            onClick={runDebug}
            disabled={debugLoading}
            className="px-3 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/50 disabled:opacity-50"
          >
            {debugLoading ? 'Debugging...' : 'Debug Firebase'}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-600 dark:text-muted-foreground mb-3">
          Click credits to edit • Use action buttons to manage users
        </div>

        {/* Debug Info */}
        {showDebug && debugInfo && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Firebase Debug Info</h4>
              <button
                onClick={() => setShowDebug(false)}
                className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-300 dark:hover:text-yellow-100"
              >
                ✕
              </button>
            </div>
            <div className="text-xs space-y-2">
              <div>
                <strong>Environment:</strong>
                <ul className="ml-4 mt-1">
                  {Object.entries(debugInfo.environment || {}).map(([key, value]) => (
                    <li key={key}>{key}: {String(value)}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Tests:</strong>
                <ul className="ml-4 mt-1">
                  {(debugInfo.tests || []).map((test: any, i: number) => (
                    <li key={i} className={test.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}>
                      {test.name}: {test.status}
                      {test.userCount !== undefined && ` (${test.userCount} users)`}
                      {test.error && ` - ${test.error}`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        {/* Mobile view */}
        <div className="block sm:hidden space-y-4">
          {currentUsers.map((user, index) => (
            <div key={String(user?.userId || index)} className="p-4 border rounded-lg bg-gray-50 dark:bg-card dark:border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-sm text-gray-900 dark:text-foreground">
                  {String(user?.email || 'Unknown')}
                </div>
                <Badge
                  variant="secondary"
                  className={getPlanBadgeColor(user?.plan || 'free')}
                >
                  {String(user?.plan || 'free').toUpperCase()}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Translations:</span>
                  <span className="ml-1">📄 {Number(user?.translationsCount || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium">Credits:</span> {Number(user?.creditsBalance || 0).toFixed(2)}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Last Active:</span> {user?.lastActive ? formatDistanceToNow(new Date(user.lastActive), { addSuffix: true }) : 'Never'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop view */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-border">
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-foreground">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-foreground">Plan</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-foreground">Translations</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-foreground">Credits</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-foreground">Last Active</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user, index) => (
                <tr key={String(user?.userId || index)} className="border-b border-gray-100 dark:border-border hover:bg-gray-50 dark:hover:bg-muted transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-foreground">
                        {String(user?.email || 'Unknown')}
                        {(user as any)?.isBlocked && (
                          <span className="ml-2 px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                            BLOCKED
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-muted-foreground">
                        {String(user?.userId || '').substring(0, 8)}...
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="secondary"
                      className={getPlanBadgeColor(user?.plan || 'free')}
                    >
                      {String(user?.plan || 'free').toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-foreground">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center">
                          📄 {Number(user?.translationsCount || 0).toLocaleString()}
                        </span>
                        {Number(user?.translationsCount || 0) > 0 && (
                          <Info
                            className="h-3 w-3 text-gray-400 dark:text-muted-foreground cursor-help"
                            title={`Total subtitle files translated by this user`}
                          />
                        )}
                      </div>
                      {Number(user?.translationsCount || 0) > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {Number(user?.translationsCount || 0) === 1 ? '1 file' : `${Number(user?.translationsCount || 0)} files`} translated
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <EditableCreditsCell
                      userId={user.userId}
                      initial={user.creditsBalance || 0}
                      onUpdate={onRefresh}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-600">
                      {formatDistanceToNow(user.lastActive, { addSuffix: true })}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <UserActionsCell
                      userId={user.userId}
                      email={user.email}
                      isBlocked={(user as any).isBlocked}
                      onUpdate={onRefresh}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalUsers > 10 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-border">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <select
                  value={usersPerPage}
                  onChange={(e) => {
                    setUsersPerPage(Number(e.target.value))
                    setCurrentPage(1) // Reset to first page
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 dark:border-border rounded bg-white dark:bg-background text-gray-700 dark:text-foreground"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-muted-foreground">per page</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-muted text-gray-700 dark:text-foreground rounded hover:bg-gray-200 dark:hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-muted text-gray-700 dark:text-foreground hover:bg-gray-200 dark:hover:bg-muted/80'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-muted text-gray-700 dark:text-foreground rounded hover:bg-gray-200 dark:hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
