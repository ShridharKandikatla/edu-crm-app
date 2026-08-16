import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { useToast } from '../context/ToastContext';
import { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import Modal from '../components/Modal';
import { useFeatures } from '../hooks/useFeatures';
import { FeatureLocked } from '../components/FeatureLocked';

const SOURCE_OPTIONS = ['WEBSITE', 'FACEBOOK', 'GOOGLE_ADS', 'INSTAGRAM', 'JUSTDIAL', 'WALK_IN', 'REFERRAL', 'PHONE_INQUIRY', 'EMAIL_INQUIRY', 'EVENT', 'WHATSAPP', 'CAMPAIGN', 'OTHER'];

const emptyForm = {
  name: '', source: 'FACEBOOK', platform: '', monthlyBudget: '', startDate: '', endDate: '', notes: '',
};

export default function CampaignsPage() {
  const { toast } = useToast();
  const features = useFeatures();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCampaign, setEditCampaign] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await api.campaigns.getAll({ page: currentPage, limit: pageSize });
      if (res && res.success) {
        setCampaigns(res.data || []);
        setTotal(res.pagination?.total || 0);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (features.CAMPAIGNS) fetchCampaigns();
  }, [features.CAMPAIGNS, currentPage]);

  if (!features.CAMPAIGNS) return <FeatureLocked feature="CAMPAIGNS" />;

  const openAddModal = () => {
    setEditCampaign(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setEditCampaign(c);
    setForm({
      name: c.name,
      source: c.source,
      platform: c.platform || '',
      monthlyBudget: c.monthlyBudget ?? '',
      startDate: c.startDate ? c.startDate.slice(0, 10) : '',
      endDate: c.endDate ? c.endDate.slice(0, 10) : '',
      notes: c.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.source) return;
    try {
      setSubmitting(true);
      const payload = {
        name: form.name,
        source: form.source,
        platform: form.platform || null,
        monthlyBudget: form.monthlyBudget ? parseFloat(form.monthlyBudget) : 0,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        notes: form.notes || null,
      };
      if (editCampaign) {
        await api.campaigns.update(editCampaign.id, payload);
        toast.success('Campaign updated');
      } else {
        await api.campaigns.create(payload);
        toast.success('Campaign created');
        setCurrentPage(1);
      }
      setShowModal(false);
      fetchCampaigns();
    } catch (error) {
      toast.error(error.message || 'Failed to save campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setConfirmLoading(true);
      await api.campaigns.remove(deleteTarget);
      setConfirmOpen(false);
      toast.success('Campaign deleted');
      setCurrentPage(1);
      fetchCampaigns();
    } catch (error) {
      toast.error(error.message || 'Failed to delete campaign');
    } finally {
      setConfirmLoading(false);
      setDeleteTarget(null);
    }
  };

  const fmtCurrency = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Marketing Campaigns</h2>
          <p className="page-subtitle">Track ad spend per source to measure ROI</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <HiOutlinePlus /> New Campaign
        </button>
      </div>

      {loading ? (
        <SkeletonCard />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon="📣"
          title="No campaigns yet"
          message="Add your ad campaigns with monthly budgets to see spend, CPL and ROI in reports."
          action={<button className="btn btn-primary" onClick={openAddModal}><HiOutlinePlus /> New Campaign</button>}
        />
      ) : (
        <div className="data-table-wrapper overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Source</th>
                <th>Platform</th>
                <th>Monthly Budget</th>
                <th>Period</th>
                <th className="w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold">{c.name}</td>
                  <td><span className="badge badge-secondary">{c.source.replace(/_/g, ' ')}</span></td>
                  <td className="text-gray-500">{c.platform || '—'}</td>
                  <td className="font-bold text-indigo-600">{fmtCurrency(c.monthlyBudget)}</td>
                  <td className="text-gray-500">
                    {c.startDate ? `${c.startDate.slice(0, 10)} → ${c.endDate ? c.endDate.slice(0, 10) : 'ongoing'}` : '—'}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-sm" aria-label="Edit campaign" onClick={() => openEditModal(c)}>
                        <HiOutlinePencil />
                      </button>
                      <button className="btn btn-ghost btn-sm text-red-600" aria-label="Delete campaign" onClick={() => { setDeleteTarget(c.id); setConfirmOpen(true); }}>
                        <HiOutlineTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {campaigns.length > 0 && (
            <div className="data-table-footer">
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
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editCampaign ? 'Edit Campaign' : 'New Campaign'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || !form.name.trim()}>
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Campaign Name</label>
            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. FB Summer Promo" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="form-group">
              <label className="form-label">Source</label>
              <select className="form-select" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Platform</label>
              <input className="form-input" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="e.g. Meta Ads" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="form-group">
              <label className="form-label">Monthly Budget (₹)</label>
              <input className="form-input" type="number" min="0" value={form.monthlyBudget} onChange={(e) => setForm({ ...form, monthlyBudget: e.target.value })} placeholder="e.g. 100000" />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <input className="form-input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional note" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input className="form-input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input className="form-input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Campaign"
        message="Are you sure you want to delete this campaign?"
        confirmText="Delete"
        loading={confirmLoading}
      />
    </div>
  );
}
