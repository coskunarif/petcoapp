import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput as RNTextInput,
  Modal,
  RefreshControl,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { Chip } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { useSelector } from 'react-redux';

import {
  getTransactionHistory,
  TransactionHistoryParams,
  Transaction,
  TransactionType,
  TransactionStatus,
  TransactionCategory,
  getTransactionDetails,
  TransactionSummary,
  getTransactionStatistics,
} from '../../services/transactionService';
import { StatusBadge, AppButton, EmptyState, Text, AppCard } from '../../components/ui';
import { theme, globalStyles } from '../../theme';
import { RootState } from '../../redux/store';

interface TransactionFilterState {
  startDate: Date | null;
  endDate: Date | null;
  type: TransactionType | null;
  status: TransactionStatus | null;
  category: TransactionCategory | null;
  search: string;
}

type SortOption = 'newest' | 'oldest' | 'amountHighToLow' | 'amountLowToHigh';

const TransactionHistoryScreen: React.FC = () => {
  // Get current user id from redux store
  const userId = useSelector((state: RootState) => state.auth.user?.id || '');
  const navigation = useNavigation();

  // State for transactions and UI
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionSummary, setTransactionSummary] = useState<TransactionSummary | null>(null);
  const [filters, setFilters] = useState<TransactionFilterState>({
    startDate: null,
    endDate: null,
    type: null,
    status: null,
    category: null,
    search: '',
  });
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [statistics, setStatistics] = useState<Record<string, number> | null>(null);

  // Load transactions
  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build params
      const params: TransactionHistoryParams = {
        userId: userId,
        limit: 50,
      };

      // Apply filters if set
      if (filters.startDate) {
        params.startDate = filters.startDate.toISOString();
      }
      if (filters.endDate) {
        params.endDate = filters.endDate.toISOString();
      }
      if (filters.type) {
        params.type = filters.type;
      }
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.category) {
        params.category = filters.category;
      }

      // Fetch transactions
      const summary = await getTransactionHistory(params);
      setTransactionSummary(summary);

      // Also load statistics
      const stats = await getTransactionStatistics(userId, 'month');
      setStatistics(stats);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId, filters]);

  // Load transactions on mount and when filters change
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadTransactions();
  }, [loadTransactions]);

  // Apply filters
  const applyFilters = useCallback(() => {
    setShowFilters(false);
    loadTransactions();
  }, [loadTransactions]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      startDate: null,
      endDate: null,
      type: null,
      status: null,
      category: null,
      search: '',
    });
    setShowFilters(false);
    loadTransactions();
  }, [loadTransactions]);

  // View transaction details
  const viewTransactionDetails = useCallback(async (transaction: Transaction) => {
    try {
      setIsLoading(true);
      const details = await getTransactionDetails(transaction.id!);
      setSelectedTransaction(details);
      setShowTransactionDetails(true);
    } catch (err) {
      console.error('Error loading transaction details:', err);
      Alert.alert('Error', 'Failed to load transaction details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    if (!transactionSummary?.transactions) return [];

    let filtered = [...transactionSummary.transactions];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((tx) => {
        return (
          tx.description.toLowerCase().includes(searchLower) ||
          tx.reference.toLowerCase().includes(searchLower) ||
          (tx.category && tx.category.toLowerCase().includes(searchLower))
        );
      });
    }

    // Apply sorting
    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime());
        break;
      case 'amountHighToLow':
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case 'amountLowToHigh':
        filtered.sort((a, b) => a.amount - b.amount);
        break;
    }

    return filtered;
  }, [transactionSummary, filters.search, sortOption]);

  // Export transactions as CSV
  const exportTransactionsCSV = useCallback(async () => {
    try {
      if (!filteredTransactions.length) {
        Alert.alert('No Data', 'There are no transactions to export.');
        return;
      }

      const headers = 'ID,Date,Type,Status,Amount,Reference,Description,Category\n';
      const rows = filteredTransactions.map(tx => {
        return `"${tx.id}","${tx.created_at}","${tx.type}","${tx.status}","${tx.amount}","${tx.reference}","${tx.description}","${tx.category || ''}"\n`;
      }).join('');

      const csvContent = headers + rows;
      const fileName = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, csvContent);
      
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        await Sharing.shareAsync(filePath);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Export Failed', 'Failed to export transactions. Please try again.');
    }
  }, [filteredTransactions]);

  // Export transactions as PDF
  const exportTransactionsPDF = useCallback(async () => {
    try {
      if (!filteredTransactions.length) {
        Alert.alert('No Data', 'There are no transactions to export.');
        return;
      }

      // Create HTML table for PDF
      const tableRows = filteredTransactions.map(tx => {
        const date = new Date(tx.created_at!).toLocaleDateString();
        const formattedAmount = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(tx.amount);

        return `
          <tr>
            <td>${date}</td>
            <td>${tx.type}</td>
            <td>${tx.status}</td>
            <td>${formattedAmount}</td>
            <td>${tx.description}</td>
            <td>${tx.category || ''}</td>
          </tr>
        `;
      }).join('');

      const htmlContent = `
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica'; padding: 20px; }
            h1 { color: #6C63FF; text-align: center; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #6C63FF; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 30px; }
            .date { text-align: center; margin-bottom: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Transaction History</h1>
          </div>
          <div class="date">Generated on ${new Date().toLocaleDateString()}</div>
          <table>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Category</th>
            </tr>
            ${tableRows}
          </table>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Export Failed', 'Failed to export transactions. Please try again.');
    }
  }, [filteredTransactions]);

  // Render transaction item
  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const date = new Date(item.created_at!).toLocaleDateString();
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(item.amount);

    // Icon based on transaction type
    const getTransactionIcon = () => {
      switch (item.type) {
        case TransactionType.PAYMENT:
          return 'cash';
        case TransactionType.REFUND:
          return 'cash-refund';
        case TransactionType.CREDIT_PURCHASE:
          return 'credit-card-plus';
        case TransactionType.CREDIT_USAGE:
          return 'credit-card-minus';
        case TransactionType.SERVICE_PAYMENT:
          return 'paw';
        case TransactionType.WITHDRAWAL:
          return 'bank-transfer-out';
        default:
          return 'currency-usd';
      }
    };

    return (
      <TouchableOpacity onPress={() => viewTransactionDetails(item)}>
        <View style={styles.transactionItem}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={getTransactionIcon()}
              size={28}
              color={theme.colors.primary}
            />
          </View>

          <View style={styles.transactionDetails}>
            <View style={styles.transactionHeader}>
              <Text style={styles.transactionTitle} numberOfLines={1}>
                {item.description}
              </Text>
              <Text style={[
                styles.transactionAmount,
                item.type === TransactionType.REFUND ? styles.amountNegative : {}
              ]}>
                {item.type === TransactionType.REFUND ? '-' : ''}{formattedAmount}
              </Text>
            </View>

            <View style={styles.transactionSubDetails}>
              <Text style={styles.transactionDate}>{date}</Text>
              <StatusBadge
                status={item.status as 'pending' | 'completed' | 'cancelled'}
                size="small"
              />
            </View>

            {item.category && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={globalStyles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transaction History</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowFilters(true)}
            >
              <MaterialCommunityIcons
                name="filter-variant"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                Alert.alert(
                  'Export Transactions',
                  'Choose export format',
                  [
                    { text: 'CSV', onPress: exportTransactionsCSV },
                    { text: 'PDF', onPress: exportTransactionsPDF },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                );
              }}
            >
              <MaterialCommunityIcons
                name="export-variant"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={theme.colors.textTertiary}
            />
            <RNTextInput
              style={styles.searchInput}
              placeholder="Search transactions"
              placeholderTextColor={theme.colors.textTertiary}
              value={filters.search}
              onChangeText={(text) => setFilters(prev => ({ ...prev, search: text }))}
            />
            {filters.search.length > 0 && (
              <TouchableOpacity
                onPress={() => setFilters(prev => ({ ...prev, search: '' }))}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color={theme.colors.textTertiary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Sort selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortContainer}
        >
          <TouchableOpacity
            style={[
              styles.sortOption,
              sortOption === 'newest' && styles.selectedSortOption
            ]}
            onPress={() => setSortOption('newest')}
          >
            <Text
              style={[
                styles.sortText,
                sortOption === 'newest' && styles.selectedSortText
              ]}
            >
              Newest
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortOption,
              sortOption === 'oldest' && styles.selectedSortOption
            ]}
            onPress={() => setSortOption('oldest')}
          >
            <Text
              style={[
                styles.sortText,
                sortOption === 'oldest' && styles.selectedSortText
              ]}
            >
              Oldest
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortOption,
              sortOption === 'amountHighToLow' && styles.selectedSortOption
            ]}
            onPress={() => setSortOption('amountHighToLow')}
          >
            <Text
              style={[
                styles.sortText,
                sortOption === 'amountHighToLow' && styles.selectedSortText
              ]}
            >
              Amount (High to Low)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortOption,
              sortOption === 'amountLowToHigh' && styles.selectedSortOption
            ]}
            onPress={() => setSortOption('amountLowToHigh')}
          >
            <Text
              style={[
                styles.sortText,
                sortOption === 'amountLowToHigh' && styles.selectedSortText
              ]}
            >
              Amount (Low to High)
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Active filters display */}
        {(filters.startDate || filters.endDate || filters.type || filters.status || filters.category) && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeFiltersContainer}
          >
            {filters.startDate && (
              <Chip
                mode="outlined"
                style={styles.filterChip}
                onClose={() => setFilters(prev => ({ ...prev, startDate: null }))}
              >
                From: {filters.startDate.toLocaleDateString()}
              </Chip>
            )}
            
            {filters.endDate && (
              <Chip
                mode="outlined"
                style={styles.filterChip}
                onClose={() => setFilters(prev => ({ ...prev, endDate: null }))}
              >
                To: {filters.endDate.toLocaleDateString()}
              </Chip>
            )}
            
            {filters.type && (
              <Chip
                mode="outlined"
                style={styles.filterChip}
                onClose={() => setFilters(prev => ({ ...prev, type: null }))}
              >
                Type: {filters.type}
              </Chip>
            )}
            
            {filters.status && (
              <Chip
                mode="outlined"
                style={styles.filterChip}
                onClose={() => setFilters(prev => ({ ...prev, status: null }))}
              >
                Status: {filters.status}
              </Chip>
            )}
            
            {filters.category && (
              <Chip
                mode="outlined"
                style={styles.filterChip}
                onClose={() => setFilters(prev => ({ ...prev, category: null }))}
              >
                Category: {filters.category}
              </Chip>
            )}
            
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={resetFilters}
            >
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Summary card */}
        {statistics && (
          <AppCard style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Monthly Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemValue}>
                  ${statistics.totalSpent?.toFixed(2) || '0.00'}
                </Text>
                <Text style={styles.summaryItemLabel}>Spent</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemValue}>
                  ${statistics.totalEarned?.toFixed(2) || '0.00'}
                </Text>
                <Text style={styles.summaryItemLabel}>Earned</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemValue}>
                  {statistics.count || 0}
                </Text>
                <Text style={styles.summaryItemLabel}>Transactions</Text>
              </View>
            </View>
          </AppCard>
        )}

        {/* Transaction list */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <AppButton 
              title="Retry" 
              onPress={loadTransactions}
              mode="primary"
            />
          </View>
        ) : filteredTransactions.length === 0 ? (
          <EmptyState
            icon="credit-card-outline"
            title="No Transactions Found"
            description={
              Object.values(filters).some(f => f !== null && f !== '')
                ? "Try adjusting your filters to see more results."
                : "You don't have any transactions yet."
            }
            buttonTitle="Refresh"
            onButtonPress={handleRefresh}
          />
        ) : (
          <FlatList
            data={filteredTransactions}
            renderItem={renderTransactionItem}
            keyExtractor={item => item.id!}
            contentContainerStyle={styles.transactionList}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
              />
            }
          />
        )}

        {/* Filters modal */}
        <Modal
          visible={showFilters}
          animationType="slide"
          transparent
          onRequestClose={() => setShowFilters(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.filtersContainer}>
              <View style={styles.filtersHeader}>
                <Text style={styles.filtersTitle}>Filters</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.filtersScrollView}>
                {/* Date filters */}
                <Text style={styles.filterSectionTitle}>Date Range</Text>

                <View style={styles.dateFilterRow}>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker('start')}
                  >
                    <Text style={styles.datePickerButtonText}>
                      {filters.startDate ? filters.startDate.toLocaleDateString() : 'Start Date'}
                    </Text>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>

                  <Text style={styles.dateRangeSeparator}>to</Text>

                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker('end')}
                  >
                    <Text style={styles.datePickerButtonText}>
                      {filters.endDate ? filters.endDate.toLocaleDateString() : 'End Date'}
                    </Text>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Transaction type filter */}
                <Text style={styles.filterSectionTitle}>Transaction Type</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterOptionsContainer}
                >
                  {Object.values(TransactionType).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.filterOption,
                        filters.type === type && styles.selectedFilterOption
                      ]}
                      onPress={() => setFilters(prev => ({
                        ...prev,
                        type: prev.type === type ? null : type
                      }))}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          filters.type === type && styles.selectedFilterOptionText
                        ]}
                      >
                        {type.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Transaction status filter */}
                <Text style={styles.filterSectionTitle}>Status</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterOptionsContainer}
                >
                  {Object.values(TransactionStatus).map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.filterOption,
                        filters.status === status && styles.selectedFilterOption
                      ]}
                      onPress={() => setFilters(prev => ({
                        ...prev,
                        status: prev.status === status ? null : status
                      }))}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          filters.status === status && styles.selectedFilterOptionText
                        ]}
                      >
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Category filter */}
                <Text style={styles.filterSectionTitle}>Category</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterOptionsContainer}
                >
                  {Object.values(TransactionCategory).map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.filterOption,
                        filters.category === category && styles.selectedFilterOption
                      ]}
                      onPress={() => setFilters(prev => ({
                        ...prev,
                        category: prev.category === category ? null : category
                      }))}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          filters.category === category && styles.selectedFilterOptionText
                        ]}
                      >
                        {category.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </ScrollView>

              <View style={styles.filterActions}>
                <AppButton
                  title="Reset"
                  onPress={resetFilters}
                  mode="outline"
                  style={styles.filterActionButton}
                />
                <AppButton
                  title="Apply"
                  onPress={applyFilters}
                  mode="primary"
                  style={styles.filterActionButton}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Date picker */}
        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={
              showDatePicker === 'start'
                ? filters.startDate || new Date()
                : filters.endDate || new Date()
            }
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              if (event.type === 'set' && selectedDate) {
                setFilters(prev => ({
                  ...prev,
                  [showDatePicker === 'start' ? 'startDate' : 'endDate']: selectedDate
                }));
              }
              setShowDatePicker(null);
            }}
          />
        )}

        {/* Transaction details modal */}
        <Modal
          visible={showTransactionDetails}
          animationType="slide"
          transparent
          onRequestClose={() => setShowTransactionDetails(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.transactionDetailsContainer}>
              <View style={styles.transactionDetailsHeader}>
                <Text style={styles.transactionDetailsTitle}>Transaction Details</Text>
                <TouchableOpacity onPress={() => setShowTransactionDetails(false)}>
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
              </View>

              {selectedTransaction && (
                <ScrollView style={styles.transactionDetailsScrollView}>
                  <View style={styles.transactionDetailAmount}>
                    <Text style={styles.transactionDetailAmountText}>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(selectedTransaction.amount)}
                    </Text>
                    <StatusBadge
                      status={selectedTransaction.status as 'pending' | 'completed' | 'cancelled'}
                      size="medium"
                      style={styles.detailStatusBadge}
                    />
                  </View>

                  <View style={styles.transactionDetailRow}>
                    <Text style={styles.transactionDetailLabel}>Description</Text>
                    <Text style={styles.transactionDetailValue}>
                      {selectedTransaction.description}
                    </Text>
                  </View>

                  <View style={styles.transactionDetailRow}>
                    <Text style={styles.transactionDetailLabel}>Type</Text>
                    <Text style={styles.transactionDetailValue}>
                      {selectedTransaction.type.replace('_', ' ')}
                    </Text>
                  </View>

                  <View style={styles.transactionDetailRow}>
                    <Text style={styles.transactionDetailLabel}>Reference</Text>
                    <Text style={styles.transactionDetailValue}>
                      {selectedTransaction.reference}
                    </Text>
                  </View>

                  {selectedTransaction.category && (
                    <View style={styles.transactionDetailRow}>
                      <Text style={styles.transactionDetailLabel}>Category</Text>
                      <Text style={styles.transactionDetailValue}>
                        {selectedTransaction.category.replace('_', ' ')}
                      </Text>
                    </View>
                  )}

                  <View style={styles.transactionDetailRow}>
                    <Text style={styles.transactionDetailLabel}>Date</Text>
                    <Text style={styles.transactionDetailValue}>
                      {new Date(selectedTransaction.created_at!).toLocaleString()}
                    </Text>
                  </View>

                  {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
                    <>
                      <Text style={styles.metadataTitle}>Additional Information</Text>
                      {Object.entries(selectedTransaction.metadata).map(([key, value]) => (
                        <View key={key} style={styles.transactionDetailRow}>
                          <Text style={styles.transactionDetailLabel}>
                            {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}
                          </Text>
                          <Text style={styles.transactionDetailValue}>
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </Text>
                        </View>
                      ))}
                    </>
                  )}
                </ScrollView>
              )}

              <AppButton
                title="Close"
                onPress={() => setShowTransactionDetails(false)}
                mode="outline"
                style={styles.closeButton}
              />
            </View>
          </View>
        </Modal>

        {/* iOS DatePicker Modal */}
        {Platform.OS === 'ios' && showDatePicker && (
          <Modal
            visible={!!showDatePicker}
            animationType="slide"
            transparent
            onRequestClose={() => setShowDatePicker(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.datePickerContainer}>
                <View style={styles.datePickerHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(null)}>
                    <Text style={styles.datePickerCancelButton}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.datePickerTitle}>
                    Select {showDatePicker === 'start' ? 'Start' : 'End'} Date
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (showDatePicker === 'start' || showDatePicker === 'end') {
                        const selectedValue = showDatePicker === 'start'
                          ? filters.startDate || new Date()
                          : filters.endDate || new Date();
                        
                        setFilters(prev => ({
                          ...prev,
                          [showDatePicker === 'start' ? 'startDate' : 'endDate']: selectedValue
                        }));
                      }
                      setShowDatePicker(null);
                    }}
                  >
                    <Text style={styles.datePickerDoneButton}>Done</Text>
                  </TouchableOpacity>
                </View>
                
                <DateTimePicker
                  value={
                    showDatePicker === 'start'
                      ? filters.startDate || new Date()
                      : filters.endDate || new Date()
                  }
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setFilters(prev => ({
                        ...prev,
                        [showDatePicker === 'start' ? 'startDate' : 'endDate']: selectedDate
                      }));
                    }
                  }}
                  style={styles.iosDatePicker}
                />
              </View>
            </View>
          </Modal>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    color: theme.colors.text,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: 'rgba(0,0,0,0.03)',
    marginRight: 8,
  },
  selectedSortOption: {
    backgroundColor: theme.colors.primaryLight,
  },
  sortText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  selectedSortText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: 'rgba(108,99,255,0.1)',
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'center',
  },
  clearFiltersText: {
    color: theme.colors.error,
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
  },
  transactionList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  transactionItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    marginBottom: 8,
    padding: 16,
    ...theme.elevation.small,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(108,99,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.success,
    textAlign: 'right',
  },
  amountNegative: {
    color: theme.colors.error,
  },
  transactionSubDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  categoryTag: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  categoryText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filtersContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    minHeight: '70%',
    maxHeight: '90%',
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  filtersScrollView: {
    padding: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  dateFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  datePickerButtonText: {
    color: theme.colors.text,
  },
  dateRangeSeparator: {
    marginHorizontal: 8,
    color: theme.colors.textSecondary,
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: 'rgba(0,0,0,0.03)',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedFilterOption: {
    backgroundColor: theme.colors.primaryLight,
  },
  filterOptionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  selectedFilterOptionText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  filterActionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  datePickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  datePickerCancelButton: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  datePickerDoneButton: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  iosDatePicker: {
    height: 200,
  },
  transactionDetailsContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    minHeight: '50%',
    maxHeight: '90%',
  },
  transactionDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  transactionDetailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  transactionDetailsScrollView: {
    padding: 16,
  },
  transactionDetailAmount: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  transactionDetailAmountText: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  detailStatusBadge: {
    marginTop: 8,
  },
  transactionDetailRow: {
    marginBottom: 16,
  },
  transactionDetailLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  transactionDetailValue: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  metadataTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  closeButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryItemValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  summaryItemLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});

export default TransactionHistoryScreen;