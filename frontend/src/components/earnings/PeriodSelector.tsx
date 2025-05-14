import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import { Text } from '../../components/ui';

export type Period = 'day' | 'week' | 'month' | 'year' | 'all';

interface PeriodSelectorProps {
  selectedPeriod: Period;
  onSelectPeriod: (period: Period) => void;
}

const PeriodSelector = ({ selectedPeriod, onSelectPeriod }: PeriodSelectorProps) => {
  const theme = useTheme();
  
  const periods: { label: string; value: Period }[] = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
    { label: 'All', value: 'all' },
  ];

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <Text variant="bodySmall" style={styles.label}>
          Time Period
        </Text>
        <View style={styles.periodButtons}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.value}
              style={[
                styles.periodButton,
                selectedPeriod === period.value && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              onPress={() => onSelectPeriod(period.value)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period.value && styles.selectedPeriodText,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 1,
  },
  content: {
    paddingVertical: 12,
  },
  label: {
    marginBottom: 8,
    color: '#888',
  },
  periodButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  periodText: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectedPeriodText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default PeriodSelector;