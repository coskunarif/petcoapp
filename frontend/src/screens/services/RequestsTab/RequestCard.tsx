import React, { useState } from 'react';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import RequestDetailModal from '../RequestDetailModal';

export default function RequestCard({ request }: { request: any }) {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <>
      <Card style={styles.card} onPress={() => setModalVisible(true)}>
        <Card.Content>
          <Title>{request.type} Request</Title>
          <Paragraph>Status: {request.status}</Paragraph>
          <Paragraph>Requester: {request.requester}</Paragraph>
          <Paragraph>Provider: {request.provider}</Paragraph>
          <Paragraph>Date: {request.date}</Paragraph>
          <Chip style={styles.chip}>{request.status}</Chip>
        </Card.Content>
      </Card>
      <RequestDetailModal visible={modalVisible} onDismiss={() => setModalVisible(false)} request={request} />
    </>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  chip: { marginTop: 8, alignSelf: 'flex-start' },
});
