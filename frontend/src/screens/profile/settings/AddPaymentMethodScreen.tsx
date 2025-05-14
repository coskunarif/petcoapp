import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, globalStyles } from '../../../theme';
import { Text, AppButton } from '../../../components/ui';
import { CardField, CardFieldInput } from '@stripe/stripe-react-native';
import { useStripePayments } from '../../../services/stripe/useStripePayments';
import { validateCardNumber, validateExpiryDate, validateCVV, validateZipCode } from '../../../utils/paymentValidation';

export default function AddPaymentMethodScreen({ navigation }: any) {
  const { createCardPaymentMethod, loading, error: stripeError } = useStripePayments();
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details>({
    complete: false,
    brand: '',
    expiryMonth: 0,
    expiryYear: 0,
    last4: '',
    postalCode: '',
    validCVC: false,
    validExpiryDate: false,
    validNumber: false,
  });

  const [saveAsDefault, setSaveAsDefault] = useState(true);
  const [validationErrors, setValidationErrors] = useState<{
    cardNumber?: string;
    expiryDate?: string;
    cvc?: string;
    zipCode?: string;
  }>({});
  const [formValid, setFormValid] = useState(false);

  // Run validation on card details changes
  useEffect(() => {
    validateForm();
  }, [cardDetails]);

  // Validate the form and update validation state
  const validateForm = () => {
    const errors: {
      cardNumber?: string;
      expiryDate?: string;
      cvc?: string;
      zipCode?: string;
    } = {};
    let isFormValid = true;

    // Only validate fields that have been entered
    if (cardDetails.number) {
      const cardNumberResult = validateCardNumber(cardDetails.number);
      if (!cardNumberResult.isValid) {
        errors.cardNumber = cardNumberResult.message;
        isFormValid = false;
      }
    } else if (cardDetails.number === '') {
      errors.cardNumber = 'Card number is required';
      isFormValid = false;
    }

    // Validate expiry date if month and year are available
    if (cardDetails.expiryMonth && cardDetails.expiryYear) {
      const expiryString = `${String(cardDetails.expiryMonth).padStart(2, '0')}/${String(cardDetails.expiryYear).slice(-2)}`;
      const expiryResult = validateExpiryDate(expiryString);
      if (!expiryResult.isValid) {
        errors.expiryDate = expiryResult.message;
        isFormValid = false;
      }
    } else if (cardDetails.expiryMonth === 0 || cardDetails.expiryYear === 0) {
      errors.expiryDate = 'Expiry date is required';
      isFormValid = false;
    }

    // Validate CVC if it's entered
    if (cardDetails.cvc) {
      const cardType = cardDetails.brand === 'amex' ? 'amex' : 'other';
      const cvcResult = validateCVV(cardDetails.cvc, cardType);
      if (!cvcResult.isValid) {
        errors.cvc = cvcResult.message;
        isFormValid = false;
      }
    } else if (cardDetails.cvc === '') {
      errors.cvc = 'Security code is required';
      isFormValid = false;
    }

    // Validate zip code if it's entered
    if (cardDetails.postalCode) {
      const zipResult = validateZipCode(cardDetails.postalCode);
      if (!zipResult.isValid) {
        errors.zipCode = zipResult.message;
        isFormValid = false;
      }
    } else if (cardDetails.postalCode === '') {
      errors.zipCode = 'ZIP code is required';
      isFormValid = false;
    }

    setValidationErrors(errors);
    setFormValid(isFormValid && cardDetails.complete);
  };

  const handleCardChange = (details: CardFieldInput.Details) => {
    setCardDetails(details);
  };

  const handleSaveCard = async () => {
    // Validate form before submission
    validateForm();
    
    if (!formValid) {
      // Collect all validation errors into a single message
      const errorMessages = Object.values(validationErrors).filter(Boolean);
      if (errorMessages.length > 0) {
        Alert.alert('Validation Error', errorMessages.join('\n'));
        return;
      }
      
      if (!cardDetails.complete) {
        Alert.alert('Error', 'Please complete your card details before saving.');
        return;
      }
      
      return;
    }

    const { paymentMethod, error } = await createCardPaymentMethod(cardDetails);

    if (error) {
      Alert.alert('Error', error);
      return;
    }

    if (paymentMethod) {
      Alert.alert(
        'Success', 
        `Card ending in ${paymentMethod.last4} has been added to your account.`,
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
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
        <View style={styles.cardEntryContainer}>
          <Text variant="h3" style={styles.sectionTitle}>Card Information</Text>
          
          <CardField
            postalCodeEnabled={true}
            placeholders={{
              number: '4242 4242 4242 4242',
              expiration: 'MM/YY',
              cvc: 'CVC',
              postalCode: '12345',
            }}
            cardStyle={{
              backgroundColor: '#FFFFFF',
              textColor: '#000000',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: formValid ? theme.colors.primary : 
                            Object.keys(validationErrors).length > 0 ? theme.colors.error : 
                            '#DDDDDD',
            }}
            style={styles.cardField}
            onCardChange={handleCardChange}
          />

          {/* Card validation status */}
          <View style={styles.cardStatusContainer}>
            <MaterialCommunityIcons 
              name={
                formValid ? 'check-circle' : 
                Object.keys(validationErrors).length > 0 ? 'alert-circle' : 
                'information-outline'
              } 
              size={20} 
              color={
                formValid ? theme.colors.success : 
                Object.keys(validationErrors).length > 0 ? theme.colors.error : 
                theme.colors.warning
              } 
              style={styles.cardStatusIcon}
            />
            <Text 
              variant="caption" 
              color={
                formValid ? 'success' : 
                Object.keys(validationErrors).length > 0 ? 'error' : 
                'warning'
              }
            >
              {formValid 
                ? 'Card information valid' 
                : Object.keys(validationErrors).length > 0
                  ? 'Please fix validation errors'
                  : 'Please enter all card details'
              }
            </Text>
          </View>
          
          {/* Validation error messages */}
          {Object.entries(validationErrors).map(([field, message]) => 
            message ? (
              <View key={field} style={styles.errorContainer}>
                <MaterialCommunityIcons 
                  name="alert-circle" 
                  size={20} 
                  color={theme.colors.error} 
                  style={styles.errorIcon}
                />
                <Text variant="body2" color="error" style={styles.errorText}>
                  {message}
                </Text>
              </View>
            ) : null
          )}

          {/* Display card brand if available */}
          {cardDetails.brand && (
            <View style={styles.cardBrandContainer}>
              <MaterialCommunityIcons 
                name="credit-card" 
                size={20} 
                color={theme.colors.text} 
                style={styles.cardBrandIcon}
              />
              <Text variant="body" style={styles.cardBrandText}>
                {cardDetails.brand.charAt(0).toUpperCase() + cardDetails.brand.slice(1)} 
                {cardDetails.last4 ? ` ending in ${cardDetails.last4}` : ''}
              </Text>
            </View>
          )}

          {/* Save as default option */}
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setSaveAsDefault(!saveAsDefault)}
          >
            <MaterialCommunityIcons 
              name={saveAsDefault ? 'checkbox-marked' : 'checkbox-blank-outline'} 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text variant="body2" style={styles.checkboxLabel}>
              Save as default payment method
            </Text>
          </TouchableOpacity>

          {/* Stripe error message */}
          {stripeError && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons 
                name="alert-circle" 
                size={20} 
                color={theme.colors.error} 
                style={styles.errorIcon}
              />
              <Text variant="body2" color="error" style={styles.errorText}>
                {stripeError}
              </Text>
            </View>
          )}
        </View>

        <Text variant="caption" color="textTertiary" style={styles.securityNote}>
          Your payment information is securely encrypted.
          We use Stripe, a PCI Service Provider Level 1 company,
          which is the highest level of certification available.
        </Text>

        <AppButton
          title="Save Card"
          onPress={handleSaveCard}
          fullWidth
          style={styles.saveButton}
          loading={loading}
          disabled={!formValid || loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

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
  cardEntryContainer: {
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
    marginBottom: 16,
    ...Platform.select({
      ios: {
        marginTop: 8,
      },
    }),
  },
  cardStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardStatusIcon: {
    marginRight: 8,
  },
  cardBrandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardBrandIcon: {
    marginRight: 8,
  },
  cardBrandText: {
    fontSize: 14,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    flex: 1,
  },
  saveButton: {
    marginTop: 8,
  },
  securityNote: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
});