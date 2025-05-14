import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../supabaseClient';
import type { RootState } from '../store';

// Define types for earnings data
export interface Transaction {
  id: string;
  provider_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  transaction_type: 'service_payment' | 'payout' | 'refund';
  description: string;
  created_at: string;
  service_request_id?: string;
  service_request?: {
    id: string;
    title?: string;
    requester_id: string;
    requester?: {
      id: string;
      full_name: string;
      profile_image_url?: string;
    };
    service_type?: {
      id: string;
      name: string;
    };
  };
}

export interface PayoutMethod {
  id: string;
  provider_id: string;
  type: 'bank_account' | 'paypal' | 'venmo';
  is_default: boolean;
  created_at: string;
  last4: string;
  display_name: string;
}

interface EarningsSummary {
  totalEarnings: number;
  pendingPayouts: number;
  completedPayouts: number;
  serviceCount: number;
}

export interface EarningsState {
  // Transactions
  transactions: Transaction[];
  transactionsLoading: boolean;
  transactionsError: string | null;
  
  // Payout methods
  payoutMethods: PayoutMethod[];
  payoutMethodsLoading: boolean;
  payoutMethodsError: string | null;
  
  // Earnings summary
  summary: EarningsSummary;
  summaryLoading: boolean;
  summaryError: string | null;
  
  // UI state
  selectedPeriod: 'all_time' | 'this_week' | 'this_month' | 'last_month' | 'this_year';
  selectedTransactionId: string | null;
}

// Initial state
const initialState: EarningsState = {
  transactions: [],
  transactionsLoading: false,
  transactionsError: null,
  
  payoutMethods: [],
  payoutMethodsLoading: false,
  payoutMethodsError: null,
  
  summary: {
    totalEarnings: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
    serviceCount: 0
  },
  summaryLoading: false,
  summaryError: null,
  
  selectedPeriod: 'this_month',
  selectedTransactionId: null
};

// Helper function to get date range for selected period
const getDateRangeForPeriod = (period: EarningsState['selectedPeriod']) => {
  const now = new Date();
  const startDate = new Date();
  
  switch (period) {
    case 'this_week':
      // Start from the beginning of current week (Sunday)
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'this_month':
      // Start from the beginning of current month
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'last_month':
      // Start from the beginning of last month
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      
      // End at the end of last month
      now.setDate(0); // Last day of previous month
      now.setHours(23, 59, 59, 999);
      break;
    case 'this_year':
      // Start from the beginning of current year
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'all_time':
    default:
      // Return null to indicate no date filtering
      return { startDate: null, endDate: null };
  }
  
  return { startDate: startDate.toISOString(), endDate: now.toISOString() };
};

// Async thunk to fetch provider transactions
export const fetchProviderTransactions = createAsyncThunk(
  'earnings/fetchTransactions',
  async ({ 
    providerId, 
    period = 'this_month'
  }: { 
    providerId: string; 
    period?: EarningsState['selectedPeriod']
  }, { rejectWithValue }) => {
    try {
      // Get date range for the selected period
      const { startDate, endDate } = getDateRangeForPeriod(period);
      
      console.log('[earningsSlice] Fetching transactions for period:', period);
      console.log('[earningsSlice] Date range:', { startDate, endDate });
      
      let query = supabase
        .from('transactions')
        .select(`
          *,
          service_request:service_request_id (
            id,
            title,
            requester_id,
            requester:requester_id (
              id,
              full_name,
              profile_image_url
            ),
            service_type:service_type_id (
              id,
              name
            )
          )
        `)
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });
        
      // Apply date filtering if a range is specified
      if (startDate && endDate) {
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      }
        
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Mock data for development if needed
      // This would be replaced by the real data in production
      const mockData = generateMockTransactions(providerId, 10);
      
      return data || mockData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transactions');
    }
  }
);

// Async thunk to fetch provider earnings summary
export const fetchEarningsSummary = createAsyncThunk(
  'earnings/fetchSummary',
  async ({ 
    providerId, 
    period = 'this_month'
  }: { 
    providerId: string; 
    period?: EarningsState['selectedPeriod']
  }, { rejectWithValue }) => {
    try {
      // Get date range for the selected period
      const { startDate, endDate } = getDateRangeForPeriod(period);
      
      console.log('[earningsSlice] Fetching earnings summary for period:', period);
      
      // In a real implementation, this would query a summary API or aggregate from the database
      // For now, we'll generate mock data
      const mockSummary = generateMockSummary(period);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockSummary;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch earnings summary');
    }
  }
);

// Async thunk to fetch provider payout methods
export const fetchPayoutMethods = createAsyncThunk(
  'earnings/fetchPayoutMethods',
  async (providerId: string, { rejectWithValue }) => {
    try {
      console.log('[earningsSlice] Fetching payout methods for provider:', providerId);
      
      const { data, error } = await supabase
        .from('payout_methods')
        .select('*')
        .eq('provider_id', providerId);
        
      if (error) {
        throw error;
      }
      
      // Mock data for development if needed
      const mockData = generateMockPayoutMethods(providerId);
      
      return data || mockData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch payout methods');
    }
  }
);

// Async thunk to add a new payout method
export const addPayoutMethod = createAsyncThunk(
  'earnings/addPayoutMethod',
  async (payoutMethod: Omit<PayoutMethod, 'id'>, { rejectWithValue }) => {
    try {
      console.log('[earningsSlice] Adding new payout method:', payoutMethod);
      
      // In a real app, this would make an API call to create a new payout method
      const newId = `pm-${Date.now()}`; // Generate a unique ID
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        ...payoutMethod,
        id: newId
      } as PayoutMethod;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add payout method');
    }
  }
);

// Async thunk to set a payout method as the default
export const setDefaultPayoutMethod = createAsyncThunk(
  'earnings/setDefaultMethod',
  async ({
    providerId,
    methodId
  }: {
    providerId: string;
    methodId: string;
  }, { rejectWithValue }) => {
    try {
      console.log('[earningsSlice] Setting default payout method:', methodId);
      
      // In a real app, this would make an API call to update the default status
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return methodId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to set default payout method');
    }
  }
);

// Function to generate mock transactions for development
const generateMockTransactions = (providerId: string, count: number): Transaction[] => {
  const transactions: Transaction[] = [];
  const types: Transaction['transaction_type'][] = ['service_payment', 'payout', 'refund'];
  const statuses: Transaction['status'][] = ['pending', 'completed', 'cancelled'];
  
  for (let i = 0; i < count; i++) {
    const amount = Math.floor(Math.random() * 200) + 20; // Random amount between 20-220
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Generate date within last 90 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    
    // Generate description based on transaction type
    let description = '';
    let serviceInfo = undefined;
    
    if (type === 'service_payment') {
      const serviceTypes = ['Dog Walking', 'Pet Sitting', 'Grooming', 'Training'];
      const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
      description = `Payment for ${serviceType} service`;
      
      // Add mock service request data
      serviceInfo = {
        id: `sr-${i}`,
        title: `${serviceType} Service`,
        requester_id: `user-${i}`,
        requester: {
          id: `user-${i}`,
          full_name: `Test User ${i}`,
          profile_image_url: null
        },
        service_type: {
          id: `st-${i}`,
          name: serviceType
        }
      };
    } else if (type === 'payout') {
      description = 'Payout to bank account';
    } else {
      description = 'Refund for cancelled service';
    }
    
    transactions.push({
      id: `tr-${i}`,
      provider_id: providerId,
      amount: type === 'payout' || type === 'refund' ? -amount : amount,
      status,
      transaction_type: type,
      description,
      created_at: date.toISOString(),
      service_request_id: type === 'service_payment' ? `sr-${i}` : undefined,
      service_request: type === 'service_payment' ? serviceInfo : undefined
    });
  }
  
  // Sort by date (newest first)
  return transactions.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

// Function to generate mock payout methods for development
const generateMockPayoutMethods = (providerId: string): PayoutMethod[] => {
  return [
    {
      id: 'pm-1',
      provider_id: providerId,
      type: 'bank_account',
      is_default: true,
      last4: '4321',
      display_name: 'Chase Bank Checking',
      created_at: new Date().toISOString()
    },
    {
      id: 'pm-2',
      provider_id: providerId,
      type: 'paypal',
      is_default: false,
      last4: '5678',
      display_name: 'PayPal Account',
      created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    }
  ];
};

// Function to generate mock summary data for development
const generateMockSummary = (period: EarningsState['selectedPeriod']): EarningsSummary => {
  // Different values based on period
  let multiplier = 1;
  
  switch (period) {
    case 'this_week':
      multiplier = 1;
      break;
    case 'this_month':
      multiplier = 4;
      break;
    case 'last_month':
      multiplier = 3.5;
      break;
    case 'this_year':
      multiplier = 20;
      break;
    case 'all_time':
      multiplier = 50;
      break;
  }
  
  return {
    totalEarnings: Math.floor(500 * multiplier),
    pendingPayouts: Math.floor(120 * multiplier),
    completedPayouts: Math.floor(380 * multiplier),
    serviceCount: Math.floor(15 * multiplier)
  };
};

// Create the earnings slice
const earningsSlice = createSlice({
  name: 'earnings',
  initialState,
  reducers: {
    setSelectedPeriod(state, action: PayloadAction<EarningsState['selectedPeriod']>) {
      state.selectedPeriod = action.payload;
    },
    setSelectedTransaction(state, action: PayloadAction<string | null>) {
      state.selectedTransactionId = action.payload;
    },
    clearTransactionsError(state) {
      state.transactionsError = null;
    },
    clearSummaryError(state) {
      state.summaryError = null;
    },
    clearPayoutMethodsError(state) {
      state.payoutMethodsError = null;
    }
  },
  extraReducers: (builder) => {
    // Handle fetchProviderTransactions
    builder.addCase(fetchProviderTransactions.pending, (state) => {
      state.transactionsLoading = true;
      state.transactionsError = null;
    });
    builder.addCase(fetchProviderTransactions.fulfilled, (state, action) => {
      state.transactions = action.payload;
      state.transactionsLoading = false;
    });
    builder.addCase(fetchProviderTransactions.rejected, (state, action) => {
      state.transactionsLoading = false;
      state.transactionsError = action.payload as string;
    });
    
    // Handle fetchEarningsSummary
    builder.addCase(fetchEarningsSummary.pending, (state) => {
      state.summaryLoading = true;
      state.summaryError = null;
    });
    builder.addCase(fetchEarningsSummary.fulfilled, (state, action) => {
      state.summary = action.payload;
      state.summaryLoading = false;
    });
    builder.addCase(fetchEarningsSummary.rejected, (state, action) => {
      state.summaryLoading = false;
      state.summaryError = action.payload as string;
    });
    
    // Handle fetchPayoutMethods
    builder.addCase(fetchPayoutMethods.pending, (state) => {
      state.payoutMethodsLoading = true;
      state.payoutMethodsError = null;
    });
    builder.addCase(fetchPayoutMethods.fulfilled, (state, action) => {
      state.payoutMethods = action.payload;
      state.payoutMethodsLoading = false;
    });
    builder.addCase(fetchPayoutMethods.rejected, (state, action) => {
      state.payoutMethodsLoading = false;
      state.payoutMethodsError = action.payload as string;
    });
    
    // Handle addPayoutMethod
    builder.addCase(addPayoutMethod.pending, (state) => {
      state.payoutMethodsLoading = true;
      state.payoutMethodsError = null;
    });
    builder.addCase(addPayoutMethod.fulfilled, (state, action) => {
      state.payoutMethods.push(action.payload);
      state.payoutMethodsLoading = false;
    });
    builder.addCase(addPayoutMethod.rejected, (state, action) => {
      state.payoutMethodsLoading = false;
      state.payoutMethodsError = action.payload as string;
    });
    
    // Handle setDefaultPayoutMethod
    builder.addCase(setDefaultPayoutMethod.pending, (state) => {
      state.payoutMethodsLoading = true;
      state.payoutMethodsError = null;
    });
    builder.addCase(setDefaultPayoutMethod.fulfilled, (state, action) => {
      // Update all methods to set is_default to false
      state.payoutMethods.forEach(method => {
        method.is_default = method.id === action.payload;
      });
      state.payoutMethodsLoading = false;
    });
    builder.addCase(setDefaultPayoutMethod.rejected, (state, action) => {
      state.payoutMethodsLoading = false;
      state.payoutMethodsError = action.payload as string;
    });
  }
});

// Export actions
export const {
  setSelectedPeriod,
  setSelectedTransaction,
  clearTransactionsError,
  clearSummaryError,
  clearPayoutMethodsError
} = earningsSlice.actions;

// Export selectors
export const selectTransactions = (state: RootState) => state.earnings.transactions;
export const selectTransactionsLoading = (state: RootState) => state.earnings.transactionsLoading;
export const selectTransactionsError = (state: RootState) => state.earnings.transactionsError;

export const selectPayoutMethods = (state: RootState) => state.earnings.payoutMethods;
export const selectPayoutMethodsLoading = (state: RootState) => state.earnings.payoutMethodsLoading;
export const selectPayoutMethodsError = (state: RootState) => state.earnings.payoutMethodsError;

export const selectEarningsSummary = (state: RootState) => state.earnings.summary;
export const selectEarningsSummaryLoading = (state: RootState) => state.earnings.summaryLoading;
export const selectEarningsSummaryError = (state: RootState) => state.earnings.summaryError;

export const selectSelectedPeriod = (state: RootState) => state.earnings.selectedPeriod;
export const selectSelectedTransaction = (state: RootState) => {
  const id = state.earnings.selectedTransactionId;
  return id ? state.earnings.transactions.find(t => t.id === id) : null;
};

export default earningsSlice.reducer;