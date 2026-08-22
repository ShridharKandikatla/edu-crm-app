import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { HiOutlineArrowLeft, HiOutlineSave, HiOutlineX } from 'react-icons/hi';
import { useToast } from '../context/ToastContext';

export default function AddLeadPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [intakes, setIntakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', alternatePhone: '',
    source: '', courseId: '', intakeId: '',
    score: '', assignedTo: '', notes: '', tags: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [coursesRes, intakesRes, usersRes] = await Promise.all([
          api.courses.getAll(),
          api.courses.getIntakes(),
          api.users.getAll(),
        ]);

        if (coursesRes.success && coursesRes.data && coursesRes.data.courses) {
          setCourses(coursesRes.data.courses);
        }
        if (intakesRes.success && intakesRes.data && intakesRes.data.intakes) {
          setIntakes(intakesRes.data.intakes);
        }
        if (usersRes.success) {
          const activeCounselors = usersRes.data.filter(
            u => (u.role === 'COUNSELOR' || u.role === 'TELECALLER') && u.isActive
          );
          setCounselors(activeCounselors);
        }
      } catch {
        // Lookup data load failed silently
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!form.name.trim()) errors.name = 'Student name is required';
    if (!form.phone.trim()) errors.phone = 'Phone number is required';
    if (!form.courseId) errors.courseId = 'Please select a course';
    if (!form.source) errors.source = 'Lead source is required';
    if (!form.score) errors.score = 'Lead score is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    try {
      setSaving(true);
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        email: form.email || undefined,
        alternatePhone: form.alternatePhone || undefined,
        assignedTo: form.assignedTo || undefined,
      };

      const res = await api.leads.create(payload);
      if (res && res.success) {
        if (res.data.isDuplicate) {
          toast.success('Lead created successfully! A duplicate check flagged this student (similar phone/email linked).');
        } else {
          toast.success('Lead created successfully!');
        }
        navigate('/leads');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create lead');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        <div className="spinner mx-auto mb-4 h-[30px] w-[30px] rounded-full border-[3px] border-black/10 border-l-indigo-600 animate-spin"></div>
        <p>Loading lookup details...</p>
      </div>
    );
  }

  return (
    <div>
      <button className="btn btn-ghost mb-4" onClick={() => navigate('/leads')}>
        <HiOutlineArrowLeft /> Back to Leads
      </button>

      <div className="page-header">
        <div>
          <h2 className="page-title">Add New Lead</h2>
          <p className="page-subtitle">Fill in the details to create a new lead</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card mb-6 max-w-[800px]">
          <h3 className="mb-5 text-base font-bold text-gray-900">Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className={`form-input ${formErrors.name ? 'border-red-500' : ''}`} name="name" value={form.name} onChange={handleChange} placeholder="Enter student name" required aria-invalid={!!formErrors.name} aria-describedby={formErrors.name ? 'name-error' : undefined} />
              {formErrors.name && <p id="name-error" className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className={`form-input ${formErrors.email ? 'border-red-500' : ''}`} name="email" value={form.email} onChange={handleChange} placeholder="student@email.com" aria-invalid={!!formErrors.email} aria-describedby={formErrors.email ? 'email-error' : undefined} />
              {formErrors.email && <p id="email-error" className="mt-1 text-xs text-red-600">{formErrors.email}</p>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input type="tel" className={`form-input ${formErrors.phone ? 'border-red-500' : ''}`} name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" required aria-invalid={!!formErrors.phone} aria-describedby={formErrors.phone ? 'phone-error' : undefined} />
              {formErrors.phone && <p id="phone-error" className="mt-1 text-xs text-red-600">{formErrors.phone}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Alternate Phone</label>
              <input type="tel" className="form-input" name="alternatePhone" value={form.alternatePhone} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>
          </div>
        </div>

        <div className="card mb-6 max-w-[800px]">
          <h3 className="mb-5 text-base font-bold text-gray-900">Lead Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Lead Source *</label>
              <select className={`form-select ${formErrors.source ? 'border-red-500' : ''}`} name="source" value={form.source} onChange={handleChange} required aria-invalid={!!formErrors.source}>
                <option value="">Select source</option>
                <option value="WEBSITE">Website</option>
                <option value="FACEBOOK">Facebook</option>
                <option value="GOOGLE_ADS">Google Ads</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="JUSTDIAL">JustDial</option>
                <option value="WALK_IN">Walk-in</option>
                <option value="REFERRAL">Referral</option>
                <option value="PHONE_INQUIRY">Phone Inquiry</option>
                <option value="EMAIL_INQUIRY">Email Inquiry</option>
                <option value="EVENT">Event</option>
              </select>
              {formErrors.source && <p className="mt-1 text-xs text-red-600">{formErrors.source}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Lead Score *</label>
              <select className={`form-select ${formErrors.score ? 'border-red-500' : ''}`} name="score" value={form.score} onChange={handleChange} required aria-invalid={!!formErrors.score}>
                <option value="">Select score</option>
                <option value="HOT">🔴 Hot</option>
                <option value="WARM">🟡 Warm</option>
                <option value="COLD">🔵 Cold</option>
              </select>
              {formErrors.score && <p className="mt-1 text-xs text-red-600">{formErrors.score}</p>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Course Interested *</label>
              <select className={`form-select ${formErrors.courseId ? 'border-red-500' : ''}`} name="courseId" value={form.courseId} onChange={handleChange} required aria-invalid={!!formErrors.courseId} aria-describedby={formErrors.courseId ? 'course-error' : undefined}>
                <option value="">Select course</option>
                {courses.filter(c => c.isActive).map(c => (
                  <option key={c.id} value={c.id}>{c.name} — ₹{c.fee.toLocaleString()}</option>
                ))}
              </select>
              {formErrors.courseId && <p id="course-error" className="mt-1 text-xs text-red-600">{formErrors.courseId}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Academic Intake</label>
              <select className="form-select" name="intakeId" value={form.intakeId} onChange={handleChange}>
                <option value="">Select intake</option>
                {intakes.map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card mb-6 max-w-[800px]">
          <h3 className="mb-5 text-base font-bold text-gray-900">Assignment</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Assign to Counselor</label>
              <select className="form-select" name="assignedTo" value={form.assignedTo} onChange={handleChange}>
                <option value="">Auto-assign (Round Robin)</option>
                {counselors.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tags</label>
              <input type="text" className="form-input" name="tags" value={form.tags} onChange={handleChange} placeholder="Scholarship candidate, Sports quota" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" name="notes" value={form.notes} onChange={handleChange} placeholder="Add any notes about this lead..." />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row max-w-[800px] gap-3">
          <button type="submit" className="btn btn-primary btn-lg w-full sm:w-auto" disabled={saving}>
            <HiOutlineSave /> {saving ? 'Saving...' : 'Save Lead'}
          </button>
          <button type="button" className="btn btn-secondary btn-lg w-full sm:w-auto" onClick={() => navigate('/leads')} disabled={saving}>
            <HiOutlineX /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
