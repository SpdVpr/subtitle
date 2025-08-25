// OpenNode Bitcoin Lightning payment integration
export interface OpenNodeInvoice {
  id: string
  description: string
  amount: number // in satoshis
  status: 'unpaid' | 'paid' | 'expired'
  lightning_invoice: {
    payreq: string
    expires_at: string
  }
  hosted_checkout_url: string
  created_at: string
  settled_at?: string
  callback_url?: string
  success_url?: string
  metadata?: Record<string, any>
}

export interface OpenNodeCreateInvoiceRequest {
  amount: number // in satoshis
  description: string
  callback_url?: string
  success_url?: string
  metadata?: Record<string, any>
  auto_settle?: boolean
  ttl?: number // time to live in seconds
}

export interface OpenNodeWebhookEvent {
  id: string
  type: 'invoice.paid' | 'invoice.expired'
  data: OpenNodeInvoice
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
        'Authorization': this.apiKey,
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

  async createInvoice(data: OpenNodeCreateInvoiceRequest): Promise<OpenNodeInvoice> {
    return this.request<OpenNodeInvoice>('/v1/charges', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getInvoice(invoiceId: string): Promise<OpenNodeInvoice> {
    return this.request<OpenNodeInvoice>(`/v1/charge/${invoiceId}`)
  }

  async getInvoices(limit = 50): Promise<{ data: OpenNodeInvoice[] }> {
    return this.request<{ data: OpenNodeInvoice[] }>(`/v1/charges?limit=${limit}`)
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
