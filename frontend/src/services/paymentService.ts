import { supabase } from '../lib/supabase';
import { BankAccountTokenParams } from '@stripe/stripe-react-native';

// Interface for bank account data
interface BankAccount {
  id: string;
  last4: string;
  bankName: string;
  routingNumber: string;
  isDefault: boolean;
  accountType: 'checking' | 'savings';
  created: string;
}

/**
 * Fetches all bank accounts for the current user
 */
export const getBankAccounts = async (): Promise<BankAccount[]> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching bank accounts:', error);
    throw error;
  }
  
  return data.map((account: any) => ({
    id: account.id,
    last4: account.last4,
    bankName: account.bank_name,
    routingNumber: account.routing_number,
    isDefault: account.is_default,
    accountType: account.account_type,
    created: account.created_at,
  }));
};

/**
 * Adds a new bank account for the current user
 */
export const addBankAccount = async (params: BankAccountTokenParams): Promise<void> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // In a real implementation, you would:
  // 1. Call Stripe API to create a bank account token
  // 2. Send that token to your backend
  // 3. Have your backend create the bank account in Stripe

  // For this implementation, we'll simulate storing the bank account details
  // (in a real app, you'd never store full account numbers)
  const { error } = await supabase.from('bank_accounts').insert({
    user_id: user.user.id,
    last4: params.accountNumber.slice(-4),
    bank_name: 'Bank', // In a real app, you'd determine this from the routing number
    routing_number: params.routingNumber,
    account_type: params.accountType,
    is_default: false, // By default, not the default account
    created_at: new Date().toISOString(),
  });
  
  if (error) {
    console.error('Error adding bank account:', error);
    throw error;
  }
};

/**
 * Sets a bank account as the default for the current user
 */
export const setDefaultBankAccount = async (accountId: string): Promise<void> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Start a transaction to update all bank accounts
  const { error: updateError } = await supabase
    .rpc('set_default_bank_account', {
      p_account_id: accountId,
      p_user_id: user.user.id
    });
  
  if (updateError) {
    console.error('Error setting default bank account:', updateError);
    throw updateError;
  }
};

/**
 * Removes a bank account
 */
export const removeBankAccount = async (accountId: string): Promise<void> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const { error } = await supabase
    .from('bank_accounts')
    .delete()
    .eq('id', accountId)
    .eq('user_id', user.user.id);
    
  if (error) {
    console.error('Error removing bank account:', error);
    throw error;
  }
};

/**
 * Gets payout history for the current user
 */
export const getPayoutHistory = async () => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching payout history:', error);
    throw error;
  }
  
  return data;
};