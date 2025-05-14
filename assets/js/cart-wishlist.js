// Common cart and wishlist functionality for all pages
(function() {
    // Initialize wishlist items array if it doesn't exist
    if (!window.wishlistItems) {
        window.wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];
    }

    // Function to save wishlist to localStorage
    window.saveWishlist = function() {
        localStorage.setItem('wishlistItems', JSON.stringify(window.wishlistItems));
    };

    // Function to get cart items from the existing cart system
    window.getCartItems = function() {
        try {
            return JSON.parse(localStorage.getItem('vaarahiCart')) || [];
        } catch (e) {
            console.error('Error loading cart from localStorage:', e);
            return [];
        }
    };

    // Function to add item to cart using the existing cart system
    window.addToCartFromWishlist = function(productName, productPrice, productImage) {
        // Get current cart items
        const cartItems = window.getCartItems();
        
        // Generate a product ID from the name
        const productId = productName.toLowerCase().replace(/\s+/g, '-');
        
        // Check if item already exists in cart
        let found = false;
        for (let i = 0; i < cartItems.length; i++) {
            if (cartItems[i].name === productName) {
                // Increment quantity
                cartItems[i].quantity++;
                found = true;
                break;
            }
        }
        
        // If item not found, add it
        if (!found) {
            cartItems.push({
                id: productId,
                name: productName,
                price: productPrice,
                quantity: 1,
                image: productImage
            });
        }
        
        // Save cart to localStorage
        localStorage.setItem('vaarahiCart', JSON.stringify(cartItems));
        
        // Update cart display if the updateCartDisplay function exists
        if (typeof updateCartDisplay === 'function') {
            updateCartDisplay();
        } else {
            // Fallback if the function doesn't exist
            // Update cart count badge
            const cartBadges = document.querySelectorAll('.sideMenuToggler .badge');
            const totalQuantity = cartItems.reduce((total, item) => total + parseInt(item.quantity), 0);
            cartBadges.forEach(badge => {
                badge.textContent = totalQuantity;
            });
            
            // Update mini cart if the function exists
            if (typeof updateMiniCart === 'function') {
                updateMiniCart();
            }
        }
        
        // Show message
        window.showMessage(`"${productName}" has been added to your cart.`);
        
        // Show mini cart
        const miniCart = document.querySelector('.sidemenu-wrapper.sidemenu-cart');
        if (miniCart) {
            miniCart.classList.add('show');
        }
    };

    // Function to show message
    window.showMessage = function(text) {
        // Create message element if it doesn't exist
        let messageElement = document.querySelector('.cart-wishlist-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'cart-wishlist-message';
            document.body.appendChild(messageElement);
            
            // Style the message
            messageElement.style.position = 'fixed';
            messageElement.style.top = '20px';
            messageElement.style.left = '50%';
            messageElement.style.transform = 'translateX(-50%)';
            messageElement.style.backgroundColor = '#28a745';
            messageElement.style.color = 'white';
            messageElement.style.padding = '10px 20px';
            messageElement.style.borderRadius = '5px';
            messageElement.style.zIndex = '9999';
            messageElement.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            messageElement.style.transition = 'opacity 0.3s ease';
        }
        
        // Set message text and show
        messageElement.textContent = text;
        messageElement.style.display = 'block';
        messageElement.style.opacity = '1';
        
        // Hide after 3 seconds
        setTimeout(() => {
            messageElement.style.opacity = '0';
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 300);
        }, 3000);
    };

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        // Setup mini cart toggler if not already set up
        document.querySelectorAll('.sideMenuToggler').forEach(toggler => {
            if (!toggler.hasAttribute('data-listener-attached')) {
                toggler.setAttribute('data-listener-attached', 'true');
                toggler.addEventListener('click', function(e) {
                    e.preventDefault();
                    const cart = document.querySelector('.sidemenu-wrapper.sidemenu-cart');
                    if (cart) {
                        cart.classList.add('show');
                    }
                });
            }
        });
        
        // Add event listener to close button if not already set up
        document.querySelectorAll('.sidemenu-wrapper .closeButton').forEach(button => {
            if (!button.hasAttribute('data-listener-attached')) {
                button.setAttribute('data-listener-attached', 'true');
                button.addEventListener('click', function() {
                    const cart = this.closest('.sidemenu-wrapper');
                    if (cart) {
                        cart.classList.remove('show');
                    }
                });
            }
        });
    });
})();
