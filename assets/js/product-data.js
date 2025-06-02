/**
 * Central Product Data Repository
 * 
 * This file serves as the single source of truth for all product information
 * across the VAARAHI E-commerce website. Any changes to product data should
 * be made here, and they will automatically reflect across all pages.
 */

// Define the global product data object
const globalProductData = {
    'Multi-Grain Dryer': {
        id: 'Multi-Grain Dryer',
        name: 'Multi-Grain Dryer',
        price: 177.85,
        oldPrice: null,
        image: 'assets/img/product/product_1_1.png',
        description: 'Prepare to embark on a sensory journey with the Bosco Apple, a fruit that transcends the ordinary and promises an unparalleled taste experience. These apples are nothing short of nature\'s masterpiece, celebrated for their distinctive blend of flavors and their captivating visual allure.',
        sku: 'Multi-Grain Dryer-fits-chevy-camaro',
        category: 'Vitamin & Multi-Grain Dryer',
        tags: ['Multi-Grain Dryer', 'Drug'],
        featured: true,
        hot: true,
        new: false,
        sale: false,
        reviews: 120,
        rating: 5
    },
    'Vaarahi Agarbathi': {
        id: 'Vaarahi Agarbathi',
        name: 'Vaarahi Agarbathi',
        price: 39.85,
        oldPrice: null,
        image: 'assets/img/product/product_1_2.png',
        description: 'This elegant Vaarahi Agarbathi combines modern design with traditional craftsmanship. Perfect for any occasion, featuring premium materials and attention to detail that makes it stand out from ordinary garments.',
        sku: 'Vaarahi Agarbathi-elegant-style',
        category: 'Clothing',
        tags: ['Vaarahi Agarbathi', 'Fashion'],
        featured: false,
        hot: true,
        new: false,
        sale: false,
        reviews: 120,
        rating: 5
    },
    'Portable Onion Storage': {
        id: 'Portable Onion Storage',
        name: 'Portable Onion Storage',
        price: 96.85,
        oldPrice: null,
        image: 'assets/img/product/product_1_3.png',
        description: 'A collection of timeless classics and modern bestsellers. These carefully curated Portable Onion Storage offer knowledge, entertainment, and inspiration for readers of all ages.',
        sku: 'Portable Onion Storage-collection',
        category: 'Literature',
        tags: ['Portable Onion Storage', 'Reading'],
        featured: false,
        hot: true,
        new: false,
        sale: false,
        reviews: 120,
        rating: 5
    },
    'Grim-Reeper Binder': {
        id: 'Grim-Reeper Binder',
        name: 'Grim-Reeper Binder',
        price: 8.85,
        oldPrice: 6.99,
        image: 'assets/img/product/product_1_4.png',
        description: 'Comfortable seating solution for your home or office. Built with durability in mind while maintaining an aesthetically pleasing design.',
        sku: 'Grim-Reeper Binder-basic',
        category: 'Furniture',
        tags: ['Grim-Reeper Binder', 'Furniture'],
        featured: false,
        hot: false,
        new: false,
        sale: true,
        reviews: 120,
        rating: 5
    },
    'Insence Stick Making Machine': {
        id: 'Insence Stick Making Machine',
        name: 'Insence Stick Making Machine',
        price: 32.85,
        oldPrice: null,
        image: 'assets/img/product/product_1_5.png',
        description: 'Stylish Grim-Reeper Binder for modern homes. Contemporary design meets comfort in this beautifully crafted seating solution.',
        sku: 'Insence Stick Making Machine-modern',
        category: 'Furniture',
        tags: ['Insence Stick Making Machine', 'Modern'],
        featured: true,
        hot: false,
        new: true,
        sale: false,
        reviews: 120,
        rating: 5
    }
};

// Function to get all products
function getAllProducts() {
    return Object.values(globalProductData);
}

// Function to get a product by ID
function getProductById(productId) {
    return globalProductData[productId] || null;
}

// Function to get featured products
function getFeaturedProducts() {
    return Object.values(globalProductData).filter(product => product.featured);
}

// Function to get products by category
function getProductsByCategory(category) {
    return Object.values(globalProductData).filter(product => 
        product.category.toLowerCase() === category.toLowerCase());
}

// Function to get products by tag
function getProductsByTag(tag) {
    return Object.values(globalProductData).filter(product => 
        product.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
}

// Function to get hot products
function getHotProducts() {
    return Object.values(globalProductData).filter(product => product.hot);
}

// Function to get new products
function getNewProducts() {
    return Object.values(globalProductData).filter(product => product.new);
}

// Function to get sale products
function getSaleProducts() {
    return Object.values(globalProductData).filter(product => product.sale);
}

// Export all functions for use in other files
window.ProductData = {
    getAllProducts,
    getProductById,
    getFeaturedProducts,
    getProductsByCategory,
    getProductsByTag,
    getHotProducts,
    getNewProducts,
    getSaleProducts
};
