import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { useToast } from '../context/ToastContext';
import LeadProfileCard from '../components/leads/LeadProfileCard';
import ActivityTimeline from '../components/leads/ActivityTimeline';
import FollowUpsTab from '../components/leads/FollowUpsTab';
import CommentsTab from '../components/leads/CommentsTab';
import QuickActionsSidebar from '../components/leads/QuickActionsSidebar';
import LeadModals from '../components/leads/LeadModals';
import AIRecommendation from '../components/leads/AIRecommendation';
import WhatsAppTab from '../components/leads/WhatsAppTab';
import ApplicationDetail from '../components/applications/ApplicationDetail';
import { useFeatures } from '../hooks/useFeatures';
import { useCoursesAndIntakes } from '../hooks/useCoursesAndIntakes';
import ConfirmModal from '../components/ConfirmModal';
import Modal from '../components/Modal';
import { buildTemplateContext } from '../utils/templateContext';

const LEAD_SOURCES = [
  'WEBSITE', 'FACEBOOK', 'GOOGLE_ADS', 'INSTAGRAM', 'JUSTDIAL',
  'WALK_IN', 'REFERRAL', 'PHONE_INQUIRY', 'EMAIL_INQUIRY', 'EVENT', 'WHATSAPP', 'CAMPAIGN', 'OTHER'
];

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const features = useFeatures()

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const { courses, intakes } = useCoursesAndIntakes();
  const [templates, setTemplates] = useState([]);

  const [activeTab, setActiveTab] = useState('timeline');

  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showCompleteFUModal, setShowCompleteFUModal] = useState(false);
  const [selectedFUId, setSelectedFUId] = useState('');
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [fuType, setFuType] = useState('CALL');
  const [fuScheduledAt, setFuScheduledAt] = useState('');
  const [fuNotes, setFuNotes] = useState('');
  const [fuOutcome, setFuOutcome] = useState('CONNECTED');
  const [fuCompleteNotes, setFuCompleteNotes] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [convertCourseId, setConvertCourseId] = useState('');
  const [convertIntakeId, setConvertIntakeId] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAlternatePhone, setEditAlternatePhone] = useState('');
  const [editSource, setEditSource] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editErrors, setEditErrors] = useState({});

  const [application, setApplication] = useState(null);
  const [applicationLoading, setApplicationLoading] = useState(false);

  const fetchLeadDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.leads.getById(id);
      if (res && res.success) {
        setLead(res.data.lead);
        if (res.data.lead?.courseId) setConvertCourseId(res.data.lead.courseId);
        if (res.data.lead?.intakeId) setConvertIntakeId(res.data.lead.intakeId);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchLeadDetails(); }, [fetchLeadDetails]);

  const fetchApplication = useCallback(async () => {
    try {
      setApplicationLoading(true);
      const res = await api.applications.getByLead(id);
      if (res && res.success) setApplication(res.data.application || null);
    } catch {
      setApplication(null);
    } finally {
      setApplicationLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const createApplicationForLead = async () => {
    try {
      setSubmitting(true);
      const res = await api.applications.create({
        leadId: id,
        courseId: lead?.courseId || undefined,
        intakeId: lead?.intakeId || undefined,
        status: 'INQUIRY',
      });
      if (res?.success) {
        setApplication(res.data.application);
        toast.success(`Application ${res.data.application.applicationNumber} created`);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create application');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!features.CAMPAIGNS) return;
    api.templates.getAll({ limit: 50 }).then((res) => {
      if (res && res.success && res.data) setTemplates(res.data || []);
    }).catch(() => {});
  }, [features.CAMPAIGNS]);

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        <p>Loading lead details...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <div className="empty-state-title">Lead not found</div>
        <button className="btn btn-primary" onClick={() => navigate('/leads')}>Back to Leads</button>
      </div>
    );
  }

  const leadFollowUps = lead.followUps || [];
  const leadActivities = lead.activities || [];
  const leadComments = lead.comments || [];
  const counselor = lead.counselor;

  const templateContext = buildTemplateContext(lead);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const getActivityDotClass = (action) => {
    if (action.includes('CONVERTED') || action.includes('COMPLETED')) return 'success';
    if (action.includes('FAILED') || action.includes('ESCALAT')) return 'danger';
    if (action.includes('FOLLOW') || action.includes('COMMENT') || action.includes('NOTE')) return 'warning';
    return 'primary';
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setSubmitting(true);
      await api.leads.addComment(id, newComment);
      setNewComment('');
      fetchLeadDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleFollowUp = async (e) => {
    e.preventDefault();
    if (!fuScheduledAt) return;
    try {
      setSubmitting(true);
      await api.followUps.create({
        leadId: id,
        type: fuType,
        scheduledAt: new Date(fuScheduledAt).toISOString(),
        notes: fuNotes
      });
      setFuNotes('');
      setShowFollowUpModal(false);
      fetchLeadDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to schedule follow-up');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteFollowUp = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.followUps.complete(selectedFUId, {
        outcome: fuOutcome,
        notes: fuCompleteNotes
      });
      setFuCompleteNotes('');
      setShowCompleteFUModal(false);
      fetchLeadDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to log outcome');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConvertLead = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.leads.convert(id, {
        courseId: convertCourseId || undefined,
        intakeId: convertIntakeId || undefined
      });
      setShowConvertModal(false);
      fetchLeadDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to convert lead');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFailLead = async (e) => {
    e.preventDefault();
    if (!failureReason) return;
    try {
      setSubmitting(true);
      await api.leads.fail(id, { failureReason });
      setShowFailModal(false);
      fetchLeadDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to mark lead as failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReEngage = async () => {
    setConfirmOpen(true);
  };

  const openEditModal = () => {
    setEditName(lead.name || '');
    setEditEmail(lead.email || '');
    setEditPhone(lead.phone || '');
    setEditAlternatePhone(lead.alternatePhone || '');
    setEditSource(lead.source || '');
    setEditNotes(lead.notes || '');
    setEditTags(lead.tags || '');
    setShowEditModal(true);
  };

  const validateEditForm = () => {
    const errs = {};
    const name = editName.trim();
    if (!name) errs.name = 'Name is required';
    else if (name.length < 2) errs.name = 'Name must be at least 2 characters';

    const phone = editPhone.replace(/\D/g, '');
    if (!phone) errs.phone = 'Phone is required';
    else if (phone.length !== 10) errs.phone = 'Enter a valid 10-digit phone number';
    else if (!/^[6-9]/.test(phone)) errs.phone = 'Indian mobile numbers start with 6-9';

    if (editAlternatePhone.trim()) {
      const alt = editAlternatePhone.replace(/\D/g, '');
      if (alt.length !== 10) errs.alternatePhone = 'Enter a valid 10-digit number';
      else if (!/^[6-9]/.test(alt)) errs.alternatePhone = 'Indian mobile numbers start with 6-9';
    }

    if (editEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail.trim())) {
      errs.email = 'Enter a valid email address';
    }

    if (!editSource) errs.source = 'Source is required';

    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEditLead = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;
    try {
      setSubmitting(true);
      await api.leads.update(id, {
        name: editName.trim(),
        email: editEmail.trim() || undefined,
        phone: editPhone.replace(/\D/g, ''),
        alternatePhone: editAlternatePhone.replace(/\D/g, '') || undefined,
        source: editSource,
        notes: editNotes.trim() || undefined,
        tags: editTags.trim() || undefined,
      });
    setShowEditModal(false);
    setEditErrors({});
      fetchLeadDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to update lead');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmReEngage = async () => {
    setConfirmLoading(true);
    try {
      await api.leads.reEngage(id);
      setConfirmOpen(false);
      fetchLeadDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to re-engage lead');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleFUComplete = (fuId) => {
    setSelectedFUId(fuId);
    setShowCompleteFUModal(true);
  };

  const initials = (lead.name || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div>
      <button
        className="btn btn-ghost mb-4"
        onClick={() => navigate('/leads')}
      >
        <HiOutlineArrowLeft /> Back to Leads
      </button>

      <div className="lead-detail-grid">
        <div>
          <LeadProfileCard lead={lead} initials={initials} counselor={counselor} formatDate={formatDate} onEdit={openEditModal} />

          {features.AI_RECOMMENDATIONS && (
            <div className="mb-4">
              <AIRecommendation leadId={id} />
            </div>
          )}

          <div className="tabs overflow-x-auto">
            <button className={`tab ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>
              Activity Timeline
            </button>
            <button className={`tab ${activeTab === 'followups' ? 'active' : ''}`} onClick={() => setActiveTab('followups')}>
              Follow-ups ({leadFollowUps.length})
            </button>
            <button className={`tab ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>
              Comments ({leadComments.length})
            </button>
            {features.WHATSAPP && (
              <button className={`tab ${activeTab === 'whatsapp' ? 'active' : ''}`} onClick={() => setActiveTab('whatsapp')}>
                WhatsApp
              </button>
            )}
            <button className={`tab ${activeTab === 'application' ? 'active' : ''}`} onClick={() => setActiveTab('application')}>
              Application
            </button>
          </div>

          {activeTab === 'timeline' && (
            <ActivityTimeline activities={leadActivities} formatDate={formatDate} formatDateTime={formatDateTime} getActivityDotClass={getActivityDotClass} />
          )}

          {activeTab === 'followups' && (
            <FollowUpsTab followUps={leadFollowUps} onSchedule={() => setShowFollowUpModal(true)} onComplete={handleFUComplete} formatDateTime={formatDateTime} />
          )}

          {activeTab === 'comments' && (
            <CommentsTab comments={leadComments} newComment={newComment} setNewComment={setNewComment} onSubmit={handleAddComment} submitting={submitting} formatDateTime={formatDateTime} />
          )}

          {activeTab === 'whatsapp' && features.WHATSAPP && (
            <WhatsAppTab leadId={id} lead={lead} />
          )}

          {activeTab === 'application' && (
            applicationLoading ? (
              <div className="py-10 text-center text-gray-500"><p>Loading application...</p></div>
            ) : application ? (
              <ApplicationDetail application={application} courses={courses} intakes={intakes} onRefresh={setApplication} />
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📄</div>
                <div className="empty-state-title">No application yet</div>
                <p className="empty-state-text">Create an application to track documents, status and fee payments.</p>
                <button className="btn btn-primary" onClick={createApplicationForLead} disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Application'}
                </button>
              </div>
            )
          )}
        </div>

        <div>
          <QuickActionsSidebar lead={lead} counselor={counselor} onConvert={() => setShowConvertModal(true)} onFollowUp={() => setShowFollowUpModal(true)} onFail={() => setShowFailModal(true)} onReEngage={handleReEngage} />
        </div>
      </div>

      <LeadModals
        showFollowUpModal={showFollowUpModal} setShowFollowUpModal={setShowFollowUpModal}
        showCompleteFUModal={showCompleteFUModal} setShowCompleteFUModal={setShowCompleteFUModal}
        showConvertModal={showConvertModal} setShowConvertModal={setShowConvertModal}
        showFailModal={showFailModal} setShowFailModal={setShowFailModal}
        fuType={fuType} setFuType={setFuType} fuScheduledAt={fuScheduledAt} setFuScheduledAt={setFuScheduledAt}
        fuNotes={fuNotes} setFuNotes={setFuNotes} handleScheduleFollowUp={handleScheduleFollowUp}
        fuOutcome={fuOutcome} setFuOutcome={setFuOutcome} fuCompleteNotes={fuCompleteNotes} setFuCompleteNotes={setFuCompleteNotes}
        handleCompleteFollowUp={handleCompleteFollowUp}
        convertCourseId={convertCourseId} setConvertCourseId={setConvertCourseId}
        convertIntakeId={convertIntakeId} setConvertIntakeId={setConvertIntakeId}
        courses={courses} intakes={intakes} handleConvertLead={handleConvertLead}
        failureReason={failureReason} setFailureReason={setFailureReason} handleFailLead={handleFailLead}
        templates={templates} templateContext={templateContext}
        submitting={submitting}
      />

      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Lead Details"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowEditModal(false)} disabled={submitting}>Cancel</button>
            <button className="btn btn-primary" onClick={handleEditLead} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <form onSubmit={handleEditLead} className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className={`form-input ${editErrors.name ? 'border-red-500' : ''}`} value={editName} onChange={(e) => setEditName(e.target.value)} required />
            {editErrors.name && <p className="mt-1 text-xs text-red-500">{editErrors.name}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className={`form-input ${editErrors.email ? 'border-red-500' : ''}`} type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            {editErrors.email && <p className="mt-1 text-xs text-red-500">{editErrors.email}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input className={`form-input ${editErrors.phone ? 'border-red-500' : ''}`} value={editPhone} onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} inputMode="numeric" required />
              {editErrors.phone && <p className="mt-1 text-xs text-red-500">{editErrors.phone}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Alternate Phone</label>
              <input className={`form-input ${editErrors.alternatePhone ? 'border-red-500' : ''}`} value={editAlternatePhone} onChange={(e) => setEditAlternatePhone(e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} inputMode="numeric" />
              {editErrors.alternatePhone && <p className="mt-1 text-xs text-red-500">{editErrors.alternatePhone}</p>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Source *</label>
            <select className={`form-select ${editErrors.source ? 'border-red-500' : ''}`} value={editSource} onChange={(e) => setEditSource(e.target.value)}>
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
            {editErrors.source && <p className="mt-1 text-xs text-red-500">{editErrors.source}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={3} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Tags</label>
            <input className="form-input" value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="e.g. Scholarship candidate, Sports quota" />
            <p className="mt-1 text-xs text-gray-500">Comma-separated</p>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmReEngage}
        title="Re-engage Lead"
        message="Are you sure you want to re-engage this failed lead? It will be assigned for re-engagement."
        confirmText="Re-engage"
        loading={confirmLoading}
      />
    </div>
  );
}
