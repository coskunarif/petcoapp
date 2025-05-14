import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Button, Card, Title, Paragraph, ActivityIndicator, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useStripePayments from '../../../hooks/useStripePayments';
import { Text } from '../../../components/ui';
import { PaymentMethod } from '../../../types/payments';

type RouteParams = {
  paymentMethod: PaymentMethod;
  cardParams?: {
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
  };
};

type PaymentConfirmationRouteProp = RouteProp<{ params: RouteParams }, 'params'>;

const PaymentConfirmationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<PaymentConfirmationRouteProp>();
  const { paymentMethod, cardParams } = route.params;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { createCardPaymentMethod, setDefaultPaymentMethod } = useStripePayments();

  // Function to save the payment method to the user's account
  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // If we've received card params, this is a new payment method
      if (cardParams) {
        const result = await createCardPaymentMethod(cardParams);
        
        if (!result.success) {
          setError(result.error?.message || 'Failed to save payment method');
          return;
        }
      } else {
        // Otherwise, we're just confirming an existing payment method
        // We might want to set it as default
        const result = await setDefaultPaymentMethod(paymentMethod.id);
        
        if (!result.success) {
          setError(result.error?.message || 'Failed to set as default payment method');
          return;
        }
      }
      
      // Navigate to success screen
      navigation.navigate('PaymentSuccessScreen' as never);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditPaymentMethod = () => {
    // Go back to the previous screen to edit details
    navigation.goBack();
  };

  // Format expiration date
  const formatExpiration = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };
  
  // Get appropriate card icon based on brand
  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'credit-card';
      case 'mastercard':
        return 'credit-card';
      case 'amex':
        return 'credit-card';
      case 'discover':
        return 'credit-card';
      default:
        return 'credit-card';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Title 
            title="Confirm Payment Method" 
            left={props => <MaterialCommunityIcons name="credit-card-check" size={24} color="#6C63FF" />} 
          />
          <Card.Content>
            <View style={styles.cardDetails}>
              <View style={styles.row}>
                <MaterialCommunityIcons 
                  name={getCardIcon(paymentMethod.card?.brand || 'default')} 
                  size={24} 
                  color="#6C63FF" 
                />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardType}>
                    {paymentMethod.card?.brand?.toUpperCase() || 'CARD'} •••• {paymentMethod.card?.last4}
                  </Text>
                  <Text style={styles.cardExpiry}>
                    Expires {formatExpiration(paymentMethod.card?.expMonth || 0, paymentMethod.card?.expYear || 0)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.billingDetails}>
                <Title style={styles.sectionTitle}>Billing Details</Title>
                <Text>{paymentMethod.billingDetails.name}</Text>
                {paymentMethod.billingDetails.email && <Text>{paymentMethod.billingDetails.email}</Text>}
                {paymentMethod.billingDetails.phone && <Text>{paymentMethod.billingDetails.phone}</Text>}
                
                {paymentMethod.billingDetails.address && (
                  <View style={styles.addressBlock}>
                    {paymentMethod.billingDetails.address.line1 && (
                      <Text>{paymentMethod.billingDetails.address.line1}</Text>
                    )}
                    {paymentMethod.billingDetails.address.line2 && (
                      <Text>{paymentMethod.billingDetails.address.line2}</Text>
                    )}
                    <Text>
                      {[
                        paymentMethod.billingDetails.address.city,
                        paymentMethod.billingDetails.address.state,
                        paymentMethod.billingDetails.address.postalCode
                      ].filter(Boolean).join(', ')}
                    </Text>
                    {paymentMethod.billingDetails.address.country && (
                      <Text>{paymentMethod.billingDetails.address.country}</Text>
                    )}
                  </View>
                )}
              </View>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
          </Card.Content>
        </Card>

        <View style={styles.actions}>
          <Button 
            mode="contained" 
            onPress={handleConfirm} 
            style={styles.confirmButton} 
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" size="small" /> : "Confirm Payment Method"}
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={handleEditPaymentMethod} 
            style={styles.editButton}
            disabled={loading}
          >
            Edit Details
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardDetails: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  cardInfo: {
    marginLeft: 12,
  },
  cardType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardExpiry: {
    fontSize: 14,
    color: '#666',
  },
  billingDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
    color: '#333',
  },
  addressBlock: {
    marginTop: 8,
  },
  actions: {
    marginTop: 16,
  },
  confirmButton: {
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#6C63FF',
  },
  editButton: {
    borderColor: '#6C63FF',
  },
  errorText: {
    color: 'red',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default PaymentConfirmationScreen;