import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface BasicInfoSectionProps {
  form: any;
  onChange: (field: string, value: any) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ form, onChange }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Basic Information</Text>
    <TextInput
      style={styles.input}
      placeholder="Name"
      value={form.name}
      onChangeText={text => onChange('name', text)}
      accessibilityLabel="Pet Name"
    />
    <TextInput
      style={styles.input}
      placeholder="Species"
      value={form.species}
      onChangeText={text => onChange('species', text)}
      accessibilityLabel="Species"
    />
    <TextInput
      style={styles.input}
      placeholder="Breed"
      value={form.breed}
      onChangeText={text => onChange('breed', text)}
      accessibilityLabel="Breed"
    />
    <TextInput
      style={styles.input}
      placeholder="Age"
      value={form.age ? String(form.age) : ''}
      onChangeText={text => onChange('age', text.replace(/[^0-9]/g, ''))}
      keyboardType="numeric"
      accessibilityLabel="Age"
    />
    <TextInput
      style={styles.input}
      placeholder="Weight (kg)"
      value={form.weight ? String(form.weight) : ''}
      onChangeText={text => onChange('weight', text.replace(/[^0-9.]/g, ''))}
      keyboardType="numeric"
      accessibilityLabel="Weight"
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

export default BasicInfoSection;
