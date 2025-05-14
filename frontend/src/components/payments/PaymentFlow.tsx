import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Image,
  Platform,
  TouchableOpacity
} from 'react-native';
import { Modal, RadioButton, Divider, Chip } from 'react-native-paper';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

// Services
import paymentProcessingService from '../../services/paymentProcessingService';
import stripeService from '../../services/stripeService';

// Components
import AppCard from '../ui/AppCard';
import AppButton from '../ui/AppButton';
import SectionHeader from '../ui/SectionHeader';
import PaymentErrorHandler from './PaymentErrorHandler';

// Theme
import { theme } from '../../theme';

// Utils
import { 
  calculatePlatformFee, 
  calculateProcessingFee, 
  calculateTotalAmount,
  formatCurrency
} from '../../utils/feeCalculator';
import {
  parsePaymentError,
  logPaymentError,
  handleCardDecline,
  handleAuthenticationFailure,
  handleInsufficientFunds,
  isRetryableError,
  PaymentErrorType,
  PaymentErrorDetails
} from '../../utils/paymentErrorHandler';
import { analytics } from '../../lib/analytics';

// Types
import { 
  PaymentMethod, 
  PaymentIntent, 
  PaymentTransaction,
  PaymentError
} from '../../types/payments';
import { ServiceListing, ServiceRequest } from '../../types/services';
import { ErrorCode } from './types';

/**
 * Step enum for payment flow
 */
enum PaymentStep {
  SELECT_PAYMENT_METHOD = 0,
  REVIEW_PAYMENT = 1,
  CONFIRMATION = 2
}

/**
 * Payment status for confirmation step
 */
enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILURE = 'failure'
}

/**
 * Props for the PaymentFlow component
 */
interface PaymentFlowProps {
  visible: boolean;
  onDismiss: () => void;
  serviceData: ServiceListing | ServiceRequest;
  onPaymentComplete?: (transaction: PaymentTransaction) => void;
  onPaymentError?: (error: PaymentError) => void;
}

/**
 * A multi-step payment flow component for processing service payments
 */
const PaymentFlow: React.FC<PaymentFlowProps> = ({
  visible,
  onDismiss,
  serviceData,
  onPaymentComplete,
  onPaymentError
}) => {
  // State
  const [currentStep, setCurrentStep] = useState<PaymentStep>(PaymentStep.SELECT_PAYMENT_METHOD);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [feeCalculation, setFeeCalculation] = useState<{
    baseAmount: number;
    platformFee: number;
    processingFee: number;
    totalAmount: number;
    currency: string;
  } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.PENDING);
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
  const [paymentErrorDetails, setPaymentErrorDetails] = useState<PaymentErrorDetails | null>(null);
  const [showAlternativePaymentOptions, setShowAlternativePaymentOptions] = useState<boolean>(false);

  // Get the service type information
  const serviceType = 'service_type' in serviceData ? serviceData.service_type : null;
  const serviceAmount = serviceType?.credit_value || 0;
  
  // Get provider information
  const providerId = 'provider_id' in serviceData ? serviceData.provider_id : '';
  const serviceId = serviceData.id;

  /**
   * Load payment methods when component mounts
   */
  useEffect(() => {
    if (visible) {
      loadPaymentMethods();
      calculateFees();
    }
  }, [visible]);

  /**
   * Fetch saved payment methods
   */
  const loadPaymentMethods = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await stripeService.getPaymentMethods();
      
      if (error) {
        throw new Error(error.message);
      }

      setPaymentMethods(data || []);
      
      // Auto-select default payment method if available
      const defaultMethod = data.find(pm => pm.isDefault);
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id);
      } else if (data.length > 0) {
        setSelectedPaymentMethod(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Calculate service fees using feeCalculator utility
   */
  const calculateFees = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get provider information to determine tier (simplified for now)
      // In a real implementation, we would fetch the provider's tier from the API
      const tier = 'provider_tier' in serviceData ? serviceData.provider_tier : 'standard';
      
      // Calculate fees using our utility functions
      const baseAmount = serviceAmount;
      const platformFee = calculatePlatformFee(baseAmount);
      const processingFee = calculateProcessingFee(baseAmount);
      const totalAmount = calculateTotalAmount(baseAmount, true);
      
      // Set fee calculation data
      setFeeCalculation({
        baseAmount,
        platformFee,
        processingFee,
        totalAmount,
        currency: 'USD'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate fees');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create payment intent for the service
   */
  const createPaymentIntent = async () => {
    if (!selectedPaymentMethod || !feeCalculation) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await paymentProcessingService.createPaymentIntent({
        serviceId,
        providerId,
        amount: serviceAmount,
        description: `Payment for ${serviceType?.name || 'service'}`,
      });

      if (error) {
        throw new Error(error.message);
      }

      setPaymentIntent(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment intent');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Process the payment
   */
  const processPayment = async () => {
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPaymentErrorDetails(null);
    setPaymentStatus(PaymentStatus.PROCESSING);

    try {
      // Track payment attempt
      analytics.track('payment_attempt', {
        service_id: serviceId,
        provider_id: providerId,
        amount: serviceAmount,
        payment_method_id: selectedPaymentMethod
      });

      // Create payment intent if not already created
      let intent = paymentIntent;
      if (!intent) {
        intent = await createPaymentIntent();
        if (!intent) throw new Error('Failed to create payment intent');
      }

      // Process the payment for the service
      const { data, error } = await paymentProcessingService.processServicePayment(
        serviceId,
        selectedPaymentMethod
      );

      if (error) {
        throw error;
      }

      // Update status and transaction data
      setTransaction(data);
      setPaymentStatus(PaymentStatus.SUCCESS);
      
      // Track successful payment
      analytics.track('payment_success', {
        service_id: serviceId,
        provider_id: providerId,
        amount: serviceAmount,
        transaction_id: data?.id
      });
      
      // Call the onPaymentComplete callback
      if (onPaymentComplete && data) {
        onPaymentComplete(data);
      }
    } catch (err) {
      setPaymentStatus(PaymentStatus.FAILURE);
      
      // Parse and handle the error
      const errorDetails = parsePaymentError(err);
      setPaymentErrorDetails(errorDetails);
      setError(errorDetails.message);
      
      // Log the error
      logPaymentError(errorDetails, {
        service_id: serviceId,
        provider_id: providerId,
        amount: serviceAmount
      });
      
      // Show alternative payment options for certain error types
      if (errorDetails.code === PaymentErrorType.INSUFFICIENT_FUNDS ||
          errorDetails.code === PaymentErrorType.CARD_DECLINED ||
          errorDetails.code === PaymentErrorType.EXPIRED_CARD) {
        setShowAlternativePaymentOptions(true);
      }
      
      // Call the onPaymentError callback
      if (onPaymentError) {
        // Map the PaymentErrorType to PaymentErrorCode for callback
        const paymentErrorCodeMap: Record<PaymentErrorType, string> = {
          [PaymentErrorType.CARD_DECLINED]: 'card_declined',
          [PaymentErrorType.AUTHENTICATION_FAILED]: 'authentication_required',
          [PaymentErrorType.INSUFFICIENT_FUNDS]: 'insufficient_funds',
          [PaymentErrorType.EXPIRED_CARD]: 'expired_card',
          [PaymentErrorType.INVALID_CARD]: 'invalid_account',
          [PaymentErrorType.PROCESSOR_DECLINED]: 'processing_error',
          [PaymentErrorType.CURRENCY_NOT_SUPPORTED]: 'processing_error',
          [PaymentErrorType.DUPLICATE_TRANSACTION]: 'processing_error',
          [PaymentErrorType.RATE_LIMIT_EXCEEDED]: 'rate_limit',
          [PaymentErrorType.GENERIC_DECLINE]: 'card_declined',
          [PaymentErrorType.NETWORK_ERROR]: 'network_error',
          [PaymentErrorType.UNKNOWN]: 'processing_error'
        };
        
        onPaymentError({
          code: paymentErrorCodeMap[errorDetails.code] as any,
          message: errorDetails.message
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle payment method selection
   */
  const handlePaymentMethodSelect = (id: string) => {
    setSelectedPaymentMethod(id);
    setError(null);
  };

  /**
   * Handle retrying a payment
   */
  const handleRetryPayment = async () => {
    // Reset error states
    setError(null);
    setPaymentErrorDetails(null);
    setShowAlternativePaymentOptions(false);
    
    // Process the payment again
    await processPayment();
  };

  /**
   * Handle showing alternative payment methods
   */
  const handleShowAlternativePaymentMethods = () => {
    // Go back to the payment method selection screen
    setCurrentStep(PaymentStep.SELECT_PAYMENT_METHOD);
    setPaymentStatus(PaymentStatus.PENDING);
    setError(null);
    setPaymentErrorDetails(null);
  };

  /**
   * Handle payment error reporting
   */
  const handleReportPaymentIssue = () => {
    if (paymentErrorDetails) {
      analytics.track('payment_error_reported', {
        error_code: paymentErrorDetails.code,
        service_id: serviceId,
        provider_id: providerId
      });
    }
    // Implementation for reporting system would go here
  };

  /**
   * Handle next step button
   */
  const handleNextStep = async () => {
    if (currentStep === PaymentStep.SELECT_PAYMENT_METHOD) {
      if (!selectedPaymentMethod) {
        setError('Please select a payment method');
        return;
      }
      
      // Move to review step
      setCurrentStep(PaymentStep.REVIEW_PAYMENT);
    } else if (currentStep === PaymentStep.REVIEW_PAYMENT) {
      // Create payment intent and process payment
      await processPayment();
      setCurrentStep(PaymentStep.CONFIRMATION);
    }
  };

  /**
   * Handle back button
   */
  const handleBack = () => {
    if (currentStep === PaymentStep.REVIEW_PAYMENT) {
      setCurrentStep(PaymentStep.SELECT_PAYMENT_METHOD);
    } else if (currentStep === PaymentStep.CONFIRMATION && paymentStatus === PaymentStatus.FAILURE) {
      // Allow going back if payment failed
      setCurrentStep(PaymentStep.REVIEW_PAYMENT);
      setPaymentStatus(PaymentStatus.PENDING);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    // Reset state when modal is closed
    setCurrentStep(PaymentStep.SELECT_PAYMENT_METHOD);
    setSelectedPaymentMethod(null);
    setPaymentIntent(null);
    setPaymentStatus(PaymentStatus.PENDING);
    setError(null);
    setTransaction(null);
    onDismiss();
  };

  /**
   * Render payment method item
   */
  const renderPaymentMethod = (method: PaymentMethod) => {
    let icon;
    let description;

    if (method.type === 'card' && method.card) {
      // Determine card icon based on brand
      switch (method.card.brand) {
        case 'visa':
          icon = <FontAwesome name="cc-visa" size={24} color={theme.colors.text} />;
          break;
        case 'mastercard':
          icon = <FontAwesome name="cc-mastercard" size={24} color={theme.colors.text} />;
          break;
        case 'amex':
          icon = <FontAwesome name="cc-amex" size={24} color={theme.colors.text} />;
          break;
        default:
          icon = <FontAwesome name="credit-card" size={24} color={theme.colors.text} />;
      }
      
      description = `•••• ${method.card.last4} • Exp: ${method.card.expMonth}/${method.card.expYear}`;
    } else {
      icon = <MaterialIcons name="payment" size={24} color={theme.colors.text} />;
      description = 'Payment method';
    }

    return (
      <TouchableOpacity
        key={method.id}
        style={styles.paymentMethodItem}
        onPress={() => handlePaymentMethodSelect(method.id)}
      >
        <RadioButton
          value={method.id}
          status={selectedPaymentMethod === method.id ? 'checked' : 'unchecked'}
          onPress={() => handlePaymentMethodSelect(method.id)}
          color={theme.colors.primary}
        />
        <View style={styles.paymentMethodContent}>
          {icon}
          <View style={styles.paymentMethodDetails}>
            <Text style={styles.paymentMethodName}>{method.billingDetails.name}</Text>
            <Text style={styles.paymentMethodDescription}>{description}</Text>
          </View>
        </View>
        {method.isDefault && (
          <Chip style={styles.defaultChip} textStyle={styles.defaultChipText}>Default</Chip>
        )}
      </TouchableOpacity>
    );
  };

  /**
   * Render the payment method selection step
   */
  const renderPaymentMethodStep = () => {
    return (
      <View style={styles.stepContainer}>
        <SectionHeader title="Payment Method" />
        
        {isLoading && paymentMethods.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading payment methods...</Text>
          </View>
        ) : (
          <>
            {paymentMethods.length === 0 ? (
              <AppCard style={styles.emptyStateCard}>
                <View style={styles.emptyState}>
                  <MaterialIcons name="payment" size={48} color={theme.colors.primary} />
                  <Text style={styles.emptyStateTitle}>No Payment Methods</Text>
                  <Text style={styles.emptyStateDescription}>
                    You don't have any payment methods saved.
                  </Text>
                  <AppButton
                    title="Add Payment Method"
                    onPress={() => {
                      // TODO: Implement add payment method functionality
                      setError('Add payment method not implemented yet');
                    }}
                    mode="primary"
                  />
                </View>
              </AppCard>
            ) : (
              <AppCard>
                <View style={styles.paymentMethodList}>
                  {paymentMethods.map(renderPaymentMethod)}
                </View>
                <TouchableOpacity 
                  style={styles.addPaymentMethod}
                  onPress={() => {
                    // TODO: Implement add payment method functionality
                    setError('Add payment method not implemented yet');
                  }}
                >
                  <MaterialIcons name="add-circle-outline" size={24} color={theme.colors.primary} />
                  <Text style={styles.addPaymentMethodText}>Add New Payment Method</Text>
                </TouchableOpacity>
              </AppCard>
            )}
          </>
        )}
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    );
  };

  /**
   * Render the payment review step
   */
  const renderPaymentReviewStep = () => {
    // Find the selected payment method
    const selectedMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethod);
    
    return (
      <View style={styles.stepContainer}>
        <SectionHeader title="Review Payment" />
        
        <AppCard>
          <Text style={styles.reviewTitle}>Service Details</Text>
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceTitle}>{serviceType?.name || 'Service'}</Text>
            <Text style={styles.serviceDescription}>
              {'description' in serviceData ? serviceData.description : 'Pet service'}
            </Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.reviewTitle}>Payment Method</Text>
          {selectedMethod && (
            <View style={styles.selectedPaymentMethod}>
              {selectedMethod.type === 'card' && selectedMethod.card && (
                <>
                  <FontAwesome 
                    name={`cc-${selectedMethod.card.brand}` as any} 
                    size={24} 
                    color={theme.colors.text} 
                    style={styles.paymentIcon}
                  />
                  <View>
                    <Text style={styles.paymentMethodName}>{selectedMethod.billingDetails.name}</Text>
                    <Text style={styles.paymentMethodDescription}>
                      •••• {selectedMethod.card.last4} • Exp: {selectedMethod.card.expMonth}/{selectedMethod.card.expYear}
                    </Text>
                  </View>
                </>
              )}
            </View>
          )}
          
          <Divider style={styles.divider} />
          
          <Text style={styles.reviewTitle}>Payment Summary</Text>
          {feeCalculation ? (
            <View style={styles.paymentSummary}>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Service Amount</Text>
                <Text style={styles.feeAmount}>{formatCurrency(feeCalculation.baseAmount / 100)}</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Platform Fee</Text>
                <Text style={styles.feeAmount}>{formatCurrency(feeCalculation.platformFee / 100)}</Text>
                <Text style={styles.feeExplanation}>
                  Platform service charge
                </Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Processing Fee</Text>
                <Text style={styles.feeAmount}>{formatCurrency(feeCalculation.processingFee / 100)}</Text>
                <Text style={styles.feeExplanation}>
                  Payment processing charge
                </Text>
              </View>
              <Divider style={styles.feeDivider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>{formatCurrency(feeCalculation.totalAmount / 100)}</Text>
              </View>
              <View style={styles.feeBreakdownContainer}>
                <Text style={styles.feeBreakdownTitle}>Fee Breakdown</Text>
                <Text style={styles.feeBreakdownText}>
                  Platform fee covers matching you with qualified providers, secure messaging, 
                  and customer support. Processing fee covers secure payment handling.
                </Text>
              </View>
            </View>
          ) : (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          )}
        </AppCard>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    );
  };

  /**
   * Render the payment confirmation step
   */
  const renderConfirmationStep = () => {
    let content;
    
    if (paymentStatus === PaymentStatus.PROCESSING || isLoading) {
      content = (
        <View style={styles.confirmationContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.confirmationTitle}>Processing Payment</Text>
          <Text style={styles.confirmationDescription}>
            Please wait while we process your payment...
          </Text>
        </View>
      );
    } else if (paymentStatus === PaymentStatus.SUCCESS) {
      content = (
        <View style={styles.confirmationContent}>
          <View style={styles.successIcon}>
            <MaterialIcons name="check-circle" size={80} color={theme.colors.success} />
          </View>
          <Text style={styles.confirmationTitle}>Payment Successful!</Text>
          <Text style={styles.confirmationDescription}>
            Your payment has been processed successfully.
          </Text>
          {transaction && (
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionId}>Transaction ID: {transaction.id}</Text>
              <Text style={styles.transactionDate}>
                Date: {new Date(transaction.created).toLocaleString()}
              </Text>
              
              {feeCalculation && (
                <View style={styles.confirmationFeeDetails}>
                  <Divider style={styles.feeDivider} />
                  <Text style={styles.confirmationFeeTitle}>Payment Details</Text>
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Service Amount</Text>
                    <Text style={styles.feeAmount}>{formatCurrency(feeCalculation.baseAmount / 100)}</Text>
                  </View>
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Platform Fee</Text>
                    <Text style={styles.feeAmount}>{formatCurrency(feeCalculation.platformFee / 100)}</Text>
                  </View>
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Processing Fee</Text>
                    <Text style={styles.feeAmount}>{formatCurrency(feeCalculation.processingFee / 100)}</Text>
                  </View>
                  <Divider style={styles.feeDivider} />
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalAmount}>{formatCurrency(feeCalculation.totalAmount / 100)}</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      );
    } else if (paymentStatus === PaymentStatus.FAILURE) {
      // Use the PaymentErrorHandler component for error display
      if (paymentErrorDetails) {
        // Map the PaymentErrorType to ErrorCode for PaymentErrorHandler
        const errorCodeMap: Record<PaymentErrorType, ErrorCode> = {
          [PaymentErrorType.CARD_DECLINED]: 'card-declined',
          [PaymentErrorType.AUTHENTICATION_FAILED]: 'processing-error',
          [PaymentErrorType.INSUFFICIENT_FUNDS]: 'insufficient-funds',
          [PaymentErrorType.EXPIRED_CARD]: 'expired-card',
          [PaymentErrorType.INVALID_CARD]: 'invalid-card',
          [PaymentErrorType.PROCESSOR_DECLINED]: 'card-declined',
          [PaymentErrorType.CURRENCY_NOT_SUPPORTED]: 'processing-error',
          [PaymentErrorType.DUPLICATE_TRANSACTION]: 'processing-error',
          [PaymentErrorType.RATE_LIMIT_EXCEEDED]: 'processing-error',
          [PaymentErrorType.GENERIC_DECLINE]: 'card-declined',
          [PaymentErrorType.NETWORK_ERROR]: 'network-error',
          [PaymentErrorType.UNKNOWN]: 'unknown'
        };
        
        const errorCode = errorCodeMap[paymentErrorDetails.code] || 'unknown';
        const errorDetails = paymentErrorDetails.requestId 
          ? `Request ID: ${paymentErrorDetails.requestId}` 
          : undefined;
          
        return (
          <View style={styles.stepContainer}>
            <SectionHeader title="Payment Failed" />
            <PaymentErrorHandler
              errorCode={errorCode}
              onRetry={handleRetryPayment}
              onAlternativeMethod={showAlternativePaymentOptions ? handleShowAlternativePaymentMethods : undefined}
              onDismiss={handleClose}
              errorDetails={errorDetails}
              onReport={handleReportPaymentIssue}
            />
          </View>
        );
      }
      
      // Fallback error content if no error details
      content = (
        <View style={styles.confirmationContent}>
          <View style={styles.failureIcon}>
            <MaterialIcons name="error" size={80} color={theme.colors.error} />
          </View>
          <Text style={styles.confirmationTitle}>Payment Failed</Text>
          <Text style={styles.confirmationDescription}>
            {error || 'There was a problem processing your payment.'}
          </Text>
          <Text style={styles.tryAgainText}>
            Please try again or use a different payment method.
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.stepContainer}>
        <SectionHeader title="Payment Confirmation" />
        <AppCard>{content}</AppCard>
      </View>
    );
  };

  /**
   * Render the current step content
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case PaymentStep.SELECT_PAYMENT_METHOD:
        return renderPaymentMethodStep();
      case PaymentStep.REVIEW_PAYMENT:
        return renderPaymentReviewStep();
      case PaymentStep.CONFIRMATION:
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  /**
   * Render the footer buttons
   */
  const renderFooter = () => {
    // Don't show standard footer buttons when using the PaymentErrorHandler component
    if (currentStep === PaymentStep.CONFIRMATION && 
        paymentStatus === PaymentStatus.FAILURE && 
        paymentErrorDetails) {
      return null;
    }
    
    const showBackButton = 
      currentStep === PaymentStep.REVIEW_PAYMENT || 
      (currentStep === PaymentStep.CONFIRMATION && paymentStatus === PaymentStatus.FAILURE);
    
    let primaryButtonTitle = 'Next';
    let primaryButtonDisabled = isLoading;
    
    if (currentStep === PaymentStep.REVIEW_PAYMENT) {
      primaryButtonTitle = 'Confirm Payment';
      primaryButtonDisabled = isLoading || !feeCalculation;
    } else if (currentStep === PaymentStep.CONFIRMATION) {
      if (paymentStatus === PaymentStatus.SUCCESS) {
        primaryButtonTitle = 'Done';
      } else if (paymentStatus === PaymentStatus.FAILURE) {
        primaryButtonTitle = 'Try Again';
      } else {
        primaryButtonDisabled = true;
      }
    }

    return (
      <View style={styles.footer}>
        {showBackButton && (
          <AppButton
            title="Back"
            onPress={handleBack}
            mode="outline"
            disabled={isLoading}
            style={styles.backButton}
          />
        )}
        
        <AppButton
          title={primaryButtonTitle}
          onPress={currentStep === PaymentStep.CONFIRMATION && paymentStatus === PaymentStatus.SUCCESS 
            ? handleClose 
            : currentStep === PaymentStep.CONFIRMATION && paymentStatus === PaymentStatus.FAILURE
              ? handleRetryPayment
              : handleNextStep}
          loading={isLoading}
          disabled={primaryButtonDisabled}
          style={[styles.primaryButton, !showBackButton && styles.fullWidthButton]}
        />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      onDismiss={handleClose}
      contentContainerStyle={styles.modalContainer}
    >
      <View style={styles.stepsIndicator}>
        {[0, 1, 2].map(step => (
          <View 
            key={step}
            style={[
              styles.stepIndicator,
              currentStep >= step && styles.activeStepIndicator,
              currentStep === step && styles.currentStepIndicator
            ]}
          />
        ))}
      </View>
      
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.contentContainer}>
        {renderStepContent()}
      </ScrollView>
      
      {renderFooter()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: theme.colors.background,
    margin: 20,
    borderRadius: theme.borderRadius.medium,
    paddingTop: 20,
    paddingBottom: 20,
    maxHeight: '90%',
    width: '90%',
    alignSelf: 'center',
    ...theme.elevation.large,
  },
  scrollContent: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  stepsIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.textTertiary,
    marginHorizontal: 4,
  },
  activeStepIndicator: {
    backgroundColor: theme.colors.primary,
  },
  currentStepIndicator: {
    width: 20,
  },
  stepContainer: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.text,
    fontSize: 16,
  },
  emptyStateCard: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 10,
    marginBottom: 5,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  paymentMethodList: {
    marginBottom: 10,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  paymentMethodDetails: {
    marginLeft: 10,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  defaultChip: {
    backgroundColor: theme.colors.primaryLight,
    height: 24,
  },
  defaultChipText: {
    color: theme.colors.primary,
    fontSize: 12,
  },
  addPaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 5,
  },
  addPaymentMethodText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  errorText: {
    color: theme.colors.error,
    marginHorizontal: 20,
    marginTop: 10,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 15,
  },
  serviceDetails: {
    marginBottom: 10,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  serviceDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 15,
  },
  selectedPaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentIcon: {
    marginRight: 10,
  },
  paymentSummary: {
    marginTop: 5,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  feeLabel: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  feeAmount: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
    marginLeft: 10,
  },
  feeExplanation: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    flex: 1,
    marginTop: 2,
  },
  feeDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  feeBreakdownContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: theme.borderRadius.small,
  },
  feeBreakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 5,
  },
  feeBreakdownText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  confirmationContent: {
    alignItems: 'center',
    padding: 20,
  },
  successIcon: {
    marginBottom: 15,
  },
  failureIcon: {
    marginBottom: 15,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 10,
  },
  confirmationDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 15,
  },
  transactionDetails: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 15,
    borderRadius: theme.borderRadius.small,
    marginTop: 10,
  },
  transactionId: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 5,
  },
  transactionAmount: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 5,
  },
  transactionDate: {
    fontSize: 14,
    color: theme.colors.text,
  },
  confirmationFeeDetails: {
    marginTop: 15,
  },
  confirmationFeeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 10,
    marginTop: 5,
  },
  tryAgainText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    flex: 1,
    marginRight: 10,
  },
  primaryButton: {
    flex: 2,
  },
  fullWidthButton: {
    flex: 1,
  },
});

export default PaymentFlow;