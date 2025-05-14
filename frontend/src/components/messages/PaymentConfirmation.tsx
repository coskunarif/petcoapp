import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Image
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';
import { formatCurrency } from '../../utils/formatters';

interface PaymentConfirmationProps {
  transactionId: string;
  amount: number;
  serviceName: string;
  date: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: {
    type: 'card' | 'credits' | 'bank';
    lastFour?: string;
    name?: string;
  };
  onViewReceipt?: () => void;
  onRepay?: () => void;
  onContact?: () => void;
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  transactionId,
  amount,
  serviceName,
  date,
  status,
  paymentMethod,
  onViewReceipt,
  onRepay,
  onContact
}) => {
  const [expanded, setExpanded] = useState(false);
  const [containerHeight] = useState(new Animated.Value(expanded ? 240 : 140));
  
  const toggleExpanded = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    
    Animated.spring(containerHeight, {
      toValue: newExpanded ? 240 : 140,
      friction: 8,
      useNativeDriver: false,
    }).start();
  };
  
  // Format date string to readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Get status details based on payment status
  const getStatusDetails = () => {
    switch (status) {
      case 'completed':
        return {
          icon: 'check-circle-outline',
          color: '#4CAF50',
          title: 'Payment Successful',
          gradient: ['#4CAF5020', '#FFFFFF']
        };
      case 'pending':
        return {
          icon: 'clock-outline',
          color: '#FF9800',
          title: 'Payment Pending',
          gradient: ['#FF980020', '#FFFFFF']
        };
      case 'failed':
        return {
          icon: 'alert-circle-outline',
          color: '#F44336',
          title: 'Payment Failed',
          gradient: ['#F4433620', '#FFFFFF']
        };
      case 'refunded':
        return {
          icon: 'cash-refund',
          color: '#2196F3',
          title: 'Payment Refunded',
          gradient: ['#2196F320', '#FFFFFF']
        };
      default:
        return {
          icon: 'information-outline',
          color: theme.colors.primary,
          title: 'Payment',
          gradient: [theme.colors.primary + '20', '#FFFFFF']
        };
    }
  };
  
  const { icon, color, title, gradient } = getStatusDetails();
  
  // Get payment method icon
  const getPaymentMethodIcon = () => {
    if (!paymentMethod) return 'credit-card-outline';
    
    switch (paymentMethod.type) {
      case 'card':
        return 'credit-card-outline';
      case 'credits':
        return 'wallet-outline';
      case 'bank':
        return 'bank-outline';
      default:
        return 'credit-card-outline';
    }
  };
  
  // Get payment method text
  const getPaymentMethodText = () => {
    if (!paymentMethod) return 'Payment method';
    
    switch (paymentMethod.type) {
      case 'card':
        return `Card ending in ${paymentMethod.lastFour || '****'}`;
      case 'credits':
        return 'App Credits';
      case 'bank':
        return paymentMethod.name || 'Bank Account';
      default:
        return 'Payment method';
    }
  };
  
  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <Animated.View style={[styles.contentContainer, { height: containerHeight }]}>
          <LinearGradient
            colors={gradient}
            style={styles.background}
          />
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name={icon} size={28} color={color} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.amountText}>{formatCurrency(amount)}</Text>
            </View>
          </View>
          
          {/* Details */}
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{serviceName}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{formatDate(date)}</Text>
            </View>
            
            {paymentMethod && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Method:</Text>
                <View style={styles.paymentMethodContainer}>
                  <MaterialCommunityIcons 
                    name={getPaymentMethodIcon()} 
                    size={16} 
                    color={theme.colors.textSecondary} 
                    style={styles.methodIcon}
                  />
                  <Text style={styles.detailValue}>{getPaymentMethodText()}</Text>
                </View>
              </View>
            )}
            
            {expanded && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Transaction ID:</Text>
                  <Text style={styles.detailValue}>{transactionId}</Text>
                </View>
                
                {status === 'completed' && (
                  <View style={styles.receiptContainer}>
                    <Text style={styles.receiptText}>Receipt Available</Text>
                  </View>
                )}
              </>
            )}
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {status === 'completed' && onViewReceipt && (
              <TouchableOpacity 
                style={[styles.actionButton, { borderColor: color }]} 
                onPress={onViewReceipt}
              >
                <MaterialCommunityIcons name="receipt" size={16} color={color} style={styles.actionIcon} />
                <Text style={[styles.actionText, { color }]}>View Receipt</Text>
              </TouchableOpacity>
            )}
            
            {status === 'failed' && onRepay && (
              <TouchableOpacity 
                style={[styles.actionButton, { borderColor: color }]} 
                onPress={onRepay}
              >
                <MaterialCommunityIcons name="refresh" size={16} color={color} style={styles.actionIcon} />
                <Text style={[styles.actionText, { color }]}>Try Again</Text>
              </TouchableOpacity>
            )}
            
            {(status === 'failed' || status === 'pending') && onContact && (
              <TouchableOpacity 
                style={[styles.actionButton, { borderColor: theme.colors.primary }]} 
                onPress={onContact}
              >
                <MaterialCommunityIcons name="help-circle-outline" size={16} color={theme.colors.primary} style={styles.actionIcon} />
                <Text style={[styles.actionText, { color: theme.colors.primary }]}>Get Help</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Expand Button */}
          <TouchableOpacity style={styles.expandButton} onPress={toggleExpanded}>
            <MaterialCommunityIcons 
              name={expanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        </Animated.View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    width: '90%',
    marginVertical: 12,
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
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  contentContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  details: {
    padding: 16,
    paddingTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
    textAlign: 'right',
    maxWidth: '60%',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    marginRight: 4,
  },
  receiptContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  receiptText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginLeft: 8,
  },
  actionIcon: {
    marginRight: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expandButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
});

export default PaymentConfirmation;