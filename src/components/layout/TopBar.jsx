import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useToast } from '../../context/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { useNotificationPreferences } from '../../hooks/useNotificationPreferences';
import { useTheme } from '../../context/ThemeContext';
import {
  HiOutlineSearch,
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineDesktopComputer,
  HiOutlineCheck,
} from 'react-icons/hi';
import { APP_INITIAL } from '../../constants/app';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', Icon: HiOutlineSun },
  { value: 'dark', label: 'Dark', Icon: HiOutlineMoon },
  { value: 'system', label: 'System', Icon: HiOutlineDesktopComputer },
];

export default function TopBar({ collapsed, pageTitle, onMenuToggle, mobileMenuOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { isAllowed } = useNotificationPreferences();
  const [notificationsList, setNotificationsList] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const themeRef = useRef(null);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const handleWsNotification = useCallback((notif) => {
    setNotificationsList(prev => {
      if (prev.some(n => n.id === notif.id)) return prev;
      return [notif, ...prev];
    });
    if (isAllowed(notif.type)) {
      toast.info(`${notif.title} — ${notif.message}`, 5000);
    }
  }, [toast, isAllowed]);

  const { connected } = useWebSocket(handleWsNotification);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.notifications.getAll();
      if (res && res.success && res.data) setNotificationsList(res.data.notifications || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchNotifications();
    if (!connected) {
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, connected]);

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotificationsList(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { /* silent */ }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.notifications.markAsRead(id);
      setNotificationsList(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { /* silent */ }
  };

  const unreadCount = notificationsList.filter((n) => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setShowThemeMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) {
        setMobileSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setSearching(true);
      try {
        const res = await api.leads.getAll({ search: debouncedSearch, limit: 6 });
        if (!cancelled && res && res.success) {
          setSearchResults(res.data || []);
          setShowResults(true);
        }
      } catch {
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    })();
    return () => { cancelled = true; };
  }, [debouncedSearch]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setShowResults(false);
      setMobileSearchOpen(false);
      navigate(`/leads?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
    if (e.key === 'Escape') {
      setShowResults(false);
      setMobileSearchOpen(false);
    }
  };

  const handleResultClick = (leadId) => {
    setShowResults(false);
    setMobileSearchOpen(false);
    setSearchQuery('');
    navigate(`/leads/${leadId}`);
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);
    if (diff < 1) return `just now`;
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const notifIconColor = (type) => {
    const colors = {
      LEAD_ASSIGNED: { bg: '#eef2ff', color: '#4f46e5' },
      FOLLOW_UP_REMINDER: { bg: '#fffbeb', color: '#d97706' },
      LEAD_CONVERTED: { bg: '#ecfdf5', color: '#059669' },
      LEAD_FAILED: { bg: '#fef2f2', color: '#dc2626' },
      ESCALATION: { bg: '#fef2f2', color: '#dc2626' },
      IMPORT_COMPLETE: { bg: '#eff6ff', color: '#2563eb' },
    };
    return colors[type] || { bg: '#f3f4f6', color: '#6b7280' };
  };

  return (
    <header className={`topbar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="topbar-left">
        <button
          className="topbar-hamburger btn btn-ghost btn-icon"
          onClick={onMenuToggle}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          style={{ display: 'none' }}
        >
          {mobileMenuOpen ? <HiOutlineX size={20} /> : <HiOutlineMenu size={20} />}
        </button>
        <h1 className="topbar-page-title">{pageTitle}</h1>
      </div>

      <div className="topbar-right">
        <div className="relative" ref={searchRef}>
          <div className="topbar-search" role="search">
            <HiOutlineSearch className="topbar-search-icon" />
            <input
              type="text"
              className="topbar-search-input"
              placeholder="Search leads..."
              aria-label="Search leads"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
            />
            {searching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="spinner h-3.5 w-3.5 rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin" />
              </span>
            )}
          </div>

          {showResults && (
            <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[320px] overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-[#1f2530] shadow-xl">
              {searchResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">No leads found</div>
              ) : (
                <>
                  {searchResults.map(lead => (
                    <button
                      key={lead.id}
                      className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 last:border-0"
                      onClick={() => handleResultClick(lead.id)}
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                        {lead.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-gray-900">{lead.name}</div>
                        <div className="truncate text-xs text-gray-500">{lead.phone} {lead.email ? `· ${lead.email}` : ''}</div>
                      </div>
                      <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
                        lead.status === 'CONVERTED' ? 'bg-emerald-100 text-emerald-700' :
                        lead.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                        lead.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {lead.status?.replace(/_/g, ' ')}
                      </span>
                    </button>
                  ))}
                  <button
                    className="w-full border-t border-gray-100 px-4 py-2.5 text-center text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
                    onClick={() => {
                      setShowResults(false);
                      navigate(`/leads?search=${encodeURIComponent(searchQuery.trim())}`);
                      setSearchQuery('');
                    }}
                  >
                    View all results →
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Search Toggle */}
        <div className="relative" ref={mobileSearchRef}>
          <button
            className="topbar-icon-btn md:hidden"
            aria-label="Search leads"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            style={{ display: 'none' }}
          >
            <HiOutlineSearch size={20} />
          </button>
          {mobileSearchOpen && (
            <div className="fixed left-0 top-0 z-[210] w-full bg-white dark:bg-[#1f2530] p-3 shadow-lg border-b border-gray-200 md:hidden" style={{ display: 'none' }}>
              <div className="relative">
                <HiOutlineSearch className="topbar-search-icon" />
                <input
                  type="text"
                  className="topbar-search-input"
                  placeholder="Search leads..."
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => { setMobileSearchOpen(false); setSearchQuery(''); }}
                >
                  <HiOutlineX size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme */}
        <div className="relative" ref={themeRef}>
          <button
            className="topbar-icon-btn"
            aria-label={`Appearance: ${theme}`}
            title={`Appearance: ${theme}`}
            onClick={() => {
              setShowThemeMenu(!showThemeMenu);
              setShowNotifications(false);
              setShowUserMenu(false);
            }}
          >
            {resolvedTheme === 'dark' ? <HiOutlineMoon size={20} /> : <HiOutlineSun size={20} />}
          </button>

          {showThemeMenu && (
            <div className="notification-dropdown right-0">
              <div className="notification-dropdown-header">
                <span className="notification-dropdown-title">Appearance</span>
              </div>
              {THEME_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className="notification-item w-full border-none text-left"
                  onClick={() => {
                    setTheme(opt.value);
                    setShowThemeMenu(false);
                  }}
                >
                  <opt.Icon size={18} className={theme === opt.value ? 'text-indigo-600' : 'text-gray-500'} />
                  <span className={`notification-text flex-1 ${theme === opt.value ? 'text-indigo-600 font-semibold' : ''}`}>
                    {opt.label}
                  </span>
                  {theme === opt.value && <HiOutlineCheck size={18} className="text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            className="topbar-icon-btn"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
          >
            <HiOutlineBell size={20} />
            {unreadCount > 0 && <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <span className="notification-dropdown-title">
                  Notifications
                  {connected && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" title="Live" />}
                </span>
                {unreadCount > 0 && (
                  <button className="btn btn-ghost btn-sm text-xs" onClick={handleMarkAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              {notificationsList.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No notifications
                </div>
              ) : (
                notificationsList.slice(0, 8).map((notif) => {
                  const colors = notifIconColor(notif.type);
                  return (
                    <div
                      key={notif.id}
                      className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                      onClick={(e) => {
                        if (!notif.isRead) handleMarkAsRead(notif.id, e);
                        if (notif.link) { navigate(notif.link); setShowNotifications(false); }
                      }}
                    >
                      <div
                        className="notification-icon"
                        style={{ background: colors.bg, color: colors.color }}
                      >
                        <HiOutlineBell />
                      </div>
                      <div className="flex-1">
                        <div className="notification-text">
                          <strong>{notif.title}</strong> — {notif.message}
                        </div>
                        <div className="notification-time">{formatTime(notif.createdAt)}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userRef}>
          <div
            className="topbar-user"
            role="button"
            aria-haspopup="true"
            aria-expanded={showUserMenu}
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
          >
            <div className="topbar-avatar">{user?.avatar || user?.name?.charAt(0)?.toUpperCase() || APP_INITIAL}</div>
            <div className="topbar-user-info">
              <span className="topbar-user-name">{user?.name || 'User'}</span>
              <span className="topbar-user-role">{user?.role || 'Admin'}</span>
            </div>
          </div>

          {showUserMenu && (
            <div className="notification-dropdown w-[200px] right-0">
              <button
                className="notification-item w-full border-none text-left"
                onClick={() => { navigate('/settings?tab=profile'); setShowUserMenu(false); }}
              >
                <HiOutlineUser size={18} className="text-gray-500" />
                <span className="notification-text">My Profile</span>
              </button>
              <button
                className="notification-item w-full border-none text-left"
                onClick={() => { navigate('/settings?tab=security'); setShowUserMenu(false); }}
              >
                <HiOutlineCog size={18} className="text-gray-500" />
                <span className="notification-text">Settings</span>
              </button>
              <div className="border-t border-gray-200">
                <button
                  className="notification-item w-full border-none text-left text-red-600"
                  onClick={logout}
                >
                  <HiOutlineLogout size={18} />
                  <span className="notification-text text-red-600">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
