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
  return (
    <View style={styles.container}>
      <BlurView intensity={70} tint="light" style={styles.blurContainer}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name="information-outline" 
            size={16} 
            color={theme.colors.textSecondary} 
          />
        </View>
        <Text style={styles.messageText}>{message.content}</Text>
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