import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // For validation icons, if available


interface BasicInfoSectionProps {
  form: any;
  onChange: (field: string, value: any) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ form, onChange }) => {
  // Track focus and validation for each field
  const [focus, setFocus] = useState<string | null>(null);
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  // Validation logic
  const isValid = {
    name: !!form.name && form.name.length > 1,
    species: !!form.species && form.species.length > 1,
    breed: !!form.breed && form.breed.length > 1,
    age: !!form.age && !isNaN(Number(form.age)),
    weight: !!form.weight && !isNaN(Number(form.weight)),
  };

  const getInputStyle = (field: string) => [
    styles.input,
    focus === field && styles.inputFocus,
    touched[field] && !isValid[field] && styles.inputInvalid,
    touched[field] && isValid[field] && styles.inputValid,
  ];

  const renderValidationIcon = (field: string) => {
    if (!touched[field]) return null;
    if (isValid[field]) {
      return <MaterialIcons name="check-circle" size={18} color="#16a34a" style={{ marginLeft: 6 }} />;
    } else {
      return <MaterialIcons name="error" size={18} color="#dc2626" style={{ marginLeft: 6 }} />;
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      {/* Name */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Name</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={getInputStyle('name')}
            placeholder="Enter pet's name"
            value={form.name}
            onChangeText={text => { onChange('name', text); setTouched(t => ({...t, name: true})); }}
            onFocus={() => setFocus('name')}
            onBlur={() => setFocus(null)}
            accessibilityLabel="Pet Name"
          />
          {renderValidationIcon('name')}
        </View>
      </View>
      
      {/* Species */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Species</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={getInputStyle('species')}
            placeholder="Dog, Cat, Bird, etc."
            value={form.species}
            onChangeText={text => { onChange('species', text); setTouched(t => ({...t, species: true})); }}
            onFocus={() => setFocus('species')}
            onBlur={() => setFocus(null)}
            accessibilityLabel="Species"
          />
          {renderValidationIcon('species')}
        </View>
      </View>
      
      {/* Breed */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Breed</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={getInputStyle('breed')}
            placeholder="Enter breed"
            value={form.breed}
            onChangeText={text => { onChange('breed', text); setTouched(t => ({...t, breed: true})); }}
            onFocus={() => setFocus('breed')}
            onBlur={() => setFocus(null)}
            accessibilityLabel="Breed"
          />
          {renderValidationIcon('breed')}
        </View>
      </View>
      
      {/* Age */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Age (years)</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={getInputStyle('age')}
            placeholder="Enter age"
            value={form.age ? String(form.age) : ''}
            onChangeText={text => { onChange('age', text.replace(/[^0-9]/g, '')); setTouched(t => ({...t, age: true})); }}
            keyboardType="numeric"
            onFocus={() => setFocus('age')}
            onBlur={() => setFocus(null)}
            accessibilityLabel="Age"
          />
          {renderValidationIcon('age')}
        </View>
      </View>
      
      {/* Weight */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Weight (kg)</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={getInputStyle('weight')}
            placeholder="Enter weight"
            value={form.weight ? String(form.weight) : ''}
            onChangeText={text => { onChange('weight', text.replace(/[^0-9.]/g, '')); setTouched(t => ({...t, weight: true})); }}
            keyboardType="numeric"
            onFocus={() => setFocus('weight')}
            onBlur={() => setFocus(null)}
            accessibilityLabel="Weight"
          />
          {renderValidationIcon('weight')}
        </View>
      </View>
    </View>
  );
};

import { Dimensions } from 'react-native';
const isMobile = Dimensions.get('window').width < 600;

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#4b5563', // gray-600
    paddingLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: isMobile ? 2 : 1.5,
    borderColor: isMobile ? '#b5b3fa' : '#e5e7eb',
    borderRadius: isMobile ? 18 : 12,
    paddingVertical: isMobile ? 14 : 12,
    paddingHorizontal: isMobile ? 18 : 16,
    backgroundColor: isMobile ? 'rgba(255,255,255,0.82)' : '#fff',
    fontSize: 16,
    shadowColor: isMobile ? '#6C63FF' : '#000',
    shadowOffset: isMobile ? { width: 0, height: 3 } : { width: 0, height: 1 },
    shadowOpacity: isMobile ? 0.12 : 0.04,
    shadowRadius: isMobile ? 10 : 3,
    elevation: isMobile ? 3 : 1,
  },
  inputFocus: {
    borderColor: '#2563eb', // blue-600
    shadowColor: '#2563eb',
    shadowOpacity: 0.12,
    elevation: 2,
  },
  inputInvalid: {
    borderColor: '#dc2626', // red-600
  },
  inputValid: {
    borderColor: '#16a34a', // green-600
  },
});

export default BasicInfoSection;
