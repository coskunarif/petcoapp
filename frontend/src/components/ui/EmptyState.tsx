import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, globalStyles } from '../../theme';
import AppButton from './AppButton';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  buttonTitle?: string;
  onButtonPress?: () => void;
  style?: ViewStyle;
  showTimestamp?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  buttonTitle,
  onButtonPress,
  style,
  showTimestamp = false,
}) => {
  // Helper function to check if a string is an emoji
  const isEmoji = (str: string): boolean => {
    // Simple check for emoji - typically 1-2 characters with unicode values
    return /\p{Emoji}/u.test(str) && str.length <= 2;
  };

  console.log('[EmptyState] Rendering with icon:', icon, 'isEmoji:', isEmoji(icon));

  // Define styles outside the conditional rendering for clarity
  const emojiStyle = {
    fontSize: 40,
    marginBottom: theme.spacing.sm,
    color: theme.colors.primary,
    textAlign: 'center' as const // Ensure textAlign is a valid literal type
  };
  const iconStyle = {
    marginBottom: theme.spacing.sm
  };

  // Log the styles being applied if it's an icon
  if (!isEmoji(icon)) {
    console.log('[EmptyState] Applying styles to MaterialCommunityIcons:', JSON.stringify(iconStyle));
  }

  return (
    <View style={[globalStyles.emptyStateContainer, style]}>
      {isEmoji(icon) ? (
        // If it's an emoji, wrap it in Text with appropriate styles
        <Text style={emojiStyle}>
          {icon}
        </Text>
      ) : (
        // Otherwise use MaterialCommunityIcons without the text-specific style
        <MaterialCommunityIcons
          name={icon}
          size={40}
          color={theme.colors.primary}
          style={iconStyle}
        />
      )}
      <Text style={globalStyles.emptyStateText}>{title}</Text>
      
      {description && (
        <Text style={globalStyles.emptyStateSubText}>{description}</Text>
      )}
      
      {buttonTitle && onButtonPress && (
        <AppButton 
          title={buttonTitle}
          onPress={onButtonPress}
          mode="secondary"
          style={styles.actionButton}
        />
      )}
      
      {showTimestamp && (
        <Text style={styles.timestamp}>{new Date().toLocaleString()}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    marginTop: theme.spacing.md,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  timestamp: {
    color: theme.colors.textTertiary,
    fontSize: 12,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  }
});

export default EmptyState;
