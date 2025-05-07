import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
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

  // Debug logging for serviceTypes
  useEffect(() => {
    console.log('[OfferServiceModal] serviceTypes:', serviceTypes);
    console.log('[OfferServiceModal] serviceTypes length:', serviceTypes?.length);
  }, [serviceTypes]);

  // Reset state when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Set default selected type if serviceTypes is not empty
      setSelectedServiceTypeId(serviceTypes.length > 0 ? serviceTypes[0].id : undefined);
      console.log('[OfferServiceModal] Setting selectedServiceTypeId:', serviceTypes.length > 0 ? serviceTypes[0].id : undefined);
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
        <BlurView 
          style={StyleSheet.absoluteFill} 
          intensity={40} 
          tint="dark"
        />
        
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
            <View style={styles.headerContainer}>
              <Text style={styles.header}>Offer a Pet Service</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* Service Type Selection */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Service Type</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedServiceTypeId}
                    onValueChange={(itemValue) => {
                      console.log('[OfferServiceModal] Selected service type ID:', itemValue);
                      setSelectedServiceTypeId(itemValue);
                    }}
                    style={styles.picker}
                    enabled={!submitting}
                    itemStyle={styles.pickerItem}
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
                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe the services you provide, your experience, etc."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  editable={!submitting}
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>
              
              {/* Cost Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Cost (credits)</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="0.00"
                    value={cost}
                    onChangeText={setCost}
                    keyboardType="numeric"
                    editable={!submitting}
                    placeholderTextColor={theme.colors.textTertiary}
                  />
                </View>
              </View>
              
              {/* Availability Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Availability</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Weekdays 9am-5pm, Weekends only, etc."
                  value={availability}
                  onChangeText={setAvailability}
                  editable={!submitting}
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>
              
              {/* Error Message */}
              {error && (
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons name="alert-circle" size={20} color={theme.colors.error} />
                  <Text style={styles.error}>{error}</Text>
                </View>
              )}
            </ScrollView>
            
            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={onClose} 
                disabled={submitting}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.submitBtn} 
                onPress={handleSubmit} 
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '92%',
    maxWidth: 460,
    maxHeight: '90%',
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    ...theme.elevation.large,
  },
  modalCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    ...theme.typography.h2,
    color: theme.colors.primary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: theme.borderRadius.small,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.5)',
    color: theme.colors.text,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: theme.borderRadius.small,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginBottom: 8,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 200 : 50,
    color: theme.colors.text,
  },
  pickerItem: {
    fontSize: 16,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: theme.borderRadius.small,
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.text,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(211,47,47,0.08)',
    borderRadius: theme.borderRadius.small,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  error: {
    color: theme.colors.error,
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.05)',
    padding: 16,
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  cancelText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 16,
  },
  submitBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    minWidth: 100,
    alignItems: 'center',
    ...theme.elevation.small,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default OfferServiceModal;