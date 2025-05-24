/**
 * Update Wishlist UI Script
 * 
 * This script updates the UI across all pages to:
 * 1. Remove the wishlist icon from the navigation bar
 * 2. Add the wishlist option to the cart sidebar
 * 3. Update the styling for better presentation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Immediate direct removal of heart icon from navigation
    // This is a brute force approach to ensure all heart icons are removed
    setTimeout(function() {
        // Direct removal of any heart icon in the navigation bar
        document.querySelectorAll('a').forEach(function(link) {
            if (link.innerHTML && link.innerHTML.includes('fa-heart')) {
                // Make sure it's not in the cart sidebar
                if (!link.closest('.woocommerce-mini-cart__buttons')) {
                    link.remove();
                }
            }
        });
        
        // Specific targeting for the about.html page heart icon
        document.querySelectorAll('header a, .header-button a, .menu-area a, nav a').forEach(function(link) {
            if (link.innerHTML && link.innerHTML.includes('fa-heart')) {
                link.remove();
            }
        });
    }, 100); // Small delay to ensure DOM is fully loaded
    
    // Regular approach for all pages
    const navLinks = document.querySelectorAll('nav a, .header-button a, .menu-area a');
    navLinks.forEach(link => {
        // Check if this link contains a heart icon or is the wishlist link
        if ((link.innerHTML && link.innerHTML.includes('fa-heart')) || 
            (link.getAttribute('href') && link.getAttribute('href').includes('wishlist.html'))) {
            link.remove();
        }
    });
    
    // Also check for any heart icon in the header that might be part of the navigation
    document.querySelectorAll('header i.fa-heart, header i.far.fa-heart, header svg.fa-heart').forEach(icon => {
        let parent = icon.closest('a');
        if (parent) {
            parent.remove();
        }
    });
    // 1. Remove wishlist icon from header navigation on all pages
    // Target all possible wishlist icon selectors to ensure complete removal
    const wishlistSelectors = [
        'a.icon-btn[href="wishlist.html"]',
        'a[href="wishlist.html"].icon-btn',
        '.header-button a[href="wishlist.html"]',
        'nav a[href="wishlist.html"]',
        'a.heart-icon',
        'a:has(i.far.fa-heart)',
        'a:has(i.fa-heart)'
    ];
    
    wishlistSelectors.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                // Check if it's actually a wishlist link before removing
                if (element.href && element.href.includes('wishlist.html') || 
                    (element.querySelector && element.querySelector('.fa-heart'))) {
                    element.remove();
                }
            });
        } catch (e) {
            // Ignore errors for unsupported selectors in older browsers
            console.log('Selector not supported:', selector);
        }
    });
    
    // Also remove the heart icon from the navigation bar if it exists
    const heartIcons = document.querySelectorAll('nav .fa-heart, .header-button .fa-heart, .contact i.fa-heart, header i.fa-heart');
    heartIcons.forEach(icon => {
        // Find the parent link and remove it
        let parent = icon.parentElement;
        while (parent && parent.tagName !== 'A') {
            parent = parent.parentElement;
        }
        if (parent) {
            parent.remove();
        }
    });
    
    // Specifically target the heart icon in the contact page navigation
    // This addresses the icon shown in the screenshot
    document.querySelectorAll('.contact nav a, header nav a').forEach(link => {
        if (link.innerHTML.includes('fa-heart')) {
            link.remove();
        }
    });
    
    // Remove any standalone heart icon elements
    document.querySelectorAll('a').forEach(link => {
        if (link.querySelector('i.fa-heart') || 
            link.querySelector('i.far.fa-heart') || 
            link.querySelector('i.fas.fa-heart') || 
            link.querySelector('svg.fa-heart')) {
            // Check if it's not within the cart sidebar (to preserve our wishlist button there)
            if (!link.closest('.woocommerce-mini-cart__buttons')) {
                link.remove();
            }
        }
    });
    
    // 2. Add wishlist button to cart sidebar if it doesn't exist
    const cartButtons = document.querySelector('.woocommerce-mini-cart__buttons');
    if (cartButtons) {
        // Check if wishlist button already exists
        const existingWishlistBtn = cartButtons.querySelector('.wishlist');
        if (!existingWishlistBtn) {
            // Get the wishlist count
            let wishlistCount = 0;
            const wishlistCountElements = document.querySelectorAll('.wishlist-count');
            if (wishlistCountElements.length > 0) {
                wishlistCount = wishlistCountElements[0].textContent || '0';
            }
            
            // Create wishlist button
            const viewCartBtn = cartButtons.querySelector('a[href="cart.html"]');
            const checkoutBtn = cartButtons.querySelector('a[href="checkout.html"]');
            
            if (viewCartBtn && checkoutBtn) {
                const wishlistBtn = document.createElement('a');
                wishlistBtn.href = 'wishlist.html';
                wishlistBtn.className = 'th-btn wishlist wc-forward';
                wishlistBtn.innerHTML = `<i class="far fa-heart me-2"></i>Wishlist <span class="wishlist-count badge bg-danger ms-1">${wishlistCount}</span>`;
                
                // Insert after view cart button
                cartButtons.insertBefore(wishlistBtn, checkoutBtn);
            }
        }
    }
    
    // 3. Remove wishlist from mobile menu and user dropdown
    const mobileMenuWishlist = document.querySelector('.th-mobile-menu .sub-menu a[href="wishlist.html"]');
    if (mobileMenuWishlist && mobileMenuWishlist.parentNode) {
        mobileMenuWishlist.parentNode.remove();
    }
    
    const userDropdownWishlist = document.querySelector('.dropdown-menu a[href="wishlist.html"]');
    if (userDropdownWishlist && userDropdownWishlist.parentNode) {
        userDropdownWishlist.parentNode.remove();
    }
    
    // 4. Add CSS styles for the wishlist button if not already present
    if (!document.getElementById('wishlist-ui-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'wishlist-ui-styles';
        styleElement.textContent = `
            .woocommerce-mini-cart__buttons {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .th-btn.wishlist {
                background: linear-gradient(to right, #f8f9fa, #e9ecef);
                color: #333;
                border: 1px solid #dee2e6;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }
            
            .th-btn.wishlist:hover {
                background: linear-gradient(to right, #e9ecef, #dee2e6);
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            
            .th-btn.wishlist .badge {
                font-size: 0.75rem;
                padding: 0.25rem 0.5rem;
            }
        `;
        document.head.appendChild(styleElement);
    }
});
