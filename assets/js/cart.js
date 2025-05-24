// cart.js - Manages cart functionality across the website

// Cart items storage in localStorage
let cartItems = [];
let cartTotal = 0;
let appliedCoupon = null; // Track applied coupon code

// Safely parse cart items from localStorage
try {
    const storedCart = localStorage.getItem('vaarahiCart');
    if (storedCart) {
        cartItems = JSON.parse(storedCart) || [];
        // Filter out any invalid items
        cartItems = cartItems.filter(item => item && typeof item === 'object');
    }
    
    // Load any previously applied coupon
    const storedCoupon = localStorage.getItem('vaarahiCoupon');
    if (storedCoupon) {
        appliedCoupon = JSON.parse(storedCoupon);
    }
} catch (e) {
    console.error('Error loading cart from localStorage:', e);
    cartItems = [];
    localStorage.setItem('vaarahiCart', JSON.stringify([]));
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    calculateCartTotal(); // Calculate total first
    updateCartDisplay(); // Then update display
    setupEventListeners();
    
    // Check for payment status in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'failed') {
        showNotification('Payment failed. Please try again.', 'error');
    } else if (paymentStatus === 'error') {
        showNotification('Payment verification error. Please contact support.', 'error');
    } else if (paymentStatus === 'success') {
        showNotification('Payment successful! Thank you for your order.', 'success');
    }
});

// Function to normalize product ID to ensure consistency
function normalizeProductId(id) {
    if (!id) return '';
    
    // If the ID contains a hyphen and isn't one of our special cases
    if (id.includes('-') && !['baby-dress', 'comfort-chair', 'short-table'].includes(id)) {
        // Extract the first part before the hyphen
        return id.split('-')[0].toLowerCase();
    }
    
    return id.toLowerCase();
}

// Save cart items to localStorage
function saveCartToStorage() {
    try {
        localStorage.setItem('vaarahiCart', JSON.stringify(cartItems));
    } catch (e) {
        console.error('Error saving cart to localStorage:', e);
    }
}

// Update all cart displays on the page
function updateCartDisplay() {
    // Save cart to localStorage first
    saveCartToStorage();
    
    // Update cart count badge to show total quantity
    const cartBadges = document.querySelectorAll('.sideMenuToggler .badge');
    const totalQuantity = cartItems.reduce((total, item) => total + parseInt(item.quantity), 0);
    cartBadges.forEach(badge => {
        badge.textContent = totalQuantity;
    });
    
    // Update mini cart items
    updateMiniCart();
    
    // Update cart page if we're on it
    if (window.location.href.includes('cart.html')) {
        updateCartPage();
    }
    
    // Update checkout page if we're on it
    if (window.location.href.includes('checkout.html')) {
        updateCheckoutPage();
    }
}

// Calculate cart total - separated from display updates for better performance
function calculateCartTotal() {
    // Filter out any undefined or null items
    cartItems = cartItems.filter(item => item !== null && item !== undefined);
    
    // Calculate subtotal from all items
    const subtotal = cartItems.reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        return total + (price * quantity);
    }, 0);
    
    // Apply coupon discount if valid
    if (appliedCoupon && appliedCoupon.code === 'VAARAHI') {
        // Apply 10% discount
        const discountAmount = subtotal * 0.1;
        cartTotal = subtotal - discountAmount;
    } else {
        cartTotal = subtotal;
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('vaarahiCart', JSON.stringify(cartItems));
    
    // Save applied coupon to localStorage
    if (appliedCoupon) {
        localStorage.setItem('vaarahiCoupon', JSON.stringify(appliedCoupon));
    } else {
        localStorage.removeItem('vaarahiCoupon');
    }
    
    return cartTotal;
}

// Apply coupon code
function applyCoupon(code) {
    if (!code) {
        showNotification('Please enter a coupon code', 'warning');
        return false;
    }
    
    // Check if the code is valid (VAARAHI for 10% discount)
    if (code.toUpperCase() === 'VAARAHI') {
        appliedCoupon = {
            code: 'VAARAHI',
            discount: 0.1, // 10% discount
            discountType: 'percentage'
        };
        
        // Recalculate cart total with the discount
        calculateCartTotal();
        updateCartDisplay();
        
        showNotification('Coupon applied successfully! You got 10% off.', 'success');
        return true;
    } else {
        showNotification('Invalid coupon code', 'error');
        return false;
    }
}

// Remove applied coupon
function removeCoupon() {
    appliedCoupon = null;
    localStorage.removeItem('vaarahiCoupon');
    
    // Recalculate cart total without the discount
    calculateCartTotal();
    updateCartDisplay();
    
    showNotification('Coupon removed', 'info');
}

// Update the mini cart in the sidebar
function updateMiniCart() {
    const miniCartList = document.querySelector('.woocommerce-mini-cart');
    if (!miniCartList) return;
    
    // Clear current items
    miniCartList.innerHTML = '';
    
    // Check if cart is empty
    if (cartItems.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'woocommerce-mini-cart-item mini_cart_item empty-cart';
        emptyItem.innerHTML = '<p>Your cart is empty</p>';
        miniCartList.appendChild(emptyItem);
    } else {
        // Add cart items to mini cart
        cartItems.forEach((item, index) => {
            if (!item) return; // Skip undefined items
            
            const listItem = document.createElement('li');
            listItem.className = 'woocommerce-mini-cart-item mini_cart_item';
            
            // Ensure price and quantity are proper numbers for calculation
            const itemPrice = parseFloat(item.price) || 0;
            const itemQuantity = parseInt(item.quantity) || 1;
            const itemTotal = itemPrice * itemQuantity;
            
            // Ensure image path is valid
            const imageSrc = item.image || 'assets/img/placeholder.jpg';
            
            listItem.innerHTML = `
                <a href="#" class="remove remove_from_cart_button" data-index="${index}"><i class="far fa-times"></i></a>
                <a href="#"><img src="${imageSrc}" alt="${item.name || 'Product'}"> ${item.name || 'Product'}</a>
                <span class="quantity">${itemQuantity} ×
                    <span class="woocommerce-Price-amount amount">
                        <span class="woocommerce-Price-currencySymbol">$</span>${itemPrice.toFixed(2)}</span>
                </span>
            `;
            miniCartList.appendChild(listItem);
        });
    }
    
    // Setup event listeners for remove buttons
    document.querySelectorAll('.woocommerce-mini-cart-item .remove_from_cart_button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const index = parseInt(this.getAttribute('data-index'));
            if (!isNaN(index)) {
                removeFromCart(index);
            }
        });
    });
    
    // Update mini cart total
    const miniCartTotal = document.querySelector('.woocommerce-mini-cart__total .woocommerce-Price-amount');
    if (miniCartTotal) {
        miniCartTotal.innerHTML = `<span class="woocommerce-Price-currencySymbol">$</span>${cartTotal.toFixed(2)}`;
    }
}

// Update the cart page if we're on it
function updateCartPage() {
    const cartTable = document.querySelector('.woocommerce-cart-form .cart_table tbody');
    if (!cartTable) return;
    
    // Save focus state before updating
    const activeElement = document.activeElement;
    const isCouponInputFocused = activeElement && activeElement.classList.contains('form-control') && 
                               activeElement.closest('.th-cart-coupon');
    const couponInputValue = isCouponInputFocused ? activeElement.value : '';
    
    // Clear current items (except the last row with actions)
    const lastRow = cartTable.querySelector('tr:last-child');
    cartTable.innerHTML = '';
    
    if (!cartItems || cartItems.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="6" class="text-center">
                <p>Your cart is currently empty.</p>
                <a href="products.html" class="th-btn mt-4">Continue Shopping</a>
            </td>
        `;
        cartTable.appendChild(emptyRow);
    } else {
        // Add cart items to cart table
        cartItems.forEach((item, index) => {
            if (!item) return; // Skip undefined items
            
            // Ensure price and quantity are proper numbers for calculation
            const itemPrice = parseFloat(item.price) || 0;
            const itemQuantity = parseInt(item.quantity) || 1;
            const itemTotal = itemPrice * itemQuantity;
            
            // Ensure image path is valid
            const imageSrc = item.image || 'assets/img/placeholder.jpg';
            const productName = item.name || 'Product';
            
            const row = document.createElement('tr');
            row.className = 'cart_item';
            row.innerHTML = `
                <td data-title="Product">
                    <a class="cart-productimage" href="shop-details.html"><img width="91" height="91"
                            src="${imageSrc}" alt="${productName}"></a>
                </td>
                <td data-title="Name">
                    <a class="cart-productname" href="shop-details.html">${productName}</a>
                </td>
                <td data-title="Price">
                    <span class="amount"><bdi><span>$</span>${itemPrice.toFixed(2)}</bdi></span>
                </td>
                <td data-title="Quantity">
                    <div class="quantity">
                        <button class="quantity-minus qty-btn" data-index="${index}"><i class="far fa-minus"></i></button>
                        <input type="number" class="qty-input" value="${itemQuantity}" min="1" max="99" data-index="${index}">
                        <button class="quantity-plus qty-btn" data-index="${index}"><i class="far fa-plus"></i></button>
                    </div>
                </td>
                <td data-title="Total">
                    <span class="amount"><bdi><span>$</span>${itemTotal.toFixed(2)}</bdi></span>
                </td>
                <td data-title="Remove">
                    <a href="#" class="remove" data-index="${index}"><i class="fal fa-trash-alt"></i></a>
                </td>
            `;
            cartTable.appendChild(row);
        });
    }
    
    // Add back the action row
    if (lastRow && cartItems && cartItems.length > 0) {
        cartTable.appendChild(lastRow);
    }
    
    // Calculate subtotal (before discount)
    const subtotal = cartItems.reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        return total + (price * quantity);
    }, 0);
    
    // Update cart totals
    const subtotalAmount = document.querySelector('.cart_totals tbody tr:first-child .amount');
    const orderTotalAmount = document.querySelector('.cart_totals tfoot .amount');
    
    if (subtotalAmount) subtotalAmount.innerHTML = `<bdi><span>$</span>${subtotal.toFixed(2)}</bdi>`;
    
    // Add discount row if coupon is applied
    if (appliedCoupon) {
        const discountAmount = subtotal * appliedCoupon.discount;
        let discountRow = document.querySelector('.cart_totals tr.discount');
        
        if (!discountRow) {
            // Create new discount row
            discountRow = document.createElement('tr');
            discountRow.className = 'discount';
            discountRow.innerHTML = `
                <th>Discount (${appliedCoupon.code})</th>
                <td data-title="Discount">
                    <span class="amount"><bdi><span>-$</span>${discountAmount.toFixed(2)}</bdi></span>
                    <a href="#" class="remove-coupon" title="Remove coupon"><i class="fal fa-times-circle ms-2"></i></a>
                </td>
            `;
            
            // Insert after subtotal row
            const subtotalRow = document.querySelector('.cart_totals tbody tr:first-child');
            if (subtotalRow && subtotalRow.parentNode) {
                subtotalRow.parentNode.insertBefore(discountRow, subtotalRow.nextSibling);
            }
            
            // Add event listener to remove coupon button
            const removeCouponBtn = discountRow.querySelector('.remove-coupon');
            if (removeCouponBtn) {
                removeCouponBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    removeCoupon();
                });
            }
        } else {
            // Update existing discount row
            const discountCell = discountRow.querySelector('.amount');
            if (discountCell) {
                discountCell.innerHTML = `<bdi><span>-$</span>${discountAmount.toFixed(2)}</bdi>`;
            }
        }
    } else {
        // Remove discount row if no coupon is applied
        const discountRow = document.querySelector('.cart_totals tr.discount');
        if (discountRow) {
            discountRow.remove();
        }
    }
    
    if (orderTotalAmount) orderTotalAmount.innerHTML = `<bdi><span>$</span>${cartTotal.toFixed(2)}</bdi>`;
    
    // Restore focus to coupon input if it was focused before
    if (isCouponInputFocused) {
        const couponInput = document.querySelector('.th-cart-coupon input');
        if (couponInput) {
            couponInput.focus();
            couponInput.value = couponInputValue;
            // Place cursor at the end of the input text
            const inputLength = couponInputValue.length;
            if (couponInput.setSelectionRange) {
                couponInput.setSelectionRange(inputLength, inputLength);
            }
        }
    }
}

// Update the checkout page if we're on it
function updateCheckoutPage() {
    const checkoutTable = document.querySelector('.checkout-ordertable');
    if (!checkoutTable) return;
    
    const tbody = document.querySelector('.woocommerce-cart-form .cart_table tbody');
    if (!tbody) return;
    
    // Clear current items
    tbody.innerHTML = '';
    
    // Add cart items to checkout table
    cartItems.forEach(item => {
        // Ensure price and quantity are proper numbers for calculation
        const itemPrice = parseFloat(item.price);
        const itemQuantity = parseInt(item.quantity);
        const itemTotal = itemPrice * itemQuantity;
        
        const row = document.createElement('tr');
        row.className = 'cart_item';
        row.innerHTML = `
            <td data-title="Product">
                <a class="cart-productimage" href="shop-details.html"><img width="91" height="91"
                        src="${item.image}" alt="Image"></a>
            </td>
            <td data-title="Name">
                <a class="cart-productname" href="shop-details.html">${item.name}</a>
            </td>
            <td data-title="Price">
                <span class="amount"><bdi><span>$</span>${itemPrice.toFixed(2)}</bdi></span>
            </td>
            <td data-title="Quantity">
                <strong class="product-quantity">${itemQuantity}</strong>
            </td>
            <td data-title="Total">
                <span class="amount"><bdi><span>$</span>${itemTotal.toFixed(2)}</bdi></span>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Calculate subtotal (before discount)
    const subtotal = cartItems.reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        return total + (price * quantity);
    }, 0);
    
    // Update checkout totals
    const subtotalAmount = document.querySelector('.cart-subtotal .woocommerce-Price-amount');
    const orderTotalAmount = document.querySelector('.order-total .woocommerce-Price-amount');
    const discountRow = document.querySelector('.coupon-discount');
    
    // Update subtotal
    if (subtotalAmount) subtotalAmount.innerHTML = `<bdi><span class="woocommerce-Price-currencySymbol">$</span>${subtotal.toFixed(2)}</bdi>`;
    
    // Handle discount display
    if (appliedCoupon && appliedCoupon.code === 'VAARAHI') {
        const discountAmount = subtotal * 0.1; // 10% discount
        
        // Show discount row
        if (discountRow) {
            discountRow.style.display = 'table-row';
            const discountAmountEl = discountRow.querySelector('.discount-amount .woocommerce-Price-amount');
            if (discountAmountEl) {
                discountAmountEl.innerHTML = `<bdi><span class="woocommerce-Price-currencySymbol">$</span>${discountAmount.toFixed(2)}</bdi>`;
            }
        }
    } else {
        // Hide discount row if no coupon applied
        if (discountRow) {
            discountRow.style.display = 'none';
        }
    }
    
    // Update order total
    if (orderTotalAmount) orderTotalAmount.innerHTML = `<bdi><span class="woocommerce-Price-currencySymbol">$</span>${cartTotal.toFixed(2)}</bdi>`;
}

// Add a product to the cart
function addToCart(productData) {
    if (!productData || !productData.id) {
        console.error('Invalid product data:', productData);
        return;
    }
    
    // Check if user is authenticated before adding to cart
    if (typeof window.auth !== 'undefined' && typeof window.auth.requireAuth === 'function') {
        // If auth system is available, check authentication
        if (!window.auth.requireAuth()) {
            return; // requireAuth will handle notification and redirect
        }
    } else {
        console.error('Authentication system not loaded properly');
        // Redirect to login without showing notification (auth.js will handle that)
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    // Normalize product ID for consistency
    const normalizedId = normalizeProductId(productData.id);
    
    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(item => item && normalizeProductId(item.id) === normalizedId);
    
    if (existingItemIndex !== -1) {
        // Update quantity if item exists
        cartItems[existingItemIndex].quantity = parseInt(cartItems[existingItemIndex].quantity || 1) + parseInt(productData.quantity || 1);
        showNotification(`${productData.name} quantity updated in cart!`);
    } else {
        // Add new item to cart
        cartItems.push({
            id: productData.id,
            name: productData.name || 'Product',
            price: productData.price || '0.00',
            image: productData.image || 'assets/img/placeholder.jpg',
            quantity: parseInt(productData.quantity || 1)
        });
        showNotification(`${productData.name || 'Product'} added to cart!`);
    }
    
    // Update cart display
    calculateCartTotal(); // Calculate first
    updateCartDisplay(); // Then update display
}

// Make cart functions globally accessible
window.addToCart = addToCart;
window.showNotification = showNotification;
window.updateMiniCart = updateMiniCart;
window.removeFromCart = removeFromCart;
window.cartItems = cartItems;

// Remove an item from the cart
function removeFromCart(index) {
    if (index < 0 || index >= cartItems.length) return;
    
    const itemName = cartItems[index]?.name || 'Product';
    cartItems.splice(index, 1);
    
    // Update cart display
    calculateCartTotal(); // Calculate first
    updateCartDisplay(); // Then update display
    
    // Save cart to localStorage
    saveCartToStorage();
    
    showNotification(`${itemName} removed from cart!`);
}

// Update item quantity
function updateItemQuantity(index, quantity) {
    if (index < 0 || index >= cartItems.length || !cartItems[index]) return;
    
    // Convert to integer and ensure minimum of 1
    quantity = Math.max(1, parseInt(quantity) || 1);
    
    // Update quantity
    cartItems[index].quantity = quantity;
    
    // Update cart display
    calculateCartTotal(); // Calculate first
    updateCartDisplay(); // Then update display
    
    // Save cart to localStorage
    saveCartToStorage();
    
    showNotification(`Cart updated!`);
    
    return true;
}

// Show notification
function showNotification(message, type = 'success') {
    // Create a unique notification ID for cart
    const notificationId = 'cart-notification';
    
    // Create notification element if it doesn't exist
    if (!document.getElementById(notificationId)) {
        const notification = document.createElement('div');
        notification.id = notificationId;
        notification.className = 'th-notification';
        document.body.appendChild(notification);
    }
    
    // Clear any existing timeout to prevent premature hiding
    if (window.cartNotificationTimeout) {
        clearTimeout(window.cartNotificationTimeout);
    }
    
    // Update notification message and show it
    const notification = document.getElementById(notificationId);
    
    // Clear any previous content and classes
    notification.innerHTML = '';
    notification.className = 'th-notification';
    
    // Add icon based on notification type
    // The icon will be added via CSS :before pseudo-element
    
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
    window.cartNotificationTimeout = setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, 3000);
}

// Handle Quick View popup
function setupQuickView() {
    // Quick View buttons (eye icon)
    document.querySelectorAll('.popup-content').forEach(button => {
        button.addEventListener('click', function(e) {
            // Get product data
            const product = button.closest('.th-product');
            if (!product) return;
            
            const name = product.querySelector('.product-title a').textContent;
            const priceText = product.querySelector('.price').textContent;
            // Carefully extract the price
            let price = 0;
            const priceMatch = priceText.match(/\$\s*(\d+(\.\d+)?)/);
            if (priceMatch && priceMatch[1]) {
                price = parseFloat(priceMatch[1]);
            }
            
            const image = product.querySelector('.product-img img').getAttribute('src');
            
            // Check if there's a sale price (has a del tag)
            let salePrice = '';
            if (priceText.includes('del')) {
                const regularPrice = priceText.split('<del>')[1].split('</del>')[0];
                salePrice = `<del>${regularPrice}</del>`;
            }
            
            // Update Quick View modal content
            const quickView = document.querySelector('#QuickView');
            if (quickView) {
                quickView.querySelector('.product-title').textContent = name;
                quickView.querySelector('.price').innerHTML = `$${price.toFixed(2)}${salePrice}`;
                quickView.querySelector('.product-big-img img').src = image;
                
                // Update SKU with product name
                const skuEl = quickView.querySelector('.sku');
                if (skuEl) {
                    skuEl.textContent = name.toLowerCase().replace(/\s+/g, '-');
                }
                
                // Reset quantity to 1
                const quantityInput = quickView.querySelector('.qty-input');
                if (quantityInput) {
                    quantityInput.value = 1;
                }
            }
        });
    });
}

// Setup event listeners for the cart
function setupEventListeners() {
    // Setup Quick View
    setupQuickView();
    
    // Add to cart buttons
    document.querySelectorAll('.icon-btn[href="cart.html"]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get product data
            const product = button.closest('.th-product');
            if (!product) return;
            
            const name = product.querySelector('.product-title a').textContent;
            const priceText = product.querySelector('.price').textContent;
            
            // Carefully extract the price
            let price = 0;
            const priceMatch = priceText.match(/\$\s*(\d+(\.\d+)?)/);
            if (priceMatch && priceMatch[1]) {
                price = parseFloat(priceMatch[1]);
            }
            
            const image = product.querySelector('.product-img img').getAttribute('src');
            const id = name.toLowerCase().replace(/\s+/g, '-');
            
            // Add to cart
            addToCart({
                id,
                name,
                price,
                image,
                quantity: 1
            });
        });
    });
    
    // Quick view add to cart
    document.addEventListener('click', function(e) {
        const addToCartBtn = e.target.closest('#QuickView .th-btn');
        if (addToCartBtn) {
            e.preventDefault();
            
            const quickView = document.querySelector('#QuickView');
            if (!quickView) return;
            
            const name = quickView.querySelector('.product-title').textContent;
            const priceText = quickView.querySelector('.price').textContent;
            
            // Carefully extract the price
            let price = 0;
            const priceMatch = priceText.match(/\$\s*(\d+(\.\d+)?)/);
            if (priceMatch && priceMatch[1]) {
                price = parseFloat(priceMatch[1]);
            }
            
            const image = quickView.querySelector('.product-big-img img').getAttribute('src');
            const id = quickView.querySelector('.sku').textContent || name.toLowerCase().replace(/\s+/g, '-');
            const quantityInput = quickView.querySelector('.qty-input');
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
            
            // Add to cart
            addToCart({
                id,
                name,
                price,
                image,
                quantity
            });
            
            // Close the popup after adding to cart
            const closeBtn = document.querySelector('.mfp-close');
            if (closeBtn) {
                closeBtn.click();
            }
        }
    });
    
    // Shop details page add to cart button
    document.addEventListener('click', function(e) {
        // Check if this is the add to cart button on the shop details page
        if (e.target.classList.contains('th-btn') && 
            e.target.textContent.includes('Add to Cart') && 
            e.target.closest('.product-about') && 
            !e.target.closest('#QuickView')) {
            
            e.preventDefault();
            
            // Get product data from the product details page
            const productAbout = e.target.closest('.product-about');
            if (!productAbout) return;
            
            const name = productAbout.querySelector('.product-title').textContent;
            const priceText = productAbout.querySelector('.price').textContent;
            
            // Carefully extract the price
            let price = 0;
            const priceMatch = priceText.match(/\$\s*(\d+(\.\d+)?)/);
            if (priceMatch && priceMatch[1]) {
                price = parseFloat(priceMatch[1]);
            }
            
            const imageContainer = document.querySelector('.product-big-img img');
            const image = imageContainer ? imageContainer.getAttribute('src') : '';
            const skuElement = productAbout.querySelector('.sku');
            let id = '';
            
            // Get product ID from URL or SKU
            const urlParams = new URLSearchParams(window.location.search);
            const urlId = urlParams.get('id');
            if (urlId) {
                id = urlId;
            } else if (skuElement) {
                id = skuElement.textContent.split('-')[0].toLowerCase();
            } else {
                id = name.toLowerCase().replace(/\s+/g, '-');
            }
            
            const quantityInput = productAbout.querySelector('.qty-input');
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
            
            // Add to cart
            addToCart({
                id,
                name,
                price,
                image,
                quantity
            });
        }
    });
    
    // Remove from cart - using event delegation for better performance
    document.addEventListener('click', function(e) {
        // Check if the clicked element is either the remove button or the icon inside it
        const removeButton = e.target.closest('.remove, .remove_from_cart_button');
        
        if (removeButton) {
            e.preventDefault();
            const index = parseInt(removeButton.getAttribute('data-index'));
            if (!isNaN(index)) {
                removeFromCart(index);
            }
        }
    });
    
    // Quantity buttons - using event delegation
    document.addEventListener('click', function(e) {
        const minusBtn = e.target.closest('.quantity-minus');
        const plusBtn = e.target.closest('.quantity-plus');
        
        if (minusBtn) {
            const index = parseInt(minusBtn.getAttribute('data-index'));
            if (isNaN(index)) return;
            
            // Get the input element
            const input = minusBtn.closest('.quantity').querySelector('.qty-input');
            
            if (input) {
                let value = parseInt(input.value) - 1;
                if (value < 1) value = 1;
                input.value = value;
                
                // Update cart item
                updateItemQuantity(index, value);
            }
        }
        
        if (plusBtn) {
            const index = parseInt(plusBtn.getAttribute('data-index'));
            if (isNaN(index)) return;
            
            // Get the input element
            const input = plusBtn.closest('.quantity').querySelector('.qty-input');
            
            if (input) {
                let value = parseInt(input.value) + 1;
                input.value = value;
                
                // Update cart item
                updateItemQuantity(index, value);
            }
        }
    });
    
    // Quantity input change
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('qty-input')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            if (!isNaN(index)) {
                updateItemQuantity(index, e.target.value);
            }
        }
    });
    
    // Update cart button
    const updateCartBtn = document.querySelector('.woocommerce-cart-form .th-btn');
    if (updateCartBtn) {
        updateCartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            calculateCartTotal(); // Calculate first
            updateCartDisplay(); // Then update display
            showNotification('Cart updated!');
        });
    }
    
    // Apply coupon button
    const applyCouponBtn = document.querySelector('.th-cart-coupon .th-btn');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const couponInput = document.querySelector('.th-cart-coupon input');
            if (couponInput && couponInput.value) {
                applyCoupon(couponInput.value.trim());
            } else {
                showNotification('Please enter a coupon code', 'warning');
            }
        });
    }
    
    // Place order button
    const placeOrderBtn = document.querySelector('.place-order .th-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // Check if cart is empty
            if (cartItems.length === 0) {
                showNotification('Your cart is empty!', 'warning');
                return;
            }
            
            // Get form data for checkout
            const checkoutForm = document.querySelector('#checkout-form');
            if (!checkoutForm) {
                showNotification('Checkout form not found!', 'error');
                return;
            }
            
            // Collect order data
            const orderData = {
                firstName: document.getElementById('firstName')?.value || '',
                lastName: document.getElementById('lastName')?.value || '',
                email: document.getElementById('email')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                streetAddress: document.getElementById('streetAddress')?.value || '',
                city: document.getElementById('city')?.value || '',
                state: document.getElementById('state')?.value || '',
                pincode: document.getElementById('pincode')?.value || '',
                total: cartTotal,
                cartItems: cartItems
            };
            
            // Validate required fields
            const requiredFields = ['firstName', 'email', 'phone', 'streetAddress', 'city', 'state', 'pincode'];
            const missingFields = requiredFields.filter(field => !orderData[field]);
            
            if (missingFields.length > 0) {
                showNotification('Please fill all required fields!', 'error');
                return;
            }
            
            try {
                // Initialize PhonePe payment
                if (window.PhonePeIntegration && window.PhonePeIntegration.initializePayment) {
                    await window.PhonePeIntegration.initializePayment(orderData);
                } else {
                    // Fallback if PhonePe integration is not available
                    showNotification('Payment gateway not available!', 'error');
                }
            } catch (error) {
                console.error('Payment error:', error);
                showNotification('Payment failed: ' + error.message, 'error');
            }
        });
    }
}

// Initial setup when the file is loaded
calculateCartTotal(); // Calculate first
updateCartDisplay(); // Then update display