import { useState } from 'react';
import { Alert } from 'react-native';
import { useStripe, CardFieldInput } from '@stripe/stripe-react-native';
import { supabase } from '../../supabaseClient';

export type PaymentMethod = {
  id: string;
  type: 'card' | 'bank';
  brand?: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postalCode?: string;
      state?: string;
    };
  };
};

export const useStripePayments = () => {
  const { createPaymentMethod, createToken, confirmPayment } = useStripe();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Creates a payment method from card details
   */
  const createCardPaymentMethod = async (cardDetails: CardFieldInput.Details) => {
    setLoading(true);
    setError(null);

    try {
      if (!cardDetails.complete) {
        throw new Error('Please complete your card details');
      }

      const { paymentMethod, error: createError } = await createPaymentMethod({
        type: 'Card',
        billingDetails: cardDetails.billingDetails,
      });

      if (createError) {
        throw new Error(createError.message);
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method');
      }

      // In a real app, you would send this to your backend to associate with the user
      const { error: saveError } = await savePaymentMethodToUser(paymentMethod);

      if (saveError) {
        throw new Error(saveError.message);
      }

      return {
        paymentMethod: {
          id: paymentMethod.id,
          type: 'card',
          brand: paymentMethod.Card?.brand,
          last4: paymentMethod.Card?.last4 || '****',
          expiryMonth: paymentMethod.Card?.expiryMonth,
          expiryYear: paymentMethod.Card?.expiryYear,
          isDefault: false,
          billingDetails: paymentMethod.billingDetails,
        } as PaymentMethod,
        error: null,
      };
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
      return { paymentMethod: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Saves the payment method to the user's account
   * In a real app, this would call your backend API
   */
  const savePaymentMethodToUser = async (paymentMethod: any) => {
    try {
      // Get the current user
      const { data: user } = await supabase.auth.getUser();

      if (!user) {
        return { error: { message: 'User not authenticated' } };
      }

      // In a real implementation, you would:
      // 1. Call your backend API
      // 2. Your backend would use Stripe's API to attach the payment method to a customer
      // 3. Your backend would save the reference in your database

      // For this demo, we'll just simulate success
      console.log('Payment method saved for user:', user.user?.id);
      console.log('Payment method ID:', paymentMethod.id);

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Failed to save payment method' } };
    }
  };

  /**
   * Lists payment methods for the current user
   * In a real app, this would call your backend API
   */
  const listPaymentMethods = async (): Promise<{ paymentMethods: PaymentMethod[], error: string | null }> => {
    setLoading(true);
    setError(null);

    try {
      // Get the current user
      const { data: user } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // In a real implementation, you would:
      // 1. Call your backend API
      // 2. Your backend would use Stripe's API to list payment methods
      // 3. Your backend would return the list to the client

      // For this demo, we'll return mock data
      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: 'pm_1234567890',
          type: 'card',
          brand: 'visa',
          last4: '4242',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true,
        },
        {
          id: 'pm_0987654321',
          type: 'card',
          brand: 'mastercard',
          last4: '5555',
          expiryMonth: 10,
          expiryYear: 2024,
          isDefault: false,
        },
      ];

      return { paymentMethods: mockPaymentMethods, error: null };
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
      return { paymentMethods: [], error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deletes a payment method
   * In a real app, this would call your backend API
   */
  const deletePaymentMethod = async (paymentMethodId: string): Promise<{ success: boolean, error: string | null }> => {
    setLoading(true);
    setError(null);

    try {
      // Get the current user
      const { data: user } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // In a real implementation, you would:
      // 1. Call your backend API
      // 2. Your backend would use Stripe's API to detach the payment method
      // 3. Your backend would remove the reference from your database

      // For this demo, we'll just simulate success
      console.log('Payment method deleted:', paymentMethodId);

      return { success: true, error: null };
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sets a payment method as default
   * In a real app, this would call your backend API
   */
  const setDefaultPaymentMethod = async (paymentMethodId: string): Promise<{ success: boolean, error: string | null }> => {
    setLoading(true);
    setError(null);

    try {
      // Get the current user
      const { data: user } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // In a real implementation, you would:
      // 1. Call your backend API
      // 2. Your backend would use Stripe's API to update the customer's default payment method
      // 3. Your backend would update your database

      // For this demo, we'll just simulate success
      console.log('Payment method set as default:', paymentMethodId);

      return { success: true, error: null };
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Processes a payment
   * In a real app, this would call your backend API to create a payment intent
   */
  const processPayment = async (
    amount: number, 
    currency: string = 'usd', 
    paymentMethodId?: string
  ): Promise<{ success: boolean, error: string | null }> => {
    setLoading(true);
    setError(null);

    try {
      // Get the current user
      const { data: user } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // In a real implementation, you would:
      // 1. Call your backend API to create a payment intent
      // 2. Your backend would create the payment intent with Stripe
      // 3. Your backend would return the client secret to the client
      // 4. The client would use the client secret to confirm the payment

      // For this demo, we'll simulate the process
      const clientSecret = 'pi_3MqSj9Kuy5HvKKIR0DGeJLs2_secret_DeD3uPDlGaiS67CmJ1Leu5Fug';
      
      if (!clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // If no payment method ID is provided, user will be prompted to enter card details
      if (!paymentMethodId) {
        const { error: confirmError } = await confirmPayment(clientSecret, {
          paymentMethodType: 'Card',
        });

        if (confirmError) {
          throw new Error(confirmError.message);
        }
      } else {
        // If a payment method ID is provided, use it
        const { error: confirmError } = await confirmPayment(clientSecret, {
          paymentMethodId,
        });

        if (confirmError) {
          throw new Error(confirmError.message);
        }
      }

      return { success: true, error: null };
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createCardPaymentMethod,
    listPaymentMethods,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    processPayment,
  };
};