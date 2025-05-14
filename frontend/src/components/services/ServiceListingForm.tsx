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
  ScrollView,
  KeyboardAvoidingView,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ServiceTypeSelector } from '../index';
import { AvailabilitySelector } from '../index';
import { ServicePhotoGallery } from '../index';
import { ServiceType } from '../../types/services';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';

interface ServiceListingFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    service_type_id: string;
    description: string;
    photos?: string[];
    availability_schedule?: {
      days: string[];
      hours: string;
      notes: string;
      scheduled_date?: string;
    };
    price?: number;
  }) => Promise<void>;
  serviceTypes: ServiceType[];
  initialValues?: {
    title?: string;
    service_type_id?: string;
    description?: string;
    photos?: string[];
    availability_schedule?: {
      days?: string[];
      hours?: string;
      notes?: string;
      scheduled_date?: string;
    };
    price?: number;
  };
  mode: 'create' | 'edit';
}

/**
 * Enhanced service listing form with:
 * - Service type selection
 * - Title and description
 * - Photos management
 * - Availability settings
 * - Pricing
 */
export default function ServiceListingForm({
  visible,
  onClose,
  onSubmit,
  serviceTypes,
  initialValues,
  mode
}: ServiceListingFormProps) {
  // Screen dimensions for responsive layout
  const { width, height } = Dimensions.get('window');
  
  // Form state
  const [title, setTitle] = useState('');
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [mainPhotoIndex, setMainPhotoIndex] = useState(-1);
  const [availabilitySchedule, setAvailabilitySchedule] = useState<{
    days: string[];
    hours: string;
    notes: string;
    scheduled_date?: string;
  }>({
    days: [],
    hours: '9:00 AM - 5:00 PM',
    notes: ''
  });
  const [price, setPrice] = useState<string>('');
  
  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Reset form when modal becomes visible or initialValues change
  useEffect(() => {
    if (visible) {
      // Reset state
      setCurrentStep(1);
      setErrors({});
      
      // Set initial values if provided
      if (initialValues) {
        setTitle(initialValues.title || '');
        setSelectedServiceTypeId(initialValues.service_type_id || serviceTypes[0]?.id);
        setDescription(initialValues.description || '');
        setPhotos(initialValues.photos || []);
        setMainPhotoIndex(initialValues.photos && initialValues.photos.length > 0 ? 0 : -1);
        
        if (initialValues.availability_schedule) {
          setAvailabilitySchedule({
            days: initialValues.availability_schedule.days || [],
            hours: initialValues.availability_schedule.hours || '9:00 AM - 5:00 PM',
            notes: initialValues.availability_schedule.notes || '',
            scheduled_date: initialValues.availability_schedule.scheduled_date
          });
        } else {
          setAvailabilitySchedule({
            days: [],
            hours: '9:00 AM - 5:00 PM',
            notes: ''
          });
        }
        
        // Convert price to string for the input
        setPrice(initialValues.price ? initialValues.price.toString() : '');
      } else {
        // Default values
        setTitle('');
        setSelectedServiceTypeId(serviceTypes[0]?.id);
        setDescription('');
        setPhotos([]);
        setMainPhotoIndex(-1);
        setAvailabilitySchedule({
          days: [],
          hours: '9:00 AM - 5:00 PM',
          notes: ''
        });
        setPrice('');
      }
    }
  }, [visible, initialValues, serviceTypes]);
  
  // Validate current step
  const validateCurrentStep = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    // Step 1: Basic Info
    if (currentStep === 1) {
      if (!title.trim()) {
        newErrors.title = 'Title is required';
      }
      
      if (!selectedServiceTypeId) {
        newErrors.service_type_id = 'Please select a service type';
      }
      
      if (!description.trim()) {
        newErrors.description = 'Description is required';
      } else if (description.length < 20) {
        newErrors.description = 'Description must be at least 20 characters';
      }
    }
    
    // Step 2: Photos (no validation required)
    
    // Step 3: Availability
    if (currentStep === 3) {
      if (availabilitySchedule.days.length === 0) {
        newErrors.availability_days = 'Please select at least one day';
      }
    }
    
    // Step 4: Pricing
    if (currentStep === 4) {
      if (!price.trim()) {
        newErrors.price = 'Price is required';
      } else {
        const priceValue = Number(price);
        if (isNaN(priceValue) || priceValue <= 0) {
          newErrors.price = 'Please enter a valid price greater than 0';
        } else if (priceValue > 1000) {
          newErrors.price = 'Price cannot exceed 1000 credits';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Go to next step
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(Math.min(currentStep + 1, totalSteps));
    }
  };
  
  // Go to previous step
  const handlePrevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate final step
    if (!validateCurrentStep()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Parse price to number
      const priceValue = parseFloat(price);
      
      // Call onSubmit with form data
      await onSubmit({
        title,
        service_type_id: selectedServiceTypeId || '',
        description,
        photos,
        availability_schedule: availabilitySchedule,
        price: isNaN(priceValue) ? undefined : priceValue
      });
      
      // Close modal on success
      onClose();
    } catch (error) {
      console.error('Error submitting service listing:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'An error occurred while submitting the form'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Basic Information</Text>
            
            {/* Service Type */}
            <ServiceTypeSelector
              serviceTypes={serviceTypes}
              selectedTypeId={selectedServiceTypeId}
              onSelectType={setSelectedServiceTypeId}
              error={errors.service_type_id}
            />
            
            {/* Title */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Service Title</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="E.g., Professional Dog Walking Service"
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (errors.title) {
                    setErrors({ ...errors, title: '' });
                  }
                }}
                maxLength={100}
                placeholderTextColor={theme.colors.textTertiary}
              />
              {errors.title && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}
            </View>
            
            {/* Description */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                placeholder="Describe your service, experience, and what makes it special..."
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  if (errors.description) {
                    setErrors({ ...errors, description: '' });
                  }
                }}
                multiline
                numberOfLines={5}
                placeholderTextColor={theme.colors.textTertiary}
              />
              {errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
              <Text style={styles.charCount}>
                {description.length} / 500 characters
              </Text>
            </View>
          </View>
        );
      
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Service Photos</Text>
            
            <ServicePhotoGallery
              photos={photos}
              onPhotosChange={setPhotos}
              mainPhotoIndex={mainPhotoIndex}
              onMainPhotoChange={setMainPhotoIndex}
              maxPhotos={5}
              error={errors.photos}
            />
            
            <Text style={styles.helpText}>
              Photos help pet owners see what your service looks like. Add up to 5 photos to showcase your service.
            </Text>
          </View>
        );
      
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Availability</Text>
            
            <AvailabilitySelector
              initialValue={availabilitySchedule}
              onValueChange={setAvailabilitySchedule}
              error={errors.availability_days}
            />
            
            <Text style={styles.helpText}>
              Set your regular availability to help pet owners know when you're available for service.
            </Text>
          </View>
        );
      
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Pricing</Text>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Price (Credits)</Text>
              <View style={[styles.priceInputContainer, errors.price && styles.inputError]}>
                <MaterialCommunityIcons name="currency-usd" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={styles.priceInput}
                  placeholder="30"
                  value={price}
                  onChangeText={(text) => {
                    // Allow only numbers and decimal point
                    const filteredText = text.replace(/[^0-9.]/g, '');
                    setPrice(filteredText);
                    if (errors.price) {
                      setErrors({ ...errors, price: '' });
                    }
                  }}
                  keyboardType="numeric"
                  placeholderTextColor={theme.colors.textTertiary}
                />
                <Text style={styles.creditText}>credits</Text>
              </View>
              {errors.price && (
                <Text style={styles.errorText}>{errors.price}</Text>
              )}
            </View>
            
            <Text style={styles.helpText}>
              Set a fair price for your service in credits. Remember, competitive pricing can help attract more pet owners.
            </Text>
            
            {/* Submit Error */}
            {errors.submit && (
              <View style={styles.submitErrorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={20} color={theme.colors.error} />
                <Text style={styles.submitErrorText}>{errors.submit}</Text>
              </View>
            )}
          </View>
        );
      
      default:
        return null;
    }
  };
  
  // Render step indicator
  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicatorContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.stepIndicator,
              currentStep === index + 1 && styles.activeStepIndicator,
              currentStep > index + 1 && styles.completedStepIndicator
            ]}
          >
            {currentStep > index + 1 ? (
              <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
            ) : (
              <Text style={[
                styles.stepIndicatorText,
                currentStep === index + 1 && styles.activeStepIndicatorText
              ]}>
                {index + 1}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };
  
  if (!visible) return null;
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {mode === 'create' ? 'Create New Listing' : 'Edit Listing'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onClose}
                disabled={submitting}
              >
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            {/* Step Indicator */}
            {renderStepIndicator()}
            
            {/* Content */}
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {renderStep()}
            </ScrollView>
            
            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
              {currentStep > 1 && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handlePrevStep}
                  disabled={submitting}
                >
                  <MaterialCommunityIcons name="arrow-left" size={18} color={theme.colors.text} />
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              
              {currentStep < totalSteps ? (
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleNextStep}
                  disabled={submitting}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                  <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>
                        {mode === 'create' ? 'Create Listing' : 'Update Listing'}
                      </Text>
                      <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    width: '100%',
    maxWidth: 550,
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  stepIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  activeStepIndicator: {
    backgroundColor: theme.colors.primary,
  },
  completedStepIndicator: {
    backgroundColor: theme.colors.success,
  },
  stepIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeStepIndicatorText: {
    color: '#FFFFFF',
  },
  scrollView: {
    maxHeight: 500,
  },
  scrollContent: {
    padding: 20,
  },
  stepContainer: {
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  helpText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginTop: 8,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 8,
  },
  creditText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    marginTop: 4,
  },
  submitErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.08)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  submitErrorText: {
    fontSize: 14,
    color: theme.colors.error,
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(108, 99, 255, 0.5)',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.success,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(46, 125, 50, 0.5)',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
});