# Email Verification Testing Guide

## 🧪 Manual Testing Checklist

### ✅ Registration Flow Test
1. **Navigate to registration page**: `/register`
2. **Fill out form** with valid email and password
3. **Submit registration**
4. **Expected**: Success message mentioning email verification
5. **Expected**: Redirect to `/verify-email` page
6. **Check email inbox** for verification email
7. **Expected**: Email from Firebase with verification link

### ✅ Email Verification Page Test
1. **On `/verify-email` page**, verify:
   - Shows correct email address
   - "Resend Verification Email" button works
   - "I've Verified My Email" button works
   - Clear instructions displayed
2. **Test resend functionality**:
   - Click "Resend Verification Email"
   - Check for success message
   - Verify new email received
3. **Test verification check**:
   - Click verification link in email
   - Return to `/verify-email` page
   - Click "I've Verified My Email"
   - Should redirect to dashboard

### ✅ Protection Test (Before Verification)
Try accessing these pages **before** email verification:
- `/translate` → Should show verification required message
- `/cs/translate` → Should show verification required message  
- `/dashboard` → Should show verification required message
- `/cs/dashboard` → Should show verification required message

### ✅ Protection Test (After Verification)
Try accessing these pages **after** email verification:
- `/translate` → Should work normally
- `/cs/translate` → Should work normally
- `/dashboard` → Should work normally
- `/cs/dashboard` → Should work normally

### ✅ API Protection Test
1. **Before verification**, try translation API:
   ```bash
   curl -X POST http://localhost:3000/api/translate \
     -F "file=@test.srt" \
     -F "targetLanguage=cs" \
     -F "userId=unverified_user_id"
   ```
   **Expected**: 403 error with `EMAIL_NOT_VERIFIED` code

2. **After verification**, same API call should work

### ✅ Google Sign-In Test
1. **Sign in with Google account**
2. **Expected**: Immediate access to all features
3. **Expected**: No verification required
4. **Verify**: Can access `/translate` immediately

### ✅ Error Handling Test
1. **Test invalid verification links**
2. **Test expired verification links**
3. **Test resend with already verified email**
4. **Test network errors during resend**

## 🔧 Development Testing

### Local Development Setup
```bash
# Start development server
npm run dev

# Test with different user states:
# 1. New unverified user
# 2. Verified user  
# 3. Google user
# 4. No user (logged out)
```

### Firebase Console Verification
1. Go to Firebase Console → Authentication
2. Check user list for `emailVerified` status
3. Manually verify users if needed for testing

### Browser Testing
Test in different browsers:
- Chrome (desktop & mobile)
- Firefox
- Safari
- Edge

## 🐛 Common Issues & Solutions

### Email Not Received
- Check spam folder
- Verify Firebase email settings
- Check Firebase quotas
- Test with different email providers

### Verification Link Not Working
- Check Firebase Auth configuration
- Verify domain settings in Firebase
- Check for expired links

### Redirect Issues
- Clear browser cache
- Check for JavaScript errors
- Verify route configurations

### API Protection Not Working
- Check user authentication state
- Verify Firebase user object has `emailVerified` property
- Check API endpoint implementations

## 📱 Mobile Testing

### Responsive Design
- Test verification page on mobile devices
- Verify email links work in mobile email clients
- Check button sizes and touch targets

### Email Client Testing
- Gmail mobile app
- Apple Mail
- Outlook mobile
- Default Android email

## 🚀 Production Testing

### Pre-Deployment
- Test with real email addresses
- Verify email delivery in production environment
- Check Firebase production configuration
- Test with different email providers (Gmail, Yahoo, Outlook)

### Post-Deployment
- Monitor email delivery rates
- Check user verification completion rates
- Monitor error logs for verification issues
- Test user support scenarios

## 📊 Success Metrics

### What to Monitor
- **Verification Rate**: % of users who complete email verification
- **Time to Verify**: Average time from registration to verification
- **Resend Usage**: How often users need to resend emails
- **Support Tickets**: Reduction in spam-related issues

### Expected Results
- ✅ 90%+ of legitimate users complete verification within 24 hours
- ✅ Significant reduction in spam registrations
- ✅ Clear user experience with minimal confusion
- ✅ No legitimate users blocked from using the service

## 🎯 Test Scenarios

### Scenario 1: Happy Path
1. User registers → Gets email → Clicks link → Can translate

### Scenario 2: Email Issues
1. User registers → No email received → Uses resend → Gets email → Verifies

### Scenario 3: Google User
1. User signs in with Google → Immediately verified → Can translate

### Scenario 4: Spam Prevention
1. Bot tries to register → Gets account → Cannot translate without email access

### Scenario 5: Mobile User
1. User registers on mobile → Gets email on mobile → Clicks link → Verifies successfully

## 🔍 Debug Information

### Useful Console Logs
- Check browser console for auth state changes
- Monitor Firebase Auth events
- Check API response codes and messages

### Firebase Debug
- Use Firebase Auth emulator for local testing
- Check Firebase Console for user verification status
- Monitor Firebase Auth logs

This testing guide ensures the email verification system works correctly across all scenarios and user flows.
