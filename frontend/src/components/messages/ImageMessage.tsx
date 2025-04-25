import React from 'react';

const ImageMessage = ({ message }: { message: any }) => (
  <div>
    <img src={message.imageUrl} alt="attachment" style={{ maxWidth: 200 }} />
  </div>
);

export default ImageMessage;
