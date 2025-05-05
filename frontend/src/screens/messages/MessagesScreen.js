import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { supabase } from '../../supabaseClient';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, globalStyles } from '../../theme';
import { AppCard, SectionHeader, EmptyState } from '../../components/ui';
import { formatDistanceToNow } from 'date-fns';

const MessagesScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      // In a real app, this would need a more sophisticated query
      // This is a simplified example
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          recipient_id,
          content,
          created_at,
          read_at,
          service_request_id,
          sender:sender_id (full_name, profile_image_url),
          recipient:recipient_id (full_name, profile_image_url)
        `)
        .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Group by conversation partner and get latest message
      const conversationMap = new Map();
      
      if (data) {
        data.forEach(message => {
          const isUserSender = message.sender_id === user?.id;
          const partnerId = isUserSender ? message.recipient_id : message.sender_id;
          const partner = isUserSender ? message.recipient : message.sender;
          
          if (!conversationMap.has(partnerId) || 
              new Date(message.created_at) > new Date(conversationMap.get(partnerId).created_at)) {
            conversationMap.set(partnerId, {
              ...message,
              partner,
              unread: !isUserSender && !message.read_at
            });
          }
        });
      }
      
      const conversationList = Array.from(conversationMap.values());
      setConversations(conversationList);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const formatMessageTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  const renderConversationCard = ({ item }) => {
    const partnerName = item.partner?.full_name || 'User';
    const partnerImage = item.partner?.profile_image_url;
    
    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate('ChatDetail', { 
          partnerId: item.partner_id,
          partnerName
        })}
        activeOpacity={0.7}
      >
        <AppCard style={styles.conversationCard} elevation="small">
          <View style={styles.avatarContainer}>
            {partnerImage ? (
              <Image source={{ uri: partnerImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{partnerName.charAt(0)}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.messageContent}>
            <View style={styles.messageHeader}>
              <Text style={styles.userName}>{partnerName}</Text>
              <Text style={styles.messageTime}>{formatMessageTime(item.created_at)}</Text>
            </View>
            
            <Text 
              style={[styles.lastMessage, item.unread && styles.unreadMessage]} 
              numberOfLines={1}
            >
              {item.content}
            </Text>
          </View>
          
          {item.unread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>1</Text>
            </View>
          )}
        </AppCard>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <SectionHeader title="Messages" />
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon="💬"
          title="No messages yet"
          description="Start a conversation by requesting or offering a service"
          buttonTitle="Browse Services"
          onButtonPress={() => navigation.navigate('Services')}
        />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 18,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    ...theme.typography.h3,
    fontSize: 16,
  },
  messageTime: {
    color: theme.colors.textTertiary,
    fontSize: 12,
  },
  lastMessage: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  unreadMessage: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  unreadBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default MessagesScreen;
