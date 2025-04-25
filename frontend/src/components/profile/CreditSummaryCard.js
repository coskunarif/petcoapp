import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CreditSummaryCard({ credits = 0 }) {
  return (
    <View style={styles.card}>
      <MaterialCommunityIcons name="wallet" size={32} color="#1e88e5" style={styles.icon} />
      <View style={styles.info}>
        <Text style={styles.label}>Credits</Text>
        <Text style={styles.credits}>{credits}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  credits: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e88e5',
  },
});
