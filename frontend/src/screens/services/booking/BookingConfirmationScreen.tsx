import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../theme';

// Mock service and provider data
const mockServiceDetails = {
  id: 'service1',
  title: 'Professional Dog Walking',
  description: 'Regular walks for your dog, providing exercise and companionship while you're busy.',
  service_type: {
    id: 'type1',
    name: 'Dog Walking',
    icon: 'dog',
    credit_value: 30,
  },
  provider: {
    id: 'provider1',
    full_name: 'Sarah Johnson',
    profile_image_url: null,
    rating: 4.8,
  },
};

// Mock user balance
const userBalance = 150;

// Route params interface
interface BookingConfirmationParams {
  serviceId: string;
  providerId: string;
  dateTime: {
    date: string;
    time: {
      hour: number;
      minute: number;
      display: string;
    };
  };
  pet: {
    id: string;
    name: string;
    species: string;
    breed?: string;
    photoUri?: string;
    icon?: string;
    color?: string;
  };
  notes?: string;
}

type BookingConfirmationRouteProp = RouteProp<{ BookingConfirmation: BookingConfirmationParams }, 'BookingConfirmation'>;
type BookingConfirmationNavigationProp = StackNavigationProp<any, 'BookingConfirmation'>;

interface BookingConfirmationScreenProps {
  route: BookingConfirmationRouteProp;
  navigation: BookingConfirmationNavigationProp;
}

const BookingConfirmationScreen: React.FC<BookingConfirmationScreenProps> = ({
  route,
  navigation,
}) => {
  const { serviceId, providerId, dateTime, pet, notes } = route.params;
  
  // State
  const [serviceDetails, setServiceDetails] = useState(mockServiceDetails);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'credits' | 'card'>('credits');
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculate the date object from dateTime prop
  const [dateObj] = useState(() => {
    const [year, month, day] = dateTime.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(dateTime.time.hour);
    date.setMinutes(dateTime.time.minute);
    return date;
  });
  
  // Format the date for display
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  
  // Format the time for display
  const formattedTime = dateTime.time.display;
  
  // Check if user has enough credits
  const hasEnoughCredits = userBalance >= serviceDetails.service_type.credit_value;
  
  // Handle payment method selection
  const handleSelectPaymentMethod = (method: 'credits' | 'card') => {
    setSelectedPaymentMethod(method);
  };
  
  // Handle booking confirmation
  const handleConfirmBooking = () => {
    if (!hasEnoughCredits && selectedPaymentMethod === 'credits') {
      Alert.alert(
        'Insufficient Credits',
        'You don\'t have enough credits for this service. Please add more credits or choose another payment method.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Show loading state
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // In a real app, this would be an API call to create the booking
      
      // Navigate to success screen
      navigation.navigate('BookingSuccess', {
        bookingId: 'BOOK' + Math.floor(Math.random() * 10000),
        serviceId,
        providerId,
        dateTime,
        pet,
        paymentMethod: selectedPaymentMethod,
      });
      
      setIsLoading(false);
    }, 1500);
  };
  
  // Handle editing a section
  const handleEditSection = (section: 'dateTime' | 'pet') => {
    switch (section) {
      case 'dateTime':
        navigation.navigate('DateTimeSelection', {
          serviceId,
          providerId,
          onDateTimeSelected: () => {},
        });
        break;
      case 'pet':
        navigation.navigate('PetSelection', {
          serviceId,
          providerId,
          dateTime,
        });
        break;
    }
  };
  
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Confirmation</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Timeline */}
          <View style={styles.timelineCard}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIcon, styles.timelineIconCompleted]}>
                <MaterialCommunityIcons name="calendar-check" size={20} color="white" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Date & Time</Text>
                <Text style={styles.timelineDetail}>{formattedDate} at {formattedTime}</Text>
              </View>
              <TouchableOpacity
                style={styles.timelineEditButton}
                onPress={() => handleEditSection('dateTime')}
              >
                <MaterialCommunityIcons name="pencil" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.timelineSeparator} />
            
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIcon, styles.timelineIconCompleted]}>
                <MaterialCommunityIcons name="paw" size={20} color="white" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Pet</Text>
                <Text style={styles.timelineDetail}>{pet.name} ({pet.breed || pet.species})</Text>
              </View>
              <TouchableOpacity
                style={styles.timelineEditButton}
                onPress={() => handleEditSection('pet')}
              >
                <MaterialCommunityIcons name="pencil" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.timelineSeparator} />
            
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIcon, styles.timelineIconActive]}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={20} color="white" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Confirmation</Text>
                <Text style={styles.timelineDetail}>Review and confirm booking</Text>
              </View>
            </View>
          </View>
          
          {/* Service Details */}
          <View style={styles.detailCard}>
            <Text style={styles.detailCardTitle}>Service Details</Text>
            
            <View style={styles.serviceInfo}>
              <View style={styles.serviceTypeIcon}>
                <MaterialCommunityIcons
                  name={serviceDetails.service_type.icon as any}
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              
              <View style={styles.serviceDetails}>
                <Text style={styles.serviceTitle}>{serviceDetails.title}</Text>
                <Text style={styles.serviceType}>{serviceDetails.service_type.name}</Text>
              </View>
            </View>
            
            <View style={styles.serviceProviderContainer}>
              <View style={styles.serviceProviderHeader}>
                <Text style={styles.serviceProviderTitle}>Service Provider</Text>
              </View>
              
              <View style={styles.serviceProviderContent}>
                <View style={styles.providerAvatar}>
                  <Text style={styles.providerInitial}>
                    {serviceDetails.provider.full_name.charAt(0)}
                  </Text>
                </View>
                
                <View style={styles.providerDetails}>
                  <Text style={styles.providerName}>{serviceDetails.provider.full_name}</Text>
                  <View style={styles.providerRating}>
                    <MaterialCommunityIcons name="star" size={16} color="#FFB400" />
                    <Text style={styles.providerRatingText}>
                      {serviceDetails.provider.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            {notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesTitle}>Special Instructions</Text>
                <Text style={styles.notesContent}>{notes}</Text>
              </View>
            )}
          </View>
          
          {/* Payment Selection */}
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPaymentMethod === 'credits' && styles.paymentOptionSelected,
                !hasEnoughCredits && selectedPaymentMethod === 'credits' && styles.paymentOptionError,
              ]}
              onPress={() => handleSelectPaymentMethod('credits')}
            >
              <View style={styles.paymentOptionIcon}>
                <MaterialCommunityIcons
                  name="wallet-outline"
                  size={24}
                  color={selectedPaymentMethod === 'credits'
                    ? theme.colors.primary
                    : theme.colors.textSecondary}
                />
              </View>
              
              <View style={styles.paymentOptionContent}>
                <Text
                  style={[
                    styles.paymentOptionTitle,
                    selectedPaymentMethod === 'credits' && styles.paymentOptionTitleSelected,
                  ]}
                >
                  Pay with Credits
                </Text>
                
                <View style={styles.paymentBalance}>
                  <Text
                    style={[
                      styles.paymentBalanceText,
                      !hasEnoughCredits && styles.paymentBalanceError,
                    ]}
                  >
                    Your balance: {userBalance} credits
                  </Text>
                  
                  {!hasEnoughCredits && (
                    <Text style={styles.insufficientText}>
                      (Insufficient balance)
                    </Text>
                  )}
                </View>
              </View>
              
              <View style={styles.paymentOptionCheck}>
                {selectedPaymentMethod === 'credits' && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color={theme.colors.primary}
                  />
                )}
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPaymentMethod === 'card' && styles.paymentOptionSelected,
              ]}
              onPress={() => handleSelectPaymentMethod('card')}
            >
              <View style={styles.paymentOptionIcon}>
                <MaterialCommunityIcons
                  name="credit-card-outline"
                  size={24}
                  color={selectedPaymentMethod === 'card'
                    ? theme.colors.primary
                    : theme.colors.textSecondary}
                />
              </View>
              
              <View style={styles.paymentOptionContent}>
                <Text
                  style={[
                    styles.paymentOptionTitle,
                    selectedPaymentMethod === 'card' && styles.paymentOptionTitleSelected,
                  ]}
                >
                  Credit/Debit Card
                </Text>
                
                <Text style={styles.paymentOptionSubtitle}>
                  Add a payment method
                </Text>
              </View>
              
              <View style={styles.paymentOptionCheck}>
                {selectedPaymentMethod === 'card' && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color={theme.colors.primary}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Total Section */}
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Service Fee</Text>
              <Text style={styles.totalValue}>
                {serviceDetails.service_type.credit_value} credits
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelBold}>Total</Text>
              <Text style={styles.totalValueBold}>
                {serviceDetails.service_type.credit_value} credits
              </Text>
            </View>
          </View>
        </ScrollView>
        
        {/* Footer with Confirm Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              isLoading && styles.confirmButtonDisabled,
              !hasEnoughCredits && selectedPaymentMethod === 'credits' && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirmBooking}
            disabled={isLoading || (!hasEnoughCredits && selectedPaymentMethod === 'credits')}
          >
            <LinearGradient
              colors={
                isLoading || (!hasEnoughCredits && selectedPaymentMethod === 'credits')
                  ? ['#CCCCCC', '#AAAAAA']
                  : [theme.colors.primary, theme.colors.primaryDark]
              }
              style={styles.confirmButtonGradient}
            >
              {isLoading ? (
                <Text style={styles.confirmButtonText}>Processing...</Text>
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Booking</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...theme.typography.h2,
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  timelineCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    ...theme.elevation.small,
    marginBottom: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  timelineIconCompleted: {
    backgroundColor: theme.colors.success,
  },
  timelineIconActive: {
    backgroundColor: theme.colors.primary,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  timelineDetail: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  timelineEditButton: {
    padding: 8,
  },
  timelineSeparator: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginLeft: 18,
    marginVertical: 4,
  },
  detailCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    ...theme.elevation.small,
    marginBottom: 24,
  },
  detailCardTitle: {
    ...theme.typography.h3,
    marginBottom: 16,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  serviceTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceType: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  serviceProviderContainer: {
    marginBottom: 16,
  },
  serviceProviderHeader: {
    marginBottom: 8,
  },
  serviceProviderTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  serviceProviderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  providerInitial: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  providerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerRatingText: {
    ...theme.typography.caption,
    marginLeft: 4,
  },
  notesContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  notesTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesContent: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  paymentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...theme.elevation.small,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  paymentOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(108, 99, 255, 0.05)',
  },
  paymentOptionError: {
    borderColor: theme.colors.error,
  },
  paymentOptionIcon: {
    marginRight: 16,
  },
  paymentOptionContent: {
    flex: 1,
  },
  paymentOptionTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  paymentOptionTitleSelected: {
    color: theme.colors.primary,
  },
  paymentOptionSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  paymentBalance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentBalanceText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  paymentBalanceError: {
    color: theme.colors.error,
  },
  insufficientText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginLeft: 4,
    fontWeight: '600',
  },
  paymentOptionCheck: {
    width: 24,
    alignItems: 'flex-end',
  },
  totalSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    ...theme.elevation.small,
    marginBottom: 24,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  totalValue: {
    ...theme.typography.body,
  },
  totalLabelBold: {
    ...theme.typography.body,
    fontWeight: '700',
  },
  totalValueBold: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  confirmButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  confirmButtonText: {
    ...theme.typography.button,
    color: 'white',
  },
});

export default BookingConfirmationScreen;