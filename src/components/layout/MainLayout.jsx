import { useState, useEffect, useRef } from 'react';
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
  '/intakes': 'Intakes',
  '/users': 'User Management',
  '/reports': 'Reports & Analytics',
  '/import': 'Bulk Import',
  '/settings': 'Settings',
};

export default function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const prevPathnameRef = useRef(location.pathname);

  const pageTitle = pageTitles[location.pathname] || 'UniCRM';

  if (prevPathnameRef.current !== location.pathname) {
    prevPathnameRef.current = location.pathname;
    if (mobileMenuOpen) setMobileMenuOpen(false);
  }

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <div className="app-layout">
      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className={`main-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <TopBar
          collapsed={sidebarCollapsed}
          pageTitle={pageTitle}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          mobileMenuOpen={mobileMenuOpen}
        />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
