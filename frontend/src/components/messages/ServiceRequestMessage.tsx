import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Message } from './types';

interface ServiceRequestMessageProps {
  message: Message;
  isMyMessage: boolean;
}

const ServiceRequestMessage: React.FC<ServiceRequestMessageProps> = ({ message, isMyMessage }) => {
  // Get service details from the message
  const serviceInfo = message.serviceInfo || {};
  const serviceName = serviceInfo.service_type?.name || 'Service';
  const serviceStatus = serviceInfo.status || 'pending';
  const serviceIcon = getServiceIcon(serviceInfo.service_type?.icon);
  const serviceColor = getServiceColor(serviceStatus);
  
  return (
    <View
      style={[
        styles.container,
        isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
      ]}
    >
      <BlurView intensity={70} tint="light" style={styles.blurContainer}>
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[`${serviceColor}40`, `${serviceColor}15`]}
            style={styles.iconContainer}
          >
            <MaterialCommunityIcons
              name={serviceIcon}
              size={18}
              color={serviceColor}
            />
          </LinearGradient>
          
          <Text style={styles.titleText}>
            {isMyMessage ? 'You' : 'They'} {serviceInfo.is_request ? 'requested' : 'offered'}:
          </Text>
          
          <View style={[styles.statusBadge, { backgroundColor: `${serviceColor}25` }]}>
            <Text style={[styles.statusText, { color: serviceColor }]}>
              {formatStatus(serviceStatus)}
            </Text>
          </View>
        </View>
        
        <View style={styles.serviceInfoContainer}>
          <Text style={styles.serviceName}>{serviceName}</Text>
          
          {message.content && (
            <Text style={styles.serviceDescription}>{message.content}</Text>
          )}
          
          {serviceInfo.scheduled_date && (
            <View style={styles.scheduledDateContainer}>
              <MaterialCommunityIcons
                name="calendar"
                size={14}
                color={theme.colors.textSecondary}
                style={styles.calendarIcon}
              />
              <Text style={styles.scheduledDateText}>
                {formatDate(serviceInfo.scheduled_date)}
              </Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>View Details</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={16}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </BlurView>
      
      <Text 
        style={[
          styles.timestamp,
          isMyMessage ? styles.myTimestamp : styles.theirTimestamp
        ]}
      >
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
};

// Helper functions
const getServiceIcon = (icon?: string): string => {
  // Map service type to icon
  const iconMap: Record<string, string> = {
    'pet_sitting': 'dog-side',
    'grooming': 'scissors-cutting',
    'walking': 'walk',
    'training': 'school-outline',
    'veterinary': 'medical-bag'
  };
  
  return iconMap[icon || ''] || 'handshake';
};

const getServiceColor = (status: string): string => {
  // Map status to color
  const colorMap: Record<string, string> = {
    'pending': theme.colors.primary,
    'accepted': '#4CAF50',  // Green
    'completed': '#2196F3', // Blue
    'cancelled': '#F44336', // Red
    'rejected': '#F44336'   // Red
  };
  
  return colorMap[status] || theme.colors.primary;
};

const formatStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatDate = (dateString: string): string => {
  // Format date string for better display
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    maxWidth: '90%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  titleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serviceInfoContainer: {
    padding: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  scheduledDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  calendarIcon: {
    marginRight: 4,
  },
  scheduledDateText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 4,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    marginHorizontal: 2,
  },
  myTimestamp: {
    color: theme.colors.textTertiary,
    alignSelf: 'flex-end',
  },
  theirTimestamp: {
    color: theme.colors.textTertiary,
    alignSelf: 'flex-start',
  },
});

export default ServiceRequestMessage;