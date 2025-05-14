import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import { Text } from '../../components/ui';
import { Period } from './PeriodSelector';
import { formatCurrency } from '../../utils/formatters';

interface EarningDataPoint {
  label: string;
  amount: number;
}

interface EarningsChartProps {
  data: EarningDataPoint[];
  period: Period;
  maxValue: number;
}

const EarningsChart = ({ data, period, maxValue }: EarningsChartProps) => {
  const theme = useTheme();
  const chartWidth = Dimensions.get('window').width - 64; // Accounting for padding
  
  const formatXAxisLabel = (label: string): string => {
    switch (period) {
      case 'day':
        // For day, show hour
        return label;
      case 'week':
        // For week, show day abbreviation
        return label.substring(0, 3);
      case 'month':
        // For month, show day number
        return label;
      case 'year':
        // For year, show month abbreviation
        return label.substring(0, 3);
      default:
        return label;
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Earnings Trend
        </Text>
        
        <View style={styles.chartContainer}>
          {/* Y-Axis Labels */}
          <View style={styles.yAxis}>
            <Text style={styles.axisLabel}>{formatCurrency(maxValue)}</Text>
            <Text style={styles.axisLabel}>{formatCurrency(maxValue / 2)}</Text>
            <Text style={styles.axisLabel}>{formatCurrency(0)}</Text>
          </View>
          
          {/* Chart Content */}
          <View style={styles.chart}>
            {/* Horizontal Grid Lines */}
            <View style={[styles.gridLine, { top: 0 }]} />
            <View style={[styles.gridLine, { top: '50%' }]} />
            <View style={[styles.gridLine, { top: '100%' }]} />
            
            {/* Bars */}
            <View style={styles.barsContainer}>
              {data.map((item, index) => {
                const barHeight = maxValue > 0 ? (item.amount / maxValue) * 120 : 0;
                return (
                  <View key={index} style={styles.barWrapper}>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: Math.max(barHeight, 4), // Minimum height for visibility
                          backgroundColor: theme.colors.primary 
                        }
                      ]} 
                    />
                    <Text style={styles.barLabel}>
                      {formatXAxisLabel(item.label)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
        
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
            <Text variant="bodySmall">Earnings</Text>
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
    elevation: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    height: 160,
    flexDirection: 'row',
  },
  yAxis: {
    width: 50,
    height: 120,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  axisLabel: {
    color: '#888',
    fontSize: 10,
  },
  chart: {
    flex: 1,
    height: 120,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingBottom: 24, // Space for labels
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  barLabel: {
    position: 'absolute',
    bottom: 0,
    fontSize: 10,
    color: '#888',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
});

export default EarningsChart;