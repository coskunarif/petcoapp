import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface EmptyStatePetsProps {
  onAddPet: () => void;
}

const EmptyStatePets: React.FC<EmptyStatePetsProps> = ({ onAddPet }) => (
  <View style={styles.container}>
    {/* TODO: Add illustration if desired */}
    <Text style={styles.title}>No pets added yet</Text>
    <Text style={styles.subtitle}>Add your first pet to get started!</Text>
    <TouchableOpacity style={styles.button} onPress={onAddPet}>
      <Text style={styles.buttonText}>Add Pet</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 64,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: '#1976d2',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EmptyStatePets;
