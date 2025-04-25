import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import NewConversationModal from '../../components/messages/NewConversationModal';
import ConversationsList from '../../components/messages/ConversationsList';
import SearchBar from '../../components/messages/SearchBar';
import ConversationFilters from '../../components/messages/ConversationFilters';

import { useSelector } from 'react-redux';
import { selectUserId } from '../../redux/selectors';
import { fetchAllUsersExcept } from '../../api/usersApi';
import { useEffect } from 'react';

const MessagesScreen = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const userId = useSelector(selectUserId);

  useEffect(() => {
    if (!modalOpen || !userId) return;
    setLoadingUsers(true);
    fetchAllUsersExcept(userId)
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false));
  }, [modalOpen, userId]);

  const handleStartConversation = (otherUserId: string) => {
    setModalOpen(false);
    // TODO: Implement actual conversation creation and navigation
    alert('Start conversation with user ID: ' + otherUserId);
  };
  return (
    <>
      <NewConversationModal
        users={users}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onStartConversation={handleStartConversation}
      />
      {modalOpen && loadingUsers && (
        <View style={{ position: 'absolute', top: 120, left: 0, right: 0, alignItems: 'center', zIndex: 2000 }}>
          <Text style={{ backgroundColor: '#fff', padding: 8, borderRadius: 8 }}>Loading users...</Text>
        </View>
      )}
      <SearchBar />
      <ConversationFilters />
      <ConversationsList />
      <TouchableOpacity
        style={styles.fab}
        accessibilityLabel="Start new conversation"
        onPress={() => setModalOpen(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: '#1976d2',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1001,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 36,
  },
});

export default MessagesScreen;
