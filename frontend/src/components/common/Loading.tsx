import React from 'react';
import { Loading as CarbonLoading } from '@carbon/react';

interface LoadingProps {
  description?: string;
  withOverlay?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ 
  description = 'Loading...', 
  withOverlay = false 
}) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: withOverlay ? '100vh' : '200px',
      width: '100%',
    }}>
      <CarbonLoading description={description} withOverlay={withOverlay} />
    </div>
  );
};

// Made with Bob
