import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CreditSummaryCard({ credits = 0 }) {
  return (
    <View style={styles.card}>
      <MaterialCommunityIcons name="wallet" size={36} color="#fff" style={styles.icon} />
      <View style={styles.info}>
        <Text style={styles.label}>Credit Balance</Text>
        <Text style={styles.credits}>${credits}.00</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7B61FF',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 18,
    padding: 24,
    shadowColor: '#7B61FF',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  icon: {
    marginRight: 18,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  credits: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
});
