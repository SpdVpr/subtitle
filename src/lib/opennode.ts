// OpenNode Bitcoin Lightning payment integration
export interface OpenNodeCharge {
  id: string
  description?: string
  amount: number
  currency: string
  status: 'unpaid' | 'paid' | 'expired'
  lightning_invoice?: {
    payreq: string
    expires_at: string
  }
  chain_invoice?: {
    address: string
  }
  hosted_checkout_url?: string
  created_at: string
  settled_at?: string
  callback_url?: string
  success_url?: string
  metadata?: Record<string, any>
  fiat_value?: number
  source_fiat_value?: number
}

export interface OpenNodeCreateInvoiceRequest {
  amount: number
  currency: string // 'USD', 'EUR', 'BTC', 'SAT'
  description?: string
  callback_url?: string
  success_url?: string
  customer_email?: string
  customer_name?: string
  metadata?: Record<string, any>
  auto_settle?: boolean
  ttl?: number // time to live in seconds
  // Custom metadata fields for webhook
  metadata_userId?: string
  metadata_credits?: string
  metadata_packageName?: string
  metadata_priceUSD?: string
  metadata_source?: string
  [key: string]: any // Allow any custom fields
}

export interface OpenNodeWebhookEvent {
  id: string
  type: 'charge:paid' | 'charge:expired' | 'charge:failed'
  data: OpenNodeCharge
  created_at: string
}

export class OpenNodeClient {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string, testnet = false) {
    this.apiKey = apiKey
    this.baseUrl = testnet ? 'https://dev-api.opennode.com' : 'https://api.opennode.com'
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenNode API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  async createCharge(data: OpenNodeCreateInvoiceRequest): Promise<{ data: OpenNodeCharge }> {
    return this.request<{ data: OpenNodeCharge }>('/v1/charges', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getCharge(chargeId: string): Promise<{ data: OpenNodeCharge }> {
    return this.request<{ data: OpenNodeCharge }>(`/v1/charge/${chargeId}`)
  }

  async getCharges(limit = 50): Promise<{ data: OpenNodeCharge[] }> {
    return this.request<{ data: OpenNodeCharge[] }>(`/v1/charges?limit=${limit}`)
  }
}

// Package configurations for Bitcoin payments
export const BITCOIN_PAYMENT_PACKAGES = [
  {
    credits: 100,
    priceUSD: 1,
    priceSats: 1500, // approximately $1 in satoshis (adjust based on current BTC price)
    description: 'Trial Pack - 100 Credits',
    packageName: 'Trial Pack'
  },
  {
    credits: 500,
    priceUSD: 5,
    priceSats: 7500, // approximately $5 in satoshis
    description: 'Starter Pack - 500 Credits',
    packageName: 'Starter Pack'
  },
  {
    credits: 1200,
    priceUSD: 10,
    priceSats: 15000, // approximately $10 in satoshis
    description: 'Popular Pack - 1200 Credits',
    packageName: 'Popular Pack'
  },
  {
    credits: 2500,
    priceUSD: 20,
    priceSats: 30000, // approximately $20 in satoshis
    description: 'Professional Pack - 2500 Credits',
    packageName: 'Professional Pack'
  }
] as const

export function getPackageByCredits(credits: number) {
  return BITCOIN_PAYMENT_PACKAGES.find(pkg => pkg.credits === credits)
}

export function satoshisToBTC(satoshis: number): number {
  return satoshis / 100000000
}

export function btcToSatoshis(btc: number): number {
  return Math.round(btc * 100000000)
}

// Helper to convert USD to satoshis using fixed rates
export function convertUSDToSatoshis(usdAmount: number): number {
  // Fixed rates for stable pricing (update periodically based on BTC price)
  // Current rate: ~$67,000 per BTC = ~1,493 sats per USD
  const satoshisPerUSD = 1500 // Conservative rate
  return Math.round(usdAmount * satoshisPerUSD)
}

export const openNodeClient = new OpenNodeClient(
  process.env.OPENNODE_API_KEY || '4eb67af3-efa5-4b1f-99f8-7dc741acad5f',
  false // use mainnet (production)
)
