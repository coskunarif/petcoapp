import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
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
  const [modalVisible, setModalVisible] = useState(isOpen);
  const animated = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      setModalVisible(true);
      Animated.timing(animated, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animated, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  }, [isOpen]);

  const animatedStyle = {
    opacity: animated,
    transform: [{ translateY: animated.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
  };

  if (!modalVisible) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalContent, animatedStyle]}>

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
        </Animated.View>
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
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    minWidth: 320,
    maxWidth: 420,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: 0,
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
