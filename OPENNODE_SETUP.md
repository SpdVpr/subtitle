# 🟠 OpenNode Bitcoin Lightning Integration

## 📋 **Overview**

This integration allows users to purchase credits using Bitcoin Lightning Network through OpenNode's payment gateway.

## 🔧 **Setup Instructions**

### **1. OpenNode Account Setup**

1. **Create OpenNode Account**: https://www.opennode.com/
2. **Get API Key**: Dashboard → Settings → API Keys
3. **Copy your API Key**: `4eb67af3-efa5-4b1f-99f8-7dc741acad5f` (already provided)

### **2. Environment Variables**

Add to your `.env.local` or Vercel environment variables:

```bash
# OpenNode Bitcoin Lightning Configuration
OPENNODE_API_KEY=4eb67af3-efa5-4b1f-99f8-7dc741acad5f
```

### **3. Webhook Configuration**

In OpenNode Dashboard → Settings → Webhooks:

1. **Add Webhook URL**: `https://www.subtitlebot.com/api/opennode/webhook`
2. **Select Events**: 
   - `invoice.paid`
   - `invoice.expired`
3. **Save Configuration**

## 💰 **Payment Packages**

The system supports the same credit packages as Stripe:

| Credits | USD Price | ~Satoshis* | Package Name |
|---------|-----------|------------|--------------|
| 100     | $1        | ~1,500     | Trial Pack   |
| 500     | $5        | ~7,500     | Starter Pack |
| 1,200   | $10       | ~15,000    | Popular Pack |
| 2,500   | $20       | ~30,000    | Professional Pack |

*Satoshi amounts are calculated dynamically based on current BTC price

## 🔄 **How It Works**

### **1. User Initiates Bitcoin Payment**
```typescript
// User clicks "Pay with Bitcoin ⚡" button
handleBitcoinPurchase(packageId)
```

### **2. Create Lightning Invoice**
```typescript
// API call to create OpenNode invoice
POST /api/opennode/create-invoice
{
  "userId": "firebase-user-id",
  "credits": 100
}
```

### **3. OpenNode Checkout**
- User is redirected to OpenNode hosted checkout
- Shows Lightning invoice QR code
- User pays with Lightning wallet

### **4. Webhook Processing**
```typescript
// OpenNode sends webhook when payment is confirmed
POST /api/opennode/webhook
{
  "type": "invoice.paid",
  "data": {
    "id": "invoice-id",
    "status": "paid",
    "amount": 1500, // satoshis
    "metadata": {
      "userId": "firebase-user-id",
      "credits": 100
    }
  }
}
```

### **5. Credits Added**
- Webhook handler adds credits to user account
- Creates transaction record in Firebase
- User sees updated credit balance

## 🧪 **Testing**

### **Test Invoice Creation**
```bash
curl -X POST https://www.subtitlebot.com/api/opennode/create-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "credits": 100
  }'
```

### **Test Webhook Endpoint**
```bash
curl -X GET https://www.subtitlebot.com/api/opennode/webhook
```

### **Check Invoice Status**
```bash
curl "https://www.subtitlebot.com/api/opennode/create-invoice?invoiceId=your-invoice-id"
```

## 🔍 **Monitoring**

### **OpenNode Dashboard**
- **Invoices**: View all payment attempts
- **Webhooks**: Monitor webhook delivery status
- **Analytics**: Track payment volume

### **Application Logs**
- **Vercel Functions**: Monitor webhook processing
- **Firebase Console**: Check credit transactions
- **Browser Console**: Debug payment flow

## 🚨 **Troubleshooting**

### **Invoice Creation Fails**
1. Check OpenNode API key in environment variables
2. Verify network connectivity to OpenNode API
3. Check API rate limits

### **Webhook Not Received**
1. Verify webhook URL in OpenNode dashboard
2. Check Vercel function logs
3. Ensure webhook endpoint is accessible

### **Credits Not Added**
1. Check webhook processing logs
2. Verify Firebase Admin SDK configuration
3. Check user ID in invoice metadata

### **Payment Stuck**
1. Check invoice status in OpenNode dashboard
2. Verify Lightning payment was broadcast
3. Check for webhook delivery failures

## 📊 **Database Schema**

### **Credit Transactions**
```typescript
{
  userId: string
  type: 'credit'
  credits: number
  description: string
  source: 'bitcoin_lightning'
  openNodeInvoiceId: string
  amountSats: number
  amountUSD: number
  paymentMethod: 'bitcoin_lightning'
  createdAt: Timestamp
  settledAt: string
}
```

### **Payments**
```typescript
{
  userId: string
  openNodeInvoiceId: string
  amountSats: number
  amountUSD: number
  credits: number
  packageName: string
  paymentMethod: 'bitcoin_lightning'
  status: 'completed'
  settledAt: string
  createdAt: Timestamp
}
```

## 🎯 **Benefits**

- ✅ **Instant Payments**: Lightning Network transactions
- ✅ **Low Fees**: Minimal transaction costs
- ✅ **Global Access**: No geographic restrictions
- ✅ **Privacy**: No personal information required
- ✅ **24/7 Availability**: Always accessible
- ✅ **Automatic Processing**: Webhook-driven credit addition

## 🔐 **Security**

- ✅ **API Key Protection**: Server-side only
- ✅ **Webhook Verification**: Secure event processing
- ✅ **Metadata Validation**: Prevent unauthorized credits
- ✅ **Firebase Security**: Protected database operations
- ✅ **HTTPS Only**: Encrypted communication

## 📈 **Next Steps**

1. **Test Integration**: Use testnet for initial testing
2. **Monitor Performance**: Track payment success rates
3. **User Feedback**: Gather user experience data
4. **Optimize UX**: Improve payment flow based on usage
5. **Scale**: Handle increased Bitcoin payment volume
