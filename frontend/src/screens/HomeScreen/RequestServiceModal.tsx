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
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { theme } from '../../theme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { createServiceRequest } from '../../redux/slices/homeSlice';
import { LocationCoords } from '../../services/locationService';

interface RequestServiceModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (request: { service_type_id: string; description: string; date: string; pet_id?: string }) => void;
  serviceTypes: { id: string; name: string }[];
  pets?: { id: string; name: string }[];
}

const RequestServiceModal: React.FC<RequestServiceModalProps> = ({ visible, onClose, onSubmit, serviceTypes, pets }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const location = useSelector((state: RootState) => state.home.location);
  const loading = useSelector((state: RootState) => state.home.loading);
  const reduxError = useSelector((state: RootState) => state.home.error);

  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [selectedDateObj, setSelectedDateObj] = useState(new Date());
  const [date, setDate] = useState<string>(selectedDateObj.toISOString()); // ISO string for submission logic
  const [showDatePicker, setShowDatePicker] = useState(false); // State to control picker visibility
  const [pet, setPet] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Combination of local and Redux state for UI
  const error = localError || reduxError;
  const submitting = loading;

  const handleSubmit = async () => {
    setLocalError(null);
    
    // Validate inputs
    if (!selectedServiceTypeId || !description || !date) {
      setLocalError('Please fill in all required fields.');
      return;
    }
    
    if (!user?.id) {
      setLocalError('You must be logged in to request a service.');
      return;
    }
    
    try {
      // Prepare service request data
      // Make sure we don't pass empty strings as UUIDs
      const requestData = {
        service_type_id: selectedServiceTypeId,
        start_time: date,
        location: location as LocationCoords,
        notes: description,
        // Only include pet_id if it has a valid value
        ...(pet && pet.trim() !== '' ? { pet_id: pet } : {})
      };
      
      console.log('[RequestServiceModal] Request data prepared:', requestData);
      
      // Dispatch the Redux action
      const resultAction = await dispatch(createServiceRequest({
        userId: user.id,
        requestData
      }));
      
      // Check if the action was successful
      if (createServiceRequest.fulfilled.match(resultAction)) {
        // Call the onSubmit callback if provided
        if (onSubmit) {
          onSubmit({
            service_type_id: selectedServiceTypeId!,
            description, // The component still uses 'description' but we map it to 'notes' in homeService.ts
            date,
            pet_id: pet
          });
        }
        
        // Reset form and close modal
        resetForm();
        onClose();
      } else if (createServiceRequest.rejected.match(resultAction)) {
        // The error will be handled by Redux and shown in the error state
        console.error('[RequestServiceModal] Service request failed:', resultAction.payload);
      }
    } catch (err: any) {
      setLocalError(err.message || 'Failed to submit request');
    }
  }
  
  // Reset form helper
  const resetForm = () => {
    setSelectedServiceTypeId(serviceTypes.length > 0 ? serviceTypes[0].id : undefined);
    setDescription('');
    // Reset date state
    const now = new Date();
    setSelectedDateObj(now);
    setDate(now.toISOString());
    setPet('');
    setLocalError(null);
  };
// Reset state when modal becomes visible
useEffect(() => {
  if (visible) {
    resetForm();
    setShowDatePicker(false); // Ensure picker is hidden when modal opens
  }
}, [visible, serviceTypes]);



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
              <Text style={styles.header}>Request a Service</Text>
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
                    onValueChange={(itemValue) => setSelectedServiceTypeId(itemValue)}
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
                  placeholder="Description / Special Instructions"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  editable={!submitting}
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>
              
              {/* Date Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Preferred Date</Text>
                <TouchableOpacity 
                  onPress={() => setShowDatePicker(true)} 
                  style={styles.input}
                  disabled={submitting}
                >
                  <View style={styles.datePickerButton}>
                    <Text style={styles.dateText}>
                      {selectedDateObj.toLocaleDateString()}
                    </Text>
                    <MaterialCommunityIcons 
                      name="calendar-month" 
                      size={20} 
                      color={theme.colors.primary}
                    />
                  </View>
                </TouchableOpacity>
                
                {/* Conditionally render the DateTimePicker */}
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDateObj}
                    mode="date"
                    display="default"
                    onChange={(event, newSelectedDate) => {
                      setShowDatePicker(false);
                      if (event.type === 'set' && newSelectedDate) {
                        setSelectedDateObj(newSelectedDate);
                        setDate(newSelectedDate.toISOString());
                      }
                    }}
                    minimumDate={new Date()}
                  />
                )}
              </View>
              
              {/* Pet Selection (if available) - Using picker for valid UUIDs */}
              {pets && pets.length > 0 && (
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Pet (optional)</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={pet}
                      onValueChange={(itemValue) => setPet(itemValue)}
                      style={styles.picker}
                      enabled={!submitting}
                      itemStyle={styles.pickerItem}
                    >
                      <Picker.Item label="Select a pet (optional)" value="" />
                      {pets.map((petOption) => (
                        <Picker.Item key={petOption.id} label={petOption.name} value={petOption.id} />
                      ))}
                    </Picker>
                  </View>
                </View>
              )}
              
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
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
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

export default RequestServiceModal;
