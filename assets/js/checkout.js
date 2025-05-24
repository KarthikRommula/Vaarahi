/**
 * VAARAHI E-commerce Checkout System
 * This script handles checkout functionality including:
 * - Loading cart items
 * - Calculating totals
 * - Auto-filling address from profile
 * - Form validation
 * - Order processing
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize checkout page
    initCheckout();
    
    // Add event listeners
    document.getElementById('checkout-form').addEventListener('submit', processOrder);
    
    // Auto-fill address from profile if user is logged in
    autoFillAddressFromProfile();
});

/**
 * Initialize checkout page
 */
function initCheckout() {
    // Load cart items
    loadCartItems();
    
    // Calculate and display totals
    calculateTotals();
    
    // Set up form validation
    setupFormValidation();
    
    // Add event listener for place order button
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Add loading state to button
            this.classList.add('loading');
            this.querySelector('.loading-spinner').style.display = 'inline-block';
            
            // Process the order
            processOrder(e);
        });
    }
}

/**
 * Load cart items from localStorage and display them
 */
function loadCartItems() {
    // Try different cart storage keys since the site might use different ones
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || 
                     JSON.parse(localStorage.getItem('vaarahiCart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (!cartItemsContainer) {
        console.log('Cart items container not found, creating one');
        // Find the order summary table and create the container if it doesn't exist
        const orderSummaryTable = document.querySelector('.cart_table');
        if (orderSummaryTable) {
            const tbody = orderSummaryTable.querySelector('tbody');
            if (!tbody) {
                const newTbody = document.createElement('tbody');
                newTbody.id = 'cart-items';
                orderSummaryTable.appendChild(newTbody);
                return loadCartItems(); // Retry after creating the container
            } else {
                tbody.id = 'cart-items';
                return loadCartItems(); // Retry after setting the ID
            }
        } else {
            console.error('Order summary table not found');
            return;
        }
    }
    
    // Clear container
    cartItemsContainer.innerHTML = '';
    
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<tr><td colspan="4" class="text-center">Your cart is empty</td></tr>';
        const checkoutButton = document.getElementById('checkout-button') || document.getElementById('place-order-btn');
        if (checkoutButton) checkoutButton.disabled = true;
        return;
    }
    
    // Add items to the cart summary
    cartItems.forEach(item => {
        const itemRow = document.createElement('tr');
        itemRow.innerHTML = `
            <td class="cart-col-image">
                <img src="${item.image || 'assets/img/product/placeholder.jpg'}" alt="${item.name || 'Product'}" class="cart-product-image" style="width: 80px; height: 80px; object-fit: cover;">
            </td>
            <td class="cart-col-productname">
                <span>${item.name || 'Product'}</span>
            </td>
            <td class="cart-col-price">₹${(item.price || 0).toFixed(2)}</td>
            <td class="cart-col-quantity">${item.quantity || 1}</td>
            <td class="cart-col-total">₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
        `;
        cartItemsContainer.appendChild(itemRow);
    });
    
    // Calculate and update totals directly instead of calling updateOrderSummary
    calculateTotals();
}

/**
 * Calculate and display order totals
 */
function calculateTotals() {
    // Try different cart storage keys since the site might use different ones
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || 
                     JSON.parse(localStorage.getItem('vaarahiCart')) || [];
    
    // Calculate subtotal
    const subtotal = cartItems.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);
    
    // Calculate shipping (simplified example)
    const shipping = subtotal > 1000 ? 0 : 100;
    
    // Calculate total
    const total = subtotal + shipping;
    
    // Update DOM - safely check if elements exist first
    const subtotalElement = document.getElementById('subtotal-amount');
    const shippingElement = document.getElementById('shipping-amount');
    const totalElement = document.getElementById('total-amount');
    
    if (subtotalElement) subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `₹${total.toFixed(2)}`;
    
    return { subtotal, shipping, total };
}

/**
 * Update order summary with cart items
 * @param {Array} cartItems - Cart items to display
 */
function updateOrderSummary(cartItems) {
    if (!cartItems || !Array.isArray(cartItems)) {
        console.error('Invalid cart items provided to updateOrderSummary');
        return;
    }
    
    // Calculate totals
    const { subtotal, shipping, total } = calculateTotals();
    
    // Find summary elements
    const subtotalElement = document.querySelector('.cart_totals .subtotal .amount') || document.getElementById('subtotal-amount');
    const shippingElement = document.querySelector('.cart_totals .shipping .amount') || document.getElementById('shipping-amount');
    const totalElement = document.querySelector('.cart_totals .order-total .amount') || document.getElementById('total-amount');
    
    // Update summary elements if they exist
    if (subtotalElement) subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `₹${total.toFixed(2)}`;
    
    // Update item count in the header cart icon if it exists
    const cartCountBadge = document.querySelector('.header-button .badge');
    if (cartCountBadge) {
        const itemCount = cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
        cartCountBadge.textContent = itemCount.toString();
    }
}

/**
 * Auto-fill address from profile data
 */
function autoFillAddressFromProfile() {
    console.log('Running address auto-fill function');
    
    // Make sure auth is available
    if (typeof auth === 'undefined') {
        console.error('Auth module not available for address auto-fill');
        return;
    }
    
    // Get current user data with all address fields
    const userData = auth.getCurrentUser();
    console.log('User data for auto-fill:', userData);
    
    if (userData) {
        // Auto-fill name and contact info
        if (userData.name) {
            const nameParts = userData.name.split(' ');
            document.getElementById('firstName').value = nameParts[0] || '';
            document.getElementById('lastName').value = nameParts.slice(1).join(' ') || '';
        }
        
        // Auto-fill contact information
        document.getElementById('email').value = userData.email || '';
        document.getElementById('phone').value = userData.phone || '';
        
        // Auto-fill complete address information
        document.getElementById('streetAddress').value = userData.address || '';
        document.getElementById('city').value = userData.city || '';
        
        // Set state if it exists in the dropdown
        const stateSelect = document.getElementById('state');
        if (stateSelect && userData.state) {
            for (let i = 0; i < stateSelect.options.length; i++) {
                if (stateSelect.options[i].value === userData.state) {
                    stateSelect.selectedIndex = i;
                    break;
                }
            }
        }
        
        // Auto-fill postal code (pincode)
        document.getElementById('pincode').value = userData.postalCode || '';
        
        // Show notification if address was auto-filled
        if (userData.address) {
            showNotification('Your address details have been auto-filled from your profile.', 'info');
        }
    }
}

/**
 * Set up form validation
 */
function setupFormValidation() {
    const form = document.getElementById('checkout-form');
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
        
        field.addEventListener('input', function() {
            // Hide error message when user starts typing
            const errorMessage = this.nextElementSibling;
            if (errorMessage && errorMessage.classList.contains('error-message')) {
                errorMessage.style.display = 'none';
            }
        });
    });
}

/**
 * Validate a single form field
 */
function validateField(field) {
    const errorMessage = field.nextElementSibling;
    if (!errorMessage || !errorMessage.classList.contains('error-message')) return;
    
    if (!field.checkValidity()) {
        errorMessage.style.display = 'block';
        return false;
    } else {
        errorMessage.style.display = 'none';
        return true;
    }
}

/**
 * Shows a notification using the global notification system
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, warning, info)
 * @param {number} duration - How long to show the notification in milliseconds
 */
function showNotification(message, type = 'success', duration = 3000) {
    // Use the global notification system if available
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type, duration);
        return;
    }
    
    // Fallback to alert if notification system is not available
    // This should rarely happen since we're including notification-system.js
    alert(message);
}

// Global variable to track if notification is currently showing
let isNotificationShowing = false;

/**
 * Validate the entire form
 */
function validateForm() {
    const form = document.getElementById('checkout-form');
    if (!form) return false;
    
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    let firstInvalidField = null;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
            if (!firstInvalidField) {
                firstInvalidField = field;
            }
        }
    });
    
    // Focus on the first invalid field to guide the user
    if (firstInvalidField) {
        firstInvalidField.focus();
    }
    
    return isValid;
}

/**
 * Process the order
 */
function processOrder(e) {
    if (e) e.preventDefault();
    
    // Get the place order button
    const placeOrderBtn = document.getElementById('place-order-btn');
    
    // Check if button is already in loading state to prevent multiple submissions
    if (placeOrderBtn && placeOrderBtn.classList.contains('loading')) {
        return false;
    }
    
    // Add loading state to button if it exists
    if (placeOrderBtn) {
        placeOrderBtn.classList.add('loading');
        const spinner = placeOrderBtn.querySelector('.loading-spinner');
        if (spinner) spinner.style.display = 'inline-block';
    }
    
    // Validate form first
    if (!validateForm()) {
        showNotification('Please fill in all required fields correctly.', 'error');
        
        // Remove loading state from button
        if (placeOrderBtn) {
            placeOrderBtn.classList.remove('loading');
            const spinner = placeOrderBtn.querySelector('.loading-spinner');
            if (spinner) spinner.style.display = 'none';
        }
        
        return false;
    }
    
    // Check if cart is empty
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    if (cartItems.length === 0) {
        showNotification('Your cart is empty. Please add items to your cart before checkout.', 'warning');
        
        // Remove loading state from button
        if (placeOrderBtn) {
            placeOrderBtn.classList.remove('loading');
            const spinner = placeOrderBtn.querySelector('.loading-spinner');
            if (spinner) spinner.style.display = 'none';
        }
        
        return false;
    }
    
    // Get form data
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('streetAddress').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        pincode: document.getElementById('pincode').value,
        notes: document.querySelector('textarea')?.value || ''
    };
    
    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 1000 ? 0 : 100;
    const total = subtotal + shipping;
    
    // Create order object
    const order = {
        id: 'ORD' + Date.now(),
        date: new Date().toISOString(),
        customer: formData,
        items: cartItems,
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        status: 'pending'
    };
    
    try {
        // Save order to localStorage (in a real app, this would be sent to a server)
        saveOrder(order);
        
        // Clear cart
        localStorage.removeItem('cartItems');
        
        // Show success notification
        showNotification('Your order has been placed successfully! Thank you for shopping with VAARAHI.', 'success', 5000);
        
        // Redirect to order confirmation page after a delay
        setTimeout(() => {
            // Uncomment this when order-confirmation.html is ready
            // window.location.href = 'order-confirmation.html?id=' + order.id;
            
            // For now, redirect to home page
            window.location.href = 'index.html';
        }, 3000);
    } catch (error) {
        console.error('Error processing order:', error);
        showNotification('There was an error processing your order. Please try again.', 'error');
        
        // Remove loading state from button
        if (placeOrderBtn) {
            placeOrderBtn.classList.remove('loading');
            const spinner = placeOrderBtn.querySelector('.loading-spinner');
            if (spinner) spinner.style.display = 'none';
        }
    }
    
    return false; // Prevent form submission
}

/**
 * Save order to localStorage
 */
function saveOrder(order) {
    // Get existing orders
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Add new order
    orders.push(order);
    
    // Save back to localStorage
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // If user is logged in, associate order with user
    if (typeof auth !== 'undefined') {
        const userData = auth.getCurrentUser();
        if (userData) {
            // Get user's orders
            const userOrders = userData.orders || [];
            userOrders.push(order.id);
            
            // Update user data
            userData.orders = userOrders;
            auth.updateUserData(userData);
        }
    }
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    // Check if notification system is available
    if (typeof notificationSystem !== 'undefined') {
        notificationSystem.showNotification(message, type);
    } else {
        // Fallback to alert
        alert(message);
    }
}
