import React from 'react';

const SystemMessage = ({ message }: { message: any }) => (
  <div style={{ fontStyle: 'italic', color: 'gray' }}>{message.content}</div>
);

export default SystemMessage;
