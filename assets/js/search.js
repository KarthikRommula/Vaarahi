// Define the search functionality
(function ($) {
    "use strict";

    // Search-related functions
    function initializeSearch() {
        // Products data for search
        const productsData = [
            {
                title: "Medicine",
                price: "$177.85",
                category: "Medical",
                url: "shop-details.html",
                image: "assets/img/product/product_1_1.png"
            },
            {
                title: "Dress",
                price: "$39.85",
                category: "Clothing",
                url: "shop-details.html",
                image: "assets/img/product/product_1_2.png"
            },
            {
                title: "Books",
                price: "$96.85",
                category: "Education",
                url: "shop-details.html",
                image: "assets/img/product/product_1_3.png"
            },
            {
                title: "Chair",
                price: "$08.85",
                category: "Furniture",
                url: "shop-details.html",
                image: "assets/img/product/product_1_4.png"
            },
            {
                title: "Baby Dress",
                price: "$30.85",
                category: "Children",
                url: "shop-details.html",
                image: "assets/img/product/product_1_6.png"
            },
            {
                title: "Comfort Chair",
                price: "$232.85",
                category: "Furniture",
                url: "shop-details.html",
                image: "assets/img/product/product_1_7.png"
            },
            {
                title: "Short Table",
                price: "$30.85",
                category: "Furniture",
                url: "shop-details.html",
                image: "assets/img/product/product_1_8.png"
            },
            {
                title: "Cloths",
                price: "$32.85",
                category: "Clothing",
                url: "shop-details.html",
                image: "assets/img/product/product_1_9.png"
            },
            {
                title: "Hat",
                price: "$30.85",
                category: "Accessories",
                url: "shop-details.html",
                image: "assets/img/product/product_1_10.png"
            },
            {
                title: "Shoes",
                price: "$232.85",
                category: "Footwear",
                url: "shop-details.html",
                image: "assets/img/product/product_1_11.png"
            },
            {
                title: "Jacket",
                price: "$30.85",
                category: "Clothing",
                url: "shop-details.html",
                image: "assets/img/product/product_1_12.png"
            }
        ];

        // Pages data for search
        const pagesData = [
            {
                title: "Home",
                description: "Welcome to VAARAHI - The Next Generation Farming Limited",
                url: "index.html"
            },
            {
                title: "About",
                description: "Learn about our mission, vision, and values",
                url: "about.html"
            },
            {
                title: "Products",
                description: "Browse our collection of sustainable products",
                url: "products.html"
            },
            {
                title: "Contact",
                description: "Get in touch with us for any queries",
                url: "contact.html"
            },
            {
                title: "Cart",
                description: "Your shopping cart",
                url: "cart.html"
            },
            {
                title: "Checkout",
                description: "Complete your purchase",
                url: "checkout.html"
            }
        ];

        // Create search results container if it doesn't exist
        if (!$('.search-results-container').length) {
            const resultsContainer = $('<div class="search-results-container"></div>');
            $('.popup-search-box form').append(resultsContainer);
        }

        // Add loading indicator
        function showLoading(container) {
            container.html('<div class="search-loading">Searching</div>');
        }

        // Handle search input
        $('.popup-search-box input[type="text"]').on('input', function () {
            const searchTerm = $(this).val().toLowerCase().trim();
            const resultsContainer = $('.search-results-container');

            if (searchTerm.length < 2) {
                resultsContainer.html('');
                return;
            }

            // Show loading indicator
            showLoading(resultsContainer);

            // Simulate API delay for better UX
            setTimeout(() => {
                // Search products
                const productResults = productsData.filter(product => 
                    product.title.toLowerCase().includes(searchTerm) ||
                    product.category.toLowerCase().includes(searchTerm)
                );

                // Search pages
                const pageResults = pagesData.filter(page => 
                    page.title.toLowerCase().includes(searchTerm) ||
                    page.description.toLowerCase().includes(searchTerm)
                );

                // Display results
                displaySearchResults(productResults, pageResults, resultsContainer);
            }, 300);
        });

        // Handle form submission
        $('.popup-search-box form').on('submit', function (e) {
            e.preventDefault();
            // If there are results, redirect to the first result
            const firstResult = $('.search-results-container .search-result-item:first a');
            if (firstResult.length) {
                window.location.href = firstResult.attr('href');
            }
        });

        // Close search results when clicking outside
        $(document).on('click', function (e) {
            if (!$(e.target).closest('.popup-search-box').length) {
                $('.search-results-container').html('');
            }
        });
    }

    function displaySearchResults(products, pages, container) {
        let resultHTML = '';

        if (products.length === 0 && pages.length === 0) {
            resultHTML = '<div class="no-results">No results found</div>';
        } else {
            if (pages.length > 0) {
                resultHTML += '<div class="search-category">Pages</div>';
                pages.forEach(page => {
                    resultHTML += `
                        <div class="search-result-item">
                            <a href="${page.url}">
                                <div class="search-item-content">
                                    <h4>${page.title}</h4>
                                    <p>${page.description}</p>
                                </div>
                            </a>
                        </div>
                    `;
                });
            }

            if (products.length > 0) {
                resultHTML += '<div class="search-category">Our Products</div>';
                products.forEach(product => {
                    resultHTML += `
                        <div class="search-result-item">
                            <a href="${product.url}">
                                <img src="${product.image}" alt="${product.title}">
                                <div class="search-item-content">
                                    <h4>${product.title}</h4>
                                    <span class="category">${product.category}</span>
                                    <span class="price">${product.price}</span>
                                </div>
                            </a>
                        </div>
                    `;
                });
            }
        }

        // Animate results appearance
        container.html(resultHTML);
        container.find('.search-result-item').each(function(index) {
            $(this).css('animation', `fadeInDown 0.3s ease-out ${index * 0.05}s`);
        });
    }

    // Initialize search when document is ready
    $(document).ready(function () {
        initializeSearch();
    });

})(jQuery);