import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // For validation icons, if available


interface CareInstructionsSectionProps {
  care: any;
  onChange: (field: string, value: any) => void;
}

const CareInstructionsSection: React.FC<CareInstructionsSectionProps> = ({ care, onChange }) => {
  const [focus, setFocus] = useState<string | null>(null);
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  // Simple validation: required fields (for demo)
  const isValid = {
    feeding: !!care.feeding && care.feeding.length > 1,
    medication: !!care.medication && care.medication.length > 1,
    exercise: !!care.exercise && care.exercise.length > 1,
    special: !!care.special && care.special.length > 1,
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
      <Text style={styles.sectionTitle}>Care Instructions</Text>
      {/* Feeding */}
      <View style={styles.inputRow}>
        <TextInput
          style={getInputStyle('feeding')}
          placeholder="Feeding"
          value={care.feeding || ''}
          onChangeText={text => { onChange('feeding', text); setTouched(t => ({...t, feeding: true})); }}
          onFocus={() => setFocus('feeding')}
          onBlur={() => setFocus(null)}
          accessibilityLabel="Feeding"
        />
        {renderValidationIcon('feeding')}
      </View>
      {/* Medication */}
      <View style={styles.inputRow}>
        <TextInput
          style={getInputStyle('medication')}
          placeholder="Medication"
          value={care.medication || ''}
          onChangeText={text => { onChange('medication', text); setTouched(t => ({...t, medication: true})); }}
          onFocus={() => setFocus('medication')}
          onBlur={() => setFocus(null)}
          accessibilityLabel="Medication"
        />
        {renderValidationIcon('medication')}
      </View>
      {/* Exercise */}
      <View style={styles.inputRow}>
        <TextInput
          style={getInputStyle('exercise')}
          placeholder="Exercise"
          value={care.exercise || ''}
          onChangeText={text => { onChange('exercise', text); setTouched(t => ({...t, exercise: true})); }}
          onFocus={() => setFocus('exercise')}
          onBlur={() => setFocus(null)}
          accessibilityLabel="Exercise"
        />
        {renderValidationIcon('exercise')}
      </View>
      {/* Special Instructions */}
      <View style={styles.inputRow}>
        <TextInput
          style={getInputStyle('special')}
          placeholder="Special Instructions"
          value={care.special || ''}
          onChangeText={text => { onChange('special', text); setTouched(t => ({...t, special: true})); }}
          onFocus={() => setFocus('special')}
          onBlur={() => setFocus(null)}
          accessibilityLabel="Special Instructions"
        />
        {renderValidationIcon('special')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e5e7eb', // neutral gray
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
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

export default CareInstructionsSection;
