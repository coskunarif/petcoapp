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
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';

// Common interface for service types
interface ServiceType {
  id: string;
  name: string;
}

interface ServiceFormModalProps {
  visible: boolean;
  onClose: () => void;
  // Generic onSubmit that handles both service creation and requests
  onSubmit: (data: {
    title?: string;
    service_type_id: string;
    description: string;
    date?: string;
    availability_schedule?: any;
  }) => void;
  serviceTypes: ServiceType[];
  initialValues?: {
    title?: string;
    service_type_id?: string;
    description?: string;
    date?: string;
  };
  mode: 'create' | 'request' | 'edit';
  // Additional fields to force showing or hiding
  showTitle?: boolean;
  showDate?: boolean;
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({ 
  visible, 
  onClose, 
  onSubmit, 
  serviceTypes,
  initialValues,
  mode,
  showTitle,
  showDate
}) => {
  // Form state
  const [title, setTitle] = useState('');
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [selectedDateObj, setSelectedDateObj] = useState(new Date());
  const [date, setDate] = useState<string>(selectedDateObj.toISOString());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine which fields to show based on mode and explicit props
  const shouldShowTitle = showTitle !== undefined ? showTitle : (mode === 'create' || mode === 'edit');
  const shouldShowDate = showDate !== undefined ? showDate : (mode === 'request');
  
  // Get title based on mode
  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return 'Create New Service';
      case 'edit':
        return 'Edit Service';
      case 'request':
        return 'Request a Service';
      default:
        return 'Service Form';
    }
  };

  // Get submit button text based on mode
  const getSubmitButtonText = () => {
    switch (mode) {
      case 'create':
        return 'Create Service';
      case 'edit':
        return 'Update Service';
      case 'request':
        return 'Request Service';
      default:
        return 'Submit';
    }
  };

  // Reset state when modal becomes visible or when initialValues change
  useEffect(() => {
    if (visible) {
      // Set initial values if provided
      if (initialValues) {
        setTitle(initialValues.title || '');
        setSelectedServiceTypeId(initialValues.service_type_id || 
          (serviceTypes.length > 0 ? serviceTypes[0].id : undefined));
        setDescription(initialValues.description || '');
        
        // Set date if provided, otherwise use current date
        if (initialValues.date) {
          const initialDate = new Date(initialValues.date);
          setSelectedDateObj(initialDate);
          setDate(initialDate.toISOString());
        } else {
          const now = new Date();
          setSelectedDateObj(now);
          setDate(now.toISOString());
        }
      } else {
        // Default values for new service
        setTitle('');
        setSelectedServiceTypeId(serviceTypes.length > 0 ? serviceTypes[0].id : undefined);
        setDescription('');
        const now = new Date();
        setSelectedDateObj(now);
        setDate(now.toISOString());
      }
      
      setError(null);
      setSubmitting(false);
      setShowDatePicker(false);
    }
  }, [visible, initialValues, serviceTypes]);

  const validate = () => {
    // Reset any previous errors
    setError(null);
    
    // Check if required fields are filled
    if (!selectedServiceTypeId) {
      setError('Please select a service type');
      return false;
    }
    
    if (!description || description.trim() === '') {
      setError('Please provide a description');
      return false;
    }
    
    // If title is shown, it's required
    if (shouldShowTitle && (!title || title.trim() === '')) {
      setError('Please provide a title for your service');
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
      const formData = {
        // Include title if the field is shown
        ...(shouldShowTitle && { title }),
        service_type_id: selectedServiceTypeId!,
        description,
        // Include date if the field is shown
        ...(shouldShowDate && { date }),
        // Include availability schedule for service creation/editing
        ...(mode !== 'request' && {
          availability_schedule: {
            days: [],
            hours: '',
            notes: '',
            // Include date in availability_schedule as well (to be used by the backend)
            ...(shouldShowDate && { scheduled_date: date })
          }
        }),
      };
      
      console.log(`[ServiceFormModal] Submitting form in ${mode} mode:`, formData);
      
      await onSubmit(formData);
      onClose();
    } catch (e: any) {
      console.error(`[ServiceFormModal] Error submitting form in ${mode} mode:`, e);
      setError(e.message || `An error occurred while submitting the ${mode === 'request' ? 'request' : 'service'}.`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
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
            <Text style={styles.headerText}>{getModalTitle()}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView}>
            <View style={styles.content}>
              {/* Title Field - Show based on shouldShowTitle */}
              {shouldShowTitle && (
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Title</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="E.g., Professional Dog Walking Service"
                    value={title}
                    onChangeText={setTitle}
                    editable={!submitting}
                    placeholderTextColor="#999"
                  />
                </View>
              )}
              
              {/* Service Type Selection */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Service Type</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedServiceTypeId}
                    onValueChange={(itemValue) => setSelectedServiceTypeId(itemValue)}
                    style={styles.picker}
                    enabled={!submitting}
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
                  placeholder={mode === 'request' 
                    ? "Description / Special Instructions" 
                    : "Describe the services you provide, your experience, etc."}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  editable={!submitting}
                  placeholderTextColor="#999"
                />
              </View>
              
              {/* Date Field - Show based on shouldShowDate */}
              {shouldShowDate && (
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Preferred Date</Text>
                  <TouchableOpacity 
                    onPress={() => setShowDatePicker(true)} 
                    style={styles.dateSelector}
                    disabled={submitting}
                  >
                    <Text style={styles.dateText}>
                      {formatDate(selectedDateObj)}
                    </Text>
                    <MaterialCommunityIcons 
                      name="calendar-month" 
                      size={20} 
                      color={theme.colors.primary}
                    />
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
              )}
              
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
                <Text style={styles.submitButtonText}>
                  {getSubmitButtonText()}
                </Text>
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
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 150 : 50,
  },
  dateSelector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
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

export default ServiceFormModal;