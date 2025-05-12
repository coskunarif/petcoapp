import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Message } from './types';

interface ImageMessageProps {
  message: Message;
  isMyMessage: boolean;
}

const ImageMessage: React.FC<ImageMessageProps> = ({ message, isMyMessage }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <View
      style={[
        styles.container,
        isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
      ]}
    >
      <View style={styles.messageWrapper}>
        <View 
          style={[
            styles.messageBubble, 
            isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble
          ]}
        >
          {message.imageUrl ? (
            <>
              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={isMyMessage ? "#fff" : theme.colors.primary} />
                </View>
              )}
              
              {error ? (
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons 
                    name="image-off" 
                    size={24} 
                    color={isMyMessage ? "#fff" : theme.colors.textSecondary} 
                  />
                  <Text 
                    style={[
                      styles.errorText,
                      isMyMessage && styles.myMessageText
                    ]}
                  >
                    Image could not be loaded
                  </Text>
                </View>
              ) : (
                <Image
                  source={{ uri: message.imageUrl }}
                  style={styles.image}
                  onLoad={handleLoad}
                  onError={handleError}
                  resizeMode="cover"
                />
              )}
              
              {message.content && (
                <Text 
                  style={[
                    styles.caption,
                    isMyMessage ? styles.myMessageText : styles.theirMessageText
                  ]}
                >
                  {message.content}
                </Text>
              )}
            </>
          ) : (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons 
                name="image-off" 
                size={24} 
                color={isMyMessage ? "#fff" : theme.colors.textSecondary} 
              />
              <Text 
                style={[
                  styles.errorText,
                  isMyMessage && styles.myMessageText
                ]}
              >
                Image not available
              </Text>
            </View>
          )}
        </View>
        
        <Text 
          style={[
            styles.timestamp,
            isMyMessage ? styles.myTimestamp : styles.theirTimestamp
          ]}
        >
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageWrapper: {
    flexDirection: 'column',
  },
  messageBubble: {
    borderRadius: 18,
    padding: 4,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  myMessageBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 14,
  },
  caption: {
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    marginHorizontal: 2,
  },
  myTimestamp: {
    color: theme.colors.textTertiary,
    alignSelf: 'flex-end',
  },
  theirTimestamp: {
    color: theme.colors.textTertiary,
    alignSelf: 'flex-start',
  },
  loadingContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 14,
  },
  errorContainer: {
    width: 200,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 14,
    padding: 16,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
});

export default ImageMessage;