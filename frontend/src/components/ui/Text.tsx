import React, { ReactNode } from 'react';
import { Text as RNText, StyleSheet, TextStyle, TextProps } from 'react-native';
import { theme } from '../../theme';

interface CustomTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'button' | 'label';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  color?: keyof typeof theme.colors | string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: TextStyle;
  children: ReactNode;
}

// Default styles to fall back on if a variant is missing
const defaultTextStyle: TextStyle = {
  fontSize: 16,
  fontWeight: '400',
  color: '#23235B',
};

const Text: React.FC<CustomTextProps> = ({
  variant = 'body',
  weight,
  color,
  align,
  style,
  children,
  ...props
}) => {
  // Get base style from typography in theme with fallback to default
  const baseStyle = theme.typography[variant] || defaultTextStyle;

  // Determine font weight with defensive check
  let fontWeight: TextStyle['fontWeight'] = baseStyle.fontWeight || '400';
  if (weight) {
    switch (weight) {
      case 'normal':
        fontWeight = '400';
        break;
      case 'medium':
        fontWeight = '500';
        break;
      case 'semibold':
        fontWeight = '600';
        break;
      case 'bold':
        fontWeight = '700';
        break;
      case 'black':
        fontWeight = '900';
        break;
    }
  }

  // Determine text color with defensive check
  let textColor = baseStyle.color || theme.colors.text;
  if (color) {
    textColor = color in theme.colors
      ? theme.colors[color as keyof typeof theme.colors]
      : color;
  }

  return (
    <RNText
      style={[
        baseStyle,
        { fontWeight },
        { color: textColor },
        align && { textAlign: align },
        style
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

export default Text;