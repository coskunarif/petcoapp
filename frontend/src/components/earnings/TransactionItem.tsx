import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Transaction } from '../../redux/slices/earningsSlice';
import StatusBadge from '../ui/StatusBadge';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
}

const TransactionItem = ({ transaction, onPress }: TransactionItemProps) => {
  const theme = useTheme();

  const getTransactionIcon = () => {
    switch (transaction.transaction_type) {
      case 'service_payment':
        return 'paw-outline';
      case 'payout':
        return 'wallet-outline';
      case 'refund':
        return 'arrow-undo-outline';
      default:
        return 'cash-outline';
    }
  };

  const getTransactionColor = () => {
    switch (transaction.transaction_type) {
      case 'service_payment':
        return theme.colors.primary;
      case 'payout':
        return '#f44336';
      case 'refund':
        return '#ff9800';
      default:
        return theme.colors.primary;
    }
  };

  const getStatusLabel = (status: string): { label: string; type: 'success' | 'warning' | 'error' | 'info' } => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', type: 'success' };
      case 'pending':
        return { label: 'Pending', type: 'warning' };
      case 'cancelled':
        return { label: 'Cancelled', type: 'error' };
      default:
        return { label: status, type: 'info' };
    }
  };

  const statusInfo = getStatusLabel(transaction.status);

  const handlePress = () => {
    if (onPress) {
      onPress(transaction);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: getTransactionColor() }]}>
        <Ionicons name={getTransactionIcon()} size={20} color="white" />
      </View>
      
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text variant="bodyLarge" style={styles.description} numberOfLines={1}>
            {transaction.description}
          </Text>
          <Text 
            variant="bodyLarge" 
            style={[
              styles.amount, 
              transaction.transaction_type === 'payout' || transaction.transaction_type === 'refund' 
                ? styles.negative 
                : styles.positive
            ]}
          >
            {transaction.transaction_type === 'payout' || transaction.transaction_type === 'refund' ? '-' : '+'}
            {formatCurrency(transaction.amount)}
          </Text>
        </View>
        
        <View style={styles.bottomRow}>
          <Text variant="bodySmall" style={styles.date}>
            {formatDate(transaction.created_at, 'short')}
          </Text>
          <StatusBadge type={statusInfo.type} label={statusInfo.label} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  description: {
    flex: 1,
    fontWeight: '500',
    marginRight: 8,
  },
  amount: {
    fontWeight: '600',
  },
  positive: {
    color: '#4caf50',
  },
  negative: {
    color: '#f44336',
  },
  date: {
    color: '#888',
  },
});

export default TransactionItem;