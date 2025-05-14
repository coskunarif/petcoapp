import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Divider, 
  TextInput, 
  Switch, 
  Checkbox, 
  DataTable, 
  useTheme, 
  IconButton,
  Snackbar
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { selectCurrentUser } from '../../redux/selectors';
import { useNavigation } from '@react-navigation/native';

// Types for fee tiers
interface FeeTier {
  id: string;
  name: string;
  percentage: number;
  isActive: boolean;
  appliesTo: string[]; // service types this fee applies to
  createdAt: string;
}

interface FeeHistory {
  date: string;
  percentage: number;
}

const PlatformFeeAdmin = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const currentUser = useSelector(selectCurrentUser);
  
  // State variables
  const [feeTiers, setFeeTiers] = useState<FeeTier[]>([]);
  const [defaultTier, setDefaultTier] = useState<string>('');
  const [feeHistory, setFeeHistory] = useState<FeeHistory[]>([]);
  const [newTier, setNewTier] = useState<Partial<FeeTier>>({
    name: '',
    percentage: 0,
    isActive: true,
    appliesTo: []
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Check if user is admin
  useEffect(() => {
    if (currentUser && !currentUser.isAdmin) {
      Alert.alert('Access Denied', 'You must be an admin to access this page');
      navigation.goBack();
    } else {
      fetchFeeData();
    }
  }, [currentUser, navigation]);

  // Fetch fee data
  const fetchFeeData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await adminService.getPlatformFees();
      
      // Simulated data - replace with actual API call
      const mockResponse = {
        feeTiers: [
          {
            id: '1',
            name: 'Standard',
            percentage: 10,
            isActive: true,
            appliesTo: ['pet-sitting', 'dog-walking', 'grooming'],
            createdAt: '2025-01-01T00:00:00Z'
          },
          {
            id: '2',
            name: 'Premium',
            percentage: 15,
            isActive: true,
            appliesTo: ['boarding', 'training'],
            createdAt: '2025-01-15T00:00:00Z'
          },
          {
            id: '3',
            name: 'Promotional',
            percentage: 5,
            isActive: false,
            appliesTo: ['all'],
            createdAt: '2025-02-01T00:00:00Z'
          }
        ],
        defaultTier: '1',
        feeHistory: [
          { date: 'Jan', percentage: 8 },
          { date: 'Feb', percentage: 9 },
          { date: 'Mar', percentage: 10 },
          { date: 'Apr', percentage: 10 },
          { date: 'May', percentage: 12 },
          { date: 'Jun', percentage: 10 }
        ]
      };
      
      setFeeTiers(mockResponse.feeTiers);
      setDefaultTier(mockResponse.defaultTier);
      setFeeHistory(mockResponse.feeHistory);
    } catch (err) {
      setError('Failed to load fee data');
      console.error('Error fetching fee data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save fee settings
  const saveSettings = async () => {
    try {
      setSaving(true);
      // TODO: Replace with actual API call
      // await adminService.updatePlatformFees({ feeTiers, defaultTier });
      
      // Simulate API call success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSnackbarMessage('Fee settings saved successfully');
      setSnackbarVisible(true);
    } catch (err) {
      setError('Failed to save fee settings');
      console.error('Error saving fee settings:', err);
    } finally {
      setSaving(false);
    }
  };

  // Add new fee tier
  const addFeeTier = () => {
    if (!newTier.name || newTier.percentage === undefined) {
      setError('Name and percentage are required');
      return;
    }
    
    const id = Date.now().toString();
    const newFeeTierComplete: FeeTier = {
      id,
      name: newTier.name,
      percentage: newTier.percentage,
      isActive: newTier.isActive || true,
      appliesTo: newTier.appliesTo || [],
      createdAt: new Date().toISOString()
    };
    
    setFeeTiers([...feeTiers, newFeeTierComplete]);
    setNewTier({ name: '', percentage: 0, isActive: true, appliesTo: [] });
    setSnackbarMessage('New fee tier added');
    setSnackbarVisible(true);
  };

  // Update existing fee tier
  const updateFeeTier = (id: string, updates: Partial<FeeTier>) => {
    setFeeTiers(feeTiers.map(tier => 
      tier.id === id ? { ...tier, ...updates } : tier
    ));
  };

  // Delete fee tier
  const deleteFeeTier = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this fee tier?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setFeeTiers(feeTiers.filter(tier => tier.id !== id));
            setSnackbarMessage('Fee tier deleted');
            setSnackbarVisible(true);
          }
        }
      ]
    );
  };

  // Toggle fee tier active status
  const toggleFeeTierActive = (id: string) => {
    setFeeTiers(feeTiers.map(tier => 
      tier.id === id ? { ...tier, isActive: !tier.isActive } : tier
    ));
  };

  // Set as default fee tier
  const setAsDefaultTier = (id: string) => {
    setDefaultTier(id);
  };

  // Start editing a tier
  const startEditing = (tier: FeeTier) => {
    setEditing(tier.id);
    setNewTier({
      name: tier.name,
      percentage: tier.percentage,
      isActive: tier.isActive,
      appliesTo: tier.appliesTo
    });
  };

  // Save edited tier
  const saveEdit = () => {
    if (editing && newTier.name && newTier.percentage !== undefined) {
      updateFeeTier(editing, newTier);
      setEditing(null);
      setNewTier({ name: '', percentage: 0, isActive: true, appliesTo: [] });
      setSnackbarMessage('Fee tier updated');
      setSnackbarVisible(true);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditing(null);
    setNewTier({ name: '', percentage: 0, isActive: true, appliesTo: [] });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading fee settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text variant="headlineMedium">Platform Fee Management</Text>
          <Text variant="bodyMedium">Configure and manage platform fee tiers and settings</Text>
        </Card.Content>
      </Card>
      
      {error && (
        <Card style={[styles.errorCard, { backgroundColor: theme.colors.errorContainer }]}>
          <Card.Content>
            <Text style={{ color: theme.colors.error }}>{error}</Text>
            <Button 
              mode="text" 
              onPress={() => setError(null)}
              style={styles.dismissButton}
            >
              Dismiss
            </Button>
          </Card.Content>
        </Card>
      )}
      
      {/* Current Fee Tiers Table */}
      <Card style={styles.card}>
        <Card.Title title="Current Fee Tiers" />
        <Card.Content>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Name</DataTable.Title>
              <DataTable.Title numeric>Percentage</DataTable.Title>
              <DataTable.Title>Status</DataTable.Title>
              <DataTable.Title>Default</DataTable.Title>
              <DataTable.Title>Actions</DataTable.Title>
            </DataTable.Header>
            
            {feeTiers.map((tier) => (
              <DataTable.Row key={tier.id}>
                <DataTable.Cell>{tier.name}</DataTable.Cell>
                <DataTable.Cell numeric>{tier.percentage}%</DataTable.Cell>
                <DataTable.Cell>
                  <Switch 
                    value={tier.isActive} 
                    onValueChange={() => toggleFeeTierActive(tier.id)}
                  />
                </DataTable.Cell>
                <DataTable.Cell>
                  <Checkbox 
                    status={defaultTier === tier.id ? 'checked' : 'unchecked'} 
                    onPress={() => setAsDefaultTier(tier.id)}
                  />
                </DataTable.Cell>
                <DataTable.Cell>
                  <View style={styles.actionButtons}>
                    <IconButton 
                      icon="pencil" 
                      size={20} 
                      onPress={() => startEditing(tier)}
                    />
                    <IconButton 
                      icon="delete" 
                      size={20} 
                      onPress={() => deleteFeeTier(tier.id)} 
                    />
                  </View>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>
      
      {/* Add or Edit Fee Tier */}
      <Card style={styles.card}>
        <Card.Title title={editing ? "Edit Fee Tier" : "Add New Fee Tier"} />
        <Card.Content>
          <TextInput
            label="Tier Name"
            value={newTier.name || ''}
            onChangeText={(text) => setNewTier({...newTier, name: text})}
            style={styles.input}
          />
          
          <TextInput
            label="Percentage"
            value={newTier.percentage?.toString() || ''}
            onChangeText={(text) => setNewTier({...newTier, percentage: parseFloat(text) || 0})}
            keyboardType="decimal-pad"
            style={styles.input}
            right={<TextInput.Affix text="%" />}
          />
          
          <View style={styles.switchContainer}>
            <Text>Active</Text>
            <Switch 
              value={newTier.isActive || false} 
              onValueChange={(value) => setNewTier({...newTier, isActive: value})}
            />
          </View>
          
          <Text style={styles.sectionTitle}>Applies To:</Text>
          <View style={styles.serviceTypes}>
            {['pet-sitting', 'dog-walking', 'grooming', 'boarding', 'training', 'all'].map((type) => (
              <Checkbox.Item 
                key={type}
                label={type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                status={newTier.appliesTo?.includes(type) ? 'checked' : 'unchecked'}
                onPress={() => {
                  const updatedTypes = [...(newTier.appliesTo || [])];
                  if (updatedTypes.includes(type)) {
                    const index = updatedTypes.indexOf(type);
                    updatedTypes.splice(index, 1);
                  } else {
                    // If 'all' is selected, clear other selections
                    if (type === 'all') {
                      updatedTypes.length = 0;
                    } else {
                      // If a specific service is selected, remove 'all'
                      const allIndex = updatedTypes.indexOf('all');
                      if (allIndex !== -1) {
                        updatedTypes.splice(allIndex, 1);
                      }
                    }
                    updatedTypes.push(type);
                  }
                  setNewTier({...newTier, appliesTo: updatedTypes});
                }}
              />
            ))}
          </View>
          
          <View style={styles.buttonContainer}>
            {editing ? (
              <>
                <Button 
                  mode="contained" 
                  onPress={saveEdit} 
                  style={styles.button}
                >
                  Save Changes
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={cancelEdit} 
                  style={styles.button}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button 
                mode="contained" 
                onPress={addFeeTier} 
                style={styles.button}
              >
                Add Tier
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
      
      {/* Historic Fee Visualization */}
      <Card style={styles.card}>
        <Card.Title title="Fee History" />
        <Card.Content>
          {feeHistory.length > 0 ? (
            <LineChart
              data={{
                labels: feeHistory.map(item => item.date),
                datasets: [{
                  data: feeHistory.map(item => item.percentage)
                }]
              }}
              width={Dimensions.get('window').width - 50}
              height={220}
              yAxisSuffix="%"
              chartConfig={{
                backgroundColor: theme.colors.surface,
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
                decimalPlaces: 1,
                color: () => theme.colors.primary,
                labelColor: () => theme.colors.onSurface,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: theme.colors.primary
                }
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <Text>No historical data available</Text>
          )}
        </Card.Content>
      </Card>
      
      {/* Save All Settings */}
      <Card style={styles.card}>
        <Card.Content>
          <Button 
            mode="contained" 
            onPress={saveSettings} 
            loading={saving}
            disabled={saving}
            style={styles.saveButton}
          >
            Save All Settings
          </Button>
        </Card.Content>
      </Card>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}>
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  errorCard: {
    marginBottom: 16,
  },
  dismissButton: {
    alignSelf: 'flex-end',
  },
  input: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  serviceTypes: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  saveButton: {
    marginTop: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  }
});

export default PlatformFeeAdmin;