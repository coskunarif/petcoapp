import React, { useEffect, useState, useRef } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

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
  const [searchText, setSearchText] = useState('');
  const animated = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

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
      }).start(() => {
        setModalVisible(false);
        setSelectedUserId('');
        setSearchText('');
      });
    }
  }, [isOpen]);

  const handleStartPress = () => {
    if (selectedUserId) {
      onStartConversation(selectedUserId);
    }
  };
  
  // Button press animations
  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  // Filter users based on search text
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchText.toLowerCase())
  );

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
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        
        <Animated.View style={[styles.modalContainer, animatedStyle]}>
          <BlurView intensity={85} tint="light" style={styles.modalBlur}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>New Conversation</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            
            {/* Search bar */}
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color={theme.colors.textTertiary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search users..."
                placeholderTextColor={theme.colors.textTertiary}
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText !== '' && (
                <TouchableOpacity 
                  onPress={() => setSearchText('')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={18}
                    color={theme.colors.textTertiary}
                  />
                </TouchableOpacity>
              )}
            </View>
            
            {/* User list */}
            {users.length === 0 ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.emptyText}>Loading users...</Text>
              </View>
            ) : filteredUsers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="account-search-outline"
                  size={32}
                  color={theme.colors.textTertiary}
                />
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            ) : (
              <ScrollView 
                style={styles.userList}
                contentContainerStyle={styles.userListContent}
                showsVerticalScrollIndicator={false}
              >
                {filteredUsers.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={[
                      styles.userItem,
                      selectedUserId === user.id && styles.selectedUserItem
                    ]}
                    onPress={() => setSelectedUserId(user.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.userAvatar}>
                      <LinearGradient
                        colors={[`${theme.colors.primary}40`, `${theme.colors.primary}10`]}
                        style={styles.avatarGradient}
                      >
                        <Text style={styles.avatarText}>
                          {user.name.charAt(0).toUpperCase()}
                        </Text>
                      </LinearGradient>
                    </View>
                    <Text style={styles.userName}>{user.name}</Text>
                    
                    {selectedUserId === user.id && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={22}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            
            {/* Action buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <Animated.View style={[
                styles.startButtonContainer,
                { transform: [{ scale: buttonScale }] }
              ]}>
                <TouchableOpacity
                  disabled={!selectedUserId}
                  onPress={handleStartPress}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  style={[
                    styles.startButton,
                    !selectedUserId && styles.disabledButton
                  ]}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryDark]}
                    style={styles.startButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.startText}>Start Conversation</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(24,38,63,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '80%',
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 0.2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    borderRadius: 16,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    padding: 0,
    marginRight: theme.spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  userList: {
    maxHeight: 300,
    marginHorizontal: theme.spacing.lg,
  },
  userListContent: {
    paddingBottom: theme.spacing.md,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  selectedUserItem: {
    backgroundColor: `${theme.colors.primary}10`,
    borderColor: `${theme.colors.primary}40`,
  },
  userAvatar: {
    marginRight: 12,
  },
  avatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  userName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    marginTop: theme.spacing.sm,
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    minWidth: 100,
  },
  cancelText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 15,
  },
  startButtonContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...theme.elevation.small,
  },
  startButton: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  startButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },
});

export default NewConversationModal;
