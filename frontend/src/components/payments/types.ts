export type ErrorCode = 
  | 'insufficient-funds'
  | 'card-declined' 
  | 'invalid-card'
  | 'expired-card'
  | 'processing-error'
  | 'network-error'
  | 'invalid-details'
  | 'payment-cancelled'
  | 'unknown';

export interface PaymentErrorHandlerProps {
  /**
   * The type of error that occurred
   * @default 'unknown'
   */
  errorCode?: ErrorCode;
  
  /**
   * Callback function to retry the payment
   */
  onRetry?: () => void;
  
  /**
   * Callback function to try an alternative payment method
   */
  onAlternativeMethod?: () => void;
  
  /**
   * Callback function to dismiss the error handler
   */
  onDismiss?: () => void;
  
  /**
   * Additional technical details about the error
   */
  errorDetails?: string;
  
  /**
   * Callback function to report the error to support
   */
  onReport?: () => void;
}