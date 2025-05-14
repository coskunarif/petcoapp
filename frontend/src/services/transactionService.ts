import { supabase } from '../supabaseClient';

/**
 * Transaction types
 */
export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  CREDIT_PURCHASE = 'credit_purchase',
  CREDIT_USAGE = 'credit_usage',
  SERVICE_PAYMENT = 'service_payment',
  WITHDRAWAL = 'withdrawal',
  OTHER = 'other'
}

/**
 * Transaction status
 */
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

/**
 * Transaction category
 */
export enum TransactionCategory {
  PET_CARE = 'pet_care',
  GROOMING = 'grooming',
  VETERINARY = 'veterinary',
  BOARDING = 'boarding',
  WALKING = 'walking',
  SITTING = 'sitting',
  TRAINING = 'training',
  SUBSCRIPTION = 'subscription',
  MISCELLANEOUS = 'miscellaneous'
}

/**
 * Transaction interface
 */
export interface Transaction {
  id?: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  reference: string;
  description: string;
  category?: TransactionCategory;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

/**
 * Transaction history parameters
 */
export interface TransactionHistoryParams {
  userId: string;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  category?: TransactionCategory;
}

/**
 * Transaction summary
 */
export interface TransactionSummary {
  totalTransactions: number;
  totalAmount: number;
  transactions: Transaction[];
}

/**
 * Record a new transaction in the database
 */
export async function recordTransaction(transaction: Omit<Transaction, 'id' | 'reference' | 'created_at' | 'updated_at'>): Promise<Transaction> {
  try {
    // Generate a reference if not provided
    const reference = transaction.reference || await generateTransactionReference();
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          ...transaction,
          reference,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[transactionService] Error recording transaction:', error);
    throw error;
  }
}

/**
 * Get transaction history for a user
 */
export async function getTransactionHistory(params: TransactionHistoryParams): Promise<TransactionSummary> {
  try {
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', params.userId)
      .order('created_at', { ascending: false });
    
    // Apply filters if provided
    if (params.type) {
      query = query.eq('type', params.type);
    }
    
    if (params.status) {
      query = query.eq('status', params.status);
    }
    
    if (params.category) {
      query = query.eq('category', params.category);
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
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Calculate total amount
    const totalAmount = data.reduce((sum, transaction) => {
      return sum + (transaction.type === TransactionType.REFUND ? -transaction.amount : transaction.amount);
    }, 0);
    
    return {
      totalTransactions: count || 0,
      totalAmount,
      transactions: data || []
    };
  } catch (error) {
    console.error('[transactionService] Error getting transaction history:', error);
    throw error;
  }
}

/**
 * Get details for a specific transaction
 */
export async function getTransactionDetails(transactionId: string): Promise<Transaction> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`[transactionService] Error getting transaction details for ID ${transactionId}:`, error);
    throw error;
  }
}

/**
 * Generate a unique reference for a transaction
 */
export async function generateTransactionReference(): Promise<string> {
  try {
    // Generate a random reference with timestamp to ensure uniqueness
    const timestamp = new Date().getTime().toString(36);
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    const reference = `TX-${timestamp}-${random}`;
    
    // Check if the reference already exists
    const { data, error } = await supabase
      .from('transactions')
      .select('reference')
      .eq('reference', reference)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is what we want
      throw error;
    }
    
    // If reference exists, generate a new one
    if (data) {
      return generateTransactionReference();
    }
    
    return reference;
  } catch (error) {
    console.error('[transactionService] Error generating transaction reference:', error);
    throw error;
  }
}

/**
 * Update the status of a transaction
 */
export async function updateTransactionStatus(
  transactionId: string, 
  status: TransactionStatus, 
  metadata?: Record<string, any>
): Promise<Transaction> {
  try {
    const updates: Partial<Transaction> = {
      status,
      updated_at: new Date().toISOString()
    };
    
    // If metadata is provided, merge it with existing metadata
    if (metadata) {
      // First get the current transaction to merge metadata
      const { data: currentTransaction, error: fetchError } = await supabase
        .from('transactions')
        .select('metadata')
        .eq('id', transactionId)
        .single();
      
      if (fetchError) throw fetchError;
      
      updates.metadata = {
        ...(currentTransaction?.metadata || {}),
        ...metadata
      };
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`[transactionService] Error updating transaction status for ID ${transactionId}:`, error);
    throw error;
  }
}

/**
 * Categorize a transaction for reporting
 */
export async function categorizeTransaction(
  transactionId: string, 
  category: TransactionCategory
): Promise<Transaction> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        category,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`[transactionService] Error categorizing transaction ID ${transactionId}:`, error);
    throw error;
  }
}

/**
 * Get transaction statistics for a user
 */
export async function getTransactionStatistics(
  userId: string, 
  period: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<Record<string, number>> {
  try {
    // Calculate the start date based on the period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    // Get all transactions for the period
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', now.toISOString());
    
    if (error) throw error;
    
    // Calculate statistics
    const statistics: Record<string, number> = {
      totalSpent: 0,
      totalEarned: 0,
      totalRefunded: 0,
      count: data.length,
    };
    
    // Group by transaction type
    const byType: Record<string, number> = {};
    // Group by category
    const byCategory: Record<string, number> = {};
    
    data.forEach(transaction => {
      // Calculate totals
      if (transaction.type === TransactionType.PAYMENT || 
          transaction.type === TransactionType.CREDIT_PURCHASE ||
          transaction.type === TransactionType.SERVICE_PAYMENT) {
        statistics.totalSpent += transaction.amount;
      } else if (transaction.type === TransactionType.REFUND) {
        statistics.totalRefunded += transaction.amount;
      } else {
        statistics.totalEarned += transaction.amount;
      }
      
      // Group by type
      byType[transaction.type] = (byType[transaction.type] || 0) + transaction.amount;
      
      // Group by category if available
      if (transaction.category) {
        byCategory[transaction.category] = (byCategory[transaction.category] || 0) + transaction.amount;
      }
    });
    
    return {
      ...statistics,
      ...byType,
      ...byCategory
    };
  } catch (error) {
    console.error(`[transactionService] Error getting transaction statistics for user ${userId}:`, error);
    throw error;
  }
}