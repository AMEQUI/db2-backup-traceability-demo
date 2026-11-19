import {
  Header, HeaderContainer, HeaderName, HeaderNavigation, HeaderMenuItem, HeaderGlobalBar, HeaderGlobalAction,
  HeaderMenuButton, SideNav, SideNavItems, SideNavLink, SkipToContent, Content, Tag,
} from '@carbon/react';
import {
  Dashboard, ReportData, SearchLocate, Analytics, NetworkEnterprise, Notification, UserAvatar, Switcher,
} from '@carbon/icons-react';
import { Link, useLocation } from 'react-router-dom';
import DemoBanner from './components/DemoBanner.jsx';
import AppRoutes from './routes.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', icon: Dashboard },
  { to: '/problem', label: 'Problem', icon: ReportData },
  { to: '/solution', label: 'Solution', icon: SearchLocate },
  { to: '/results', label: 'Results', icon: Analytics },
  { to: '/architecture', label: 'Architecture', icon: NetworkEnterprise },
];

export default function App() {
  const { pathname } = useLocation();

  return (
    <HeaderContainer
      render={({ isSideNavExpanded, onClickSideNavExpand }) => (
        <>
          <Header aria-label="Db2 Backup Traceability">
            <SkipToContent />
            <HeaderMenuButton
              aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
              onClick={onClickSideNavExpand}
              isActive={isSideNavExpanded}
              isCollapsible
            />
            <HeaderName as={Link} to="/" prefix="IBM">Db2 Backup Traceability</HeaderName>
            <HeaderNavigation aria-label="Primary">
              {NAV.map((n) => (
                <HeaderMenuItem key={n.to} as={Link} to={n.to} isCurrentPage={pathname === n.to}>
                  {n.label}
                </HeaderMenuItem>
              ))}
            </HeaderNavigation>
            <HeaderGlobalBar>
              <span className="mode-tag"><Tag size="sm" type="cool-gray">MOCK mode</Tag></span>
              <HeaderGlobalAction aria-label="Notifications" tooltipAlignment="end"><Notification size={20} /></HeaderGlobalAction>
              <HeaderGlobalAction aria-label="User (demo)" tooltipAlignment="end"><UserAvatar size={20} /></HeaderGlobalAction>
              <HeaderGlobalAction aria-label="Switcher" tooltipAlignment="end"><Switcher size={20} /></HeaderGlobalAction>
            </HeaderGlobalBar>
            <SideNav aria-label="Side navigation" expanded={isSideNavExpanded} isPersistent={false}
              onOverlayClick={onClickSideNavExpand}>
              <SideNavItems>
                {NAV.map((n) => (
                  <SideNavLink key={n.to} as={Link} to={n.to} renderIcon={n.icon} isActive={pathname === n.to}>
                    {n.label}
                  </SideNavLink>
                ))}
              </SideNavItems>
            </SideNav>
          </Header>
          <Content id="main-content" className="app-content">
            <DemoBanner />
            <AppRoutes />
            <footer className="app-footer">
              Illustrative demo built with IBM Bob — uses synthetic data. Product screens are simulated; no IBM service is called.
            </footer>
          </Content>
        </>
      )}
    />
  );
}
