import { supabaseClient } from '../supabaseClient';
import { 
  PaymentMethod, 
  StripeAccount, 
  PaymentIntent, 
  PaymentTransaction, 
  PayoutMethod, 
  Payout, 
  Balance, 
  PaymentError,
  BalanceTransaction 
} from '../types/payments';

/**
 * Parameters for creating a payment intent
 */
interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  serviceId: string;
  providerId: string;
  description?: string;
  metadata?: Record<string, string>;
}

/**
 * Parameters for updating a Connect account
 */
interface UpdateConnectAccountParams {
  businessType?: 'individual' | 'company';
  email?: string;
  metadata?: Record<string, string>;
  settings?: {
    payouts?: {
      schedule?: {
        interval: 'manual' | 'daily' | 'weekly' | 'monthly';
        weeklyAnchor?: string;
        monthlyAnchor?: number;
      };
    };
  };
}

/**
 * Response wrapper type to standardize error handling
 */
interface ServiceResponse<T> {
  data: T | null;
  error: PaymentError | null;
}

/**
 * Parameters for creating a bank account token
 */
interface BankAccountTokenParams {
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
  accountHolderType: 'individual' | 'company';
  country: string;
  currency: string;
  accountType?: 'checking' | 'savings';
}

const stripeService = {
  /**
   * Create a Stripe Connect account for a provider
   */
  createConnectAccount: async (): Promise<ServiceResponse<StripeAccount>> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('create-stripe-account', {
        body: { user_id: user.user.id }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating Stripe Connect account:', error);
      return { 
        data: null, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to create Connect account'
        }
      };
    }
  },

  /**
   * Get the onboarding URL for completing Stripe Connect account setup
   */
  getOnboardingUrl: async (): Promise<ServiceResponse<string>> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('get-stripe-onboarding-url', {
        body: { user_id: user.user.id }
      });

      if (error) throw error;
      return { data: data.url, error: null };
    } catch (error) {
      console.error('Error getting Stripe onboarding URL:', error);
      return { 
        data: null, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to get onboarding URL'
        }
      };
    }
  },

  /**
   * Get the Stripe Connect account status for the current user
   */
  getAccountStatus: async (): Promise<ServiceResponse<StripeAccount>> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('get-account-status', {
        body: { user_id: user.user.id }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting Stripe account status:', error);
      return { 
        data: null, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to get account status'
        }
      };
    }
  },

  /**
   * Update a Stripe Connect account
   */
  updateConnectAccount: async (params: UpdateConnectAccountParams): Promise<ServiceResponse<StripeAccount>> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('update-stripe-account', {
        body: { 
          user_id: user.user.id,
          ...params
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating Stripe Connect account:', error);
      return { 
        data: null, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to update Connect account'
        }
      };
    }
  },

  /**
   * Get account balance for the current user's Connect account
   */
  getBalance: async (): Promise<ServiceResponse<Balance>> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('get-account-balance', {
        body: { user_id: user.user.id }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting account balance:', error);
      return { 
        data: null, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to get balance'
        }
      };
    }
  },

  /**
   * Get balance transaction history for the Connect account
   */
  getBalanceTransactions: async (limit = 10, startingAfter?: string): Promise<ServiceResponse<BalanceTransaction[]>> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('get-balance-transactions', {
        body: { 
          user_id: user.user.id,
          limit,
          starting_after: startingAfter
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting balance transactions:', error);
      return { 
        data: null, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to get balance transactions'
        }
      };
    }
  },

  /**
   * Create a payment intent for a service
   */
  createPaymentIntent: async (params: CreatePaymentIntentParams): Promise<ServiceResponse<PaymentIntent>> => {
    try {
      const { data, error } = await supabaseClient.functions.invoke('create-payment-intent', {
        body: {
          amount: params.amount,
          currency: params.currency,
          service_id: params.serviceId,
          provider_id: params.providerId,
          description: params.description,
          metadata: params.metadata
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return { 
        data: null, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to create payment intent'
        }
      };
    }
  },

  /**
   * Confirm a payment was successful
   */
  confirmPayment: async (paymentIntentId: string): Promise<ServiceResponse<PaymentTransaction>> => {
    try {
      const { data, error } = await supabaseClient.functions.invoke('confirm-payment', {
        body: { payment_intent_id: paymentIntentId }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return { 
        data: null, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to confirm payment'
        }
      };
    }
  },

  /**
   * Get payment transaction history
   */
  getPaymentHistory: async (limit = 10, offset = 0): Promise<ServiceResponse<PaymentTransaction[]>> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('get-payment-history', {
        body: { 
          user_id: user.user.id,
          limit,
          offset
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting payment history:', error);
      return { 
        data: null, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to get payment history'
        }
      };
    }
  },

  /**
   * Get payment methods for the current customer
   */
  getPaymentMethods: async (): Promise<ServiceResponse<PaymentMethod[]>> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('get-payment-methods', {
        body: { user_id: user.user.id }
      });

      if (error) throw error;
      return { data: data.payment_methods || [], error: null };
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return { 
        data: [], 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to get payment methods'
        }
      };
    }
  },

  /**
   * Add a new payment method
   */
  addPaymentMethod: async (paymentMethodId: string): Promise<ServiceResponse<PaymentMethod>> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('add-payment-method', {
        body: { 
          user_id: user.user.id,
          payment_method_id: paymentMethodId
        }
      });

      if (error) throw error;
      return { data: data.paymentMethod, error: null };
    } catch (error) {
      console.error('Error adding payment method:', error);
      return { 
        data: null, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to add payment method'
        }
      };
    }
  },

  /**
   * Remove a payment method
   */
  removePaymentMethod: async (paymentMethodId: string): Promise<ServiceResponse<boolean>> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('remove-payment-method', {
        body: { 
          user_id: user.user.id,
          payment_method_id: paymentMethodId
        }
      });

      if (error) throw error;
      return { data: data.success, error: null };
    } catch (error) {
      console.error('Error removing payment method:', error);
      return { 
        data: false, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to remove payment method'
        }
      };
    }
  },

  /**
   * Set default payment method
   */
  setDefaultPaymentMethod: async (paymentMethodId: string): Promise<ServiceResponse<boolean>> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('set-default-payment-method', {
        body: { 
          user_id: user.user.id,
          payment_method_id: paymentMethodId
        }
      });

      if (error) throw error;
      return { data: data.success, error: null };
    } catch (error) {
      console.error('Error setting default payment method:', error);
      return { 
        data: false, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to set default payment method'
        }
      };
    }
  },

  /**
   * Get payout methods for the Connect account
   */
  getPayoutMethods: async (): Promise<ServiceResponse<PayoutMethod[]>> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('get-payout-methods', {
        body: { user_id: user.user.id }
      });

      if (error) throw error;
      return { data: data.payout_methods || [], error: null };
    } catch (error) {
      console.error('Error getting payout methods:', error);
      return { 
        data: [], 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to get payout methods'
        }
      };
    }
  },

  /**
   * Create payout to default payout method
   */
  createPayout: async (amount: number, currency = 'usd'): Promise<ServiceResponse<Payout>> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('create-payout', {
        body: { 
          user_id: user.user.id,
          amount,
          currency
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating payout:', error);
      return { 
        data: null, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to create payout'
        }
      };
    }
  },

  /**
   * Process refund for a payment
   */
  processRefund: async (paymentIntentId: string, amount?: number): Promise<ServiceResponse<PaymentTransaction>> => {
    try {
      const { data, error } = await supabaseClient.functions.invoke('process-refund', {
        body: { 
          payment_intent_id: paymentIntentId,
          amount
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error processing refund:', error);
      return { 
        data: null, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to process refund'
        }
      };
    }
  },

  /**
   * Get all connected bank accounts for a provider
   */
  listBankAccounts: async (): Promise<ServiceResponse<PayoutMethod[]>> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('list-bank-accounts', {
        body: { user_id: user.user.id }
      });

      if (error) throw error;
      return { data: data.bank_accounts || [], error: null };
    } catch (error) {
      console.error('Error listing bank accounts:', error);
      return { 
        data: [], 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to list bank accounts'
        }
      };
    }
  },

  /**
   * Add a new bank account to a Stripe Connect account
   */
  addBankAccount: async (bankAccountToken: string): Promise<ServiceResponse<PayoutMethod>> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('add-bank-account', {
        body: { 
          user_id: user.user.id,
          bank_account_token: bankAccountToken
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding bank account:', error);
      return { 
        data: null, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to add bank account'
        }
      };
    }
  },

  /**
   * Remove a bank account from a Stripe Connect account
   */
  removeBankAccount: async (bankAccountId: string): Promise<ServiceResponse<boolean>> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('remove-bank-account', {
        body: { 
          user_id: user.user.id,
          bank_account_id: bankAccountId
        }
      });

      if (error) throw error;
      return { data: data.success, error: null };
    } catch (error) {
      console.error('Error removing bank account:', error);
      return { 
        data: false, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to remove bank account'
        }
      };
    }
  },

  /**
   * Set a bank account as default for payouts
   */
  setDefaultBankAccount: async (bankAccountId: string): Promise<ServiceResponse<boolean>> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('set-default-bank-account', {
        body: { 
          user_id: user.user.id,
          bank_account_id: bankAccountId
        }
      });

      if (error) throw error;
      return { data: data.success, error: null };
    } catch (error) {
      console.error('Error setting default bank account:', error);
      return { 
        data: false, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to set default bank account'
        }
      };
    }
  },

  /**
   * Create a token for bank account validation
   */
  createBankAccountToken: async (params: BankAccountTokenParams): Promise<ServiceResponse<string>> => {
    try {
      const { data, error } = await supabaseClient.functions.invoke('create-bank-account-token', {
        body: { 
          account_number: params.accountNumber,
          routing_number: params.routingNumber,
          account_holder_name: params.accountHolderName,
          account_holder_type: params.accountHolderType,
          country: params.country,
          currency: params.currency,
          account_type: params.accountType
        }
      });

      if (error) throw error;
      return { data: data.token_id, error: null };
    } catch (error) {
      console.error('Error creating bank account token:', error);
      return { 
        data: null, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to create bank account token'
        }
      };
    }
  }
};

export default stripeService;