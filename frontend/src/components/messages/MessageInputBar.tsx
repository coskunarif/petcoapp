import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Animated
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

interface MessageInputBarProps {
  onSend: () => void;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

const MessageInputBar: React.FC<MessageInputBarProps> = ({
  onSend,
  value,
  onChangeText,
  placeholder = 'Type a message...',
  isLoading = false
}) => {
  const [height, setHeight] = useState(40);
  const [isFocused, setIsFocused] = useState(false);
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);

  // Animate send button on press
  const handlePressIn = () => {
    Animated.spring(sendButtonScale, {
      toValue: 0.9,
      useNativeDriver: true,
      friction: 7,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(sendButtonScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 7,
    }).start();
  };

  // Handle sending message
  const handleSend = () => {
    if (value.trim().length > 0 && !isLoading) {
      onSend();
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Determine if send button should be disabled
  const isDisabled = value.trim().length === 0 || isLoading;

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <View style={styles.inputContainer}>
          {/* Input area */}
          <View style={[styles.textInputContainer, isFocused && styles.textInputFocused]}>
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                { height: Math.max(40, height) }
              ]}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              maxLength={500}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onContentSizeChange={(e) => {
                const contentHeight = e.nativeEvent.contentSize.height;
                // Cap the input height to prevent it from growing too tall
                setHeight(Math.min(contentHeight, 120));
              }}
            />

            {/* Show attachment button */}
            <TouchableOpacity style={styles.iconButton}>
              <MaterialCommunityIcons
                name="paperclip"
                size={22}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Send button */}
          <Animated.View
            style={[
              styles.sendButtonContainer,
              { transform: [{ scale: sendButtonScale }] },
              isDisabled && styles.sendButtonDisabled
            ]}
          >
            <TouchableOpacity
              onPress={handleSend}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={isDisabled}
              style={styles.sendButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.sendButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialCommunityIcons name="send" size={20} color="#fff" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  blurContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(248, 248, 255, 0.8)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
    paddingHorizontal: 12,
    marginRight: 8,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  textInputFocused: {
    borderColor: 'rgba(108, 99, 255, 0.5)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    maxHeight: 120,
    alignSelf: 'center',
  },
  iconButton: {
    marginLeft: 4,
    padding: 6,
    alignSelf: 'flex-end',
    marginBottom: Platform.OS === 'ios' ? 10 : 6,
  },
  sendButtonContainer: {
    width: 46,
    height: 46,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MessageInputBar;