import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface NotificationProps {
  type: 'service_reminder' | 'new_service' | 'payment' | 'review' | 'system';
  title: string;
  message: string;
  timestamp: string;
  onPress?: () => void;
  onDismiss?: () => void;
}

const NotificationMessage: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  timestamp,
  onPress,
  onDismiss,
}) => {
  // Get icon and color based on notification type
  const getNotificationDetails = () => {
    switch (type) {
      case 'service_reminder':
        return {
          icon: 'calendar-clock',
          color: '#FF9800',
        };
      case 'new_service':
        return {
          icon: 'clipboard-text-outline',
          color: theme.colors.primary,
        };
      case 'payment':
        return {
          icon: 'cash-multiple',
          color: '#4CAF50',
        };
      case 'review':
        return {
          icon: 'star-outline',
          color: '#FFC107',
        };
      case 'system':
      default:
        return {
          icon: 'bell-outline',
          color: theme.colors.primary,
        };
    }
  };
  
  const { icon, color } = getNotificationDetails();
  
  // Format the timestamp
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return '';
    }
  };
  
  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <TouchableOpacity 
          style={styles.content}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
            <MaterialCommunityIcons name={icon} size={20} color={color} />
          </View>
          
          <View style={styles.textContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.timestamp}>{formatTime(timestamp)}</Text>
            </View>
            
            <Text style={styles.message} numberOfLines={2}>
              {message}
            </Text>
          </View>
          
          {onDismiss && (
            <TouchableOpacity 
              style={styles.dismissButton}
              onPress={onDismiss}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <MaterialCommunityIcons 
                name="close" 
                size={16} 
                color={theme.colors.textSecondary} 
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    width: '90%',
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
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
  blurContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
  message: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  dismissButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default NotificationMessage;