import { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineClipboardList,
  HiOutlinePhone,
  HiOutlineXCircle,
  HiOutlineRefresh,
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineX,
} from 'react-icons/hi';

const menuSections = [
  {
    title: 'Main',
    items: [
      { path: '/', icon: HiOutlineHome, label: 'Dashboard', permission: null },
      { path: '/leads', icon: HiOutlineUsers, label: 'All Leads', permission: null },
      { path: '/leads/new', icon: HiOutlineClipboardList, label: 'Add Lead', permission: 'create_lead' },
    ],
  },
  {
    title: 'Pipeline',
    items: [
      { path: '/follow-ups', icon: HiOutlinePhone, label: 'Follow-ups', permission: 'follow_up', badgeKey: 'followups' },
      { path: '/leads/failed', icon: HiOutlineXCircle, label: 'Failed Leads', permission: null },
      { path: '/leads/re-engage', icon: HiOutlineRefresh, label: 'Re-engagement', permission: 're_engage' },
    ],
  },
  {
    title: 'Management',
    items: [
      { path: '/courses', icon: HiOutlineAcademicCap, label: 'Courses', permission: null },
      { path: '/intakes', icon: HiOutlineCalendar, label: 'Intakes', permission: null },
      { path: '/users', icon: HiOutlineUserGroup, label: 'Users', permission: 'manage_users' },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { path: '/reports', icon: HiOutlineChartBar, label: 'Reports', permission: null },
      { path: '/settings', icon: HiOutlineCog, label: 'Settings', permission: null },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { hasPermission } = useAuth();
  const [pendingFollowUps, setPendingFollowUps] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.followUps.getStats();
      if (res && res.success && res.data) {
        setPendingFollowUps((res.data.overdue || 0) + (res.data.today || 0) + (res.data.upcoming || 0));
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 45000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      onMobileClose();
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">U</div>
        <span className="sidebar-brand">UniCRM</span>
        <button className="sidebar-close-mobile" onClick={onMobileClose} aria-label="Close menu">
          <HiOutlineX size={20} />
        </button>
      </div>

      <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
        {menuSections.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.permission || hasPermission(item.permission)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div className="sidebar-section" key={section.title}>
              <div className="sidebar-section-title">{section.title}</div>
              {visibleItems.map((item) => {
                const badge = item.badgeKey === 'followups' && pendingFollowUps > 0 
                  ? String(pendingFollowUps) 
                  : null;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                    aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
                    onClick={handleNavClick}
                  >
                    <span className="sidebar-link-icon">
                      <item.icon />
                    </span>
                    <span className="sidebar-link-text">{item.label}</span>
                    {badge && (
                      <span className="sidebar-link-badge">{badge}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-toggle" onClick={onToggle} aria-expanded={!collapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
          {!collapsed && <span className="ml-2 text-[0.8125rem]">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
