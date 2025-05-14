import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Message } from './types';

interface SystemMessageProps {
  message: Message;
}

const SystemMessage: React.FC<SystemMessageProps> = ({ message }) => {
  // Determine icon and color based on message content
  const getIconAndColor = () => {
    const content = message.content.toLowerCase();
    
    if (content.includes('accepted') || content.includes('started')) {
      return {
        icon: 'check-circle-outline',
        color: '#4CAF50' // green
      };
    } else if (content.includes('declined') || content.includes('cancelled')) {
      return {
        icon: 'close-circle-outline',
        color: '#F44336' // red
      };
    } else if (content.includes('completed')) {
      return {
        icon: 'check-all',
        color: '#2196F3' // blue
      };
    } else if (content.includes('payment') || content.includes('paid')) {
      return {
        icon: 'cash-check',
        color: '#4CAF50' // green
      };
    } else if (content.includes('scheduled') || content.includes('booking')) {
      return {
        icon: 'calendar-check',
        color: '#FF9800' // orange
      };
    } else if (content.includes('updated') || content.includes('changed')) {
      return {
        icon: 'update',
        color: '#9C27B0' // purple
      };
    } else {
      return {
        icon: 'information-outline',
        color: theme.colors.textSecondary
      };
    }
  };
  
  const { icon, color } = getIconAndColor();
  
  return (
    <View style={styles.container}>
      <BlurView intensity={70} tint="light" style={styles.blurContainer}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name={icon} 
            size={16} 
            color={color} 
          />
        </View>
        <Text style={[styles.messageText, { color }]}>{message.content}</Text>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginVertical: 12,
    maxWidth: '85%',
  },
  blurContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconContainer: {
    marginRight: 6,
  },
  messageText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
  },
});

export default SystemMessage;