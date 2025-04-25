import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface User {
  id: string;
  name: string;
}

interface Props {
  users: User[];
  isOpen: boolean;
  onClose: () => void;
  onStartConversation: (userId: string) => void;
}

const NewConversationModal: React.FC<Props> = ({ users, isOpen, onClose, onStartConversation }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Start New Conversation</Text>
          <Picker
            selectedValue={selectedUserId}
            onValueChange={(itemValue) => setSelectedUserId(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select a user..." value="" />
            {users.map((user) => (
              <Picker.Item key={user.id} label={user.name} value={user.id} />
            ))}
          </Picker>
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!selectedUserId}
              onPress={() => selectedUserId && onStartConversation(selectedUserId)}
              style={[styles.startButton, !selectedUserId && styles.disabledButton]}
            >
              <Text style={styles.startText}>Start</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    minWidth: 320,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  picker: {
    width: '100%',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelText: {
    color: '#888',
  },
  startButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#1976d2',
    borderRadius: 6,
  },
  startText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default NewConversationModal;
