import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, globalStyles } from '../../../theme';
import { Text, AppButton } from '../../../components/ui';
import { BlurView } from 'expo-blur';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  name: string;
  lastFour: string;
  expiry?: string;
  isDefault: boolean;
}

// Sample data for UI display
const SAMPLE_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    name: 'Visa ending in',
    lastFour: '4242',
    expiry: '12/25',
    isDefault: true,
  },
  {
    id: '2',
    type: 'card',
    name: 'Mastercard ending in',
    lastFour: '8790',
    expiry: '09/24',
    isDefault: false,
  },
];

export default function PaymentMethodsScreen({ navigation }: any) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(SAMPLE_PAYMENT_METHODS);

  const handleSetDefault = (id: string) => {
    setPaymentMethods(
      paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  const handleRemove = (id: string) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
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
          {item.name} {item.lastFour}
        </Text>

        {item.expiry && (
          <Text variant="body2" color="textSecondary" style={styles.expiry}>
            Expires: {item.expiry}
          </Text>
        )}

        <View style={styles.actionContainer}>
          {!item.isDefault && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSetDefault(item.id)}
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
          onPress={() => console.log('Add payment method')}
          fullWidth
          style={styles.addButton}
          icon="plus"
        />

        <Text variant="caption" color="textTertiary" style={styles.securityNote}>
          Your payment information is securely encrypted. We use industry-standard security measures to protect your data.
        </Text>
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
  securityNote: {
    textAlign: 'center',
    marginTop: 16,
  },
});