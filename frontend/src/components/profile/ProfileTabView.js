import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

function PersonalInfoTab({ user }) {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Personal Info</Text>
      <Text>Name: {user.fullName}</Text>
      <Text>Email: {user.email}</Text>
      <Text>Bio: {user.bio}</Text>
    </View>
  );
}

function ServiceHistoryTab() {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Service History</Text>
      {/* Placeholder for ServiceHistoryList/ServiceHistoryCard */}
      <Text>No service history yet.</Text>
    </View>
  );
}

function ReviewsTab() {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Reviews</Text>
      {/* Placeholder for ReviewsList/ReviewCard */}
      <Text>No reviews yet.</Text>
    </View>
  );
}

function TransactionsTab() {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Transactions</Text>
      {/* Placeholder for TransactionsList/TransactionCard */}
      <Text>No transactions yet.</Text>
    </View>
  );
}

export default function ProfileTabView({ user }) {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'personal', title: 'Personal Info' },
    { key: 'history', title: 'History' },
    { key: 'reviews', title: 'Reviews' },
    { key: 'transactions', title: 'Transactions' },
  ]);

  const renderScene = SceneMap({
    personal: () => <PersonalInfoTab user={user} />,
    history: ServiceHistoryTab,
    reviews: ReviewsTab,
    transactions: TransactionsTab,
  });

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: Dimensions.get('window').width }}
      renderTabBar={props => (
        <TabBar
          {...props}
          indicatorStyle={{ backgroundColor: '#1e88e5' }}
          style={{ backgroundColor: '#fff' }}
          labelStyle={{ color: '#1e88e5', fontWeight: 'bold' }}
        />
      )}
      style={styles.tabView}
    />
  );
}

const styles = StyleSheet.create({
  tabView: {
    marginTop: 18,
    backgroundColor: '#fff',
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 18,
    backgroundColor: '#fff',
  },
  tabTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e88e5',
  },
});
