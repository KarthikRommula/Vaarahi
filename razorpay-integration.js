// razorpay-integration.js

// Razorpay Configuration
const RAZORPAY_CONFIG = {
    key_id: 'rzp_test_cEvJWOFsLexsYL',
    key_secret: 'JOGbSoe7jpTerje3JKJUvgIj',
    currency: 'INR',
    callbackUrl: window.location.origin + '/checkout.html?payment=callback',
    redirectUrl: window.location.origin + '/checkout.html?payment=success'
};

// Payment status constants
const PAYMENT_STATUS = {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE',
    CANCELLED: 'CANCELLED'
};

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

// Initialize Razorpay payment
async function initializeRazorpayPayment(orderData) {
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

        // Create Razorpay options
        const options = {
            key: RAZORPAY_CONFIG.key_id,
            amount: amount * 100, // Razorpay expects amount in paise
            currency: RAZORPAY_CONFIG.currency,
            name: 'Vaarahi',
            description: 'Payment for your order',
            order_id: transactionId,
            handler: function (response) {
                // Handle successful payment
                handlePaymentSuccess(response, paymentInfo);
            },
            prefill: {
                name: `${orderData.firstName || ''} ${orderData.lastName || ''}`,
                email: orderData.email,
                contact: orderData.phone
            },
            theme: {
                color: '#3399cc'
            }
        };

        // Create Razorpay instance
        const razorpay = new Razorpay(options);
        
        // Hide the processing overlay before opening Razorpay
        hidePaymentProcessingOverlay();
        
        // Open Razorpay payment window
        razorpay.open();
        
    } catch (error) {
        console.error('Payment initialization error:', error);
        // Unlock cart if payment fails
        unlockCart();
        hidePaymentProcessingOverlay();
        showPaymentNotification('Payment failed: ' + error.message, false);
        throw error;
    }
}

// Handle successful payment
async function handlePaymentSuccess(response, paymentInfo) {
    try {
        // Update payment status
        paymentInfo.status = PAYMENT_STATUS.SUCCESS;
        paymentInfo.razorpayPaymentId = response.razorpay_payment_id;
        paymentInfo.razorpayOrderId = response.razorpay_order_id;
        paymentInfo.razorpaySignature = response.razorpay_signature;
        storePaymentInfo(paymentInfo);

        // Mark order as complete
        const orderId = markOrderAsComplete(paymentInfo);
        
        // Show success notification
        showPaymentNotification('Payment successful! Order has been placed.', true);
        
        // Redirect to order confirmation page
        setTimeout(() => {
            window.location.href = 'order-confirmation.html?orderId=' + orderId;
        }, 2000);
    } catch (error) {
        console.error('Error handling payment success:', error);
        unlockCart();
        showPaymentNotification('Payment verification failed: ' + error.message, false);
        
        // Redirect to cart page
        setTimeout(() => {
            window.location.href = 'cart.html?payment=error';
        }, 2000);
    }
}

// Mark order as complete
function markOrderAsComplete(paymentInfo) {
    // Store completed order in localStorage
    const completedOrders = JSON.parse(localStorage.getItem('vaarahiCompletedOrders')) || [];
    const orderId = 'ORD' + Date.now();
    
    const orderDetails = {
        orderId,
        transactionId: paymentInfo.transactionId,
        razorpayPaymentId: paymentInfo.razorpayPaymentId,
        razorpayOrderId: paymentInfo.razorpayOrderId,
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

// Export functions for use in other files
window.RazorpayIntegration = {
    initializePayment: initializeRazorpayPayment,
    showPaymentNotification: showPaymentNotification
}; 