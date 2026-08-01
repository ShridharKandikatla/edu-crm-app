import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { useToast } from '../context/ToastContext';
import { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import Modal from '../components/Modal';
import { useFeatures } from '../hooks/useFeatures';
import { FeatureLocked } from '../components/FeatureLocked';

const CATEGORIES = ['GENERAL', 'WELCOME', 'FOLLOW_UP', 'PROMOTION', 'ADMISSION'];

export default function MessageTemplatesPage() {
  const { toast } = useToast();
  const features = useFeatures();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [form, setForm] = useState({ name: '', body: '', category: 'GENERAL', isActive: true });
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.templates.getAll();
      if (res && res.success && res.data) {
        setTemplates(res.data.templates || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (features.CAMPAIGNS) fetchTemplates();
  }, [features.CAMPAIGNS]);

  if (!features.CAMPAIGNS) return <FeatureLocked feature="CAMPAIGNS" />;

  const openAddModal = () => {
    setEditTemplate(null);
    setForm({ name: '', body: '', category: 'GENERAL', isActive: true });
    setShowModal(true);
  };

  const openEditModal = (t) => {
    setEditTemplate(t);
    setForm({ name: t.name, body: t.body, category: t.category || 'GENERAL', isActive: t.isActive });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.body.trim()) return;
    try {
      setSubmitting(true);
      if (editTemplate) {
        await api.templates.update(editTemplate.id, form);
        toast.success('Template updated');
      } else {
        await api.templates.create(form);
        toast.success('Template created');
      }
      setShowModal(false);
      fetchTemplates();
    } catch (error) {
      toast.error(error.message || 'Failed to save template');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setConfirmOpen(false);
      await api.templates.remove(deleteTarget);
      toast.success('Template deleted');
      fetchTemplates();
    } catch (error) {
      toast.error(error.message || 'Failed to delete template');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Message Templates</h2>
          <p className="page-subtitle">Reusable messages for WhatsApp and campaign outreach</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <HiOutlinePlus /> New Template
        </button>
      </div>

      {loading ? (
        <SkeletonCard />
      ) : templates.length === 0 ? (
        <EmptyState
          icon="💬"
          title="No templates yet"
          message="Create message templates to send consistent replies across channels."
          action={<button className="btn btn-primary" onClick={openAddModal}><HiOutlinePlus /> New Template</button>}
        />
      ) : (
        <div className="data-table-wrapper overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Message</th>
                <th>Status</th>
                <th className="w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id}>
                  <td className="font-semibold">{t.name}</td>
                  <td><span className="badge badge-secondary">{t.category}</span></td>
                  <td className="max-w-[280px] truncate text-gray-500">{t.body}</td>
                  <td>
                    <span className={`badge ${t.isActive ? 'badge-success' : 'badge-neutral'}`}>
                      {t.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-sm" aria-label="Edit template" onClick={() => openEditModal(t)}>
                        <HiOutlinePencil />
                      </button>
                      <button className="btn btn-ghost btn-sm text-red-600" aria-label="Delete template" onClick={() => { setDeleteTarget(t.id); setConfirmOpen(true); }}>
                        <HiOutlineTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editTemplate ? 'Edit Template' : 'New Template'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || !form.name.trim() || !form.body.trim()}>
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Initial Welcome" />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Message Body</label>
            <textarea className="form-input" rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required placeholder="Hi {{name}}, ..." />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>
        </form>
      </Modal>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Template"
        message="Are you sure you want to delete this template?"
        confirmText="Delete"
      />
    </div>
  );
}
