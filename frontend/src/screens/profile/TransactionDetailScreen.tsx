import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  Share,
  Platform,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Components
import { AppButton, StatusBadge, Text } from '../../components/ui';

// Services & Utils
import { 
  getTransactionDetails, 
  Transaction, 
  TransactionStatus,
  updateTransactionStatus,
  TransactionType
} from '../../services/transactionService';

// Styles & Theme
import { theme, globalStyles } from '../../theme';

// Types
type TransactionDetailRouteParams = {
  transactionId: string;
};

// Convert transaction status to StatusBadge status type
const mapStatusToUiStatus = (status: TransactionStatus): 'pending' | 'completed' | 'cancelled' | 'accepted' => {
  switch (status) {
    case TransactionStatus.PENDING:
      return 'pending';
    case TransactionStatus.COMPLETED:
      return 'completed';
    case TransactionStatus.FAILED:
    case TransactionStatus.CANCELLED:
      return 'cancelled';
    case TransactionStatus.REFUNDED:
      return 'accepted'; // Using 'accepted' for refunded status
    default:
      return 'pending';
  }
};

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const TransactionDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<Record<string, TransactionDetailRouteParams>, string>>();
  const navigation = useNavigation();
  const { transactionId } = route.params;
  
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactionDetails();
  }, [transactionId]);

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);
      const data = await getTransactionDetails(transactionId);
      setTransaction(data);
    } catch (err) {
      console.error('Error fetching transaction details:', err);
      setError('Unable to load transaction details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!transaction) return;
    
    try {
      // In a real app, you would generate a PDF receipt and share it
      // For now, we'll share transaction details as text
      const message = `
Receipt for Transaction: ${transaction.reference}
Date: ${transaction.created_at ? formatDate(transaction.created_at) : 'N/A'}
Amount: ${formatCurrency(transaction.amount)}
Status: ${transaction.status}
Description: ${transaction.description}
      `;
      
      await Share.share({
        message,
        title: `Receipt - ${transaction.reference}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share receipt');
    }
  };

  const handleRequestSupport = () => {
    Alert.alert(
      'Contact Support',
      'Do you want to contact customer support about this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Contact Support', 
          onPress: () => {
            // Navigate to support screen or open support chat
            Alert.alert('Support', 'Support request has been submitted.');
          } 
        },
      ]
    );
  };

  const handleRequestRefund = async () => {
    if (!transaction) return;
    
    Alert.alert(
      'Request Refund',
      'Are you sure you want to request a refund for this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Request Refund', 
          onPress: async () => {
            try {
              setProcessing(true);
              
              // In a real implementation, this would initiate a refund process
              // For now we'll just update the status
              await updateTransactionStatus(
                transaction.id as string, 
                TransactionStatus.REFUNDED,
                { refundRequestedAt: new Date().toISOString() }
              );
              
              // Refresh transaction data
              await fetchTransactionDetails();
              Alert.alert('Success', 'Refund request has been submitted.');
            } catch (err) {
              console.error('Error requesting refund:', err);
              Alert.alert('Error', 'Failed to process refund request. Please try again.');
            } finally {
              setProcessing(false);
            }
          } 
        },
      ]
    );
  };

  // Check if transaction is eligible for refund
  // For this demo, we'll consider transactions that are completed and less than 30 days old
  const isRefundEligible = (): boolean => {
    if (!transaction || !transaction.created_at) return false;
    
    const isCompleted = transaction.status === TransactionStatus.COMPLETED;
    
    // Check if transaction is less than 30 days old
    const transactionDate = new Date(transaction.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const isRecent = transactionDate > thirtyDaysAgo;
    
    return isCompleted && isRecent;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading transaction details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <AppButton 
          title="Try Again" 
          onPress={fetchTransactionDetails}
          mode="primary"
        />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Transaction not found</Text>
        <AppButton 
          title="Go Back" 
          onPress={() => navigation.goBack()}
          mode="primary"
        />
      </View>
    );
  }

  // Extract metadata for UI display
  const metadata = transaction.metadata || {};
  const serviceId = metadata.serviceId;
  const paymentMethod = metadata.paymentMethod || 'Unknown';
  const platformFee = metadata.platformFee || Math.round(transaction.amount * 0.1 * 100) / 100; // Default to 10% if not specified
  const processingFee = metadata.processingFee || Math.round(transaction.amount * 0.03 * 100) / 100; // Default to 3% if not specified
  const serviceAmount = transaction.amount - platformFee - processingFee;
  const providerInfo = metadata.providerInfo || { name: 'Unknown Provider', id: null };
  const customerInfo = metadata.customerInfo || { name: 'Unknown Customer', id: null };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleDownloadReceipt}
          >
            <Ionicons name="share-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView}>
        {/* Transaction Summary Card */}
        <View style={styles.card}>
          <View style={styles.referenceRow}>
            <Text style={styles.referenceText}>{transaction.reference}</Text>
            <StatusBadge 
              status={mapStatusToUiStatus(transaction.status)} 
              size="medium" 
            />
          </View>

          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.dateText}>
              {transaction.created_at ? formatDate(transaction.created_at) : 'N/A'}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Amount Breakdown */}
          <Text style={styles.sectionTitle}>Amount Breakdown</Text>
          
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>{formatCurrency(transaction.amount)}</Text>
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Service Amount</Text>
            <Text style={styles.amountText}>{formatCurrency(serviceAmount)}</Text>
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Platform Fee</Text>
            <Text style={styles.amountText}>{formatCurrency(platformFee)}</Text>
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Processing Fee</Text>
            <Text style={styles.amountText}>{formatCurrency(processingFee)}</Text>
          </View>
        </View>

        {/* Service Details */}
        {serviceId && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Service Details</Text>
            <TouchableOpacity 
              style={styles.serviceLink}
              onPress={() => {
                // Navigate to service details
                navigation.navigate('ServiceDetail', { serviceId });
              }}
            >
              <Text style={styles.serviceLinkText}>{transaction.description}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Payment Method */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethodRow}>
            <Ionicons 
              name={paymentMethod.toLowerCase().includes('credit') ? 'card-outline' : 'wallet-outline'} 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text style={styles.paymentMethodText}>{paymentMethod}</Text>
          </View>
        </View>

        {/* Provider/Customer Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {transaction.type === TransactionType.PAYMENT ? 'Provider Information' : 'Customer Information'}
          </Text>
          <View style={styles.userInfoRow}>
            <Ionicons name="person-outline" size={24} color={theme.colors.primary} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {transaction.type === TransactionType.PAYMENT ? providerInfo.name : customerInfo.name}
              </Text>
              {(transaction.type === TransactionType.PAYMENT && providerInfo.id) || 
              (transaction.type !== TransactionType.PAYMENT && customerInfo.id) ? (
                <TouchableOpacity 
                  style={styles.viewProfileButton}
                  onPress={() => {
                    // Navigate to profile
                    const profileId = transaction.type === TransactionType.PAYMENT ? providerInfo.id : customerInfo.id;
                    navigation.navigate('ProfileScreen', { userId: profileId });
                  }}
                >
                  <Text style={styles.viewProfileText}>View Profile</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <AppButton 
            title="Download Receipt" 
            onPress={handleDownloadReceipt}
            icon={<Ionicons name="download-outline" size={20} color="white" />}
            fullWidth
          />
          
          <AppButton 
            title="Request Support" 
            onPress={handleRequestSupport}
            mode="outline"
            icon={<Ionicons name="help-circle-outline" size={20} color={theme.colors.primary} />}
            fullWidth
          />
          
          {isRefundEligible() && transaction.status !== TransactionStatus.REFUNDED && (
            <AppButton 
              title="Request Refund" 
              onPress={handleRequestRefund}
              mode="danger"
              loading={processing}
              icon={<Ionicons name="return-down-back-outline" size={20} color="white" />}
              fullWidth
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
    marginVertical: 16,
  },
  headerSafeArea: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  headerTitle: {
    ...theme.typography.h2,
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Balance for back button
  },
  scrollView: {
    flex: 1,
  },
  card: {
    ...globalStyles.card,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  referenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  referenceText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  serviceLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.medium,
  },
  serviceLinkText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.primary,
    flex: 1,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: theme.borderRadius.medium,
  },
  paymentMethodText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
    marginLeft: 10,
  },
  userInfoRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: theme.borderRadius.medium,
  },
  userInfo: {
    marginLeft: 10,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  viewProfileButton: {
    marginTop: 6,
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  actionsContainer: {
    padding: 16,
    marginBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  paymentOptionsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: theme.borderRadius.medium,
  },
  paymentOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  paymentOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
    marginLeft: 12,
  },
  errorCard: {
    backgroundColor: theme.colors.errorLight,
    padding: 16,
    borderRadius: theme.borderRadius.medium,
    marginTop: 16,
  },
  errorTitle: {
    color: theme.colors.error,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorMessage: {
    color: theme.colors.error,
    marginBottom: 8,
  },
  errorCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: theme.colors.error,
    marginTop: 8,
  },
});

export default TransactionDetailScreen;