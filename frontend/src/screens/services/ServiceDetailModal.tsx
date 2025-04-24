import React from 'react';
import { Modal, Portal, Card, Title, Paragraph, Button } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

export default function ServiceDetailModal({ visible, onDismiss, service }: { visible: boolean; onDismiss: () => void; service: any }) {
  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Card>
          <Card.Content>
            <Title>{service?.type} by {service?.provider}</Title>
            <Paragraph>{service?.description}</Paragraph>
            <Paragraph>Cost: {service?.cost} credits</Paragraph>
          </Card.Content>
          <Card.Actions>
            <Button onPress={onDismiss}>Close</Button>
            <Button mode="contained">Request Service</Button>
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: { margin: 32, backgroundColor: 'white', borderRadius: 8, padding: 16 },
});
