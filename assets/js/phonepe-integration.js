// phonepe-integration.js

// PhonePe Configuration
const PHONEPE_CONFIG = {
    // Test credentials for PhonePe UAT environment
    merchantId: 'MERCHANTUAT',  // Test merchant ID for UAT environment
    saltKey: '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399',   // Test salt key for UAT environment
    saltIndex: '1',             // Default salt index
    environment: 'UAT',         // Using test environment
    apiEndpoint: 'https://api-preprod.phonepe.com/apis/pg-sandbox', // Test API endpoint
    callbackUrl: window.location.origin + '/checkout.html?payment=callback',
    redirectUrl: window.location.origin + '/checkout.html?payment=success',
};

// Payment status constants
const PAYMENT_STATUS = {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE',
    CANCELLED: 'CANCELLED'
};

// SHA256 hash function for checksum generation
async function sha256Hash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Store payment information in sessionStorage
const storePaymentInfo = (paymentInfo) => {
    sessionStorage.setItem('vaarahiPaymentInfo', JSON.stringify(paymentInfo));
};

// Get payment information from sessionStorage
const getPaymentInfo = () => {
    const info = sessionStorage.getItem('vaarahiPaymentInfo');
    return info ? JSON.parse(info) : null;
};

// Clear payment information from sessionStorage
const clearPaymentInfo = () => {
    sessionStorage.removeItem('vaarahiPaymentInfo');
};

// Initialize PhonePe payment (Simulated for testing)
async function initializePhonePePayment(orderData) {
    try {
        // Lock the cart to prevent modifications during payment
        lockCart();
        
        // Show payment processing overlay
        showPaymentProcessingOverlay();
        
        // Generate unique transaction ID
        const transactionId = 'TRX' + Date.now() + Math.random().toString(36).substr(2, 9);
        
        // Get cart items and total from localStorage
        const cartItems = JSON.parse(localStorage.getItem('vaarahiCart')) || [];
        const cartTotal = cartItems.reduce((total, item) => total + (parseFloat(item.price) * parseInt(item.quantity)), 0);
        
        // Use cart total if orderData.total is not provided
        const amount = orderData.total || cartTotal;
        
        // Store payment information for later verification
        const paymentInfo = {
            transactionId,
            amount,
            status: PAYMENT_STATUS.PENDING,
            timestamp: new Date().toISOString(),
            orderData: {
                ...orderData,
                cartItems,
                total: amount
            }
        };
        storePaymentInfo(paymentInfo);
        
        console.log('Payment info stored:', paymentInfo);
        
        // For testing: Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Create a simulated payment URL (our own page with transaction ID)
        const simulatedPaymentUrl = `${window.location.origin}/checkout.html?payment=simulate&transactionId=${transactionId}`;
        
        // Store payment data in localStorage for retrieval after payment
        const paymentData = {
            orderId: orderData.orderId || 'ORD' + Date.now(),
            transactionId: transactionId,
            amount: amount,
            orderData: orderData
        };
        localStorage.setItem('currentPayment', JSON.stringify(paymentData));
        
        // Hide the processing overlay before redirecting
        hidePaymentProcessingOverlay();
        
        // Show success notification
        showPaymentNotification('Redirecting to payment page...', true);
        
        // Redirect to simulated payment page
        console.log('Redirecting to simulated payment page:', simulatedPaymentUrl);
        setTimeout(() => {
            window.location.href = simulatedPaymentUrl;
        }, 1000);
        
    } catch (error) {
        console.error('Payment initialization error:', error);
        // Unlock cart if payment fails
        unlockCart();
        hidePaymentProcessingOverlay();
        showPaymentNotification('Payment failed: ' + error.message, false);
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

// Make payment request (simulated for demo purposes)
async function makePaymentRequest(paymentRequest) {
    // In a real implementation, you would send this to your backend
    // which would then make the actual API call to PhonePe
    return new Promise((resolve) => {
        setTimeout(() => {
            // For demo purposes, we'll simulate the payment page with a redirect to our own page
            // In a real implementation, this would be the actual PhonePe payment page URL
            const paymentInfo = getPaymentInfo();
            const demoPaymentUrl = `${window.location.origin}/checkout.html?payment=callback&transactionId=${paymentInfo.transactionId}`;
            
            resolve({
                success: true,
                code: 'PAYMENT_INITIATED',
                message: 'Payment initiated successfully',
                data: {
                    merchantId: PHONEPE_CONFIG.merchantId,
                    merchantTransactionId: paymentInfo.transactionId,
                    instrumentResponse: {
                        type: 'PAY_PAGE',
                        redirectInfo: {
                            url: demoPaymentUrl, // Use our own page for demo
                            method: 'GET'
                        }
                    }
                }
            });
        }, 1000);
    });
}

// Check payment status
async function checkPaymentStatus(transactionId) {
    try {
        // Get stored payment info
        const paymentInfo = getPaymentInfo();
        if (!paymentInfo || !paymentInfo.transactionId) {
            throw new Error('Payment information not found');
        }
        
        // Prepare data for status check
        const merchantId = PHONEPE_CONFIG.merchantId;
        const merchantTransactionId = paymentInfo.transactionId || transactionId;
        
        // Create checksum for status check
        const dataForChecksum = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + PHONEPE_CONFIG.saltKey;
        const checksum = await sha256Hash(dataForChecksum) + '###' + PHONEPE_CONFIG.saltIndex;
        
        console.log('Checking payment status for transaction:', merchantTransactionId);
        
        try {
            // In a production environment, this API call should be made from your server
            // For client-side implementation (not recommended for production), we're making the call directly
            const response = await fetch(`${PHONEPE_CONFIG.apiEndpoint}/pg/v1/status/${merchantId}/${merchantTransactionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                    'X-MERCHANT-ID': merchantId
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const responseData = await response.json();
            console.log('PhonePe status response:', responseData);
            
            // Update payment status in sessionStorage
            if (responseData.success) {
                const status = responseData.data.responseCode === 'SUCCESS' ? 
                    PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.FAILURE;
                
                paymentInfo.status = status;
                paymentInfo.responseCode = responseData.data.responseCode;
                paymentInfo.responseMessage = responseData.data.responseMessage;
                storePaymentInfo(paymentInfo);
                
                // If payment was successful, mark the order as complete
                if (status === PAYMENT_STATUS.SUCCESS) {
                    markOrderAsComplete(paymentInfo);
                } else if (status === PAYMENT_STATUS.FAILURE) {
                    // Unlock cart if payment fails
                    unlockCart();
                }
            }
            
            return responseData;
        } catch (error) {
            console.error('PhonePe status API error:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error checking payment status:', error);
        return {
            success: false,
            message: error.message,
            data: {
                merchantId: PHONEPE_CONFIG.merchantId,
                merchantTransactionId: transactionId,
                transactionId: transactionId,
                amount: 0,
                responseCode: 'INTERNAL_ERROR',
                responseMessage: error.message
            }
        };
    }
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

// Lock cart to prevent modifications during payment
function lockCart() {
    localStorage.setItem('vaarahiCartLocked', 'true');
}

// Unlock cart after payment is complete or failed
function unlockCart() {
    localStorage.removeItem('vaarahiCartLocked');
}

// Check if cart is locked
function isCartLocked() {
    return localStorage.getItem('vaarahiCartLocked') === 'true';
}

// Mark order as complete
function markOrderAsComplete(paymentInfo) {
    // Store completed order in localStorage
    const completedOrders = JSON.parse(localStorage.getItem('vaarahiCompletedOrders')) || [];
    const orderId = 'ORD' + Date.now();
    
    const orderDetails = {
        orderId,
        transactionId: paymentInfo.transactionId,
        amount: paymentInfo.amount,
        items: paymentInfo.orderData.cartItems,
        customerInfo: {
            name: `${paymentInfo.orderData.firstName || ''} ${paymentInfo.orderData.lastName || ''}`,
            email: paymentInfo.orderData.email,
            phone: paymentInfo.orderData.phone,
            address: paymentInfo.orderData.streetAddress,
            city: paymentInfo.orderData.city,
            state: paymentInfo.orderData.state,
            pincode: paymentInfo.orderData.pincode
        },
        timestamp: new Date().toISOString(),
        status: 'COMPLETED'
    };
    
    completedOrders.push(orderDetails);
    localStorage.setItem('vaarahiCompletedOrders', JSON.stringify(completedOrders));
    
    // Clear cart after successful payment
    localStorage.setItem('vaarahiCart', JSON.stringify([]));
    
    return orderId;
}

// Show payment processing overlay
function showPaymentProcessingOverlay() {
    // Create a payment processing overlay if it doesn't exist
    if (!document.getElementById('payment-processing-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'payment-processing-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '9999';
        
        const spinner = document.createElement('div');
        spinner.className = 'payment-spinner';
        spinner.innerHTML = `
            <div style="text-align: center; color: white;">
                <div class="spinner-border" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <h3 style="margin-top: 20px;">Processing Payment...</h3>
                <p>Please do not close this window</p>
            </div>
        `;
        
        overlay.appendChild(spinner);
        document.body.appendChild(overlay);
    } else {
        document.getElementById('payment-processing-overlay').style.display = 'flex';
    }
}

// Hide payment processing overlay
function hidePaymentProcessingOverlay() {
    const overlay = document.getElementById('payment-processing-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Show payment notification
function showPaymentNotification(message, isSuccess = true) {
    // Create notification element if it doesn't exist
    if (!document.getElementById('payment-notification')) {
        const notification = document.createElement('div');
        notification.id = 'payment-notification';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '5px';
        notification.style.color = 'white';
        notification.style.zIndex = '10000';
        notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        notification.style.transition = 'all 0.3s ease';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        
        document.body.appendChild(notification);
    }
    
    const notification = document.getElementById('payment-notification');
    notification.textContent = message;
    notification.style.backgroundColor = isSuccess ? '#28a745' : '#dc3545';
    
    // Show notification with animation
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Hide notification after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
    }, 5000);
}

// Handle payment callback (Simulated for testing)
async function handlePaymentCallback(urlParams) {
    try {
        // Extract transaction ID and payment status from URL parameters
        const transactionId = urlParams.get('transactionId') || '';
        const paymentStatus = urlParams.get('payment') || '';
        
        if (!transactionId) {
            throw new Error('Transaction ID not found in callback URL');
        }
        
        // Show processing overlay
        showPaymentProcessingOverlay();
        
        // For testing: Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // For testing: Simulate successful payment unless explicitly marked as failed
        const isSuccess = paymentStatus !== 'failed';
        
        // Hide processing overlay
        hidePaymentProcessingOverlay();
        
        // Get stored payment info
        const paymentInfo = getPaymentInfo();
        
        if (isSuccess) {
            // Update payment status
            if (paymentInfo) {
                paymentInfo.status = PAYMENT_STATUS.SUCCESS;
                storePaymentInfo(paymentInfo);
            }
            
            // Mark order as complete
            const orderId = markOrderAsComplete(paymentInfo);
            
            // Send confirmation email (simulated)
            await sendOrderConfirmationEmail(paymentInfo.orderData, orderId);
            
            // Show success notification
            showPaymentNotification('Payment successful! Order has been placed.', true);
            
            // Redirect to order confirmation page
            setTimeout(() => {
                window.location.href = 'order-confirmation.html?orderId=' + orderId;
            }, 2000);
        } else {
            // Payment failed
            if (paymentInfo) {
                paymentInfo.status = PAYMENT_STATUS.FAILURE;
                storePaymentInfo(paymentInfo);
            }
            
            unlockCart();
            showPaymentNotification('Payment failed or cancelled by user', false);
            
            // Redirect to cart page
            setTimeout(() => {
                window.location.href = 'cart.html?payment=failed';
            }, 2000);
        }
    } catch (error) {
        console.error('Error handling payment callback:', error);
        hidePaymentProcessingOverlay();
        unlockCart();
        showPaymentNotification('Payment verification failed: ' + error.message, false);
        
        // Redirect to cart page
        setTimeout(() => {
            window.location.href = 'cart.html?payment=error';
        }, 2000);
    }
}

// Check if current page is payment callback page
function checkIfPaymentCallbackPage() {
    // Check for payment query parameters instead of specific pages
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'callback' || paymentStatus === 'success' || paymentStatus === 'simulate') {
        console.log('Payment callback detected:', paymentStatus);
        handlePaymentCallback(urlParams);
    }
}

// Initialize payment callback handler when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    checkIfPaymentCallbackPage();
});

// Export functions for use in other files
window.PhonePeIntegration = {
    initializePayment: initializePhonePePayment,
    checkPaymentStatus: checkPaymentStatus,
    sendOrderConfirmationEmail: sendOrderConfirmationEmail,
    isCartLocked: isCartLocked,
    showPaymentNotification: showPaymentNotification,
    handlePaymentCallback: handlePaymentCallback
};