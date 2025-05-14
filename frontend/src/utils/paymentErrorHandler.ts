import { analytics } from '../lib/analytics';

/**
 * Enum representing different types of payment errors
 */
export enum PaymentErrorType {
  CARD_DECLINED = 'card_declined',
  AUTHENTICATION_FAILED = 'authentication_failed',
  INSUFFICIENT_FUNDS = 'insufficient_funds',
  EXPIRED_CARD = 'expired_card',
  INVALID_CARD = 'invalid_card',
  PROCESSOR_DECLINED = 'processor_declined',
  CURRENCY_NOT_SUPPORTED = 'currency_not_supported',
  DUPLICATE_TRANSACTION = 'duplicate_transaction',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  GENERIC_DECLINE = 'generic_decline',
  NETWORK_ERROR = 'network_error',
  UNKNOWN = 'unknown'
}

/**
 * Interface for payment error details
 */
export interface PaymentErrorDetails {
  code: PaymentErrorType;
  message: string;
  declineCode?: string;
  statusCode?: number;
  requestId?: string;
  cardInfo?: {
    brand?: string;
    last4?: string;
    expMonth?: number;
    expYear?: number;
  };
  raw?: any;
}

/**
 * Interface for the retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  backoffFactor: number;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  delayMs: 1000,
  backoffFactor: 1.5
};

/**
 * Maps error types to user-friendly messages
 */
const ERROR_MESSAGES: Record<PaymentErrorType, string> = {
  [PaymentErrorType.CARD_DECLINED]: 'Your card was declined. Please try a different payment method.',
  [PaymentErrorType.AUTHENTICATION_FAILED]: 'Payment authentication failed. Please try again.',
  [PaymentErrorType.INSUFFICIENT_FUNDS]: 'Your card has insufficient funds. Please use a different card.',
  [PaymentErrorType.EXPIRED_CARD]: 'Your card has expired. Please update your card information.',
  [PaymentErrorType.INVALID_CARD]: 'The card information provided is invalid. Please check and try again.',
  [PaymentErrorType.PROCESSOR_DECLINED]: 'The payment processor declined this transaction. Please try again later.',
  [PaymentErrorType.CURRENCY_NOT_SUPPORTED]: 'The currency is not supported by this payment method.',
  [PaymentErrorType.DUPLICATE_TRANSACTION]: 'This appears to be a duplicate transaction. Please check if the payment was already processed.',
  [PaymentErrorType.RATE_LIMIT_EXCEEDED]: 'Too many payment attempts. Please try again later.',
  [PaymentErrorType.GENERIC_DECLINE]: 'The payment was declined. Please try a different payment method.',
  [PaymentErrorType.NETWORK_ERROR]: 'Network error occurred. Please check your connection and try again.',
  [PaymentErrorType.UNKNOWN]: 'An unknown error occurred. Please try again later.'
};

/**
 * Maps error types to recovery suggestions
 */
const RECOVERY_SUGGESTIONS: Record<PaymentErrorType, string> = {
  [PaymentErrorType.CARD_DECLINED]: 'Try using a different card or contact your bank for details.',
  [PaymentErrorType.AUTHENTICATION_FAILED]: 'Ensure you complete the authentication process from your bank.',
  [PaymentErrorType.INSUFFICIENT_FUNDS]: 'Try using a different card with sufficient balance.',
  [PaymentErrorType.EXPIRED_CARD]: 'Update your card details with a valid expiration date.',
  [PaymentErrorType.INVALID_CARD]: 'Double-check the card number, expiration date, and CVV.',
  [PaymentErrorType.PROCESSOR_DECLINED]: 'Wait a few moments and try again or use a different payment method.',
  [PaymentErrorType.CURRENCY_NOT_SUPPORTED]: 'Try using a different payment method that supports this currency.',
  [PaymentErrorType.DUPLICATE_TRANSACTION]: 'Check if your payment was already processed before retrying.',
  [PaymentErrorType.RATE_LIMIT_EXCEEDED]: 'Wait a few minutes before trying again.',
  [PaymentErrorType.GENERIC_DECLINE]: 'Contact your bank or try a different payment method.',
  [PaymentErrorType.NETWORK_ERROR]: 'Check your internet connection and try again.',
  [PaymentErrorType.UNKNOWN]: 'Contact support if the problem persists.'
};

/**
 * Parse raw error responses from payment processors into standardized format
 */
export function parsePaymentError(error: any): PaymentErrorDetails {
  // Default to unknown error
  let parsedError: PaymentErrorDetails = {
    code: PaymentErrorType.UNKNOWN,
    message: ERROR_MESSAGES[PaymentErrorType.UNKNOWN],
    raw: error
  };

  try {
    // Handle Stripe-like errors
    if (error?.type === 'StripeCardError') {
      const declineCode = error.decline_code || error.code;
      
      if (declineCode === 'insufficient_funds') {
        parsedError.code = PaymentErrorType.INSUFFICIENT_FUNDS;
      } else if (declineCode === 'authentication_required') {
        parsedError.code = PaymentErrorType.AUTHENTICATION_FAILED;
      } else if (declineCode === 'expired_card') {
        parsedError.code = PaymentErrorType.EXPIRED_CARD;
      } else if (declineCode === 'invalid_card') {
        parsedError.code = PaymentErrorType.INVALID_CARD;
      } else if (declineCode === 'duplicate_transaction') {
        parsedError.code = PaymentErrorType.DUPLICATE_TRANSACTION;
      } else {
        parsedError.code = PaymentErrorType.CARD_DECLINED;
      }
      
      parsedError.declineCode = declineCode;
      parsedError.requestId = error.request_id;
      parsedError.message = ERROR_MESSAGES[parsedError.code];
      
      if (error.payment_method?.card) {
        parsedError.cardInfo = {
          brand: error.payment_method.card.brand,
          last4: error.payment_method.card.last4,
          expMonth: error.payment_method.card.exp_month,
          expYear: error.payment_method.card.exp_year
        };
      }
    }
    // Handle network errors
    else if (error?.message?.includes('network') || error?.message?.includes('Network') || error?.message?.includes('connection')) {
      parsedError.code = PaymentErrorType.NETWORK_ERROR;
      parsedError.message = ERROR_MESSAGES[PaymentErrorType.NETWORK_ERROR];
    }
    // Handle rate limit errors
    else if (error?.statusCode === 429 || error?.message?.includes('rate limit') || error?.message?.includes('too many requests')) {
      parsedError.code = PaymentErrorType.RATE_LIMIT_EXCEEDED;
      parsedError.message = ERROR_MESSAGES[PaymentErrorType.RATE_LIMIT_EXCEEDED];
      parsedError.statusCode = 429;
    }

  } catch (parseError) {
    console.error('Error parsing payment error:', parseError);
    // Use default unknown error
  }

  return parsedError;
}

/**
 * Get a user-friendly error message for a payment error
 */
export function getUserFriendlyErrorMessage(errorType: PaymentErrorType): string {
  return ERROR_MESSAGES[errorType] || ERROR_MESSAGES[PaymentErrorType.UNKNOWN];
}

/**
 * Get a recovery suggestion based on error type
 */
export function getRecoverySuggestion(errorType: PaymentErrorType): string {
  return RECOVERY_SUGGESTIONS[errorType] || RECOVERY_SUGGESTIONS[PaymentErrorType.UNKNOWN];
}

/**
 * Log payment errors to the console and analytics
 */
export function logPaymentError(errorDetails: PaymentErrorDetails, context?: Record<string, any>): void {
  // Log to console
  console.error('[Payment Error]', errorDetails.code, errorDetails.message, errorDetails);
  
  // Log to analytics
  analytics.track('payment_error', {
    error_type: errorDetails.code,
    error_message: errorDetails.message,
    decline_code: errorDetails.declineCode,
    status_code: errorDetails.statusCode,
    request_id: errorDetails.requestId,
    card_info: errorDetails.cardInfo ? {
      brand: errorDetails.cardInfo.brand,
      last4: errorDetails.cardInfo.last4,
      exp_month: errorDetails.cardInfo.expMonth,
      exp_year: errorDetails.cardInfo.expYear
    } : undefined,
    context: context
  });
}

/**
 * Format an error for displaying to the user with recovery suggestion
 */
export function formatErrorForUser(errorDetails: PaymentErrorDetails): {
  message: string;
  suggestion: string;
} {
  return {
    message: getUserFriendlyErrorMessage(errorDetails.code),
    suggestion: getRecoverySuggestion(errorDetails.code)
  };
}

/**
 * Report error to a monitoring service
 */
export function reportToMonitoring(errorDetails: PaymentErrorDetails, context?: Record<string, any>): void {
  // This function would integrate with your error monitoring service (Sentry, LogRocket, etc.)
  // For now, just console logging as a placeholder
  console.warn('[Payment Error Reporting]', {
    type: 'payment_error',
    error_code: errorDetails.code,
    error_message: errorDetails.message,
    request_id: errorDetails.requestId,
    context: context
  });
  
  // Example integration with Sentry (commented out)
  // if (Sentry) {
  //   Sentry.captureEvent({
  //     level: 'error',
  //     message: `Payment Error: ${errorDetails.code}`,
  //     extra: {
  //       errorDetails,
  //       context
  //     }
  //   });
  // }
}

/**
 * Retry a payment function with exponential backoff
 */
export async function retryPayment<T>(
  paymentFn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;
  let attempt = 0;
  
  while (attempt < retryConfig.maxRetries) {
    try {
      return await paymentFn();
    } catch (error) {
      lastError = error;
      const parsedError = parsePaymentError(error);
      
      // Don't retry for these error types
      if ([
        PaymentErrorType.INSUFFICIENT_FUNDS,
        PaymentErrorType.EXPIRED_CARD,
        PaymentErrorType.INVALID_CARD,
        PaymentErrorType.CARD_DECLINED,
        PaymentErrorType.PROCESSOR_DECLINED
      ].includes(parsedError.code)) {
        break;
      }
      
      // Only retry for network errors and rate limits
      if ([
        PaymentErrorType.NETWORK_ERROR,
        PaymentErrorType.RATE_LIMIT_EXCEEDED,
        PaymentErrorType.UNKNOWN
      ].includes(parsedError.code)) {
        attempt++;
        if (attempt < retryConfig.maxRetries) {
          const delay = retryConfig.delayMs * Math.pow(retryConfig.backoffFactor, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      break;
    }
  }
  
  throw lastError;
}

/**
 * Handle card decline scenarios
 */
export function handleCardDecline(error: any, context?: Record<string, any>): {
  errorDetails: PaymentErrorDetails;
  userMessage: string;
  suggestion: string;
} {
  const errorDetails = parsePaymentError(error);
  logPaymentError(errorDetails, context);
  reportToMonitoring(errorDetails, context);
  
  const formattedError = formatErrorForUser(errorDetails);
  
  return {
    errorDetails,
    userMessage: formattedError.message,
    suggestion: formattedError.suggestion
  };
}

/**
 * Handle authentication failure scenarios
 */
export function handleAuthenticationFailure(error: any, context?: Record<string, any>): {
  errorDetails: PaymentErrorDetails;
  userMessage: string;
  suggestion: string;
  requiresRedirect: boolean;
} {
  const errorDetails = parsePaymentError(error);
  logPaymentError(errorDetails, context);
  reportToMonitoring(errorDetails, context);
  
  const formattedError = formatErrorForUser(errorDetails);
  const requiresRedirect = error?.payment_intent?.status === 'requires_action';
  
  return {
    errorDetails,
    userMessage: formattedError.message,
    suggestion: formattedError.suggestion,
    requiresRedirect
  };
}

/**
 * Handle insufficient funds scenarios
 */
export function handleInsufficientFunds(error: any, context?: Record<string, any>): {
  errorDetails: PaymentErrorDetails;
  userMessage: string;
  suggestion: string;
  showAlternativePaymentOptions: boolean;
} {
  const errorDetails = parsePaymentError(error);
  logPaymentError(errorDetails, context);
  reportToMonitoring(errorDetails, context);
  
  const formattedError = formatErrorForUser(errorDetails);
  
  return {
    errorDetails,
    userMessage: formattedError.message,
    suggestion: formattedError.suggestion,
    showAlternativePaymentOptions: true
  };
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  const errorDetails = parsePaymentError(error);
  return [
    PaymentErrorType.NETWORK_ERROR,
    PaymentErrorType.RATE_LIMIT_EXCEEDED,
    PaymentErrorType.UNKNOWN
  ].includes(errorDetails.code);
}