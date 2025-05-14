import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { initStripe, StripeProvider as RNStripeProvider } from '@stripe/stripe-react-native';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { selectCurrentUser } from '../../redux/selectors';
import useStripePayments, { PaymentMethod } from '../../hooks/useStripePayments';
import * as secureStorage from '../../utils/secureStorage';

// Default Stripe publishable keys - these will be overridden by securely stored values when available
const DEFAULT_STRIPE_PUBLISHABLE_KEY = Platform.select({
  web: 'pk_test_your_web_key',
  default: 'pk_test_your_native_key',
});

// For web platform - this will be initialized in the useEffect below
let stripePromise: any = null;

// Context type definition
interface StripeContextType {
  // Provider (seller) properties
  isProviderOnboarded: boolean;
  providerAccountId: string | null;
  isLoadingAccount: boolean;
  startConnectOnboarding: () => Promise<void>;
  
  // Customer (buyer) properties
  paymentMethods: PaymentMethod[];
  isLoadingPaymentMethods: boolean;
  addPaymentMethod: (paymentMethodId: string) => Promise<boolean>;
  
  // Payment operations
  createPayment: (params: {
    amount: number;
    currency?: string;
    service_id: string;
    provider_id: string;
  }) => Promise<{ success: boolean; clientSecret?: string }>;
  confirmPayment: (paymentIntentId: string) => Promise<boolean>;
}

// Create the context
const StripeContext = createContext<StripeContextType | undefined>(undefined);

// Provider props
interface StripeProviderProps {
  children: ReactNode;
}

// Provider component
export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const currentUser = useSelector(selectCurrentUser);
  const [isStripeInitialized, setIsStripeInitialized] = useState(false);
  
  // Get Stripe functionality from our custom hook
  const stripePayments = useStripePayments();

  // Initialize Stripe with securely stored keys
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        // Try to get securely stored publishable key
        let publishableKey = await secureStorage.getStripePublishableKey();
        if (!publishableKey) {
          // If not found, use default and store it securely for future use
          publishableKey = DEFAULT_STRIPE_PUBLISHABLE_KEY;
          await secureStorage.setStripePublishableKey(publishableKey);
        }

        // Try to get securely stored merchant ID
        let merchantId = await secureStorage.getMerchantId();
        if (!merchantId) {
          // If not found, use default and store it
          merchantId = 'merchant.com.petcoapp';
          await secureStorage.setMerchantId(merchantId);
        }

        if (Platform.OS === 'web') {
          // Initialize Stripe on web
          stripePromise = loadStripe(publishableKey);
        } else {
          // Initialize Stripe on native platforms
          const { initStripe: init } = await import('@stripe/stripe-react-native');
          await init({
            publishableKey,
            merchantIdentifier: merchantId,
            urlScheme: 'petcoapp', // For return URL after 3D Secure
            setUrlSchemeOnAndroid: true,
          });
        }
        
        setIsStripeInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
      }
    };

    if (!isStripeInitialized) {
      initializeStripe();
    }
  }, [isStripeInitialized]);

  // Provide the context value
  const contextValue: StripeContextType = {
    ...stripePayments
  };

  // Don't render until Stripe is initialized
  if (!isStripeInitialized) {
    // You could return a loading state here if needed
    return null;
  }

  // Render appropriate provider based on platform
  if (Platform.OS === 'web') {
    return (
      <Elements stripe={stripePromise}>
        <StripeContext.Provider value={contextValue}>
          {children}
        </StripeContext.Provider>
      </Elements>
    );
  }

  return (
    <RNStripeProvider
      // These props will be ignored as they're set during initialization,
      // but we keep them here for backward compatibility
      urlScheme="petcoapp"
    >
      <StripeContext.Provider value={contextValue}>
        {children}
      </StripeContext.Provider>
    </RNStripeProvider>
  );
};

// Custom hook to use the Stripe context
export const useStripe = (): StripeContextType => {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};

export default StripeProvider;