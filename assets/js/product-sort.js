// simple-product-sort.js - Makes the product sorting dropdown functional

document.addEventListener('DOMContentLoaded', function() {
    // Get the sorting dropdown
    const sortSelect = document.querySelector('.orderby');
    if (!sortSelect) return;
    
    // Get the product grid container
    const productGrid = document.querySelector('.row.gy-30.gx-30');
    if (!productGrid) return;
    
    // Get all product items
    const productItems = Array.from(productGrid.querySelectorAll('.col-xl-3'));
    if (productItems.length === 0) return;
    
    // Add event listener to the sort dropdown
    sortSelect.addEventListener('change', function() {
        const sortOption = this.value;
        sortProducts(sortOption);
    }); 
    
    // Function to sort products
    function sortProducts(sortOption) {
        // Get product data for sorting
        const productData = productItems.map(item => {
            // Extract price
            const priceElement = item.querySelector('.price');
            let price = 0;
            if (priceElement) {
                const priceText = priceElement.textContent;
                const priceMatch = priceText.match(/\$(\d+\.\d+)/);
                if (priceMatch) {
                    price = parseFloat(priceMatch[1]);
                }
            }
            
            // Extract reviews count for popularity
            const reviewsElement = item.querySelector('.count');
            let reviews = 0;
            if (reviewsElement) {
                const reviewsText = reviewsElement.textContent;
                const reviewsMatch = reviewsText.match(/\((\d+)/);
                if (reviewsMatch) {
                    reviews = parseInt(reviewsMatch[1]);
                }
            }
            
            // Extract rating
            const ratingElement = item.querySelector('.rating');
            let rating = 0;
            if (ratingElement) {
                const ratingText = ratingElement.textContent;
                const ratingMatch = ratingText.match(/(\d+\.\d+)/);
                if (ratingMatch) {
                    rating = parseFloat(ratingMatch[1]);
                }
            }
            
            // Random date value for date sorting (since we don't have actual dates)
            const date = Math.floor(Math.random() * 100);
            
            return {
                element: item,
                price: price,
                reviews: reviews,
                rating: rating,
                date: date
            };
        });
        
        // Sort the products based on the selected option
        switch (sortOption) {
            case 'price':
                productData.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                productData.sort((a, b) => b.price - a.price);
                break;
            case 'popularity':
                productData.sort((a, b) => b.reviews - a.reviews);
                break;
            case 'rating':
                productData.sort((a, b) => b.rating - a.rating);
                break;
            case 'date':
                productData.sort((a, b) => b.date - a.date);
                break;
            default:
                // Default sorting - restore original order
                productData.sort((a, b) => {
                    const indexA = productItems.indexOf(a.element);
                    const indexB = productItems.indexOf(b.element);
                    return indexA - indexB;
                });
        }
        
        // Remove all products from grid
        productItems.forEach(item => {
            item.remove();
        });
        
        // Re-append products in sorted order
        productData.forEach(data => {
            productGrid.appendChild(data.element);
        });
        
        // Update result count text
        updateResultCount(productData.length);
    }
    
    // Function to update the result count text
    function updateResultCount(count) {
        const resultCountElement = document.querySelector('.woocommerce-result-count');
        if (resultCountElement) {
            resultCountElement.textContent = `Showing 1–${count} of ${count} results`;
        }
    }
});