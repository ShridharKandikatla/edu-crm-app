import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineBan,
  HiOutlineCheckCircle, HiOutlineX, HiOutlineEye, HiOutlineEyeOff,
  HiOutlineChevronLeft, HiOutlineChevronRight,
} from 'react-icons/hi';
import { useToast } from '../context/ToastContext';
import { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';

const ROLE_COLORS = {
  ADMIN: '#4f46e5',
  MANAGER: '#7c3aed',
  COUNSELOR: '#059669',
  TELECALLER: '#0ea5e9'
};

const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  const [usersList, setUsersList] = useState([]);
  const [counselorStats, setCounselorStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 12;
  
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  
  const [form, setForm] = useState({
    name: '', email: '', phone: '', role: 'COUNSELOR', monthlyTarget: 0, password: '', subscriptionExpiresAt: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: pageSize };
      if (roleFilter !== 'ALL') params.role = roleFilter;
      const [usersRes, reportRes] = await Promise.all([
        api.users.getAll(params),
        api.reports.getCounselorReport().catch(() => ({ success: false, data: { report: [] } }))
      ]);
      if (usersRes.success) {
        setUsersList(usersRes.data || []);
        setTotal(usersRes.pagination?.total || 0);
      }
      if (reportRes.success) setCounselorStats(reportRes.data.report || []);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [currentPage, roleFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredUsers = usersList;

  const getUserStats = (user) => {
    const stat = counselorStats.find(s => s.id === user.id);
    if (stat) {
      return {
        assigned: stat.assigned || 0,
        converted: stat.converted || 0,
        pending: stat.pendingFollowUps || 0
      };
    }
    // Fallback count metadata from list
    return {
      assigned: user._count?.assignedLeads || 0,
      converted: 0,
      pending: user._count?.followUps || 0
    };
  };

  const openAddModal = () => {
    setEditUser(null);
    setForm({ name: '', email: '', phone: '', role: 'COUNSELOR', monthlyTarget: 0, password: '', subscriptionExpiresAt: '' });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      monthlyTarget: user.monthlyTarget,
      password: '', // Don't pre-fill password
      subscriptionExpiresAt: user.subscriptionExpiresAt ? toLocalInput(user.subscriptionExpiresAt) : ''
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'monthlyTarget' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editUser) {
        // Edit User
        const payload = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          monthlyTarget: form.monthlyTarget,
          subscriptionExpiresAt: form.subscriptionExpiresAt ? new Date(form.subscriptionExpiresAt).toISOString() : null
        };
        await api.users.update(editUser.id, payload);
        toast.success('User updated successfully!');
      } else {
        // Create User (maps to register endpoint)
        const payload = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          monthlyTarget: form.monthlyTarget,
          password: form.password || 'password123'
        };
        await api.auth.register(payload);
        toast.success('User created successfully!');
        setCurrentPage(1);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (userToToggle) => {
    setToggleTarget(userToToggle);
    setConfirmOpen(true);
  };

  const confirmToggleActive = async () => {
    if (!toggleTarget) return;
    const newStatus = !toggleTarget.isActive;
    setConfirmLoading(true);
    try {
      await api.users.update(toggleTarget.id, { isActive: newStatus });
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      setConfirmOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to toggle status');
    } finally {
      setConfirmLoading(false);
      setToggleTarget(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">User Management</h2>
          <p className="page-subtitle">{total} users in the system</p>
        </div>
        {currentUser?.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={openAddModal}>
            <HiOutlinePlus /> Add User
          </button>
        )}
      </div>

      <div className="filter-bar mb-6 overflow-x-auto">
        <span className="text-xs font-semibold text-gray-700 shrink-0">Role:</span>
        {['ALL', 'ADMIN', 'MANAGER', 'COUNSELOR', 'TELECALLER'].map(role => (
          <button
            key={role}
            className={`btn ${roleFilter === role ? 'btn-primary' : 'btn-secondary'} btn-sm shrink-0`}
            aria-label={`Filter by ${role === 'ALL' ? 'all roles' : role}`}
            aria-pressed={roleFilter === role}
            onClick={() => { setRoleFilter(role); setCurrentPage(1); }}
          >
            {role === 'ALL' ? 'All Roles' : role}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon="👥"
          title={roleFilter === 'ALL' ? 'No users in the system' : `No ${roleFilter.toLowerCase()} users found`}
          text={roleFilter === 'ALL' ? 'Add a user to get started.' : 'Try a different role filter.'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">
          {filteredUsers.map(user => {
            const stats = getUserStats(user);
            const userColor = ROLE_COLORS[user.role] || '#6b7280';
            const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            
            return (
              <div key={user.id} className="card relative">
                {!user.isActive && (
                  <div className="absolute right-3 top-3 rounded-full bg-red-50 px-2 py-0.5 text-[0.7rem] font-semibold text-red-600">
                    Inactive
                  </div>
                )}
                <div className="mb-5 flex items-center gap-3.5">
                  <div
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
                    style={{ background: userColor }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1">
                    <div className="text-[0.9375rem] font-bold text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                    <span className={`badge mt-1 inline-flex ${
                      user.role === 'ADMIN' ? 'badge-new' :
                      user.role === 'MANAGER' ? 'badge-follow-up' :
                      user.role === 'COUNSELOR' ? 'badge-converted' : 'badge-interested'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-3 gap-3">
                  <div className="rounded-[10px] bg-gray-50 p-2.5 text-center">
                    <div className="text-lg font-extrabold text-gray-900">{stats.assigned}</div>
                    <div className="text-[0.65rem] font-medium text-gray-500">Assigned</div>
                  </div>
                  <div className="rounded-[10px] bg-emerald-50 p-2.5 text-center">
                    <div className="text-lg font-extrabold text-emerald-600">{stats.converted}</div>
                    <div className="text-[0.65rem] font-medium text-gray-500">Converted</div>
                  </div>
                  <div className="rounded-[10px] bg-amber-50 p-2.5 text-center">
                    <div className="text-lg font-extrabold text-amber-600">{stats.pending}</div>
                    <div className="text-[0.65rem] font-medium text-gray-500">Pending</div>
                  </div>
                </div>

                {/* Target Progress */}
                {user.monthlyTarget > 0 && (
                  <div className="mb-4">
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-gray-500">Monthly Target</span>
                      <span className="font-semibold text-gray-700">{stats.converted}/{user.monthlyTarget}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full transition-[width] duration-700 ease-in-out"
                        style={{
                          width: `${Math.min((stats.converted / user.monthlyTarget) * 100, 100)}%`,
                          background: `linear-gradient(90deg, ${stats.converted >= user.monthlyTarget ? '#10b981' : '#6366f1'}, ${stats.converted >= user.monthlyTarget ? '#059669' : '#4f46e5'})`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {currentUser?.role === 'ADMIN' && (
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm flex-1" aria-label={`Edit ${user.name}`} onClick={() => openEditModal(user)}>
                      <HiOutlinePencil /> Edit
                    </button>
                    {user.id !== currentUser.id && (
                      <button
                        className={`btn ${user.isActive ? 'btn-danger' : 'btn-success'} btn-sm flex-1`}
                        aria-label={user.isActive ? `Deactivate ${user.name}` : `Activate ${user.name}`}
                        onClick={() => handleToggleActive(user)}
                      >
                        {user.isActive ? <><HiOutlineBan /> Deactivate</> : <><HiOutlineCheckCircle /> Activate</>}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {total > 0 && (
        <div className="data-table-footer mt-6">
          <span>Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, total)} of {total}</span>
          <div className="pagination">
            <button className="pagination-btn" disabled={currentPage === 1} aria-label="Previous page" aria-disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              <HiOutlineChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i + 1} className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`} aria-current={currentPage === i + 1 ? 'page' : undefined} onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </button>
            ))}
            <button className="pagination-btn" disabled={currentPage === totalPages} aria-label="Next page" aria-disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              <HiOutlineChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="modal-overlay fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="modal w-[90%] max-w-[500px] rounded-2xl bg-white dark:bg-[#1f2530] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header mb-4 flex items-center justify-between">
              <h3 className="modal-title text-xl font-bold">
                {editUser ? 'Edit User details' : 'Add New User'}
              </h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowModal(false)}>
                <HiOutlineX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="form-row flex gap-4">
                  <div className="form-group flex-1">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-input"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="user@university.edu"
                      required
                      disabled={!!editUser}
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
                <div className="form-row flex gap-4">
                  <div className="form-group flex-1">
                    <label className="form-label">Role *</label>
                    <select className="form-select" name="role" value={form.role} onChange={handleChange} required>
                      <option value="COUNSELOR">Counselor</option>
                      <option value="TELECALLER">Telecaller</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div className="form-group flex-1">
                    <label className="form-label">Monthly Target</label>
                    <input
                      type="number"
                      className="form-input"
                      name="monthlyTarget"
                      value={form.monthlyTarget}
                      onChange={handleChange}
                      placeholder="e.g. 40"
                    />
                  </div>
                </div>
                {editUser && (
                  <div className="form-group">
                    <label className="form-label">Subscription Expires At</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      name="subscriptionExpiresAt"
                      value={form.subscriptionExpiresAt}
                      onChange={handleChange}
                    />
                    {form.subscriptionExpiresAt ? (
                      new Date(form.subscriptionExpiresAt) > new Date() ? (
                        <p className="mt-1 text-xs text-emerald-600">
                          Active until {new Date(form.subscriptionExpiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-red-600">Subscription expired — premium features are gated</p>
                      )
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">No subscription set — premium (AI, WhatsApp) features are gated</p>
                    )}
                  </div>
                )}
                {!editUser && (
                  <div className="form-group">
                    <label className="form-label">Initial Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input pr-10"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Set initial password (min 6 characters)"
                        minLength={6}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                        {showPassword ? <HiOutlineEyeOff className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer mt-5 flex justify-end gap-3">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setToggleTarget(null); }}
        onConfirm={confirmToggleActive}
        title={toggleTarget ? `${!toggleTarget.isActive ? 'Activate' : 'Deactivate'} User` : 'Toggle User'}
        message={toggleTarget ? `Are you sure you want to ${!toggleTarget.isActive ? 'activate' : 'deactivate'} user ${toggleTarget.name}?` : ''}
        confirmText={toggleTarget ? (!toggleTarget.isActive ? 'Activate' : 'Deactivate') : 'Confirm'}
        danger={toggleTarget?.isActive}
        loading={confirmLoading}
      />
    </div>
  );
}
