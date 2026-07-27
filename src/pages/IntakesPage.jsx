import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX,
  HiOutlineCalendar, HiOutlineCheckCircle,
} from 'react-icons/hi';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';

export default function IntakesPage() {
  const { toast } = useToast();
  const [intakes, setIntakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editIntake, setEditIntake] = useState(null);

  const defaultForm = { name: '', startDate: '', endDate: '', isActive: true };
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchIntakes = async () => {
    try {
      setLoading(true);
      const res = await api.courses.getAllIntakes();
      if (res?.success && res.data) {
        setIntakes(res.data.intakes || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIntakes(); }, []);

  const openAddModal = () => {
    setEditIntake(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEditModal = (intake) => {
    setEditIntake(intake);
    setForm({
      name: intake.name,
      startDate: intake.startDate ? new Date(intake.startDate).toISOString().split('T')[0] : '',
      endDate: intake.endDate ? new Date(intake.endDate).toISOString().split('T')[0] : '',
      isActive: intake.isActive,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      toast.error('End date must be after start date');
      return;
    }
    try {
      setSubmitting(true);
      if (editIntake) {
        await api.courses.updateIntake(editIntake.id, form);
        toast.success('Intake updated successfully!');
      } else {
        await api.courses.createIntake(form);
        toast.success('Intake created successfully!');
      }
      setShowModal(false);
      fetchIntakes();
    } catch (error) {
      toast.error(error.message || 'Failed to save intake');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (intake) => {
    setDeleteTarget(intake);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setConfirmOpen(false);
      await api.courses.deleteIntake(deleteTarget.id);
      toast.success('Intake deleted!');
      fetchIntakes();
    } catch (error) {
      toast.error(error.message || 'Failed to delete intake');
    } finally {
      setDeleteTarget(null);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const now = new Date();
  const isActive = (intake) => {
    const start = new Date(intake.startDate);
    const end = new Date(intake.endDate);
    return start <= now && end >= now;
  };
  const isUpcoming = (intake) => new Date(intake.startDate) > now;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Academic Intakes</h2>
          <p className="page-subtitle">{intakes.length} intake{intakes.length !== 1 ? 's' : ''} configured</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <HiOutlinePlus /> Add Intake
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500">
          <div className="spinner mx-auto mb-4 h-[30px] w-[30px] rounded-full border-[3px] border-black/10 border-l-indigo-600 animate-spin" />
          <p>Loading intakes...</p>
        </div>
      ) : intakes.length === 0 ? (
        <EmptyState icon="📅" title="No intakes found" text="Add an academic intake to get started." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Start Date</th>
                <th scope="col">End Date</th>
                <th scope="col">Status</th>
                <th scope="col">Leads</th>
                <th className="w-[100px]" scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {intakes.map((intake) => {
                const active = isActive(intake);
                const upcoming = isUpcoming(intake);

                return (
                  <tr key={intake.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <HiOutlineCalendar className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-[0.875rem] font-semibold text-gray-900">{intake.name}</div>
                          <div className="text-[0.7rem] text-gray-400">
                            {Math.ceil((new Date(intake.endDate) - new Date(intake.startDate)) / (1000 * 60 * 60 * 24 * 30))} months
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-[0.8125rem]">{formatDate(intake.startDate)}</td>
                    <td className="text-[0.8125rem]">{formatDate(intake.endDate)}</td>
                    <td>
                      {intake.isActive ? (
                        <span className={`badge ${active ? 'badge-converted' : upcoming ? 'badge-interested' : 'badge-new'}`}>
                          <HiOutlineCheckCircle className="inline h-3 w-3" />
                          {active ? 'Active Now' : upcoming ? 'Upcoming' : 'Completed'}
                        </span>
                      ) : (
                        <span className="badge badge-failed">Disabled</span>
                      )}
                    </td>
                    <td className="text-[0.8125rem] font-semibold">{intake._count?.leads || 0}</td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-ghost btn-icon btn-sm" aria-label={`Edit ${intake.name}`} onClick={() => openEditModal(intake)}>
                          <HiOutlinePencil />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm text-red-600" aria-label={`Delete ${intake.name}`} onClick={() => handleDelete(intake)}>
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="modal w-[90%] max-w-[480px] rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header mb-4 flex items-center justify-between">
              <h3 className="modal-title text-xl font-bold">
                {editIntake ? 'Edit Intake' : 'Add New Intake'}
              </h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowModal(false)}>
                <HiOutlineX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Intake Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Fall 2026, Spring 2027"
                    required
                    minLength={2}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="form-group flex-1">
                    <label className="form-label">Start Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label className="form-label">End Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group mt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  <label htmlFor="isActive" className="form-label mb-0 cursor-pointer">Active</label>
                </div>
              </div>
              <div className="modal-footer mt-5 flex justify-end gap-3">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editIntake ? 'Update Intake' : 'Create Intake'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setDeleteTarget(null); }}
        onConfirm={confirmDelete}
        title="Delete Intake"
        message={deleteTarget ? `Delete intake "${deleteTarget.name}"? This cannot be undone.` : ''}
        confirmText="Delete"
        danger
      />
    </div>
  );
}
