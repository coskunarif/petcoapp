import React from 'react';

const ServiceRequestMessage = ({ message }: { message: any }) => (
  <div>Service Request: {message.serviceInfo}</div>
);

export default ServiceRequestMessage;
