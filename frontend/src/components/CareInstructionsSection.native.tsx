import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface CareInstructionsSectionProps {
  care: any;
  onChange: (field: string, value: any) => void;
}

const CareInstructionsSection: React.FC<CareInstructionsSectionProps> = ({ care, onChange }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Care Instructions</Text>
    <TextInput
      style={styles.input}
      placeholder="Feeding"
      value={care.feeding || ''}
      onChangeText={text => onChange('feeding', text)}
      accessibilityLabel="Feeding"
    />
    <TextInput
      style={styles.input}
      placeholder="Medication"
      value={care.medication || ''}
      onChangeText={text => onChange('medication', text)}
      accessibilityLabel="Medication"
    />
    <TextInput
      style={styles.input}
      placeholder="Exercise"
      value={care.exercise || ''}
      onChangeText={text => onChange('exercise', text)}
      accessibilityLabel="Exercise"
    />
    <TextInput
      style={styles.input}
      placeholder="Special Instructions"
      value={care.special || ''}
      onChangeText={text => onChange('special', text)}
      accessibilityLabel="Special Instructions"
    />
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fafafa',
    fontSize: 16,
  },
});

export default CareInstructionsSection;
