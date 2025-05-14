import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface ActionButtonProps {
  icon: string;
  label: string;
  color?: string;
  onPress: () => void;
}

interface ServiceActionButtonsProps {
  onAccept?: () => void;
  onDecline?: () => void;
  onComplete?: () => void;
  onSchedule?: () => void;
  onPayment?: () => void;
  onViewDetails?: () => void;
  onRateService?: () => void;
  serviceStatus?: string;
  isProvider?: boolean;
}

const ServiceActionButtons: React.FC<ServiceActionButtonsProps> = ({
  onAccept,
  onDecline,
  onComplete,
  onSchedule,
  onPayment,
  onViewDetails,
  onRateService,
  serviceStatus = 'pending',
  isProvider = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [containerHeight] = useState(new Animated.Value(56));
  
  const toggleExpand = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    
    Animated.spring(containerHeight, {
      toValue: newExpanded ? 130 : 56,
      friction: 10,
      useNativeDriver: false,
    }).start();
  };
  
  // Determine which buttons to show based on service status and user role
  const getButtons = (): ActionButtonProps[] => {
    const buttons: ActionButtonProps[] = [];
    
    // View details button is always available
    buttons.push({
      icon: 'eye-outline',
      label: 'View Details',
      onPress: onViewDetails || (() => {}),
      color: theme.colors.primary,
    });
    
    if (serviceStatus === 'pending') {
      if (isProvider) {
        // Provider can accept or decline
        buttons.push({
          icon: 'check-circle-outline',
          label: 'Accept',
          onPress: onAccept || (() => {}),
          color: '#4CAF50',
        });
        buttons.push({
          icon: 'close-circle-outline',
          label: 'Decline',
          onPress: onDecline || (() => {}),
          color: '#F44336',
        });
      } else {
        // Customer can schedule or cancel
        buttons.push({
          icon: 'calendar-check',
          label: 'Schedule',
          onPress: onSchedule || (() => {}),
          color: '#FF9800',
        });
        buttons.push({
          icon: 'cancel',
          label: 'Cancel',
          onPress: onDecline || (() => {}),
          color: '#F44336',
        });
      }
    }
    
    if (serviceStatus === 'accepted') {
      if (isProvider) {
        // Provider can mark as complete
        buttons.push({
          icon: 'check-all',
          label: 'Complete',
          onPress: onComplete || (() => {}),
          color: '#2196F3',
        });
      } else {
        // Customer can pay or cancel
        buttons.push({
          icon: 'cash-check',
          label: 'Pay Now',
          onPress: onPayment || (() => {}),
          color: '#4CAF50',
        });
        buttons.push({
          icon: 'calendar-check',
          label: 'Schedule',
          onPress: onSchedule || (() => {}),
          color: '#FF9800',
        });
      }
      
      // Both can cancel
      buttons.push({
        icon: 'cancel',
        label: 'Cancel',
        onPress: onDecline || (() => {}),
        color: '#F44336',
      });
    }
    
    if (serviceStatus === 'completed') {
      // Rating option
      buttons.push({
        icon: 'star-outline',
        label: 'Rate',
        onPress: onRateService || (() => {}),
        color: '#FFC107',
      });
      
      // Payment for customer
      if (!isProvider) {
        buttons.push({
          icon: 'cash-check',
          label: 'Pay Now',
          onPress: onPayment || (() => {}),
          color: '#4CAF50',
        });
      }
    }
    
    return buttons;
  };
  
  const buttons = getButtons();
  
  const renderActionButton = ({ icon, label, onPress, color }: ActionButtonProps) => (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: `${color}15` }]}
      onPress={onPress}
      key={`${icon}-${label}`}
    >
      <MaterialCommunityIcons name={icon} size={18} color={color} />
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
  
  return (
    <Animated.View style={[styles.container, { height: containerHeight }]}>
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <View style={styles.header}>
          <MaterialCommunityIcons 
            name="lightning-bolt-outline" 
            size={18} 
            color={theme.colors.primary} 
          />
          <Text style={styles.title}>Quick Actions</Text>
          
          <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
            <MaterialCommunityIcons 
              name={expanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
        
        {expanded && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.actionsContainer}
          >
            {buttons.map(renderActionButton)}
          </ScrollView>
        )}
        
        {!expanded && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.actionsContainer}
          >
            {buttons.slice(0, 3).map(renderActionButton)}
          </ScrollView>
        )}
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  blurContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  title: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  expandButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  actionsContainer: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default ServiceActionButtons;