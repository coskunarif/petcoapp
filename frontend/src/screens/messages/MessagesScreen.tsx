import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  View, 
  StyleSheet, 
  SafeAreaView, 
  Animated, 
  ActivityIndicator,
  StatusBar,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import NewConversationModal from '../../components/messages/NewConversationModal';
import ConversationsList from '../../components/messages/ConversationsList';
import SearchBar from '../../components/messages/SearchBar';
import ConversationFilters from '../../components/messages/ConversationFilters';
import { theme } from '../../theme';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { selectUserId } from '../../redux/selectors';
import { fetchAllUsersExcept } from '../../api/usersApi';
import {
  fetchConversations,
  startConversation,
  setActiveConversationAction
} from '../../services/messagesService';
import { setFilters } from '../../redux/messagingSlice';

const MessagesScreen = () => {
  // Main state
  const [modalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const userId = useSelector(selectUserId);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  // Get state from Redux with defaults to prevent undefined errors
  const conversationsById = useSelector((state: any) =>
    state.messaging?.conversations?.byId || {});
  const conversationIds = useSelector((state: any) =>
    state.messaging?.conversations?.allIds || []);
  const loading = useSelector((state: any) =>
    state.messaging?.conversations?.loading || false);
  const error = useSelector((state: any) =>
    state.messaging?.conversations?.error || null);
  const filters = useSelector((state: any) => state.messaging?.filters || {
    searchTerm: '',
    showArchived: false,
    serviceRequestFilter: null
  });

  // Memoize the conversations array with role filtering
  const conversations = useMemo(() => {
    const allConversations = conversationIds.map((id: string) => conversationsById[id]);
    
    if (filters.roleFilter === 'all') {
      return allConversations;
    }
    
    // Filter based on role
    return allConversations.filter((conversation: any) => {
      // This is a placeholder - you'll need to implement the actual role determination logic
      const isOwnerConversation = conversation?.metadata?.role === 'owner';
      return filters.roleFilter === 'owner' ? isOwnerConversation : !isOwnerConversation;
    });
  }, [conversationIds, conversationsById, filters.roleFilter]);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0.3, 1],
    extrapolate: 'clamp',
  });
  const fabScale = useRef(new Animated.Value(1)).current;
  
  // Load conversations when the component mounts
  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId]);

  const loadConversations = async () => {
    try {
      await fetchConversations();
    } catch (error) {
      console.error('[MessagesScreen] Error loading conversations:', error);
    }
  };

  // Handle scroll events to trigger animations
  const handleScroll = (event: any) => {
    try {
      if (!event || !event.nativeEvent || typeof event.nativeEvent.contentOffset?.y !== 'number') {
        return;
      }
      
      const scrollPosition = event.nativeEvent.contentOffset.y;
      scrollY.setValue(scrollPosition);
    } catch (error) {
      console.error('[MessagesScreen] Error in handleScroll:', error);
    }
  };

  // Animation for FAB press
  const handleFabPressIn = () => {
    Animated.spring(fabScale, {
      toValue: 0.9,
      useNativeDriver: true,
      friction: 7,
    }).start();
  };

  const handleFabPressOut = () => {
    Animated.spring(fabScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 7,
    }).start();
  };

  // Load users for the new conversation modal
  useEffect(() => {
    if (!modalOpen || !userId) return;
    setLoadingUsers(true);
    fetchAllUsersExcept(userId)
      .then(setUsers)
      .catch((error) => {
        console.error('[MessagesScreen] Failed to fetch users:', error);
        setUsers([]);
      })
      .finally(() => setLoadingUsers(false));
  }, [modalOpen, userId]);

  // Handle search filter changes
  const handleSearchChange = (text: string) => {
    dispatch(setFilters({ searchTerm: text }));
  };

  // Handle filter changes
  const handleFilterChange = (filterType: 'showArchived' | 'serviceRequestFilter' | 'roleFilter', value: boolean | string | null) => {
    dispatch(setFilters({ [filterType]: value }));
  };

  // Start a new conversation
  const handleStartConversation = async (otherUserId: string) => {
    setModalOpen(false);
    
    try {
      const conversationId = await startConversation(otherUserId, "Hello! 👋");
      
      if (conversationId) {
        const otherUser = users.find(u => u.id === otherUserId);
        
        navigation.navigate('ChatDetail' as never, {
          conversationId,
          otherUserId,
          otherUserName: otherUser?.name || 'User'
        } as never);
      }
    } catch (error) {
      console.error('[MessagesScreen] Error starting conversation:', error);
    }
  };

  // Navigate to chat detail screen when a conversation is selected
  const handleConversationSelect = (conversation: any) => {
    setActiveConversationAction(conversation.id);
    
    navigation.navigate('ChatDetail' as never, {
      conversationId: conversation.id,
      otherUserId: conversation.otherUser.id,
      otherUserName: conversation.otherUser.name
    } as never);
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        {/* Gradient Background */}
        <LinearGradient
          colors={['rgba(236, 240, 253, 0.8)', 'rgba(252, 252, 252, 0.8)']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Fixed Header - appears on scroll */}
        <Animated.View style={[styles.fixedHeader, { opacity: headerOpacity }]}>
          <View style={styles.fixedHeaderInner}>
            <BlurView intensity={80} style={styles.blurHeader} tint="light">
              <SafeAreaView style={styles.headerContent}>
                <Text style={styles.headerTitle}>Messages</Text>
              </SafeAreaView>
            </BlurView>
          </View>
        </Animated.View>

        {/* Main Content */}
        <SafeAreaView style={styles.content}>
          {/* Header Title (visible at top, fades out on scroll) */}
          <View style={styles.headerTitleContainer}>
            <Text style={styles.mainTitle}>Messages</Text>
          </View>

          {/* Role Selector */}
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton, 
                filters.roleFilter === 'all' && styles.activeRoleButton
              ]}
              onPress={() => handleFilterChange('roleFilter', 'all')}
            >
              <Text style={[
                styles.roleText,
                filters.roleFilter === 'all' && styles.activeRoleText
              ]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton, 
                filters.roleFilter === 'owner' && styles.activeRoleButton
              ]}
              onPress={() => handleFilterChange('roleFilter', 'owner')}
            >
              <Text style={[
                styles.roleText,
                filters.roleFilter === 'owner' && styles.activeRoleText
              ]}>As Pet Owner</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton, 
                filters.roleFilter === 'provider' && styles.activeRoleButton
              ]}
              onPress={() => handleFilterChange('roleFilter', 'provider')}
            >
              <Text style={[
                styles.roleText,
                filters.roleFilter === 'provider' && styles.activeRoleText
              ]}>As Provider</Text>
            </TouchableOpacity>
          </View>

          {/* SearchBar */}
          <View style={styles.searchFilterContainer}>
            <SearchBar value={filters.searchTerm} onChangeText={handleSearchChange} />
          </View>

          {/* Conversations List */}
          <ConversationsList 
            conversations={conversations}
            loading={loading}
            error={error}
            onScroll={handleScroll}
            onRefresh={loadConversations}
            onSelect={handleConversationSelect}
            filters={filters}
          />
        </SafeAreaView>

        {/* Loading Indicator for User Fetch */}
        {modalOpen && loadingUsers && (
          <View style={styles.loadingContainer}>
            <BlurView intensity={70} style={styles.loadingBlur} tint="light">
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading users...</Text>
            </BlurView>
          </View>
        )}

        {/* FAB */}
        <Animated.View 
          style={[
            styles.fabContainer, 
            { transform: [{ scale: fabScale }] }
          ]}
        >
          <TouchableOpacity
            style={styles.fab}
            accessibilityLabel="Start new conversation"
            onPress={() => setModalOpen(true)}
            onPressIn={handleFabPressIn}
            onPressOut={handleFabPressOut}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.fabGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons 
                name="chat-plus-outline" 
                size={24} 
                color="#fff" 
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* New Conversation Modal */}
        <NewConversationModal
          users={users}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onStartConversation={handleStartConversation}
        />
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  // Fixed header styles (appears on scroll)
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  fixedHeaderInner: {
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  blurHeader: {
    overflow: 'hidden',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight || 0,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text,
    letterSpacing: 0.3,
  },
  // Main title that shows at top initially
  headerTitleContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 0.3,
  },
  // Role selector
  roleContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  roleButton: {
    marginRight: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeRoleButton: {
    backgroundColor: theme.colors.primary,
  },
  roleText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  activeRoleText: {
    color: 'white',
  },
  // Container for search
  searchFilterContainer: {
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  // Loading indicator
  loadingContainer: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    zIndex: 2000,
  },
  loadingBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  loadingText: {
    marginLeft: 8,
    color: theme.colors.text,
    fontWeight: '600',
  },
  // FAB styles
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    zIndex: 1001,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fab: {
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MessagesScreen;