/**
 * Dynamic Content Handler for Vaarahi Website
 * This script ensures consistent navigation and functionality across all pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get current page URL
    const currentPage = window.location.pathname.split('/').pop();
    
    // Highlight current page in navigation
    highlightCurrentPage(currentPage);
    
    // Initialize cart functionality
    initializeCart();
    
    // Initialize product quick view
    initializeQuickView();
});

/**
 * Highlights the current page in the navigation menu
 * @param {string} currentPage - The current page filename
 */
function highlightCurrentPage(currentPage) {
    // Main navigation
    const mainNavLinks = document.querySelectorAll('.main-menu a');
    mainNavLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.parentElement.classList.add('active');
        }
    });
    
    // Mobile navigation
    const mobileNavLinks = document.querySelectorAll('.th-mobile-menu a');
    mobileNavLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.parentElement.classList.add('active');
        }
    });
}

/**
 * Initializes the shopping cart functionality
 */
function initializeCart() {
    // Load cart from localStorage
    let cart = JSON.parse(localStorage.getItem('vaarahiCart')) || [];
    
    // Update cart badge count
    updateCartBadge(cart.length);
    
    // Add event listeners to "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get product details
            const productCard = this.closest('.th-product');
            if (!productCard) return;
            
            const productName = productCard.querySelector('.product-title').textContent;
            const productPrice = productCard.querySelector('.price').textContent;
            const productImage = productCard.querySelector('.product-img img').getAttribute('src');
            
            // Create product object
            const product = {
                id: generateProductId(productName),
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            };
            
            // Add to cart
            addToCart(product);
        });
    });
}

/**
 * Adds a product to the cart
 * @param {Object} product - The product to add
 */
function addToCart(product) {
    // Get current cart
    let cart = JSON.parse(localStorage.getItem('vaarahiCart')) || [];
    
    // Check if product already exists in cart
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex > -1) {
        // Update quantity if product exists
        cart[existingProductIndex].quantity += 1;
    } else {
        // Add new product
        cart.push(product);
    }
    
    // Save cart to localStorage
    localStorage.setItem('vaarahiCart', JSON.stringify(cart));
    
    // Update cart badge
    updateCartBadge(cart.length);
    
    // Update cart display
    updateCartDisplay(cart);
    
    // Show notification
    showNotification('Product added to cart!');
}

/**
 * Updates the cart badge count
 * @param {number} count - The number of items in the cart
 */
function updateCartBadge(count) {
    const badge = document.querySelector('.sideMenuToggler .badge');
    if (badge) {
        badge.textContent = count;
    }
}

/**
 * Updates the cart display in the sidebar
 * @param {Array} cart - The cart items
 */
function updateCartDisplay(cart) {
    const cartList = document.querySelector('.woocommerce-mini-cart');
    if (!cartList) return;
    
    // Clear current cart display
    cartList.innerHTML = '';
    
    // Calculate total
    let total = 0;
    
    // Add each item to cart display
    cart.forEach(item => {
        const price = parseFloat(item.price.replace('$', ''));
        total += price * item.quantity;
        
        const cartItem = document.createElement('li');
        cartItem.className = 'woocommerce-mini-cart-item';
        cartItem.innerHTML = `
            <a href="#" class="remove remove-from-cart" data-product-id="${item.id}">×</a>
            <a href="#">
                <img src="${item.image}" alt="${item.name}" width="80">
                ${item.name}
            </a>
            <span class="quantity">${item.quantity} × <span class="woocommerce-Price-amount">${item.price}</span></span>
        `;
        
        cartList.appendChild(cartItem);
    });
    
    // Update total
    const totalElement = document.querySelector('.woocommerce-mini-cart__total .woocommerce-Price-amount');
    if (totalElement) {
        totalElement.innerHTML = `<span class="woocommerce-Price-currencySymbol">$</span>${total.toFixed(2)}`;
    }
    
    // Add event listeners to remove buttons
    const removeButtons = document.querySelectorAll('.remove-from-cart');
    removeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-product-id');
            removeFromCart(productId);
        });
    });
}

/**
 * Removes a product from the cart
 * @param {string} productId - The ID of the product to remove
 */
function removeFromCart(productId) {
    // Get current cart
    let cart = JSON.parse(localStorage.getItem('vaarahiCart')) || [];
    
    // Remove product
    cart = cart.filter(item => item.id !== productId);
    
    // Save cart to localStorage
    localStorage.setItem('vaarahiCart', JSON.stringify(cart));
    
    // Update cart badge
    updateCartBadge(cart.length);
    
    // Update cart display
    updateCartDisplay(cart);
    
    // Show notification
    showNotification('Product removed from cart!');
}

/**
 * Initializes the product quick view functionality
 */
function initializeQuickView() {
    const quickViewLinks = document.querySelectorAll('a[href="#QuickView"]');
    quickViewLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Get product details
            const productCard = this.closest('.th-product');
            if (!productCard) return;
            
            const productName = productCard.querySelector('.product-title').textContent;
            const productPrice = productCard.querySelector('.price').textContent;
            const productImage = productCard.querySelector('.product-img img').getAttribute('src');
            
            // Update quick view modal
            const quickView = document.getElementById('QuickView');
            if (quickView) {
                quickView.querySelector('.product-title').textContent = productName;
                quickView.querySelector('.price').textContent = productPrice;
                quickView.querySelector('.product-big-img img').setAttribute('src', productImage);
                quickView.querySelector('.sku').textContent = generateProductId(productName);
            }
        });
    });
}

/**
 * Generates a product ID from the product name
 * @param {string} productName - The name of the product
 * @returns {string} - The generated product ID
 */
function generateProductId(productName) {
    return productName.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

/**
 * Shows a notification message
 * @param {string} message - The message to display
 */
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = '#4CAF50';
        notification.style.color = 'white';
        notification.style.padding = '15px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '9999';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease-in-out';
        document.body.appendChild(notification);
    }
    
    // Set message and show notification
    notification.textContent = message;
    notification.style.opacity = '1';
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
    }, 3000);
}