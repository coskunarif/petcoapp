import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { theme } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface Props {
  balance: number;
  onPress: () => void;
  isLoading?: boolean;
}

const CreditBalanceCard: React.FC<Props> = ({ balance, onPress, isLoading = false }) => {
  // Get loading state from Redux instead of prop (more reliable)
  const loading = useSelector((state: RootState) => state.home.loading);
  const storeBalance = useSelector((state: RootState) => state.home.userCredits);
  
  // Use Redux balance if available, otherwise use prop
  const effectiveBalance = useMemo(() => {
    if (typeof storeBalance === 'number' && storeBalance > 0) {
      return storeBalance;
    }
    return balance;
  }, [balance, storeBalance]);
  
  // Convert the balance to a formatted string
  const formattedBalance = effectiveBalance.toFixed(2);
  
  try {
    return (
      <TouchableOpacity 
        style={styles.container} 
        onPress={onPress}
        activeOpacity={0.9}
        accessibilityLabel={`Credit balance: ${effectiveBalance} dollars`}
        disabled={loading || isLoading}
      >
        <LinearGradient
          colors={['#6C63FF', '#845EF7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.content}>
            <Text style={styles.label}>Credit Balance</Text>
            {(loading || isLoading) ? (
              <ActivityIndicator color="#fff" size="large" style={styles.loader} />
            ) : (
              <View style={styles.balanceContainer}>
                <Text style={styles.currency}>$</Text>
                <Text style={styles.balance}>{formattedBalance}</Text>
              </View>
            )}
            <View style={styles.cardDecoration} />
            <View style={styles.cardDecoration2} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  } catch (err) {
    console.error('[CreditBalanceCard] Error rendering card:', err);
    // Return a fallback simple card if there's an error
    return (
      <TouchableOpacity style={styles.fallbackCard} onPress={onPress} disabled={loading || isLoading}>
        {(loading || isLoading) ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <Text style={styles.fallbackLabel}>Credit Balance: ${formattedBalance}</Text>
        )}
      </TouchableOpacity>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
    marginHorizontal: 16,
    borderRadius: 32,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  card: {
    borderRadius: 32,
    overflow: 'hidden',
  },
  content: {
    paddingVertical: 32,
    paddingHorizontal: 32,
    alignItems: 'center',
    position: 'relative',
    minHeight: 120, // Ensure consistent height when loading
  },
  label: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    marginBottom: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currency: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
    marginRight: 2,
    opacity: 0.9,
  },
  balance: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  loader: {
    marginVertical: 10,
    height: 42, // Match the height of the balance text
  },
  cardDecoration: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cardDecoration2: {
    position: 'absolute',
    bottom: -40,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  fallbackCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 24,
    alignItems: 'center',
    minHeight: 80, // Ensure consistent height when loading
  },
  fallbackLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CreditBalanceCard;