import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Share,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { theme, globalStyles } from '../../theme';
import { supabase } from '../../supabaseClient';
import * as refundService from '../../services/refundService';
import { 
  Refund, 
  RefundStatus, 
  RefundReason, 
  RefundHistoryParams,
  RefundReceiptParams
} from '../../services/refundService';

// UI Components
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import AppButton from '../../components/ui/AppButton';
import SearchBar from '../../components/messages/SearchBar';

// Types
interface RefundsManagementScreenProps {
  navigation: any;
}

// Filter options
const FILTER_OPTIONS = [
  { id: 'all', label: 'All', icon: 'all-inclusive' },
  { id: RefundStatus.PENDING, label: 'Pending', icon: 'clock-outline' },
  { id: RefundStatus.COMPLETED, label: 'Completed', icon: 'check-circle-outline' },
  { id: RefundStatus.FAILED, label: 'Failed', icon: 'alert-circle-outline' },
  { id: RefundStatus.CANCELLED, label: 'Cancelled', icon: 'cancel' },
];

// Refund item component for the list
const RefundItem = ({ refund, onPress }: { refund: Refund, onPress: () => void }) => {
  const getStatusBadgeType = (status: RefundStatus) => {
    switch (status) {
      case RefundStatus.PENDING: return 'pending';
      case RefundStatus.COMPLETED: return 'completed';
      case RefundStatus.FAILED: return 'cancelled';
      case RefundStatus.CANCELLED: return 'cancelled';
      default: return 'pending';
    }
  };

  const getReasonText = (reason: RefundReason) => {
    switch (reason) {
      case RefundReason.REQUESTED_BY_CUSTOMER: return 'Customer request';
      case RefundReason.DUPLICATE: return 'Duplicate payment';
      case RefundReason.FRAUDULENT: return 'Fraudulent activity';
      case RefundReason.SERVICE_NOT_PROVIDED: return 'Service not provided';
      case RefundReason.SERVICE_UNSATISFACTORY: return 'Unsatisfactory service';
      case RefundReason.OTHER: return 'Other reason';
      default: return 'Unknown reason';
    }
  };

  const formattedDate = refund.created_at 
    ? new Date(refund.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Unknown date';

  // Format amount to 2 decimal places with currency symbol
  const formattedAmount = `$${refund.amount.toFixed(2)}`;
  
  return (
    <TouchableOpacity 
      style={styles.refundItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.refundHeader}>
        <View style={styles.refundIdContainer}>
          <MaterialCommunityIcons 
            name="receipt" 
            size={18} 
            color={theme.colors.primary} 
          />
          <Text style={styles.refundId}>
            #{refund.id?.slice(-8) || 'Unknown ID'}
          </Text>
        </View>
        <StatusBadge 
          status={getStatusBadgeType(refund.status)} 
          size="small" 
        />
      </View>
      
      <View style={styles.refundDetails}>
        <View style={styles.refundInfo}>
          <Text style={styles.refundAmount}>{formattedAmount}</Text>
          <Text style={styles.refundReason}>{getReasonText(refund.reason)}</Text>
        </View>
        <Text style={styles.refundDate}>{formattedDate}</Text>
      </View>
      
      <View style={styles.itemFooter}>
        <View style={styles.refundType}>
          <MaterialCommunityIcons 
            name={refund.full_refund ? "cash-refund" : "cash-remove"} 
            size={16} 
            color={theme.colors.textSecondary} 
          />
          <Text style={styles.refundTypeText}>
            {refund.full_refund ? 'Full Refund' : 'Partial Refund'}
          </Text>
        </View>
        <MaterialCommunityIcons 
          name="chevron-right" 
          size={20} 
          color={theme.colors.textTertiary} 
        />
      </View>
    </TouchableOpacity>
  );
};

// Filter component
const RefundFilters = ({ 
  activeFilter, 
  onFilterChange 
}: { 
  activeFilter: string, 
  onFilterChange: (filter: string) => void 
}) => {
  return (
    <View style={styles.filtersContainer}>
      <FlatList
        horizontal
        data={FILTER_OPTIONS}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersList}
        renderItem={({ item }) => {
          const isActive = activeFilter === item.id;
          
          return (
            <TouchableOpacity
              style={[
                styles.filterButton,
                isActive && styles.activeFilterButton
              ]}
              onPress={() => onFilterChange(item.id)}
            >
              <MaterialCommunityIcons
                name={item.icon as any}
                size={16}
                color={isActive ? '#fff' : theme.colors.primary}
                style={styles.filterIcon}
              />
              <Text 
                style={[
                  styles.filterText,
                  isActive && styles.activeFilterText
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

// Export Options
const ExportOptions = ({ onExport }: { onExport: (format: string) => void }) => {
  return (
    <View style={styles.exportContainer}>
      <Text style={styles.exportTitle}>Export Options</Text>
      <View style={styles.exportButtons}>
        <TouchableOpacity 
          style={styles.exportButton} 
          onPress={() => onExport('csv')}
        >
          <MaterialCommunityIcons 
            name="file-delimited-outline" 
            size={20} 
            color={theme.colors.primary} 
          />
          <Text style={styles.exportButtonText}>CSV</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.exportButton} 
          onPress={() => onExport('pdf')}
        >
          <MaterialCommunityIcons 
            name="file-pdf-box" 
            size={20} 
            color={theme.colors.primary} 
          />
          <Text style={styles.exportButtonText}>PDF</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.exportButton} 
          onPress={() => onExport('json')}
        >
          <MaterialCommunityIcons 
            name="code-json" 
            size={20} 
            color={theme.colors.primary} 
          />
          <Text style={styles.exportButtonText}>JSON</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Main Screen Component
const RefundsManagementScreen: React.FC<RefundsManagementScreenProps> = ({ navigation }) => {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [filteredRefunds, setFilteredRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  const loadRefunds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('User not authenticated');
      }
      
      // Fetch refund history
      const params: RefundHistoryParams = {
        userId: userData.user.id,
      };
      
      const { data, error } = await refundService.getRefundHistory(params);
      
      if (error) {
        throw new Error(error.message);
      }
      
      setRefunds(data || []);
      setFilteredRefunds(data || []);
    } catch (err) {
      console.error('Error loading refunds:', err);
      setError(err instanceof Error ? err.message : 'Failed to load refunds');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Filter refunds when activeFilter or searchQuery changes
  useEffect(() => {
    if (refunds.length === 0) return;
    
    let filtered = [...refunds];
    
    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(refund => refund.status === activeFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        refund => 
          refund.id?.toLowerCase().includes(query) || 
          refund.notes?.toLowerCase().includes(query) ||
          refund.amount.toString().includes(query)
      );
    }
    
    setFilteredRefunds(filtered);
  }, [refunds, activeFilter, searchQuery]);
  
  // Load refunds when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadRefunds();
    }, [loadRefunds])
  );
  
  // Navigation to refund detail screen
  const navigateToRefundDetail = (refund: Refund) => {
    navigation.navigate('RefundDetailScreen', { refundId: refund.id });
  };
  
  // Handle initiating a new refund
  const handleInitiateRefund = () => {
    navigation.navigate('InitiateRefundScreen');
  };
  
  // Handle exporting refunds
  const handleExport = async (format: string) => {
    try {
      // In a real app, you would generate the export here
      // For this example, we'll just show a success message
      
      // Simulate export
      setLoading(true);
      
      // Simulate a delay for export generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Share the "exported" data
      const message = `Refunds exported in ${format.toUpperCase()} format`;
      await Share.share({
        message,
        title: 'Refunds Export'
      });
      
      setShowExportOptions(false);
    } catch (err) {
      console.error('Error exporting refunds:', err);
      Alert.alert('Export Error', 'Failed to export refunds');
    } finally {
      setLoading(false);
    }
  };
  
  // Generate a receipt for a refund
  const generateReceipt = async (refundId: string) => {
    try {
      setLoading(true);
      
      const params: RefundReceiptParams = {
        refundId,
        format: 'pdf'
      };
      
      const { data, error } = await refundService.generateRefundReceipt(params);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // In a real app, you would open the receipt PDF here
      Alert.alert('Receipt Generated', 'Receipt has been generated successfully');
    } catch (err) {
      console.error('Error generating receipt:', err);
      Alert.alert('Receipt Error', 'Failed to generate receipt');
    } finally {
      setLoading(false);
    }
  };
  
  // Header component with title and new refund button
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Refunds</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setShowExportOptions(!showExportOptions)}
        >
          <MaterialCommunityIcons
            name="export-variant"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.headerButton, styles.newRefundButton]}
          onPress={handleInitiateRefund}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render empty state
  const renderEmptyState = () => {
    // If loading, show loading indicator
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }
    
    // If error, show error message
    if (error) {
      return (
        <View style={styles.centerContainer}>
          <EmptyState
            icon="alert-circle-outline"
            title="Error Loading Refunds"
            description={error}
            buttonTitle="Try Again"
            onButtonPress={loadRefunds}
          />
        </View>
      );
    }
    
    // If no refunds after filtering, show filtered empty state
    if (refunds.length > 0 && filteredRefunds.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <EmptyState
            icon="filter-off-outline"
            title="No Matching Refunds"
            description="Try adjusting your search or filters"
            buttonTitle="Clear Filters"
            onButtonPress={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
          />
        </View>
      );
    }
    
    // If no refunds at all, show default empty state
    return (
      <View style={styles.centerContainer}>
        <EmptyState
          icon="cash-refund"
          title="No Refunds Yet"
          description="When you request or receive refunds, they will appear here"
          buttonTitle="Request a Refund"
          onButtonPress={handleInitiateRefund}
        />
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {renderHeader()}
        
        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search refunds..."
        />
        
        <RefundFilters 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
        
        {showExportOptions && (
          <ExportOptions onExport={handleExport} />
        )}
        
        {filteredRefunds.length > 0 ? (
          <FlatList
            data={filteredRefunds}
            keyExtractor={(item) => item.id || Math.random().toString()}
            renderItem={({ item }) => (
              <RefundItem 
                refund={item} 
                onPress={() => navigateToRefundDetail(item)} 
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={loadRefunds}
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  newRefundButton: {
    backgroundColor: theme.colors.primary,
  },
  filtersContainer: {
    marginBottom: theme.spacing.sm,
  },
  filtersList: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
    marginRight: 10,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  activeFilterButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  activeFilterText: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  refundItem: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    ...theme.elevation.small,
  },
  refundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  refundIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refundId: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  refundDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  refundInfo: {
    flex: 1,
  },
  refundAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  refundReason: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  refundDate: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  refundType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refundTypeText: {
    marginLeft: 4,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  exportContainer: {
    backgroundColor: 'white',
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.elevation.small,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  exportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  exportButton: {
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    width: 80,
  },
  exportButtonText: {
    marginTop: 4,
    color: theme.colors.primary,
    fontWeight: '500',
  },
});

export default RefundsManagementScreen;