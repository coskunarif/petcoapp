import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';
import { Message } from './types';

interface TextMessageProps {
  message: Message;
  isMyMessage: boolean;
  timestamp: string;
}

const TextMessage: React.FC<TextMessageProps> = ({ message, isMyMessage, timestamp }) => {
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
          <Text style={[styles.timestamp, styles.myTimestamp]}>{timestamp}</Text>
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
});

export default TextMessage;