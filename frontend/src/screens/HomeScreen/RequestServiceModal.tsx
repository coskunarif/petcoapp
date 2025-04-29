import React, { useState } from 'react';
import supabase from '../../supabaseClient';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import DatePicker from 'expo-datepicker';

interface RequestServiceModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (request: { type: string; description: string; date: string; pet: string }) => void;
  pets?: { id: string; name: string }[];
}

const RequestServiceModal: React.FC<RequestServiceModalProps> = ({ visible, onClose, onSubmit, pets }) => {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  // Store date as a string in ISO format (or empty)
  const [date, setDate] = useState<string>('');
  const [pet, setPet] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!type || !description || !date) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      // Insert into Supabase service_requests
      const user = await supabase.auth.getUser();
      const requester_id = user.data.user?.id;
      const { data, error } = await supabase
        .from('service_requests')
        .insert([
          {
            type,
            description,
            date,
            pet_id: pet || null,
            requester_id,
            status: 'pending',
            created_at: new Date().toISOString(),
          },
        ]);
      if (error) throw error;
      if (onSubmit) onSubmit({ type, description, date, pet });
      onClose();
      setType('');
      setDescription('');
      setDate('');
      setPet('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
      setDate('');
      setPet('');
      onClose();
    }
  }

  // Date/time picker handler for expo-datepicker
  const handleDateChange = (selectedDate: Date) => {
    setDate(selectedDate.toISOString());
  };


  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.header}>Request a Service</Text>
          <TextInput
            style={styles.input}
            placeholder="Service Needed (e.g. Pet Sitting)"
            value={type}
            onChangeText={setType}
            editable={!submitting}
          />
          <TextInput
            style={[styles.input, { height: 64 }]}
            placeholder="Description / Special Instructions"
            value={description}
            onChangeText={setDescription}
            multiline
            editable={!submitting}
          />
          {/*
            For Expo Go compatibility, use a simple TextInput for date/time.
            If you later use a custom dev client, you can add a calendar/time picker here.
          */}
          <TextInput
            style={styles.input}
            placeholder="Preferred Date/Time (YYYY-MM-DD HH:mm)"
            value={date}
            onChangeText={setDate}
            editable={!submitting}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {pets && pets.length > 0 && (
            <TextInput
              style={styles.input}
              placeholder="Pet Name (optional)"
              value={pet}
              onChangeText={setPet}
              editable={!submitting}
            />
          )}
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

export default RequestServiceModal;
