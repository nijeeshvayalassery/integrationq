import React from 'react';
import { SideNav, SideNavItems, SideNavLink } from '@carbon/react';
import { Dashboard, Flow, Connect, Activity } from '@carbon/icons-react';
import { useLocation } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <SideNav aria-label="Side navigation" isFixedNav expanded>
      <SideNavItems>
        <SideNavLink
          renderIcon={Dashboard}
          href="/"
          isActive={isActive('/')}
        >
          Dashboard
        </SideNavLink>
        <SideNavLink
          renderIcon={Flow}
          href="/workflows"
          isActive={isActive('/workflows')}
        >
          Workflows
        </SideNavLink>
        <SideNavLink
          renderIcon={Connect}
          href="/connectors"
          isActive={isActive('/connectors')}
        >
          Connectors
        </SideNavLink>
        <SideNavLink
          renderIcon={Activity}
          href="/monitoring"
          isActive={isActive('/monitoring')}
        >
          Monitoring
        </SideNavLink>
      </SideNavItems>
    </SideNav>
  );
};

// Made with Bob
