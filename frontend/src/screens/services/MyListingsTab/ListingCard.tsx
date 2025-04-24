import React from 'react';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';
import { StyleSheet } from 'react-native';

export default function ListingCard({ listing }: { listing: any }) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{listing.type} Listing</Title>
        <Paragraph>{listing.description}</Paragraph>
        <Chip style={styles.chip}>{listing.status}</Chip>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  chip: { marginTop: 8, alignSelf: 'flex-start' },
});
