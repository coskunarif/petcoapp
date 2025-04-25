import React from 'react';
import TextMessage from './TextMessage';
import ImageMessage from './ImageMessage';
import ServiceRequestMessage from './ServiceRequestMessage';
import SystemMessage from './SystemMessage';

// TODO: Implement message pagination (infinite scroll or load more)
// TODO: Show unread counters and read receipts
// TODO: Display presence and typing indicators for other users
const MessageList = ({ messages = [] }: { messages: any[] }) => {
  return (
    <div>
      {messages.map((msg) => {
        switch (msg.type) {
          case 'text':
            return <TextMessage key={msg.id} message={msg} />;
          case 'image':
            return <ImageMessage key={msg.id} message={msg} />;
          case 'service':
            return <ServiceRequestMessage key={msg.id} message={msg} />;
          case 'system':
            return <SystemMessage key={msg.id} message={msg} />;
          default:
            return null;
        }
      })}
    </div>
  );
};

export default MessageList;
