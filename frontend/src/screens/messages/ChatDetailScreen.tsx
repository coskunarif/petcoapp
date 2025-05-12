import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  BackHandler
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'react-native';

import TextMessage from '../../components/messages/TextMessage';
import ImageMessage from '../../components/messages/ImageMessage';
import ServiceRequestMessage from '../../components/messages/ServiceRequestMessage';
import SystemMessage from '../../components/messages/SystemMessage';
import MessageInputBar from '../../components/messages/MessageInputBar';
import { theme } from '../../theme';
import { ChatDetailScreenProps, Message } from '../../components/messages/types';
import { fetchMessages, sendMessage, setupMessageSubscription } from '../../services/messagesService';
import { addMessage } from '../../redux/messagingSlice';

const ChatDetailScreen = ({ route, navigation }: ChatDetailScreenProps) => {
  const { conversationId, otherUserId, otherUserName } = route.params;
  const userId = useSelector((state: any) => state.auth.user?.id);
  const messages = useSelector((state: any) => state.messaging.activeConversation.messages);
  const loading = useSelector((state: any) => state.messaging.activeConversation.loading);
  const error = useSelector((state: any) => state.messaging.activeConversation.error);
  
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const dispatch = useDispatch();
  const messageSubscription = useRef<any>(null);

  // Handle back button press on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  // Animation for header
  const headerHeight = headerOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 70], // Adjust as needed
  });

  // Fetch messages and set up subscription
  useEffect(() => {
    const loadMessages = async () => {
      try {
        await fetchMessages(conversationId);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    loadMessages();

    // Set up real-time subscription
    if (userId) {
      messageSubscription.current = setupMessageSubscription(otherUserId, (newMessage) => {
        dispatch(addMessage(newMessage));
      });
    }

    return () => {
      if (messageSubscription.current) {
        messageSubscription.current.unsubscribe();
      }
    };
  }, [conversationId, otherUserId, userId, dispatch]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [messages.length]);

  // Add a message to the local UI immediately for better UX
  const addLocalMessage = (text: string) => {
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: userId || '',
      content: text,
      type: 'text',
      createdAt: new Date().toISOString(),
      conversationId
    };
    dispatch(addMessage(tempMessage));
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText) return;

    try {
      // Clear input and show sending state
      setIsSending(true);
      setInputText('');

      // Add message to UI immediately for better UX
      addLocalMessage(trimmedText);

      console.log('[ChatDetailScreen] Sending message to:', otherUserId);
      const result = await sendMessage(otherUserId, trimmedText);

      if (result) {
        console.log('[ChatDetailScreen] Message sent successfully:', result.id);
      } else {
        console.error('[ChatDetailScreen] Message sending returned null');
        // Message already added to UI above
      }
    } catch (err) {
      console.error('[ChatDetailScreen] Error sending message:', err);
      // Show error message to user or retry logic could be added here
    } finally {
      setIsSending(false);
    }
  };

  // Format message timestamp
  const formatMessageTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  // Render different message types
  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === userId;

    switch (item.type) {
      case 'image':
        return <ImageMessage message={item} isMyMessage={isMyMessage} />;
      case 'service':
        return <ServiceRequestMessage message={item} isMyMessage={isMyMessage} />;
      case 'system':
        return <SystemMessage message={item} />;
      case 'text':
      default:
        return (
          <TextMessage 
            message={item} 
            isMyMessage={isMyMessage} 
            timestamp={formatMessageTime(item.createdAt)} 
          />
        );
    }
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.loadingGradient}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.loadingHeaderTitle}>{otherUserName}</Text>
        </LinearGradient>
        
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.errorHeader}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.errorHeaderTitle}>{otherUserName}</Text>
        </LinearGradient>
        
        <View style={styles.errorContent}>
          <MaterialCommunityIcons name="alert-circle-outline" size={60} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchMessages(conversationId)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 30}
    >
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent />
      
      {/* Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.headerProfile}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{otherUserName.charAt(0)}</Text>
              </View>
              <Text style={styles.headerName}>{otherUserName}</Text>
            </View>
            
            <TouchableOpacity style={styles.menuButton}>
              <MaterialCommunityIcons name="dots-vertical" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
      
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const scrollY = event.nativeEvent.contentOffset.y;
          // Hide header when scrolling down through messages
          Animated.timing(headerOpacity, {
            toValue: scrollY < 50 ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
          }).start();
        }}
      />
      
      {/* Input Bar */}
      <MessageInputBar 
        onSend={handleSendMessage}
        value={inputText}
        onChangeText={setInputText}
        isLoading={isSending}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Header styles
  header: {
    width: '100%',
    overflow: 'hidden',
  },
  headerGradient: {
    width: '100%',
    height: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  // Messages list
  messagesList: {
    padding: 16,
    paddingTop: 8,
  },
  // Loading state
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingGradient: {
    height: Platform.OS === 'ios' ? 110 : 80,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingHeaderTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 16,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  // Error state
  errorContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  errorHeader: {
    height: Platform.OS === 'ios' ? 110 : 80,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorHeaderTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 16,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ChatDetailScreen;