import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated, StatusBar, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchPetsAsync, setEditingPet } from '../../store/petsSlice';
import PetsList from './PetsList.native';
import EmptyStatePets from './EmptyStatePets.native';
import AddPetFAB from './AddPetFAB.native';
import PetDetailModal from './PetDetailModal.native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '../../theme';

const PetsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { petsList, loading, error, editingPet } = useSelector((state: RootState) => state.pets);
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  
  // Animation values for header
  const scrollY = new Animated.Value(0);
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0.3, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (userId) {
      dispatch(fetchPetsAsync(userId) as any);
    }
  }, [dispatch, userId]);

  const handleAddPet = () => {
    dispatch(setEditingPet({
      id: '',
      owner_id: userId || '',
      name: '',
      species: '',
      breed: '',
      age: undefined,
      weight: undefined,
      care: {},
      photos: [],
      vetInfo: '',
    }));
  };

  // Custom PetsList wrapper that uses onScroll to animate the header
  const PetsListWithScroll = () => {
    return (
      <PetsList 
        pets={petsList || []} 
        scrollEventListener={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />
    );
  };

  // Wrap the entire render in a try/catch to catch any rendering errors
  try {
    return (
      <View style={styles.container}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="transparent" 
          translucent
        />
        
        {/* Background Gradient */}
        <LinearGradient
          colors={['#f8f9ff', '#eef1ff']}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Fixed Header - appears on scroll */}
        <Animated.View style={[styles.fixedHeader, { opacity: headerOpacity }]}>
          <BlurView intensity={80} style={styles.blurHeader} tint="light">
            <Text style={styles.headerTitle}>My Pets</Text>
          </BlurView>
        </Animated.View>
        
        {/* Page Header - Not scrolling */}
        <View style={styles.pageHeader}>
          <Text style={styles.titleText}>My Pets</Text>
        </View>
      
        {/* Content Area */}
        {(!userId || (loading && !petsList?.length)) ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{!userId ? 'Loading user data...' : 'Loading pets...'}</Text>
          </View>
        ) : error ? (
          <View style={styles.contentContainer}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : (petsList?.length === 0) ? (
          <View style={styles.contentContainer}>
            {(() => {
              try {
                return <EmptyStatePets onAddPet={handleAddPet} />;
              } catch (err) {
                console.error('[PetsScreen] Error rendering EmptyStatePets:', err);
                return (
                  <View style={{ padding: 32 }}>
                    <Text style={{ color: 'red' }}>
                      Error rendering EmptyState: {err && (err as Error).message ? (err as Error).message : String(err)}
                    </Text>
                  </View>
                );
              }
            })()}
          </View>
        ) : (
          <PetsListWithScroll />
        )}

        {/* Wrap FAB in a conditional to ensure it's only rendered when needed */}
        {userId && <AddPetFAB onPress={handleAddPet} />}
        {editingPet && <PetDetailModal />}
      </View>
    );
  } catch (error) {
    console.error('[PetsScreen] Fatal rendering error:', error);
    // Return a minimal UI that shouldn't crash
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Something went wrong</Text>
        <Text>{(error as Error).message}</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  blurHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(230,230,255,0.3)',
  },
  headerTitle: {
    ...theme.typography.h2,
    textAlign: 'center',
  },
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 0, // Reduced bottom padding
    zIndex: 1,
  },
  titleText: {
    ...theme.typography.h1,
    marginBottom: 2, // Reduced bottom margin
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  error: {
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.2,
    padding: 20,
  },
});

export default PetsScreen;
