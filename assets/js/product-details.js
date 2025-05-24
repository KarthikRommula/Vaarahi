// product-details.js - Load product details dynamically

// Use the centralized product data from product-data.js
// The productData variable is kept for backward compatibility
let productData = {};

// Initialize product data when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // If the global ProductData is available, use it to populate productData
    if (window.ProductData) {
        // Get all products from the central repository
        const allProducts = window.ProductData.getAllProducts();
        
        // Convert array to object with product IDs as keys
        allProducts.forEach(product => {
            productData[product.id] = product;
        });
    }
    
    // Load product details based on URL parameter
    loadProductDetails();
});

// Function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Function to load product details
function loadProductDetails() {
    // Get product ID from URL
    const productId = getUrlParameter('id');
    
    console.log('Loading product:', productId); // Debug line
    
    // Get product data
    const product = productData[productId];
    
    // If product not found, show error and redirect after 3 seconds
    if (!product) {
        console.error('Product not found:', productId);
        document.querySelector('.product-title').textContent = 'Product Not Found';
        setTimeout(() => {
            window.location.href = 'products.html';
        }, 3000);
        return;
    }
    
    console.log('Product data:', product); // Debug line
    
    // Update all product elements
    // Update product title
    const titleElements = document.querySelectorAll('.product-title');
    titleElements.forEach(el => el.textContent = product.name);
    
    // Update product image
    const imageElements = document.querySelectorAll('.product-big-img img');
    imageElements.forEach(el => el.setAttribute('src', product.image));
    
    // Update product description
    const descriptionElements = document.querySelectorAll('.product-about .text');
    descriptionElements.forEach(el => el.textContent = product.description);
    
    // Update SKU
    const skuElements = document.querySelectorAll('.sku');
    skuElements.forEach(el => el.textContent = product.sku);
    
    // Update price
    const priceElements = document.querySelectorAll('.product-about .price');
    priceElements.forEach(el => {
        if (product.oldPrice) {
            el.innerHTML = `$${product.price.toFixed(2)}<del>$${product.oldPrice.toFixed(2)}</del>`;
        } else {
            el.textContent = `$${product.price.toFixed(2)}`;
        }
    });
    
    // Update category
    const categoryElements = document.querySelectorAll('.posted_in a');
    categoryElements.forEach(el => {
        el.textContent = product.category;
        el.href = `products.html?category=${encodeURIComponent(product.category)}`;
    });
    
    // Update tags
    const tagsContainers = document.querySelectorAll('.product_meta > span:last-child');
    tagsContainers.forEach(container => {
        const tagsHTML = product.tags.map(tag => 
            `<a href="products.html?tag=${encodeURIComponent(tag)}">${tag}</a>`
        ).join('');
        container.innerHTML = `Tags: ${tagsHTML}`;
    });
    
    // Update page title
    document.title = `VAARAHI - ${product.name}`;
    
    // Update breadcrumb
    const breadcrumbTitle = document.querySelector('.breadcumb-title');
    if (breadcrumbTitle) {
        breadcrumbTitle.textContent = product.name;
    }
    
    // Update description tab content
    const descriptionTabContent = document.querySelector('#description p');
    if (descriptionTabContent) {
        descriptionTabContent.textContent = product.description;
    }
    
    // Update related products to exclude current product
    updateRelatedProducts(productId);
}

// Function to update related products
function updateRelatedProducts(currentProductId) {
    const relatedProductsContainer = document.querySelector('#productSlider1 .swiper-wrapper');
    if (!relatedProductsContainer) return;
    
    // Get all products except current
    const relatedProducts = Object.values(productData).filter(p => p.id !== currentProductId);
    
    // Clear existing related products
    relatedProductsContainer.innerHTML = '';
    
    // Add related products
    relatedProducts.forEach(product => {
        const productHTML = `
            <div class="swiper-slide">
                <div class="th-product product-grid">
                    <div class="product-img">
                        <img src="${product.image}" alt="Product Image">
                        <span class="product-tag">${product.oldPrice ? 'Sale' : 'New'}</span>
                        <div class="actions">
                            <a href="#QuickView" class="icon-btn popup-content"><i class="far fa-eye"></i></a>
                            <a href="cart.html" class="icon-btn"><i class="far fa-cart-plus"></i></a>
                        </div>
                    </div>
                    <div class="product-content">
                        <h3 class="product-title"><a href="shop-details.html?id=${product.id}">${product.name}</a></h3>
                        <span class="price">$${product.price.toFixed(2)}${product.oldPrice ? `<del>$${product.oldPrice.toFixed(2)}</del>` : ''}</span>
                        <div class="woocommerce-product-rating">
                            <span class="count">(120 Reviews)</span>
                            <div class="star-rating" role="img" aria-label="Rated 5.00 out of 5">
                                <span>Rated <strong class="rating">5.00</strong> out of 5 based on <span class="rating">1</span> customer rating</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        relatedProductsContainer.insertAdjacentHTML('beforeend', productHTML);
    });
    
    // Reinitialize swiper if needed
    if (window.productSlider) {
        window.productSlider.update();
    }
}

// Load product details when page loads
document.addEventListener('DOMContentLoaded', loadProductDetails);

// Also run when the page becomes visible (for back/forward navigation)
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        loadProductDetails();
    }
});