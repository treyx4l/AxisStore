# Paystack Integration Setup

## Overview
The store now uses Paystack for payment processing. Orders are only created after successful payment.

## Setup Instructions

### 1. Get Paystack API Keys

1. Sign up for a Paystack account at https://paystack.com
2. Go to Settings → API Keys & Webhooks
3. Copy your **Public Key** (starts with `pk_test_` for test mode or `pk_live_` for live mode)

### 2. Add to .env File

Add your Paystack public key to the `.env` file in the project root:

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

**Important**: 
- For testing, use a test key (starts with `pk_test_`)
- For production, use a live key (starts with `pk_live_`)
- Never commit your secret key to version control

### 3. Restart Dev Server

After adding the key, restart your development server:

```bash
npm run dev
```

## How It Works

1. **Order Creation**: When a user completes checkout, an order is created with `paymentStatus: 'pending'`
2. **Payment Initialization**: Paystack payment popup is opened
3. **Payment Success**: 
   - Order `paymentStatus` is updated to `'paid'`
   - Order `status` is updated to `'processing'`
   - Cart is cleared
   - User is redirected to orders page
4. **Payment Failure/Cancel**: Order remains with `paymentStatus: 'pending'` and user can retry payment

## Order Visibility

- **Users**: Only see orders with `paymentStatus: 'paid'` in their orders page
- **Admins**: Can see all orders (paid and pending) in the admin dashboard

## Payment Flow

```
User fills checkout form
    ↓
Order created (pending payment)
    ↓
Paystack popup opens
    ↓
User completes payment
    ↓
Payment callback updates order to 'paid'
    ↓
Order appears in user's orders page
```

## Testing

### Test Cards (Test Mode)

Use these test cards in test mode:

- **Successful Payment**: `4084084084084081`
- **Declined Payment**: `5060666666666666666`
- **Insufficient Funds**: `5060666666666666667`

Use any future expiry date, any CVV, and any PIN.

### Test Mobile Money

- **MTN**: Use phone number `0244123456`
- **Vodafone**: Use phone number `0201234567`
- **AirtelTigo**: Use phone number `0271234567`

## Webhook Setup (Optional)

For production, set up webhooks to handle payment verification:

1. Go to Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/paystack/webhook`
3. Select events: `charge.success`, `charge.failed`

## Security Notes

- Always use HTTPS in production
- Never expose your secret key in client-side code
- Verify payments server-side using webhooks
- Use test keys during development

## Support

For Paystack documentation, visit: https://paystack.com/docs

