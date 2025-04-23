// update-product-links.js - Updates product links to include product IDs

// Function to update product links
function updateProductLinks() {
    // Get all product links
    const productLinks = document.querySelectorAll('.product-title a');
    
    productLinks.forEach(link => {
        // Get the current href
        const currentHref = link.getAttribute('href');
        
        // If the link already has a product ID parameter, skip it
        if (currentHref.includes('?id=')) {
            return;
        }
        
        // Get product name from the link text
        const productName = link.textContent.trim();
        
        // Convert product name to ID format (lowercase and replace spaces with hyphens)
        let productId = productName.toLowerCase().replace(/\s+/g, '-');
        
        // Special handling for "Chair" products since we have multiple chairs
        if (productName === 'Chair') {
            // Check if this is the second chair (with price $32.85)
            const product = link.closest('.th-product');
            const priceText = product ? product.querySelector('.price').textContent : '';
            if (priceText.includes('32.85')) {
                productId = 'chair-2';
            } else if (priceText.includes('232.85')) {
                productId = 'comfort-chair';
            }
        }
        
        // Update href to include product ID
        link.setAttribute('href', `shop-details.html?id=${productId}`);
    });
    
    // Also update Quick View functionality to show correct product
    updateQuickViewFunctionality();
}

// Update Quick View functionality to show correct product data
function updateQuickViewFunctionality() {
    document.querySelectorAll('.popup-content').forEach(button => {
        button.addEventListener('click', function(e) {
            // Get product data
            const product = button.closest('.th-product');
            if (!product) return;
            
            const name = product.querySelector('.product-title a').textContent;
            let productId = name.toLowerCase().replace(/\s+/g, '-');
            
            // Special handling for "Chair" products
            if (name === 'Chair') {
                const priceText = product.querySelector('.price').textContent;
                if (priceText.includes('32.85')) {
                    productId = 'chair-2';
                } else if (priceText.includes('232.85')) {
                    productId = 'comfort-chair';
                }
            }
            
            // Get product data from our database
            const productData = {
                'medicine': {
                    name: 'Medicine',
                    price: 177.85,
                    image: 'assets/img/product/product_1_1.png',
                    description: 'High-quality medicine for optimal health.',
                    sku: 'medicine'
                },
                'dress': {
                    name: 'Dress',
                    price: 39.85,
                    image: 'assets/img/product/product_1_2.png',
                    description: 'Elegant dress for any occasion.',
                    sku: 'dress'
                },
                'books': {
                    name: 'Books',
                    price: 96.85,
                    image: 'assets/img/product/product_1_3.png',
                    description: 'Collection of bestselling books.',
                    sku: 'books'
                },
                'chair': {
                    name: 'Chair',
                    price: 8.85,
                    oldPrice: 6.99,
                    image: 'assets/img/product/product_1_4.png',
                    description: 'Comfortable chair for home or office.',
                    sku: 'chair'
                },
                'baby-dress': {
                    name: 'Baby Dress',
                    price: 30.85,
                    image: 'assets/img/product/product_1_6.png',
                    description: 'Cute and comfortable baby dress.',
                    sku: 'baby-dress'
                },
                'comfort-chair': {
                    name: 'Comfort Chair',
                    price: 232.85,
                    image: 'assets/img/product/product_1_7.png',
                    description: 'Premium comfort chair with ergonomic design.',
                    sku: 'comfort-chair'
                },
                'short-table': {
                    name: 'Short Table',
                    price: 30.85,
                    image: 'assets/img/product/product_1_8.png',
                    description: 'Compact table for small spaces.',
                    sku: 'short-table'
                },
                'cloths': {
                    name: 'Cloths',
                    price: 32.85,
                    image: 'assets/img/product/product_1_9.png',
                    description: 'Quality cloths for everyday use.',
                    sku: 'cloths'
                },
                'hat': {
                    name: 'Hat',
                    price: 30.85,
                    image: 'assets/img/product/product_1_10.png',
                    description: 'Stylish hat for all seasons.',
                    sku: 'hat'
                },
                'shoes': {
                    name: 'Shoes',
                    price: 232.85,
                    image: 'assets/img/product/product_1_11.png',
                    description: 'Premium shoes for comfort and style.',
                    sku: 'shoes'
                },
                'jacket': {
                    name: 'Jacket',
                    price: 30.85,
                    image: 'assets/img/product/product_1_12.png',
                    description: 'Warm jacket for cold weather.',
                    sku: 'jacket'
                }
            };
            
            // Update Quick View modal content
            const quickView = document.querySelector('#QuickView');
            if (quickView && productData[productId]) {
                const productInfo = productData[productId];
                quickView.querySelector('.product-title').textContent = productInfo.name;
                quickView.querySelector('.price').textContent = `$${productInfo.price.toFixed(2)}`;
                quickView.querySelector('.product-big-img img').src = productInfo.image;
                quickView.querySelector('.text').textContent = productInfo.description;
                quickView.querySelector('.sku').textContent = productInfo.sku;
                
                // Set data on the Add to Cart button for cart functionality
                const addToCartBtn = quickView.querySelector('.th-btn');
                if (addToCartBtn) {
                    addToCartBtn.setAttribute('data-product-id', productId);
                    addToCartBtn.setAttribute('data-product-name', productInfo.name);
                    addToCartBtn.setAttribute('data-product-price', productInfo.price);
                    addToCartBtn.setAttribute('data-product-image', productInfo.image);
                }
            }
        });
    });
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', updateProductLinks);