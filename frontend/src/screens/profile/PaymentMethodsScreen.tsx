import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  Animated,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, globalStyles } from '../../theme';
import { BlurView } from 'expo-blur';
import { createShadow } from '../../utils/platformUtils';
import PaymentMethodsSection from '../../components/profile/PaymentMethodsSection';
import { StackNavigationProp } from '@react-navigation/stack';

// Types for navigation
type PaymentMethodsScreenNavigationProp = StackNavigationProp<any, 'PaymentMethods'>;

interface PaymentMethodsScreenProps {
  navigation: PaymentMethodsScreenNavigationProp;
}

const PaymentMethodsScreen: React.FC<PaymentMethodsScreenProps> = ({ navigation }) => {
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0.3, 1],
    extrapolate: 'clamp',
  });

  // Handle scroll events
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    scrollY.setValue(scrollPosition);
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header - appears on scroll */}
      <Animated.View style={[styles.fixedHeader, { opacity: headerOpacity }]}>
        <View style={styles.fixedHeaderInner}>
          <BlurView intensity={80} style={styles.blurHeader} tint="light">
            <SafeAreaView style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <MaterialCommunityIcons 
                  name="arrow-left" 
                  size={24} 
                  color={theme.colors.text} 
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Payment & Transactions</Text>
              <View style={{ width: 24 }} />
            </SafeAreaView>
          </BlurView>
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Main title that shows at top initially */}
        <View style={styles.titleContainer}>
          <TouchableOpacity 
            style={styles.backButtonTop}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons 
              name="arrow-left" 
              size={24} 
              color={theme.colors.text} 
            />
          </TouchableOpacity>
          <Text style={styles.mainTitle}>Payment & Transactions</Text>
        </View>

        {/* Payment Methods Section */}
        <PaymentMethodsSection navigation={navigation} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Fixed header styles (appears on scroll)
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  fixedHeaderInner: {
    ...createShadow(theme.colors.primary, 4, 0.15, 10),
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  blurHeader: {
    overflow: 'hidden',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight || 0,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text,
    letterSpacing: 0.3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Main title that shows at top initially
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + theme.spacing.md : theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  backButtonTop: {
    marginRight: theme.spacing.sm,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 0.3,
  },
});

export default PaymentMethodsScreen;