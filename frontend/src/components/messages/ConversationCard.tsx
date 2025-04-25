import React from 'react';

const ConversationCard = ({ conversation }: { conversation: any }) => {
  // Placeholder UI
  return (
    <div>
      <span>{conversation.otherUser?.name}</span>
      <span>{conversation.lastMessage}</span>
      <span>{conversation.lastMessageTime}</span>
    </div>
  );
};

export default ConversationCard;
