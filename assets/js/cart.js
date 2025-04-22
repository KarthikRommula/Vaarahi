// cart.js - Manages cart functionality across the website

// Cart items storage in localStorage
let cartItems = JSON.parse(localStorage.getItem('vaarahiCart')) || [];
let cartTotal = 0;

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    calculateCartTotal(); // Calculate total first
    updateCartDisplay(); // Then update display
    setupEventListeners();
});

// Update all cart displays on the page
function updateCartDisplay() {
    // Update cart count badge
    const cartBadges = document.querySelectorAll('.sideMenuToggler .badge');
    cartBadges.forEach(badge => {
        badge.textContent = cartItems.length;
    });
    
    // Update mini cart items
    updateMiniCart();
    
    // Update cart page if we're on it
    if (window.location.href.includes('cart.html')) {
        updateCartPage();
    }
    
    // Update checkout page if we're on it
    if (window.location.href.includes('checkout.html')) {
        updateCheckoutPage();
    }
}

// Calculate cart total - separated from display updates for better performance
function calculateCartTotal() {
    cartTotal = cartItems.reduce((total, item) => {
        return total + (parseFloat(item.price) * parseInt(item.quantity));
    }, 0);
    
    // Save updated cart to localStorage
    localStorage.setItem('vaarahiCart', JSON.stringify(cartItems));
    
    return cartTotal;
}

// Update the mini cart in the sidebar
function updateMiniCart() {
    const miniCartList = document.querySelector('.woocommerce-mini-cart');
    if (!miniCartList) return;
    
    // Clear current items
    miniCartList.innerHTML = '';
    
    // Add cart items to mini cart
    cartItems.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'woocommerce-mini-cart-item mini_cart_item';
        
        // Ensure price and quantity are proper numbers for calculation
        const itemPrice = parseFloat(item.price);
        const itemQuantity = parseInt(item.quantity);
        const itemTotal = itemPrice * itemQuantity;
        
        listItem.innerHTML = `
            <a href="#" class="remove remove_from_cart_button" data-index="${index}"><i class="far fa-times"></i></a>
            <a href="#"><img src="${item.image}" alt="Cart Image">${item.name}</a>
            <span class="quantity">${itemQuantity} ×
                <span class="woocommerce-Price-amount amount">
                    <span class="woocommerce-Price-currencySymbol">$</span>${itemPrice.toFixed(2)}</span>
            </span>
        `;
        miniCartList.appendChild(listItem);
    });
    
    // Setup event listeners for remove buttons
    document.querySelectorAll('.woocommerce-mini-cart-item .remove_from_cart_button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const index = parseInt(this.getAttribute('data-index'));
            if (!isNaN(index)) {
                removeFromCart(index);
            }
        });
    });
    
    // Update mini cart total
    const miniCartTotal = document.querySelector('.woocommerce-mini-cart__total .woocommerce-Price-amount');
    if (miniCartTotal) {
        miniCartTotal.innerHTML = `<span class="woocommerce-Price-currencySymbol">$</span>${cartTotal.toFixed(2)}`;
    }
}

// Update the cart page if we're on it
function updateCartPage() {
    const cartTable = document.querySelector('.woocommerce-cart-form .cart_table tbody');
    if (!cartTable) return;
    
    // Clear current items (except the last row with actions)
    const lastRow = cartTable.querySelector('tr:last-child');
    cartTable.innerHTML = '';
    
    if (cartItems.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="6" class="text-center">
                <p>Your cart is currently empty.</p>
            </td>
        `;
        cartTable.appendChild(emptyRow);
    } else {
        // Add cart items to cart table
        cartItems.forEach((item, index) => {
            // Ensure price and quantity are proper numbers for calculation
            const itemPrice = parseFloat(item.price);
            const itemQuantity = parseInt(item.quantity);
            const itemTotal = itemPrice * itemQuantity;
            
            const row = document.createElement('tr');
            row.className = 'cart_item';
            row.innerHTML = `
                <td data-title="Product">
                    <a class="cart-productimage" href="shop-details.html"><img width="91" height="91"
                            src="${item.image}" alt="Image"></a>
                </td>
                <td data-title="Name">
                    <a class="cart-productname" href="shop-details.html">${item.name}</a>
                </td>
                <td data-title="Price">
                    <span class="amount"><bdi><span>$</span>${itemPrice.toFixed(2)}</bdi></span>
                </td>
                <td data-title="Quantity">
                    <div class="quantity">
                        <button class="quantity-minus qty-btn" data-index="${index}"><i class="far fa-minus"></i></button>
                        <input type="number" class="qty-input" value="${itemQuantity}" min="1" max="99" data-index="${index}">
                        <button class="quantity-plus qty-btn" data-index="${index}"><i class="far fa-plus"></i></button>
                    </div>
                </td>
                <td data-title="Total">
                    <span class="amount"><bdi><span>$</span>${itemTotal.toFixed(2)}</bdi></span>
                </td>
                <td data-title="Remove">
                    <a href="#" class="remove" data-index="${index}"><i class="fal fa-trash-alt"></i></a>
                </td>
            `;
            cartTable.appendChild(row);
        });
    }
    
    // Add back the action row
    if (lastRow) {
        cartTable.appendChild(lastRow);
    }
    
    // Update cart totals
    const subtotalAmount = document.querySelector('.cart_totals tbody .amount');
    const orderTotalAmount = document.querySelector('.cart_totals tfoot .amount');
    
    if (subtotalAmount) subtotalAmount.innerHTML = `<bdi><span>$</span>${cartTotal.toFixed(2)}</bdi>`;
    if (orderTotalAmount) orderTotalAmount.innerHTML = `<bdi><span>$</span>${cartTotal.toFixed(2)}</bdi>`;
}

// Update the checkout page if we're on it
function updateCheckoutPage() {
    const checkoutTable = document.querySelector('.checkout-ordertable');
    if (!checkoutTable) return;
    
    const tbody = document.querySelector('.woocommerce-cart-form .cart_table tbody');
    if (!tbody) return;
    
    // Clear current items
    tbody.innerHTML = '';
    
    // Add cart items to checkout table
    cartItems.forEach(item => {
        // Ensure price and quantity are proper numbers for calculation
        const itemPrice = parseFloat(item.price);
        const itemQuantity = parseInt(item.quantity);
        const itemTotal = itemPrice * itemQuantity;
        
        const row = document.createElement('tr');
        row.className = 'cart_item';
        row.innerHTML = `
            <td data-title="Product">
                <a class="cart-productimage" href="shop-details.html"><img width="91" height="91"
                        src="${item.image}" alt="Image"></a>
            </td>
            <td data-title="Name">
                <a class="cart-productname" href="shop-details.html">${item.name}</a>
            </td>
            <td data-title="Price">
                <span class="amount"><bdi><span>$</span>${itemPrice.toFixed(2)}</bdi></span>
            </td>
            <td data-title="Quantity">
                <strong class="product-quantity">${itemQuantity}</strong>
            </td>
            <td data-title="Total">
                <span class="amount"><bdi><span>$</span>${itemTotal.toFixed(2)}</bdi></span>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Update checkout totals
    const subtotalAmount = document.querySelector('.cart-subtotal .woocommerce-Price-amount');
    const orderTotalAmount = document.querySelector('.order-total .woocommerce-Price-amount');
    
    if (subtotalAmount) subtotalAmount.innerHTML = `<bdi><span class="woocommerce-Price-currencySymbol">$</span>${cartTotal.toFixed(2)}</bdi>`;
    if (orderTotalAmount) orderTotalAmount.innerHTML = `<bdi><span class="woocommerce-Price-currencySymbol">$</span>${cartTotal.toFixed(2)}</bdi>`;
}

// Add an item to the cart
function addToCart(productData) {
    // Ensure valid quantity and price values
    productData.quantity = parseInt(productData.quantity) || 1;
    productData.price = parseFloat(productData.price);
    
    if (isNaN(productData.price)) {
        console.error('Invalid price for product:', productData);
        return;
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(item => 
        item.id === productData.id && item.name === productData.name
    );
    
    if (existingItemIndex !== -1) {
        // Increment quantity if item exists
        cartItems[existingItemIndex].quantity += productData.quantity;
    } else {
        // Add new item to cart
        cartItems.push(productData);
    }
    
    // Calculate cart total first
    calculateCartTotal();
    
    // Then update display
    updateCartDisplay();
    
    // Show notification
    showNotification(`${productData.name} added to cart!`);
}

// Remove an item from the cart
function removeFromCart(index) {
    if (index >= 0 && index < cartItems.length) {
        // Remove the item
        cartItems.splice(index, 1);
        
        // Calculate cart total first
        calculateCartTotal();
        
        // Then update display
        updateCartDisplay();
    }
}

// Update item quantity
function updateItemQuantity(index, quantity) {
    if (index >= 0 && index < cartItems.length) {
        const newQuantity = parseInt(quantity);
        
        // Validate quantity
        if (isNaN(newQuantity) || newQuantity < 1) {
            cartItems[index].quantity = 1;
        } else {
            cartItems[index].quantity = newQuantity;
        }
        
        // Calculate cart total first
        calculateCartTotal();
        
        // Then update display
        updateCartDisplay();
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    
    
    document.body.appendChild(notification);
    
    // Remove notification after animation
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 3000);
}

// Handle Quick View popup
function setupQuickView() {
    // Quick View buttons (eye icon)
    document.querySelectorAll('.popup-content').forEach(button => {
        button.addEventListener('click', function(e) {
            // Get product data
            const product = button.closest('.th-product');
            if (!product) return;
            
            const name = product.querySelector('.product-title a').textContent;
            const priceText = product.querySelector('.price').textContent;
            // Carefully extract the price
            let price = 0;
            const priceMatch = priceText.match(/\$\s*(\d+(\.\d+)?)/);
            if (priceMatch && priceMatch[1]) {
                price = parseFloat(priceMatch[1]);
            }
            
            const image = product.querySelector('.product-img img').getAttribute('src');
            
            // Check if there's a sale price (has a del tag)
            let salePrice = '';
            if (priceText.includes('del')) {
                const regularPrice = priceText.split('<del>')[1].split('</del>')[0];
                salePrice = `<del>${regularPrice}</del>`;
            }
            
            // Update Quick View modal content
            const quickView = document.querySelector('#QuickView');
            if (quickView) {
                quickView.querySelector('.product-title').textContent = name;
                quickView.querySelector('.price').innerHTML = `$${price.toFixed(2)}${salePrice}`;
                quickView.querySelector('.product-big-img img').src = image;
                
                // Update SKU with product name
                const skuEl = quickView.querySelector('.sku');
                if (skuEl) {
                    skuEl.textContent = name.toLowerCase().replace(/\s+/g, '-');
                }
                
                // Reset quantity to 1
                const quantityInput = quickView.querySelector('.qty-input');
                if (quantityInput) {
                    quantityInput.value = 1;
                }
            }
        });
    });
}

// Setup event listeners for the cart
function setupEventListeners() {
    // Setup Quick View
    setupQuickView();
    
    // Add to cart buttons
    document.querySelectorAll('.icon-btn[href="cart.html"]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get product data
            const product = button.closest('.th-product');
            if (!product) return;
            
            const name = product.querySelector('.product-title a').textContent;
            const priceText = product.querySelector('.price').textContent;
            
            // Carefully extract the price
            let price = 0;
            const priceMatch = priceText.match(/\$\s*(\d+(\.\d+)?)/);
            if (priceMatch && priceMatch[1]) {
                price = parseFloat(priceMatch[1]);
            }
            
            const image = product.querySelector('.product-img img').getAttribute('src');
            const id = name.toLowerCase().replace(/\s+/g, '-');
            
            // Add to cart
            addToCart({
                id,
                name,
                price,
                image,
                quantity: 1
            });
        });
    });
    
    // Quick view add to cart
    document.addEventListener('click', function(e) {
        const addToCartBtn = e.target.closest('#QuickView .th-btn');
        if (addToCartBtn) {
            e.preventDefault();
            
            const quickView = document.querySelector('#QuickView');
            if (!quickView) return;
            
            const name = quickView.querySelector('.product-title').textContent;
            const priceText = quickView.querySelector('.price').textContent;
            
            // Carefully extract the price
            let price = 0;
            const priceMatch = priceText.match(/\$\s*(\d+(\.\d+)?)/);
            if (priceMatch && priceMatch[1]) {
                price = parseFloat(priceMatch[1]);
            }
            
            const image = quickView.querySelector('.product-big-img img').getAttribute('src');
            const id = quickView.querySelector('.sku').textContent || name.toLowerCase().replace(/\s+/g, '-');
            const quantityInput = quickView.querySelector('.qty-input');
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
            
            // Add to cart
            addToCart({
                id,
                name,
                price,
                image,
                quantity
            });
            
            // Close the popup after adding to cart
            const closeBtn = document.querySelector('.mfp-close');
            if (closeBtn) {
                closeBtn.click();
            }
        }
    });
    
    // Remove from cart - using event delegation for better performance
    document.addEventListener('click', function(e) {
        // Check if the clicked element is either the remove button or the icon inside it
        const removeButton = e.target.closest('.remove, .remove_from_cart_button');
        
        if (removeButton) {
            e.preventDefault();
            const index = parseInt(removeButton.getAttribute('data-index'));
            if (!isNaN(index)) {
                removeFromCart(index);
            }
        }
    });
    
    // Quantity buttons - using event delegation
    document.addEventListener('click', function(e) {
        const minusBtn = e.target.closest('.quantity-minus');
        const plusBtn = e.target.closest('.quantity-plus');
        
        if (minusBtn) {
            const index = parseInt(minusBtn.getAttribute('data-index'));
            if (isNaN(index)) return;
            
            // Get the input element
            const input = minusBtn.closest('.quantity').querySelector('.qty-input');
            
            if (input) {
                let value = parseInt(input.value) - 1;
                if (value < 1) value = 1;
                input.value = value;
                
                // Update cart item
                updateItemQuantity(index, value);
            }
        }
        
        if (plusBtn) {
            const index = parseInt(plusBtn.getAttribute('data-index'));
            if (isNaN(index)) return;
            
            // Get the input element
            const input = plusBtn.closest('.quantity').querySelector('.qty-input');
            
            if (input) {
                let value = parseInt(input.value) + 1;
                input.value = value;
                
                // Update cart item
                updateItemQuantity(index, value);
            }
        }
    });
    
    // Quantity input change
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('qty-input')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            if (!isNaN(index)) {
                updateItemQuantity(index, e.target.value);
            }
        }
    });
    
    // Update cart button
    const updateCartBtn = document.querySelector('.woocommerce-cart-form .th-btn');
    if (updateCartBtn) {
        updateCartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            calculateCartTotal(); // Calculate first
            updateCartDisplay(); // Then update display
            showNotification('Cart updated!');
        });
    }
    
    // Place order button
    const placeOrderBtn = document.querySelector('.place-order .th-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('Order placed successfully!');
            
            // Clear cart after order is placed
            cartItems = [];
            calculateCartTotal(); // Calculate first
            updateCartDisplay(); // Then update display
            
            // Redirect to home page after a delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        });
    }
}

// Initial setup when the file is loaded
calculateCartTotal(); // Calculate first
updateCartDisplay(); // Then update display