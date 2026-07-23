import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const pageTitles = {
  '/': 'Dashboard',
  '/leads': 'Lead Management',
  '/leads/new': 'Add New Lead',
  '/leads/failed': 'Failed Leads',
  '/leads/re-engage': 'Re-engagement Pipeline',
  '/follow-ups': 'Follow-ups',
  '/courses': 'Courses',
  '/users': 'User Management',
  '/reports': 'Reports & Analytics',
  '/import': 'Bulk Import',
  '/settings': 'Settings',
};

export default function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const pageTitle = pageTitles[location.pathname] || 'UniCRM';

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className={`main-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <TopBar collapsed={sidebarCollapsed} pageTitle={pageTitle} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
