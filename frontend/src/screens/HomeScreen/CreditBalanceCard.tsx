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
    backgroundColor: 'rgba(108,99,255,0.85)', // glassy accent
    borderRadius: 22,
    padding: 28,
    margin: 20,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  label: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(108,99,255,0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  balance: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(108,99,255,0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});

export default CreditBalanceCard;
