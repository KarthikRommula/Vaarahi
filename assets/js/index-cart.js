/**
 * Index Page Cart Implementation
 * This script implements the same cart functionality as shop-details.html
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart
    setupIndexCartEventListeners();
});

/**
 * Set up all cart-related event listeners for the index page
 */
function setupIndexCartEventListeners() {
    // Add to cart buttons in featured products section
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
    
    // Quick view modal add to cart button
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-add-to-cart')) {
            e.preventDefault();
            
            // Get product data from the modal
            const modal = e.target.closest('.th-product-quick-view-modal');
            if (!modal) return;
            
            const name = modal.querySelector('.modal-product-title').textContent;
            const priceText = modal.querySelector('.modal-product-price').textContent;
            
            // Carefully extract the price
            let price = 0;
            const priceMatch = priceText.match(/\$\s*(\d+(\.\d+)?)/);
            if (priceMatch && priceMatch[1]) {
                price = parseFloat(priceMatch[1]);
            }
            
            const image = modal.querySelector('.modal-product-img').getAttribute('src');
            const id = name.toLowerCase().replace(/\s+/g, '-');
            const quantityInput = modal.querySelector('.form-control');
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
            
            // Add to cart
            addToCart({
                id,
                name,
                price,
                image,
                quantity
            });
            
            // Close the modal
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        }
    });
}

/**
 * Add a product to the cart
 */
function addToCart(product) {
    if (!product || !product.id) {
        console.error('Invalid product data');
        return;
    }
    
    try {
        // Get current cart
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Check if product already exists in cart
        const existingProductIndex = cart.findIndex(item => 
            item.id.toLowerCase() === product.id.toLowerCase()
        );
        
        if (existingProductIndex > -1) {
            // Update quantity if product exists
            cart[existingProductIndex].quantity += (parseInt(product.quantity) || 1);
        } else {
            // Add new product
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: parseInt(product.quantity) || 1
            });
        }
        
        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Show notification
        showNotification(`${product.name} added to cart!`);
        
        // Trigger cart sync
        if (typeof synchronizeCarts === 'function') {
            synchronizeCarts();
        }
    } catch (e) {
        console.error('Error adding product to cart:', e);
    }
}

/**
 * Show a notification message
 */
function showNotification(message, type = 'success') {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.cart-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'cart-notification';
        document.body.appendChild(notification);
        
        // Style the notification
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 25px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '9999';
        notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
    }
    
    // Set notification type
    if (type === 'success') {
        notification.style.backgroundColor = '#28a745';
        notification.style.color = 'white';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#dc3545';
        notification.style.color = 'white';
    }
    
    // Set message and show notification
    notification.textContent = message;
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
    }, 3000);
}
