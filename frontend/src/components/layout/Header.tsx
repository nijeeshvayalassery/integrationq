import React from 'react';
import { Header as CarbonHeader, HeaderName, HeaderGlobalBar, HeaderGlobalAction } from '@carbon/react';
import { Notification, UserAvatar } from '@carbon/icons-react';

export const Header: React.FC = () => {
  return (
    <CarbonHeader aria-label="IntegrationIQ">
      <HeaderName href="/" prefix="IBM">
        IntegrationIQ
      </HeaderName>
      <HeaderGlobalBar>
        <HeaderGlobalAction aria-label="Notifications">
          <Notification size={20} />
        </HeaderGlobalAction>
        <HeaderGlobalAction aria-label="User Profile">
          <UserAvatar size={20} />
        </HeaderGlobalAction>
      </HeaderGlobalBar>
    </CarbonHeader>
  );
};

// Made with Bob
