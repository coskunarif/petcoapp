import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  balance: number;
  onPress: () => void;
}

const CreditBalanceCard: React.FC<Props> = ({ balance, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Text style={styles.label}>Credit Balance</Text>
    <Text style={styles.balance}>${balance.toFixed(2)}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#4F8EF7',
    borderRadius: 14,
    padding: 20,
    margin: 16,
    alignItems: 'center',
    elevation: 3,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  balance: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
});

export default CreditBalanceCard;
