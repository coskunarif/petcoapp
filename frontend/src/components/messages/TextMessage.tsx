import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Message } from './types';

interface TextMessageProps {
  message: Message;
  isMyMessage: boolean;
  timestamp: string;
}

const TextMessage: React.FC<TextMessageProps> = ({ message, isMyMessage, timestamp }) => {
  // Render message status indicator for my messages only
  const renderStatusIndicator = () => {
    if (!isMyMessage) return null;
    
    let iconName = '';
    let color = '';
    
    switch (message.status) {
      case 'sending':
        iconName = 'clock-outline';
        color = '#9e9e9e';
        break;
      case 'sent':
        iconName = 'check';
        color = '#9e9e9e';
        break;
      case 'delivered':
        iconName = 'check-all';
        color = '#9e9e9e';
        break;
      case 'read':
        iconName = 'check-all';
        color = '#4fc3f7';
        break;
      case 'error':
        iconName = 'alert-circle-outline';
        color = '#f44336';
        break;
      default:
        // Default status when not specified
        iconName = 'check';
        color = '#9e9e9e';
    }
    
    return (
      <View style={styles.statusContainer}>
        <MaterialCommunityIcons name={iconName} size={14} color={color} />
      </View>
    );
  };
  
  return (
    <View
      style={[
        styles.container,
        isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
      ]}
    >
      {isMyMessage ? (
        <View style={styles.messageWrapper}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={[styles.messageBubble, styles.myMessageBubble]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.messageText, styles.myMessageText]}>
              {message.content}
            </Text>
          </LinearGradient>
          <View style={styles.messageFooter}>
            {renderStatusIndicator()}
            <Text style={[styles.timestamp, styles.myTimestamp]}>{timestamp}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.messageWrapper}>
          <View style={[styles.messageBubble, styles.theirMessageBubble]}>
            <Text style={[styles.messageText, styles.theirMessageText]}>
              {message.content}
            </Text>
          </View>
          <Text style={[styles.timestamp, styles.theirTimestamp]}>{timestamp}</Text>
        </View>
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: theme.colors.text,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    marginHorizontal: 2,
  },
  statusContainer: {
    marginRight: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  myTimestamp: {
    color: theme.colors.textTertiary,
  },
  theirTimestamp: {
    color: theme.colors.textTertiary,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
});

export default TextMessage;