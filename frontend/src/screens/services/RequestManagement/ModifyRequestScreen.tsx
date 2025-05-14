import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  StatusBar, 
  SafeAreaView, 
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Animated,
  Platform,
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Keyboard
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '../../../theme';
import { useSelector, useDispatch } from 'react-redux';
import { ServicesNavigationParamList } from '../../../types/navigation';
import { ServiceRequest } from '../../../types/services';
import { servicesService } from '../../../services/servicesService';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';

type ModifyRequestRouteProps = RouteProp<
  ServicesNavigationParamList, 
  'ModifyRequest'
>;

/**
 * Modify Request Screen
 * 
 * Allows users to modify the details of their service requests:
 * - Update the title and notes
 * - Change scheduled date/time
 */
export default function ModifyRequestScreen() {
  const navigation = useNavigation();
  const route = useRoute<ModifyRequestRouteProps>();
  const { requestId } = route.params || {};
  
  // Selected request from Redux store
  const request = useSelector((state: any) => {
    const requests = state.services?.requests || [];
    return requests.find((r: ServiceRequest) => r.id === requestId);
  });
  
  // Form state
  const [title, setTitle] = useState(request?.title || '');
  const [notes, setNotes] = useState(request?.notes || '');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(
    request?.scheduled_date ? new Date(request.scheduled_date) : null
  );
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
    
    // Load request details if not available
    if (!request && requestId) {
      loadRequestDetails();
    }
  }, []);
  
  // Handle back button press
  useEffect(() => {
    const onBackPress = () => {
      handleCancel();
      return true;
    };
    
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, []);
  
  // Load request details
  const loadRequestDetails = async () => {
    setIsLoading(true);
    
    try {
      if (!requestId) return;
      
      const response = await servicesService.fetchRequestById(requestId);
      
      if (response.error) {
        Alert.alert(
          'Error',
          `Failed to load request details: ${response.error}`,
          [{ text: 'OK' }]
        );
      } else if (response.data) {
        // Update form state with loaded data
        setTitle(response.data.title || '');
        setNotes(response.data.notes || '');
        if (response.data.scheduled_date) {
          setScheduledDate(new Date(response.data.scheduled_date));
        }
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'An error occurred while loading request details',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle date selection
  const handleDateConfirm = (date: Date) => {
    setScheduledDate(date);
    setShowDatePicker(false);
    setErrors({ ...errors, scheduledDate: '' });
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;
    
    if (!title.trim()) {
      newErrors.title = 'Please enter a request title';
      isValid = false;
    }
    
    if (scheduledDate && scheduledDate < new Date()) {
      newErrors.scheduledDate = 'Scheduled date cannot be in the past';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle saving the request
  const handleSave = async () => {
    Keyboard.dismiss();
    
    if (!validateForm()) {
      return;
    }
    
    if (!request || !requestId) {
      Alert.alert('Error', 'Request not found');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare update data
      const updateData = {
        title,
        notes,
        scheduled_date: scheduledDate ? scheduledDate.toISOString() : null,
      };
      
      // Call API to update request
      const result = await servicesService.updateRequest(requestId, updateData);
      
      if (result.error) {
        Alert.alert(
          'Error',
          `Failed to update request: ${result.error}`,
          [{ text: 'OK' }]
        );
      } else {
        // Success
        Alert.alert(
          'Request Updated',
          'Your service request has been updated successfully',
          [
            { 
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        `An error occurred: ${error}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle cancellation
  const handleCancel = () => {
    if (
      title !== (request?.title || '') ||
      notes !== (request?.notes || '') ||
      (scheduledDate?.toISOString() !== (request?.scheduled_date || null))
    ) {
      // Show confirmation if form has been changed
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      // No changes, just go back
      navigation.goBack();
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading request details...</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleCancel}
          >
            <BlurView intensity={30} tint="light" style={styles.backButtonBlur}>
              <MaterialCommunityIcons 
                name="close" 
                size={22} 
                color={theme.colors.text} 
              />
            </BlurView>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Edit Request</Text>
          
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <BlurView intensity={30} tint="light" style={styles.saveButtonBlur}>
                <MaterialCommunityIcons 
                  name="check" 
                  size={22} 
                  color={theme.colors.primary} 
                />
              </BlurView>
            )}
          </TouchableOpacity>
        </View>
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            {/* Request Type Badge */}
            <View style={styles.serviceTypeBadge}>
              <LinearGradient
                colors={['rgba(108, 99, 255, 0.2)', 'rgba(108, 99, 255, 0.1)']}
                style={styles.iconBackground}
              >
                <MaterialCommunityIcons 
                  name={request?.service_type?.icon || 'card-account-details-outline'} 
                  size={20} 
                  color={theme.colors.primary} 
                />
              </LinearGradient>
              <Text style={styles.serviceTypeText}>
                {request?.service_type?.name || 'Service'} Request
              </Text>
            </View>
            
            {/* Title Field */}
            <Text style={styles.inputLabel}>Request Title</Text>
            <View style={[styles.inputContainer, errors.title && styles.inputError]}>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (errors.title) {
                    setErrors({ ...errors, title: '' });
                  }
                }}
                placeholder="Enter a title for your request"
                placeholderTextColor={theme.colors.textTertiary}
                maxLength={100}
              />
            </View>
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
            
            {/* Scheduled Date Field */}
            <Text style={styles.inputLabel}>Scheduled Date (Optional)</Text>
            <TouchableOpacity
              style={[
                styles.inputContainer, 
                styles.dateInputContainer,
                errors.scheduledDate && styles.inputError
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialCommunityIcons 
                name="calendar" 
                size={20} 
                color={theme.colors.textSecondary} 
                style={styles.dateIcon}
              />
              <Text style={[
                styles.dateInput,
                !scheduledDate && styles.placeholderText
              ]}>
                {scheduledDate
                  ? format(scheduledDate, 'PPP') + ' at ' + format(scheduledDate, 'p')
                  : 'Select a date and time'}
              </Text>
              {scheduledDate && (
                <TouchableOpacity
                  style={styles.clearDateButton}
                  onPress={() => setScheduledDate(null)}
                >
                  <MaterialCommunityIcons 
                    name="close-circle" 
                    size={18} 
                    color={theme.colors.textTertiary} 
                  />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
            {errors.scheduledDate && (
              <Text style={styles.errorText}>{errors.scheduledDate}</Text>
            )}
            
            {/* Notes Field */}
            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <View style={[styles.inputContainer, styles.notesContainer]}>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional details or special instructions"
                placeholderTextColor={theme.colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </Animated.View>
        </ScrollView>
        
        {/* Date Picker Modal */}
        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="datetime"
          onConfirm={handleDateConfirm}
          onCancel={() => setShowDatePicker(false)}
          minimumDate={new Date()}
          date={scheduledDate || new Date()}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  backButtonBlur: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  saveButtonBlur: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  formContainer: {
    padding: 16,
  },
  serviceTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBackground: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  serviceTypeText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  input: {
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: 12,
    minHeight: 48,
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesInput: {
    minHeight: 120,
    paddingTop: 12,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 8,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: 12,
  },
  placeholderText: {
    color: theme.colors.textTertiary,
  },
  clearDateButton: {
    padding: 8,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },
});