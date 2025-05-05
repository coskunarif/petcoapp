import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

type StatusType = 'pending' | 'accepted' | 'completed' | 'cancelled' | 'active' | 'inactive';

interface StatusBadgeProps {
  status: StatusType;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  style,
  size = 'medium'
}) => {
  const getStatusColor = () => {
    switch(status) {
      case 'pending':
        return theme.colors.warning;
      case 'accepted':
        return theme.colors.info;
      case 'completed':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      case 'active':
        return theme.colors.success;
      case 'inactive':
        return theme.colors.textTertiary;
      default:
        return theme.colors.textTertiary;
    }
  };

  const getStatusText = () => {
    // Capitalize first letter
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getSizeStyle = () => {
    switch(size) {
      case 'small':
        return styles.smallBadge;
      case 'large':
        return styles.largeBadge;
      case 'medium':
      default:
        return {};
    }
  };
  
  const getSizeTextStyle = () => {
    switch(size) {
      case 'small':
        return styles.smallText;
      case 'large':
        return styles.largeText;
      case 'medium':
      default:
        return {};
    }
  };

  return (
    <View style={[
      styles.badge, 
      { backgroundColor: `${getStatusColor()}20` },
      getSizeStyle(),
      style
    ]}>
      <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
      <Text style={[
        styles.statusText, 
        { color: getStatusColor() },
        getSizeTextStyle()
      ]}>
        {getStatusText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.pill,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 12,
  },
  smallBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  smallText: {
    fontSize: 10,
  },
  largeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  largeText: {
    fontSize: 14,
  }
});

export default StatusBadge;
