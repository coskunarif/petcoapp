import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Linking,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { theme, globalStyles } from '../../../theme';
import { Text, AppButton, AppCard, StatusBadge } from '../../../components/ui';
import { stripeService } from '../../../services/stripe/stripeService';
import { supabase } from '../../../supabaseClient';

// Types for Connect account details
type ConnectAccountStatus = {
  isActive: boolean;
  accountId?: string;
  details?: {
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    requirements?: string[];
  };
};

type BalanceInfo = {
  available: number;
  pending: number;
  currency: string;
};

type PayoutSchedule = 'daily' | 'weekly' | 'monthly';

export default function StripeConnectSetupScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [accountStatus, setAccountStatus] = useState<ConnectAccountStatus | null>(null);
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [payoutSchedule, setPayoutSchedule] = useState<PayoutSchedule>('weekly');
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false);

  // Get current user
  const userId = useSelector((state: any) => state.auth?.user?.id);

  useEffect(() => {
    fetchConnectAccount();
  }, []);

  const fetchConnectAccount = async () => {
    try {
      setLoading(true);
      
      // Check if the user has a Stripe Connect account
      const { data } = await supabase
        .from('provider_profiles')
        .select('stripe_connect_id')
        .eq('user_id', userId)
        .single();
      
      if (data?.stripe_connect_id) {
        // Fetch account status
        const statusResponse = await stripeService.checkConnectAccountStatus(data.stripe_connect_id);
        if (statusResponse.error) {
          throw new Error(statusResponse.error);
        }
        
        setAccountStatus({
          isActive: statusResponse.isActive,
          accountId: data.stripe_connect_id,
          details: statusResponse.details
        });
        
        // Fetch balance
        if (statusResponse.isActive && statusResponse.details?.payoutsEnabled) {
          const balanceResponse = await stripeService.getAvailableBalance(data.stripe_connect_id);
          if (!balanceResponse.error) {
            setBalance(balanceResponse);
          }
        }
      } else {
        setAccountStatus(null);
      }
    } catch (error: any) {
      console.error('Error fetching Connect account:', error);
      Alert.alert('Error', error.message || 'Failed to fetch Connect account information');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    try {
      setLoading(true);
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const response = await stripeService.createConnectAccount(userId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.accountId && response.url) {
        // Save the account ID to the database
        await supabase
          .from('provider_profiles')
          .upsert({ 
            user_id: userId,
            stripe_connect_id: response.accountId
          });
        
        // Update the local state
        setAccountStatus({
          isActive: false,
          accountId: response.accountId,
          details: {
            chargesEnabled: false,
            payoutsEnabled: false
          }
        });
        
        // Open the Stripe onboarding URL
        await Linking.openURL(response.url);
        
        Alert.alert(
          'Stripe Connect Setup',
          'Please complete the Stripe onboarding process in your browser. After completion, return to this app and refresh the status.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Error creating Connect account:', error);
      Alert.alert('Error', error.message || 'Failed to create Connect account');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    await fetchConnectAccount();
  };

  const handleUpdatePayoutSchedule = async (schedule: PayoutSchedule) => {
    try {
      setIsUpdatingSchedule(true);
      
      if (!accountStatus?.accountId) {
        throw new Error('No Connect account found');
      }
      
      const response = await stripeService.updatePayoutSchedule(
        accountStatus.accountId,
        schedule
      );
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.success) {
        setPayoutSchedule(schedule);
        Alert.alert('Success', `Payout schedule updated to ${schedule}`);
      }
    } catch (error: any) {
      console.error('Error updating payout schedule:', error);
      Alert.alert('Error', error.message || 'Failed to update payout schedule');
    } finally {
      setIsUpdatingSchedule(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const renderAccountStatus = () => {
    if (!accountStatus || !accountStatus.accountId) {
      return (
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons 
            name="bank-outline" 
            size={60} 
            color={theme.colors.textTertiary} 
          />
          <Text variant="h3" style={styles.emptyStateTitle}>
            Set Up Stripe Connect
          </Text>
          <Text variant="body" color="textSecondary" style={styles.emptyStateText}>
            To receive payments as a service provider, you need to connect your Stripe account.
          </Text>
          <AppButton
            title="Set Up Stripe Connect"
            onPress={handleCreateAccount}
            fullWidth
            style={styles.connectButton}
            icon="bank"
            disabled={loading}
          />
        </View>
      );
    }

    return (
      <View>
        {/* Account Status */}
        <AppCard style={styles.card}>
          <Text variant="h3">Account Status</Text>
          <View style={styles.statusRow}>
            <StatusBadge 
              status={accountStatus.isActive ? 'active' : 'pending'} 
              label={accountStatus.isActive ? 'Active' : 'Pending'}
            />
            <TouchableOpacity onPress={handleRefreshStatus} style={styles.refreshButton}>
              <MaterialCommunityIcons name="refresh" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons 
                name={accountStatus.details?.chargesEnabled ? "check-circle" : "alert-circle"} 
                size={20} 
                color={accountStatus.details?.chargesEnabled ? theme.colors.success : theme.colors.warning} 
              />
              <Text variant="body2" style={styles.detailText}>
                Charges {accountStatus.details?.chargesEnabled ? 'Enabled' : 'Pending'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <MaterialCommunityIcons 
                name={accountStatus.details?.payoutsEnabled ? "check-circle" : "alert-circle"} 
                size={20} 
                color={accountStatus.details?.payoutsEnabled ? theme.colors.success : theme.colors.warning} 
              />
              <Text variant="body2" style={styles.detailText}>
                Payouts {accountStatus.details?.payoutsEnabled ? 'Enabled' : 'Pending'}
              </Text>
            </View>
          </View>
          
          {!accountStatus.isActive && (
            <AppButton
              title="Complete Onboarding"
              onPress={() => {
                // In a real app, you would get a fresh onboarding URL from your backend
                // For this demo, we'll just show an alert
                Alert.alert(
                  'Complete Onboarding',
                  'In a real app, this would open the Stripe onboarding URL to complete your account setup.'
                );
              }}
              fullWidth
              style={styles.onboardingButton}
              icon="open-in-new"
            />
          )}
        </AppCard>
        
        {/* Balance Information */}
        {accountStatus.isActive && balance && (
          <AppCard style={styles.card}>
            <Text variant="h3">Balance</Text>
            
            <View style={styles.balanceContainer}>
              <View style={styles.balanceItem}>
                <Text variant="caption" color="textTertiary">Available</Text>
                <Text variant="h2" style={styles.balanceAmount}>
                  {formatCurrency(balance.available, balance.currency)}
                </Text>
              </View>
              
              <View style={styles.balanceItem}>
                <Text variant="caption" color="textTertiary">Pending</Text>
                <Text variant="h3" color="textSecondary" style={styles.balanceAmount}>
                  {formatCurrency(balance.pending, balance.currency)}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.viewDetailsButton}
              onPress={() => {
                Alert.alert('View Payouts', 'In a real app, this would navigate to a detailed payout history screen.');
              }}
            >
              <Text variant="button" color="primary">View Payout History</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </AppCard>
        )}
        
        {/* Payout Schedule */}
        {accountStatus.isActive && accountStatus.details?.payoutsEnabled && (
          <AppCard style={styles.card}>
            <Text variant="h3">Payout Schedule</Text>
            <Text variant="body2" color="textSecondary" style={styles.scheduleParagraph}>
              Choose how often you'd like to receive payouts to your bank account.
            </Text>
            
            <View style={styles.scheduleOptionsContainer}>
              {(['daily', 'weekly', 'monthly'] as PayoutSchedule[]).map((schedule) => (
                <TouchableOpacity
                  key={schedule}
                  style={[
                    styles.scheduleOption,
                    payoutSchedule === schedule && styles.scheduleOptionSelected
                  ]}
                  onPress={() => handleUpdatePayoutSchedule(schedule)}
                  disabled={isUpdatingSchedule}
                >
                  <Text 
                    variant="body"
                    color={payoutSchedule === schedule ? 'primary' : 'text'}
                  >
                    {schedule.charAt(0).toUpperCase() + schedule.slice(1)}
                  </Text>
                  {payoutSchedule === schedule && (
                    <MaterialCommunityIcons name="check" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <Text variant="caption" color="textTertiary" style={styles.scheduleNote}>
              Payouts are initiated at the end of each period and typically arrive in your bank account within 2 business days.
            </Text>
          </AppCard>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="h2">Stripe Connect</Text>
        <View style={{ width: 40 }} /> {/* Empty space for balance */}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="body" style={styles.loadingText}>
              Loading account information...
            </Text>
          </View>
        ) : (
          renderAccountStatus()
        )}
        
        <AppCard style={[styles.card, styles.infoCard]}>
          <MaterialCommunityIcons name="information-outline" size={20} color={theme.colors.textSecondary} />
          <Text variant="body2" color="textSecondary" style={styles.infoText}>
            Stripe Connect allows you to receive payments directly from clients for your pet care services. Funds will be deposited into your connected bank account based on your payout schedule.
          </Text>
        </AppCard>
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emptyStateTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  connectButton: {
    marginTop: 8,
  },
  onboardingButton: {
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
  card: {
    marginBottom: 16,
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailText: {
    marginLeft: 8,
  },
  balanceContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  balanceItem: {
    flex: 1,
  },
  balanceAmount: {
    marginTop: 4,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  scheduleParagraph: {
    marginTop: 8,
    marginBottom: 16,
  },
  scheduleOptionsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  scheduleOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  scheduleOptionSelected: {
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
  },
  scheduleNote: {
    marginTop: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
});