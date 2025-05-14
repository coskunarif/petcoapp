import { supabase } from '../supabaseClient';
import { 
  TransactionType, 
  TransactionStatus, 
  Transaction, 
  generateTransactionReference, 
  recordTransaction, 
  updateTransactionStatus, 
  getTransactionDetails 
} from './transactionService';
import stripeService from './stripeService';

/**
 * Refund types
 */
export enum RefundType {
  FULL = 'full',
  PARTIAL = 'partial'
}

/**
 * Refund status
 */
export enum RefundStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Refund reason
 */
export enum RefundReason {
  REQUESTED_BY_CUSTOMER = 'requested_by_customer',
  DUPLICATE = 'duplicate',
  FRAUDULENT = 'fraudulent',
  SERVICE_NOT_PROVIDED = 'service_not_provided',
  SERVICE_UNSATISFACTORY = 'service_unsatisfactory',
  OTHER = 'other'
}

/**
 * Refund interface
 */
export interface Refund {
  id?: string;
  original_transaction_id: string;
  refund_transaction_id?: string;
  user_id: string;
  amount: number;
  full_refund: boolean;
  reason: RefundReason;
  notes?: string;
  status: RefundStatus;
  receipt_url?: string;
  payment_intent_id?: string;
  refund_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Refund request parameters
 */
export interface RefundRequestParams {
  originalTransactionId: string;
  amount?: number; // If not provided, full refund is assumed
  reason: RefundReason;
  notes?: string;
}

/**
 * Refund history parameters
 */
export interface RefundHistoryParams {
  userId: string;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  status?: RefundStatus;
}

/**
 * Receipt generation parameters
 */
export interface RefundReceiptParams {
  refundId: string;
  includeDetails?: boolean;
  format?: 'pdf' | 'html' | 'json';
}

/**
 * Fee calculation parameters
 */
export interface RefundFeeCalculationParams {
  originalAmount: number;
  refundAmount: number;
  stripeFee?: number;
  applicationFee?: number;
  processingFee?: number;
}

/**
 * Fee calculation result
 */
export interface FeeCalculationResult {
  originalAmount: number;
  refundAmount: number;
  stripeFeeRefunded: number;
  applicationFeeRefunded: number;
  processingFeeRefunded: number;
  totalRefundAmount: number;
  netRefundAmount: number;
}

/**
 * Refund result
 */
export interface RefundResult {
  refund: Refund;
  transaction: Transaction;
  fees: FeeCalculationResult;
}

/**
 * Service response type
 */
export interface RefundServiceResponse<T> {
  data: T | null;
  error: RefundError | null;
}

/**
 * Error interface
 */
export interface RefundError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Initialize a refund
 * @param params Refund request parameters
 * @returns Refund result or error
 */
export async function initiateRefund(params: RefundRequestParams): Promise<RefundServiceResponse<RefundResult>> {
  try {
    // Get original transaction details
    const originalTransaction = await getTransactionDetails(params.originalTransactionId);
    
    if (!originalTransaction) {
      return {
        data: null,
        error: {
          code: 'not_found',
          message: 'Original transaction not found'
        }
      };
    }
    
    // Check if transaction can be refunded
    if (originalTransaction.status === TransactionStatus.REFUNDED) {
      return {
        data: null,
        error: {
          code: 'already_refunded',
          message: 'This transaction has already been refunded'
        }
      };
    }
    
    if (originalTransaction.type !== TransactionType.PAYMENT && 
        originalTransaction.type !== TransactionType.SERVICE_PAYMENT) {
      return {
        data: null,
        error: {
          code: 'invalid_transaction_type',
          message: 'Only payment transactions can be refunded'
        }
      };
    }
    
    // Determine refund amount
    const isFullRefund = params.amount === undefined || 
                          params.amount === originalTransaction.amount;
    const refundAmount = isFullRefund ? originalTransaction.amount : params.amount || 0;
    
    if (refundAmount <= 0) {
      return {
        data: null,
        error: {
          code: 'invalid_amount',
          message: 'Refund amount must be greater than zero'
        }
      };
    }
    
    if (refundAmount > originalTransaction.amount) {
      return {
        data: null,
        error: {
          code: 'amount_exceeds_original',
          message: 'Refund amount cannot exceed the original transaction amount'
        }
      };
    }
    
    // Calculate fees
    const fees = calculateRefundFees({
      originalAmount: originalTransaction.amount,
      refundAmount: refundAmount,
      stripeFee: originalTransaction.metadata?.stripe_fee || 0,
      applicationFee: originalTransaction.metadata?.application_fee || 0,
      processingFee: originalTransaction.metadata?.processing_fee || 0
    });
    
    // Get payment intent ID from metadata
    const paymentIntentId = originalTransaction.metadata?.payment_intent_id;
    
    if (!paymentIntentId) {
      return {
        data: null,
        error: {
          code: 'missing_payment_intent',
          message: 'No payment intent found for the transaction'
        }
      };
    }
    
    // Process refund through Stripe
    const response = await stripeService.processRefund(paymentIntentId, refundAmount);
    
    if (response.error) {
      return {
        data: null,
        error: {
          code: response.error.code,
          message: response.error.message
        }
      };
    }
    
    // Create a refund record in the database
    const { data: user } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        data: null,
        error: {
          code: 'authentication_error',
          message: 'User not authenticated'
        }
      };
    }
    
    // Record refund transaction
    const refundTransaction = await recordTransaction({
      user_id: originalTransaction.user_id,
      amount: refundAmount,
      type: TransactionType.REFUND,
      status: TransactionStatus.COMPLETED,
      description: `Refund for transaction ${originalTransaction.reference}`,
      metadata: {
        original_transaction_id: originalTransaction.id,
        payment_intent_id: paymentIntentId,
        refund_id: response.data?.id,
        fees: fees,
        reason: params.reason,
        notes: params.notes
      }
    });
    
    // Update original transaction status
    await updateTransactionStatus(
      originalTransaction.id as string, 
      TransactionStatus.REFUNDED,
      {
        refund_transaction_id: refundTransaction.id,
        refund_amount: refundAmount,
        refund_date: new Date().toISOString()
      }
    );
    
    // Create refund record
    const { data: refundData, error: refundError } = await supabase
      .from('refunds')
      .insert([
        {
          original_transaction_id: originalTransaction.id,
          refund_transaction_id: refundTransaction.id,
          user_id: user.user.id,
          amount: refundAmount,
          full_refund: isFullRefund,
          reason: params.reason,
          notes: params.notes,
          status: RefundStatus.COMPLETED,
          receipt_url: response.data?.receipt_url,
          payment_intent_id: paymentIntentId,
          refund_id: response.data?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (refundError) {
      console.error('[refundService] Error creating refund record:', refundError);
      // Continue despite this error since the actual refund was processed
    }
    
    return {
      data: {
        refund: refundData || {
          original_transaction_id: originalTransaction.id as string,
          refund_transaction_id: refundTransaction.id,
          user_id: user.user.id,
          amount: refundAmount,
          full_refund: isFullRefund,
          reason: params.reason,
          notes: params.notes,
          status: RefundStatus.COMPLETED,
          payment_intent_id: paymentIntentId,
          refund_id: response.data?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        transaction: refundTransaction,
        fees: fees
      },
      error: null
    };
  } catch (error) {
    console.error('[refundService] Error initiating refund:', error);
    return {
      data: null,
      error: {
        code: 'processing_error',
        message: error instanceof Error ? error.message : 'Failed to process refund',
        details: error
      }
    };
  }
}

/**
 * Process a full refund
 * @param originalTransactionId Original transaction ID
 * @param reason Refund reason
 * @param notes Optional notes
 * @returns Refund result or error
 */
export async function processFullRefund(
  originalTransactionId: string,
  reason: RefundReason,
  notes?: string
): Promise<RefundServiceResponse<RefundResult>> {
  return initiateRefund({
    originalTransactionId,
    reason,
    notes
  });
}

/**
 * Process a partial refund
 * @param originalTransactionId Original transaction ID
 * @param amount Refund amount
 * @param reason Refund reason
 * @param notes Optional notes
 * @returns Refund result or error
 */
export async function processPartialRefund(
  originalTransactionId: string,
  amount: number,
  reason: RefundReason,
  notes?: string
): Promise<RefundServiceResponse<RefundResult>> {
  return initiateRefund({
    originalTransactionId,
    amount,
    reason,
    notes
  });
}

/**
 * Get refund details
 * @param refundId Refund ID
 * @returns Refund details or error
 */
export async function getRefundDetails(refundId: string): Promise<RefundServiceResponse<Refund>> {
  try {
    const { data, error } = await supabase
      .from('refunds')
      .select('*')
      .eq('id', refundId)
      .single();
    
    if (error) throw error;
    
    return {
      data,
      error: null
    };
  } catch (error) {
    console.error(`[refundService] Error getting refund details for ID ${refundId}:`, error);
    return {
      data: null,
      error: {
        code: 'fetch_error',
        message: error instanceof Error ? error.message : 'Failed to get refund details',
        details: error
      }
    };
  }
}

/**
 * Get refund history for a user
 * @param params Refund history parameters
 * @returns List of refunds or error
 */
export async function getRefundHistory(params: RefundHistoryParams): Promise<RefundServiceResponse<Refund[]>> {
  try {
    let query = supabase
      .from('refunds')
      .select('*')
      .eq('user_id', params.userId)
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (params.status) {
      query = query.eq('status', params.status);
    }
    
    if (params.startDate) {
      query = query.gte('created_at', params.startDate);
    }
    
    if (params.endDate) {
      query = query.lte('created_at', params.endDate);
    }
    
    // Apply pagination
    if (params.limit) {
      query = query.limit(params.limit);
    }
    
    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return {
      data: data || [],
      error: null
    };
  } catch (error) {
    console.error('[refundService] Error getting refund history:', error);
    return {
      data: [],
      error: {
        code: 'fetch_error',
        message: error instanceof Error ? error.message : 'Failed to get refund history',
        details: error
      }
    };
  }
}

/**
 * Check refund status
 * @param refundId Refund ID
 * @returns Refund status or error
 */
export async function checkRefundStatus(refundId: string): Promise<RefundServiceResponse<RefundStatus>> {
  try {
    const { data, error } = await supabase
      .from('refunds')
      .select('status')
      .eq('id', refundId)
      .single();
    
    if (error) throw error;
    
    return {
      data: data.status,
      error: null
    };
  } catch (error) {
    console.error(`[refundService] Error checking refund status for ID ${refundId}:`, error);
    return {
      data: null,
      error: {
        code: 'fetch_error',
        message: error instanceof Error ? error.message : 'Failed to check refund status',
        details: error
      }
    };
  }
}

/**
 * Cancel a pending refund
 * @param refundId Refund ID
 * @returns Success status or error
 */
export async function cancelRefund(refundId: string): Promise<RefundServiceResponse<boolean>> {
  try {
    // Get the refund details
    const { data: refund, error: fetchError } = await supabase
      .from('refunds')
      .select('*')
      .eq('id', refundId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Can only cancel pending refunds
    if (refund.status !== RefundStatus.PENDING) {
      return {
        data: false,
        error: {
          code: 'invalid_status',
          message: `Cannot cancel refund with status ${refund.status}`
        }
      };
    }
    
    // Update refund status
    const { error: updateError } = await supabase
      .from('refunds')
      .update({
        status: RefundStatus.CANCELLED,
        updated_at: new Date().toISOString()
      })
      .eq('id', refundId);
    
    if (updateError) throw updateError;
    
    // If there's a refund transaction, update its status
    if (refund.refund_transaction_id) {
      await updateTransactionStatus(
        refund.refund_transaction_id,
        TransactionStatus.CANCELLED
      );
    }
    
    return {
      data: true,
      error: null
    };
  } catch (error) {
    console.error(`[refundService] Error cancelling refund ID ${refundId}:`, error);
    return {
      data: false,
      error: {
        code: 'processing_error',
        message: error instanceof Error ? error.message : 'Failed to cancel refund',
        details: error
      }
    };
  }
}

/**
 * Calculate refund fees
 * @param params Fee calculation parameters
 * @returns Fee calculation result
 */
export function calculateRefundFees(params: RefundFeeCalculationParams): FeeCalculationResult {
  const { 
    originalAmount, 
    refundAmount, 
    stripeFee = 0, 
    applicationFee = 0, 
    processingFee = 0 
  } = params;
  
  // Calculate proportion of refund to original amount
  const refundRatio = refundAmount / originalAmount;
  
  // Calculate fee refunds proportionally
  const stripeFeeRefunded = Math.round(stripeFee * refundRatio * 100) / 100;
  const applicationFeeRefunded = Math.round(applicationFee * refundRatio * 100) / 100;
  const processingFeeRefunded = Math.round(processingFee * refundRatio * 100) / 100;
  
  // Calculate total amount to be refunded (including fees)
  const totalRefundAmount = refundAmount;
  
  // Calculate net refund amount (what the customer actually receives)
  const netRefundAmount = Math.round((refundAmount - 
    (applicationFee - applicationFeeRefunded) - 
    (processingFee - processingFeeRefunded)) * 100) / 100;
  
  return {
    originalAmount,
    refundAmount,
    stripeFeeRefunded,
    applicationFeeRefunded,
    processingFeeRefunded,
    totalRefundAmount,
    netRefundAmount
  };
}

/**
 * Generate a refund receipt
 * @param params Receipt generation parameters
 * @returns Receipt URL or data
 */
export async function generateRefundReceipt(params: RefundReceiptParams): Promise<RefundServiceResponse<string>> {
  try {
    const { refundId, includeDetails = true, format = 'pdf' } = params;
    
    // Get refund details
    const { data: refund, error: refundError } = await supabase
      .from('refunds')
      .select('*')
      .eq('id', refundId)
      .single();
    
    if (refundError) throw refundError;
    
    // If the refund already has a receipt URL, return it
    if (refund.receipt_url) {
      return {
        data: refund.receipt_url,
        error: null
      };
    }
    
    // Get the original transaction details
    const originalTransaction = await getTransactionDetails(refund.original_transaction_id);
    
    if (!originalTransaction) {
      throw new Error('Original transaction not found');
    }
    
    // Get the refund transaction details
    const refundTransaction = refund.refund_transaction_id ? 
      await getTransactionDetails(refund.refund_transaction_id) : null;
    
    // Call the receipt generation function (would normally call a backend endpoint)
    const { data, error } = await supabase.functions.invoke('generate-refund-receipt', {
      body: {
        refund_id: refundId,
        refund: refund,
        original_transaction: originalTransaction,
        refund_transaction: refundTransaction,
        include_details: includeDetails,
        format: format
      }
    });
    
    if (error) throw error;
    
    // Update the refund record with the receipt URL
    if (data.receipt_url) {
      await supabase
        .from('refunds')
        .update({
          receipt_url: data.receipt_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', refundId);
    }
    
    return {
      data: data.receipt_url || data.receipt_data,
      error: null
    };
  } catch (error) {
    console.error(`[refundService] Error generating receipt for refund ID ${params.refundId}:`, error);
    return {
      data: null,
      error: {
        code: 'processing_error',
        message: error instanceof Error ? error.message : 'Failed to generate refund receipt',
        details: error
      }
    };
  }
}

/**
 * Calculate maximum refundable amount for a transaction
 * @param transactionId Transaction ID
 * @returns Maximum refundable amount or error
 */
export async function getMaxRefundableAmount(transactionId: string): Promise<RefundServiceResponse<number>> {
  try {
    // Get the transaction details
    const transaction = await getTransactionDetails(transactionId);
    
    if (!transaction) {
      return {
        data: null,
        error: {
          code: 'not_found',
          message: 'Transaction not found'
        }
      };
    }
    
    // Check if already refunded
    if (transaction.status === TransactionStatus.REFUNDED) {
      // Check if partially refunded
      const refundAmount = transaction.metadata?.refund_amount || 0;
      
      // If fully refunded, return 0
      if (refundAmount >= transaction.amount) {
        return {
          data: 0,
          error: null
        };
      }
      
      // Return remaining amount
      return {
        data: Math.round((transaction.amount - refundAmount) * 100) / 100,
        error: null
      };
    }
    
    // If not refunded, return the full amount
    return {
      data: transaction.amount,
      error: null
    };
  } catch (error) {
    console.error(`[refundService] Error calculating max refundable amount for transaction ${transactionId}:`, error);
    return {
      data: null,
      error: {
        code: 'processing_error',
        message: error instanceof Error ? error.message : 'Failed to calculate maximum refundable amount',
        details: error
      }
    };
  }
}