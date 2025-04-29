import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';

interface OfferServiceModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (service: { type: string; description: string; cost: string; availability: string }) => void;
}

const OfferServiceModal: React.FC<OfferServiceModalProps> = ({ visible, onClose, onSubmit }) => {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [availability, setAvailability] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!type || !description || !cost) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ type, description, cost, availability });
      setType('');
      setDescription('');
      setCost('');
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
          <TextInput
            style={styles.input}
            placeholder="Service Type (e.g. Dog Walking)"
            value={type}
            onChangeText={setType}
            editable={!submitting}
          />
          <TextInput
            style={[styles.input, { height: 64 }]}
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
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f7f8fa',
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
