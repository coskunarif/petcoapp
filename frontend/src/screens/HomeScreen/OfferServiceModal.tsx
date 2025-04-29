import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import Picker

// Define the structure for a service type
interface ServiceType {
  id: string;
  name: string;
}

interface OfferServiceModalProps {
  visible: boolean;
  onClose: () => void;
  // Update onSubmit signature to expect service_type_id
  onSubmit: (service: { service_type_id: string; description: string; cost: string; availability: string }) => void;
  serviceTypes: ServiceType[]; // Add prop for service types
}

const OfferServiceModal: React.FC<OfferServiceModalProps> = ({ visible, onClose, onSubmit, serviceTypes }) => {
  // State now holds the selected service_type_id
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [availability, setAvailability] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Set default selected type if serviceTypes is not empty
      setSelectedServiceTypeId(serviceTypes.length > 0 ? serviceTypes[0].id : undefined);
      setDescription('');
      setCost('');
      setAvailability('');
      setError(null);
      setSubmitting(false);
    }
  }, [visible, serviceTypes]);


  const handleSubmit = async () => {
    setError(null);
    // Check if a service type is selected
    if (!selectedServiceTypeId || !description || !cost) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      // Pass the selected ID instead of the name string
      await onSubmit({ service_type_id: selectedServiceTypeId, description, cost, availability });
      // Reset state (handled by useEffect now)
      // setSelectedServiceTypeId(serviceTypes.length > 0 ? serviceTypes[0].id : undefined);
      // setDescription('');
      // setCost('');
      setAvailability('');
      onClose();
    } catch (e: any) {
      setError(e.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.header}>Offer a Service</Text>
          {/* Replace TextInput with Picker */}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedServiceTypeId}
              onValueChange={(itemValue) => setSelectedServiceTypeId(itemValue)}
              style={styles.picker}
              enabled={!submitting}
            >
              {serviceTypes.map((st) => (
                <Picker.Item key={st.id} label={st.name} value={st.id} />
              ))}
            </Picker>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            editable={!submitting}
          />
          <TextInput
            style={styles.input}
            placeholder="Cost (credits)"
            value={cost}
            onChangeText={setCost}
            keyboardType="numeric"
            editable={!submitting}
          />
          <TextInput
            style={styles.input}
            placeholder="Availability (e.g. Weekdays 9am-5pm)"
            value={availability}
            onChangeText={setAvailability}
            editable={!submitting}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={submitting}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
              <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1976d2',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e7ef',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14, // Slightly more horizontal padding
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f7f8fa',
    color: '#333', // Ensure text color is visible
  },
  textArea: {
    height: 80, // Increase height for description
    textAlignVertical: 'top', // Align text to top for multiline
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e7ef',
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#f7f8fa',
    height: 50, // Standard height for picker container
    justifyContent: 'center',
  },
  picker: {
     // Basic styling, adjust as needed
     width: '100%',
     height: '100%',
     color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 8,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginRight: 8,
  },
  cancelText: {
    color: '#888',
    fontWeight: '600',
  },
  submitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#1976d2',
    borderRadius: 8,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
  },
  error: {
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default OfferServiceModal;
