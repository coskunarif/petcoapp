/**
 * Fee Calculator Utility
 * Handles calculations for platform fees, processing fees, and payouts
 */

// Fee tiers based on provider status
export enum FeeTier {
  STANDARD = 'standard',
  PREFERRED = 'preferred',
  PREMIUM = 'premium',
}

// Fee structure by tier
export const FEE_RATES = {
  [FeeTier.STANDARD]: 0.15, // 15%
  [FeeTier.PREFERRED]: 0.12, // 12%
  [FeeTier.PREMIUM]: 0.10, // 10%
};

// Processing fee rates (e.g., Stripe)
export const PROCESSING_FEE_PERCENTAGE = 0.029; // 2.9%
export const PROCESSING_FEE_FIXED = 0.30; // $0.30

// Provider tier criteria
export interface TierCriteria {
  completedServices: number;
  rating?: number;
  tenure?: number; // months on platform
}

export interface FeeCalculationResult {
  platformFee: number;
  processingFee: number;
  providerPayout: number;
  totalAmount: number;
}

/**
 * Gets the appropriate fee tier based on provider metrics
 */
export function getFeeTier(criteria: TierCriteria): FeeTier {
  const { completedServices, rating, tenure = 0 } = criteria;
  
  if (completedServices > 100 && (rating || 0) >= 4.8 && tenure >= 6) {
    return FeeTier.PREMIUM;
  } else if (completedServices > 50 && (rating || 0) >= 4.5 && tenure >= 3) {
    return FeeTier.PREFERRED;
  }
  
  return FeeTier.STANDARD;
}

/**
 * Calculates the platform fee taken by PetCo App
 */
export function calculatePlatformFee(
  amount: number,
  tier: FeeTier = FeeTier.STANDARD
): number {
  const feeRate = FEE_RATES[tier];
  return Number((amount * feeRate).toFixed(2));
}

/**
 * Calculates payment processing fees (e.g., Stripe)
 */
export function calculateProcessingFee(amount: number): number {
  const fee = amount * PROCESSING_FEE_PERCENTAGE + PROCESSING_FEE_FIXED;
  return Number(fee.toFixed(2));
}

/**
 * Calculates the total amount charged to the customer
 */
export function calculateTotalAmount(
  serviceAmount: number,
  includeProcessingFee: boolean = false
): number {
  if (!includeProcessingFee) {
    return serviceAmount;
  }
  
  const processingFee = calculateProcessingFee(serviceAmount);
  return Number((serviceAmount + processingFee).toFixed(2));
}

/**
 * Calculates the final amount paid to the provider
 */
export function calculateProviderPayout(
  serviceAmount: number,
  tier: FeeTier = FeeTier.STANDARD
): number {
  const platformFee = calculatePlatformFee(serviceAmount, tier);
  return Number((serviceAmount - platformFee).toFixed(2));
}

/**
 * Calculate all fees and amounts for a service
 */
export function calculateAllFees(
  serviceAmount: number,
  tier: FeeTier = FeeTier.STANDARD,
  includeProcessingFee: boolean = false
): FeeCalculationResult {
  const platformFee = calculatePlatformFee(serviceAmount, tier);
  const processingFee = includeProcessingFee ? calculateProcessingFee(serviceAmount) : 0;
  const providerPayout = serviceAmount - platformFee;
  const totalAmount = serviceAmount + (includeProcessingFee ? processingFee : 0);
  
  return {
    platformFee: Number(platformFee.toFixed(2)),
    processingFee: Number(processingFee.toFixed(2)),
    providerPayout: Number(providerPayout.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
  };
}

// Currency formatting options
export interface CurrencyFormatOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Format amount as currency string
 */
export function formatCurrency(
  amount: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    currency = 'USD',
    locale = 'en-US',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

/**
 * Format fee as percentage
 */
export function formatPercentage(
  rate: number,
  minimumFractionDigits: number = 1,
  maximumFractionDigits: number = 1
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(rate);
}

/**
 * Get fee breakdown description
 */
export function getFeeBreakdown(
  serviceAmount: number,
  tier: FeeTier = FeeTier.STANDARD,
  includeProcessingFee: boolean = false
): string {
  const { platformFee, processingFee, providerPayout, totalAmount } = 
    calculateAllFees(serviceAmount, tier, includeProcessingFee);
  
  const feePercentage = formatPercentage(FEE_RATES[tier]);
  
  let breakdown = `Service amount: ${formatCurrency(serviceAmount)}\n`;
  breakdown += `Platform fee (${feePercentage}): ${formatCurrency(platformFee)}\n`;
  
  if (includeProcessingFee) {
    breakdown += `Processing fee: ${formatCurrency(processingFee)}\n`;
  }
  
  breakdown += `Provider receives: ${formatCurrency(providerPayout)}\n`;
  breakdown += `Total amount: ${formatCurrency(totalAmount)}`;
  
  return breakdown;
}