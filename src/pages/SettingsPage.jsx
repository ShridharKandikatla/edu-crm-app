import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { HiOutlineSave, HiOutlineBell, HiOutlineShieldCheck, HiOutlineUser, HiOutlineEye, HiOutlineEyeOff, HiOutlineSun, HiOutlineMoon, HiOutlineDesktopComputer, HiOutlineCheck, HiOutlineKey } from 'react-icons/hi';
import { useToast } from '../context/ToastContext';
import { SkeletonBlock } from '../components/Skeleton';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import { useTheme } from '../context/ThemeContext';
import { ROLE_MATRIX, ACCESS_LABELS, ROLES } from '../constants/permissions';

const APPEARANCE_OPTIONS = [
  { value: 'light', label: 'Light', desc: 'Always use the light theme', Icon: HiOutlineSun },
  { value: 'dark', label: 'Dark', desc: 'Always use the dark theme', Icon: HiOutlineMoon },
  { value: 'system', label: 'System', desc: 'Follow your device color scheme', Icon: HiOutlineDesktopComputer },
];

const ACCESS_BADGE = {
  '✓': 'badge-converted',
  '✗': 'badge-failed',
  'all': 'badge-app-inquiry',
  'team': 'badge-app-inquiry',
  'own': 'badge-app-inquiry',
  'manage': 'badge-app-inquiry',
};

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    ['profile', 'appearance', 'notifications', 'security', 'permissions'].includes(initialTab) ? initialTab : 'profile'
  );
  
  // Profile Form States
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  
  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const { preferences, updatePreferences } = useNotificationPreferences();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setSettingsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim()) return;
    try {
      setSavingProfile(true);
      const res = await api.users.update(user.id, {
        name: profileName,
        email: profileEmail,
        phone: profilePhone
      });
      if (res && res.success && res.data) {
        toast.success('Profile updated successfully!');
        // Reload user profile in AuthContext
        const meRes = await api.auth.getMe();
        if (meRes.success && meRes.data) {
          // If AuthContext doesn't expose setUser, we can update local storage or alert.
          // Let's check if we can call setUser if it was exposed
          if (setUser) {
            setUser(meRes.data);
          } else {
            // Reload the page to refresh context state
            window.location.reload();
          }
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      toast.warning('New password and confirmation do not match!');
      return;
    }
    if (newPassword.length < 6) {
      toast.warning('Password must be at least 6 characters long');
      return;
    }

    try {
      setSavingPassword(true);
      await api.auth.changePassword(currentPassword, newPassword);
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const passwordRules = [
    { label: 'At least 6 characters', met: newPassword.length >= 6 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(newPassword) },
    { label: 'Contains a number', met: /\d/.test(newPassword) },
    { label: 'Passwords match', met: newPassword.length > 0 && newPassword === confirmPassword },
  ];
  const allRulesMet = passwordRules.every(r => r.met);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Manage your account and system preferences</p>
        </div>
      </div>

      <div className="settings-content-grid grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        {/* Settings Nav */}
        <div className="settings-nav card h-fit p-3 flex flex-col" role="tablist" aria-label="Settings sections">
          {[
            { key: 'profile', label: 'Profile', icon: HiOutlineUser },
            { key: 'appearance', label: 'Appearance', icon: HiOutlineMoon },
            { key: 'notifications', label: 'Notifications', icon: HiOutlineBell },
            { key: 'permissions', label: 'Roles & Permissions', icon: HiOutlineKey },
            { key: 'security', label: 'Security', icon: HiOutlineShieldCheck },
          ].map(item => (
            <button
              key={item.key}
              className={`sidebar-link w-full border-none text-left ${activeTab === item.key ? 'active' : ''} ${activeTab === item.key ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40' : 'text-gray-500'}`}
              role="tab"
              aria-selected={activeTab === item.key}
              onClick={() => setActiveTab(item.key)}
            >
              <item.icon className="text-[1.125rem]" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div>
          {settingsLoading ? (
            <div className="card">
              <SkeletonBlock height="24px" width="30%" className="mb-6" />
              <div className="flex gap-4 mb-4">
                <SkeletonBlock height="40px" width="50%" />
                <SkeletonBlock height="40px" width="50%" />
              </div>
              <div className="flex gap-4 mb-6">
                <SkeletonBlock height="40px" width="50%" />
                <SkeletonBlock height="40px" width="50%" />
              </div>
              <SkeletonBlock height="40px" width="15%" />
            </div>
          ) : activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="card animate-fade-in">
              <h3 className="mb-6 text-base font-bold text-gray-900">Profile Settings</h3>
              <div className="form-row mb-4 flex gap-4">
                <div className="form-group flex-1">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-row mb-6 flex gap-4">
                <div className="form-group flex-1">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                  />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">Role</label>
                  <input type="text" className="form-input opacity-60" value={user?.role || ''} disabled />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                <HiOutlineSave /> {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'appearance' && (
            <div className="card animate-fade-in">
              <h3 className="mb-2 text-base font-bold text-gray-900">Appearance</h3>
              <p className="mb-6 text-sm text-gray-500">
                Choose how UniCRM looks. Defaults to your system setting.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {APPEARANCE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTheme(opt.value)}
                    className={`relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                      theme === opt.value
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600/20 dark:bg-indigo-950/40'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-[#1f2530] dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <opt.Icon className="h-6 w-6" />
                      {theme === opt.value && <HiOutlineCheck className="h-5 w-5 text-indigo-600" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{opt.label}</div>
                      <div className="mt-0.5 text-xs text-gray-500">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card animate-fade-in">
              <h3 className="mb-6 text-base font-bold text-gray-900">Notification Preferences</h3>
              {[
                { key: 'newLeadAssigned', label: 'New lead assigned', desc: 'Get notified when a new lead is assigned to you' },
                { key: 'followUpReminders', label: 'Follow-up reminders', desc: 'Receive reminders for upcoming follow-ups' },
                { key: 'leadConverted', label: 'Lead converted', desc: 'Get notified when a lead is successfully converted' },
                { key: 'escalationAlerts', label: 'Escalation alerts', desc: 'Receive alerts when follow-ups are escalated' },
                { key: 'dailyDigest', label: 'Daily digest', desc: 'Receive a daily summary of your leads and tasks' },
                { key: 'weeklyReport', label: 'Weekly report', desc: 'Receive weekly performance reports' },
              ].map((pref, i) => (
                <div key={pref.key} className={`flex items-center justify-between py-4 ${i < 5 ? 'border-b border-gray-100' : ''}`}>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{pref.label}</div>
                    <div className="text-xs text-gray-500">{pref.desc}</div>
                  </div>
                  <label className="relative inline-block h-6 w-11 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!preferences[pref.key]}
                      onChange={() => updatePreferences({ [pref.key]: !preferences[pref.key] })}
                      className="hidden"
                    />
                    <span className={`absolute inset-0 rounded-full transition-colors ${preferences[pref.key] ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-[left] ${preferences[pref.key] ? '!left-[22px]' : ''}`} />
                    </span>
                  </label>
                </div>
              ))}
              <button className="btn btn-primary mt-4" onClick={() => toast.success('Preferences saved!')}>
                <HiOutlineSave /> Save Preferences
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordUpdate} className="card animate-fade-in">
              <h3 className="mb-6 text-base font-bold text-gray-900">Security Settings</h3>
              <div className="form-group mb-4">
                <label className="form-label">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    className="form-input pr-10"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowCurrentPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                    {showCurrentPw ? <HiOutlineEyeOff className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="form-row mb-2 flex gap-4">
                <div className="form-group flex-1">
                  <label className="form-label">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      className="form-input pr-10"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                      {showNewPw ? <HiOutlineEyeOff className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? 'text' : 'password'}
                      className="form-input pr-10"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => setShowConfirmPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                      {showConfirmPw ? <HiOutlineEyeOff className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              {newPassword.length > 0 && (
                <div className="mb-5 rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Password must meet</div>
                  <div className="space-y-1.5">
                    {passwordRules.map((rule) => (
                      <div key={rule.label} className="flex items-center gap-2 text-xs">
                        <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${rule.met ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
                          {rule.met ? '✓' : ''}
                        </span>
                        <span className={rule.met ? 'text-emerald-600 font-medium' : 'text-gray-500'}>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button type="submit" className="btn btn-primary" disabled={savingPassword || !allRulesMet || !currentPassword}>
                <HiOutlineSave /> {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}

          {activeTab === 'permissions' && (
            <div className="card animate-fade-in">
              <h3 className="mb-2 text-base font-bold text-gray-900">Roles & Permissions</h3>
              <p className="mb-6 text-sm text-gray-500">
                Feature access granted to each role. Data scope shows how much data a role can see.
              </p>

              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Feature</th>
                      {ROLES.map(role => (
                        <th key={role} scope="col">{role}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ROLE_MATRIX.map(row => (
                      <tr key={row.capability}>
                        <td>
                          <div className="font-semibold text-gray-900">{row.capability}</div>
                          <div className="text-[0.7rem] text-gray-500">{row.detail}</div>
                        </td>
                        {ROLES.map(role => (
                          <td key={role}>
                            <span className={`badge ${ACCESS_BADGE[row.access[role]] || 'badge-failed'}`}>
                              {ACCESS_LABELS[row.access[role]] || row.access[role]}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
                {ROLES.map(role => (
                  <span key={role} className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> {role}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-gray-400" /> Values: Yes · No · All leads · Team leads · Assigned to me · Full access
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
