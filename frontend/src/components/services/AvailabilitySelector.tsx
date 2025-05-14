import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';

// Interfaces
interface AvailabilitySchedule {
  days: string[];
  hours: string;
  notes: string;
  scheduled_date?: string;
}

interface AvailabilitySelectorProps {
  initialValue?: AvailabilitySchedule;
  onValueChange: (availability: AvailabilitySchedule) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * A component for selecting service availability schedule
 * with day selection, time range, and notes
 */
export default function AvailabilitySelector({
  initialValue,
  onValueChange,
  error,
  disabled = false
}: AvailabilitySelectorProps) {
  // Initialize state with provided values or defaults
  const [selectedDays, setSelectedDays] = useState<string[]>(
    initialValue?.days || []
  );
  const [hoursRange, setHoursRange] = useState<string>(
    initialValue?.hours || '9:00 AM - 5:00 PM'
  );
  const [notes, setNotes] = useState<string>(
    initialValue?.notes || ''
  );

  // States for time picker
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [startTime, setStartTime] = useState<Date>(() => {
    // Parse the start time from hoursRange or use default
    const defaultStart = new Date();
    defaultStart.setHours(9, 0, 0);
    
    if (hoursRange) {
      const startPart = hoursRange.split(' - ')[0];
      if (startPart) {
        try {
          // Try to parse times like "9:00 AM"
          const [hourMinute, period] = startPart.split(' ');
          if (hourMinute && period) {
            const [hourStr, minuteStr] = hourMinute.split(':');
            let hour = parseInt(hourStr, 10);
            const minute = parseInt(minuteStr, 10);
            
            if (period === 'PM' && hour < 12) {
              hour += 12;
            } else if (period === 'AM' && hour === 12) {
              hour = 0;
            }
            
            const date = new Date();
            date.setHours(hour, minute, 0);
            return date;
          }
        } catch (e) {
          console.error('Error parsing start time:', e);
        }
      }
    }
    
    return defaultStart;
  });
  
  const [endTime, setEndTime] = useState<Date>(() => {
    // Parse the end time from hoursRange or use default
    const defaultEnd = new Date();
    defaultEnd.setHours(17, 0, 0);
    
    if (hoursRange) {
      const parts = hoursRange.split(' - ');
      if (parts.length > 1) {
        const endPart = parts[1];
        try {
          // Try to parse times like "5:00 PM"
          const [hourMinute, period] = endPart.split(' ');
          if (hourMinute && period) {
            const [hourStr, minuteStr] = hourMinute.split(':');
            let hour = parseInt(hourStr, 10);
            const minute = parseInt(minuteStr, 10);
            
            if (period === 'PM' && hour < 12) {
              hour += 12;
            } else if (period === 'AM' && hour === 12) {
              hour = 0;
            }
            
            const date = new Date();
            date.setHours(hour, minute, 0);
            return date;
          }
        } catch (e) {
          console.error('Error parsing end time:', e);
        }
      }
    }
    
    return defaultEnd;
  });

  // All days of the week
  const daysOfWeek = [
    { id: 'Monday', name: 'Mon' },
    { id: 'Tuesday', name: 'Tue' },
    { id: 'Wednesday', name: 'Wed' },
    { id: 'Thursday', name: 'Thu' },
    { id: 'Friday', name: 'Fri' },
    { id: 'Saturday', name: 'Sat' },
    { id: 'Sunday', name: 'Sun' }
  ];

  // Toggle day selection
  const toggleDay = (day: string) => {
    if (disabled) return;
    
    let newSelectedDays;
    if (selectedDays.includes(day)) {
      newSelectedDays = selectedDays.filter(d => d !== day);
    } else {
      newSelectedDays = [...selectedDays, day];
    }
    
    setSelectedDays(newSelectedDays);
    updateAvailability(newSelectedDays, hoursRange, notes);
  };

  // Format time
  const formatTime = (date: Date): string => {
    return format(date, 'h:mm a');
  };

  // Update hours range when times change
  const updateHoursRange = (start: Date, end: Date) => {
    const formattedRange = `${formatTime(start)} - ${formatTime(end)}`;
    setHoursRange(formattedRange);
    updateAvailability(selectedDays, formattedRange, notes);
  };

  // Update availability when any field changes
  const updateAvailability = (
    days: string[],
    hours: string,
    availabilityNotes: string
  ) => {
    onValueChange({
      days,
      hours,
      notes: availabilityNotes,
      scheduled_date: initialValue?.scheduled_date
    });
  };

  // Handle start time selection
  const handleStartTimeConfirm = (date: Date) => {
    setShowStartTimePicker(false);
    setStartTime(date);
    updateHoursRange(date, endTime);
  };

  // Handle end time selection
  const handleEndTimeConfirm = (date: Date) => {
    setShowEndTimePicker(false);
    setEndTime(date);
    updateHoursRange(startTime, date);
  };

  // Handle notes change
  const handleNotesChange = (text: string) => {
    setNotes(text);
    updateAvailability(selectedDays, hoursRange, text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Availability</Text>
      
      {/* Days Selection */}
      <View style={styles.section}>
        <Text style={styles.subLabel}>Available Days</Text>
        <View style={styles.daysContainer}>
          {daysOfWeek.map((day) => (
            <TouchableOpacity
              key={day.id}
              style={[
                styles.dayButton,
                selectedDays.includes(day.id) && styles.selectedDayButton,
                disabled && styles.disabledButton
              ]}
              onPress={() => toggleDay(day.id)}
              disabled={disabled}
            >
              <Text 
                style={[
                  styles.dayText,
                  selectedDays.includes(day.id) && styles.selectedDayText,
                  disabled && styles.disabledText
                ]}
              >
                {day.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Hours Range */}
      <View style={styles.section}>
        <Text style={styles.subLabel}>Time Range</Text>
        <View style={styles.hoursContainer}>
          <TouchableOpacity
            style={[styles.timeButton, disabled && styles.disabledButton]}
            onPress={() => !disabled && setShowStartTimePicker(true)}
            disabled={disabled}
          >
            <MaterialCommunityIcons name="clock-outline" size={18} color={disabled ? theme.colors.textTertiary : theme.colors.textSecondary} />
            <Text style={[styles.timeText, disabled && styles.disabledText]}>
              {formatTime(startTime)}
            </Text>
          </TouchableOpacity>
          
          <Text style={[styles.toText, disabled && styles.disabledText]}>to</Text>
          
          <TouchableOpacity
            style={[styles.timeButton, disabled && styles.disabledButton]}
            onPress={() => !disabled && setShowEndTimePicker(true)}
            disabled={disabled}
          >
            <MaterialCommunityIcons name="clock-outline" size={18} color={disabled ? theme.colors.textTertiary : theme.colors.textSecondary} />
            <Text style={[styles.timeText, disabled && styles.disabledText]}>
              {formatTime(endTime)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.subLabel}>Additional Notes</Text>
        <TextInput
          style={[styles.notesInput, disabled && styles.disabledInput]}
          placeholder="Additional details about your availability..."
          value={notes}
          onChangeText={handleNotesChange}
          multiline
          numberOfLines={3}
          placeholderTextColor={theme.colors.textTertiary}
          editable={!disabled}
        />
      </View>
      
      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={16} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {/* Time Pickers */}
      <DateTimePickerModal
        isVisible={showStartTimePicker}
        mode="time"
        onConfirm={handleStartTimeConfirm}
        onCancel={() => setShowStartTimePicker(false)}
        date={startTime}
      />
      
      <DateTimePickerModal
        isVisible={showEndTimePicker}
        mode="time"
        onConfirm={handleEndTimeConfirm}
        onCancel={() => setShowEndTimePicker(false)}
        date={endTime}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  section: {
    marginBottom: 16,
  },
  subLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    margin: 4,
  },
  selectedDayButton: {
    backgroundColor: theme.colors.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 8,
    flex: 2,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginLeft: 8,
  },
  toText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginHorizontal: 10,
  },
  notesInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: theme.colors.text,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.08)',
    borderRadius: 5,
    padding: 10,
    marginTop: 4,
  },
  errorText: {
    color: theme.colors.error,
    marginLeft: 8,
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  disabledText: {
    color: theme.colors.textTertiary,
  },
  disabledInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    color: theme.colors.textTertiary,
  }
});