// phonepe-integration.js

// PhonePe Configuration
const PHONEPE_CONFIG = {
    merchantId: 'YOUR_MERCHANT_ID', // Replace with your PhonePe merchant ID
    saltKey: 'YOUR_SALT_KEY', // Replace with your PhonePe salt key
    saltIndex: 1,
    callbackUrl: window.location.origin + '/payment-callback.html',
    redirectUrl: window.location.origin + '/payment-success.html',
    mode: 'PRODUCTION' // Change to 'UAT' for testing
};

// Initialize PhonePe payment
async function initializePhonePePayment(orderData) {
    try {
        // Generate unique transaction ID
        const transactionId = 'TRX' + Date.now() + Math.random().toString(36).substr(2, 9);
        
        // Prepare payment payload
        const paymentPayload = {
            merchantId: PHONEPE_CONFIG.merchantId,
            merchantTransactionId: transactionId,
            amount: Math.round(orderData.total * 100), // Convert to paise
            merchantUserId: 'USER_' + Date.now(),
            redirectUrl: PHONEPE_CONFIG.redirectUrl,
            redirectMode: 'POST',
            callbackUrl: PHONEPE_CONFIG.callbackUrl,
            mobileNumber: orderData.phone,
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };
        
        // Base64 encode the payload
        const base64Payload = btoa(JSON.stringify(paymentPayload));
        
        // Generate checksum
        const checksum = await generateChecksum(base64Payload);
        
        // Create payment request
        const paymentRequest = {
            request: base64Payload,
            checksum: checksum
        };
        
        // In a real implementation, you would send this to your backend
        // which would then make the actual API call to PhonePe
        const response = await makePaymentRequest(paymentRequest);
        
        if (response.success) {
            // Redirect to PhonePe payment page
            window.location.href = response.data.instrumentResponse.redirectInfo.url;
        } else {
            throw new Error('Payment initialization failed');
        }
        
    } catch (error) {
        console.error('PhonePe payment error:', error);
        throw error;
    }
}

// Generate checksum for PhonePe
async function generateChecksum(payload) {
    // In a real implementation, this should be done on your backend
    // for security reasons. The salt key should never be exposed in frontend code
    const string = payload + '/pg/v1/pay' + PHONEPE_CONFIG.saltKey;
    const sha256 = await sha256Hash(string);
    return sha256 + '###' + PHONEPE_CONFIG.saltIndex;
}

// SHA-256 hash function
async function sha256Hash(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Make payment request (simulated for demo purposes)
async function makePaymentRequest(paymentRequest) {
    // In a real implementation, you would send this to your backend
    // which would then make the actual API call to PhonePe
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                code: 'PAYMENT_INITIATED',
                message: 'Payment initiated successfully',
                data: {
                    merchantId: PHONEPE_CONFIG.merchantId,
                    merchantTransactionId: 'TRX' + Date.now(),
                    instrumentResponse: {
                        type: 'PAY_PAGE',
                        redirectInfo: {
                            url: 'https://phonepe.com/payment-page-demo', // Demo URL
                            method: 'POST'
                        }
                    }
                }
            });
        }, 1000);
    });
}

// Check payment status
async function checkPaymentStatus(transactionId) {
    // In a real implementation, this would call your backend
    // which would then check the status with PhonePe
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                code: 'PAYMENT_SUCCESS',
                message: 'Payment completed successfully',
                data: {
                    merchantId: PHONEPE_CONFIG.merchantId,
                    merchantTransactionId: transactionId,
                    transactionId: 'PHONEPE_' + Date.now(),
                    amount: 1000, // Example amount
                    state: 'COMPLETED',
                    responseCode: 'SUCCESS'
                }
            });
        }, 1000);
    });
}

// Send order confirmation email
async function sendOrderConfirmationEmail(orderData, orderId) {
    // In a real implementation, this would call your backend API
    // which would use an email service like SendGrid, AWS SES, etc.
    const emailData = {
        to: orderData.email,
        subject: `Order Confirmation - VAARAHI #${orderId}`,
        template: 'order_confirmation',
        data: {
            orderId: orderId,
            customerName: `${orderData.firstName} ${orderData.lastName}`,
            orderItems: orderData.cartItems,
            totalAmount: orderData.total,
            shippingAddress: {
                street: orderData.streetAddress,
                city: orderData.city,
                state: orderData.state,
                pincode: orderData.pincode
            },
            orderDate: new Date().toLocaleString()
        }
    };
    
    // Simulate API call to email service
    return new Promise((resolve) => {
        console.log('Sending email with data:', emailData);
        setTimeout(() => {
            resolve({ success: true, messageId: 'MSG' + Date.now() });
        }, 500);
    });
}

// Export functions for use in other files
window.PhonePeIntegration = {
    initializePayment: initializePhonePePayment,
    checkPaymentStatus: checkPaymentStatus,
    sendOrderConfirmationEmail: sendOrderConfirmationEmail
};