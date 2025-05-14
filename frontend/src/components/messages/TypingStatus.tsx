import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TypingIndicator from './TypingIndicator';
import { theme } from '../../theme';

interface TypingStatusProps {
  userName: string;
  isTyping: boolean;
}

const TypingStatus: React.FC<TypingStatusProps> = ({ userName, isTyping }) => {
  if (!isTyping) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{userName} is typing</Text>
      <TypingIndicator size={4} color={theme.colors.textSecondary} isVisible={isTyping} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  }
});

export default TypingStatus;