# PhonePe Business Integration Guide

This guide will help you set up PhonePe Business integration for your e-commerce website.

## Step 1: Register for PhonePe Business Account

1. Visit [PhonePe Business](https://business.phonepe.com/) website
2. Sign up for a merchant account
3. Complete the KYC verification process
4. Once approved, you'll receive:
   - Merchant ID
   - Salt Key
   - Salt Index

## Step 2: Configure PhonePe Integration in Your Code

1. Open `assets/js/phonepe-integration.js`
2. Update the PhonePe configuration with your actual credentials:

```javascript
const PHONEPE_CONFIG = {
    merchantId: 'YOUR_MERCHANT_ID',  // Replace with your actual Merchant ID
    saltKey: 'YOUR_SALT_KEY',        // Replace with your actual Salt Key
    saltIndex: '1',                  // Usually '1' for most merchants
    environment: 'PRODUCTION',       // Use 'UAT' for testing
    apiEndpoint: 'https://api.phonepe.com/apis/hermes', // Use 'https://api-preprod.phonepe.com/apis/pg-sandbox' for testing
    callbackUrl: window.location.origin + '/checkout.html?payment=callback',
    redirectUrl: window.location.origin + '/checkout.html?payment=success',
};
```

## Step 3: Testing Your Integration

1. For testing, use the following credentials:
   - Merchant ID: `MERCHANTUAT`
   - Salt Key: `099eb0cd-02cf-4e2a-8aca-3e6c6aff0399`
   - Salt Index: `1`
   - Environment: `UAT`
   - API Endpoint: `https://api-preprod.phonepe.com/apis/pg-sandbox`

2. Test card details:
   - Card Number: `4111 1111 1111 1111`
   - Expiry: Any future date
   - CVV: Any 3 digits
   - Name: Any name
   - OTP: `123456`

## Step 4: Going Live

1. Update the PhonePe configuration with your production credentials
2. Change the environment to `PRODUCTION`
3. Change the API endpoint to `https://api.phonepe.com/apis/hermes`

## PhonePe Payment Flow

1. User fills checkout form and clicks "Pay with PhonePe"
2. The system generates a transaction ID and payment payload
3. The payload is sent to PhonePe API
4. User is redirected to PhonePe payment page
5. After payment, user is redirected back to your site
6. The system verifies the payment status with PhonePe
7. Order is marked as complete if payment is successful

## Troubleshooting

1. **Payment not initializing**:
   - Check browser console for errors
   - Verify your Merchant ID and Salt Key
   - Make sure the checksum generation is correct

2. **Callback not working**:
   - Ensure your callback URL is correctly configured
   - Check if the callback URL is accessible from the internet

3. **Payment verification failing**:
   - Verify that you're using the correct API endpoint
   - Check if the transaction ID is being properly passed

## Additional Resources

- [PhonePe Business Documentation](https://developer.phonepe.com/docs/pg-integration/pg-overview/)
- [PhonePe API Reference](https://developer.phonepe.com/docs/pg-integration/pg-apis/)
- [PhonePe Testing Guide](https://developer.phonepe.com/docs/pg-integration/pg-testing/)
