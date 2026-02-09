'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/useAuth'
import { 
  Gift, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Ticket
} from 'lucide-react'

interface VoucherRedemptionProps {
  onRedemptionSuccess?: (creditsAdded: number, newBalance: number) => void
}

export function VoucherRedemption({ onRedemptionSuccess }: VoucherRedemptionProps) {
  const { user } = useAuth()
  const [voucherCode, setVoucherCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleRedemption = async () => {
    if (!user?.uid) {
      setError('Please log in to redeem vouchers')
      return
    }

    if (!voucherCode.trim()) {
      setError('Please enter a voucher code')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/vouchers/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voucherCode: voucherCode.trim(),
          userId: user.uid
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to redeem voucher')
      }

      if (result.demoMode) {
        setSuccess(`🧪 ${result.message} You received ${result.creditsAdded} credits.`)
      } else {
        setSuccess(`🎉 Voucher redeemed successfully! You received ${result.creditsAdded} credits.`)
      }

      setVoucherCode('')

      // Call the success callback if provided
      if (onRedemptionSuccess) {
        onRedemptionSuccess(result.creditsAdded, result.newBalance)
      }

      // Trigger global credits refresh event
      window.dispatchEvent(new CustomEvent('refreshCredits'))

    } catch (error: any) {
      console.error('Voucher redemption error:', error)
      setError(error.message || 'Failed to redeem voucher')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRedemption()
    }
  }

  const formatVoucherCode = (value: string) => {
    // Remove any non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^A-Z0-9]/g, '').toUpperCase()
    
    // Add dashes every 4 characters
    const formatted = cleaned.replace(/(.{4})/g, '$1-').replace(/-$/, '')
    
    return formatted
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatVoucherCode(e.target.value)
    setVoucherCode(formatted)
    setError(null)
    setSuccess(null)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Gift className="w-5 h-5 text-primary" />
          <span>Have a Voucher?</span>
        </CardTitle>
        <CardDescription>
          Redeem your voucher code to get free credits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              placeholder="Enter voucher code (e.g., ABCD-EFGH-IJKL)"
              value={voucherCode}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="font-mono"
              maxLength={14} // XXXX-XXXX-XXXX format
            />
          </div>
          <Button 
            onClick={handleRedemption}
            disabled={loading || !voucherCode.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redeeming...
              </>
            ) : (
              <>
                <Ticket className="w-4 h-4 mr-2" />
                Redeem
              </>
            )}
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-300">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground">
          <p>• Voucher codes are case-insensitive</p>
          <p>• Each voucher can only be used once per account</p>
          <p>• Credits from vouchers never expire</p>
        </div>
      </CardContent>
    </Card>
  )
}
