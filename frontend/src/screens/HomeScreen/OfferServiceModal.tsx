import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform,
  ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

// Define the structure for a service type
interface ServiceType {
  id: string;
  name: string;
}

interface OfferServiceModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (service: { 
    service_type_id: string; 
    description: string; 
    cost: string; 
    availability: string 
  }) => void;
  serviceTypes: ServiceType[];
}

const OfferServiceModal: React.FC<OfferServiceModalProps> = ({ visible, onClose, onSubmit, serviceTypes }) => {
  // Form state
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [availability, setAvailability] = useState('');
  
  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Set default selected type if serviceTypes is not empty
      setSelectedServiceTypeId(serviceTypes.length > 0 ? serviceTypes[0].id : undefined);
      setDescription('');
      setCost('');
      setAvailability('');
      setError(null);
      setSubmitting(false);
    }
  }, [visible, serviceTypes]);

  const validate = () => {
    // Reset any previous errors
    setError(null);
    
    // Check if all required fields are filled
    if (!selectedServiceTypeId) {
      setError('Please select a service type');
      return false;
    }
    
    if (!description || description.trim() === '') {
      setError('Please provide a description of your service');
      return false;
    }
    
    if (!cost || cost.trim() === '') {
      setError('Please specify the cost of your service');
      return false;
    }
    
    // Validate cost is a number
    const costNumber = parseFloat(cost);
    if (isNaN(costNumber) || costNumber <= 0) {
      setError('Please enter a valid cost (must be greater than 0)');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      console.log('[OfferServiceModal] Submitting form with:', {
        service_type_id: selectedServiceTypeId,
        description,
        cost,
        availability
      });
      
      await onSubmit({ 
        service_type_id: selectedServiceTypeId!, 
        description, 
        cost, 
        availability 
      });
      
      onClose();
    } catch (e: any) {
      console.error('[OfferServiceModal] Error submitting form:', e);
      setError(e.message || 'An error occurred while offering the service.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Offer a Pet Service</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView}>
            <View style={styles.content}>
              {/* Service Type Selection */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Service Type</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedServiceTypeId}
                    onValueChange={(itemValue) => setSelectedServiceTypeId(itemValue)}
                    style={styles.picker}
                    enabled={!submitting}
                    itemStyle={styles.pickerItem}
                    dropdownIconColor="#333"
                  >
                    {serviceTypes && serviceTypes.length > 0 ? (
                      serviceTypes.map((st) => (
                        <Picker.Item key={st.id} label={st.name} value={st.id} />
                      ))
                    ) : (
                      <Picker.Item label="No service types available" value={undefined} />
                    )}
                  </Picker>
                </View>
              </View>
              
              {/* Description Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe the services you provide, your experience, etc."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  editable={!submitting}
                  placeholderTextColor="#999"
                />
              </View>
              
              {/* Cost Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Cost (credits)</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="0.00"
                    value={cost}
                    onChangeText={setCost}
                    keyboardType="numeric"
                    editable={!submitting}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
              
              {/* Availability Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Availability</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Weekdays 9am-5pm, Weekends only, etc."
                  value={availability}
                  onChangeText={setAvailability}
                  editable={!submitting}
                  placeholderTextColor="#999"
                />
              </View>
              
              {/* Error Message */}
              {error && (
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons name="alert-circle" size={20} color="red" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </View>
          </ScrollView>
          
          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={onClose} 
              disabled={submitting}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.submitButton]} 
              onPress={handleSubmit} 
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Create Service</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    width: '100%',
    maxWidth: 500,
    borderRadius: 10,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  scrollView: {
    maxHeight: 400,
  },
  content: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: Platform.OS === 'android' ? 10 : 0,
    paddingVertical: Platform.OS === 'android' ? 5 : 0,
    minHeight: Platform.OS === 'android' ? 60 : 150,
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 150 : Dimensions.get('window').height * 0.07,
    color: '#333',
    fontSize: 16,
    marginVertical: Platform.OS === 'android' ? 8 : 0,
  },
  pickerItem: {
    fontSize: 18,
    height: 120,
    color: '#333',
    backgroundColor: '#fff',
    fontWeight: '400',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.08)',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 10,
  },
  button: {
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    minWidth: 140,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OfferServiceModal;