import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, globalStyles } from '../../theme';
import { useSelector } from 'react-redux';
import { supabase } from '../../supabaseClient';

// Mock data for payment methods
const mockPaymentMethods = [
  {
    id: '1',
    type: 'credit',
    brand: 'Visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2025,
    isDefault: true,
    icon: 'credit-card',
  },
  {
    id: '2',
    type: 'credit',
    brand: 'Mastercard',
    last4: '8888',
    expMonth: 9,
    expYear: 2024,
    isDefault: false,
    icon: 'credit-card',
  },
];

// Mock data for transactions
const mockTransactions = [
  {
    id: '1',
    type: 'payment',
    amount: '35.00',
    description: 'Dog Walking - 1 hour',
    date: '2025-05-10',
    status: 'completed',
  },
  {
    id: '2',
    type: 'payment',
    amount: '50.00',
    description: 'Grooming - Standard',
    date: '2025-05-05',
    status: 'completed',
  },
  {
    id: '3',
    type: 'payment',
    amount: '120.00',
    description: 'Pet Sitting - Weekend',
    date: '2025-05-01',
    status: 'completed',
  },
];

interface PaymentMethodsSectionProps {
  navigation: any;
}

const PaymentMethodsSection: React.FC<PaymentMethodsSectionProps> = ({ navigation }) => {
  const [isProvider, setIsProvider] = useState(false);
  const [loading, setLoading] = useState(true);
  const userId = useSelector((state: any) => state.auth?.user?.id);

  useEffect(() => {
    const checkProviderStatus = async () => {
      try {
        if (!userId) {
          return;
        }
        
        // Check if the user is a provider by looking for a provider_profile
        const { data, error } = await supabase
          .from('provider_profiles')
          .select('id')
          .eq('user_id', userId)
          .single();
        
        if (data) {
          setIsProvider(true);
        }
      } catch (error) {
        console.error('Error checking provider status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkProviderStatus();
  }, [userId]);

  // Handler for adding a new payment method
  const handleAddPaymentMethod = () => {
    Alert.alert('Add Payment Method', 'This would open the payment method form');
  };

  // Handler for viewing a payment method's details
  const handlePaymentMethodPress = (item: any) => {
    Alert.alert('Payment Method Details', `${item.brand} ending in ${item.last4}`);
  };

  // Handler for viewing transaction history
  const handleViewAllTransactions = () => {
    Alert.alert('Transaction History', 'This would navigate to the full transaction history');
  };
  
  // Handler for navigating to Stripe Connect Setup
  const handleStripeConnectSetup = () => {
    navigation.navigate('StripeConnectSetup');
  };

  // Render each payment method
  const renderPaymentMethod = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.paymentMethodItem}
      onPress={() => handlePaymentMethodPress(item)}
    >
      <MaterialCommunityIcons
        name={item.icon as any}
        size={28}
        color={theme.colors.primary}
      />
      <View style={styles.paymentMethodInfo}>
        <Text style={styles.paymentMethodTitle}>
          {item.brand} •••• {item.last4}
          {item.isDefault && <Text style={styles.defaultBadge}> (Default)</Text>}
        </Text>
        <Text style={styles.paymentMethodExpiry}>
          Expires {item.expMonth}/{item.expYear}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={theme.colors.textTertiary}
      />
    </TouchableOpacity>
  );

  // Render each transaction
  const renderTransaction = ({ item, index }: { item: any, index: number }) => (
    <TouchableOpacity style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <MaterialCommunityIcons
          name={item.type === 'payment' ? 'cash-minus' : 'cash-plus'}
          size={20}
          color={item.type === 'payment' ? '#FF5252' : '#4CAF50'}
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <Text 
        style={[
          styles.transactionAmount, 
          { color: item.type === 'payment' ? '#FF5252' : '#4CAF50' }
        ]}
      >
        {item.type === 'payment' ? '-' : '+'} ${item.amount}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Payment Methods Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddPaymentMethod}
        >
          <MaterialCommunityIcons 
            name="plus" 
            size={20} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
      
      {/* Payment Methods List */}
      {mockPaymentMethods.length > 0 ? (
        <View style={styles.paymentMethodsContainer}>
          {mockPaymentMethods.map(method => renderPaymentMethod({ item: method }))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons 
            name="credit-card-outline" 
            size={40} 
            color={theme.colors.primary} 
          />
          <Text style={styles.emptyTitle}>No payment methods</Text>
          <Text style={styles.emptySubtitle}>
            Add a payment method to easily pay for services
          </Text>
        </View>
      )}
      
      {/* Stripe Connect for providers */}
      {isProvider && (
        <TouchableOpacity 
          style={styles.stripeConnectButton} 
          onPress={handleStripeConnectSetup}
        >
          <View style={styles.stripeConnectContent}>
            <MaterialCommunityIcons name="bank" size={24} color={theme.colors.primary} />
            <View style={styles.stripeConnectTextContainer}>
              <Text style={styles.stripeConnectTitle}>Stripe Connect Setup</Text>
              <Text style={styles.stripeConnectSubtitle}>
                Receive payments for your pet care services
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      )}

      {/* Transaction History Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={handleViewAllTransactions}
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction List */}
      {mockTransactions.length > 0 ? (
        <View style={styles.transactionsContainer}>
          {mockTransactions.slice(0, 3).map((transaction, index) => (
            renderTransaction({ item: transaction, index })
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons 
            name="receipt" 
            size={40} 
            color={theme.colors.primary} 
          />
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptySubtitle}>
            Your transaction history will appear here
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h2,
    fontSize: 20,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  viewAllText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  paymentMethodsContainer: {
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    ...theme.elevation.small,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  paymentMethodTitle: {
    ...theme.typography.body,
    fontWeight: '600',
  },
  paymentMethodExpiry: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  defaultBadge: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  // Stripe Connect styles
  stripeConnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    ...theme.elevation.small,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
  stripeConnectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stripeConnectTextContainer: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  stripeConnectTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  stripeConnectSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  transactionsContainer: {
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    ...theme.elevation.small,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    ...theme.typography.body,
    fontWeight: '500',
  },
  transactionDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  transactionAmount: {
    ...theme.typography.body,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    ...theme.elevation.small,
  },
  emptyTitle: {
    ...theme.typography.h3,
    marginTop: theme.spacing.md,
  },
  emptySubtitle: {
    ...theme.typography.caption,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});

export default PaymentMethodsSection;