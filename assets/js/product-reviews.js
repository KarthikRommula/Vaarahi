// Product Reviews Management

// Store reviews in local storage
const REVIEWS_STORAGE_KEY = 'product_reviews';

// Initialize reviews array from local storage or create empty array
let productReviews = JSON.parse(localStorage.getItem(REVIEWS_STORAGE_KEY)) || {};

// Function to save reviews to local storage
function saveReviews() {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(productReviews));
}

// Function to add a new review
function addReview(productId, reviewData) {
    // Initialize product reviews array if it doesn't exist
    if (!productReviews[productId]) {
        productReviews[productId] = [];
    }
    
    // Add review with timestamp
    const review = {
        ...reviewData,
        id: Date.now(), // Unique ID based on timestamp
        date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    };
    
    // Add to beginning of array so newest reviews show first
    productReviews[productId].unshift(review);
    
    // Save to local storage
    saveReviews();
    
    return review;
}

// Function to get reviews for a product
function getProductReviews(productId) {
    return productReviews[productId] || [];
}

// Function to calculate average rating for a product
function getAverageRating(productId) {
    const reviews = getProductReviews(productId);
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
}

// Function to display reviews for the current product
function displayReviews() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || 'default-product';
    
    // Get reviews for this product
    const reviews = getProductReviews(productId);
    
    // Get the reviews container
    const reviewsContainer = document.querySelector('.comment-list');
    if (!reviewsContainer) return;
    
    // Clear existing reviews
    reviewsContainer.innerHTML = '';
    
    // If no reviews, show message
    if (reviews.length === 0) {
        reviewsContainer.innerHTML = '<li class="review th-comment-item"><div class="th-post-comment"><div class="comment-content"><p class="text">No reviews yet. Be the first to review this product!</p></div></div></li>';
        return;
    }
    
    // Add each review to the container
    reviews.forEach(review => {
        // Calculate width percentage based on rating (20% per star)
        const ratingWidth = (review.rating * 20) + '%';
        
        const reviewHtml = `
            <li class="review th-comment-item">
                <div class="th-post-comment">
                    <div class="comment-content">
                        <h4 class="name">${review.name}</h4>
                        <span class="commented-on"><i class="far fa-calendar"></i>${review.date}</span>
                        <div class="star-rating" role="img" aria-label="Rated ${review.rating} out of 5">
                            <span style="width:${ratingWidth}">Rated <strong class="rating">${review.rating}</strong> out of 5</span>
                        </div>
                        <p class="text">${review.message}</p>
                    </div>
                </div>
            </li>
        `;
        
        reviewsContainer.innerHTML += reviewHtml;
    });
    
    // Update review count in the header
    const reviewCountElements = document.querySelectorAll('.woocommerce-review-link .count');
    reviewCountElements.forEach(el => {
        el.textContent = reviews.length;
    });
    
    // Update average rating
    const avgRating = getAverageRating(productId);
    const ratingElements = document.querySelectorAll('.product-content .rating');
    ratingElements.forEach(el => {
        el.textContent = avgRating;
    });
}

// Function to handle review form submission
function setupReviewForm() {
    const reviewForm = document.querySelector('.th-comment-form');
    if (!reviewForm) return;
    
    // Enhance the review form UI
    enhanceReviewFormUI(reviewForm);
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || 'default-product';
    
    // Track selected rating
    let selectedRating = 0;
    
    // Get the star elements
    const stars = reviewForm.querySelectorAll('.rating-stars i');
    const ratingTextContainer = reviewForm.querySelector('.rating-text');
    const ratingInput = reviewForm.querySelector('input[name="rating"]');
    
    // Function to update the rating display
    function updateRating(rating) {
        selectedRating = rating;
        
        // Update the hidden input value
        if (ratingInput) {
            ratingInput.value = rating;
        }
        
        // Update the stars display
        stars.forEach((star, index) => {
            // Change to solid star if index < rating
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas');
                star.classList.add('selected');
            } else {
                star.classList.remove('fas');
                star.classList.remove('selected');
                star.classList.add('far');
            }
        });
        
        // Update the rating text
        if (rating > 0) {
            const ratingMessage = `You selected ${rating} star${rating > 1 ? 's' : ''}`;
            if (ratingTextContainer) {
                ratingTextContainer.textContent = ratingMessage;
                ratingTextContainer.classList.add('active');
            }
        } else {
            if (ratingTextContainer) {
                ratingTextContainer.textContent = '';
                ratingTextContainer.classList.remove('active');
            }
        }
    }
    
    // Add click event for each star
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            updateRating(rating);
        });
        
        // Add hover effects
        star.addEventListener('mouseenter', function() {
            const hoverRating = parseInt(this.getAttribute('data-rating'));
            
            // Update the stars display for hover effect
            stars.forEach((s, index) => {
                if (index < hoverRating) {
                    s.classList.add('hovered');
                } else {
                    s.classList.remove('hovered');
                }
            });
        });
    });
    
    // Add mouseleave event to the rating container
    const ratingContainer = reviewForm.querySelector('.rating-stars');
    if (ratingContainer) {
        ratingContainer.addEventListener('mouseleave', function() {
            // Remove hover effect from all stars
            stars.forEach(star => {
                star.classList.remove('hovered');
            });
        });
    }
    
    // Handle form submission
    const submitButton = reviewForm.querySelector('button.th-btn');
    submitButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!selectedRating) {
            showNotification('Please select a rating', 'error');
            return;
        }
        
        // Get form values
        const nameInput = reviewForm.querySelector('input[placeholder="Your Name"]');
        const emailInput = reviewForm.querySelector('input[placeholder="Your Email"]');
        const messageInput = reviewForm.querySelector('textarea');
        
        if (!nameInput.value.trim()) {
            showNotification('Please enter your name', 'error');
            nameInput.classList.add('error');
            return;
        }
        
        if (!emailInput.value.trim()) {
            showNotification('Please enter your email', 'error');
            emailInput.classList.add('error');
            return;
        }
        
        if (!messageInput.value.trim()) {
            showNotification('Please enter your review', 'error');
            messageInput.classList.add('error');
            return;
        }
        
        // Get product ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id') || 'default-product';
        
        // Create review object
        const reviewData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            message: messageInput.value.trim(),
            rating: selectedRating
        };
        
        // Add review
        addReview(productId, reviewData);
        
        // Show success message
        showNotification('Your review has been submitted!', 'success');
        
        // Reset form
        nameInput.value = '';
        emailInput.value = '';
        messageInput.value = '';
        selectedRating = 0;
        
        // Reset stars
        updateRating(0);
        
        // Refresh reviews display
        displayReviews();
    });
}

// Function to enhance the review form UI
function enhanceReviewFormUI(reviewForm) {
    // Add a modern styling to the review form
    const style = document.createElement('style');
    style.textContent = `
        .th-comment-form {
            background-color: #f9f9f9;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            margin-top: 40px;
            transition: all 0.3s ease;
        }
        
        .th-comment-form:hover {
            box-shadow: 0 8px 25px rgba(0,0,0,0.08);
        }
        
        .th-comment-form .form-title {
            margin-bottom: 25px;
            position: relative;
        }
        
        .th-comment-form .form-title:after {
            content: '';
            display: block;
            width: 50px;
            height: 3px;
            background: linear-gradient(45deg, #FFAC00, #FFD700);
            margin-top: 10px;
        }
        
        .th-comment-form .blog-inner-title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 0;
        }
        
        .th-comment-form .rating-select {
            margin-bottom: 20px;
            padding: 10px 15px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.03);
        }
        
        .th-comment-form .rating-select label {
            font-weight: 600;
            margin-right: 15px;
            color: #333;
        }
        
        .th-comment-form .stars {
            display: inline-flex;
            align-items: center;
        }
        
        .th-comment-form .stars a {
            font-size: 22px;
            color: #ccc;
            margin-right: 5px;
            transition: all 0.2s ease;
        }
        
        .th-comment-form .stars a:hover,
        .th-comment-form .stars a.hover,
        .th-comment-form .stars a.active {
            color: #FFAC00;
            transform: scale(1.2);
        }
        
        .th-comment-form .selected-rating-text {
            margin-top: 10px;
            font-size: 14px;
            color: #FFAC00;
            font-weight: 600;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .th-comment-form .form-group {
            margin-bottom: 20px;
            position: relative;
        }
        
        .th-comment-form .form-control {
            border: 2px solid #eee;
            border-radius: 8px;
            padding: 12px 15px;
            font-size: 15px;
            transition: all 0.3s ease;
        }
        
        .th-comment-form .form-control:focus {
            border-color: #FFAC00;
            box-shadow: 0 0 0 3px rgba(255, 172, 0, 0.1);
        }
        
        .th-comment-form .form-control.error {
            border-color: #ff3366;
            box-shadow: 0 0 0 3px rgba(255, 51, 102, 0.1);
        }
        
        .th-comment-form textarea.form-control {
            min-height: 150px;
            resize: vertical;
        }
        
        .th-comment-form .text-title {
            position: absolute;
            right: 15px;
            top: 12px;
            color: #aaa;
        }
        
        .th-comment-form input:focus + .text-title,
        .th-comment-form textarea:focus + .text-title {
            color: #FFAC00;
        }
        
        .th-comment-form #reviewcheck + label {
            display: flex;
            align-items: center;
            font-size: 14px;
            color: #666;
            cursor: pointer;
        }
        
        .th-comment-form #reviewcheck + label .checkmark {
            display: inline-block;
            width: 18px;
            height: 18px;
            border: 2px solid #ddd;
            border-radius: 4px;
            margin-right: 8px;
            position: relative;
        }
        
        .th-comment-form #reviewcheck:checked + label .checkmark:after {
            content: '✓';
            position: absolute;
            top: -2px;
            left: 3px;
            color: #FFAC00;
            font-weight: bold;
        }
        
        .th-comment-form .th-btn {
            padding: 12px 30px;
            font-weight: 600;
            border-radius: 8px;
            background: linear-gradient(45deg, #FFAC00, #FFD700);
            border: none;
            color: #fff;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 10px rgba(255, 172, 0, 0.2);
        }
        
        .th-comment-form .th-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(255, 172, 0, 0.3);
        }
        
        .th-comment-form .th-btn:active {
            transform: translateY(0);
        }
        
        /* Responsive adjustments */
        @media (max-width: 767px) {
            .th-comment-form {
                padding: 20px;
            }
            
            .th-comment-form .blog-inner-title {
                font-size: 20px;
            }
            
            .th-comment-form .stars a {
                font-size: 18px;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Enhance the stars to show as actual star icons
    const stars = reviewForm.querySelectorAll('.stars a');
    stars.forEach((star, index) => {
        star.innerHTML = '★';
        star.setAttribute('title', `${index + 1} star`);
    });
    
    // Add input event listeners for real-time validation
    const inputs = reviewForm.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                this.classList.remove('error');
            }
        });
    });
    
    // Enhance the submit button with loading state
    const submitButton = reviewForm.querySelector('button.th-btn');
    submitButton.innerHTML = `
        <span>Post Review</span>
        <svg class="btn-loader" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none; margin-left: 8px;">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
        </svg>
    `;
    
    // Add animation for the loading state
    const loaderStyle = document.createElement('style');
    loaderStyle.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .btn-loader {
            animation: spin 1s linear infinite;
        }
        
        .th-btn.loading span {
            opacity: 0.7;
        }
        
        .th-btn.loading .btn-loader {
            display: inline-block !important;
        }
    `;
    document.head.appendChild(loaderStyle);
    
    // Add loading state to the button during submission
    submitButton.addEventListener('click', function() {
        this.classList.add('loading');
        setTimeout(() => {
            this.classList.remove('loading');
        }, 1000);
    });
}

// Helper function to show notifications
function showNotification(message, type = 'success') {
    // Create a unique notification ID for reviews
    const notificationId = 'review-notification';
    
    // Create notification element if it doesn't exist
    if (!document.getElementById(notificationId)) {
        const notification = document.createElement('div');
        notification.id = notificationId;
        notification.className = 'th-notification';
        document.body.appendChild(notification);
    }
    
    // Clear any existing timeout to prevent premature hiding
    if (window.reviewNotificationTimeout) {
        clearTimeout(window.reviewNotificationTimeout);
    }
    
    // Update notification message and show it
    const notification = document.getElementById(notificationId);
    
    // Clear any previous content and classes
    notification.innerHTML = '';
    notification.className = 'th-notification';
    
    // Add the message text node
    const messageText = document.createTextNode(message);
    notification.appendChild(messageText);
    
    // Set class based on notification type
    notification.classList.add(type);
    
    // Show notification with animation
    notification.style.display = 'flex';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Hide notification after 3 seconds
    window.reviewNotificationTimeout = setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS for active stars
    const style = document.createElement('style');
    style.textContent = `
        .stars a.active {
            color: #FFAC00;
        }
        .stars a.hover {
            color: #FFAC00;
        }
        .stars a {
            font-size: 24px;
            margin-right: 5px;
            text-decoration: none;
            transition: color 0.2s ease;
        }
        .stars span {
            display: flex;
            align-items: center;
        }
        .selected-rating-text {
            animation: fadeIn 0.5s;
            color: #FFAC00;
            font-weight: bold;
            margin-top: 5px;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
    
    // Setup review form
    setupReviewForm();
    
    // Display reviews
    displayReviews();
});
