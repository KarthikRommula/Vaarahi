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
    
    // If we're on the products page, load products from centralized data
    if (currentPage === 'products.html' && window.ProductData) {
        // Force a fresh load of products every time
        loadProductsFromCentralData();
        
        // Also refresh products when the page becomes visible again (browser tab switching)
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible') {
                loadProductsFromCentralData();
            }
        });
        
        // Add event listener for the refresh button
        const refreshButton = document.getElementById('refresh-products');
        if (refreshButton) {
            refreshButton.addEventListener('click', function() {
                // Show loading state
                this.innerHTML = '<span>Refreshing...</span>';
                this.disabled = true;
                
                // Force reload of product data
                loadProductsFromCentralData();
                
                // Reset button after a short delay
                setTimeout(() => {
                    this.innerHTML = 'Refresh Products';
                    this.disabled = false;
                    
                    // Show success notification
                    showNotification('Products refreshed successfully!');
                }, 500);
            });
        }
        
        // Add event listener for the sorting dropdown
        const sortingDropdown = document.querySelector('.orderby');
        if (sortingDropdown) {
            sortingDropdown.addEventListener('change', function() {
                const sortMethod = this.value;
                // Reset to page 1 when sorting changes
                loadProductsFromCentralData(1, sortMethod);
                
                // Show notification about sorting
                const sortText = this.options[this.selectedIndex].text;
                showNotification(`Products sorted by ${sortText}`);
            });
        }
    }
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

// Note: showNotification is now provided by notification-system.js

/**
 * Global variables for pagination and sorting
 */
let currentPage = 1;
const productsPerPage = 8; // Number of products to show per page
let allProducts = [];
let currentSortMethod = 'menu_order'; // Default sorting method

/**
 * Sorts products based on the specified sort method
 * @param {Array} products - Array of products to sort
 * @param {string} sortMethod - Method to sort by (menu_order, popularity, rating, date, price, price-desc)
 * @returns {Array} - Sorted array of products
 */
function sortProducts(products, sortMethod) {
    // Create a copy of the products array to avoid modifying the original
    const sortedProducts = [...products];
    
    switch (sortMethod) {
        case 'popularity':
            // Sort by reviews count (popularity)
            return sortedProducts.sort((a, b) => b.reviews - a.reviews);
            
        case 'rating':
            // Sort by rating
            return sortedProducts.sort((a, b) => b.rating - a.rating);
            
        case 'date':
            // Sort by new flag (assuming newer products have new=true)
            return sortedProducts.sort((a, b) => {
                if (a.new && !b.new) return -1;
                if (!a.new && b.new) return 1;
                return 0;
            });
            
        case 'price':
            // Sort by price: low to high
            return sortedProducts.sort((a, b) => a.price - b.price);
            
        case 'price-desc':
            // Sort by price: high to low
            return sortedProducts.sort((a, b) => b.price - a.price);
            
        case 'menu_order':
        default:
            // Default sorting (by featured flag, then by id)
            return sortedProducts.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return a.id.localeCompare(b.id);
            });
    }
}

/**
 * Loads products from the centralized product data system with pagination and sorting
 * @param {number} page - The page number to load (default: 1)
 * @param {string} sortMethod - Method to sort by (default: current sort method)
 */
function loadProductsFromCentralData(page = 1, sortMethod = currentSortMethod) {
    // Get the product container
    const productContainer = document.getElementById('product-container');
    if (!productContainer) return;
    
    // Clear existing products
    productContainer.innerHTML = '';
    
    // Update current sort method
    currentSortMethod = sortMethod;
    
    // Get all products from centralized data if not already loaded
    if (allProducts.length === 0) {
        allProducts = window.ProductData.getAllProducts();
    }
    
    // Sort products based on the current sort method
    const sortedProducts = sortProducts(allProducts, sortMethod);
    
    // Calculate pagination
    currentPage = page;
    const totalProducts = sortedProducts.length;
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = Math.min(startIndex + productsPerPage, totalProducts);
    
    // Get products for current page
    const productsToShow = sortedProducts.slice(startIndex, endIndex);
    
    // Generate HTML for each product
    productsToShow.forEach(product => {
        const productHTML = `
            <div class="col-sm-6 col-lg-4 col-xl-3">
                <div class="th-product product-grid">
                    <div class="product-img">
                        <img src="${product.image}" alt="${product.name}">
                        <span class="product-tag">${product.sale ? 'Sale' : (product.hot ? 'Hot' : (product.new ? 'New' : ''))}</span>

                    </div>
                    <div class="product-content">
                        <div class="rating-wrap">
                            <div class="star-rating" role="img" aria-label="Rated ${product.rating} out of 5">
                                <span style="width: ${(product.rating / 5) * 100}%">Rated <strong class="rating">${product.rating}</strong> out of 5</span>
                            </div>
                            <span class="rating-count">(${product.reviews} Reviews)</span>
                        </div>
                        <h3 class="product-title"><a href="shop-details.html?id=${product.id}">${product.name}</a></h3>
                        <span class="price">${product.oldPrice ? `<del>${window.CurrencyUtils ? window.CurrencyUtils.formatPrice(product.oldPrice) : `₹${product.oldPrice.toFixed(2)}`}</del> ` : ''}${window.CurrencyUtils ? window.CurrencyUtils.formatPrice(product.price) : `₹${product.price.toFixed(2)}`}</span>
                    </div>
                </div>
            </div>
        `;
        productContainer.insertAdjacentHTML('beforeend', productHTML);
    });
    
    // Update product count
    const productCountElement = document.querySelector('.showing-product-number');
    if (productCountElement) {
        productCountElement.textContent = `Showing ${startIndex + 1}-${endIndex} of ${totalProducts} results`;
    }
    
    // Update pagination
    updatePagination(totalPages, page);
    
    // Hide the static template completely
    const staticTemplate = document.getElementById('static-product-template');
    if (staticTemplate) {
        staticTemplate.style.display = 'none';
    }
    
    // Reinitialize event listeners for the new products
    initializeQuickView();
    initializeCart();
    
    console.log(`Products loaded from centralized data: ${productsToShow.length} products (page ${page} of ${totalPages})`);
}

/**
 * Updates the pagination UI based on current page and total pages
 * @param {number} totalPages - Total number of pages
 * @param {number} currentPage - Current active page
 */
function updatePagination(totalPages, currentPage) {
    const paginationContainer = document.querySelector('.th-pagination ul');
    if (!paginationContainer) return;
    
    // Clear existing pagination
    paginationContainer.innerHTML = '';
    
    // Add previous page button
    const prevDisabled = currentPage === 1;
    paginationContainer.insertAdjacentHTML('beforeend', `
        <li><a href="javascript:void(0)" ${prevDisabled ? 'class="disabled"' : ''} data-page="${currentPage - 1}"><i class="fas fa-arrow-left"></i></a></li>
    `);
    
    // Add page numbers
    for (let i = 1; i <= totalPages; i++) {
        paginationContainer.insertAdjacentHTML('beforeend', `
            <li><a href="javascript:void(0)" ${i === currentPage ? 'class="active"' : ''} data-page="${i}">${i}</a></li>
        `);
    }
    
    // Add next page button
    const nextDisabled = currentPage === totalPages;
    paginationContainer.insertAdjacentHTML('beforeend', `
        <li><a href="javascript:void(0)" ${nextDisabled ? 'class="disabled"' : ''} data-page="${currentPage + 1}"><i class="fas fa-arrow-right"></i></a></li>
    `);
    
    // Add event listeners to pagination links
    const paginationLinks = paginationContainer.querySelectorAll('a[data-page]');
    paginationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = parseInt(this.getAttribute('data-page'));
            if (page >= 1 && page <= totalPages && page !== currentPage) {
                // Scroll to top of products section
                const productsSection = document.querySelector('.space-top.space-extra2-bottom');
                if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                }
                
                // Load the new page
                loadProductsFromCentralData(page);
            }
        });
    });
}