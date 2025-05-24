/**
 * VAARAHI E-commerce Profile Management
 * This script handles user profile functionality including:
 * - Loading profile data
 * - Updating profile information
 * - Saving address details for checkout auto-fill
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize profile page
    initProfilePage();
    
    // Add event listeners for profile actions
    setupEventListeners();
});

/**
 * Initialize the profile page
 */
function initProfilePage() {
    // Load user profile data
    loadProfileData();
    
    // Load order history if available
    loadOrderHistory();
    
    // Load activity data
    loadActivityData();
}

/**
 * Set up event listeners for profile actions
 */
function setupEventListeners() {
    // Edit profile button
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            // Populate edit form with current data
            populateEditForm();
            
            // Show edit profile modal
            const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
            editProfileModal.show();
        });
    }
    
    // Save profile button
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfileChanges);
    }
    
    // Change password form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handlePasswordChange);
    }
    
    // Save preferences button
    const savePreferencesBtn = document.getElementById('savePreferencesBtn');
    if (savePreferencesBtn) {
        savePreferencesBtn.addEventListener('click', saveUserPreferences);
    }
    
    // Create sample order button (for demo purposes)
    const createSampleOrderBtn = document.getElementById('createSampleOrderBtn');
    if (createSampleOrderBtn) {
        createSampleOrderBtn.addEventListener('click', createSampleOrder);
    }
    
    // Password strength meter
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', updatePasswordStrength);
    }
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkMode');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', toggleDarkMode);
        
        // Set initial state
        const currentUser = auth.getCurrentUser();
        if (currentUser && currentUser.preferences && currentUser.preferences.darkMode) {
            darkModeToggle.checked = true;
            document.body.classList.add('dark-mode');
        }
    }
}

/**
 * Load user profile data
 */
function loadProfileData() {
    // Get current user
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update profile information
    document.getElementById('infoName').textContent = currentUser.name || 'Not provided';
    document.getElementById('infoEmail').textContent = currentUser.email || 'Not provided';
    document.getElementById('infoPhone').textContent = currentUser.phone || 'Not provided';
    
    // Format join date
    const joinDate = currentUser.joinDate ? new Date(currentUser.joinDate) : null;
    document.getElementById('infoJoined').textContent = joinDate ? joinDate.toLocaleDateString() : 'Unknown';
    
    // Update address information
    document.getElementById('infoAddress').textContent = currentUser.address || 'No address saved';
    document.getElementById('infoCity').textContent = currentUser.city || '-';
    document.getElementById('infoState').textContent = currentUser.state || '-';
    document.getElementById('infoPostalCode').textContent = currentUser.postalCode || '-';
    document.getElementById('infoCountry').textContent = currentUser.country || '-';
    
    // Update preferences if available
    if (currentUser.preferences) {
        document.getElementById('emailNotifications').checked = currentUser.preferences.emailNotifications || false;
        document.getElementById('smsNotifications').checked = currentUser.preferences.smsNotifications || false;
        document.getElementById('darkMode').checked = currentUser.preferences.darkMode || false;
        document.getElementById('showRecommendations').checked = currentUser.preferences.showRecommendations !== undefined ? 
            currentUser.preferences.showRecommendations : true;
    }
}

/**
 * Load order history
 */
function loadOrderHistory() {
    // Get current user
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return;
    
    // Get all orders
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Filter orders for current user
    const userOrders = orders.filter(order => 
        order.customer && order.customer.email === currentUser.email
    );
    
    // Update order history table
    const orderHistoryTable = document.getElementById('orderHistoryTable');
    const noOrdersMessage = document.getElementById('noOrdersMessage');
    
    if (userOrders.length > 0) {
        // Hide no orders message
        if (noOrdersMessage) noOrdersMessage.style.display = 'none';
        
        // Clear table
        orderHistoryTable.innerHTML = '';
        
        // Add orders to table
        userOrders.forEach(order => {
            const orderDate = new Date(order.date).toLocaleDateString();
            const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${orderDate}</td>
                <td>${itemCount} item(s)</td>
                <td>₹${order.total.toFixed(2)}</td>
                <td><span class="badge bg-success">${order.status}</span></td>
            `;
            orderHistoryTable.appendChild(row);
        });
    } else {
        // Show no orders message
        if (noOrdersMessage) noOrdersMessage.style.display = 'block';
        
        // Clear table
        orderHistoryTable.innerHTML = '<tr><td colspan="5" class="text-center">No orders found</td></tr>';
    }
}

/**
 * Load activity data
 */
function loadActivityData() {
    // Get current user
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return;
    
    // Update last login time
    const lastLogin = currentUser.lastLogin ? new Date(currentUser.lastLogin) : null;
    document.getElementById('lastLoginTime').textContent = lastLogin ? 
        lastLogin.toLocaleString() : 'Never';
    
    // Update last profile update time
    const lastProfileUpdate = currentUser.lastProfileUpdate ? new Date(currentUser.lastProfileUpdate) : null;
    document.getElementById('lastProfileUpdate').textContent = lastProfileUpdate ? 
        lastProfileUpdate.toLocaleString() : 'Never';
    
    // Update cart item count
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    document.getElementById('cartItemCount').textContent = cartItems.length;
    
    // Update wishlist item count
    const wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];
    document.getElementById('wishlistItemCount').textContent = wishlistItems.length;
}

/**
 * Populate edit form with current user data
 */
function populateEditForm() {
    // Get current user
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return;
    
    // Populate form fields
    document.getElementById('editName').value = currentUser.name || '';
    document.getElementById('editEmail').value = currentUser.email || '';
    document.getElementById('editPhone').value = currentUser.phone || '';
    document.getElementById('editAddress').value = currentUser.address || '';
    document.getElementById('editCity').value = currentUser.city || '';
    document.getElementById('editState').value = currentUser.state || '';
    document.getElementById('editPostalCode').value = currentUser.postalCode || '';
    
    // Set country if it exists in the dropdown
    const countrySelect = document.getElementById('editCountry');
    if (countrySelect && currentUser.country) {
        for (let i = 0; i < countrySelect.options.length; i++) {
            if (countrySelect.options[i].value === currentUser.country) {
                countrySelect.selectedIndex = i;
                break;
            }
        }
    }
}

/**
 * Save profile changes
 */
function saveProfileChanges() {
    // Get form data
    const profileData = {
        name: document.getElementById('editName').value,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value,
        address: document.getElementById('editAddress').value,
        city: document.getElementById('editCity').value,
        state: document.getElementById('editState').value,
        postalCode: document.getElementById('editPostalCode').value,
        country: document.getElementById('editCountry').value,
        lastProfileUpdate: new Date().toISOString()
    };
    
    // Update user profile
    auth.updateUserProfile(profileData);
    
    // Hide modal
    const editProfileModal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
    if (editProfileModal) {
        editProfileModal.hide();
    }
    
    // Reload profile data
    loadProfileData();
    
    // Show success message
    showNotification('Profile updated successfully!', 'success');
}

/**
 * Handle password change
 * @param {Event} e - Form submit event
 */
function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Please fill in all password fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    // Verify current password
    if (!auth.verifyPassword(currentPassword)) {
        showNotification('Current password is incorrect', 'error');
        return;
    }
    
    // Update password
    auth.updatePassword(newPassword);
    
    // Clear form
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
    // Show success message
    showNotification('Password changed successfully!', 'success');
}

/**
 * Save user preferences
 */
function saveUserPreferences() {
    const preferences = {
        emailNotifications: document.getElementById('emailNotifications').checked,
        smsNotifications: document.getElementById('smsNotifications').checked,
        darkMode: document.getElementById('darkMode').checked,
        showRecommendations: document.getElementById('showRecommendations').checked
    };
    
    // Update user preferences
    auth.updateUserPreferences(preferences);
    
    // Apply dark mode if enabled
    if (preferences.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // Show success message
    showNotification('Preferences saved successfully!', 'success');
}

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
    const darkModeEnabled = document.getElementById('darkMode').checked;
    
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

/**
 * Update password strength meter
 */
function updatePasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const strengthBar = document.getElementById('passwordStrengthBar');
    const feedback = document.getElementById('passwordFeedback');
    
    if (!password) {
        strengthBar.style.width = '0%';
        feedback.textContent = '';
        return;
    }
    
    // Calculate password strength
    let strength = 0;
    let feedback_text = '';
    
    // Length check
    if (password.length >= 8) {
        strength += 25;
    } else {
        feedback_text = 'Password should be at least 8 characters';
    }
    
    // Uppercase check
    if (/[A-Z]/.test(password)) {
        strength += 25;
    } else if (!feedback_text) {
        feedback_text = 'Add uppercase letters';
    }
    
    // Lowercase check
    if (/[a-z]/.test(password)) {
        strength += 25;
    } else if (!feedback_text) {
        feedback_text = 'Add lowercase letters';
    }
    
    // Number/special char check
    if (/[0-9!@#$%^&*]/.test(password)) {
        strength += 25;
    } else if (!feedback_text) {
        feedback_text = 'Add numbers or special characters';
    }
    
    // Update strength bar
    strengthBar.style.width = strength + '%';
    
    // Update color based on strength
    if (strength < 50) {
        strengthBar.className = 'password-strength-meter-bar weak';
        if (!feedback_text) feedback_text = 'Weak password';
    } else if (strength < 75) {
        strengthBar.className = 'password-strength-meter-bar medium';
        if (!feedback_text) feedback_text = 'Medium strength password';
    } else if (strength < 100) {
        strengthBar.className = 'password-strength-meter-bar strong';
        if (!feedback_text) feedback_text = 'Strong password';
    } else {
        strengthBar.className = 'password-strength-meter-bar very-strong';
        feedback_text = 'Very strong password';
    }
    
    // Update feedback text
    feedback.textContent = feedback_text;
}

/**
 * Create a sample order for demonstration purposes
 */
function createSampleOrder() {
    // Get current user
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return;
    
    // Create sample cart items
    const sampleItems = [
        {
            id: 'product_1',
            name: 'Handcrafted Wooden Bowl',
            price: 1200,
            quantity: 1,
            image: 'assets/img/product/product1.jpg'
        },
        {
            id: 'product_2',
            name: 'Traditional Embroidered Scarf',
            price: 850,
            quantity: 2,
            image: 'assets/img/product/product2.jpg'
        }
    ];
    
    // Calculate totals
    const subtotal = sampleItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 1000 ? 0 : 100;
    const total = subtotal + shipping;
    
    // Create order object
    const order = {
        id: 'ORD' + Date.now(),
        date: new Date().toISOString(),
        customer: {
            firstName: currentUser.name.split(' ')[0],
            lastName: currentUser.name.split(' ').slice(1).join(' '),
            email: currentUser.email,
            phone: currentUser.phone || '',
            address: currentUser.address || '',
            city: currentUser.city || '',
            state: currentUser.state || '',
            pincode: currentUser.postalCode || ''
        },
        items: sampleItems,
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        status: 'completed'
    };
    
    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Reload order history
    loadOrderHistory();
    
    // Show success message
    showNotification('Sample order created successfully!', 'success');
}

/**
 * Show notification message
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // Check if notification system is available
    if (typeof notificationSystem !== 'undefined') {
        notificationSystem.showNotification(message, type);
    } else {
        // Fallback to alert
        alert(message);
    }
}
