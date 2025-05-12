import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Animated, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ConversationCard from './ConversationCard';
import EmptyConversationsState from './EmptyConversationsState';
import { theme } from '../../theme';
import { Conversation } from './types';

interface ConversationsListProps {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  filters: {
    searchTerm: string;
    showArchived: boolean;
    serviceRequestFilter: string | null;
  };
  onScroll?: (event: { nativeEvent: { contentOffset: { y: number } } }) => void;
  onRefresh?: () => void;
  onSelect?: (conversation: Conversation) => void;
}

const ConversationsList = ({ 
  conversations = [], 
  loading = false, 
  error = null,
  filters = { searchTerm: '', showArchived: false, serviceRequestFilter: null },
  onScroll, 
  onRefresh,
  onSelect
}: ConversationsListProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filter conversations
  const filteredConversations = conversations.filter(conversation => {
    // Filter by search term
    if (filters.searchTerm && !conversation.otherUser.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by service type
    if (filters.serviceRequestFilter && conversation.type !== filters.serviceRequestFilter) {
      return false;
    }
    
    // Filter by archived status (not implemented yet)
    if (filters.showArchived) {
      // Show both archived and non-archived
      return true;
    } else {
      // Only show non-archived
      return !conversation.archived;
    }
  });
  
  // Pull to refresh
  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    try {
      setIsRefreshing(true);
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Handle selecting a conversation
  const handleSelectConversation = (conversation: Conversation) => {
    if (onSelect) {
      onSelect(conversation);
    }
  };
  
  // Handle scroll events to enable animations in parent components
  const handleScroll = (event: any) => {
    // Make sure we have a valid event with content offset
    if (!event || !event.nativeEvent || typeof event.nativeEvent.contentOffset?.y !== 'number') {
      console.warn('[ConversationsList] Invalid scroll event:', event);
      return;
    }
    
    // Simply propagate the scroll event to the parent component
    if (onScroll) {
      onScroll(event);
    }
  };
  
  // Display loading state
  if (loading && !isRefreshing && filteredConversations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }
  
  // Display error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <BlurView intensity={60} style={styles.errorBlur} tint="light">
          <MaterialCommunityIcons 
            name="alert-circle-outline" 
            size={36} 
            color={theme.colors.error} 
          />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>Pull down to try again</Text>
          
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRefresh}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    );
  }
  
  // Display empty state if no conversations
  if (filteredConversations.length === 0) {
    // Different empty state messaging based on filters
    let emptyMessage = "No conversations yet";
    if (filters.searchTerm) {
      emptyMessage = `No conversations found for "${filters.searchTerm}"`;
    } else if (filters.serviceRequestFilter) {
      emptyMessage = `No ${filters.serviceRequestFilter} conversations found`;
    }
    
    return (
      <EmptyConversationsState
        message={emptyMessage}
        // Don't pass onStartConversation to hide the button - we'll use only the FAB
      />
    );
  }
  
  // Display conversations list
  return (
    <FlatList
      data={filteredConversations}
      keyExtractor={(item: Conversation) => item.id}
      renderItem={({ item, index }) => (
        <ConversationCard 
          conversation={item} 
          index={index}
          onPress={() => handleSelectConversation(item)}
        />
      )}
      contentContainerStyle={styles.listContent}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
          progressBackgroundColor="#ffffff"
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: 100, // Extra padding at bottom to account for FAB
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  errorBlur: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
    width: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  errorSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginTop: theme.spacing.sm,
  },
  retryText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
  }
});

export default ConversationsList;