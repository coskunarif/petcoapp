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
  modal: {
    margin: 0,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'rgba(24,38,63,0.22)', // subtle overlay
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 28,
    padding: 28,
    marginHorizontal: 24,
    maxWidth: 420,
    alignSelf: 'center',
    shadowColor: '#4a90e2',
    shadowOpacity: 0.18,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 8 },
    elevation: 24,
    borderWidth: 1.2,
    borderColor: 'rgba(173, 216, 255, 0.14)',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
    color: '#223a5f',
    letterSpacing: 0.2,
    fontFamily: 'System',
    textShadowColor: 'rgba(74,144,226,0.08)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  paragraph: {
    fontSize: 17,
    color: '#3a4664',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginTop: 24,
  },
  closeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderWidth: 1.2,
    borderColor: '#b4c7e7',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#b4c7e7',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  closeText: {
    color: '#5774a6',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.1,
  },
  updateButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#1976d2',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#1976d2',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  updateText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.1,
  },
});
