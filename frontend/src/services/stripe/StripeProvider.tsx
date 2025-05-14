import React, { useEffect, useState } from 'react';
import { StripeProvider as StripeSDKProvider } from '@stripe/stripe-react-native';
import { Alert } from 'react-native';
import { supabase } from '../../supabaseClient';

// This would normally be in an environment variable
// and would be different for development vs production
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51LnTxiLkui8BMuDrUYBawqi9OGXs5z6Dj9RnuiJY6W5nHdkJJXKlRrLRIBYOaRYCATSIH2XLlDX03OUCzBM1MqvS00CtXyCHkL';

interface StripeProviderProps {
  children: React.ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [merchantIdentifier, setMerchantIdentifier] = useState('merchant.com.petcoapp');

  useEffect(() => {
    // In a real app, you would fetch the publishable key from your backend
    // This prevents exposing your key in your client code
    const fetchPublishableKey = async () => {
      try {
        // Example of how you'd fetch from your own API
        // const response = await fetch('https://your-backend.com/stripe-key');
        // const { publishableKey } = await response.json();
        
        // For demo purposes, we'll use the hardcoded test key
        setPublishableKey(STRIPE_PUBLISHABLE_KEY);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch publishable key', error);
        Alert.alert('Error', 'Unable to load payment system. Please try again later.');
        setLoading(false);
      }
    };

    fetchPublishableKey();
  }, []);

  if (loading) {
    // You might want to show a loading indicator here
    return null;
  }

  if (!publishableKey) {
    // If we failed to get the key, we should show an error
    // but still render the app (payments just won't work)
    return <>{children}</>;
  }

  return (
    <StripeSDKProvider
      publishableKey={publishableKey}
      merchantIdentifier={merchantIdentifier}
      // You can add additional configuration here
      // For example, to set up Apple Pay:
      // urlScheme="your-url-scheme" // Required for 3D Secure and bank redirects
    >
      {children}
    </StripeSDKProvider>
  );
};