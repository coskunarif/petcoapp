import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Animated, 
  ActivityIndicator,
  Platform,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  fetchProviderTransactions, 
  fetchEarningsSummary,
  setSelectedPeriod,
  selectEarningsSummary,
  selectEarningsSummaryLoading,
  selectEarningsSummaryError,
  selectTransactions,
  selectTransactionsLoading,
  selectTransactionsError,
  selectSelectedPeriod,
  type Transaction
} from '../../redux/slices/earningsSlice';
import { theme } from '../../theme';
import { AppDispatch } from '../../redux/store';

// Import earnings components
import { 
  EarningsSummaryCard, 
  PeriodSelector, 
  TransactionsList, 
  EarningsChart,
  Period 
} from '../../components/earnings';

type NavigationProp = StackNavigationProp<any, 'EarningsDashboard'>;

const EarningsDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const user = useSelector((state: any) => state.auth.user);
  const summary = useSelector(selectEarningsSummary);
  const summaryLoading = useSelector(selectEarningsSummaryLoading);
  const summaryError = useSelector(selectEarningsSummaryError);
  const transactions = useSelector(selectTransactions);
  const transactionsLoading = useSelector(selectTransactionsLoading);
  const transactionsError = useSelector(selectTransactionsError);
  const selectedPeriod = useSelector(selectSelectedPeriod);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Handle scroll events
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    scrollY.setValue(scrollPosition);
  };
  
  // Calculate header animation values
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0.3, 1],
    extrapolate: 'clamp',
  });
  
  // Load data when component mounts or period changes
  useEffect(() => {
    if (user?.id) {
      loadEarningsData();
    }
  }, [user?.id, selectedPeriod]);
  
  // Function to load all earnings data
  const loadEarningsData = async () => {
    if (!user?.id) return;
    
    dispatch(fetchEarningsSummary({ 
      providerId: user.id,
      period: selectedPeriod
    }));
    
    dispatch(fetchProviderTransactions({ 
      providerId: user.id,
      period: selectedPeriod
    }));
  };
  
  // Handle period changes
  const handlePeriodChange = (period: Period) => {
    dispatch(setSelectedPeriod(period));
  };
  
  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Generate chart data based on transactions and period
  const generateChartData = (transactions: Transaction[], period: Period) => {
    if (!transactions?.length) return [];
    
    // Different grouping logic based on period
    switch (period) {
      case 'day':
        // Group by hour
        return groupTransactionsByHour(transactions);
      case 'week':
        // Group by day of week
        return groupTransactionsByDayOfWeek(transactions);
      case 'month':
        // Group by day of month
        return groupTransactionsByDayOfMonth(transactions);
      case 'year':
        // Group by month
        return groupTransactionsByMonth(transactions);
      case 'all':
        // Group by month for the last 6 months
        return groupTransactionsByMonth(transactions, 6);
      default:
        return [];
    }
  };
  
  // Helper function to group transactions by hour
  const groupTransactionsByHour = (transactions: Transaction[]) => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      label: `${i}:00`,
      amount: 0
    }));
    
    transactions.forEach(t => {
      if (t.transaction_type === 'service_payment' && t.status !== 'cancelled') {
        const hour = new Date(t.created_at).getHours();
        hours[hour].amount += t.amount;
      }
    });
    
    return hours;
  };
  
  // Helper function to group transactions by day of week
  const groupTransactionsByDayOfWeek = (transactions: Transaction[]) => {
    const days = [
      { label: 'Sun', amount: 0 },
      { label: 'Mon', amount: 0 },
      { label: 'Tue', amount: 0 },
      { label: 'Wed', amount: 0 },
      { label: 'Thu', amount: 0 },
      { label: 'Fri', amount: 0 },
      { label: 'Sat', amount: 0 }
    ];
    
    transactions.forEach(t => {
      if (t.transaction_type === 'service_payment' && t.status !== 'cancelled') {
        const day = new Date(t.created_at).getDay();
        days[day].amount += t.amount;
      }
    });
    
    return days;
  };
  
  // Helper function to group transactions by day of month
  const groupTransactionsByDayOfMonth = (transactions: Transaction[]) => {
    // Get days in the current month
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    const days = Array.from({ length: daysInMonth }, (_, i) => ({
      label: `${i + 1}`,
      amount: 0
    }));
    
    transactions.forEach(t => {
      if (t.transaction_type === 'service_payment' && t.status !== 'cancelled') {
        const day = new Date(t.created_at).getDate();
        if (day >= 1 && day <= daysInMonth) {
          days[day - 1].amount += t.amount;
        }
      }
    });
    
    return days;
  };
  
  // Helper function to group transactions by month
  const groupTransactionsByMonth = (transactions: Transaction[], limit = 12) => {
    const months = [
      { label: 'Jan', amount: 0 },
      { label: 'Feb', amount: 0 },
      { label: 'Mar', amount: 0 },
      { label: 'Apr', amount: 0 },
      { label: 'May', amount: 0 },
      { label: 'Jun', amount: 0 },
      { label: 'Jul', amount: 0 },
      { label: 'Aug', amount: 0 },
      { label: 'Sep', amount: 0 },
      { label: 'Oct', amount: 0 },
      { label: 'Nov', amount: 0 },
      { label: 'Dec', amount: 0 }
    ];
    
    transactions.forEach(t => {
      if (t.transaction_type === 'service_payment' && t.status !== 'cancelled') {
        const month = new Date(t.created_at).getMonth();
        months[month].amount += t.amount;
      }
    });
    
    return months.slice(0, limit);
  };
  
  // Calculate max value for chart
  const getChartMaxValue = (transactions: Transaction[]) => {
    if (!transactions?.length) return 1000;
    
    const chartData = generateChartData(transactions, selectedPeriod);
    const maxAmount = Math.max(...chartData.map(d => d.amount));
    return maxAmount > 0 ? maxAmount * 1.2 : 1000; // Add 20% padding
  };
  
  return (
    <View style={styles.container}>
      {/* Fixed Header - appears on scroll */}
      <Animated.View style={[styles.fixedHeader, { opacity: headerOpacity }]}>
        <BlurView intensity={80} style={styles.blurHeader} tint="light">
          <SafeAreaView style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons 
                name="arrow-left" 
                size={24} 
                color={theme.colors.text} 
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Earnings Dashboard</Text>
            <View style={{ width: 40 }} />
          </SafeAreaView>
        </BlurView>
      </Animated.View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Earnings Dashboard</Text>
          <Text style={styles.subtitle}>Track your earnings and manage payouts</Text>
        </View>
        
        {/* Period Selector */}
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onSelectPeriod={handlePeriodChange}
        />
        
        {/* Earnings Summary Card */}
        <EarningsSummaryCard
          totalEarnings={summary?.totalEarnings || 0}
          pendingPayouts={summary?.pendingPayouts || 0}
          completedServices={summary?.completedServices || 0}
          averageRating={summary?.averageRating || 0}
          period={selectedPeriod === 'all' ? 'All Time' : selectedPeriod}
          onRequestPayout={() => navigation.navigate('PayoutSettings')}
        />
        
        {/* Earnings Chart */}
        {!transactionsLoading && transactions?.length > 0 && (
          <EarningsChart
            data={generateChartData(transactions, selectedPeriod)}
            period={selectedPeriod}
            maxValue={getChartMaxValue(transactions)}
          />
        )}
        
        {/* Recent Transactions List */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('TransactionsList')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
          
          <TransactionsList
            transactions={transactions || []}
            loading={transactionsLoading}
            limit={5}
            onTransactionPress={(transaction) => navigation.navigate('TransactionDetail', { transactionId: transaction.id })}
            onViewAllPress={() => navigation.navigate('TransactionsList')}
          />
        </View>
        
        {/* Payout Options Button */}
        <TouchableOpacity
          style={styles.payoutButton}
          onPress={() => navigation.navigate('PayoutSettings')}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={styles.payoutButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons
              name="bank-transfer"
              size={20}
              color="#FFFFFF"
              style={styles.payoutButtonIcon}
            />
            <Text style={styles.payoutButtonText}>Manage Payout Methods</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        {/* Payment Schedule Button */}
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => navigation.navigate('PaymentSchedule')}
        >
          <View style={styles.scheduleButtonContent}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={20}
              color={theme.colors.primary}
              style={styles.scheduleButtonIcon}
            />
            <Text style={styles.scheduleButtonText}>Payment Schedule</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  blurHeader: {
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  titleContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  transactionsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 4,
  },
  payoutButton: {
    marginTop: 32,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
  payoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  payoutButtonIcon: {
    marginRight: 10,
  },
  payoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scheduleButton: {
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
    backgroundColor: 'rgba(108, 99, 255, 0.05)',
    overflow: 'hidden',
  },
  scheduleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  scheduleButtonIcon: {
    marginRight: 10,
  },
  scheduleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
});

export default EarningsDashboardScreen;