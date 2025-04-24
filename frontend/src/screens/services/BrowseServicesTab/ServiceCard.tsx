import React from 'react';
import { Card, Title, Paragraph } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

export default function ServiceCard({ service }: { service: any }) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{service.type} by {service.provider}</Title>
        <Paragraph>{service.description}</Paragraph>
        <Paragraph>Cost: {service.cost} credits</Paragraph>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
});
