import React from 'react';
import { Modal, Portal, Card, Title, Paragraph, Button } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

export default function RequestDetailModal({ visible, onDismiss, request }: { visible: boolean; onDismiss: () => void; request: any }) {
  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Card>
          <Card.Content>
            <Title>{request?.type} Request</Title>
            <Paragraph>Status: {request?.status}</Paragraph>
            <Paragraph>Requester: {request?.requester}</Paragraph>
            <Paragraph>Provider: {request?.provider}</Paragraph>
            <Paragraph>Date: {request?.date}</Paragraph>
          </Card.Content>
          <Card.Actions>
            <Button onPress={onDismiss}>Close</Button>
            <Button mode="contained">Update Status</Button>
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: { margin: 32, backgroundColor: 'white', borderRadius: 8, padding: 16 },
});
