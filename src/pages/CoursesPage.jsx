import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
  HiOutlineAcademicCap, HiOutlineX, HiOutlinePhotograph,
} from 'react-icons/hi';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';

export default function CoursesPage() {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const canManage = hasPermission('manage_courses');
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  
  // Form states
  const [form, setForm] = useState({
    name: '', department: '', duration: '', fee: '', image: '', seats: '', isActive: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.courses.getAll();
      if (res && res.success && res.data) {
        setCoursesList(res.data.courses || []);
      }
    } catch {
      // Course fetch failed silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openAddModal = () => {
    setEditCourse(null);
    setForm({ name: '', department: '', duration: '', fee: '', image: '', seats: '', isActive: true });
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setEditCourse(course);
    setForm({
      name: course.name,
      department: course.department,
      duration: course.duration,
      fee: course.fee,
      image: course.image || '',
      seats: course.seats || '',
      isActive: course.isActive
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...form,
        fee: parseFloat(form.fee),
        seats: form.seats ? parseInt(form.seats) : null,
        image: form.image || null,
      };

      if (editCourse) {
        await api.courses.update(editCourse.id, payload);
        toast.success('Course updated successfully!');
      } else {
        await api.courses.create(payload);
        toast.success('Course created successfully!');
      }
      setShowModal(false);
      fetchCourses();
    } catch (error) {
      toast.error(error.message || 'Failed to save course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteTarget(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setConfirmOpen(false);
      setLoading(true);
      await api.courses.delete(deleteTarget);
      toast.success('Course deleted successfully!');
      fetchCourses();
    } catch (error) {
      toast.error(error.message || 'Failed to delete course');
      setLoading(false);
    } finally {
      setDeleteTarget(null);
    }
  };

  const departments = [...new Set(coursesList.map(c => c.department))];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Courses</h2>
          <p className="page-subtitle">{coursesList.length} courses offered</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={openAddModal}>
            <HiOutlinePlus /> Add Course
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : coursesList.length === 0 ? (
        <EmptyState
          icon="🎓"
          title="No courses found"
          text="Add a course to get started."
        />
      ) : (
        departments.map(dept => (
          <div key={dept} className="mb-8">
            <h3 className="mb-4 flex items-center gap-2 text-[0.875rem] font-bold uppercase tracking-wider text-gray-700">
              <HiOutlineAcademicCap /> {dept}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
              {coursesList.filter(c => c.department === dept).map(course => (
                <div key={course.id} className="card relative overflow-hidden">
                  {course.image && (
                    <div className="-mx-5 -mt-5 mb-4 h-32 overflow-hidden rounded-t-lg">
                      <img src={course.image} alt={course.name} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h4 className="mb-1 text-[0.9375rem] font-bold text-gray-900">
                        {course.name}
                      </h4>
                      <span className={`badge ${course.isActive ? 'badge-converted' : 'badge-failed'}`}>
                        {course.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                    {canManage && (
                      <button className="btn btn-ghost btn-icon btn-sm" aria-label={`Edit ${course.name}`} onClick={() => openEditModal(course)}>
                        <HiOutlinePencil />
                      </button>
                    )}
                    {canManage && (
                      <button className="btn btn-ghost btn-icon btn-sm text-red-600" aria-label={`Delete ${course.name}`} onClick={() => handleDeleteClick(course.id)}>
                        <HiOutlineTrash />
                      </button>
                    )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[0.7rem] font-semibold uppercase text-gray-400">Duration</div>
                      <div className="text-[0.875rem] font-semibold text-gray-700">{course.duration}</div>
                    </div>
                    <div>
                      <div className="text-[0.7rem] font-semibold uppercase text-gray-400">Fee</div>
                      <div className="text-[0.875rem] font-bold text-indigo-600">₹{course.fee.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[0.7rem] font-semibold uppercase text-gray-400">Seats</div>
                      <div className="text-[0.875rem] font-semibold text-gray-700">{course.seats || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[0.7rem] font-semibold uppercase text-gray-400">Department</div>
                      <div className="text-[0.875rem] font-semibold text-gray-700">{course.department}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Add/Edit Course Modal */}
      {showModal && (
        <div className="modal-overlay fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="modal w-[90%] max-w-[500px] rounded-2xl bg-white dark:bg-[#1f2530] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header mb-4 flex items-center justify-between">
              <h3 className="modal-title text-xl font-bold">
                {editCourse ? 'Edit Course' : 'Add New Course'}
              </h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowModal(false)}>
                <HiOutlineX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Course Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. B.Tech Computer Science"
                    required
                  />
                </div>
                <div className="form-row flex gap-4">
                  <div className="form-group flex-1">
                    <label className="form-label">Department *</label>
                    <input
                      type="text"
                      className="form-input"
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      placeholder="e.g. Engineering"
                      required
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label className="form-label">Duration *</label>
                    <input
                      type="text"
                      className="form-input"
                      name="duration"
                      value={form.duration}
                      onChange={handleChange}
                      placeholder="e.g. 4 years"
                      required
                    />
                  </div>
                </div>
                <div className="form-row flex gap-4">
                  <div className="form-group flex-1">
                    <label className="form-label">Fee (₹) *</label>
                    <input
                      type="number"
                      className="form-input"
                      name="fee"
                      value={form.fee}
                      onChange={handleChange}
                      placeholder="e.g. 250000"
                      required
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label className="form-label">Total Seats</label>
                    <input
                      type="number"
                      className="form-input"
                      name="seats"
                      value={form.seats}
                      onChange={handleChange}
                      placeholder="e.g. 120"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    className="form-input"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://example.com/course-image.jpg"
                  />
                  {form.image && (
                    <div className="mt-2 h-24 overflow-hidden rounded-lg border border-gray-200">
                      <img src={form.image} alt="Preview" className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                  )}
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
                  <label htmlFor="isActive" className="form-label mb-0 cursor-pointer">Active / Offered</label>
                </div>
              </div>
              <div className="modal-footer mt-5 flex justify-end gap-3">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editCourse ? 'Update Course' : 'Create Course'}
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
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
        confirmText="Delete"
        danger
      />
    </div>
  );
}
