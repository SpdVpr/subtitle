// Stripe Payment Links Configuration
// These are pre-created payment links from Stripe Dashboard

export interface PaymentLinkConfig {
  credits: number
  price: number // in USD
  currency: string
  link: string
  priceId?: string // Optional: for API fallback
  description: string
  popular?: boolean
}

export const STRIPE_PAYMENT_LINKS: PaymentLinkConfig[] = [
  {
    credits: 100,
    price: 1,
    currency: 'USD',
    link: 'https://buy.stripe.com/aFacN58737HPbYe2Tr6sw03',
    description: 'Perfect for trying our service',
  },
  {
    credits: 500,
    price: 5,
    currency: 'USD',
    link: 'https://buy.stripe.com/bJe00jcnj6DL2nE1Pn6sw00',
    description: 'Great for regular use',
  },
  {
    credits: 1200,
    price: 10,
    currency: 'USD',
    link: 'https://buy.stripe.com/dRmaEX2MJ9PXbYe2Tr6sw01',
    description: '🎁 +200 BONUS credits included!',
    popular: true,
  },
  {
    credits: 2500,
    price: 20,
    currency: 'USD',
    link: 'https://buy.stripe.com/4gM6oH72Z2nv2nE65D6sw02',
    description: '🎁 +500 BONUS credits included!',
  },
]

// Helper function to get payment link by credits
export function getPaymentLinkByCredits(credits: number): PaymentLinkConfig | undefined {
  return STRIPE_PAYMENT_LINKS.find(link => link.credits === credits)
}

// Helper function to calculate price per credit
export function getPricePerCredit(config: PaymentLinkConfig): number {
  return config.price / config.credits
}

// Helper function to get the best value package
export function getBestValuePackage(): PaymentLinkConfig {
  return STRIPE_PAYMENT_LINKS.reduce((best, current) => {
    const bestPricePerCredit = getPricePerCredit(best)
    const currentPricePerCredit = getPricePerCredit(current)
    return currentPricePerCredit < bestPricePerCredit ? current : best
  })
}

// Helper function to format price
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

// Helper function to create payment URL with metadata
export function createPaymentUrl(config: PaymentLinkConfig, userId: string, metadata?: Record<string, string>): string {
  const url = new URL(config.link)
  
  // Add client_reference_id for user identification
  url.searchParams.set('client_reference_id', userId)
  
  // Add custom metadata if provided
  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      url.searchParams.set(`metadata[${key}]`, value)
    })
  }
  
  return url.toString()
}
