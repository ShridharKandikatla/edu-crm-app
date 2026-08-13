import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HiOutlinePlus, HiOutlineSearch } from 'react-icons/hi';
import { useToast } from '../context/ToastContext';
import { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import Modal from '../components/Modal';
import ApplicationDetail from '../components/applications/ApplicationDetail';
import { useCoursesAndIntakes } from '../hooks/useCoursesAndIntakes';

const STATUS_OPTIONS = ['INQUIRY', 'APPLIED', 'OFFERED', 'ENROLLED'];
const FEE_STATUS_OPTIONS = ['PENDING', 'PARTIAL', 'PAID'];
const STATUS_LABELS = { INQUIRY: 'Inquiry', APPLIED: 'Applied', OFFERED: 'Offer', ENROLLED: 'Enrolled' };
const STATUS_BADGES = {
  INQUIRY: 'badge-app-inquiry', APPLIED: 'badge-app-applied', OFFERED: 'badge-app-offered', ENROLLED: 'badge-app-enrolled',
};
const FEE_BADGES = { PENDING: 'badge-fee-pending', PARTIAL: 'badge-fee-partial', PAID: 'badge-fee-paid' };

const fmtCurrency = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

export default function ApplicationsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [feeStatus, setFeeStatus] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimer = useRef(null);

  const { courses, intakes } = useCoursesAndIntakes();

  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [leadQuery, setLeadQuery] = useState('');
  const [leadResults, setLeadResults] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadSearching, setLeadSearching] = useState(false);
  const [createForm, setCreateForm] = useState({ courseId: '', intakeId: '', feeTotal: '', status: 'INQUIRY' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.applications.getAll({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: status || undefined,
        feeStatus: feeStatus || undefined,
      });
      if (res && res.success) {
        setApplications(res.data || []);
        setTotal(res.pagination?.total || 0);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, status, feeStatus]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const searchLeads = async (query) => {
    if (!query.trim()) {
      setLeadResults([]);
      return;
    }
    try {
      setLeadSearching(true);
      const res = await api.leads.getAll({ search: query.trim(), limit: 8 });
      if (res && res.success) setLeadResults(res.data || []);
    } catch {
      setLeadResults([]);
    } finally {
      setLeadSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => searchLeads(leadQuery), 350);
    return () => clearTimeout(timer);
  }, [leadQuery]);

  const openDetail = async (app) => {
    try {
      const res = await api.applications.getById(app.id);
      if (res?.success && res.data?.application) {
        setSelected(res.data.application);
      } else {
        setSelected(app);
      }
    } catch {
      setSelected(app);
    }
    setShowDetail(true);
  };

  const refreshDetail = (app) => {
    setSelected(app);
    fetchApplications();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      setSubmitting(true);
      await api.applications.create({
        leadId: selectedLead.id,
        courseId: createForm.courseId || undefined,
        intakeId: createForm.intakeId || undefined,
        feeTotal: createForm.feeTotal ? parseFloat(createForm.feeTotal) : 0,
        status: createForm.status,
      });
      toast.success('Application created');
      setShowCreate(false);
      setSelectedLead(null);
      setLeadQuery('');
      setCreateForm({ courseId: '', intakeId: '', feeTotal: '', status: 'INQUIRY' });
      setPage(1);
      fetchApplications();
    } catch (error) {
      toast.error(error.message || 'Failed to create application');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      setConfirmLoading(true);
      await api.applications.remove(selected.id);
      setConfirmOpen(false);
      toast.success('Application deleted');
      setShowDetail(false);
      setSelected(null);
      fetchApplications();
    } catch (error) {
      toast.error(error.message || 'Failed to delete application');
    } finally {
      setConfirmLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Applications &amp; Fee Tracking</h2>
          <p className="page-subtitle">Admissions pipeline: inquiry → applied → offer → enrolled</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <HiOutlinePlus /> New Application
        </button>
      </div>

      <div className="filter-bar mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="form-input"
            style={{ paddingLeft: '2.25rem', width: '100%' }}
            placeholder="Search by name, phone, email or app number..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="form-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select className="form-select" value={feeStatus} onChange={(e) => { setFeeStatus(e.target.value); setPage(1); }}>
          <option value="">All fee statuses</option>
          {FEE_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <SkeletonCard />
      ) : applications.length === 0 ? (
        <EmptyState
          icon="📄"
          title="No applications yet"
          message="Create an application for a lead to start tracking documents and fees."
          action={<button className="btn btn-primary" onClick={() => setShowCreate(true)}><HiOutlinePlus /> New Application</button>}
        />
      ) : (
        <>
          <div className="data-table-wrapper overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Intake</th>
                  <th>Status</th>
                  <th>Fee Status</th>
                  <th>Documents</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const feePct = app.feeTotal > 0 ? Math.min(100, Math.round(((app.feePaid || 0) / app.feeTotal) * 100)) : 0;
                  return (
                    <tr key={app.id} className="cursor-pointer" onClick={() => openDetail(app)}>
                      <td className="font-semibold text-indigo-600">{app.applicationNumber}</td>
                      <td>
                        <div className="font-medium text-gray-800">{app.lead?.name || '—'}</div>
                        <div className="text-xs text-gray-500">{app.lead?.phone || ''}</div>
                      </td>
                      <td className="text-gray-600">{app.course?.name || '—'}</td>
                      <td className="text-gray-500">{app.intake?.name || '—'}</td>
                      <td>
                        <span className={`badge ${STATUS_BADGES[app.status] || 'badge-app-inquiry'}`}>
                          {STATUS_LABELS[app.status] || app.status}
                        </span>
                      </td>
                      <td>
                        <div className="text-xs">
                          <span className={`badge ${FEE_BADGES[app.feeStatus] || 'badge-fee-pending'}`}>{app.feeStatus}</span>
                          <div className="mt-1 text-gray-500">{feePct}% · {fmtCurrency(app.feePaid || 0)}/{fmtCurrency(app.feeTotal || 0)}</div>
                        </div>
                      </td>
                      <td className="text-gray-500">{app._count?.documents ?? app.documents?.length ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}</span>
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
                <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* New Application modal */}
      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); setSelectedLead(null); setLeadQuery(''); setCreateForm({ courseId: '', intakeId: '', feeTotal: '', status: 'INQUIRY' }); }}
        title="New Application"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowCreate(false)} disabled={submitting}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={submitting || !selectedLead}>
              {submitting ? 'Creating...' : 'Create Application'}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Find Lead</label>
            <input
              className="form-input"
              placeholder="Search by name or phone..."
              value={leadQuery}
              onChange={(e) => setLeadQuery(e.target.value)}
            />
            {leadSearching && <div className="mt-2 text-xs text-gray-500">Searching...</div>}
            {leadResults.length > 0 && (
              <ul className="mt-2 max-h-48 divide-y divide-gray-100 overflow-auto rounded-lg border border-gray-200">
                {leadResults.map((lead) => (
                  <li key={lead.id}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-gray-50"
                      onClick={() => {
                        setSelectedLead(lead);
                        setLeadResults([]);
                        setCreateForm((f) => ({ ...f, courseId: lead.courseId || '', intakeId: lead.intakeId || '' }));
                      }}
                    >
                      <div className="text-sm font-medium text-gray-800">{lead.name}</div>
                      <div className="text-xs text-gray-500">{lead.phone} · {lead.course?.name || 'No course'}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {selectedLead && (
              <div className="mt-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-800 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-300">
                Selected: <strong>{selectedLead.name}</strong> ({selectedLead.phone})
              </div>
            )}
          </div>

          {selectedLead && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Course</label>
                  <select className="form-select" value={createForm.courseId} onChange={(e) => setCreateForm({ ...createForm, courseId: e.target.value })}>
                    <option value="">— Select course —</option>
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Intake</label>
                  <select className="form-select" value={createForm.intakeId} onChange={(e) => setCreateForm({ ...createForm, intakeId: e.target.value })}>
                    <option value="">— Select intake —</option>
                    {intakes.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Total Fee (₹)</label>
                  <input className="form-input" type="number" min="0" value={createForm.feeTotal} onChange={(e) => setCreateForm({ ...createForm, feeTotal: e.target.value })} placeholder="e.g. 50000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={createForm.status} onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Detail modal */}
      <Modal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        title={selected ? `Application ${selected.applicationNumber}` : 'Application'}
        size="lg"
        footer={
          canManage && selected ? (
            <button className="btn btn-ghost text-red-600" onClick={() => setConfirmOpen(true)}>Delete Application</button>
          ) : null
        }
      >
        {selected && (
          <ApplicationDetail
            application={selected}
            courses={courses}
            intakes={intakes}
            onRefresh={refreshDetail}
          />
        )}
      </Modal>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Application"
        message="Are you sure you want to delete this application? This also removes its documents and fee payments."
        confirmText="Delete"
        loading={confirmLoading}
      />
    </div>
  );
}
