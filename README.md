# SubtitleBot

🎬 **Professional AI-powered subtitle translation platform** built with Next.js, Firebase, and modern web technologies. Now with real OpenSubtitles API integration!

## ✨ Features

### 🌍 **Translation Engine**
- **Multi-language Support**: Translate subtitles to 50+ languages
- **AI-Powered**: Uses Google Translate and OpenAI for accurate translations
- **Smart Timing**: Intelligent timing adjustment based on language characteristics
- **High Accuracy**: Context-aware translations with confidence scoring

### 🚀 **Advanced Features**
- **Batch Processing**: Process multiple files simultaneously (Premium/Pro)
- **Real-time Preview**: Edit and preview translations before download
- **Video Sync**: Synchronize subtitles with video playback
- **Multiple Formats**: Support for SRT, VTT, and more

### 📊 **Analytics & Insights**
- **Usage Analytics**: Track translation usage and performance (Premium/Pro)
- **Quality Metrics**: Monitor translation confidence and success rates
- **Language Statistics**: Analyze most translated languages
- **Performance Tracking**: Processing time and efficiency metrics

### 🔐 **Enterprise Ready**
- **User Authentication**: Secure login with Firebase Auth + email verification
- **Subscription Management**: Free, Premium, and Pro tiers with Stripe
- **File Storage**: Secure cloud storage with automatic cleanup
- **Error Tracking**: Comprehensive error monitoring with Sentry

### 📱 **User Experience**
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Real-time Updates**: Live progress tracking for batch jobs
- **Intuitive Interface**: Clean, modern UI with accessibility features
- **Fast Performance**: Optimized for speed with Next.js 15

## 🏗️ Tech Stack

### **Frontend**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: React Context + Hooks

### **Backend & Database**
- **API**: Next.js API Routes
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Auth

### **External Services**
- **Payments**: Stripe (subscriptions + webhooks)
- **AI Translation**: Google Translate API + OpenAI API
- **Error Tracking**: Sentry
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase account
- Google Translate API key
- Stripe account (for payments)
- Sentry account (for error tracking)

### Installation

1. **Clone and install**:
```bash
git clone https://github.com/yourusername/subtitle-ai.git
cd subtitle-ai
npm install
```

2. **Environment setup**:
```bash
cp .env.example .env.local
# Fill in your API keys - see PRODUCTION_SETUP.md for details
```

3. **Start development**:
```bash
npm run dev
```

4. **Open application**:
Visit [http://localhost:3000](http://localhost:3000)

### 🧪 Demo Accounts
- **Free**: `free@test.com` / `test123`
- **Premium**: `premium@test.com` / `test123`
- **Pro**: `pro@test.com` / `test123`

## 📊 Features by Plan

| Feature | Free | Premium | Pro |
|---------|------|---------|-----|
| Single file translation | ✅ | ✅ | ✅ |
| Google Translate | ✅ | ✅ | ✅ |
| OpenAI GPT | ❌ | ✅ | ✅ |
| Batch processing | ❌ | ✅ | ✅ |
| Analytics dashboard | ❌ | ✅ | ✅ |
| Advanced editing | ❌ | ✅ | ✅ |
| Priority support | ❌ | ❌ | ✅ |
| API access | ❌ | ❌ | ✅ |

## 🚀 Deployment

### Vercel (Recommended)
1. **Fork/Clone this repository**
2. **Connect to Vercel**: Import your GitHub repository to Vercel
3. **Environment Variables**: Copy all variables from `.env.example` and set them in Vercel dashboard
4. **Deploy**: Vercel will automatically deploy on push

### Required Environment Variables for Vercel:
```bash
# Copy these from .env.example and fill with your actual values
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PREMIUM_PRICE_ID=
STRIPE_PRO_PRICE_ID=
OPENAI_API_KEY=
GOOGLE_TRANSLATE_API_KEY=
NEXT_PUBLIC_SENTRY_DSN=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

For complete production setup including Firebase, Stripe webhooks, and monitoring, see **[PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)**.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Next.js, Firebase, and modern web technologies.**
