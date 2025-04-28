import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function ProfileHeader({ user, onEditProfile }) {
  return (
    <View style={styles.cardWrap}>
      <View style={styles.card}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
        </View>
        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
        <TouchableOpacity style={styles.editButton} onPress={onEditProfile} accessibilityLabel="Edit Profile">
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#7B61FF15', // soft purple background, 8% opacity
    borderRadius: 28,
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
    width: '92%',
    shadowColor: '#7B61FF',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
  },
  avatarWrap: {
    position: 'absolute',
    top: -36,
    left: '50%',
    marginLeft: -36,
    zIndex: 2,
    backgroundColor: '#fff',
    borderRadius: 40,
    padding: 4,
    shadowColor: '#7B61FF',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#e0e0e0',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 18,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  bio: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
    marginBottom: 8,
  },
  editButton: {
    marginTop: 8,
    paddingHorizontal: 22,
    paddingVertical: 9,
    backgroundColor: '#7B61FF',
    borderRadius: 22,
    shadowColor: '#7B61FF',
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 2,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
