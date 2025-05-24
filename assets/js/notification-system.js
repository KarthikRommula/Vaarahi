/**
 * notification-system.js - Centralized notification system for the entire website
 * This file provides a consistent notification style across all pages
 */

// Global notification variables
// Check if variables are already defined to prevent duplicate declarations
if (typeof globalNotificationTimeout === 'undefined') {
    var globalNotificationTimeout;
}

if (typeof notificationElement === 'undefined') {
    var notificationElement = null;
}

// Clear any existing notifications when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Remove any existing notifications that might be stuck
    const existingNotifications = document.querySelectorAll('.th-notification, #global-notification');
    existingNotifications.forEach(notification => {
        if (notification && notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
    
    console.log('Notification system initialized');
});

/**
 * Shows a notification with a consistent style across the website
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, warning, info)
 * @param {number} duration - How long to show the notification in milliseconds
 */
function showNotification(message, type = 'success', duration = 3000) {
    console.log('Showing notification:', message, type); // Debug log
    
    // Create a unique notification ID for the entire website
    const notificationId = 'global-notification';
    
    // Create notification element if it doesn't exist
    let notification = document.getElementById(notificationId);
    if (!notification) {
        notification = document.createElement('div');
        notification.id = notificationId;
        notification.className = 'th-notification';
        document.body.appendChild(notification);
    }
    
    // Add the type class for CSS styling
    notification.className = 'th-notification ' + type;
    
    // Set base styles for the notification - inline styles for guaranteed display
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '8px';
    notification.style.zIndex = '9999';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    notification.style.transition = 'all 0.3s ease';
    notification.style.fontSize = '14px';
    notification.style.fontWeight = '500';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    notification.style.backgroundColor = 'white';
    notification.style.color = '#333';
    notification.style.maxWidth = '400px';
    notification.style.width = 'calc(100% - 40px)';
    
    // Clear any existing timeout to prevent premature hiding
    if (globalNotificationTimeout) {
        clearTimeout(globalNotificationTimeout);
        globalNotificationTimeout = null;
    }
    
    // Clear any previous content
    notification.innerHTML = '';
    
    // Create icon element
    const iconElement = document.createElement('div');
    iconElement.style.width = '24px';
    iconElement.style.height = '24px';
    iconElement.style.borderRadius = '50%';
    iconElement.style.display = 'flex';
    iconElement.style.alignItems = 'center';
    iconElement.style.justifyContent = 'center';
    iconElement.style.marginRight = '12px';
    iconElement.style.flexShrink = '0';
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.style.flexGrow = '1';
    
    // Create close button
    const closeButton = document.createElement('div');
    closeButton.innerHTML = '&times;';
    closeButton.style.marginLeft = '10px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '18px';
    closeButton.style.opacity = '0.7';
    closeButton.style.transition = 'opacity 0.2s';
    closeButton.style.padding = '0 5px';
    closeButton.onmouseover = () => { closeButton.style.opacity = '1'; };
    closeButton.onmouseout = () => { closeButton.style.opacity = '0.7'; };
    closeButton.onclick = () => {
        // Hide notification when close button is clicked
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
        
        // Clear the timeout
        if (globalNotificationTimeout) {
            clearTimeout(globalNotificationTimeout);
            globalNotificationTimeout = null;
        }
    };
    
    // Set styles based on notification type
    if (type === 'success') {
        notification.style.borderLeft = '4px solid #28a745';
        iconElement.style.backgroundColor = '#28a745';
        iconElement.style.color = 'white';
        iconElement.innerHTML = '✓';
    } else if (type === 'error') {
        notification.style.borderLeft = '4px solid #dc3545';
        iconElement.style.backgroundColor = '#dc3545';
        iconElement.style.color = 'white';
        iconElement.innerHTML = '×';
    } else if (type === 'warning') {
        notification.style.borderLeft = '4px solid #ffc107';
        iconElement.style.backgroundColor = '#ffc107';
        iconElement.style.color = '#212529';
        iconElement.innerHTML = '!';
    } else if (type === 'info') {
        notification.style.borderLeft = '4px solid #17a2b8';
        iconElement.style.backgroundColor = '#17a2b8';
        iconElement.style.color = 'white';
        iconElement.innerHTML = 'i';
    } else {
        // Default to success style
        notification.style.borderLeft = '4px solid #28a745';
        iconElement.style.backgroundColor = '#28a745';
        iconElement.style.color = 'white';
        iconElement.innerHTML = '✓';
    }
    
    // Append elements to notification
    notification.appendChild(iconElement);
    notification.appendChild(messageElement);
    notification.appendChild(closeButton);
    
    // Show notification with animation
    notification.style.display = 'flex';
    
    // Force a reflow to ensure the transition works
    notification.offsetHeight;
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Hide notification after specified duration
    globalNotificationTimeout = setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
        globalNotificationTimeout = null;
    }, duration);
}

// Make function globally available
window.showNotification = showNotification;
