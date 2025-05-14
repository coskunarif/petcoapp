import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

interface ServiceStatus {
  type: 'accepted' | 'declined' | 'completed' | 'cancelled' | 'scheduled' | 'payment';
  serviceId: string;
  serviceName: string;
  timestamp: string;
  amount?: number;
  actionUser?: string;
}

interface ServiceStatusUpdateProps {
  status: ServiceStatus;
  onViewDetails?: (serviceId: string) => void;
}

const ServiceStatusUpdate: React.FC<ServiceStatusUpdateProps> = ({
  status,
  onViewDetails
}) => {
  // Get icon, color, and message based on status type
  const getStatusDetails = () => {
    switch (status.type) {
      case 'accepted':
        return {
          icon: 'check-circle-outline',
          color: '#4CAF50',
          gradient: ['#4CAF5033', '#4CAF5010'],
          title: 'Service Accepted',
          message: `${status.actionUser || 'Provider'} has accepted the service request`
        };
      case 'declined':
        return {
          icon: 'close-circle-outline',
          color: '#F44336',
          gradient: ['#F4433633', '#F4433610'],
          title: 'Service Declined',
          message: `${status.actionUser || 'Provider'} has declined the service request`
        };
      case 'completed':
        return {
          icon: 'check-all',
          color: '#2196F3',
          gradient: ['#2196F333', '#2196F310'],
          title: 'Service Completed',
          message: `${status.serviceName} has been marked as completed`
        };
      case 'cancelled':
        return {
          icon: 'cancel',
          color: '#F44336',
          gradient: ['#F4433633', '#F4433610'],
          title: 'Service Cancelled',
          message: `${status.serviceName} has been cancelled`
        };
      case 'scheduled':
        return {
          icon: 'calendar-check',
          color: '#FF9800',
          gradient: ['#FF980033', '#FF980010'],
          title: 'Service Scheduled',
          message: `${status.serviceName} has been scheduled`
        };
      case 'payment':
        return {
          icon: 'cash-check',
          color: '#4CAF50',
          gradient: ['#4CAF5033', '#4CAF5010'],
          title: 'Payment Completed',
          message: `Payment for ${status.serviceName} has been completed`
        };
      default:
        return {
          icon: 'information-outline',
          color: theme.colors.primary,
          gradient: [theme.colors.primary + '33', theme.colors.primary + '10'],
          title: 'Service Update',
          message: `Update for ${status.serviceName}`
        };
    }
  };
  
  const { icon, color, gradient, title, message } = getStatusDetails();
  
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(status.serviceId);
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };
  
  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <LinearGradient
          colors={gradient}
          style={styles.background}
        />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[color + '40', color + '15']}
                style={styles.iconCircle}
              >
                <MaterialCommunityIcons
                  name={icon}
                  size={16}
                  color={color}
                />
              </LinearGradient>
            </View>
            
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color }]}>{title}</Text>
              <Text style={styles.timestamp}>{formatTime(status.timestamp)}</Text>
            </View>
          </View>
          
          <Text style={styles.message}>{message}</Text>
          
          {status.amount !== undefined && (
            <View style={styles.amountContainer}>
              <MaterialCommunityIcons
                name="cash"
                size={14}
                color={theme.colors.textSecondary}
                style={styles.smallIcon}
              />
              <Text style={styles.amount}>
                ${status.amount.toFixed(2)}
              </Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={[styles.button, { borderColor: color }]}
            onPress={handleViewDetails}
          >
            <Text style={[styles.buttonText, { color }]}>View Details</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    width: '90%',
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  message: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  smallIcon: {
    marginRight: 4,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ServiceStatusUpdate;