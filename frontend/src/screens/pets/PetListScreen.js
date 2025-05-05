import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { FAB } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../../supabaseClient';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, globalStyles } from '../../theme';
import { AppCard, SectionHeader, EmptyState } from '../../components/ui';

const PetListScreen = ({ navigation }) => {
  const user = useSelector(state => state.auth.user);
  console.log('[PetListScreen] Rendering...');
  console.log('[PetListScreen] Navigation Prop:', navigation);
  console.log('[PetListScreen] User from Redux:', user); // Log user state

  // Defensive check: if user is undefined, return a valid React element
  if (user === undefined) {
    console.log('[PetListScreen] user is undefined, rendering null to prevent crash');
    return null; // or <View><Text>Loading...</Text></View> if you prefer a spinner
  }

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Only fetch pets if the user object is available
    if (user) {
      console.log('[PetListScreen] User loaded, fetching pets...');
      fetchPets();
    } else {
      console.log('[PetListScreen] Waiting for user data...');
      // Optional: Set loading to false if you want to show a specific "waiting for user" message
      // setLoading(false);
    }
  }, [user]); // Add user as a dependency

  const fetchPets = async () => {
    try {
      console.log('[PetListScreen] Starting fetchPets, user ID:', user?.id);
      setLoading(true);

      // Try with user_id first (most common column name)
      console.log('[PetListScreen] Querying with user_id column');
      const { data: userData, error: userError } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user?.id)
        .order('name');

      if (userError) {
        console.log('[PetListScreen] Error with user_id query:', userError.message);

        // Fall back to owner_id if user_id fails
        console.log('[PetListScreen] Trying with owner_id column instead');
        const { data: ownerData, error: ownerError } = await supabase
          .from('pets')
          .select('*')
          .eq('owner_id', user?.id)
          .order('name');

        if (ownerError) {
          console.error('[PetListScreen] Error with owner_id query:', ownerError.message);
          throw ownerError;
        }

        console.log('[PetListScreen] Success with owner_id query, pets found:', ownerData?.length || 0);
        setPets(ownerData || []);
      } else {
        console.log('[PetListScreen] Success with user_id query, pets found:', userData?.length || 0);
        setPets(userData || []);
      }
    } catch (error) {
      console.error('[PetListScreen] Error fetching pets:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  const onRefresh = () => {
    setRefreshing(true);
    fetchPets();
  };

  const renderPetCard = ({ item }) => {
    console.log('[PetListScreen] Rendering pet card for:', item?.name || 'unknown pet');

    // Defensive check for item
    if (!item) {
      console.log('[PetListScreen] Warning: Attempted to render pet card with null/undefined item');
      return <View><Text>Invalid pet data</Text></View>;
    }

    try {
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('PetDetail', { pet: item })}
          activeOpacity={0.7}
        >
          <AppCard>
            <View style={styles.petCardContent}>
              <Image
                source={{ uri: item.image_url || 'https://via.placeholder.com/100' }}
                style={styles.petImage}
              />
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{item.name || 'Unnamed Pet'}</Text>
                <Text style={styles.petBreed}>{item.species || 'Unknown'} • {item.breed || 'Mixed'}</Text>
                <Text style={styles.petDetails}>
                  {item.age ? `${item.age} years • ` : ''}
                  {item.weight ? `${item.weight} kg` : ''}
                </Text>
              </View>
              {/* Wrap icon in a conditional to ensure it's only rendered when needed */}
              {item ? (
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.textTertiary}
                />
              ) : null}
            </View>
          </AppCard>
        </TouchableOpacity>
      );
    } catch (error) {
      console.error('[PetListScreen] Error rendering pet card:', error);
      return <View><Text>Error displaying pet</Text></View>;
    }
  };

  // Wrap the entire render in a try/catch to catch any rendering errors
  try {
    console.log('[PetListScreen] Rendering main UI, user:', user?.id, 'pets:', pets?.length);

    return (
      // Replace SafeAreaView with regular View plus padding for safety
      <View style={[globalStyles.safeArea, { paddingTop: 30 }]}>
        <SectionHeader title="My Pets" />
        {/* Show loading if user isn't loaded yet OR if fetching pets */}
        {(!user || (loading && !refreshing)) ? (
          <View style={styles.loadingContainer}>
            {/* Display different message based on why it's loading */}
            <Text style={styles.loadingText}>{!user ? 'Loading user data...' : 'Loading pets...'}</Text>
          </View>
        ) : pets.length === 0 ? (
          (() => {
            try {
              console.log('[PetListScreen] About to render EmptyState with icon: paw');
              return (
                <EmptyState
                  icon="paw"
                  title="No pets added yet"
                  description="Add your furry friends to help caregivers provide the best service"
                  buttonTitle="Add Pet"
                  onButtonPress={() => navigation.navigate('AddPet')}
                />
              );
            } catch (err) {
              console.error('[PetListScreen] Error rendering EmptyState:', err);
              return (
                <View style={{ padding: 32 }}>
                  <Text style={{ color: 'red' }}>
                    Error rendering EmptyState: {err && err.message ? err.message : String(err)}
                  </Text>
                </View>
              );
            }
          })()
        ) : (
          <FlatList
            data={pets || []}
            renderItem={renderPetCard}
            keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
              />
            }
            ListEmptyComponent={<Text>No pets found</Text>}
          />
        )}

        {/* Wrap FAB in a conditional to ensure it's only rendered when needed */}
        {user ? (
          <FAB
            style={[globalStyles.fab, styles.fab]}
            icon="plus"
            onPress={() => navigation.navigate('AddPet')}
            color="white"
          />
        ) : null}
      </View> // Close the replacement View
    );
  } catch (error) {
    console.error('[PetListScreen] Fatal rendering error:', error);
    // Return a minimal UI that shouldn't crash
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Something went wrong</Text>
        <Text>{error.message}</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  petCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: theme.colors.primaryLight,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    ...theme.typography.h3,
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  petDetails: {
    fontSize: 14,
    color: theme.colors.textTertiary,
  },
  fab: {
    backgroundColor: theme.colors.primary,
  },
});

export default PetListScreen;
