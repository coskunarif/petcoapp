import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface AppCardProps {
  children: ReactNode;
  style?: ViewStyle;
  elevation?: 'small' | 'medium' | 'large';
}

const AppCard: React.FC<AppCardProps> = ({ 
  children, 
  style, 
  elevation = 'medium' 
}) => {
  return (
    <View style={[
      styles.card,
      theme.elevation[elevation],
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
  },
});

export default AppCard;
