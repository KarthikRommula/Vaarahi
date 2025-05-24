/**
 * Wishlist functionality for VAARAHI E-commerce
 * Handles adding/removing items to/from wishlist
 */

// Initialize wishlist items array
let wishlistItems = [];

console.log('Wishlist script loaded');

// Safely parse wishlist items from localStorage
try {
    const storedWishlist = localStorage.getItem('vaarahiWishlist');
    if (storedWishlist) {
        wishlistItems = JSON.parse(storedWishlist) || [];
        // Filter out any invalid items
        wishlistItems = wishlistItems.filter(item => item && typeof item === 'object');
    }
    console.log('Loaded wishlist items:', wishlistItems);
} catch (e) {
    console.error('Error loading wishlist from localStorage:', e);
    wishlistItems = [];
    localStorage.setItem('vaarahiWishlist', JSON.stringify([]));
}

// Initialize wishlist when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing wishlist');
    updateWishlistDisplay();
    setupWishlistEventListeners();
});

// Save wishlist items to localStorage
function saveWishlistToStorage() {
    try {
        localStorage.setItem('vaarahiWishlist', JSON.stringify(wishlistItems));
    } catch (e) {
        console.error('Error saving wishlist to localStorage:', e);
    }
}

// Update all wishlist displays on the page
function updateWishlistDisplay() {
    // Save wishlist to localStorage first
    saveWishlistToStorage();
    
    // Update wishlist count badge if exists
    const wishlistBadges = document.querySelectorAll('.wishlist-count');
    wishlistBadges.forEach(badge => {
        badge.textContent = wishlistItems.length;
    });
    
    // Update wishlist page if we're on it
    if (window.location.href.includes('wishlist.html')) {
        updateWishlistPage();
    }
}

// Update the wishlist page with the new card-based layout
function updateWishlistPage() {
    const wishlistContainer = document.getElementById('wishlist-items-container');
    if (!wishlistContainer) return;
    
    // Clear current items
    wishlistContainer.innerHTML = '';
    
    // Get the empty wishlist message element
    const emptyWishlistMessage = document.querySelector('.empty-wishlist-message');
    
    // Check if wishlist is empty
    if (wishlistItems.length === 0) {
        // If empty, show the empty wishlist message
        if (emptyWishlistMessage) {
            // If the message is already in the DOM, make it visible
            wishlistContainer.appendChild(emptyWishlistMessage);
        } else {
            // Create the empty message if it doesn't exist
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'col-12 empty-wishlist-message text-center py-5';
            emptyMessage.innerHTML = `
                <div class="empty-wishlist-icon mb-4">
                    <i class="far fa-heart" style="font-size: 48px; color: #ddd;"></i>
                </div>
                <h4>Your wishlist is empty</h4>
                <p class="text-muted mb-4">Browse our products and add your favorites to the wishlist</p>
                <a href="products.html" class="th-btn">Browse Products</a>
            `;
            wishlistContainer.appendChild(emptyMessage);
        }
    } else {
        // If not empty, hide the empty message and add wishlist items
        if (emptyWishlistMessage && emptyWishlistMessage.parentNode) {
            emptyWishlistMessage.parentNode.removeChild(emptyWishlistMessage);
        }
        
        // Add wishlist items as cards
        wishlistItems.forEach((item, index) => {
            const cardCol = document.createElement('div');
            cardCol.className = 'col-md-6 col-lg-4 col-xl-3';
            
            // Generate a random stock number between 5 and 20 for display purposes
            const stockNumber = Math.floor(Math.random() * 16) + 5;
            const isInStock = stockNumber > 0;
            const stockStatusClass = isInStock ? 'in-stock' : 'out-of-stock';
            const stockStatusText = isInStock ? 'In Stock' : 'Out of Stock';
            
            cardCol.innerHTML = `
                <div class="wishlist-card">
                    <div class="product-img">
                        <img src="${item.image || 'assets/img/product/product_1_1.png'}" alt="${item.name}">
                        <a href="#" class="remove-btn remove-from-wishlist" data-index="${index}">
                            <i class="far fa-times"></i>
                        </a>
                    </div>
                    <div class="card-body">
                        <a href="shop-details.html" class="product-name">${item.name}</a>
                        <span class="product-price">$${parseFloat(item.price).toFixed(2)}</span>
                        <div class="stock-status ${stockStatusClass}">
                            <i class="far fa-${isInStock ? 'check-circle' : 'times-circle'} me-1"></i>
                            ${stockStatusText} ${isInStock ? `(${stockNumber} left)` : ''}
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="th-btn add-to-cart-from-wishlist add-to-cart-btn" data-index="${index}">
                            <i class="far fa-shopping-cart"></i> Add to Cart
                        </button>
                    </div>
                </div>
            `;
            wishlistContainer.appendChild(cardCol);
        });
        
        // Add event listeners to the new buttons
        document.querySelectorAll('.remove-from-wishlist').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const index = parseInt(this.getAttribute('data-index'));
                removeFromWishlist(index);
            });
        });
        
        document.querySelectorAll('.add-to-cart-from-wishlist').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                addToCartFromWishlist(index);
            });
        });
    }
}

// Show notification function for wishlist - uses the global notification system
function displayWishlistNotification(message, type = 'success') {
    // Always use the global notification system
    if (window.showNotification && typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        console.warn('Global notification system not available');
    }
}

// No alias needed - we'll use the existing showNotification function

// Add a product to the wishlist
function addToWishlist(productData) {
    console.log('Adding to wishlist:', productData);
    
    // Check if user is logged in (if authentication is required)
    if (window.auth && typeof window.auth.requireAuth === 'function') {
        if (!window.auth.requireAuth()) {
            displayWishlistNotification('Please log in to add items to your wishlist', 'warning');
            return false; // User is not authenticated
        }
    }
    
    // Check if product already exists in wishlist
    const existingItemIndex = wishlistItems.findIndex(item => 
        item.id === productData.id || item.name === productData.name
    );
    
    if (existingItemIndex !== -1) {
        // Product already in wishlist
        displayWishlistNotification(`"${productData.name}" has been added to your wishlist.`, 'info');
        return false;
    }
    
    // Add product to wishlist
    wishlistItems.push({
        id: productData.id,
        name: productData.name,
        price: productData.price,
        image: productData.image
    });
    
    // Update wishlist display
    updateWishlistDisplay();
    
    // Show notification
    displayWishlistNotification(`"${productData.name}" has been added to your wishlist.`, 'success');
    
    return true;
}

// Remove an item from the wishlist
function removeFromWishlist(index) {
    if (index >= 0 && index < wishlistItems.length) {
        const removedItem = wishlistItems[index];
        wishlistItems.splice(index, 1);
        updateWishlistDisplay();
        displayWishlistNotification(`"${removedItem.name}" has been removed from your wishlist.`, 'success');
    }
}

// Add item from wishlist to cart
function addToCartFromWishlist(index) {
    console.log('Adding item from wishlist to cart, index:', index);
    
    // Check if user is authenticated using the auth.js system
    if (window.auth && typeof window.auth.requireAuth === 'function') {
        // This will check authentication and handle redirects if needed
        if (!window.auth.requireAuth()) {
            console.log('User not authenticated, stopping');
            return; // Stop if not authenticated - requireAuth handles the redirect
        }
        console.log('User is authenticated, proceeding');
    } else {
        console.warn('Auth system not properly loaded, falling back to direct cart access');
    }
    
    // If we get here, user is authenticated or auth check is bypassed
    if (index >= 0 && index < wishlistItems.length) {
        const item = wishlistItems[index];
        console.log('Adding item to cart:', item);
        
        // Add to cart using the existing cart system
        if (window.addToCart && typeof window.addToCart === 'function') {
            try {
                // Add to cart
                window.addToCart({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    quantity: 1
                });
                
                // Show notification directly - force it to use the global notification system
                console.log('Showing notification for item:', item.name);
                if (window.showNotification) {
                    // Call the global notification function directly
                    window.showNotification(`${item.name} added to your cart!`, 'success');
                } else {
                    // Fallback to alert if notification system is not available
                    alert(`${item.name} added to your cart!`);
                }
            } catch (error) {
                console.error('Error adding item to cart:', error);
                alert('Error adding item to cart. Please try again.');
            }
        } else {
            console.error('Cart system not available');
            alert('Cart system not available.');
        }
    } else {
        console.error('Invalid wishlist item index:', index);
    }
}

function checkUserAuthentication() {
    try {
        // Get current user from localStorage or sessionStorage
        const localUser = localStorage.getItem('vaarahiCurrentUser');
        const sessionUser = sessionStorage.getItem('vaarahiCurrentUser');
        
        // If user data exists in either storage, consider user as logged in
        return !!(localUser || sessionUser);
    } catch (e) {
        console.error('Error checking authentication:', e);
        return false;
    }
}

// Setup event listeners for the wishlist
function setupWishlistEventListeners() {
    console.log('Setting up wishlist event listeners');
    
    // Add direct event listener to wishlist buttons that exist on page load
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        console.log('Found wishlist button:', button);
        
        // Skip the "View Wishlist" button in the mini cart
        if (button.textContent.trim().includes('View Wishlist')) {
            console.log('Found View Wishlist button in mini cart, skipping add-to-wishlist handler');
            // Ensure it has the correct href
            if (button.tagName.toLowerCase() === 'a') {
                button.href = 'wishlist.html';
            } else {
                // If it's not an anchor tag, add a click handler to navigate
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    window.location.href = 'wishlist.html';
                });
            }
        } else {
            // Regular wishlist button for adding products
            button.addEventListener('click', handleWishlistButtonClick);
        }
    });
    
    // Also add event delegation for dynamically added buttons
    document.addEventListener('click', function(e) {
        // Get the actual button (could be the icon inside)
        const button = e.target.classList.contains('wishlist-btn') ? 
            e.target : e.target.closest('.wishlist-btn');
            
        if (!button) return; // Not a wishlist button
        
        // Skip the "View Wishlist" button in the mini cart
        if (button.textContent.trim().includes('View Wishlist')) {
            e.preventDefault();
            window.location.href = 'wishlist.html';
        } else {
            // Regular wishlist button for adding products
            handleWishlistButtonClick(e);
        }
    });
}

// Handle wishlist button click
function handleWishlistButtonClick(e) {
    e.preventDefault();
    console.log('Wishlist button clicked');
    
    // Get the button
    const button = e.target.classList.contains('wishlist-btn') ? 
        e.target : e.target.closest('.wishlist-btn');
    
    // Check if this is a navigation link rather than an add-to-wishlist button
    const isWishlistLink = button.getAttribute('href') === 'wishlist.html' || 
                          button.getAttribute('href') === '/wishlist.html';
    
    if (isWishlistLink) {
        console.log('This appears to be a wishlist page link, not an add-to-wishlist button');
        return; // Exit without error - this is just a navigation link
    }
    
    // APPROACH 1: Try to find product info based on the current page structure
    // First check if we're in the main product detail section
    let name, price, image, id;
    
    // Check if we're on the main product detail page
    const mainProductTitle = document.querySelector('h1.product-title') || document.querySelector('h2.product-title');
    const mainProductPrice = document.querySelector('.price');
    const mainProductImage = document.querySelector('.product-big-img img');
    const mainProductSku = document.querySelector('.sku');
    
    if (mainProductTitle && mainProductPrice) {
        console.log('Found main product details');
        name = mainProductTitle.textContent.trim();
        
        // Extract price (remove currency symbol and parse as float)
        const priceText = mainProductPrice.textContent.trim();
        const priceMatch = priceText.match(/[\d,.]+/);
        if (priceMatch) {
            price = parseFloat(priceMatch[0].replace(/,/g, ''));
        } else {
            price = 0;
        }
        
        image = mainProductImage ? mainProductImage.getAttribute('src') : '';
        id = mainProductSku ? mainProductSku.textContent.trim() : name.toLowerCase().replace(/\s+/g, '-');
    } 
    // Check if we're in a product-about section (quick view popup)
    else if (button.closest('.product-about')) {
        console.log('Found product in product-about section');
        const productAbout = button.closest('.product-about');
        
        const titleElement = productAbout.querySelector('.product-title');
        if (!titleElement) {
            console.error('Could not find product title in product-about');
            return;
        }
        
        name = titleElement.textContent.trim();
        
        const priceElement = productAbout.querySelector('.price');
        if (!priceElement) {
            console.error('Could not find price element in product-about');
            return;
        }
        
        // Extract price
        const priceText = priceElement.textContent.trim();
        const priceMatch = priceText.match(/[\d,.]+/);
        if (priceMatch) {
            price = parseFloat(priceMatch[0].replace(/,/g, ''));
        } else {
            price = 0;
        }
        
        // Find image - could be in different places
        const productImage = document.querySelector('.mfp-content img') || 
                           productAbout.closest('.row').querySelector('img');
        
        image = productImage ? productImage.getAttribute('src') : '';
        
        // Get SKU
        const skuElement = productAbout.querySelector('.sku');
        id = skuElement ? skuElement.textContent.trim() : name.toLowerCase().replace(/\s+/g, '-');
    }
    // Last resort - try to get product info from URL or page title
    else {
        console.log('Attempting to get product info from page');
        
        // Try to get product name from page title
        const pageTitle = document.title;
        name = pageTitle.split(' - ')[0].trim() || 'Unknown Product';
        
        // Try to find any price on the page
        const anyPriceElement = document.querySelector('.price');
        if (anyPriceElement) {
            const priceText = anyPriceElement.textContent.trim();
            const priceMatch = priceText.match(/[\d,.]+/);
            if (priceMatch) {
                price = parseFloat(priceMatch[0].replace(/,/g, ''));
            } else {
                price = 0;
            }
        } else {
            price = 0;
        }
        
        // Try to find any product image
        const anyProductImage = document.querySelector('.product-img img') || 
                              document.querySelector('.product-image img') || 
                              document.querySelector('.product img');
        
        image = anyProductImage ? anyProductImage.getAttribute('src') : '';
        
        // Try to get ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        id = urlParams.get('id') || name.toLowerCase().replace(/\s+/g, '-');
    }
    
    // Final validation
    if (!name || name === '') {
        console.error('Could not determine product name');
        return;
    }
    
    console.log('Product data collected:', { id, name, price, image });
    
    // Add to wishlist
    addToWishlist({
        id,
        name,
        price,
        image
    });
}

// Test notification function - can be called from console for debugging
function testNotification() {
    console.log('Testing notification system...');
    if (typeof window.showNotification === 'function') {
        window.showNotification('Test notification from wishlist.js', 'success');
        console.log('Notification function called successfully');
        return true;
    } else {
        console.error('showNotification function not available');
        alert('Notification system not available');
        return false;
    }
}

// Make wishlist functions globally accessible
window.wishlist = {
    addToWishlist,
    removeFromWishlist,
    updateWishlistDisplay,
    wishlistItems,
    testNotification
};
