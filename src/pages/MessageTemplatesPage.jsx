import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlinePaperClip, HiOutlineDownload, HiOutlineDocument } from 'react-icons/hi';
import { useToast } from '../context/ToastContext';
import { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import Modal from '../components/Modal';
import { useFeatures } from '../hooks/useFeatures';
import { FeatureLocked } from '../components/FeatureLocked';
import { config } from '../config/env';

const CATEGORIES = ['GENERAL', 'WELCOME', 'FOLLOW_UP', 'PROMOTION', 'ADMISSION'];
const API_ROOT = config.apiUrl.replace(/\/api\/?$/, '');

const formatSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

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
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

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

  const handleUploadAttachment = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editTemplate?.id) return;
    try {
      setUploading(true);
      await api.templates.uploadAttachment(editTemplate.id, file);
      toast.success('Attachment uploaded');
      const fresh = await api.templates.getAll();
      if (fresh && fresh.success && fresh.data) {
        const updated = fresh.data.templates.find((t) => t.id === editTemplate.id);
        if (updated) setEditTemplate(updated);
      }
      fetchTemplates();
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleRemoveAttachment = async (attachmentId) => {
    if (!editTemplate?.id) return;
    try {
      await api.templates.removeAttachment(editTemplate.id, attachmentId);
      toast.success('Attachment removed');
      const fresh = await api.templates.getAll();
      if (fresh && fresh.success && fresh.data) {
        const updated = fresh.data.templates.find((t) => t.id === editTemplate.id);
        if (updated) setEditTemplate(updated);
      }
      fetchTemplates();
    } catch (error) {
      toast.error(error.message || 'Failed to remove attachment');
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
                <th>Attachments</th>
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
                    {t.attachments && t.attachments.length > 0 ? (
                      <div className="flex max-w-[180px] flex-col gap-1">
                        {t.attachments.map((a) => (
                          <a
                            key={a.id}
                            href={`${API_ROOT}${a.url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline"
                            title={a.originalName}
                          >
                            <HiOutlinePaperClip className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{a.originalName}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
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
            <textarea className="form-input" rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required placeholder='Hi {{name}}, welcome to {{university}}. Your {{course}} ({{intake}}) inquiry received. Reach us at {{phone}}.' />
            <span className="text-xs text-gray-500">Available variables: {`{{name}} {{phone}} {{course}} {{intake}} {{university}}`}</span>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>

          <div>
            <label className="form-label">Attachments</label>
            {editTemplate ? (
              <div className="flex flex-col gap-2">
                {editTemplate.attachments && editTemplate.attachments.length > 0 ? (
                  editTemplate.attachments.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                      <HiOutlineDocument className="h-4 w-4 shrink-0 text-gray-400" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-gray-700">{a.originalName}</div>
                        <div className="text-xs text-gray-400">{formatSize(a.size)}</div>
                      </div>
                      <a href={`${API_ROOT}${a.url}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" title="Download">
                        <HiOutlineDownload />
                      </a>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm text-red-600"
                        aria-label={`Remove ${a.originalName}`}
                        onClick={() => handleRemoveAttachment(a.id)}
                        title="Remove"
                      >
                        <HiOutlineTrash />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No attachments yet.</p>
                )}
                <input ref={fileRef} type="file" className="hidden" onChange={handleUploadAttachment} />
                <button type="button" className="btn btn-outline btn-sm self-start" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  <HiOutlinePlus /> {uploading ? 'Uploading...' : 'Add File'}
                </button>
                <p className="text-xs text-gray-400">PDF, image, Word, Excel, text, or CSV. Max 10MB per file.</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Save the template first, then reopen it to attach files.</p>
            )}
          </div>
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
