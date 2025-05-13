/**
 * PetCoApp Theme
 * Centralized theme configuration for consistent UI/UX across the application
 */

import { StyleSheet } from 'react-native';

export const theme = {
  /**
   * Color palette
   */
  colors: {
    primary: '#6C63FF',
    primaryLight: 'rgba(108,99,255,0.15)',
    primaryDark: '#4A45D1',
    secondary: '#48C6EF',
    text: '#23235B',
    textSecondary: '#757575',
    textTertiary: '#A0A0B2',
    surface: 'rgba(255,255,255,0.8)',
    surfaceHighlight: 'rgba(255,255,255,0.95)',
    background: 'rgba(255,255,255,0.6)',
    error: '#d32f2f',
    success: '#2e7d32',
    warning: '#ed6c02',
    info: '#0288d1',
  },

  /**
   * Border radius values
   */
  borderRadius: {
    small: 16,
    medium: 22,
    large: 28,
    pill: 50,
  },

  /**
   * Shadow/elevation presets
   */
  elevation: {
    small: {
      shadowColor: '#6C63FF',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.10,
      shadowRadius: 8,
      elevation: 3,
    },
    medium: {
      shadowColor: '#6C63FF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.14,
      shadowRadius: 12,
      elevation: 6,
    },
    large: {
      shadowColor: '#6C63FF',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  /**
   * Typography system with valid React Native fontWeight values
   */
  typography: {
    h1: { fontSize: 26, fontWeight: '900' as const, letterSpacing: 0.3, color: '#23235B' },
    h2: { fontSize: 22, fontWeight: '800' as const, letterSpacing: 0.2, color: '#23235B' },
    h3: { fontSize: 18, fontWeight: '700' as const, letterSpacing: 0.2, color: '#23235B' },
    body: { fontSize: 16, fontWeight: '400' as const, color: '#23235B' },
    caption: { fontSize: 14, fontWeight: '400' as const, color: '#757575' },
    button: { fontSize: 16, fontWeight: '700' as const, letterSpacing: 0.3, color: '#FFFFFF' },
    label: { fontSize: 14, fontWeight: '600' as const, color: '#23235B' },
  },

  /**
   * Spacing system
   */
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

/**
 * Component-specific styles that can be reused across the app
 */
export const globalStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    ...theme.elevation.medium,
  },
  sectionHeader: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    letterSpacing: theme.typography.h2.letterSpacing,
    color: theme.typography.h2.color,
    marginBottom: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: theme.spacing.md,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.xl,
    marginHorizontal: theme.spacing.md,
    ...theme.elevation.medium,
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.1)',
    minHeight: 200,
  },
  emptyStateIcon: {
    fontSize: 40,
    marginBottom: theme.spacing.sm,
    color: theme.colors.primary,
  },
  emptyStateText: {
    color: theme.colors.text,
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '700',
  },
  emptyStateSubText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.elevation.medium,
  },
  buttonText: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    letterSpacing: theme.typography.button.letterSpacing,
    color: theme.typography.button.color,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: theme.borderRadius.medium,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  secondaryButtonText: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    letterSpacing: theme.typography.button.letterSpacing,
    color: theme.colors.primary,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: 40,
    backgroundColor: theme.colors.primary,
    borderRadius: 32,
    ...theme.elevation.large,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    padding: theme.spacing.lg,
    ...theme.elevation.medium,
  },
  sectionDivider: {
    height: theme.spacing.lg,
    backgroundColor: 'transparent',
  },
});
