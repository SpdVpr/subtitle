'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserActivity } from '@/lib/admin-stats'
import { formatDistanceToNow } from 'date-fns'

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
          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
        >
          Block
        </button>
      ) : (
        <button
          onClick={unblockUser}
          disabled={loading}
          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
        >
          Unblock
        </button>
      )}

      <button
        onClick={resetUsage}
        disabled={loading}
        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
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
  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'pro':
        return 'bg-purple-100 text-purple-800'
      case 'premium':
        return 'bg-blue-100 text-blue-800'
      case 'free':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Recent User Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-600 mb-3">
          Click credits to edit • Use action buttons to manage users
        </div>
        {/* Mobile view */}
        <div className="block sm:hidden space-y-4">
          {users.slice(0, 10).map((user, index) => (
            <div key={user.userId} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-sm text-gray-900">
                  {user.email}
                </div>
                <Badge
                  variant="secondary"
                  className={getPlanBadgeColor(user.plan)}
                >
                  {user.plan.toUpperCase()}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Translations:</span> {user.translationsCount}
                </div>
                <div>
                  <span className="font-medium">Credits:</span> {(user.creditsBalance || 0).toFixed(2)}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Last Active:</span> {formatDistanceToNow(user.lastActive, { addSuffix: true })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop view */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Plan</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Translations</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Credits</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Last Active</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 10).map((user, index) => (
                <tr key={user.userId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {user.email}
                        {(user as any).isBlocked && (
                          <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                            BLOCKED
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.userId.substring(0, 8)}...
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="secondary"
                      className={getPlanBadgeColor(user.plan)}
                    >
                      {user.plan.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.translationsCount}
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
      </CardContent>
    </Card>
  )
}
