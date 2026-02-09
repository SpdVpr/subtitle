# Feedback System - Two-Way Communication

## 🎯 Overview

The feedback system now supports **two-way communication** between users and admins:

1. **Users** (logged in) submit feedback
2. **Admins** can reply to feedback
3. **Users** see admin responses on their "My Feedback" page

## 📋 Features

### For Users

- ✅ Submit feedback (anonymous or logged in)
- ✅ View all their feedback submissions
- ✅ See admin responses
- ✅ Track feedback status (New, Read, Replied, Resolved)
- ✅ Get notified when admin responds

### For Admins

- ✅ View all feedback
- ✅ Filter by status (New, Read, Replied, Resolved)
- ✅ Reply to registered users' feedback
- ✅ Update feedback status and priority
- ✅ See user information (name, email)
- ✅ Track which feedback has been replied to

## 🗂️ Database Schema

### Feedback Collection (`feedback`)

```typescript
{
  id: string
  feedback: string
  timestamp: Timestamp
  submittedAt: string
  locale: 'en' | 'cs'
  url?: string
  ipHash: string
  userAgent?: string
  status: 'new' | 'read' | 'resolved' | 'replied'
  priority: 'low' | 'normal' | 'high'
  
  // User identification (if logged in)
  userId?: string
  userEmail?: string
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
```

## 🔄 User Flow

### 1. User Submits Feedback

**Anonymous User:**
```
/feedback → Submit feedback → Stored without userId
```

**Logged In User:**
```
/feedback → Submit feedback → Stored with userId, userEmail, userName
```

### 2. Admin Reviews Feedback

```
/admin → Feedback tab → See all feedback
```

**Admin can:**
- Change status (New → Read → Replied → Resolved)
- Change priority (Low, Normal, High)
- Reply to registered users (button only shows for logged-in users)

### 3. Admin Replies

```
Click "Reply" button → Write message → Send
```

**What happens:**
- Feedback status changes to "Replied"
- Admin response is saved with message, admin email, timestamp
- User can see response on their "My Feedback" page

### 4. User Sees Response

```
/my-feedback → See all feedback → See admin responses
```

## 📁 Files Structure

### API Endpoints

1. **`/api/feedback`** (POST)
   - Submit new feedback
   - Accepts userId, userEmail, userName for logged-in users

2. **`/api/admin/feedback`** (GET, PATCH)
   - GET: List all feedback (admin only)
   - PATCH: Update feedback status/priority

3. **`/api/admin/feedback/reply`** (POST)
   - Admin replies to feedback
   - Requires feedbackId and message
   - Only works for feedback with userId

4. **`/api/user/feedback`** (GET)
   - User views their own feedback
   - Requires userId query parameter

### Pages

1. **`/feedback`** or **`/cs/feedback`**
   - Submit feedback form
   - Automatically includes user info if logged in

2. **`/my-feedback`** or **`/cs/my-feedback`**
   - User's feedback history
   - Shows admin responses
   - Requires login

3. **`/admin`** → Feedback tab
   - Admin dashboard
   - View all feedback
   - Reply to users

### Components

1. **`src/components/admin/feedback-management.tsx`**
   - Admin feedback management UI
   - Reply functionality
   - Status/priority updates

2. **`src/app/cs/my-feedback/page.tsx`**
   - User feedback history page (Czech)

3. **`src/app/my-feedback/page.tsx`**
   - User feedback history page (English)

## 🎨 UI Features

### Admin Dashboard

**Feedback Card:**
```
┌─────────────────────────────────────────┐
│ [Status Badge] [Language] [Priority]    │
│ User: John Doe (john@example.com)       │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ User's feedback message...          │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ [Admin Response (if exists)]            │
│                                          │
│ [Reply Button] [Status] [Priority]      │
└─────────────────────────────────────────┘
```

**Reply Form:**
```
┌─────────────────────────────────────────┐
│ Your Reply                               │
│ ┌─────────────────────────────────────┐ │
│ │ Write your response...              │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│ [Send Reply] [Cancel]  123/2000 chars   │
└─────────────────────────────────────────┘
```

### User "My Feedback" Page

**Feedback Card:**
```
┌─────────────────────────────────────────┐
│ [Status Badge]              Date        │
│                                          │
│ Your message:                            │
│ ┌─────────────────────────────────────┐ │
│ │ Your feedback...                    │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ 💬 Team Response                    │ │
│ │ Admin's reply message...            │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 🔐 Security

### Admin Authentication

- Admin endpoints check `x-admin-email` header
- Only emails in `ADMIN_EMAILS` env variable can access
- Replies are signed with admin email

### User Authentication

- Users can only see their own feedback
- API checks userId matches request
- Anonymous feedback cannot receive replies

### Data Privacy

- IP addresses are hashed
- User emails only stored if user is logged in
- Admin responses are visible only to the user

## 🚀 Usage Examples

### Admin Replying to Feedback

```typescript
// Admin clicks "Reply" button
// Writes message: "Thank you for your feedback! We've fixed the issue with Vietnamese filenames."
// Clicks "Send Reply"

// API Call:
POST /api/admin/feedback/reply
Headers: { 'x-admin-email': 'admin@example.com' }
Body: {
  feedbackId: 'abc123',
  message: 'Thank you for your feedback! We've fixed the issue...'
}

// Response:
{
  success: true,
  message: 'Reply sent successfully'
}
```

### User Viewing Feedback

```typescript
// User navigates to /my-feedback
// API Call:
GET /api/user/feedback?userId=user123

// Response:
{
  success: true,
  feedback: [
    {
      id: 'abc123',
      feedback: 'Cannot download file with Vietnamese name',
      status: 'replied',
      adminResponse: {
        message: 'Thank you for your feedback! We've fixed the issue...',
        respondedBy: 'admin@example.com',
        respondedAt: '2025-09-30T13:00:00Z'
      }
    }
  ]
}
```

## 📊 Status Flow

```
New → Read → Replied → Resolved
 ↓      ↓       ↓
 └──────┴───────┴──→ Resolved (can skip steps)
```

**Status Meanings:**
- **New**: Just submitted, not yet reviewed
- **Read**: Admin has seen it
- **Replied**: Admin has responded
- **Resolved**: Issue is closed

## 🎯 Best Practices

### For Admins

1. **Always reply to registered users** - They took time to log in and provide feedback
2. **Be specific** - Reference the exact issue they mentioned
3. **Be helpful** - Provide solutions, workarounds, or timelines
4. **Be professional** - Represent the company well
5. **Update status** - Mark as "Resolved" when done

### For Users

1. **Log in before submitting** - Get responses from the team
2. **Be specific** - Describe the issue clearly
3. **Include details** - Browser, OS, steps to reproduce
4. **Check "My Feedback"** - See if admin has responded

## 🔮 Future Enhancements

- [ ] Email notifications when admin replies
- [ ] In-app notifications (bell icon)
- [ ] Feedback threading (multiple back-and-forth)
- [ ] File attachments (screenshots)
- [ ] Feedback voting (upvote useful feedback)
- [ ] Public feedback board (optional)
- [ ] Auto-close resolved feedback after 30 days

## 📝 Notes

- Anonymous feedback **cannot** receive replies (no userId)
- Admins can only reply once per feedback (no threading yet)
- Replies are permanent (cannot be edited/deleted)
- Users see all their feedback, regardless of status

---

**Implemented:** 2025-09-30  
**Version:** 1.0  
**Status:** ✅ Production Ready

