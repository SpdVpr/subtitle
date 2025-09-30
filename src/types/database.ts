import { Timestamp } from 'firebase/firestore'

// User Profile
export interface UserProfile {
  uid: string
  email: string
  displayName?: string | null
  photoURL?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  emailVerified: boolean

  // Subscription info
  subscriptionId?: string
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'unpaid'
  subscriptionPlan?: 'free' | 'premium' | 'pro'
  subscriptionPeriodEnd?: Timestamp
  stripeCustomerId?: string

  // Usage tracking
  usage: {
    translationsUsed: number
    translationsLimit: number
    storageUsed: number // in bytes
    storageLimit: number // in bytes
    batchJobsUsed: number
    batchJobsLimit: number
    resetDate: Timestamp // monthly reset
  }

  // Credits wallet
  creditsBalance?: number // in credits (e.g., 1 USD = 100 credits)
  creditsTotalPurchased?: number // lifetime purchased credits

  // Registration tracking (anti-abuse)
  registrationTracking?: {
    ipAddress?: string
    browserFingerprint?: string
    userAgent?: string
    suspiciousScore?: number // 0-100, higher = more suspicious
    duplicateDetected?: boolean
    registrationMethod?: 'email' | 'google' // How they registered
  }

  // Preferences
  preferences: {
    defaultSourceLanguage?: string
    defaultTargetLanguage?: string
    defaultAiService: 'google' | 'openai'
    emailNotifications: boolean
    theme: 'light' | 'dark' | 'system'
  }
}

// Credit transactions (top-ups and debits)
export interface CreditTransaction {
  id: string
  userId: string
  type: 'topup' | 'debit' | 'refund'
  credits: number // positive number of credits added or subtracted
  amountUSD?: number // only for topups/refunds
  description?: string
  relatedJobId?: string
  batchNumber?: number
  createdAt: Timestamp
}

// Translation Job
export interface TranslationJob {
  id: string
  userId: string
  type: 'single' | 'batch'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  
  // File info
  originalFileName: string
  originalFileSize: number
  originalFileUrl?: string // Firebase Storage URL
  translatedFileName?: string
  translatedFileUrl?: string // Firebase Storage URL
  
  // Translation settings
  sourceLanguage?: string
  targetLanguage: string
  aiService: 'google' | 'openai' | 'premium'
  
  // Processing info
  createdAt: Timestamp
  startedAt?: Timestamp
  completedAt?: Timestamp
  processingTimeMs?: number
  
  // Results
  subtitleCount?: number
  characterCount?: number
  confidence?: number // average confidence score
  errorMessage?: string
  translatedContent?: string // Store the actual translated SRT content for re-download
  
  // Metadata
  metadata?: {
    userAgent?: string
    ipAddress?: string
    fileFormat?: string
  }
}

// Batch Job
export interface BatchJob {
  id: string
  userId: string
  name: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  
  // Settings
  sourceLanguage?: string
  targetLanguage: string
  aiService: 'google' | 'openai'
  
  // Progress
  totalFiles: number
  processedFiles: number
  failedFiles: number
  progress: number // 0-100
  
  // Files
  files: BatchFile[]
  
  // Timing
  createdAt: Timestamp
  startedAt?: Timestamp
  completedAt?: Timestamp
  processingTimeMs?: number
  
  // Results
  downloadUrl?: string // ZIP file URL
  errorMessage?: string
}

export interface BatchFile {
  id: string
  originalName: string
  size: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  
  // URLs
  originalUrl?: string
  translatedUrl?: string
  translatedName?: string
  
  // Results
  subtitleCount?: number
  confidence?: number
  processingTimeMs?: number
  errorMessage?: string
}

// Analytics Data
export interface AnalyticsEntry {
  id: string
  userId: string
  date: string // YYYY-MM-DD format
  
  // Daily metrics
  translationsCount: number
  filesProcessed: number
  charactersTranslated: number
  processingTimeMs: number
  
  // Language breakdown
  languagePairs: Record<string, number> // "en-es": 5
  
  // Service usage
  serviceUsage: Record<string, number> // "google": 3, "openai": 2
  
  // Quality metrics
  averageConfidence: number
  errorCount: number
  
  createdAt: Timestamp
  updatedAt: Timestamp
}

// File Storage
export interface StoredFile {
  id: string
  userId: string
  fileName: string
  fileSize: number
  fileType: string
  storagePath: string
  downloadUrl: string
  
  // Metadata
  jobId?: string // associated translation/batch job
  jobType?: 'single' | 'batch'
  isOriginal: boolean // true for uploaded files, false for translated
  
  // Lifecycle
  createdAt: Timestamp
  expiresAt?: Timestamp // auto-delete date
  downloadCount: number
  lastDownloadAt?: Timestamp
}

// Subscription
export interface Subscription {
  id: string
  userId: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  
  // Plan info
  plan: 'free' | 'premium' | 'pro'
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing'
  
  // Billing
  currentPeriodStart: Timestamp
  currentPeriodEnd: Timestamp
  cancelAtPeriodEnd: boolean
  canceledAt?: Timestamp
  
  // Trial
  trialStart?: Timestamp
  trialEnd?: Timestamp
  
  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
}

// System Settings
export interface SystemSettings {
  id: 'global'
  
  // Feature flags
  features: {
    batchProcessing: boolean
    analytics: boolean
    emailVerification: boolean
    freeTrials: boolean
  }
  
  // Limits
  limits: {
    maxFileSize: number // bytes
    maxBatchFiles: number
    maxStoragePerUser: number // bytes
    fileRetentionDays: number
  }
  
  // API keys (encrypted)
  apiKeys: {
    googleTranslate?: string
    openai?: string
    stripe?: string
  }
  
  updatedAt: Timestamp
  updatedBy: string
}

// Error Log
export interface ErrorLog {
  id: string
  userId?: string
  jobId?: string

  // Error details
  error: string
  stack?: string
  context?: Record<string, any>

  // Request info
  userAgent?: string
  ipAddress?: string
  url?: string
  method?: string

  // Timing
  timestamp: Timestamp
  resolved: boolean
  resolvedAt?: Timestamp
}

// Registration Tracking (Anti-abuse system)
export interface RegistrationTracking {
  id: string
  userId: string
  email: string

  // Tracking data
  ipAddress: string
  browserFingerprint: string
  userAgent: string

  // Detection results
  suspiciousScore: number // 0-100
  duplicateIpCount: number // How many accounts from this IP
  duplicateFingerprintCount: number // How many accounts with this fingerprint

  // Credits awarded
  creditsAwarded: number // Actual credits given (may be reduced if suspicious)
  creditsReduced: boolean // Was the amount reduced due to suspicion?

  // Registration details
  registrationMethod: 'email' | 'google'
  emailVerified: boolean

  // Timestamps
  createdAt: Timestamp

  // Admin actions
  flaggedByAdmin?: boolean
  adminNotes?: string
  reviewedAt?: Timestamp
  reviewedBy?: string
}

// Registration Statistics (for admin dashboard)
export interface RegistrationStats {
  totalRegistrations: number
  suspiciousRegistrations: number
  blockedRegistrations: number
  uniqueIPs: number
  uniqueFingerprints: number
  averageSuspiciousScore: number
  creditsAwarded: number
  creditsSaved: number // Credits not given due to detection
  lastUpdated: Timestamp
}

// Feedback System
export interface FeedbackItem {
  id: string
  feedback: string
  timestamp: Timestamp
  submittedAt: string
  locale: string
  url?: string
  ipHash: string
  userAgent?: string
  status: 'new' | 'read' | 'resolved' | 'replied'
  priority: 'low' | 'normal' | 'high'

  // Optional user identification for replies
  userEmail?: string
  userId?: string
  userName?: string

  // Admin response
  adminResponse?: {
    message: string
    respondedBy: string // admin email
    respondedAt: Timestamp
    notificationSent: boolean
  }

  // Metadata
  updatedAt?: Timestamp
  readAt?: Timestamp
  resolvedAt?: Timestamp
  repliedAt?: Timestamp
}
