import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { TextInput, Checkbox, Divider, Surface } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppButton, AppCard, Text, EmptyState, SectionHeader } from '../../../components/ui';
import { RootState } from '../../../redux/store';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { BankAccountTokenParams } from '@stripe/stripe-react-native';
import { validateBankAccountNumber, validateRoutingNumber } from '../../../utils/paymentValidation';

// Service import will need to be created
import { addBankAccount, getBankAccounts, removeBankAccount, setDefaultBankAccount } from '../../../services/paymentService';

interface BankAccount {
  id: string;
  last4: string;
  bankName: string;
  routingNumber: string;
  isDefault: boolean;
  accountType: 'checking' | 'savings';
  created: string;
}

const validationSchema = Yup.object().shape({
  accountHolderName: Yup.string().required('Account holder name is required'),
  accountNumber: Yup.string()
    .required('Account number is required')
    .test('account-validation', 'Invalid account number', function(value) {
      if (!value) return false;
      const validation = validateBankAccountNumber(value);
      return validation.isValid;
    }),
  routingNumber: Yup.string()
    .required('Routing number is required')
    .test('routing-validation', 'Invalid routing number', function(value) {
      if (!value) return false;
      const validation = validateRoutingNumber(value);
      return validation.isValid;
    }),
  accountType: Yup.string().required('Account type is required'),
});

const BankAccountScreen = () => {
  const dispatch = useDispatch();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  
  const user = useSelector((state: RootState) => state.auth.user);
  
  const fetchBankAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getBankAccounts();
      setAccounts(response);
    } catch (err) {
      setError('Failed to load bank accounts. Please try again.');
      console.error('Error fetching bank accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const handleAddBankAccount = async (values: any) => {
    setLoading(true);
    setError(null);
    
    // Validate using our payment validation functions
    const routingValidation = validateRoutingNumber(values.routingNumber);
    const accountValidation = validateBankAccountNumber(values.accountNumber);
    
    if (!routingValidation.isValid) {
      setError(routingValidation.message || 'Invalid routing number');
      setLoading(false);
      return;
    }
    
    if (!accountValidation.isValid) {
      setError(accountValidation.message || 'Invalid account number');
      setLoading(false);
      return;
    }
    
    try {
      const bankAccountParams: BankAccountTokenParams = {
        accountNumber: values.accountNumber,
        routingNumber: values.routingNumber,
        accountHolderName: values.accountHolderName,
        accountType: values.accountType as 'checking' | 'savings',
        countryCode: 'US',
      };
      
      await addBankAccount(bankAccountParams);
      setIsAddingAccount(false);
      fetchBankAccounts();
      Alert.alert('Success', 'Bank account added successfully');
    } catch (err) {
      setError('Failed to add bank account. Please verify your information and try again.');
      console.error('Error adding bank account:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAccount = async (accountId: string) => {
    Alert.alert(
      'Remove Bank Account',
      'Are you sure you want to remove this bank account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await removeBankAccount(accountId);
              fetchBankAccounts();
              Alert.alert('Success', 'Bank account removed successfully');
            } catch (err) {
              setError('Failed to remove bank account. Please try again.');
              console.error('Error removing bank account:', err);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSetDefaultAccount = async (accountId: string) => {
    setLoading(true);
    try {
      await setDefaultBankAccount(accountId);
      fetchBankAccounts();
      Alert.alert('Success', 'Default bank account updated');
    } catch (err) {
      setError('Failed to update default bank account. Please try again.');
      console.error('Error setting default bank account:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderBankAccount = (account: BankAccount) => {
    return (
      <AppCard key={account.id} style={styles.accountCard}>
        <View style={styles.accountHeader}>
          <View>
            <Text variant="titleMedium">{account.bankName}</Text>
            <Text variant="bodyMedium">
              •••• •••• •••• {account.last4}
            </Text>
            <Text variant="bodySmall" style={styles.accountType}>
              {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
            </Text>
          </View>
          <View style={styles.accountActions}>
            {account.isDefault ? (
              <Text style={styles.defaultLabel}>Default</Text>
            ) : (
              <AppButton 
                mode="text" 
                onPress={() => handleSetDefaultAccount(account.id)}
                compact
              >
                Set Default
              </AppButton>
            )}
            <TouchableOpacity 
              onPress={() => handleRemoveAccount(account.id)}
              style={styles.removeButton}
            >
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AppCard>
    );
  };

  if (loading && !isAddingAccount) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading bank accounts...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <SectionHeader title="Bank Accounts" />
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!isAddingAccount ? (
        <>
          <AppButton 
            mode="contained" 
            onPress={() => setIsAddingAccount(true)}
            style={styles.addButton}
          >
            Add Bank Account
          </AppButton>

          <View style={styles.accountsList}>
            {accounts.length === 0 ? (
              <EmptyState
                title="No Bank Accounts"
                description="Add a bank account to receive payments for your services"
                action={() => setIsAddingAccount(true)}
                actionText="Add Bank Account"
              />
            ) : (
              accounts.map(renderBankAccount)
            )}
          </View>
        </>
      ) : (
        <View style={styles.formContainer}>
          <Text variant="titleLarge" style={styles.formTitle}>
            Add Bank Account
          </Text>
          <Formik
            initialValues={{
              accountHolderName: '',
              accountNumber: '',
              routingNumber: '',
              accountType: 'checking',
              accountNumberError: '',
              routingNumberError: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleAddBankAccount}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
            }) => (
              <View>
                <TextInput
                  label="Account Holder Name"
                  value={values.accountHolderName}
                  onChangeText={handleChange('accountHolderName')}
                  onBlur={handleBlur('accountHolderName')}
                  style={styles.input}
                  error={touched.accountHolderName && !!errors.accountHolderName}
                />
                {touched.accountHolderName && errors.accountHolderName && (
                  <Text style={styles.errorText}>{errors.accountHolderName}</Text>
                )}

                <TextInput
                  label="Account Number"
                  value={values.accountNumber}
                  onChangeText={(text) => {
                    handleChange('accountNumber')(text);
                    const validation = validateBankAccountNumber(text);
                    if (!validation.isValid) {
                      setFieldValue('accountNumberError', validation.message, false);
                    } else {
                      setFieldValue('accountNumberError', '', false);
                    }
                  }}
                  onBlur={handleBlur('accountNumber')}
                  style={styles.input}
                  keyboardType="number-pad"
                  error={touched.accountNumber && (!!errors.accountNumber || !!values.accountNumberError)}
                  secureTextEntry
                />
                {touched.accountNumber && (errors.accountNumber || values.accountNumberError) && (
                  <Text style={styles.errorText}>{errors.accountNumber || values.accountNumberError}</Text>
                )}

                <TextInput
                  label="Routing Number"
                  value={values.routingNumber}
                  onChangeText={(text) => {
                    handleChange('routingNumber')(text);
                    const validation = validateRoutingNumber(text);
                    if (!validation.isValid) {
                      setFieldValue('routingNumberError', validation.message, false);
                    } else {
                      setFieldValue('routingNumberError', '', false);
                    }
                  }}
                  onBlur={handleBlur('routingNumber')}
                  style={styles.input}
                  keyboardType="number-pad"
                  error={touched.routingNumber && (!!errors.routingNumber || !!values.routingNumberError)}
                />
                {touched.routingNumber && (errors.routingNumber || values.routingNumberError) && (
                  <Text style={styles.errorText}>{errors.routingNumber || values.routingNumberError}</Text>
                )}

                <Text variant="bodyMedium" style={styles.accountTypeLabel}>
                  Account Type
                </Text>
                <View style={styles.accountTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.accountTypeButton,
                      values.accountType === 'checking' && styles.selectedAccountType,
                    ]}
                    onPress={() => setFieldValue('accountType', 'checking')}
                  >
                    <Text
                      style={[
                        styles.accountTypeText,
                        values.accountType === 'checking' && styles.selectedAccountTypeText,
                      ]}
                    >
                      Checking
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.accountTypeButton,
                      values.accountType === 'savings' && styles.selectedAccountType,
                    ]}
                    onPress={() => setFieldValue('accountType', 'savings')}
                  >
                    <Text
                      style={[
                        styles.accountTypeText,
                        values.accountType === 'savings' && styles.selectedAccountTypeText,
                      ]}
                    >
                      Savings
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formActions}>
                  <AppButton
                    mode="outlined"
                    onPress={() => setIsAddingAccount(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </AppButton>
                  <AppButton
                    mode="contained"
                    onPress={() => handleSubmit()}
                    loading={loading}
                    disabled={loading || 
                      !!errors.accountHolderName || 
                      !!errors.accountNumber || 
                      !!errors.routingNumber || 
                      !!values.accountNumberError || 
                      !!values.routingNumberError}
                  >
                    Save Bank Account
                  </AppButton>
                </View>
              </View>
            )}
          </Formik>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  addButton: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  accountsList: {
    padding: 16,
  },
  accountCard: {
    marginBottom: 12,
    elevation: 2,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountType: {
    color: '#666',
    marginTop: 2,
  },
  accountActions: {
    alignItems: 'flex-end',
  },
  defaultLabel: {
    backgroundColor: '#6C63FF',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    marginBottom: 8,
  },
  removeButton: {
    marginTop: 4,
  },
  removeText: {
    color: 'red',
    fontSize: 14,
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 4,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  formContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  formTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'white',
  },
  accountTypeLabel: {
    marginTop: 8,
    marginBottom: 8,
  },
  accountTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  accountTypeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 4,
  },
  selectedAccountType: {
    borderColor: '#6C63FF',
    backgroundColor: '#f0edff',
  },
  accountTypeText: {
    color: '#666',
  },
  selectedAccountTypeText: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    marginRight: 8,
  },
});

export default BankAccountScreen;