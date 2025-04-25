import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onCreateRequestPress: () => void;
  onOfferServicePress: () => void;
}

const QuickActionsSection: React.FC<Props> = ({ onCreateRequestPress, onOfferServicePress }) => (
  <View style={styles.container}>
    <TouchableOpacity style={styles.actionBtn} onPress={onCreateRequestPress}>
      <Ionicons name="paw" size={24} color="#fff" />
      <Text style={styles.label}>Request Service</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionBtn} onPress={onOfferServicePress}>
      <Ionicons name="add-circle" size={24} color="#fff" />
      <Text style={styles.label}>Offer Service</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 24,
    gap: 16,
  },
  actionBtn: {
    backgroundColor: 'rgba(108,99,255,0.95)',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
  },
  label: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    marginTop: 12,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(108,99,255,0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export default QuickActionsSection;
