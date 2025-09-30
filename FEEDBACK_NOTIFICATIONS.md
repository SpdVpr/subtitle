# Feedback Notification System

## 🎯 Overview

A comprehensive notification system that alerts users when admins reply to their feedback. The system includes in-app notifications with a bell icon in the header and is prepared for future email integration.

## ✅ Features Implemented

### 1. **In-App Notifications**
- **Bell Icon**: Visible in header for logged-in users
- **Unread Badge**: Shows count of unread notifications
- **Dropdown Panel**: Displays recent notifications with details
- **Real-time Updates**: Polls for new notifications every 30 seconds
- **Mark as Read**: Users can mark individual notifications as read
- **Direct Links**: Click to view feedback with admin response

### 2. **Admin Reply System**
- **Reply API**: `/api/feedback/[id]/reply` endpoint
- **Automatic Notification**: Creates notification when admin replies
- **User Tracking**: Links notification to user's feedback
- **Status Update**: Updates feedback status to "replied"

### 3. **Notification Storage**
- **Firestore Collection**: `notifications`
- **Fields**:
  - `userId`: User who receives the notification
  - `type`: Notification type (e.g., 'feedback_reply')
  - `title`: Notification title
  - `message`: Notification message
  - `feedbackId`: Reference to feedback item
  - `read`: Boolean flag for read status
  - `createdAt`: Timestamp
  - `readAt`: Timestamp when marked as read

### 4. **User Experience**
- **My Feedback Page**: Shows all feedback with admin replies
- **Visual Indicators**: Different colors for replied feedback
- **Timestamp Display**: Shows when admin replied
- **Admin Name**: Displays who replied

## 📁 Files Created/Modified

### New Files:
1. **`src/app/api/feedback/[id]/reply/route.ts`**
   - POST endpoint for admin replies
   - Creates notifications for users
   - Updates feedback status

2. **`src/app/api/notifications/route.ts`**
   - GET: Fetch user notifications
   - PATCH: Mark notifications as read

3. **`src/components/notifications-bell.tsx`**
   - Bell icon component with dropdown
   - Displays notifications
   - Handles mark as read

### Modified Files:
1. **`src/components/layout/header.tsx`**
   - Added NotificationsBell component
   - Shows bell icon for logged-in users

2. **`src/components/admin/feedback-management.tsx`**
   - Updated sendReply function
   - Uses new reply API endpoint
   - Shows success message with notification status

3. **`src/app/my-feedback/page.tsx`**
   - Updated to show admin replies
   - Supports both new and old reply formats
   - Better visual presentation

## 🔧 How It Works

### Admin Replies to Feedback:

1. **Admin clicks "Reply"** on feedback item
2. **Enters reply message** (min 10 characters)
3. **Clicks "Send Reply"**
4. **API processes**:
   - Saves reply to feedback document
   - Updates status to "replied"
   - Creates notification for user (if userId exists)
   - Returns success with notification status

### User Receives Notification:

1. **Bell icon shows badge** with unread count
2. **User clicks bell** to open dropdown
3. **Sees notification**: "Admin replied to your feedback"
4. **Clicks "View feedback"** to see full reply
5. **Notification marked as read** automatically

### Notification Polling:

- **Automatic**: Checks every 30 seconds
- **Manual**: User can refresh by clicking bell
- **Efficient**: Only fetches when user is logged in

## 📊 Database Schema

### Notifications Collection:
```typescript
{
  id: string                    // Auto-generated
  userId: string                // User who receives notification
  type: 'feedback_reply'        // Notification type
  title: string                 // "Admin replied to your feedback"
  message: string               // "{adminName} replied to your feedback"
  feedbackId: string            // Reference to feedback
  read: boolean                 // Read status
  createdAt: string             // ISO timestamp
  readAt?: string               // ISO timestamp (when marked as read)
}
```

### Feedback Collection (Updated):
```typescript
{
  // ... existing fields ...
  adminReply?: string           // Admin's reply message
  adminId?: string              // Admin user ID
  adminName?: string            // Admin display name
  repliedAt?: string            // ISO timestamp
  status: 'replied'             // Updated status
}
```

## 🚀 Usage

### For Admins:

1. Go to `/admin` → Feedback tab
2. Find feedback from registered user (has email/name)
3. Click "Reply" button
4. Write reply (min 10 characters)
5. Click "Send Reply"
6. User will be notified automatically

### For Users:

1. Submit feedback while logged in
2. Wait for admin reply
3. See notification bell badge when admin replies
4. Click bell to view notification
5. Click "View feedback" to see full reply
6. Or go to `/my-feedback` to see all feedback

## 📧 Email Notifications (Future)

The system is prepared for email integration. To enable:

1. **Choose Email Service**:
   - SendGrid
   - Resend
   - AWS SES
   - Nodemailer with SMTP

2. **Add Environment Variables**:
   ```env
   EMAIL_SERVICE_API_KEY=your_api_key
   EMAIL_FROM_ADDRESS=noreply@subtitlebot.com
   EMAIL_FROM_NAME=SubtitleBot Support
   ```

3. **Uncomment Email Code** in:
   - `src/app/api/feedback/[id]/reply/route.ts` (lines 70-88)

4. **Create Email Template**:
   ```html
   <h2>We replied to your feedback!</h2>
   <p>Hi {userName},</p>
   <p>An admin has replied to your feedback:</p>
   <blockquote>{adminReply}</blockquote>
   <p><a href="{appUrl}/my-feedback">View your feedback</a></p>
   ```

## 🔒 Security

- **User Verification**: Only logged-in users receive notifications
- **Data Privacy**: Users only see their own notifications
- **Rate Limiting**: Notification polling limited to 30s intervals
- **Admin Auth**: Reply endpoint requires admin authentication

## 🎨 UI/UX Features

### Bell Icon:
- **Unread Badge**: Red circle with count (max 9+)
- **Hover Effect**: Smooth color transition
- **Dropdown**: Clean, modern design
- **Dark Mode**: Full support

### Notification Item:
- **Icon**: Different icons for notification types
- **Title**: Bold, clear heading
- **Message**: Descriptive text
- **Timestamp**: Relative time (e.g., "5m ago")
- **Actions**: "View feedback" and "Mark as read"
- **Unread Indicator**: Blue dot for unread items

### My Feedback Page:
- **Status Badges**: Color-coded status indicators
- **Reply Section**: Highlighted admin replies
- **Timestamps**: Shows when feedback submitted and replied
- **Empty State**: Helpful message with CTA

## 📈 Future Enhancements

### Potential Improvements:

1. **Email Notifications**:
   - Integrate with email service
   - Customizable email templates
   - Email preferences in user settings

2. **Push Notifications**:
   - Browser push notifications
   - Mobile app notifications (if applicable)

3. **Notification Types**:
   - System announcements
   - Feature updates
   - Credit purchases
   - Translation completion

4. **Advanced Features**:
   - Notification preferences
   - Mute/unmute notifications
   - Notification history
   - Bulk mark as read

5. **Analytics**:
   - Track notification open rates
   - Measure response times
   - User engagement metrics

## 🧪 Testing

### Test Scenarios:

1. **Admin Reply**:
   - ✅ Reply to feedback from registered user
   - ✅ Reply to feedback from anonymous user
   - ✅ Multiple replies to same feedback

2. **User Notifications**:
   - ✅ Receive notification when admin replies
   - ✅ See unread badge count
   - ✅ Mark notification as read
   - ✅ View feedback from notification

3. **Edge Cases**:
   - ✅ User not logged in (no notifications)
   - ✅ Feedback without userId (no notification created)
   - ✅ Multiple unread notifications
   - ✅ Notification polling while offline

## 🐛 Troubleshooting

### Notifications Not Showing:

1. **Check User Login**: User must be logged in
2. **Check userId**: Feedback must have userId field
3. **Check Firestore**: Verify notification document created
4. **Check Console**: Look for API errors

### Bell Icon Not Visible:

1. **Check Import**: Verify NotificationsBell imported in header
2. **Check User State**: Bell only shows for logged-in users
3. **Check CSS**: Verify no styling conflicts

### Notification Not Created:

1. **Check Feedback**: Must have userId field
2. **Check API**: Verify reply API response
3. **Check Firestore Rules**: Ensure write permissions
4. **Check Logs**: Look for error messages

## 📝 Configuration

### Polling Interval:
```typescript
// In notifications-bell.tsx
const interval = setInterval(loadNotifications, 30000) // 30 seconds
```

### Notification Limit:
```typescript
// In src/app/api/notifications/route.ts
.limit(50) // Max 50 notifications
```

### Unread Badge:
```typescript
// In notifications-bell.tsx
{unreadCount > 9 ? '9+' : unreadCount} // Show "9+" for 10+
```

## 🎉 Summary

The feedback notification system provides a seamless way for users to stay informed about admin responses. With in-app notifications, users are immediately aware when their feedback receives attention, improving engagement and satisfaction.

The system is designed to be extensible, with clear paths for adding email notifications, push notifications, and other notification types in the future.

