import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import { Text } from '../../components/ui';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/formatters';

interface EarningsSummaryProps {
  totalEarnings: number;
  pendingPayouts: number;
  completedServices: number;
  averageRating: number;
  period: string;
  onRequestPayout?: () => void;
}

const EarningsSummaryCard = ({
  totalEarnings,
  pendingPayouts,
  completedServices,
  averageRating,
  period,
  onRequestPayout,
}: EarningsSummaryProps) => {
  const theme = useTheme();

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.headerRow}>
          <Text variant="titleMedium" style={styles.title}>
            {period} Earnings
          </Text>
          {onRequestPayout && (
            <TouchableOpacity 
              style={[styles.payoutButton, { backgroundColor: theme.colors.primary }]} 
              onPress={onRequestPayout}
            >
              <Text style={styles.payoutButtonText}>Request Payout</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.amountContainer}>
          <Text variant="headlineLarge" style={styles.amountText}>
            {formatCurrency(totalEarnings)}
          </Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="wallet-outline" size={18} color={theme.colors.primary} />
            </View>
            <View>
              <Text variant="bodySmall" style={styles.infoLabel}>
                Pending
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {formatCurrency(pendingPayouts)}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.primary} />
            </View>
            <View>
              <Text variant="bodySmall" style={styles.infoLabel}>
                Services
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {completedServices}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="star-outline" size={18} color={theme.colors.primary} />
            </View>
            <View>
              <Text variant="bodySmall" style={styles.infoLabel}>
                Rating
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {averageRating.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: '600',
  },
  payoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  payoutButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  amountContainer: {
    marginBottom: 16,
  },
  amountText: {
    fontWeight: 'bold',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  infoLabel: {
    color: '#888',
    marginBottom: 2,
  },
  infoValue: {
    fontWeight: '600',
  },
});

export default EarningsSummaryCard;