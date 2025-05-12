import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Conversation } from './types';

interface ConversationCardProps {
  conversation: Conversation;
  index?: number; // For staggered animation
  onPress?: () => void; // Added press handler
}

const ConversationCard = ({ conversation, index = 0, onPress }: ConversationCardProps) => {
  // Animation values
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Entrance animation with staggered effect
  useEffect(() => {
    const delay = index * 100; // Stagger based on index
    
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 450,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle press animations
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  // Platform-specific shadow styles
  const cardShadow = Platform.select({
    ios: {
      shadowColor: conversation.color || theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: conversation.unreadCount > 0 ? 0.2 : 0.1,
      shadowRadius: 12,
    },
    android: {
      elevation: conversation.unreadCount > 0 ? 4 : 2,
    },
    default: {},
  });
  
  return (
    <View style={[styles.cardOuterContainer, cardShadow]}>
      <Animated.View
        style={[
          styles.cardAnimatedContainer,
          {
            opacity,
            transform: [
              { translateY },
              { scale },
            ],
          }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          style={styles.cardTouchable}
        >
          <BlurView intensity={85} tint="light" style={styles.cardBlur}>
            {/* Left colored indicator for unread messages */}
            {conversation.unreadCount > 0 && (
              <View 
                style={[
                  styles.unreadIndicator, 
                  { backgroundColor: conversation.color || theme.colors.primary }
                ]} 
              />
            )}
            
            <View style={styles.cardContent}>
              {/* Left side - Icon with service type */}
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={[`${conversation.color || theme.colors.primary}40`, `${conversation.color || theme.colors.primary}15`]}
                  style={styles.iconBackground}
                >
                  <MaterialCommunityIcons
                    name={conversation.icon as any || 'chat'}
                    size={20}
                    color={conversation.color || theme.colors.primary}
                  />
                </LinearGradient>
              </View>

              {/* Middle - User name and message */}
              <View style={styles.messageContainer}>
                <View style={styles.nameTimeRow}>
                  <Text 
                    style={[
                      styles.userName,
                      conversation.unreadCount > 0 && styles.unreadText
                    ]}
                    numberOfLines={1}
                  >
                    {conversation.otherUser.name}
                  </Text>
                  <Text style={styles.timeText}>{conversation.lastMessageTime}</Text>
                </View>
                <Text 
                  style={[
                    styles.messageText,
                    conversation.unreadCount > 0 && styles.unreadText
                  ]}
                  numberOfLines={1}
                >
                  {conversation.lastMessage}
                </Text>
              </View>

              {/* Right side - Unread count or chevron */}
              <View style={styles.chevronContainer}>
                {conversation.unreadCount > 0 ? (
                  <View style={[styles.unreadBadge, { backgroundColor: conversation.color || theme.colors.primary }]}>
                    <Text style={styles.unreadBadgeText}>
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </Text>
                  </View>
                ) : (
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={theme.colors.textTertiary}
                  />
                )}
              </View>
            </View>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardOuterContainer: {
    marginVertical: 8,
    borderRadius: 18,
  },
  cardAnimatedContainer: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardTouchable: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardBlur: {
    overflow: 'hidden',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  unreadIndicator: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    width: 3,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconBackground: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    flex: 1,
    marginRight: 8,
  },
  nameTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginLeft: 8,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },
  unreadText: {
    fontWeight: '700',
    color: theme.colors.text,
  },
  chevronContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    padding: 3,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default ConversationCard;