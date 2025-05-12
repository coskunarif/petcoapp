import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { theme, globalStyles } from '../../../theme';
import { Text } from '../../../components/ui';

export default function PersonalInfoScreen({ navigation }: any) {
  const user = useSelector((state: any) => state.auth.user);

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="h2">Personal Information</Text>
        <View style={{ width: 40 }} /> {/* Empty space for balance */}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text variant="label" color="textSecondary" style={styles.sectionLabel}>
            Full Name
          </Text>
          <Text variant="body" style={styles.sectionContent}>
            {user?.full_name || 'Not provided'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="label" color="textSecondary" style={styles.sectionLabel}>
            Email Address
          </Text>
          <Text variant="body" style={styles.sectionContent}>
            {user?.email || 'Not provided'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="label" color="textSecondary" style={styles.sectionLabel}>
            Phone Number
          </Text>
          <Text variant="body" style={styles.sectionContent}>
            {user?.phone || 'Not provided'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="label" color="textSecondary" style={styles.sectionLabel}>
            Bio
          </Text>
          <Text variant="body" style={styles.sectionContent}>
            {user?.bio || 'No bio provided'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <MaterialCommunityIcons name="pencil" size={20} color={theme.colors.primary} />
          <Text variant="button" color="primary" style={styles.editText}>
            Edit Personal Information
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#fff',
    ...theme.elevation.small,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...theme.elevation.small,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  editText: {
    marginLeft: 8,
  },
});