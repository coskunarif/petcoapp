import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface EmptyStatePetsProps {
  onAddPet: () => void;
}

const EmptyStatePets: React.FC<EmptyStatePetsProps> = ({ onAddPet }) => (
  <View style={styles.outerContainer}>
    <View style={styles.glassCard}>
      <Text style={styles.emoji} accessibilityLabel="Pet illustration">🐾</Text>
      <Text style={styles.title}>No pets yet!</Text>
      <Text style={styles.subtitle}>Add your first pet to get started.</Text>
      <TouchableOpacity style={styles.button} onPress={onAddPet} accessibilityLabel="Add your first pet">
        <Text style={styles.buttonText}>+ Add Pet</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    marginTop: 80,
    flex: 1,
    justifyContent: 'center',
  },
  glassCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 28,
    paddingVertical: 38,
    paddingHorizontal: 32,
    shadowColor: '#4a90e2',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
    minWidth: 260,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#232a35',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 17,
    color: '#6a7ba2',
    marginBottom: 28,
    fontWeight: '400',
  },
  button: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 38,
    borderRadius: 24,
    backgroundColor: '#1976d2',
    shadowColor: '#1976d2',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default EmptyStatePets;
