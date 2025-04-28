import React, { useState } from 'react';
import AnimatedServiceCard from './AnimatedServiceCard';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

// Mock data for services
const SERVICES = [
  {
    id: '1',
    name: 'Dog Walking',
    description: 'Daily walks for your furry friends.',
    icon: 'dog',
    color: '#7FBCFF',
  },
  {
    id: '2',
    name: 'Grooming',
    description: 'Professional grooming and spa.',
    icon: 'scissors-cutting',
    color: '#FFB6B9',
  },
  {
    id: '3',
    name: 'Vet Visit',
    description: 'Book a checkup with our vets.',
    icon: 'stethoscope',
    color: '#B5FFFC',
  },
  {
    id: '4',
    name: 'Pet Boarding',
    description: 'Safe overnight stays for pets.',
    icon: 'home-heart',
    color: '#B9FFB7',
  },
];

export default function ServiceListScreen() {
  const [search, setSearch] = useState('');
  const filteredServices = SERVICES.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderService = ({ item, index }) => (
    <AnimatedServiceCard item={item} index={index} styles={styles} />
  );

  return (
    <View style={styles.container}>
      {/* Glassmorphism or gradient background */}
      <View style={StyleSheet.absoluteFill}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={Platform.OS === 'ios' ? 'ultraThinMaterial' : 'light'}
          blurAmount={18}
          reducedTransparencyFallbackColor="#EAF6FF"
        />
        <View style={styles.gradientOverlay} />
      </View>

      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Our Services</Text>
        <Icon name="tune-variant" size={28} color="#3A3A3A" style={{ opacity: 0.7 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Icon name="magnify" size={22} color="#888" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
          placeholderTextColor="#B0B0B0"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Services List */}
      <FlatList
        data={filteredServices}
        renderItem={renderService}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'rgba(240,245,255,0.9)',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'linear-gradient(135deg, rgba(127,188,255,0.15) 0%, rgba(255,182,185,0.12) 100%)',
    // fallback for Android, since linear-gradient is not supported natively
    background: Platform.OS === 'android' ? undefined : undefined,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#222',
    letterSpacing: 0.5,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 18,
    marginHorizontal: 20,
    marginBottom: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: '#222',
    fontWeight: '500',
    letterSpacing: 0.2,
    backgroundColor: 'transparent',
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 28, // More refined, smoother corners
    paddingVertical: 22, // Improved vertical spacing
    paddingHorizontal: 22, // Improved horizontal spacing
    shadowColor: '#1A244066', // Subtle blue-gray shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 8, // Slightly more pronounced shadow for depth
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    backgroundColor: '#7FBCFF33',
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6, // More breathing room below title
  },
  cardDesc: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
    opacity: 0.87,
    marginBottom: 2, // Slightly more space below description
  },
  cardAction: {
    marginLeft: 12,
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(240,245,255,0.7)',
  },
  fab: {
    position: 'absolute',
    bottom: 36,
    right: 28,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7FBCFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7FBCFF',
    shadowOpacity: 0.23,
    shadowRadius: 12,
    elevation: 8,
  },
});
