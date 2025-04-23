// product-details.js - Load product details dynamically

// Product data (in a real application, this would come from a database or API)
const productData = {
    'medicine': {
        id: 'medicine',
        name: 'Medicine',
        price: 177.85,
        oldPrice: null,
        image: 'assets/img/product/product_1_1.png',
        description: 'Prepare to embark on a sensory journey with the Bosco Apple, a fruit that transcends the ordinary and promises an unparalleled taste experience. These apples are nothing short of nature\'s masterpiece, celebrated for their distinctive blend of flavors and their captivating visual allure.',
        sku: 'Medicine-fits-chevy-camaro',
        category: 'Vitamin & Medicine',
        tags: ['Medicine', 'Drug']
    },
    'dress': {
        id: 'dress',
        name: 'Dress',
        price: 39.85,
        oldPrice: null,
        image: 'assets/img/product/product_1_2.png',
        description: 'This elegant dress combines modern design with traditional craftsmanship. Perfect for any occasion, featuring premium materials and attention to detail that makes it stand out from ordinary garments.',
        sku: 'dress-elegant-style',
        category: 'Clothing',
        tags: ['Dress', 'Fashion']
    },
    'books': {
        id: 'books',
        name: 'Books',
        price: 96.85,
        oldPrice: null,
        image: 'assets/img/product/product_1_3.png',
        description: 'A collection of timeless classics and modern bestsellers. These carefully curated books offer knowledge, entertainment, and inspiration for readers of all ages.',
        sku: 'books-collection',
        category: 'Literature',
        tags: ['Books', 'Reading']
    },
    'chair': {
        id: 'chair',
        name: 'Chair',
        price: 8.85,
        oldPrice: 6.99,
        image: 'assets/img/product/product_1_4.png',
        description: 'Comfortable seating solution for your home or office. Built with durability in mind while maintaining an aesthetically pleasing design.',
        sku: 'chair-basic',
        category: 'Furniture',
        tags: ['Chair', 'Furniture']
    },
    'chair-2': {
        id: 'chair-2',
        name: 'Chair',
        price: 32.85,
        oldPrice: null,
        image: 'assets/img/product/product_1_5.png',
        description: 'Stylish chair for modern homes. Contemporary design meets comfort in this beautifully crafted seating solution.',
        sku: 'chair-modern',
        category: 'Furniture',
        tags: ['Chair', 'Modern']
    },
    'baby-dress': {
        id: 'baby-dress',
        name: 'Baby Dress',
        price: 30.85,
        oldPrice: null,
        image: 'assets/img/product/product_1_6.png',
        description: 'Adorable and comfortable dress for your little one. Made with soft, skin-friendly materials perfect for babies.',
        sku: 'baby-dress-cute',
        category: 'Baby Clothing',
        tags: ['Baby', 'Dress']
    },
    'comfort-chair': {
        id: 'comfort-chair',
        name: 'Comfort Chair',
        price: 232.85,
        oldPrice: null,
        image: 'assets/img/product/product_1_7.png',
        description: 'Premium comfort chair with ergonomic design. Experience ultimate relaxation with this expertly crafted chair featuring advanced lumbar support.',
        sku: 'comfort-chair-premium',
        category: 'Furniture',
        tags: ['Chair', 'Comfort']
    },
    'short-table': {
        id: 'short-table',
        name: 'Short Table',
        price: 30.85,
        oldPrice: null,
        image: 'assets/img/product/product_1_8.png',
        description: 'Compact table perfect for small spaces. Versatile and functional, ideal for apartments or as a side table.',
        sku: 'short-table-compact',
        category: 'Furniture',
        tags: ['Table', 'Furniture']
    },
    'cloths': {
        id: 'cloths',
        name: 'Cloths',
        price: 32.85,
        oldPrice: null,
        image: 'assets/img/product/product_1_9.png',
        description: 'High-quality cloths for everyday use. Durable and absorbent materials that maintain their quality wash after wash.',
        sku: 'cloths-pack',
        category: 'Clothing',
        tags: ['Cloths', 'Fashion']
    },
    'hat': {
        id: 'hat',
        name: 'Hat',
        price: 30.85,
        oldPrice: null,
        image: 'assets/img/product/product_1_10.png',
        description: 'Stylish hat for all seasons. Provides protection from the sun while adding a fashionable touch to any outfit.',
        sku: 'hat-stylish',
        category: 'Accessories',
        tags: ['Hat', 'Fashion']
    },
    'shoes': {
        id: 'shoes',
        name: 'Shoes',
        price: 232.85,
        oldPrice: null,
        image: 'assets/img/product/product_1_11.png',
        description: 'Premium quality shoes for ultimate comfort. Handcrafted with the finest materials for durability and style.',
        sku: 'shoes-premium',
        category: 'Footwear',
        tags: ['Shoes', 'Fashion']
    },
    'jacket': {
        id: 'jacket',
        name: 'Jacket',
        price: 30.85,
        oldPrice: null,
        image: 'assets/img/product/product_1_12.png',
        description: 'Stylish jacket for cold weather. Keeps you warm without compromising on style, featuring modern design elements.',
        sku: 'jacket-winter',
        category: 'Clothing',
        tags: ['Jacket', 'Fashion']
    }
};

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
                            <a href="wishlist.html" class="icon-btn"><i class="far fa-heart"></i></a>
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