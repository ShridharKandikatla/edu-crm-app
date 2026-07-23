import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { HiOutlineSave, HiOutlineBell, HiOutlineShieldCheck, HiOutlineUser } from 'react-icons/hi';
import { useToast } from '../context/ToastContext';
import { SkeletonBlock } from '../components/Skeleton';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
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
  const [settingsLoading, setSettingsLoading] = useState(true);
  const { preferences, updatePreferences } = useNotificationPreferences();

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

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Manage your account and system preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-[240px_1fr] gap-6">
        {/* Settings Nav */}
        <div className="card h-fit p-3" role="tablist" aria-label="Settings sections">
          {[
            { key: 'profile', label: 'Profile', icon: HiOutlineUser },
            { key: 'notifications', label: 'Notifications', icon: HiOutlineBell },
            { key: 'security', label: 'Security', icon: HiOutlineShieldCheck },
          ].map(item => (
            <button
              key={item.key}
              className={`sidebar-link w-full border-none text-left ${activeTab === item.key ? 'active' : ''}`}
              style={{ color: activeTab === item.key ? '#4f46e5' : '#6b7280', background: activeTab === item.key ? '#eef2ff' : 'transparent' }}
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
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-row mb-6 flex gap-4">
                <div className="form-group flex-1">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingPassword}>
                <HiOutlineSave /> {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
