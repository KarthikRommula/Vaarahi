/**
 * Currency Utility Functions
 * 
 * This file provides utility functions for currency formatting
 * across the VAARAHI E-commerce website.
 */

// Currency symbol to use throughout the site
const CURRENCY_SYMBOL = '₹';

/**
 * Format a price with the rupee symbol
 * @param {number} price - The price to format
 * @param {boolean} showDecimal - Whether to show decimal places (default: true)
 * @returns {string} - Formatted price with rupee symbol
 */
function formatPrice(price, showDecimal = true) {
    // Convert price to a valid number
    const numPrice = parseFloat(price) || 0;
    
    // Format with Indian numbering system (commas at thousands, lakhs, crores)
    return CURRENCY_SYMBOL + formatIndianNumber(numPrice, showDecimal);
}

/**
 * Format a number using the Indian numbering system (with commas)
 * @param {number} num - The number to format
 * @param {boolean} showDecimal - Whether to show decimal places
 * @returns {string} - Formatted number with commas
 */
function formatIndianNumber(num, showDecimal = true) {
    // Convert to a valid number
    const numValue = parseFloat(num) || 0;
    
    // Format with 2 decimal places if showDecimal is true
    const formattedNum = showDecimal ? numValue.toFixed(2) : Math.floor(numValue).toString();
    
    // Split the number into integer and decimal parts
    const parts = formattedNum.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? '.' + parts[1] : '';
    
    // Format the integer part with commas for Indian numbering system
    // (e.g., 10,00,000 instead of 1,000,000)
    let formattedInteger = '';
    let counter = 0;
    
    // Process from right to left
    for (let i = integerPart.length - 1; i >= 0; i--) {
        counter++;
        formattedInteger = integerPart[i] + formattedInteger;
        
        // Add commas according to Indian numbering system
        if (i !== 0 && counter === 3 && integerPart.length > 3) {
            formattedInteger = ',' + formattedInteger;
            counter = 0;
        } else if (i !== 0 && counter === 2 && formattedInteger.includes(',')) {
            formattedInteger = ',' + formattedInteger;
            counter = 0;
        }
    }
    
    // Combine integer and decimal parts
    return formattedInteger + decimalPart;
}

// Export functions for use in other files
window.CurrencyUtils = {
    formatPrice,
    formatIndianNumber,
    CURRENCY_SYMBOL
};
