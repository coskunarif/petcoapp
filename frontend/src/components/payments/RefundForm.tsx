import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
import { 
  Modal, 
  RadioButton, 
  Divider, 
  TextInput, 
  Chip, 
  HelperText 
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

// Services
import * as refundService from '../../services/refundService';

// Components
import AppCard from '../ui/AppCard';
import AppButton from '../ui/AppButton';
import SectionHeader from '../ui/SectionHeader';

// Theme
import { theme } from '../../theme';

// Types
import { 
  RefundType, 
  RefundReason, 
  RefundStatus, 
  RefundResult, 
  RefundServiceResponse,
  FeeCalculationResult
} from '../../services/refundService';

/**
 * Step enum for refund flow
 */
enum RefundStep {
  REFUND_TYPE = 0,
  REFUND_DETAILS = 1,
  CONFIRMATION = 2,
  RESULT = 3
}

/**
 * Props for the RefundForm component
 */
interface RefundFormProps {
  /**
   * Visibility state of the modal
   */
  visible: boolean;
  
  /**
   * Function to dismiss the modal
   */
  onDismiss: () => void;
  
  /**
   * Original transaction ID to refund
   */
  transactionId: string;
  
  /**
   * Original transaction amount in cents
   */
  transactionAmount: number;
  
  /**
   * Optional callback for when a refund is complete
   */
  onRefundComplete?: (result: RefundResult) => void;
  
  /**
   * Optional callback for when a refund fails
   */
  onRefundError?: (error: any) => void;
}

/**
 * A form component for initiating refunds
 */
const RefundForm: React.FC<RefundFormProps> = ({
  visible,
  onDismiss,
  transactionId,
  transactionAmount,
  onRefundComplete,
  onRefundError
}) => {
  // State
  const [currentStep, setCurrentStep] = useState<RefundStep>(RefundStep.REFUND_TYPE);
  const [refundType, setRefundType] = useState<RefundType>(RefundType.FULL);
  const [refundReason, setRefundReason] = useState<RefundReason>(RefundReason.REQUESTED_BY_CUSTOMER);
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [feeCalculation, setFeeCalculation] = useState<FeeCalculationResult | null>(null);
  const [maxRefundableAmount, setMaxRefundableAmount] = useState<number>(0);
  const [refundResult, setRefundResult] = useState<RefundResult | null>(null);
  const [refundStatus, setRefundStatus] = useState<RefundStatus>(RefundStatus.PENDING);

  // Format the transaction amount for display
  const formattedTransactionAmount = (transactionAmount / 100).toFixed(2);

  // Available refund reasons
  const refundReasons = [
    { value: RefundReason.REQUESTED_BY_CUSTOMER, label: 'Requested by customer' },
    { value: RefundReason.SERVICE_NOT_PROVIDED, label: 'Service not provided' },
    { value: RefundReason.SERVICE_UNSATISFACTORY, label: 'Unsatisfactory service' },
    { value: RefundReason.DUPLICATE, label: 'Duplicate transaction' },
    { value: RefundReason.FRAUDULENT, label: 'Fraudulent transaction' },
    { value: RefundReason.OTHER, label: 'Other reason' }
  ];

  /**
   * Get the maximum refundable amount when component mounts
   */
  useEffect(() => {
    if (visible) {
      getMaxRefundableAmount();
    } else {
      // Reset state when modal closes
      resetForm();
    }
  }, [visible]);

  /**
   * Reset the form state
   */
  const resetForm = () => {
    setCurrentStep(RefundStep.REFUND_TYPE);
    setRefundType(RefundType.FULL);
    setRefundReason(RefundReason.REQUESTED_BY_CUSTOMER);
    setRefundAmount('');
    setNotes('');
    setError(null);
    setFeeCalculation(null);
    setRefundResult(null);
    setRefundStatus(RefundStatus.PENDING);
  };

  /**
   * Get maximum refundable amount for the transaction
   */
  const getMaxRefundableAmount = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await refundService.getMaxRefundableAmount(transactionId);
      
      if (error) {
        throw new Error(error.message);
      }

      if (data !== null) {
        setMaxRefundableAmount(data);
        // Initialize refund amount to the max amount for partial refunds
        setRefundAmount((data / 100).toFixed(2));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get refundable amount');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Calculate fee distribution for a refund
   */
  const calculateFees = () => {
    setIsLoading(true);
    setError(null);

    try {
      const amountInCents = refundType === RefundType.FULL 
        ? maxRefundableAmount
        : Math.round(parseFloat(refundAmount) * 100);

      if (isNaN(amountInCents)) {
        throw new Error('Invalid refund amount');
      }

      // Calculate refund fees
      const fees = refundService.calculateRefundFees({
        originalAmount: transactionAmount,
        refundAmount: amountInCents,
        // These values would normally be fetched from the original transaction
        stripeFee: transactionAmount * 0.029 + 30, // Example calculation: 2.9% + 30¢
        applicationFee: transactionAmount * 0.05, // Example: 5% platform fee
        processingFee: 0 // No additional processing fee in this example
      });

      setFeeCalculation(fees);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate fees');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Process the refund
   */
  const processRefund = async () => {
    setIsLoading(true);
    setError(null);
    setRefundStatus(RefundStatus.PENDING);

    try {
      let response: RefundServiceResponse<RefundResult>;

      if (refundType === RefundType.FULL) {
        response = await refundService.processFullRefund(
          transactionId,
          refundReason,
          notes
        );
      } else {
        // Convert the string amount to cents
        const amountInCents = Math.round(parseFloat(refundAmount) * 100);
        
        if (isNaN(amountInCents) || amountInCents <= 0) {
          throw new Error('Invalid refund amount');
        }

        if (amountInCents > maxRefundableAmount) {
          throw new Error(`Refund amount cannot exceed ${(maxRefundableAmount / 100).toFixed(2)}`);
        }

        response = await refundService.processPartialRefund(
          transactionId,
          amountInCents,
          refundReason,
          notes
        );
      }

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Update state with the refund result
      setRefundResult(response.data);
      setRefundStatus(RefundStatus.COMPLETED);
      setCurrentStep(RefundStep.RESULT);

      // Call the onRefundComplete callback
      if (onRefundComplete && response.data) {
        onRefundComplete(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process refund');
      setRefundStatus(RefundStatus.FAILED);
      
      // Call the onRefundError callback
      if (onRefundError) {
        onRefundError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle next step button
   */
  const handleNextStep = () => {
    setError(null);

    if (currentStep === RefundStep.REFUND_TYPE) {
      setCurrentStep(RefundStep.REFUND_DETAILS);
      calculateFees();
    } else if (currentStep === RefundStep.REFUND_DETAILS) {
      // Validate the refund amount for partial refunds
      if (refundType === RefundType.PARTIAL) {
        const amountInCents = Math.round(parseFloat(refundAmount) * 100);
        
        if (isNaN(amountInCents) || amountInCents <= 0) {
          setError('Please enter a valid refund amount');
          return;
        }

        if (amountInCents > maxRefundableAmount) {
          setError(`Refund amount cannot exceed ${(maxRefundableAmount / 100).toFixed(2)}`);
          return;
        }
      }

      // Move to confirmation step
      setCurrentStep(RefundStep.CONFIRMATION);
    } else if (currentStep === RefundStep.CONFIRMATION) {
      // Process the refund
      processRefund();
    }
  };

  /**
   * Handle back button
   */
  const handleBack = () => {
    if (currentStep === RefundStep.REFUND_DETAILS) {
      setCurrentStep(RefundStep.REFUND_TYPE);
    } else if (currentStep === RefundStep.CONFIRMATION) {
      setCurrentStep(RefundStep.REFUND_DETAILS);
    }
  };

  /**
   * Handle refund type selection
   */
  const handleRefundTypeChange = (value: RefundType) => {
    setRefundType(value);
    setError(null);
  };

  /**
   * Handle refund amount change
   */
  const handleRefundAmountChange = (value: string) => {
    // Allow only numbers and a single decimal point
    const regex = /^(\d+\.?\d*|\.\d+)$/;
    
    if (value === '' || regex.test(value)) {
      setRefundAmount(value);
      setError(null);
    }
  };

  /**
   * Format currency for display
   */
  const formatCurrency = (amount: number): string => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  /**
   * Render the refund type step
   */
  const renderRefundTypeStep = () => {
    return (
      <View style={styles.stepContainer}>
        <SectionHeader title="Refund Type" />
        
        <AppCard>
          <Text style={styles.sectionTitle}>Select Refund Type</Text>
          <Text style={styles.originalTransactionText}>
            Original Transaction: ${formattedTransactionAmount}
          </Text>
          <Text style={styles.maxRefundableText}>
            Maximum Refundable Amount: {formatCurrency(maxRefundableAmount)}
          </Text>
          
          <Divider style={styles.divider} />
          
          <TouchableOpacity
            style={styles.optionContainer}
            onPress={() => handleRefundTypeChange(RefundType.FULL)}
          >
            <RadioButton
              value={RefundType.FULL}
              status={refundType === RefundType.FULL ? 'checked' : 'unchecked'}
              onPress={() => handleRefundTypeChange(RefundType.FULL)}
              color={theme.colors.primary}
            />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Full Refund</Text>
              <Text style={styles.optionDescription}>
                Refund the entire transaction amount
              </Text>
              <Text style={styles.optionAmount}>
                Amount: {formatCurrency(maxRefundableAmount)}
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.optionContainer}
            onPress={() => handleRefundTypeChange(RefundType.PARTIAL)}
          >
            <RadioButton
              value={RefundType.PARTIAL}
              status={refundType === RefundType.PARTIAL ? 'checked' : 'unchecked'}
              onPress={() => handleRefundTypeChange(RefundType.PARTIAL)}
              color={theme.colors.primary}
            />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Partial Refund</Text>
              <Text style={styles.optionDescription}>
                Refund a specific amount
              </Text>
              {refundType === RefundType.PARTIAL && (
                <TextInput
                  mode="outlined"
                  label="Refund Amount"
                  value={refundAmount}
                  onChangeText={handleRefundAmountChange}
                  keyboardType="decimal-pad"
                  style={styles.amountInput}
                  error={!!error && error.includes('amount')}
                  left={<TextInput.Affix text="$" />}
                  outlineColor={theme.colors.textTertiary}
                  activeOutlineColor={theme.colors.primary}
                />
              )}
            </View>
          </TouchableOpacity>
        </AppCard>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    );
  };

  /**
   * Render the refund details step
   */
  const renderRefundDetailsStep = () => {
    return (
      <View style={styles.stepContainer}>
        <SectionHeader title="Refund Details" />
        
        <AppCard>
          <Text style={styles.sectionTitle}>Refund Reason</Text>
          <Text style={styles.sectionDescription}>
            Please select a reason for the refund:
          </Text>
          
          <View style={styles.reasonContainer}>
            {refundReasons.map((reason) => (
              <TouchableOpacity
                key={reason.value}
                style={styles.reasonOption}
                onPress={() => setRefundReason(reason.value)}
              >
                <RadioButton
                  value={reason.value}
                  status={refundReason === reason.value ? 'checked' : 'unchecked'}
                  onPress={() => setRefundReason(reason.value)}
                  color={theme.colors.primary}
                />
                <Text style={styles.reasonText}>{reason.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
          <TextInput
            mode="outlined"
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.notesInput}
            outlineColor={theme.colors.textTertiary}
            activeOutlineColor={theme.colors.primary}
          />
          
          {refundReason === RefundReason.OTHER && (
            <HelperText type="info">
              Please provide details in the notes field when selecting "Other reason"
            </HelperText>
          )}
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Fee Calculation</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : feeCalculation ? (
            <View style={styles.feeContainer}>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Original Amount</Text>
                <Text style={styles.feeValue}>
                  {formatCurrency(feeCalculation.originalAmount)}
                </Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Refund Amount</Text>
                <Text style={styles.feeValue}>
                  {formatCurrency(feeCalculation.refundAmount)}
                </Text>
              </View>
              <Divider style={styles.feeDivider} />
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Stripe Fee Refunded</Text>
                <Text style={styles.feeValue}>
                  {formatCurrency(feeCalculation.stripeFeeRefunded)}
                </Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Platform Fee Refunded</Text>
                <Text style={styles.feeValue}>
                  {formatCurrency(feeCalculation.applicationFeeRefunded)}
                </Text>
              </View>
              <Divider style={styles.feeDivider} />
              <View style={styles.feeRow}>
                <Text style={[styles.feeLabel, styles.totalLabel]}>Total Refund Amount</Text>
                <Text style={[styles.feeValue, styles.totalValue]}>
                  {formatCurrency(feeCalculation.totalRefundAmount)}
                </Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Customer Receives</Text>
                <Text style={styles.feeValue}>
                  {formatCurrency(feeCalculation.netRefundAmount)}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.errorText}>Failed to calculate fees</Text>
          )}
        </AppCard>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    );
  };

  /**
   * Render the confirmation step
   */
  const renderConfirmationStep = () => {
    const refundAmountCents = refundType === RefundType.FULL 
      ? maxRefundableAmount 
      : Math.round(parseFloat(refundAmount) * 100);
    
    return (
      <View style={styles.stepContainer}>
        <SectionHeader title="Confirm Refund" />
        
        <AppCard>
          <Text style={styles.sectionTitle}>Refund Summary</Text>
          
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Refund Type</Text>
              <Text style={styles.summaryValue}>
                {refundType === RefundType.FULL ? 'Full Refund' : 'Partial Refund'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Refund Amount</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(refundAmountCents)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Refund Reason</Text>
              <Text style={styles.summaryValue}>
                {refundReasons.find(r => r.value === refundReason)?.label}
              </Text>
            </View>
            {notes && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Notes</Text>
                <Text style={styles.summaryValue}>{notes}</Text>
              </View>
            )}
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.warningContainer}>
            <MaterialIcons name="warning" size={24} color={theme.colors.warning} />
            <Text style={styles.warningText}>
              This action cannot be undone. The refund will be processed immediately.
            </Text>
          </View>
        </AppCard>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    );
  };

  /**
   * Render the result step
   */
  const renderResultStep = () => {
    let content;
    
    if (isLoading) {
      content = (
        <View style={styles.resultContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.resultTitle}>Processing Refund</Text>
          <Text style={styles.resultDescription}>
            Please wait while we process your refund request...
          </Text>
        </View>
      );
    } else if (refundStatus === RefundStatus.COMPLETED && refundResult) {
      content = (
        <View style={styles.resultContent}>
          <View style={styles.successIcon}>
            <MaterialIcons name="check-circle" size={80} color={theme.colors.success} />
          </View>
          <Text style={styles.resultTitle}>Refund Successful</Text>
          <Text style={styles.resultDescription}>
            The refund has been processed successfully.
          </Text>
          
          <View style={styles.refundDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Refund Amount:</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(refundResult.refund.amount)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID:</Text>
              <Text style={styles.detailValue}>
                {refundResult.transaction.id}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>
                {new Date().toLocaleString()}
              </Text>
            </View>
            
            <Divider style={styles.feeDivider} />
            
            <TouchableOpacity 
              style={styles.viewReceiptButton}
              onPress={() => {
                // Handle viewing receipt - typically navigate to a receipt screen
                Alert.alert('Receipt', 'View receipt functionality would open the receipt here');
              }}
            >
              <MaterialIcons name="receipt" size={20} color={theme.colors.primary} />
              <Text style={styles.viewReceiptText}>View Receipt</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (refundStatus === RefundStatus.FAILED) {
      content = (
        <View style={styles.resultContent}>
          <View style={styles.errorIcon}>
            <MaterialIcons name="error" size={80} color={theme.colors.error} />
          </View>
          <Text style={styles.resultTitle}>Refund Failed</Text>
          <Text style={styles.resultDescription}>
            {error || 'There was an error processing your refund.'}
          </Text>
          <View style={styles.errorActionContainer}>
            <AppButton
              title="Try Again"
              onPress={() => setCurrentStep(RefundStep.CONFIRMATION)}
              mode="primary"
              style={styles.errorButton}
            />
            <AppButton
              title="Contact Support"
              onPress={() => {
                // Handle support contact - typically navigate to support screen
                Alert.alert('Support', 'Contact support functionality would open here');
              }}
              mode="outline"
              style={styles.errorButton}
            />
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.stepContainer}>
        <SectionHeader title="Refund Status" />
        <AppCard>{content}</AppCard>
      </View>
    );
  };

  /**
   * Render the current step content
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case RefundStep.REFUND_TYPE:
        return renderRefundTypeStep();
      case RefundStep.REFUND_DETAILS:
        return renderRefundDetailsStep();
      case RefundStep.CONFIRMATION:
        return renderConfirmationStep();
      case RefundStep.RESULT:
        return renderResultStep();
      default:
        return null;
    }
  };

  /**
   * Render the footer buttons
   */
  const renderFooter = () => {
    // Don't show standard footer buttons on result step
    if (currentStep === RefundStep.RESULT) {
      return (
        <View style={styles.footer}>
          <AppButton
            title="Done"
            onPress={onDismiss}
            style={styles.fullWidthButton}
          />
        </View>
      );
    }
    
    const showBackButton = currentStep > RefundStep.REFUND_TYPE;
    
    let primaryButtonTitle = 'Next';
    let primaryButtonDisabled = isLoading;
    
    if (currentStep === RefundStep.CONFIRMATION) {
      primaryButtonTitle = 'Process Refund';
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
          onPress={handleNextStep}
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
      onDismiss={onDismiss}
      contentContainerStyle={styles.modalContainer}
    >
      <View style={styles.stepsIndicator}>
        {[0, 1, 2, 3].map(step => (
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 15,
  },
  originalTransactionText: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 5,
  },
  maxRefundableText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 15,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  optionContent: {
    flex: 1,
    marginLeft: 10,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  optionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  optionAmount: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
    marginTop: 5,
  },
  amountInput: {
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  reasonContainer: {
    marginVertical: 5,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  reasonText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 10,
  },
  notesInput: {
    backgroundColor: 'transparent',
    marginBottom: 10,
  },
  feeContainer: {
    marginTop: 10,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  feeLabel: {
    fontSize: 14,
    color: theme.colors.text,
  },
  feeValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  totalLabel: {
    fontWeight: '700',
    fontSize: 16,
  },
  totalValue: {
    fontWeight: '700',
    fontSize: 16,
    color: theme.colors.primary,
  },
  feeDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 8,
  },
  summaryContainer: {
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  summaryLabel: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  summaryValue: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(237, 108, 2, 0.1)',
    padding: 15,
    borderRadius: theme.borderRadius.small,
    marginVertical: 10,
    alignItems: 'center',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.warning,
    marginLeft: 10,
  },
  resultContent: {
    alignItems: 'center',
    padding: 20,
  },
  successIcon: {
    marginBottom: 15,
  },
  errorIcon: {
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 10,
  },
  resultDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 15,
  },
  refundDetails: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 15,
    borderRadius: theme.borderRadius.small,
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.text,
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  viewReceiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  viewReceiptText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: 5,
  },
  errorActionContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  errorButton: {
    flex: 1,
    marginHorizontal: 5,
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
  errorText: {
    color: theme.colors.error,
    marginHorizontal: 20,
    marginTop: 10,
  },
});

export default RefundForm;