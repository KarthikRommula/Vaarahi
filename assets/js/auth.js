/**
 * Authentication System for VAARAHI E-commerce
 * Handles user registration, login, logout, and authentication state
 */

// Initialize auth system
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuthState();
    
    // Initialize login form if on login page
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Initialize signup form if on register page
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Initialize logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

/**
 * Check authentication state and update UI accordingly
 */
function checkAuthState() {
    const currentUser = getCurrentUser();
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userDropdown = document.getElementById('userDropdown');
    const userNameDisplay = document.getElementById('userNameDisplay');
    
    if (currentUser) {
        // User is logged in
        if (loginBtn) loginBtn.classList.add('d-none');
        if (registerBtn) registerBtn.classList.add('d-none');
        if (userDropdown) {
            userDropdown.classList.remove('d-none');
            if (userNameDisplay) {
                userNameDisplay.textContent = currentUser.name;
            }
        }
        
        // Update mobile menu as well
        const mobileLoginLink = document.querySelector('.th-mobile-menu .menu-item-has-children');
        if (mobileLoginLink) {
            const submenu = mobileLoginLink.querySelector('.sub-menu');
            if (submenu) {
                // Update the mobile menu to show profile instead of login/register
                mobileLoginLink.querySelector('a').textContent = currentUser.name;
                // Update submenu to include profile and logout
                if (!submenu.querySelector('a[href="profile.html"]')) {
                    submenu.innerHTML = `
                        <li><a href="cart.html">Cart <span class="badge bg-primary ms-2">0</span></a></li>
                        <li><a href="profile.html">My Profile</a></li>
                        <li><a href="#" id="mobileLogoutBtn">Logout</a></li>
                    `;
                    // Add event listener to mobile logout button
                    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
                    if (mobileLogoutBtn) {
                        mobileLogoutBtn.addEventListener('click', handleLogout);
                    }
                }
            }
        }
    } else {
        // User is not logged in
        if (loginBtn) loginBtn.classList.remove('d-none');
        if (registerBtn) registerBtn.classList.remove('d-none');
        if (userDropdown) userDropdown.classList.add('d-none');
        
        // Reset mobile menu
        const mobileLoginLink = document.querySelector('.th-mobile-menu .menu-item-has-children');
        if (mobileLoginLink) {
            mobileLoginLink.querySelector('a').textContent = 'My Account';
            const submenu = mobileLoginLink.querySelector('.sub-menu');
            if (submenu) {
                submenu.innerHTML = `
                    <li><a href="cart.html">Cart <span class="badge bg-primary ms-2">0</span></a></li>
                    <li><a href="login.html">Login</a></li>
                    <li><a href="register.html">Register</a></li>
                `;
            }
        }
    }
}

/**
 * Handle login form submission
 * @param {Event} e - Form submit event
 */
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe') ? document.getElementById('rememberMe').checked : false;
    
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    
    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('vaarahiUsers')) || [];
    
    // First check if the email exists
    const userWithEmail = users.find(u => u.email === email);
    
    if (!userWithEmail) {
        // Show alert for email not found
        const loginAlert = document.getElementById('loginAlert');
        if (loginAlert) {
            loginAlert.classList.remove('d-none', 'alert-success');
            loginAlert.classList.add('alert-danger');
            loginAlert.textContent = 'No account found with this email. Please check your email or register.';
        } else {
            alert('No account found with this email. Please check your email or register.');
        }
        return;
    }
    
    // Then check if the password matches
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Update last login time
        user.lastLogin = new Date().toISOString();
        
        // Update user in localStorage
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex] = user;
            localStorage.setItem('vaarahiUsers', JSON.stringify(users));
        }
        
        // Login successful
        loginUser(user, rememberMe);
        
        // Show success message
        const loginAlert = document.getElementById('loginAlert');
        if (loginAlert) {
            loginAlert.classList.remove('d-none', 'alert-danger');
            loginAlert.classList.add('alert-success');
            loginAlert.textContent = 'Login successful! Redirecting...';
        }
        
        // Redirect to home page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        // Password is incorrect
        const loginAlert = document.getElementById('loginAlert');
        if (loginAlert) {
            loginAlert.classList.remove('d-none', 'alert-success');
            loginAlert.classList.add('alert-danger');
            loginAlert.textContent = 'Incorrect password. Please try again.';
        } else {
            alert('Incorrect password. Please try again.');
        }
    }
}

/**
 * Handle signup form submission
 * @param {Event} e - Form submit event
 */
function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('fullName').value; // Changed from 'name' to 'fullName'
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('vaarahiUsers')) || [];
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
        alert('User with this email already exists');
        return;
    }
    
    const now = new Date().toISOString();
    
    // Create new user
    const newUser = {
        id: generateUserId(),
        name,
        email,
        password,
        joinDate: now,
        lastLogin: now,
        lastProfileUpdate: now,
        orders: [],
        preferences: {
            emailNotifications: true,
            smsNotifications: false
        },
        // Initialize address fields
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
    };
    
    // Add user to localStorage
    users.push(newUser);
    localStorage.setItem('vaarahiUsers', JSON.stringify(users));
    
    // Login the new user
    loginUser(newUser, true);
    
    // Show success message and redirect
    alert('Registration successful! You are now logged in.');
    window.location.href = 'index.html';
}

/**
 * Handle user logout
 * @param {Event} e - Click event
 */
function handleLogout(e) {
    e.preventDefault();
    
    // Clear auth data
    localStorage.removeItem('vaarahiCurrentUser');
    sessionStorage.removeItem('vaarahiCurrentUser');
    
    // Show success message
    showNotification('You have been logged out successfully.', 'success');
    
    // Redirect to homepage after a short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

/**
 * Login a user and store their data
 * @param {Object} user - User data
 * @param {boolean} rememberMe - Whether to remember the user
 */
function loginUser(user, rememberMe) {
    // Create a copy of user data without the password for security
    const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
    };
    
    // Store user data based on remember me preference
    if (rememberMe) {
        localStorage.setItem('vaarahiCurrentUser', JSON.stringify(userData));
    } else {
        sessionStorage.setItem('vaarahiCurrentUser', JSON.stringify(userData));
    }
}

/**
 * Get current logged in user
 * @returns {Object|null} - Current user data or null if not logged in
 */
function getCurrentUser() {
    // Check localStorage first, then sessionStorage
    const localUser = localStorage.getItem('vaarahiCurrentUser');
    const sessionUser = sessionStorage.getItem('vaarahiCurrentUser');
    
    let userData = localUser ? JSON.parse(localUser) : (sessionUser ? JSON.parse(sessionUser) : null);
    
    // If we have a user, get the complete user data from vaarahiUsers to ensure we have all fields
    if (userData) {
        const users = JSON.parse(localStorage.getItem('vaarahiUsers')) || [];
        const fullUserData = users.find(u => u.id === userData.id);
        
        if (fullUserData) {
            // Ensure we have all address fields needed for checkout
            userData = {
                ...userData,
                address: fullUserData.address || '',
                city: fullUserData.city || '',
                state: fullUserData.state || '',
                postalCode: fullUserData.postalCode || '',
                country: fullUserData.country || '',
                phone: fullUserData.phone || ''
            };
        }
    }
    
    return userData;
}

/**
 * Generate a unique user ID
 * @returns {string} - Unique ID
 */
function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Check if user is authenticated before adding to cart
 * @returns {boolean} - Whether user is authenticated
 */
function requireAuth() {
    if (!getCurrentUser()) {
        showNotification('Please login or register to add items to your cart.', 'warning');
        // Redirect to login page after a short delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return false;
    }
    return true;
}

/**
 * Update user profile information
 * @param {Object} profileData - New profile data
 */
function updateUserProfile(profileData) {
    if (!profileData) return;
    
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Update user data in localStorage/sessionStorage
    const updatedUser = {
        ...currentUser,
        name: profileData.name || currentUser.name,
        email: profileData.email || currentUser.email,
        phone: profileData.phone || currentUser.phone,
        // Add address fields
        address: profileData.address !== undefined ? profileData.address : currentUser.address,
        city: profileData.city !== undefined ? profileData.city : currentUser.city,
        state: profileData.state !== undefined ? profileData.state : currentUser.state,
        postalCode: profileData.postalCode !== undefined ? profileData.postalCode : currentUser.postalCode,
        country: profileData.country !== undefined ? profileData.country : currentUser.country,
        // Add activity tracking
        lastProfileUpdate: profileData.lastProfileUpdate || new Date().toISOString()
    };
    
    // Update in localStorage or sessionStorage based on where it was stored
    if (localStorage.getItem('vaarahiCurrentUser')) {
        localStorage.setItem('vaarahiCurrentUser', JSON.stringify(updatedUser));
    } else if (sessionStorage.getItem('vaarahiCurrentUser')) {
        sessionStorage.setItem('vaarahiCurrentUser', JSON.stringify(updatedUser));
    }
    
    // Also update in the users array in localStorage
    const users = JSON.parse(localStorage.getItem('vaarahiUsers')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex] = {
            ...users[userIndex],
            name: profileData.name || users[userIndex].name,
            email: profileData.email || users[userIndex].email,
            phone: profileData.phone || users[userIndex].phone,
            // Add address fields
            address: profileData.address !== undefined ? profileData.address : users[userIndex].address,
            city: profileData.city !== undefined ? profileData.city : users[userIndex].city,
            state: profileData.state !== undefined ? profileData.state : users[userIndex].state,
            postalCode: profileData.postalCode !== undefined ? profileData.postalCode : users[userIndex].postalCode,
            country: profileData.country !== undefined ? profileData.country : users[userIndex].country,
            // Add activity tracking
            lastProfileUpdate: profileData.lastProfileUpdate || new Date().toISOString()
        };
        localStorage.setItem('vaarahiUsers', JSON.stringify(users));
    }
    
    // Update UI
    updateAuthUI();
}

/**
 * Update user password
 * @param {string} newPassword - New password
 */
function updatePassword(newPassword) {
    if (!newPassword) return;
    
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Update password in the users array in localStorage
    const users = JSON.parse(localStorage.getItem('vaarahiUsers')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('vaarahiUsers', JSON.stringify(users));
    }
}

/**
 * Verify user password
 * @param {string} password - Password to verify
 * @returns {boolean} - Whether password is correct
 */
function verifyPassword(password) {
    if (!password) return false;
    
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    // Get full user data including password from localStorage
    const users = JSON.parse(localStorage.getItem('vaarahiUsers')) || [];
    const user = users.find(u => u.id === currentUser.id);
    
    if (!user) return false;
    
    // Verify password (in a real app, this would use proper password hashing)
    return user.password === password;
}

/**
 * Update user preferences
 * @param {Object} preferences - User preferences
 */
function updateUserPreferences(preferences) {
    if (!preferences) return;
    
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Update user preferences in localStorage/sessionStorage
    const updatedUser = {
        ...currentUser,
        preferences: preferences
    };
    
    // Update in localStorage or sessionStorage based on where it was stored
    if (localStorage.getItem('vaarahiCurrentUser')) {
        localStorage.setItem('vaarahiCurrentUser', JSON.stringify(updatedUser));
    } else if (sessionStorage.getItem('vaarahiCurrentUser')) {
        sessionStorage.setItem('vaarahiCurrentUser', JSON.stringify(updatedUser));
    }
    
    // Also update in the users array in localStorage
    const users = JSON.parse(localStorage.getItem('vaarahiUsers')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex].preferences = preferences;
        localStorage.setItem('vaarahiUsers', JSON.stringify(users));
    }
}

/**
 * Check if user is logged in
 * @returns {boolean} - Whether user is logged in
 */
function isLoggedIn() {
    return !!getCurrentUser();
}

/**
 * Update UI based on authentication status
 */
function updateAuthUI() {
    checkAuthState();
}

/**
 * Add a sample order to the current user (for testing purposes)
 */
function addSampleOrder() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('vaarahiUsers')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) return;
    
    // Create a sample order if the user has no orders
    if (!users[userIndex].orders || users[userIndex].orders.length === 0) {
        const sampleOrder = {
            id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
            date: new Date().toISOString(),
            items: '2 items',
            total: 129.99,
            status: ['Processing', 'Shipped', 'Completed', 'Cancelled'][Math.floor(Math.random() * 4)]
        };
        
        users[userIndex].orders = [sampleOrder];
        localStorage.setItem('vaarahiUsers', JSON.stringify(users));
        
        // Update current user in session
        if (localStorage.getItem('vaarahiCurrentUser')) {
            currentUser.orders = [sampleOrder];
            localStorage.setItem('vaarahiCurrentUser', JSON.stringify(currentUser));
        } else if (sessionStorage.getItem('vaarahiCurrentUser')) {
            currentUser.orders = [sampleOrder];
            sessionStorage.setItem('vaarahiCurrentUser', JSON.stringify(currentUser));
        }
        
        return sampleOrder;
    }
    
    return null;
}

// Make functions available globally
window.auth = {
    checkAuthState,
    getCurrentUser,
    requireAuth,
    handleLogout,
    updateUserProfile,
    updatePassword,
    verifyPassword,
    updateUserPreferences,
    isLoggedIn,
    updateAuthUI,
    addSampleOrder
};
