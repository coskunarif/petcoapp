import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, globalStyles } from '../../theme';

interface EmptyConversationsStateProps {
  onStartConversation?: () => void;
}

const EmptyConversationsState = ({ onStartConversation }: EmptyConversationsStateProps) => (
  <View style={styles.container}>
    <BlurView intensity={60} style={styles.blurContainer} tint="light">
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={[theme.colors.primaryLight, 'rgba(255, 255, 255, 0.8)']}
          style={styles.iconGradient}
        >
          <MaterialCommunityIcons
            name="chat-outline"
            size={40}
            color={theme.colors.primary}
          />
        </LinearGradient>
      </View>
      
      <Text style={styles.title}>No Conversations Yet</Text>
      
      <Text style={styles.message}>
        Start a new conversation with a pet owner or service provider
      </Text>
      
      {onStartConversation && (
        <TouchableOpacity 
          style={styles.button}
          onPress={onStartConversation}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.buttonText}>Start a Conversation</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </BlurView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  blurContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    borderRadius: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...theme.elevation.small,
  },
  iconContainer: {
    marginBottom: theme.spacing.md,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 16,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    width: '100%',
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    ...theme.elevation.small,
  },
  buttonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
});

export default EmptyConversationsState;
