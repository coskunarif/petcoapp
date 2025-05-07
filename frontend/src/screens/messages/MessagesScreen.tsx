import React, { useState, useRef } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  View, 
  StyleSheet, 
  SafeAreaView, 
  Animated, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import NewConversationModal from '../../components/messages/NewConversationModal';
import ConversationsList from '../../components/messages/ConversationsList';
import SearchBar from '../../components/messages/SearchBar';
import ConversationFilters from '../../components/messages/ConversationFilters';
import { theme, globalStyles } from '../../theme';
import { ErrorBoundary } from '../../components/ErrorBoundary';

import { useSelector } from 'react-redux';
import { selectUserId } from '../../redux/selectors';
import { fetchAllUsersExcept } from '../../api/usersApi';
import { useEffect } from 'react';

const MessagesScreen = () => {
  // Main state
  const [modalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const userId = useSelector(selectUserId);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(1)).current;
  
  // Calculate header opacity based on scroll position
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0.3, 1],
    extrapolate: 'clamp',
  });

  // Handle scroll events to trigger animations
  const handleScroll = (event: any) => {
    try {
      // Avoid crashes if we get an invalid event
      if (!event || !event.nativeEvent || typeof event.nativeEvent.contentOffset?.y !== 'number') {
        console.warn('[MessagesScreen] Invalid scroll event received');
        return;
      }
      
      const scrollPosition = event.nativeEvent.contentOffset.y;
      
      // Just set the value directly - no comparison needed
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

  const handleStartConversation = (otherUserId: string) => {
    setModalOpen(false);
    // TODO: Implement actual conversation creation and navigation
    alert('Start conversation with user ID: ' + otherUserId);
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
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={() => console.log('Settings pressed')}
                >
                  <MaterialCommunityIcons 
                    name="cog-outline" 
                    size={22} 
                    color={theme.colors.text} 
                  />
                </TouchableOpacity>
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

          {/* SearchBar and Filters */}
          <View style={styles.searchFilterContainer}>
            <SearchBar />
            <ConversationFilters />
          </View>

          {/* Conversations List */}
          <ConversationsList onScroll={handleScroll} />
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
    ...theme.elevation.medium,
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
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
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
  // Container for search and filters
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
    ...theme.elevation.small,
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
    ...theme.elevation.large,
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
  fabText: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 36,
  },
});

export default MessagesScreen;
