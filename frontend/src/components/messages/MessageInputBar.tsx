import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sendMessage } from '../../api/messagesApi';
import { addMessage, setActiveConversationLoading } from '../../redux/messagingSlice';
import TextInput from './TextInput';
import ImageAttachmentButton from './ImageAttachmentButton';
import QuickActionButtons from './QuickActionButtons';

const MessageInputBar = () => {
  const [input, setInput] = useState('');
  const dispatch = useDispatch();
  const conversationId = useSelector((state: any) => state.messaging.activeConversation.id);
  const userId = useSelector((state: any) => state.auth?.user?.id);

  const handleSend = async () => {
    if (!input.trim() || !conversationId || !userId) return;
    dispatch(setActiveConversationLoading(true));
    try {
      const now = new Date().toISOString();
      const tempId = `temp-${Math.random().toString(36).substr(2, 9)}`;
      const payload = {
        conversation_id: conversationId,
        sender_id: userId,
        content: input,
        type: 'text',
        created_at: now,
      };
      await sendMessage(payload);
      // Optimistic update (Message type)
      dispatch(addMessage({
        id: tempId,
        senderId: userId,
        content: input,
        type: 'text',
        createdAt: now,
      }));
      setInput('');
    } finally {
      dispatch(setActiveConversationLoading(false));
    }
  };

  return (
    <div>
      <TextInput value={input} onChange={e => setInput(e.target.value)} onEnter={handleSend} />
      <ImageAttachmentButton />
      <QuickActionButtons />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default MessageInputBar;
