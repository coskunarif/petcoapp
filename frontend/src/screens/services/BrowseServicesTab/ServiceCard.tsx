import React, { useState } from 'react';
import { Card, Title, Paragraph } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import ServiceDetailModal from '../ServiceDetailModal';

export default function ServiceCard({ service }: { service: any }) {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <>
      <Card style={styles.card} onPress={() => setModalVisible(true)}>
        <Card.Content>
          <Title>{service.type} by {service.provider}</Title>
          <Paragraph>{service.description}</Paragraph>
          <Paragraph>Cost: {service.cost} credits</Paragraph>
        </Card.Content>
      </Card>
      <ServiceDetailModal visible={modalVisible} onDismiss={() => setModalVisible(false)} service={service} />
    </>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
});
