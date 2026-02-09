'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/useAuth'
import { 
  Ticket, 
  Plus, 
  Download, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Gift
} from 'lucide-react'

interface GeneratedVoucher {
  code: string
  creditAmount: number
  campaignName: string
  expiresAt: Date | null
  usageLimit: number
}

interface VoucherGenerationResult {
  vouchers: GeneratedVoucher[]
  summary: {
    quantity: number
    creditAmount: number
    totalCredits: number
    campaignName: string
    expiresAt: Date | null
    createdBy: string
  }
}

export function VoucherGenerator() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    creditAmount: 100,
    quantity: 10,
    campaignName: '',
    expirationDays: 30,
    usageLimit: 1,
    description: ''
  })
  const [generatedVouchers, setGeneratedVouchers] = useState<VoucherGenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
    setSuccess(null)
  }

  const generateVouchers = async () => {
    if (!user?.email) {
      setError('User authentication required')
      return
    }

    // Validation
    if (!formData.campaignName.trim()) {
      setError('Campaign name is required')
      return
    }
    if (formData.creditAmount <= 0) {
      setError('Credit amount must be positive')
      return
    }
    if (formData.quantity <= 0 || formData.quantity > 1000) {
      setError('Quantity must be between 1 and 1000')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/vouchers/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': user.email
        },
        body: JSON.stringify({
          creditAmount: formData.creditAmount,
          quantity: formData.quantity,
          campaignName: formData.campaignName.trim(),
          expirationDays: formData.expirationDays > 0 ? formData.expirationDays : undefined,
          usageLimit: formData.usageLimit,
          description: formData.description.trim()
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate vouchers')
      }

      setGeneratedVouchers(result)

      if (result.demoMode) {
        setSuccess(`🧪 Demo Mode: Generated ${result.summary.quantity} vouchers for campaign "${result.summary.campaignName}" (not saved to database)`)
      } else {
        setSuccess(`Successfully generated ${result.summary.quantity} vouchers for campaign "${result.summary.campaignName}"`)
      }

      // Reset form
      setFormData({
        creditAmount: 100,
        quantity: 10,
        campaignName: '',
        expirationDays: 30,
        usageLimit: 1,
        description: ''
      })

    } catch (error: any) {
      console.error('Voucher generation error:', error)
      setError(error.message || 'Failed to generate vouchers')
    } finally {
      setLoading(false)
    }
  }

  const copyVoucherCodes = () => {
    if (!generatedVouchers) return
    
    const codes = generatedVouchers.vouchers.map(v => v.code).join('\n')
    navigator.clipboard.writeText(codes)
    setSuccess('Voucher codes copied to clipboard!')
  }

  const downloadVoucherCodes = () => {
    if (!generatedVouchers) return
    
    const csvContent = [
      'Code,Credits,Campaign,Expires,Usage Limit',
      ...generatedVouchers.vouchers.map(v => 
        `${v.code},${v.creditAmount},${v.campaignName},${v.expiresAt ? v.expiresAt.toISOString().split('T')[0] : 'Never'},${v.usageLimit}`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vouchers-${generatedVouchers.summary.campaignName}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Generator Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="w-5 h-5" />
            <span>Voucher Generator</span>
          </CardTitle>
          <CardDescription>
            Generate voucher codes for marketing campaigns and promotions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaignName">Campaign Name *</Label>
              <Input
                id="campaignName"
                placeholder="e.g., Summer Promotion 2024"
                value={formData.campaignName}
                onChange={(e) => handleInputChange('campaignName', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="creditAmount">Credits per Voucher *</Label>
              <Input
                id="creditAmount"
                type="number"
                min="1"
                max="10000"
                value={formData.creditAmount}
                onChange={(e) => handleInputChange('creditAmount', parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Number of Vouchers *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="1000"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expirationDays">Expiration (days)</Label>
              <Input
                id="expirationDays"
                type="number"
                min="0"
                placeholder="0 = never expires"
                value={formData.expirationDays}
                onChange={(e) => handleInputChange('expirationDays', parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="usageLimit">Usage Limit per Voucher</Label>
              <Input
                id="usageLimit"
                type="number"
                min="1"
                max="100"
                value={formData.usageLimit}
                onChange={(e) => handleInputChange('usageLimit', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Additional notes about this voucher campaign..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={2}
            />
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Generation Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Vouchers:</span>
                <div className="font-medium">{formData.quantity}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Credits Each:</span>
                <div className="font-medium">{formData.creditAmount}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Total Credits:</span>
                <div className="font-medium">{formData.quantity * formData.creditAmount}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Expires:</span>
                <div className="font-medium">
                  {formData.expirationDays > 0 
                    ? `${formData.expirationDays} days` 
                    : 'Never'
                  }
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={generateVouchers} 
            disabled={loading || !formData.campaignName.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Vouchers...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Generate {formData.quantity} Vouchers
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Generated Vouchers */}
      {generatedVouchers && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Ticket className="w-5 h-5" />
                <span>Generated Vouchers</span>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={copyVoucherCodes}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Codes
                </Button>
                <Button variant="outline" size="sm" onClick={downloadVoucherCodes}>
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Campaign: {generatedVouchers.summary.campaignName} • 
              Total Credits: {generatedVouchers.summary.totalCredits}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {generatedVouchers.vouchers.map((voucher, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <code className="font-mono text-sm">{voucher.code}</code>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{voucher.creditAmount} credits</Badge>
                    {voucher.expiresAt && (
                      <Badge variant="outline">
                        Expires: {new Date(voucher.expiresAt).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
