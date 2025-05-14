import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card, useTheme, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui';
import TransactionItem from './TransactionItem';
import { Transaction } from '../../redux/slices/earningsSlice';
import EmptyState from '../ui/EmptyState';

interface TransactionsListProps {
  transactions: Transaction[];
  loading: boolean;
  onTransactionPress?: (transaction: Transaction) => void;
  onViewAllPress?: () => void;
  limit?: number;
}

const TransactionsList = ({
  transactions,
  loading,
  onTransactionPress,
  onViewAllPress,
  limit,
}: TransactionsListProps) => {
  const theme = useTheme();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!transactions) return;
    
    let filtered = [...transactions];
    
    if (filter) {
      filtered = filtered.filter(t => t.transaction_type === filter);
    }
    
    // Apply limit if specified and show most recent first
    filtered = filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    if (limit && filtered.length > limit) {
      filtered = filtered.slice(0, limit);
    }
    
    setFilteredTransactions(filtered);
  }, [transactions, filter, limit]);

  const renderFilterChip = (type: string, label: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        filter === type ? { backgroundColor: theme.colors.primary } : null,
      ]}
      onPress={() => setFilter(filter === type ? null : type)}
    >
      <Ionicons
        name={icon}
        size={16}
        color={filter === type ? 'white' : '#666'}
      />
      <Text
        style={[
          styles.filterText,
          filter === type ? { color: 'white' } : null,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>
            Transactions
          </Text>
          {onViewAllPress && transactions.length > 0 && (
            <TouchableOpacity onPress={onViewAllPress}>
              <Text style={{ color: theme.colors.primary }}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {transactions.length > 0 && (
          <View style={styles.filters}>
            {renderFilterChip('service_payment', 'Earnings', 'paw-outline')}
            {renderFilterChip('payout', 'Payouts', 'wallet-outline')}
            {renderFilterChip('refund', 'Refunds', 'arrow-undo-outline')}
          </View>
        )}

        <Divider style={styles.divider} />

        {filteredTransactions.length === 0 ? (
          <EmptyState
            icon="cash-outline"
            title="No Transactions"
            message={
              filter
                ? `No ${filter.replace('_', ' ')} transactions found for this period`
                : "You don't have any transactions yet"
            }
          />
        ) : (
          <FlatList
            data={filteredTransactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TransactionItem
                transaction={item}
                onPress={onTransactionPress}
              />
            )}
            scrollEnabled={false}
          />
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 1,
  },
  content: {
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: '600',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  divider: {
    marginBottom: 8,
  },
  loadingContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TransactionsList;