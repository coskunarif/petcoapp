import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../theme';
import LottieView from 'lottie-react-native';

// Route params interface
interface BookingSuccessParams {
  bookingId: string;
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
  paymentMethod: 'credits' | 'card';
}

type BookingSuccessRouteProp = RouteProp<{ BookingSuccess: BookingSuccessParams }, 'BookingSuccess'>;
type BookingSuccessNavigationProp = StackNavigationProp<any, 'BookingSuccess'>;

interface BookingSuccessScreenProps {
  route: BookingSuccessRouteProp;
  navigation: BookingSuccessNavigationProp;
}

const BookingSuccessScreen: React.FC<BookingSuccessScreenProps> = ({
  route,
  navigation,
}) => {
  const { bookingId, dateTime, pet, paymentMethod } = route.params;
  
  // Calculate the date object from dateTime prop
  const dateObj = new Date();
  try {
    const [year, month, day] = dateTime.date.split('-').map(Number);
    dateObj.setFullYear(year);
    dateObj.setMonth(month - 1);
    dateObj.setDate(day);
    dateObj.setHours(dateTime.time.hour);
    dateObj.setMinutes(dateTime.time.minute);
  } catch (error) {
    console.error('Error parsing date:', error);
  }
  
  // Format the date for display
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  
  // Format the time for display
  const formattedTime = dateTime.time.display;
  
  // Add to calendar
  const handleAddToCalendar = () => {
    // In a real app, this would integrate with the device calendar
    navigation.reset({
      index: 0,
      routes: [{ name: 'Tabs' }],
    });
  };
  
  // View booking
  const handleViewBooking = () => {
    // In a real app, this would navigate to the booking details
    navigation.reset({
      index: 0,
      routes: [{ name: 'Tabs', params: { screen: 'Profile', params: { screen: 'Bookings' } } }],
    });
  };
  
  // Return to home screen
  const handleReturnHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Tabs' }],
    });
  };
  
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Animation */}
          <View style={styles.animationContainer}>
            {/* In a real app, you would use Lottie for the animation */}
            <View style={styles.successCircle}>
              <MaterialCommunityIcons name="check" size={64} color="white" />
            </View>
          </View>
          
          {/* Success Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.successTitle}>Booking Confirmed!</Text>
            <Text style={styles.successMessage}>
              Your pet service has been successfully booked. You'll receive a confirmation via email shortly.
            </Text>
          </View>
          
          {/* Booking Details Card */}
          <View style={styles.bookingCard}>
            <Text style={styles.bookingCardTitle}>Booking Details</Text>
            
            <View style={styles.bookingDetail}>
              <Text style={styles.bookingDetailLabel}>Booking ID</Text>
              <Text style={styles.bookingDetailValue}>{bookingId}</Text>
            </View>
            
            <View style={styles.bookingDetail}>
              <Text style={styles.bookingDetailLabel}>Date & Time</Text>
              <Text style={styles.bookingDetailValue}>{formattedDate} at {formattedTime}</Text>
            </View>
            
            <View style={styles.bookingDetail}>
              <Text style={styles.bookingDetailLabel}>Pet</Text>
              <Text style={styles.bookingDetailValue}>{pet.name}</Text>
            </View>
            
            <View style={styles.bookingDetail}>
              <Text style={styles.bookingDetailLabel}>Payment Method</Text>
              <Text style={styles.bookingDetailValue}>
                {paymentMethod === 'credits' ? 'Pet Credits' : 'Credit/Debit Card'}
              </Text>
            </View>
          </View>
          
          {/* Additional Options */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleAddToCalendar}
            >
              <MaterialCommunityIcons name="calendar-plus" size={24} color={theme.colors.primary} />
              <Text style={styles.optionButtonText}>Add to Calendar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleViewBooking}
            >
              <MaterialCommunityIcons name="book-open-variant" size={24} color={theme.colors.primary} />
              <Text style={styles.optionButtonText}>View Booking</Text>
            </TouchableOpacity>
          </View>
          
          {/* What's Next Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>What's Next?</Text>
            
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="message-text-outline" size={24} color={theme.colors.primary} />
              <View style={styles.infoItemContent}>
                <Text style={styles.infoItemTitle}>Provider Contact</Text>
                <Text style={styles.infoItemText}>
                  Your service provider will contact you to confirm details before the appointment.
                </Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="map-marker-outline" size={24} color={theme.colors.primary} />
              <View style={styles.infoItemContent}>
                <Text style={styles.infoItemTitle}>Service Location</Text>
                <Text style={styles.infoItemText}>
                  The service will take place at your registered address unless you specify otherwise.
                </Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="calendar-clock" size={24} color={theme.colors.primary} />
              <View style={styles.infoItemContent}>
                <Text style={styles.infoItemTitle}>Reminders</Text>
                <Text style={styles.infoItemText}>
                  You'll receive reminders 24 hours and 1 hour before your scheduled service.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
        
        {/* Return Home Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={handleReturnHome}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.homeButtonGradient}
            >
              <Text style={styles.homeButtonText}>Return to Home</Text>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 32,
    paddingBottom: 100,
    alignItems: 'center',
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    ...theme.typography.h1,
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    ...theme.elevation.small,
    marginBottom: 24,
  },
  bookingCardTitle: {
    ...theme.typography.h3,
    marginBottom: 16,
  },
  bookingDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  bookingDetailLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  bookingDetailValue: {
    ...theme.typography.body,
    fontWeight: '600',
  },
  optionsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    justifyContent: 'center',
    ...theme.elevation.small,
  },
  optionButtonText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    ...theme.elevation.small,
  },
  infoCardTitle: {
    ...theme.typography.h3,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoItemContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoItemTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoItemText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  homeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  homeButtonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  homeButtonText: {
    ...theme.typography.button,
    color: 'white',
  },
});

export default BookingSuccessScreen;