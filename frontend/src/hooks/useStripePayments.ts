import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { supabaseClient } from '../supabaseClient';
import { selectCurrentUser } from '../redux/selectors';
import {
  PaymentMethod,
  PaymentIntent,
  PaymentError,
  PaymentErrorCode
} from '../types/payments';

interface UseStripePaymentsResult {
  // Payment methods management
  paymentMethods: PaymentMethod[];
  isLoadingPaymentMethods: boolean;
  loadingError: PaymentError | null;
  
  // Payment method operations
  createCardPaymentMethod: (cardParams: {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
    billingDetails: {
      name: string;
      email?: string;
      phone?: string;
      address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
      };
    };
  }) => Promise<{ success: boolean; paymentMethod?: PaymentMethod; error?: PaymentError }>;
  
  listPaymentMethods: () => Promise<{ success: boolean; paymentMethods?: PaymentMethod[]; error?: PaymentError }>;
  
  deletePaymentMethod: (paymentMethodId: string) => Promise<{ success: boolean; error?: PaymentError }>;
  
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<{ success: boolean; error?: PaymentError }>;
  
  // Payment intent operations
  createPaymentIntent: (params: {
    amount: number;
    currency?: string;
    serviceId: string;
    providerId: string;
    paymentMethodId?: string;
    metadata?: Record<string, string>;
  }) => Promise<{ success: boolean; paymentIntent?: PaymentIntent; error?: PaymentError }>;
  
  confirmPaymentIntent: (
    paymentIntentId: string,
    paymentMethodId?: string
  ) => Promise<{ success: boolean; paymentIntent?: PaymentIntent; error?: PaymentError }>;
}

/**
 * Hook for managing Stripe payment operations
 * Provides functionality for payment methods and payment intent operations
 */
export const useStripePayments = (): UseStripePaymentsResult => {
  const currentUser = useSelector(selectCurrentUser);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);
  const [loadingError, setLoadingError] = useState<PaymentError | null>(null);

  /**
   * Creates a new card payment method
   */
  const createCardPaymentMethod = async (cardParams: {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
    billingDetails: {
      name: string;
      email?: string;
      phone?: string;
      address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
      };
    };
  }): Promise<{ success: boolean; paymentMethod?: PaymentMethod; error?: PaymentError }> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('create-payment-method', {
        body: {
          user_id: user.user.id,
          card: {
            number: cardParams.number,
            exp_month: cardParams.expMonth,
            exp_year: cardParams.expYear,
            cvc: cardParams.cvc
          },
          billing_details: cardParams.billingDetails
        }
      });

      if (error) {
        const paymentError: PaymentError = {
          code: 'processing_error' as PaymentErrorCode,
          message: error.message || 'Failed to create payment method'
        };
        return { success: false, error: paymentError };
      }

      // Refresh payment methods list
      await listPaymentMethods();
      
      return { success: true, paymentMethod: data.paymentMethod };
    } catch (err) {
      const error = err as Error;
      const paymentError: PaymentError = {
        code: 'processing_error' as PaymentErrorCode,
        message: error.message || 'An unexpected error occurred'
      };
      
      return { success: false, error: paymentError };
    }
  };

  /**
   * Lists all payment methods for the current user
   */
  const listPaymentMethods = useCallback(async (): Promise<{ 
    success: boolean; 
    paymentMethods?: PaymentMethod[]; 
    error?: PaymentError 
  }> => {
    setIsLoadingPaymentMethods(true);
    setLoadingError(null);
    
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('get-payment-methods', {
        body: { user_id: user.user.id }
      });

      if (error) {
        const paymentError: PaymentError = {
          code: 'processing_error' as PaymentErrorCode,
          message: error.message || 'Failed to retrieve payment methods'
        };
        setLoadingError(paymentError);
        return { success: false, error: paymentError };
      }

      const methods = data.payment_methods || [];
      setPaymentMethods(methods);
      return { success: true, paymentMethods: methods };
    } catch (err) {
      const error = err as Error;
      const paymentError: PaymentError = {
        code: 'processing_error' as PaymentErrorCode,
        message: error.message || 'An unexpected error occurred'
      };
      
      setLoadingError(paymentError);
      return { success: false, error: paymentError };
    } finally {
      setIsLoadingPaymentMethods(false);
    }
  }, []);

  /**
   * Deletes a payment method
   */
  const deletePaymentMethod = async (paymentMethodId: string): Promise<{ 
    success: boolean; 
    error?: PaymentError 
  }> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('delete-payment-method', {
        body: {
          user_id: user.user.id,
          payment_method_id: paymentMethodId
        }
      });

      if (error) {
        const paymentError: PaymentError = {
          code: 'processing_error' as PaymentErrorCode,
          message: error.message || 'Failed to delete payment method'
        };
        return { success: false, error: paymentError };
      }

      // Update the local state by removing the deleted method
      setPaymentMethods(methods => methods.filter(method => method.id !== paymentMethodId));
      
      return { success: true };
    } catch (err) {
      const error = err as Error;
      const paymentError: PaymentError = {
        code: 'processing_error' as PaymentErrorCode,
        message: error.message || 'An unexpected error occurred'
      };
      
      return { success: false, error: paymentError };
    }
  };

  /**
   * Sets a payment method as the default
   */
  const setDefaultPaymentMethod = async (paymentMethodId: string): Promise<{
    success: boolean;
    error?: PaymentError
  }> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('set-default-payment-method', {
        body: {
          user_id: user.user.id,
          payment_method_id: paymentMethodId
        }
      });

      if (error) {
        const paymentError: PaymentError = {
          code: 'processing_error' as PaymentErrorCode,
          message: error.message || 'Failed to set default payment method'
        };
        return { success: false, error: paymentError };
      }

      // Update local state to reflect the new default
      setPaymentMethods(methods => 
        methods.map(method => ({
          ...method,
          isDefault: method.id === paymentMethodId
        }))
      );
      
      return { success: true };
    } catch (err) {
      const error = err as Error;
      const paymentError: PaymentError = {
        code: 'processing_error' as PaymentErrorCode,
        message: error.message || 'An unexpected error occurred'
      };
      
      return { success: false, error: paymentError };
    }
  };

  /**
   * Creates a payment intent
   */
  const createPaymentIntent = async (params: {
    amount: number;
    currency?: string;
    serviceId: string;
    providerId: string;
    paymentMethodId?: string;
    metadata?: Record<string, string>;
  }): Promise<{ 
    success: boolean; 
    paymentIntent?: PaymentIntent; 
    error?: PaymentError 
  }> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('create-payment-intent', {
        body: {
          amount: params.amount,
          currency: params.currency || 'usd',
          service_id: params.serviceId,
          provider_id: params.providerId,
          payment_method_id: params.paymentMethodId,
          metadata: params.metadata
        }
      });

      if (error) {
        const paymentError: PaymentError = {
          code: 'processing_error' as PaymentErrorCode,
          message: error.message || 'Failed to create payment intent'
        };
        return { success: false, error: paymentError };
      }

      return { 
        success: true, 
        paymentIntent: {
          id: data.id,
          amount: data.amount,
          status: data.status,
          clientSecret: data.client_secret,
          currency: data.currency,
          created: data.created,
          paymentMethodId: data.payment_method_id,
          metadata: data.metadata
        } 
      };
    } catch (err) {
      const error = err as Error;
      const paymentError: PaymentError = {
        code: 'processing_error' as PaymentErrorCode,
        message: error.message || 'An unexpected error occurred'
      };
      
      return { success: false, error: paymentError };
    }
  };

  /**
   * Confirms a payment intent
   */
  const confirmPaymentIntent = async (
    paymentIntentId: string,
    paymentMethodId?: string
  ): Promise<{ 
    success: boolean; 
    paymentIntent?: PaymentIntent; 
    error?: PaymentError 
  }> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient.functions.invoke('confirm-payment-intent', {
        body: {
          payment_intent_id: paymentIntentId,
          payment_method_id: paymentMethodId
        }
      });

      if (error) {
        const paymentError: PaymentError = {
          code: 'processing_error' as PaymentErrorCode,
          message: error.message || 'Failed to confirm payment intent'
        };
        return { success: false, error: paymentError };
      }

      return { 
        success: true, 
        paymentIntent: {
          id: data.id,
          amount: data.amount,
          status: data.status,
          clientSecret: data.client_secret,
          currency: data.currency,
          created: data.created,
          paymentMethodId: data.payment_method_id,
          metadata: data.metadata
        } 
      };
    } catch (err) {
      const error = err as Error;
      const paymentError: PaymentError = {
        code: 'processing_error' as PaymentErrorCode,
        message: error.message || 'An unexpected error occurred'
      };
      
      return { success: false, error: paymentError };
    }
  };

  // Load payment methods when the hook is initialized
  useEffect(() => {
    if (currentUser) {
      listPaymentMethods();
    }
  }, [currentUser, listPaymentMethods]);

  return {
    // State
    paymentMethods,
    isLoadingPaymentMethods,
    loadingError,
    
    // Payment method operations
    createCardPaymentMethod,
    listPaymentMethods,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    
    // Payment intent operations
    createPaymentIntent,
    confirmPaymentIntent
  };
};

export default useStripePayments;