import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../theme';

// Helper functions for date handling
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getMonthName = (month: number) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
};

const getDayName = (date: Date) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

const formatDate = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const formatTime = (hours: number, minutes: number) => {
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, '0')} ${period}`;
};

// Define the time slots
const timeSlots = [
  { id: '1', time: '8:00 AM', hour: 8, minute: 0 },
  { id: '2', time: '9:00 AM', hour: 9, minute: 0 },
  { id: '3', time: '10:00 AM', hour: 10, minute: 0 },
  { id: '4', time: '11:00 AM', hour: 11, minute: 0 },
  { id: '5', time: '12:00 PM', hour: 12, minute: 0 },
  { id: '6', time: '1:00 PM', hour: 13, minute: 0 },
  { id: '7', time: '2:00 PM', hour: 14, minute: 0 },
  { id: '8', time: '3:00 PM', hour: 15, minute: 0 },
  { id: '9', time: '4:00 PM', hour: 16, minute: 0 },
  { id: '10', time: '5:00 PM', hour: 17, minute: 0 },
  { id: '11', time: '6:00 PM', hour: 18, minute: 0 },
];

// Route params interface
interface DateTimeSelectionParams {
  serviceId: string;
  providerId: string;
  onDateTimeSelected: (dateTime: {
    date: string; // ISO date string for the selected date
    time: {
      hour: number;
      minute: number;
      display: string;
    };
  }) => void;
}

type DateTimeSelectionRouteProp = RouteProp<{ DateTimeSelection: DateTimeSelectionParams }, 'DateTimeSelection'>;
type DateTimeSelectionNavigationProp = StackNavigationProp<any, 'DateTimeSelection'>;

interface DateTimeSelectionScreenProps {
  route: DateTimeSelectionRouteProp;
  navigation: DateTimeSelectionNavigationProp;
}

const DateTimeSelectionScreen: React.FC<DateTimeSelectionScreenProps> = ({
  route,
  navigation,
}) => {
  const { serviceId, providerId, onDateTimeSelected } = route.params;
  
  // Current date for reference
  const today = new Date();
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<{
    id: string;
    time: string;
    hour: number;
    minute: number;
  } | null>(null);
  
  // Generate days for the current month
  const generateDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const days = [];
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    // Add previous month's days
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({
        day: null,
        date: null,
      });
    }
    
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      days.push({
        day: i,
        date,
        isToday: today.getDate() === i && today.getMonth() === currentMonth && today.getFullYear() === currentYear,
        isPast: date < new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        dayName: getDayName(date),
      });
    }
    
    return days;
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Handle day selection
  const handleDaySelect = (day: any) => {
    if (day.day && !day.isPast) {
      setSelectedDate(day.date);
    }
  };
  
  // Handle time selection
  const handleTimeSelect = (time: any) => {
    setSelectedTime(time);
  };
  
  // Handle continuing to next step
  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      onDateTimeSelected({
        date: formatDate(selectedDate),
        time: {
          hour: selectedTime.hour,
          minute: selectedTime.minute,
          display: selectedTime.time,
        },
      });
      
      // Navigate to the pet selection screen
      navigation.navigate('PetSelection', {
        serviceId,
        providerId,
        dateTime: {
          date: formatDate(selectedDate),
          time: {
            hour: selectedTime.hour,
            minute: selectedTime.minute,
            display: selectedTime.time,
          },
        },
      });
    }
  };
  
  // Days of the week
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  // Generate days for rendering
  const days = generateDays();
  
  // Check if button should be enabled
  const isContinueEnabled = !!selectedDate && !!selectedTime;
  
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
          <Text style={styles.headerTitle}>Select Date & Time</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Calendar Section */}
          <View style={styles.calendarContainer}>
            {/* Month Navigation */}
            <View style={styles.monthNavigation}>
              <TouchableOpacity
                style={styles.monthNavButton}
                onPress={goToPreviousMonth}
                disabled={currentMonth === today.getMonth() && currentYear === today.getFullYear()}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={24}
                  color={currentMonth === today.getMonth() && currentYear === today.getFullYear()
                    ? theme.colors.textTertiary
                    : theme.colors.text}
                />
              </TouchableOpacity>
              
              <Text style={styles.monthYearText}>
                {getMonthName(currentMonth)} {currentYear}
              </Text>
              
              <TouchableOpacity
                style={styles.monthNavButton}
                onPress={goToNextMonth}
              >
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            {/* Weekday Headers */}
            <View style={styles.weekdaysContainer}>
              {weekdays.map((day, index) => (
                <Text key={index} style={styles.weekdayText}>{day}</Text>
              ))}
            </View>
            
            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {days.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayContainer,
                    !day.day && styles.emptyDay,
                    day.isToday && styles.todayContainer,
                    day.isPast && styles.pastDayContainer,
                    selectedDate && day.date && selectedDate.getTime() === day.date.getTime() && styles.selectedDayContainer,
                  ]}
                  onPress={() => day.day && handleDaySelect(day)}
                  disabled={!day.day || day.isPast}
                >
                  {day.day ? (
                    <>
                      <Text
                        style={[
                          styles.dayText,
                          day.isToday && styles.todayText,
                          day.isPast && styles.pastDayText,
                          selectedDate && day.date && selectedDate.getTime() === day.date.getTime() && styles.selectedDayText,
                        ]}
                      >
                        {day.day}
                      </Text>
                      <Text
                        style={[
                          styles.dayNameText,
                          day.isToday && styles.todayText,
                          day.isPast && styles.pastDayText,
                          selectedDate && day.date && selectedDate.getTime() === day.date.getTime() && styles.selectedDayText,
                        ]}
                      >
                        {day.dayName}
                      </Text>
                    </>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Time Slots Section */}
          {selectedDate && (
            <View style={styles.timeSection}>
              <Text style={styles.sectionTitle}>Select Time</Text>
              
              <View style={styles.timeSlotsContainer}>
                {timeSlots.map((time) => (
                  <TouchableOpacity
                    key={time.id}
                    style={[
                      styles.timeSlot,
                      selectedTime?.id === time.id && styles.selectedTimeSlot,
                    ]}
                    onPress={() => handleTimeSelect(time)}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        selectedTime?.id === time.id && styles.selectedTimeSlotText,
                      ]}
                    >
                      {time.time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {/* Selected Date and Time Display */}
          {selectedDate && selectedTime && (
            <View style={styles.selectionSummary}>
              <View style={styles.selectionIcon}>
                <MaterialCommunityIcons name="calendar-check" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.selectionDetails}>
                <Text style={styles.selectionLabel}>Your selection</Text>
                <Text style={styles.selectionValue}>
                  {`${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at ${selectedTime.time}`}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
        
        {/* Footer with Continue Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !isContinueEnabled && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!isContinueEnabled}
          >
            <LinearGradient
              colors={
                isContinueEnabled
                  ? [theme.colors.primary, theme.colors.primaryDark]
                  : ['#CCCCCC', '#AAAAAA']
              }
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
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
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    ...theme.elevation.small,
    marginBottom: 24,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNavButton: {
    padding: 8,
  },
  monthYearText: {
    ...theme.typography.h3,
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    width: 32,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dayContainer: {
    width: 40,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    borderRadius: 8,
  },
  emptyDay: {
    backgroundColor: 'transparent',
  },
  todayContainer: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  pastDayContainer: {
    opacity: 0.4,
  },
  selectedDayContainer: {
    backgroundColor: theme.colors.primary,
  },
  dayText: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayNameText: {
    ...theme.typography.caption,
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  todayText: {
    color: theme.colors.primary,
  },
  pastDayText: {
    color: theme.colors.textTertiary,
  },
  selectedDayText: {
    color: 'white',
  },
  timeSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    ...theme.elevation.small,
    marginBottom: 24,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: 16,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  timeSlot: {
    width: '30%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    marginRight: '5%',
    marginBottom: 12,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  timeSlotText: {
    ...theme.typography.body,
    fontSize: 14,
  },
  selectedTimeSlotText: {
    color: 'white',
  },
  selectionSummary: {
    flexDirection: 'row',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
  selectionIcon: {
    marginRight: 16,
  },
  selectionDetails: {
    flex: 1,
  },
  selectionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  selectionValue: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  continueButtonText: {
    ...theme.typography.button,
    color: 'white',
    marginRight: 8,
  },
});

export default DateTimeSelectionScreen;