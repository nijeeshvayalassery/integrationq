import React from 'react';
import { InlineNotification } from '@carbon/react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onClose?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  title = 'Error', 
  message,
  onClose 
}) => {
  return (
    <InlineNotification
      kind="error"
      title={title}
      subtitle={message}
      onClose={onClose}
      lowContrast
      style={{ marginBottom: '1rem', maxWidth: '100%' }}
    />
  );
};

// Made with Bob
