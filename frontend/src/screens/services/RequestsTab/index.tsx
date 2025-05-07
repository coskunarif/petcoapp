import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Text,
  Platform,
  SafeAreaView
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RequestsFilterToggle from './RequestsFilterToggle';
import RequestsList from './RequestsList';
import { theme } from '../../../theme';

interface RequestsTabProps {
  onScroll?: (event: any) => void;
}

export default function RequestsTab({ onScroll }: RequestsTabProps) {
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const handleScroll = (event: any) => {
    // Make sure we have a valid event
    if (!event || !event.nativeEvent || typeof event.nativeEvent.contentOffset?.y !== 'number') {
      console.warn('[RequestsTab] Invalid scroll event:', event);
      return;
    }
  
    // Update our local animation value
    const scrollPosition = event.nativeEvent.contentOffset.y;
    // Just set the value directly
    // We can't access the current value of scrollY directly since _value and __getValue are not recommended
    scrollY.setValue(scrollPosition);
    
    // Simply pass the event through to parent if needed
    if (onScroll) {
      onScroll(event);
    }
  };
  
  // Calculate header animation values
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  
  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.headerContainer,
        { opacity: headerOpacity }
      ]}
    >
      <BlurView intensity={10} tint="light" style={styles.headerBlur}>
        <LinearGradient
          colors={['rgba(108, 99, 255, 0.12)', 'rgba(108, 99, 255, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Service Requests</Text>
          <Text style={styles.headerSubtitle}>Track and manage your service requests</Text>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
  
  return (
    <View style={styles.container}>
      {/* Animated Header */}
      {renderHeader()}
      
      {/* Filter Toggle */}
      <RequestsFilterToggle />
      
      {/* Request List */}
      <RequestsList onScroll={handleScroll} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  headerContainer: {
    height: 120,
    overflow: 'hidden',
  },
  headerBlur: {
    flex: 1,
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerGradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
});
