import React, { useState } from 'react';
import { View, StyleSheet, Alert, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CardField, CardFieldInput } from '@stripe/stripe-react-native';
import { theme, globalStyles } from '../../../theme';
import { Text, AppButton } from '../../../components/ui';
import { useStripePayments } from '../../../services/stripe/useStripePayments';

// Types
type NavigationProp = StackNavigationProp<any, 'AddPaymentMethod'>;

const AddPaymentMethodScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { createCardPaymentMethod, loading } = useStripePayments();
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details>({
    complete: false,
    brand: '',
    expiryMonth: 0,
    expiryYear: 0,
    last4: '',
    postalCode: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCardChange = (cardDetails: CardFieldInput.Details) => {
    setCardDetails(cardDetails);
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    if (!cardDetails.complete) {
      setError('Please complete your card information');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { paymentMethod, error: createError } = await createCardPaymentMethod(cardDetails);

      if (createError) {
        throw new Error(createError);
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method');
      }

      // Show success message
      Alert.alert(
        'Payment Method Added',
        `Successfully added ${paymentMethod.brand} ending in ${paymentMethod.last4}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('PaymentMethodsScreen'),
          },
        ]
      );
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding your payment method');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="h2">Add Payment Method</Text>
        <View style={{ width: 40 }} /> {/* Empty space for balance */}
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text variant="h3" style={styles.sectionTitle}>Card Information</Text>
          
          <CardField
            postalCodeEnabled={true}
            placeholders={{
              number: '4242 4242 4242 4242',
              expiration: 'MM/YY',
              cvc: 'CVC',
              postalCode: 'ZIP',
            }}
            cardStyle={styles.cardFieldStyle}
            style={styles.cardField}
            onCardChange={handleCardChange}
          />

          {error && (
            <Text variant="body2" color="error" style={styles.errorText}>
              {error}
            </Text>
          )}

          <View style={styles.infoContainer}>
            <MaterialCommunityIcons name="shield-check" size={20} color={theme.colors.textSecondary} />
            <Text variant="caption" color="textSecondary" style={styles.secureText}>
              Your payment information is securely processed by Stripe. We never store your full 
              card details on our servers.
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <AppButton
            title="Save Card"
            onPress={handleSubmit}
            fullWidth
            loading={isSubmitting || loading}
            disabled={isSubmitting || loading || !cardDetails.complete}
            icon="credit-card-check"
          />
          <AppButton
            title="Cancel"
            onPress={() => navigation.goBack()}
            fullWidth
            variant="outlined"
            style={styles.cancelButton}
            disabled={isSubmitting || loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#fff',
    ...theme.elevation.small,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    ...theme.elevation.small,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 8,
  },
  cardFieldStyle: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#fff',
    textColor: theme.colors.text,
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
  },
  secureText: {
    flex: 1,
    marginLeft: 8,
    lineHeight: 18,
  },
  errorText: {
    marginTop: 8,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  cancelButton: {
    marginTop: 12,
  },
});

export default AddPaymentMethodScreen;