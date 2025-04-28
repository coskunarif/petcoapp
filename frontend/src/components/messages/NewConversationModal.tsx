import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    console.log("[DEBUG] Users prop in modal:", users);
  }, [users]);

  return (
    <Modal
      visible={isOpen}
      transparent={false} // Changed for Android Picker visibility
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Start New Conversation</Text>
          <View style={{ maxHeight: 200, marginBottom: 16 }}>
            {users && users.length > 0 ? (
              users.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={{
                    padding: 12,
                    backgroundColor: selectedUserId === user.id ? "#cce6ff" : "#eee",
                    marginBottom: 4,
                    borderRadius: 6,
                  }}
                  onPress={() => setSelectedUserId(user.id)}
                >
                  <Text style={{ fontSize: 16 }}>{user.name}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text>No users available</Text>
            )}
          </View>
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
    backgroundColor: 'rgba(24,38,63,0.22)', // subtle overlay
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  modalContent: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 28,
    padding: 32,
    minWidth: 320,
    maxWidth: 420,
    shadowColor: '#4a90e2',
    shadowOpacity: 0.18,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 8 },
    elevation: 24,
    borderWidth: 1.2,
    borderColor: 'rgba(173, 216, 255, 0.14)',
    alignSelf: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
    color: '#223a5f',
    letterSpacing: 0.2,
    fontFamily: 'System',
    textShadowColor: 'rgba(74,144,226,0.08)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  picker: {
    height: 200, // Increased for visibility
    width: '100%',
    backgroundColor: '#eee', // For debug visibility
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderWidth: 1.2,
    borderColor: '#b4c7e7',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#b4c7e7',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  cancelText: {
    color: '#5774a6',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.1,
  },
  startButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#1976d2',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#1976d2',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  startText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.1,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default NewConversationModal;
