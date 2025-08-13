# Firebase Setup Instructions

## 1. Fix Google Sign-In "unauthorized-domain" Error

### In Firebase Console:
1. Go to https://console.firebase.google.com
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add these domains:
   - `localhost` (for local development)
   - `subtitle-ai.vercel.app` (your Vercel domain)
   - Any custom domain you're using

### Environment Variables Needed:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 2. Enable Authentication Methods

### In Firebase Console → Authentication → Sign-in method:
1. **Email/Password**: Enable
2. **Google**: Enable and configure
   - Add your domain to authorized domains
   - Set up OAuth consent screen

## 3. Firestore Database Setup

### Create Firestore Database:
1. Go to **Firestore Database**
2. Create database in production mode
3. Set up security rules (see below)

### Security Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Credit transactions - users can read their own
    match /creditTransactions/{transactionId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if false; // Only server can write
    }
    
    // Admin can read all (implement proper admin check)
    match /{document=**} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## 4. Test Registration Flow

After setup, test:
1. Go to `/register`
2. Try email registration
3. Try Google Sign-In
4. Check if user appears in Admin Dashboard
