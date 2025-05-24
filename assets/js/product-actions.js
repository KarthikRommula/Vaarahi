/**
 * Product Actions JavaScript
 * Handles cart and wishlist functionality for the e-commerce website
 */

$(document).ready(function() {
    // Initialize cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Update cart counter
    updateCartCounter();
    
    // Add to cart functionality
    $('.add-to-cart').on('click', function(e) {
        e.preventDefault();
        
        // Check if user is logged in
        if (!isLoggedIn()) {
            showLoginPrompt('Please log in to add items to your cart');
            return;
        }
        
        const productId = $(this).data('product-id');
        const productName = $(this).closest('.th-product').find('.product-title a').text();
        const productPrice = $(this).closest('.th-product').find('.price').first().text();
        const productImage = $(this).closest('.th-product').find('.product-img img').attr('src');
        
        // Check if product already exists in cart
        const existingProduct = cart.find(item => item.id === productId);
        
        if (existingProduct) {
            existingProduct.quantity += 1;
            showToast('success', `${productName} quantity updated in cart`);
        } else {
            // Add new product to cart
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
            showToast('success', `${productName} added to cart`);
        }
        
        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart counter
        updateCartCounter();
        
        // Animate cart icon
        animateCartIcon($(this));
    });
    
    // Wishlist functionality has been removed
    
    // Quick view functionality
    $('.popup-content').on('click', function(e) {
        e.preventDefault();
        
        const productId = $(this).closest('.th-product').find('.add-to-cart').data('product-id');
        const productName = $(this).closest('.th-product').find('.product-title a').text();
        const productPrice = $(this).closest('.th-product').find('.price').first().text();
        const productImage = $(this).closest('.th-product').find('.product-img img').attr('src');
        const productRating = $(this).closest('.th-product').find('.product-rating span').text();
        
        // Populate quick view modal
        $('#quickViewModal .modal-product-title').text(productName);
        $('#quickViewModal .modal-product-price').text(productPrice);
        $('#quickViewModal .modal-product-image').attr('src', productImage);
        $('#quickViewModal .modal-product-rating span').text(productRating);
        $('#quickViewModal .modal-add-to-cart').data('product-id', productId);
        $('#quickViewModal .modal-add-to-wishlist').data('product-id', productId);
        
        // Wishlist functionality has been removed
        
        // Show quick view modal
        $('#quickViewModal').modal('show');
    });
    
    // Wishlist functionality has been removed
    
    // Helper Functions
    
    // Check if user is logged in
    function isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }
    
    // Show login prompt modal
    function showLoginPrompt(message) {
        $('#loginPromptMessage').text(message);
        $('#loginPromptModal').modal('show');
    }
    
    // Update cart counter
    function updateCartCounter() {
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        $('.badge').text(cartCount);
        
        // Update cart items in sidebar
        updateCartSidebar();
    }
    
    // Wishlist functionality has been removed
    
    // Update cart sidebar
    function updateCartSidebar() {
        const cartList = $('.woocommerce-mini-cart');
        cartList.empty();
        
        if (cart.length === 0) {
            cartList.append('<li class="empty-cart-message">Your cart is empty</li>');
            $('.woocommerce-mini-cart__total .woocommerce-Price-amount').html('<span class="woocommerce-Price-currencySymbol">$</span>0.00');
            return;
        }
        
        let total = 0;
        
        cart.forEach(item => {
            const price = parseFloat(item.price.replace('$', ''));
            const itemTotal = price * item.quantity;
            total += itemTotal;
            
            const cartItem = `
                <li class="cart-item">
                    <a href="#" class="remove-cart-item" data-product-id="${item.id}">×</a>
                    <a href="shop-details.html">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                        ${item.name}
                    </a>
                    <span class="quantity">${item.quantity} × <span class="woocommerce-Price-amount">${item.price}</span></span>
                </li>
            `;
            
            cartList.append(cartItem);
        });
        
        // Update total
        $('.woocommerce-mini-cart__total .woocommerce-Price-amount').html(`<span class="woocommerce-Price-currencySymbol">$</span>${total.toFixed(2)}`);
        
        // Add remove item functionality
        $('.remove-cart-item').on('click', function(e) {
            e.preventDefault();
            const productId = $(this).data('product-id');
            
            // Remove item from cart
            cart = cart.filter(item => item.id !== productId);
            
            // Save cart to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Update cart counter and sidebar
            updateCartCounter();
            
            showToast('info', 'Item removed from cart');
        });
    }
    
    // Animate cart icon
    function animateCartIcon(button) {
        button.addClass('animate__animated animate__rubberBand');
        setTimeout(() => {
            button.removeClass('animate__animated animate__rubberBand');
        }, 1000);
    }
    
    // Animate heart icon
    function animateHeartIcon(button) {
        button.addClass('animate__animated animate__heartBeat');
        setTimeout(() => {
            button.removeClass('animate__animated animate__heartBeat');
        }, 1000);
    }
    
    // Show toast notification using the enhanced notification system
    function showToast(type, message) {
        // Create a unique notification ID for product actions
        const notificationId = 'product-notification';
        
        // Create notification element if it doesn't exist
        if (!document.getElementById(notificationId)) {
            const notification = document.createElement('div');
            notification.id = notificationId;
            notification.className = 'th-notification';
            document.body.appendChild(notification);
        }
        
        // Clear any existing timeout to prevent premature hiding
        if (window.productNotificationTimeout) {
            clearTimeout(window.productNotificationTimeout);
        }
        
        // Update notification message and show it
        const notification = document.getElementById(notificationId);
        
        // Clear any previous content and classes
        notification.innerHTML = '';
        notification.className = 'th-notification';
        
        // Add the message text node
        const messageText = document.createTextNode(message);
        notification.appendChild(messageText);
        
        // Set class based on notification type
        notification.classList.add(type);
        
        // Show notification with animation
        notification.style.display = 'flex';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Hide notification after 3 seconds
        window.productNotificationTimeout = setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }, 3000);
    }
});
