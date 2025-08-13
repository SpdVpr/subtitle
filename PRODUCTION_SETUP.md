# Production Setup Guide

This guide covers setting up the SubtitleAI application for production with all essential features.

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication, Firestore, and Storage

### 2. Configure Authentication
```bash
# Enable Email/Password authentication
# Enable Google OAuth (optional)
```

### 3. Firestore Database Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Translation jobs - users can only access their own
    match /translationJobs/{jobId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Batch jobs - users can only access their own
    match /batchJobs/{jobId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Analytics - users can only access their own
    match /analytics/{entryId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Files - users can only access their own
    match /files/{fileId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Error logs - only server can write
    match /errorLogs/{logId} {
      allow read: if request.auth != null;
      allow write: if false; // Only server-side writes
    }
  }
}
```

### 4. Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only access their own files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 💳 Stripe Setup

### 1. Create Stripe Account
1. Sign up at [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys from the Developers section

### 2. Create Products and Prices
```bash
# Premium Plan
stripe products create --name="Premium Plan" --description="Professional subtitle translation"
stripe prices create --product=prod_xxx --unit-amount=999 --currency=usd --recurring[interval]=month

# Pro Plan  
stripe products create --name="Pro Plan" --description="Advanced features for power users"
stripe prices create --product=prod_yyy --unit-amount=1999 --currency=usd --recurring[interval]=month
```

### 3. Configure Webhooks
1. Add webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
2. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## 🐛 Sentry Setup

### 1. Create Sentry Project
1. Sign up at [Sentry.io](https://sentry.io/)
2. Create a new Next.js project
3. Get your DSN from Project Settings

### 2. Configure Sentry
The Sentry configuration is already set up in:
- `sentry.client.config.ts`
- `sentry.server.config.ts`

## 📧 Email Verification Setup

Email verification is handled through Firebase Auth. Configure:

1. **Email Templates**: Customize in Firebase Console > Authentication > Templates
2. **Custom Domain**: Set up custom email domain in Firebase Console
3. **SMTP Settings**: Configure custom SMTP if needed

## 🌍 Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_PREMIUM_PRICE_ID=price_your_premium_price_id
STRIPE_PRO_PRICE_ID=price_your_pro_price_id

# AI Services
OPENAI_API_KEY=sk-your_openai_api_key
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://your_dsn@sentry.io/project_id
NEXT_PUBLIC_APP_VERSION=1.0.0

# Firebase Admin (for server-side operations)
FIREBASE_ADMIN_PROJECT_ID=your_firebase_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add all environment variables in Vercel dashboard
3. Deploy

### Custom Deployment
1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Set up reverse proxy (nginx/Apache)
4. Configure SSL certificate

## 📊 Database Indexes

Create these Firestore indexes for optimal performance:

```javascript
// Analytics queries
collection: analytics
fields: userId (Ascending), date (Ascending)

// Translation jobs
collection: translationJobs  
fields: userId (Ascending), createdAt (Descending)

// Batch jobs
collection: batchJobs
fields: userId (Ascending), createdAt (Descending)

// Files
collection: files
fields: userId (Ascending), createdAt (Descending)
```

## 🔒 Security Checklist

- [ ] Firebase Security Rules configured
- [ ] Stripe webhook signature verification enabled
- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Error messages don't expose sensitive data

## 📈 Monitoring

### Key Metrics to Monitor
- Translation success rate
- Average processing time
- Error rates by component
- User subscription conversions
- Storage usage
- API response times

### Alerts to Set Up
- High error rates (>5%)
- Slow API responses (>10s)
- Failed payments
- Storage quota approaching limits
- Unusual usage patterns

## 🧪 Testing

### Test Accounts
Create test accounts for each subscription tier:
- Free: `test-free@example.com`
- Premium: `test-premium@example.com` 
- Pro: `test-pro@example.com`

### Test Stripe Payments
Use Stripe test cards:
- Success: `4242424242424242`
- Decline: `4000000000000002`

## 📝 API Documentation

### Translation API
```bash
POST /api/translate
Content-Type: multipart/form-data

file: File (SRT file)
targetLanguage: string
sourceLanguage?: string  
aiService: 'google' | 'openai'
userId: string
```

### Batch API
```bash
POST /api/batch
Content-Type: multipart/form-data

files: File[] (Multiple SRT files)
targetLanguage: string
sourceLanguage?: string
aiService: 'google' | 'openai'
userId: string
jobName: string
```

### Analytics API
```bash
GET /api/analytics?userId={userId}&period={period}&startDate={date}&endDate={date}
```

## 🔄 Backup Strategy

1. **Firestore**: Enable automatic backups
2. **Storage**: Set up cross-region replication
3. **Code**: Regular Git backups
4. **Environment**: Secure backup of environment variables

## 📞 Support

For production issues:
1. Check Sentry for error details
2. Review Firebase logs
3. Monitor Stripe dashboard for payment issues
4. Check application metrics in Vercel/hosting platform
