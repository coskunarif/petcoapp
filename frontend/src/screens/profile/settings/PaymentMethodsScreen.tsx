import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, globalStyles } from '../../../theme';
import { Text, AppButton } from '../../../components/ui';
import { BlurView } from 'expo-blur';
import { useStripePayments, PaymentMethod } from '../../../services/stripe/useStripePayments';
import { supabase } from '../../../supabaseClient';

export default function PaymentMethodsScreen({ navigation }: any) {
  const { listPaymentMethods, deletePaymentMethod, setDefaultPaymentMethod, loading, error } = useStripePayments();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState<'provider' | 'customer'>('customer');

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          throw new Error('User not authenticated');
        }

        // Determine if the user is a provider or customer
        // In a real app, you would check this from your database
        // For this demo, we'll set it randomly
        setUserType(Math.random() > 0.5 ? 'provider' : 'customer');

        // Fetch payment methods
        const { paymentMethods: methods, error } = await listPaymentMethods();
        if (error) {
          throw new Error(error);
        }

        setPaymentMethods(methods);
      } catch (err: any) {
        console.error('Error fetching payment methods:', err);
        Alert.alert('Error', err.message || 'Failed to load payment methods');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleSetDefault = async (id: string) => {
    try {
      setIsLoading(true);
      const { success, error } = await setDefaultPaymentMethod(id);
      
      if (!success) {
        throw new Error(error || 'Failed to set default payment method');
      }
      
      // Update the local state
      setPaymentMethods(
        paymentMethods.map(method => ({
          ...method,
          isDefault: method.id === id,
        }))
      );
      
      Alert.alert('Success', 'Default payment method updated');
    } catch (err: any) {
      console.error('Error setting default payment method:', err);
      Alert.alert('Error', err.message || 'Failed to set default payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      setIsLoading(true);
      const { success, error } = await deletePaymentMethod(id);
      
      if (!success) {
        throw new Error(error || 'Failed to remove payment method');
      }
      
      // Update the local state
      setPaymentMethods(paymentMethods.filter(method => method.id !== id));
      
      Alert.alert('Success', 'Payment method removed');
    } catch (err: any) {
      console.error('Error removing payment method:', err);
      Alert.alert('Error', err.message || 'Failed to remove payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => (
    <View style={styles.paymentMethodCard}>
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <View style={styles.cardTypeContainer}>
          <MaterialCommunityIcons
            name={item.type === 'card' ? 'credit-card' : 'bank'}
            size={24}
            color={theme.colors.primary}
          />
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text variant="caption" color="white" style={styles.defaultText}>
                Default
              </Text>
            </View>
          )}
        </View>

        <Text variant="h3" style={styles.cardTitle}>
          {item.brand ? `${item.brand.charAt(0).toUpperCase() + item.brand.slice(1)} ending in ` : ''}
          {item.last4}
        </Text>

        {item.expiryMonth && item.expiryYear && (
          <Text variant="body2" color="textSecondary" style={styles.expiry}>
            Expires: {item.expiryMonth}/{String(item.expiryYear).slice(-2)}
          </Text>
        )}

        <View style={styles.actionContainer}>
          {!item.isDefault && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSetDefault(item.id)}
              disabled={isLoading}
            >
              <MaterialCommunityIcons name="star-outline" size={20} color={theme.colors.primary} />
              <Text variant="button" color="primary" style={styles.actionText}>
                Set as Default
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton]}
            onPress={() => handleRemove(item.id)}
            disabled={isLoading}
          >
            <MaterialCommunityIcons name="delete-outline" size={20} color={theme.colors.error} />
            <Text variant="button" color="error" style={styles.actionText}>
              Remove
            </Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="body" style={styles.loadingText}>
            Loading payment methods...
          </Text>
        </View>
      );
    }

    return (
      <>
        <FlatList
          data={paymentMethods}
          renderItem={renderPaymentMethod}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="credit-card-outline"
                size={60}
                color={theme.colors.textTertiary}
              />
              <Text variant="body" color="textSecondary" style={styles.emptyText}>
                You haven't added any payment methods yet.
              </Text>
            </View>
          }
        />

        <AppButton
          title="Add New Payment Method"
          onPress={() => navigation.navigate('AddPaymentMethod')}
          fullWidth
          style={styles.addButton}
          icon="plus"
          disabled={isLoading}
        />

        {userType === 'provider' && (
          <AppButton
            title="Stripe Connect Setup"
            onPress={() => navigation.navigate('StripeConnectSetup')}
            fullWidth
            style={styles.connectButton}
            icon="bank"
            variant="outlined"
            disabled={isLoading}
          />
        )}

        <Text variant="caption" color="textTertiary" style={styles.securityNote}>
          Your payment information is securely encrypted. We use Stripe, a PCI Service Provider Level 1 company, which is the highest level of certification available.
        </Text>
      </>
    );
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="h2">Payment Methods</Text>
        <View style={{ width: 40 }} /> {/* Empty space for balance */}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
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
  paymentMethodCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...theme.elevation.medium,
  },
  blurContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
  },
  cardTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  defaultBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 10,
  },
  cardTitle: {
    marginTop: 4,
    marginBottom: 8,
  },
  expiry: {
    marginBottom: 16,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionText: {
    marginLeft: 4,
  },
  removeButton: {
    marginLeft: 8,
  },
  addButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  connectButton: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 32,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  securityNote: {
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});