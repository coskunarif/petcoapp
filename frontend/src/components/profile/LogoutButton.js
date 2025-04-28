import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

export default function LogoutButton({ onLogout }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && { backgroundColor: '#c62828', transform: [{ scale: 0.97 }], opacity: 0.85 },
      ]}
      onPress={onLogout}
      accessibilityLabel="Sign out"
    >
      <Text style={styles.buttonText}>Sign Out</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    margin: 24,
    paddingVertical: 14,
    backgroundColor: '#e53935',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
