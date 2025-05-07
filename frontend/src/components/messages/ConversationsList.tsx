import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Animated, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet,
  RefreshControl
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import ConversationCard from './ConversationCard';
import EmptyConversationsState from './EmptyConversationsState';
import { theme } from '../../theme';
import { Conversation } from './types';

// Example conversation data for development
const EXAMPLE_CONVERSATIONS = [
  {
    id: '1',
    otherUser: { id: 'user1', name: 'John Smith' },
    lastMessage: 'How\'s the dog doing today?',
    lastMessageTime: '10:30 AM',
    unread: true,
    type: 'pet_sitting',
    icon: 'dog',
    color: '#6C63FF',
  },
  {
    id: '2',
    otherUser: { id: 'user2', name: 'Emma Wilson' },
    lastMessage: 'I\'ll bring the treats next time',
    lastMessageTime: 'Yesterday',
    unread: false,
    type: 'grooming',
    icon: 'scissors-cutting',
    color: '#48C6EF',
  },
  {
    id: '3',
    otherUser: { id: 'user3', name: 'Michael Chen' },
    lastMessage: 'Your dog is so well-behaved!',
    lastMessageTime: '2 days ago',
    unread: false, 
    type: 'walking',
    icon: 'walk',
    color: '#FFA726',
  }
];


interface ConversationsListProps {
  onScroll?: (event: { nativeEvent: { contentOffset: { y: number } } }) => void;
}

const ConversationsList = ({ onScroll }: ConversationsListProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [conversations, setConversationsState] = useState<Conversation[]>(EXAMPLE_CONVERSATIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Note: We're using a regular FlatList instead of an animated one for simplicity
  
  // For development purposes: simulate loading and fetching
  const onRefresh = async () => {
    try {
      setIsRefreshing(true);
      // Simulate a network request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Randomize if we show the empty state (20% chance)
      const shouldShowEmpty = Math.random() < 0.2;
      
      if (shouldShowEmpty) {
        setConversationsState([]);
      } else {
        // Shuffle the example conversations
        setConversationsState([...EXAMPLE_CONVERSATIONS].sort(() => Math.random() - 0.5));
      }
      
    } catch (err) {
      console.error('[ConversationsList] Error refreshing: ', err);
      setError('Could not refresh conversations');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // In a real app, we'd fetch conversations from an API
  useEffect(() => {
    async function loadConversations() {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For development: show conversations 80% of the time, empty state 20%
        const shouldShowEmpty = Math.random() < 0.2;
        
        if (shouldShowEmpty) {
          setConversationsState([]);
        } else {
          setConversationsState(EXAMPLE_CONVERSATIONS);
        }
      } catch (err) {
        console.error('[ConversationsList] Error loading: ', err);
        setError('Could not load conversations');
      } finally {
        setLoading(false);
      }
    }
    
    loadConversations();
  }, []);
  
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
  if (loading) {
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
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>Pull down to try again</Text>
        </BlurView>
      </View>
    );
  }
  
  // Display empty state if no conversations
  if (conversations.length === 0) {
    return <EmptyConversationsState />;
  }
  
  // Display conversations list
  return (
    <FlatList
      data={conversations}
      keyExtractor={(item: Conversation) => item.id}
      renderItem={({ item, index }) => (
        <ConversationCard 
          conversation={item} 
          index={index}
        />
      )}
      contentContainerStyle={styles.listContent}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
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
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  errorSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default ConversationsList;
