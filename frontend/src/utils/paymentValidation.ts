/**
 * Payment validation utility functions
 */

/**
 * Implements the Luhn algorithm for credit card number validation
 * @param cardNumber Card number as a string
 * @returns Boolean indicating if the card number passes the Luhn check
 */
export const checkLuhn = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D/g, '');
  
  if (!digits) return false;
  
  // Luhn algorithm
  let sum = 0;
  let shouldDouble = false;
  
  // Start from the right
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
};

/**
 * Validates a credit card number
 * @param cardNumber Card number as a string
 * @returns Object with validation result and error message if applicable
 */
export const validateCardNumber = (cardNumber: string): { 
  isValid: boolean; 
  message?: string;
} => {
  // Remove non-numeric characters
  const sanitized = cardNumber.replace(/\D/g, '');
  
  // Check length
  if (sanitized.length < 13 || sanitized.length > 19) {
    return { 
      isValid: false, 
      message: 'Card number must be between 13 and 19 digits' 
    };
  }
  
  // Check using Luhn algorithm
  if (!checkLuhn(sanitized)) {
    return { 
      isValid: false, 
      message: 'Invalid card number' 
    };
  }
  
  return { isValid: true };
};

/**
 * Validates card expiry date in MM/YY format
 * @param expiryDate Expiry date string in MM/YY format
 * @returns Object with validation result and error message if applicable
 */
export const validateExpiryDate = (expiryDate: string): {
  isValid: boolean;
  message?: string;
} => {
  // Check format
  const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
  if (!regex.test(expiryDate)) {
    return {
      isValid: false,
      message: 'Expiry date must be in MM/YY format'
    };
  }
  
  const [month, year] = expiryDate.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
  const currentMonth = currentDate.getMonth() + 1; // January is 0
  
  const expiryYear = parseInt(year, 10);
  const expiryMonth = parseInt(month, 10);
  
  // Check if card is expired
  if (expiryYear < currentYear || 
      (expiryYear === currentYear && expiryMonth < currentMonth)) {
    return {
      isValid: false,
      message: 'Card has expired'
    };
  }
  
  // Check if expiry is too far in the future (10 years)
  if (expiryYear > currentYear + 10) {
    return {
      isValid: false,
      message: 'Expiry date too far in the future'
    };
  }
  
  return { isValid: true };
};

/**
 * Validates a card security code (CVV/CVC)
 * @param cvv CVV code as a string
 * @param cardType Optional card type for different length validation
 * @returns Object with validation result and error message if applicable
 */
export const validateCVV = (cvv: string, cardType?: 'amex' | 'other'): {
  isValid: boolean;
  message?: string;
} => {
  // Remove non-numeric characters
  const sanitized = cvv.replace(/\D/g, '');
  
  // American Express uses 4-digit codes, others use 3-digit
  const expectedLength = cardType === 'amex' ? 4 : 3;
  
  if (sanitized.length !== expectedLength) {
    return {
      isValid: false,
      message: `Security code must be ${expectedLength} digits`
    };
  }
  
  return { isValid: true };
};

/**
 * Validates a bank account number
 * @param accountNumber Account number as a string
 * @returns Object with validation result and error message if applicable
 */
export const validateBankAccountNumber = (accountNumber: string): {
  isValid: boolean;
  message?: string;
} => {
  // Remove spaces and hyphens
  const sanitized = accountNumber.replace(/[\s-]/g, '');
  
  // Basic validation - numeric and reasonable length
  if (!/^\d+$/.test(sanitized)) {
    return {
      isValid: false,
      message: 'Account number must contain only digits'
    };
  }
  
  // US account numbers are typically 8-17 digits
  if (sanitized.length < 8 || sanitized.length > 17) {
    return {
      isValid: false,
      message: 'Account number should be between 8 and 17 digits'
    };
  }
  
  return { isValid: true };
};

/**
 * Validates a bank routing number (US)
 * @param routingNumber Routing number as a string
 * @returns Object with validation result and error message if applicable
 */
export const validateRoutingNumber = (routingNumber: string): {
  isValid: boolean;
  message?: string;
} => {
  // Remove non-numeric characters
  const sanitized = routingNumber.replace(/\D/g, '');
  
  // US routing numbers must be 9 digits
  if (sanitized.length !== 9) {
    return {
      isValid: false,
      message: 'Routing number must be 9 digits'
    };
  }
  
  // Checksum validation for US routing numbers
  // Each digit is multiplied by a weight (3, 7, or 1)
  // The sum must be divisible by 10
  const digits = sanitized.split('').map(Number);
  const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1];
  
  const sum = digits.reduce((acc, digit, index) => {
    return acc + (digit * weights[index]);
  }, 0);
  
  if (sum % 10 !== 0) {
    return {
      isValid: false,
      message: 'Invalid routing number'
    };
  }
  
  return { isValid: true };
};

/**
 * Validates a ZIP/postal code
 * @param zipCode ZIP/postal code as a string
 * @param country Optional country code for country-specific validation
 * @returns Object with validation result and error message if applicable
 */
export const validateZipCode = (zipCode: string, country: string = 'US'): {
  isValid: boolean;
  message?: string;
} => {
  const sanitized = zipCode.trim();
  
  if (!sanitized) {
    return {
      isValid: false,
      message: 'ZIP code is required'
    };
  }
  
  // Country-specific validation
  switch (country.toUpperCase()) {
    case 'US':
      // US ZIP codes: 5 digits or 5+4
      if (!/^\d{5}(-\d{4})?$/.test(sanitized)) {
        return {
          isValid: false,
          message: 'US ZIP code must be 5 digits or 5+4 format (12345 or 12345-6789)'
        };
      }
      break;
      
    case 'CA':
      // Canadian postal codes: A1A 1A1
      if (!/^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/.test(sanitized)) {
        return {
          isValid: false,
          message: 'Canadian postal code must be in format A1A 1A1'
        };
      }
      break;
      
    case 'UK':
    case 'GB':
      // UK postcodes have various formats
      if (!/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(sanitized)) {
        return {
          isValid: false,
          message: 'UK postcode format is invalid'
        };
      }
      break;
      
    default:
      // Generic validation for other countries
      if (sanitized.length < 3 || sanitized.length > 10) {
        return {
          isValid: false,
          message: 'Postal code length is invalid'
        };
      }
  }
  
  return { isValid: true };
};