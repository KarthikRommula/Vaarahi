/**
 * Enhanced UI JavaScript for E-commerce Website
 * Adds product filtering, quick view functionality, and other interactive features
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize product filtering
    initProductFilter();
    
    // Initialize quick view functionality
    initQuickView();
    
    // Initialize back to top button
    initBackToTop();
    
    // Initialize newsletter form
    initNewsletterForm();
    
    // Initialize enhanced cart and wishlist functionality
    enhanceCartWishlist();
});

/**
 * Initialize product filtering functionality
 */
function initProductFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productItems = document.querySelectorAll('.product-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filterValue = this.getAttribute('data-filter');
            
            // Filter products
            productItems.forEach(item => {
                if (filterValue === 'all') {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.classList.add('animate__fadeIn');
                        item.classList.remove('animate__fadeOut');
                    }, 200);
                } else {
                    const categories = item.getAttribute('data-category').split(' ');
                    
                    if (categories.includes(filterValue)) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.classList.add('animate__fadeIn');
                            item.classList.remove('animate__fadeOut');
                        }, 200);
                    } else {
                        item.classList.remove('animate__fadeIn');
                        item.classList.add('animate__fadeOut');
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 500);
                    }
                }
            });
        });
    });
}

/**
 * Initialize quick view functionality
 */
function initQuickView() {
    const quickViewBtns = document.querySelectorAll('.popup-content');
    
    quickViewBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get product data from data attributes
            const productName = this.getAttribute('data-product-name');
            const productPrice = this.getAttribute('data-product-price');
            const productImage = this.getAttribute('data-product-image');
            const productId = this.getAttribute('data-product-id');
            
            // Update quick view modal with product data
            if (productName && productPrice && productImage) {
                const quickViewModal = document.querySelector('#QuickView');
                if (quickViewModal) {
                    const productTitleEl = quickViewModal.querySelector('.product-title');
                    const productPriceEl = quickViewModal.querySelector('.price');
                    const productImageEl = quickViewModal.querySelector('.img img');
                    const addToCartBtn = quickViewModal.querySelector('.add-to-cart-btn');
                    const addToWishlistBtn = quickViewModal.querySelector('.add-to-wishlist-btn');
                    
                    if (productTitleEl) productTitleEl.textContent = productName;
                    if (productPriceEl) productPriceEl.textContent = productPrice;
                    if (productImageEl) productImageEl.setAttribute('src', productImage);
                    if (addToCartBtn) addToCartBtn.setAttribute('data-product-id', productId);
                    if (addToWishlistBtn) addToWishlistBtn.setAttribute('data-product-id', productId);
                }
            }
        });
    });
}

/**
 * Initialize back to top button
 */
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (backToTopBtn) {
        // Show/hide back to top button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        // Scroll to top when button is clicked
        backToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/**
 * Initialize newsletter form
 */
function initNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email) {
                // Simulate form submission
                emailInput.value = '';
                
                // Show success message
                showToast('success', 'Thank you for subscribing to our newsletter!');
            }
        });
    }
}

/**
 * Enhance cart and wishlist functionality
 */
function enhanceCartWishlist() {
    // Add to cart button click event
    const addToCartBtns = document.querySelectorAll('.add-to-cart');
    
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add animation class
            this.classList.add('added-to-cart');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                this.classList.remove('added-to-cart');
            }, 500);
            
            // Get product ID
            const productId = this.getAttribute('data-product-id');
            
            // Get product information
            const productCard = this.closest('.th-product');
            if (productCard) {
                const productName = productCard.querySelector('.product-title a').textContent;
                
                // Show success message
                showToast('success', `${productName} has been added to your cart!`);
            }
        });
    });
    
    // Add to wishlist button click event
    const addToWishlistBtns = document.querySelectorAll('.add-to-wishlist');
    
    addToWishlistBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Toggle heart icon
            const heartIcon = this.querySelector('i');
            if (heartIcon) {
                if (heartIcon.classList.contains('far')) {
                    heartIcon.classList.remove('far');
                    heartIcon.classList.add('fas', 'heart-beat');
                    
                    // Get product information
                    const productCard = this.closest('.th-product');
                    if (productCard) {
                        const productName = productCard.querySelector('.product-title a').textContent;
                        
                        // Show success message
                        showToast('success', `${productName} has been added to your wishlist!`);
                    }
                } else {
                    heartIcon.classList.remove('fas', 'heart-beat');
                    heartIcon.classList.add('far');
                    
                    // Get product information
                    const productCard = this.closest('.th-product');
                    if (productCard) {
                        const productName = productCard.querySelector('.product-title a').textContent;
                        
                        // Show info message
                        showToast('info', `${productName} has been removed from your wishlist!`);
                    }
                }
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    heartIcon.classList.remove('heart-beat');
                }, 1000);
            }
        });
    });
}

/**
 * Show toast notification
 * @param {string} type - Type of toast (success, info, warning)
 * @param {string} message - Message to display
 */
function showToast(type, message) {
    const toastContainer = document.querySelector('.toast-container');
    
    if (toastContainer) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Set toast icon based on type
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle toast-icon"></i>';
                break;
            case 'info':
                icon = '<i class="fas fa-info-circle toast-icon"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-circle toast-icon"></i>';
                break;
            default:
                icon = '<i class="fas fa-info-circle toast-icon"></i>';
        }
        
        // Set toast content
        toast.innerHTML = `
            ${icon}
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        `;
        
        // Add toast to container
        toastContainer.appendChild(toast);
        
        // Add close event to toast
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                toast.style.opacity = '0';
                setTimeout(() => {
                    toastContainer.removeChild(toast);
                }, 300);
            });
        }
        
        // Auto remove toast after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toastContainer.removeChild(toast);
                    }
                }, 300);
            }
        }, 5000);
    }
}
