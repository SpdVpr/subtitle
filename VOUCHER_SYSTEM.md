# Voucher System Documentation

## Overview

The voucher system allows administrators to generate promotional codes that users can redeem for free credits. This system is designed for marketing campaigns and promotional activities.

## Features

### For Administrators
- **Voucher Generation**: Create voucher codes with configurable credit amounts, expiration dates, and usage limits
- **Campaign Management**: Organize vouchers by campaign names for better tracking
- **Statistics & Analytics**: View redemption rates, campaign performance, and usage statistics
- **Voucher Management**: Deactivate or delete vouchers as needed
- **Audit Trail**: Complete logging of all voucher activities

### For Users
- **Easy Redemption**: Simple interface on the buy-credits page to redeem voucher codes
- **Automatic Credit Addition**: Credits are instantly added to user accounts upon successful redemption
- **Clear Feedback**: Detailed success/error messages for redemption attempts

## System Components

### API Endpoints

#### Admin Endpoints (require admin authentication)
- `POST /api/admin/vouchers/generate` - Generate new voucher codes
- `GET /api/admin/vouchers` - List and filter vouchers
- `DELETE /api/admin/vouchers` - Deactivate or delete vouchers
- `GET /api/admin/vouchers/stats` - Get voucher statistics

#### User Endpoints
- `POST /api/vouchers/redeem` - Redeem a voucher code

### Database Collections

#### `vouchers`
```typescript
{
  code: string              // Unique voucher code (e.g., "ABCD-EFGH-IJKL")
  creditAmount: number      // Credits awarded per redemption
  campaignName: string      // Campaign identifier
  description: string       // Optional description
  createdAt: Date          // Creation timestamp
  expiresAt: Date | null   // Expiration date (null = never expires)
  usageLimit: number       // Maximum number of uses
  usedCount: number        // Current usage count
  isActive: boolean        // Whether voucher is active
  createdBy: string        // Admin email who created it
  usedBy: string[]         // Array of user IDs who used it
  lastUsedAt?: Date        // Last redemption timestamp
}
```

#### `voucherActivity`
```typescript
{
  type: string             // 'generation', 'redemption', 'deactivate', 'delete'
  adminEmail?: string      // Admin performing the action
  voucherCode?: string     // Voucher code (for redemptions)
  userId?: string          // User ID (for redemptions)
  campaignName?: string    // Campaign name
  quantity?: number        // Number of vouchers (for generation)
  creditAmount?: number    // Credits involved
  timestamp: Date          // Action timestamp
}
```

#### Enhanced `creditTransactions`
Credit transactions now include voucher details when credits are added via voucher redemption:
```typescript
{
  // ... existing fields ...
  source?: string          // 'voucher' for voucher redemptions
  voucherDetails?: {
    voucherCode: string
    campaignName: string
    voucherDescription: string
  }
}
```

### UI Components

#### Admin Components
- `VoucherGenerator` - Form to generate new voucher codes
- `VoucherManagement` - Dashboard to view and manage existing vouchers
- Enhanced `CreditHistory` - Shows voucher redemptions in transaction history

#### User Components
- `VoucherRedemption` - Input field and redemption interface on buy-credits page

## Usage Guide

### Creating Vouchers (Admin)

1. Navigate to Admin Dashboard → Generate Vouchers tab
2. Fill in the voucher details:
   - **Campaign Name**: Identifier for the marketing campaign
   - **Credits per Voucher**: Number of credits each voucher provides
   - **Number of Vouchers**: How many codes to generate (max 1000)
   - **Expiration**: Days until expiration (0 = never expires)
   - **Usage Limit**: How many times each voucher can be used
   - **Description**: Optional notes about the campaign
3. Click "Generate Vouchers"
4. Copy codes or download CSV file for distribution

### Managing Vouchers (Admin)

1. Navigate to Admin Dashboard → Manage Vouchers tab
2. View statistics: total vouchers, redemption rates, campaign performance
3. Filter vouchers by campaign or status
4. Select vouchers to deactivate or delete
5. Monitor recent activity and usage patterns

### Redeeming Vouchers (Users)

1. Go to the Buy Credits page
2. Find the "Have a Voucher?" section
3. Enter the voucher code (format: XXXX-XXXX-XXXX)
4. Click "Redeem"
5. Credits are instantly added to the account

## Validation Rules

### Voucher Generation
- Campaign name is required
- Credit amount must be positive
- Quantity must be between 1 and 1000
- Expiration days must be 0 or positive
- Usage limit must be at least 1

### Voucher Redemption
- Voucher code must exist and be valid
- Voucher must be active (not deactivated)
- Voucher must not be expired
- Voucher must not exceed usage limit
- User cannot redeem the same voucher twice

## Security Features

- Admin authentication required for all admin operations
- Voucher codes are randomly generated with high entropy
- All activities are logged for audit purposes
- Proper input validation and sanitization
- Rate limiting through usage limits

## Marketing Campaign Examples

### Welcome Campaign
- **Campaign**: "Welcome Bonus 2024"
- **Credits**: 100 per voucher
- **Quantity**: 1000 vouchers
- **Expiration**: 30 days
- **Usage**: 1 time per voucher

### Holiday Promotion
- **Campaign**: "Holiday Special"
- **Credits**: 500 per voucher
- **Quantity**: 100 vouchers
- **Expiration**: 7 days
- **Usage**: 1 time per voucher

### Referral Program
- **Campaign**: "Referral Rewards"
- **Credits**: 200 per voucher
- **Quantity**: 500 vouchers
- **Expiration**: Never
- **Usage**: 1 time per voucher

## Monitoring and Analytics

The system provides comprehensive analytics:
- Total vouchers generated vs. redeemed
- Redemption rates by campaign
- Credit distribution statistics
- Usage patterns over time
- Top performing campaigns

## Technical Notes

- Voucher codes use format: XXXX-XXXX-XXXX (12 characters + dashes)
- Codes are case-insensitive for user convenience
- System supports both Firebase Admin SDK and Client SDK
- Proper error handling and user feedback
- Responsive design for mobile and desktop
- Integration with existing credit system and transaction logging

## Future Enhancements

Potential improvements for the voucher system:
- Bulk voucher operations
- Advanced filtering and search
- Export functionality for analytics
- Email integration for voucher distribution
- QR code generation for vouchers
- Time-based usage restrictions
- Geographic restrictions
- User-specific vouchers
