import React, { useEffect, useState } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Platform, 
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, Card, Divider, RadioButton } from 'react-native-paper';
import { Text } from '../../components/ui';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchPayoutMethods, 
  addPayoutMethod,
  setDefaultPayoutMethod,
  selectPayoutMethods,
  selectPayoutMethodsLoading,
  type PayoutMethod
} from '../../redux/slices/earningsSlice';
import { selectUserProfile } from '../../redux/slices/authSlice';
import type { AppDispatch } from '../../redux/store';

const PayoutSettingsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUserProfile);
  const payoutMethods = useSelector(selectPayoutMethods);
  const loading = useSelector(selectPayoutMethodsLoading);
  
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchPayoutMethods(user.id));
    }
  }, [user?.id, dispatch]);

  const handleAddMethod = (type: 'bank_account' | 'paypal' | 'venmo') => {
    if (!user?.id) return;
    
    if (type === 'bank_account') {
      // Navigate to the BankAccountScreen for adding bank accounts
      navigation.navigate('BankAccount');
      return;
    }
    
    // For other methods, we'll mock the creation with dummy data
    const newMethod: Omit<PayoutMethod, 'id'> = {
      provider_id: user.id,
      type,
      is_default: payoutMethods.length === 0, // First added method becomes default
      created_at: new Date().toISOString(),
      last4: '1234',
      display_name: `${type === 'paypal' ? 'PayPal' : 'Venmo'} (${Math.floor(Math.random() * 9000) + 1000})`,
    };
    
    dispatch(addPayoutMethod(newMethod));
  };

  const handleSetDefaultMethod = (methodId: string) => {
    if (user?.id) {
      dispatch(setDefaultPayoutMethod({ 
        providerId: user.id, 
        methodId 
      }));
    }
  };

  const handleChangeFrequency = (newFrequency: 'weekly' | 'biweekly' | 'monthly') => {
    setFrequency(newFrequency);
    
    // In a real app, we would dispatch an action to update the frequency in the backend
    Alert.alert('Success', `Payout frequency updated to ${newFrequency}`);
  };

  const getPayoutMethodIcon = (type: string) => {
    switch (type) {
      case 'bank_account':
        return 'bank-outline';
      case 'paypal':
        return 'credit-card-outline';
      case 'venmo':
        return 'credit-card-outline';
      default:
        return 'cash-outline';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.safeHeader}>
        <View style={styles.header}>
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
          <Text style={styles.headerTitle}>Payout Settings</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Payout Methods</Text>
        <Text style={styles.sectionDescription}>
          Add and manage your payout methods. We'll send your earnings to your default method.
        </Text>

        {loading ? (
          <Card style={styles.loadingCard}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </Card>
        ) : (
          <>
            {/* Payment Methods */}
            <Card style={styles.card}>
              {payoutMethods.length === 0 ? (
                <Card.Content style={styles.emptyState}>
                  <MaterialCommunityIcons
                    name="cash-remove"
                    size={40}
                    color="#888"
                    style={styles.emptyIcon}
                  />
                  <Text style={styles.emptyTitle}>No Payout Methods</Text>
                  <Text style={styles.emptyDescription}>
                    Add a payout method to start receiving earnings
                  </Text>
                </Card.Content>
              ) : (
                <Card.Content style={styles.methodsContainer}>
                  {payoutMethods.map((method) => (
                    <React.Fragment key={method.id}>
                      <View style={styles.methodRow}>
                        <View style={styles.methodInfo}>
                          <View style={styles.methodIconContainer}>
                            <MaterialCommunityIcons
                              name={getPayoutMethodIcon(method.type)}
                              size={24}
                              color={theme.colors.primary}
                            />
                          </View>
                          <View>
                            <Text style={styles.methodName}>{method.display_name}</Text>
                            <Text style={styles.methodDetails}>
                              {method.type === 'bank_account'
                                ? 'Bank Account'
                                : method.type === 'paypal'
                                ? 'PayPal'
                                : 'Venmo'}{' '}
                              ••••{method.last4}
                            </Text>
                          </View>
                        </View>
                        <RadioButton
                          value={method.id}
                          status={method.is_default ? 'checked' : 'unchecked'}
                          onPress={() => handleSetDefaultMethod(method.id)}
                          color={theme.colors.primary}
                        />
                      </View>
                      <Divider style={styles.divider} />
                    </React.Fragment>
                  ))}
                </Card.Content>
              )}

              <Card.Actions style={styles.cardActions}>
                <TouchableOpacity 
                  style={[styles.addButton, { borderColor: theme.colors.primary }]}
                  onPress={() => handleAddMethod('bank_account')}
                >
                  <MaterialCommunityIcons
                    name="bank-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>
                    Bank Account
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.addButton, { borderColor: theme.colors.primary }]}
                  onPress={() => handleAddMethod('paypal')}
                >
                  <MaterialCommunityIcons
                    name="credit-card-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>
                    Add PayPal
                  </Text>
                </TouchableOpacity>
              </Card.Actions>
            </Card>

            {/* Payout Frequency */}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Payout Frequency</Text>
            <Text style={styles.sectionDescription}>
              Choose how often you'd like to receive your earnings
            </Text>

            <Card style={styles.card}>
              <Card.Content>
                <TouchableOpacity 
                  style={styles.frequencyOption}
                  onPress={() => handleChangeFrequency('weekly')}
                >
                  <View style={styles.frequencyInfo}>
                    <Text style={styles.frequencyTitle}>Weekly</Text>
                    <Text style={styles.frequencyDescription}>
                      Every Monday for the previous week
                    </Text>
                  </View>
                  <RadioButton
                    value="weekly"
                    status={frequency === 'weekly' ? 'checked' : 'unchecked'}
                    onPress={() => handleChangeFrequency('weekly')}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
                
                <Divider style={styles.divider} />
                
                <TouchableOpacity 
                  style={styles.frequencyOption}
                  onPress={() => handleChangeFrequency('biweekly')}
                >
                  <View style={styles.frequencyInfo}>
                    <Text style={styles.frequencyTitle}>Bi-weekly</Text>
                    <Text style={styles.frequencyDescription}>
                      Every other Monday
                    </Text>
                  </View>
                  <RadioButton
                    value="biweekly"
                    status={frequency === 'biweekly' ? 'checked' : 'unchecked'}
                    onPress={() => handleChangeFrequency('biweekly')}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
                
                <Divider style={styles.divider} />
                
                <TouchableOpacity 
                  style={styles.frequencyOption}
                  onPress={() => handleChangeFrequency('monthly')}
                >
                  <View style={styles.frequencyInfo}>
                    <Text style={styles.frequencyTitle}>Monthly</Text>
                    <Text style={styles.frequencyDescription}>
                      On the 1st of each month
                    </Text>
                  </View>
                  <RadioButton
                    value="monthly"
                    status={frequency === 'monthly' ? 'checked' : 'unchecked'}
                    onPress={() => handleChangeFrequency('monthly')}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              </Card.Content>
            </Card>
            
            {/* Tax Information */}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Tax Information</Text>
            <Text style={styles.sectionDescription}>
              Update your tax information for reporting and compliance
            </Text>
            
            <Card style={styles.card}>
              <TouchableOpacity
                style={styles.taxInfoButton}
                onPress={() => navigation.navigate('TaxInformation')}
              >
                <View style={styles.taxInfoContent}>
                  <MaterialCommunityIcons
                    name="file-document-outline"
                    size={24}
                    color={theme.colors.primary}
                    style={styles.taxInfoIcon}
                  />
                  <View>
                    <Text style={styles.taxInfoTitle}>Tax Documents</Text>
                    <Text style={styles.taxInfoDescription}>
                      Manage your W-9 and tax information
                    </Text>
                  </View>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#888"
                />
              </TouchableOpacity>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  safeHeader: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#777',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingCard: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
  methodsContainer: {
    padding: 0,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  methodDetails: {
    fontSize: 14,
    color: '#777',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
  },
  addButtonText: {
    fontWeight: '600',
    marginLeft: 8,
  },
  divider: {
    marginHorizontal: 16,
  },
  frequencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  frequencyInfo: {
    flex: 1,
  },
  frequencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  frequencyDescription: {
    fontSize: 14,
    color: '#777',
  },
  taxInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  taxInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taxInfoIcon: {
    marginRight: 16,
  },
  taxInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taxInfoDescription: {
    fontSize: 14,
    color: '#777',
  },
});

export default PayoutSettingsScreen;