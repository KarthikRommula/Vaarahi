/**
 * Cart Synchronization Script
 * 
 * This script ensures that the cart is synchronized between all pages
 * by consolidating the three different cart implementations:
 * 1. cart.js - using 'vaarahiCart' in localStorage
 * 2. product-actions.js - using 'cart' in localStorage
 * 3. shop-details.js - also using 'cart' in localStorage but with different structure
 */

document.addEventListener('DOMContentLoaded', function() {
    // Run synchronization on page load
    synchronizeCarts();
    
    // Set up periodic sync to catch any changes
    setInterval(synchronizeCarts, 2000);
    
    // Add event listeners for cart changes
    monitorCartChanges();
});

/**
 * Synchronize the different cart implementations
 */
function synchronizeCarts() {
    try {
        // Get cart data from both sources
        const vaarahiCart = JSON.parse(localStorage.getItem('vaarahiCart')) || [];
        const productActionsCart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // If both carts have items, merge them
        if (vaarahiCart.length > 0 && productActionsCart.length > 0) {
            // Create a merged cart with unique items
            const mergedCart = [...vaarahiCart];
            
            // Add items from product-actions cart that don't exist in vaarahiCart
            productActionsCart.forEach(paItem => {
                const normalizedId = normalizeProductId(paItem.id);
                const existingItemIndex = mergedCart.findIndex(item => 
                    normalizeProductId(item.id) === normalizedId || 
                    normalizeProductId(item.productId) === normalizedId
                );
                
                if (existingItemIndex === -1) {
                    // Item doesn't exist in vaarahiCart, add it
                    mergedCart.push(convertToVaarahiFormat(paItem));
                } else {
                    // Item exists, update quantity if product-actions quantity is higher
                    const existingItem = mergedCart[existingItemIndex];
                    const paQuantity = parseInt(paItem.quantity) || 0;
                    const existingQuantity = parseInt(existingItem.quantity) || 0;
                    
                    if (paQuantity > existingQuantity) {
                        existingItem.quantity = paQuantity;
                    }
                }
            });
            
            // Save the merged cart to both storage locations
            localStorage.setItem('vaarahiCart', JSON.stringify(mergedCart));
            localStorage.setItem('cart', JSON.stringify(convertToProductActionsFormat(mergedCart)));
            
            // Update all cart displays
            updateAllCartDisplays();
        } 
        // If only vaarahiCart has items, copy to product-actions cart
        else if (vaarahiCart.length > 0 && productActionsCart.length === 0) {
            localStorage.setItem('cart', JSON.stringify(convertToProductActionsFormat(vaarahiCart)));
            updateAllCartDisplays();
        } 
        // If only product-actions cart has items, copy to vaarahiCart
        else if (vaarahiCart.length === 0 && productActionsCart.length > 0) {
            const convertedCart = productActionsCart.map(item => convertToVaarahiFormat(item));
            localStorage.setItem('vaarahiCart', JSON.stringify(convertedCart));
            updateAllCartDisplays();
        }
        
        // Make sure window.cartItems is updated for the home page
        if (typeof window !== 'undefined') {
            window.cartItems = JSON.parse(localStorage.getItem('vaarahiCart')) || [];
        }
    } catch (e) {
        console.error('Error synchronizing carts:', e);
    }
}

/**
 * Update all cart displays across different implementations
 */
function updateAllCartDisplays() {
    // Update cart displays if the functions are available
    if (typeof updateCartDisplay === 'function') {
        updateCartDisplay();
    }
    
    if (typeof updateCartCounter === 'function') {
        updateCartCounter();
    }
    
    // Update mini cart badge count
    updateMiniCartBadge();
    
    // Update mini cart content if the function exists
    if (typeof updateMiniCart === 'function') {
        updateMiniCart();
    }
    
    // Trigger custom event for other cart implementations to listen for
    document.dispatchEvent(new CustomEvent('cartUpdated'));
}

/**
 * Update the mini cart badge count
 */
function updateMiniCartBadge() {
    // Get all cart badges
    const cartBadges = document.querySelectorAll('.sideMenuToggler .badge, .cart-count');
    
    // Calculate total quantity in cart
    let totalQuantity = 0;
    const cartItems = JSON.parse(localStorage.getItem('vaarahiCart')) || [];
    
    if (Array.isArray(cartItems)) {
        totalQuantity = cartItems.reduce((total, item) => {
            return total + (parseInt(item.quantity) || 0);
        }, 0);
    }
    
    // Update all badges
    cartBadges.forEach(badge => {
        badge.textContent = totalQuantity;
    });
}

/**
 * Convert a product-actions cart item to vaarahiCart format
 */
function convertToVaarahiFormat(paItem) {
    // Handle price which could be a string or number
    let price = paItem.price;
    if (typeof price === 'string') {
        price = price.replace(/[^0-9.]/g, ''); // Remove any non-numeric characters except decimal point
    }
    
    return {
        id: paItem.id,
        productId: paItem.id,
        name: paItem.name,
        price: price,
        image: paItem.image,
        quantity: paItem.quantity || 1
    };
}

/**
 * Convert vaarahiCart items to product-actions format
 */
function convertToProductActionsFormat(vaarahiItems) {
    return vaarahiItems.map(item => {
        // Convert price to string first to avoid TypeError when price is a number
        const priceStr = String(item.price);
        return {
            id: item.productId || item.id,
            name: item.name,
            price: priceStr.includes('$') ? priceStr : '$' + priceStr,
            image: item.image,
            quantity: item.quantity || 1
        };
    });
}

/**
 * Normalize product ID for consistent comparison
 * (copied from cart.js to ensure consistent behavior)
 */
function normalizeProductId(id) {
    if (!id) return '';
    
    // If the ID contains a hyphen and isn't one of our special cases
    if (id.includes('-') && !['baby-dress', 'comfort-chair', 'short-table'].includes(id)) {
        // Extract the first part before the hyphen
        return id.split('-')[0].toLowerCase();
    }
    
    return id.toLowerCase();
}

/**
 * Monitor for cart changes across different implementations
 */
function monitorCartChanges() {
    // Monitor add to cart buttons in shop-details.html
    document.addEventListener('click', function(e) {
        // Check if this is an add to cart button
        if ((e.target.classList.contains('th-btn') && e.target.textContent.includes('Add to Cart')) ||
            (e.target.classList.contains('icon-btn') && e.target.getAttribute('href') === 'cart.html')) {
            
            // Schedule a sync after a small delay to allow the original handler to complete
            setTimeout(synchronizeCarts, 100);
            
            // And another sync after a longer delay to ensure UI updates
            setTimeout(function() {
                synchronizeCarts();
                updateAllCartDisplays();
            }, 500);
        }
    });
    
    // Create a MutationObserver to watch for cart changes in the DOM
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(function(mutations) {
            // Check if any mutations involve cart-related elements
            const cartRelated = mutations.some(mutation => {
                return mutation.target.classList && (
                    mutation.target.classList.contains('cart-list') ||
                    mutation.target.classList.contains('mini-cart-content') ||
                    mutation.target.classList.contains('cart-count')
                );
            });
            
            if (cartRelated) {
                synchronizeCarts();
            }
        });
        
        // Start observing the document body for cart-related changes
        observer.observe(document.body, { 
            childList: true, 
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
    }
}
