import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../../supabaseClient';

interface RequestServiceModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (request: { service_type_id: string; description: string; date: string; pet_id?: string }) => void;
  serviceTypes: { id: string; name: string }[];
  pets?: { id: string; name: string }[];
}

const RequestServiceModal: React.FC<RequestServiceModalProps> = ({ visible, onClose, onSubmit, serviceTypes, pets }) => {
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState('');
  // Store Date object for the picker and ISO string for submission
  const [selectedDateObj, setSelectedDateObj] = useState(new Date());
  const [date, setDate] = useState<string>(selectedDateObj.toISOString()); // ISO string for submission logic
  const [pet, setPet] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!selectedServiceTypeId || !description || !date) {
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
            service_type_id: selectedServiceTypeId,
            description,
            date,
            pet_id: pet,
            requester_id,
            status: 'pending',
            created_at: new Date().toISOString(),
          },
        ]);
      if (error) throw error;
      if (onSubmit) onSubmit({
        service_type_id: selectedServiceTypeId!,
        description,
        date,
        pet_id: pet
      });
      onClose();
      setSelectedServiceTypeId(serviceTypes.length > 0 ? serviceTypes[0].id : undefined);
      setDescription('');
      // Reset date state
      const now = new Date();
      setSelectedDateObj(now);
      setDate(now.toISOString());
      setPet('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
      // Ensure date is reset even on failure before closing
      const now = new Date();
      setSelectedDateObj(now);
      setDate(now.toISOString());
      setPet('');
      onClose();
    }
  }
// Reset state when modal becomes visible
useEffect(() => {
  if (visible) {
    setSelectedServiceTypeId(serviceTypes.length > 0 ? serviceTypes[0].id : undefined);
    setDescription('');
    // Reset date state
    const now = new Date();
    setSelectedDateObj(now);
    setDate(now.toISOString());
    setPet('');
    setError(null);
    setSubmitting(false);
  }
}, [visible, serviceTypes]);



  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.header}>Request a Service</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedServiceTypeId}
              onValueChange={(itemValue) => setSelectedServiceTypeId(itemValue)}
              style={styles.picker}
              enabled={!submitting}
            >
              {serviceTypes && serviceTypes.length > 0 ? (
                serviceTypes.map((st) => (
                  <Picker.Item key={st.id} label={st.name} value={st.id} />
                ))
              ) : (
                <Picker.Item label="No service types available" value={undefined} />
              )}
            </Picker>
          </View>
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
          <DateTimePicker
            value={selectedDateObj} // Use Date object state for value
            mode="datetime"
            display="spinner" // 'spinner' is generally safer inside modals on Android
            onChange={(event, newSelectedDate) => {
              // Update Date object state regardless of event type
              const currentDate = newSelectedDate || selectedDateObj; // Fallback to previous date if undefined
              setSelectedDateObj(currentDate);

              // Update ISO string state only if a date was explicitly set
              if (event.type === 'set' && newSelectedDate) {
                setDate(newSelectedDate.toISOString());
              }
              // No explicit dismiss needed for spinner mode
            }}
            style={styles.datePicker}
            textColor="#333" // Ensure text is visible
            minimumDate={new Date()}
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e7ef',
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#f7f8fa',
    justifyContent: 'center',
    height: 75
  },
  picker: {
    width: '100%',
    height: '100%',
    color: '#333',
  },
  datePicker: {
    marginBottom: 12,
    backgroundColor: '#f7f8fa',
    borderRadius: 10,
      borderWidth: 1,
    borderColor: '#e0e7ef',
  },
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
