import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cross-platform secure storage utility for handling sensitive payment information.
 * - On mobile, uses SecureStore (which leverages Keychain/Keystore)
 * - On web, falls back to localStorage with encryption
 * 
 * IMPORTANT: This utility should NEVER store full card numbers or CVVs
 * to maintain PCI compliance. Only store tokens and non-sensitive data.
 */

// Prefix for all secure storage keys
const SECURE_STORAGE_PREFIX = 'PETCOAPP_SECURE_';

// Web platform encryption key (in production, this would be from an environment variable)
const ENCRYPTION_KEY = 'YourSecretEncryptionKey'; // In production, use a proper key management system

// Basic encryption for web platform (for demo purposes - use a proper encryption library in production)
const encryptData = (data: string): string => {
  if (Platform.OS !== 'web') return data;
  
  // This is a simplified implementation for demo purposes
  // In production, use a proper encryption library like CryptoJS
  const encodedData = btoa(data);
  return encodedData; 
};

// Basic decryption for web platform (for demo purposes - use a proper encryption library in production)
const decryptData = (encryptedData: string): string => {
  if (Platform.OS !== 'web') return encryptedData;
  
  // This is a simplified implementation for demo purposes
  try {
    const decodedData = atob(encryptedData);
    return decodedData;
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    return '';
  }
};

/**
 * Securely saves a value to storage
 * @param key The storage key
 * @param value The value to store
 * @returns Promise resolving to true if successful
 */
export const secureSet = async (key: string, value: string): Promise<boolean> => {
  const secureKey = `${SECURE_STORAGE_PREFIX}${key}`;
  
  try {
    if (Platform.OS === 'web') {
      // Web implementation using localStorage with encryption
      localStorage.setItem(secureKey, encryptData(value));
      return true;
    } else {
      // Mobile implementation using SecureStore
      await SecureStore.setItemAsync(secureKey, value);
      return true;
    }
  } catch (error) {
    console.error(`Error storing secure value for key ${key}:`, error);
    return false;
  }
};

/**
 * Retrieves a securely stored value
 * @param key The storage key
 * @returns Promise resolving to the stored value or null if not found
 */
export const secureGet = async (key: string): Promise<string | null> => {
  const secureKey = `${SECURE_STORAGE_PREFIX}${key}`;
  
  try {
    if (Platform.OS === 'web') {
      // Web implementation using localStorage with encryption
      const encryptedValue = localStorage.getItem(secureKey);
      if (!encryptedValue) return null;
      return decryptData(encryptedValue);
    } else {
      // Mobile implementation using SecureStore
      return await SecureStore.getItemAsync(secureKey);
    }
  } catch (error) {
    console.error(`Error retrieving secure value for key ${key}:`, error);
    return null;
  }
};

/**
 * Removes a securely stored value
 * @param key The storage key
 * @returns Promise resolving to true if successful
 */
export const secureRemove = async (key: string): Promise<boolean> => {
  const secureKey = `${SECURE_STORAGE_PREFIX}${key}`;
  
  try {
    if (Platform.OS === 'web') {
      // Web implementation using localStorage
      localStorage.removeItem(secureKey);
      return true;
    } else {
      // Mobile implementation using SecureStore
      await SecureStore.deleteItemAsync(secureKey);
      return true;
    }
  } catch (error) {
    console.error(`Error removing secure value for key ${key}:`, error);
    return false;
  }
};

/**
 * PAYMENT-SPECIFIC METHODS
 * These methods are specifically designed for payment data to ensure PCI compliance
 */

// Keys for various payment-related data
const STRIPE_PUBLISHABLE_KEY = 'stripe_publishable_key';
const PAYMENT_TOKENS = 'payment_tokens';
const DEFAULT_PAYMENT_METHOD = 'default_payment_method';
const MERCHANT_ID = 'merchant_id';

/**
 * Stores the Stripe publishable key securely
 */
export const setStripePublishableKey = async (key: string): Promise<boolean> => {
  return await secureSet(STRIPE_PUBLISHABLE_KEY, key);
};

/**
 * Retrieves the Stripe publishable key
 */
export const getStripePublishableKey = async (): Promise<string | null> => {
  return await secureGet(STRIPE_PUBLISHABLE_KEY);
};

/**
 * Stores a payment method token securely
 * Only store tokens, never full card details
 */
export const savePaymentToken = async (
  userId: string, 
  paymentMethodId: string,
  metadata: {
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  }
): Promise<boolean> => {
  try {
    // First get existing tokens
    const existingTokensJson = await secureGet(`${PAYMENT_TOKENS}_${userId}`);
    const existingTokens = existingTokensJson ? JSON.parse(existingTokensJson) : {};
    
    // Add the new token with metadata
    existingTokens[paymentMethodId] = {
      id: paymentMethodId,
      last4: metadata.last4,
      brand: metadata.brand,
      expiryMonth: metadata.expiryMonth,
      expiryYear: metadata.expiryYear,
      createdAt: new Date().toISOString(),
    };
    
    // Save updated tokens
    await secureSet(`${PAYMENT_TOKENS}_${userId}`, JSON.stringify(existingTokens));
    return true;
  } catch (error) {
    console.error('Error saving payment token:', error);
    return false;
  }
};

/**
 * Gets all payment tokens for a user
 */
export const getPaymentTokens = async (userId: string): Promise<Record<string, any> | null> => {
  try {
    const tokensJson = await secureGet(`${PAYMENT_TOKENS}_${userId}`);
    return tokensJson ? JSON.parse(tokensJson) : null;
  } catch (error) {
    console.error('Error retrieving payment tokens:', error);
    return null;
  }
};

/**
 * Sets the default payment method for a user
 */
export const setDefaultPaymentMethod = async (
  userId: string,
  paymentMethodId: string
): Promise<boolean> => {
  return await secureSet(`${DEFAULT_PAYMENT_METHOD}_${userId}`, paymentMethodId);
};

/**
 * Gets the default payment method for a user
 */
export const getDefaultPaymentMethod = async (
  userId: string
): Promise<string | null> => {
  return await secureGet(`${DEFAULT_PAYMENT_METHOD}_${userId}`);
};

/**
 * Removes a payment method token
 */
export const removePaymentToken = async (
  userId: string,
  paymentMethodId: string
): Promise<boolean> => {
  try {
    const existingTokensJson = await secureGet(`${PAYMENT_TOKENS}_${userId}`);
    if (!existingTokensJson) return false;
    
    const existingTokens = JSON.parse(existingTokensJson);
    if (existingTokens[paymentMethodId]) {
      delete existingTokens[paymentMethodId];
      await secureSet(`${PAYMENT_TOKENS}_${userId}`, JSON.stringify(existingTokens));
      
      // Also check if this was the default method and clear if needed
      const defaultMethod = await getDefaultPaymentMethod(userId);
      if (defaultMethod === paymentMethodId) {
        await secureRemove(`${DEFAULT_PAYMENT_METHOD}_${userId}`);
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error removing payment token:', error);
    return false;
  }
};

/**
 * Stores the Apple/Google Pay merchant ID securely
 */
export const setMerchantId = async (merchantId: string): Promise<boolean> => {
  return await secureSet(MERCHANT_ID, merchantId);
};

/**
 * Retrieves the merchant ID for mobile payment platforms
 */
export const getMerchantId = async (): Promise<string | null> => {
  return await secureGet(MERCHANT_ID);
};

export default {
  secureSet,
  secureGet,
  secureRemove,
  setStripePublishableKey,
  getStripePublishableKey,
  savePaymentToken,
  getPaymentTokens,
  setDefaultPaymentMethod,
  getDefaultPaymentMethod,
  removePaymentToken,
  setMerchantId,
  getMerchantId,
};