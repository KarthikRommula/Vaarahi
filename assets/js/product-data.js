/**
 * Central Product Data Repository
 * 
 * This file serves as the single source of truth for all product information
 * across the VAARAHI E-commerce website. Any changes to product data should
 * be made here, and they will automatically reflect across all pages.
 */

// Define the global product data object
const globalProductData = {
    'medicine': {
        id: 'medicine',
        name: 'Medicine',
        price: 177.85,
        oldPrice: null,
        image: 'assets/img/product/product_1_1.png',
        description: 'Prepare to embark on a sensory journey with the Bosco Apple, a fruit that transcends the ordinary and promises an unparalleled taste experience. These apples are nothing short of nature\'s masterpiece, celebrated for their distinctive blend of flavors and their captivating visual allure.',
        sku: 'Medicine-fits-chevy-camaro',
        category: 'Vitamin & Medicine',
        tags: ['Medicine', 'Drug'],
        featured: true,
        hot: true,
        new: false,
        sale: false,
        reviews: 120,
        rating: 5
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
        tags: ['Books', 'Reading'],
        featured: false,
        hot: true,
        new: false,
        sale: false,
        reviews: 120,
        rating: 5
    },
    'chair': {
        id: 'chair',
        name: 'Chair',
        price: 98.85,
        oldPrice: 109.99,
        image: 'assets/img/product/product_1_4.png',
        description: 'Comfortable seating solution for your home or office. Built with durability in mind while maintaining an aesthetically pleasing design.',
        sku: 'chair-basic',
        category: 'Furniture',
        tags: ['Chair', 'Furniture'],
        featured: false,
        hot: false,
        new: false,
        sale: true,
        reviews: 120,
        rating: 5
    },
    'chair-2': {
        id: 'chair-2',
        name: 'Chair',
        price: 32.85,
        oldPrice: null,
        image: 'assets/img/product/product_1_5.png',
        description: 'Modern chair design with premium materials for maximum comfort and durability.',
        sku: 'chair-modern',
        category: 'Furniture',
        tags: ['Chair', 'Furniture'],
        featured: true,
        hot: false,
        new: true,
        sale: false,
        reviews: 120,
        rating: 5
    },
    'table': {
        id: 'table',
        name: 'Table',
        price: 119.99,
        oldPrice: 179.99,
        image: 'assets/img/product/product_1_6.png',
        description: 'Elegant table design that complements any interior. Perfect for dining or as a workspace.',
        sku: 'table-elegant',
        category: 'Furniture',
        tags: ['Table', 'Furniture'],
        featured: true,
        hot: false,
        new: false,
        sale: true,
        reviews: 120,
        rating: 4.5
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
