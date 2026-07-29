import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import {
  HiOutlinePhone, HiOutlineMail, HiOutlineChatAlt2, HiOutlineChat,
  HiOutlineUserGroup, HiOutlineClock, HiOutlineCheckCircle,
  HiOutlineCalendar, HiOutlineX, HiOutlineLightningBolt
} from 'react-icons/hi';
import { useToast } from '../context/ToastContext';
import { FEATURES } from '../constants/features';

const typeIcons = {
  CALL: HiOutlinePhone,
  EMAIL: HiOutlineMail,
  WHATSAPP: HiOutlineChatAlt2,
  SMS: HiOutlineChat,
  IN_PERSON: HiOutlineUserGroup,
};

export default function FollowUpsPage() {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('ALL');
  
  const [followUpsList, setFollowUpsList] = useState([]);
  const [stats, setStats] = useState({ overdue: 0, today: 0, upcoming: 0, completed: 0 });
  const [loadingList, setLoadingList] = useState(true);

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedFUId, setSelectedFUId] = useState('');
  const [fuOutcome, setFuOutcome] = useState('CONNECTED');
  const [fuNotes, setFuNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [recs, setRecs] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.followUps.getStats();
      if (res && res.success && res.data) setStats(res.data);
    } catch { /* silent */ }
  }, []);

  const fetchFollowUps = useCallback(async () => {
    try {
      setLoadingList(true);
      const params = { status: activeFilter === 'all' ? 'pending' : activeFilter };
      if (typeFilter !== 'ALL') params.type = typeFilter;
      const res = await api.followUps.getAll(params);
      if (res && res.success && res.data) setFollowUpsList(res.data || []);
    } catch { /* silent */ } finally {
      setLoadingList(false);
    }
  }, [activeFilter, typeFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchFollowUps(); }, [fetchFollowUps]);
  useEffect(() => {
    if (!FEATURES.AI_BULK_RECOMMENDATIONS) { setLoadingRecs(false); return; }
    setLoadingRecs(true);
    api.ai.getRecommendations()
      .then(res => { if (res?.success) setRecs(res.data?.recommendations || []); })
      .catch(() => {})
      .finally(() => setLoadingRecs(false));
  }, []);

  const handleComplete = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.followUps.complete(selectedFUId, { outcome: fuOutcome, notes: fuNotes });
      setFuNotes('');
      setShowCompleteModal(false);
      await Promise.all([fetchStats(), fetchFollowUps()]);
    } catch (error) {
      toast.error(error.message || 'Failed to complete follow-up');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  };

  const filters = [
    { key: 'all', label: 'All Pending', count: (stats.overdue || 0) + (stats.today || 0) + (stats.upcoming || 0) },
    { key: 'overdue', label: 'Overdue', count: stats.overdue || 0, color: '#dc2626' },
    { key: 'today', label: 'Today', count: stats.today || 0, color: '#d97706' },
    { key: 'upcoming', label: 'Upcoming', count: stats.upcoming || 0, color: '#059669' },
    { key: 'completed', label: 'Completed', count: stats.completed || 0, color: '#6b7280' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Follow-ups</h2>
          <p className="page-subtitle">Manage your scheduled follow-ups</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="kpi-grid mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`kpi-card cursor-pointer border text-left ${activeFilter === f.key ? 'primary !border-indigo-500' : '!border-gray-200'}`}
            onClick={() => setActiveFilter(f.key)}
          >
            <div className="text-[1.75rem] font-bold" style={{ color: f.color || '#111827' }}>
              {f.count}
            </div>
            <div className="kpi-label">{f.label}</div>
          </button>
        ))}
      </div>

      {/* Type Filter */}
      <div className="filter-bar mb-6 overflow-x-auto" role="group" aria-label="Follow-up type filter">
        <span className="text-xs font-semibold text-gray-700 shrink-0">Type:</span>
        {['ALL', 'CALL', 'EMAIL', 'WHATSAPP', 'SMS', 'IN_PERSON'].map(type => (
          <button
            key={type}
            className={`btn ${typeFilter === type ? 'btn-primary' : 'btn-secondary'} btn-sm shrink-0`}
            onClick={() => setTypeFilter(type)}
          >
            {type === 'ALL' ? 'All' : type.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* AI Recommendations */}
      {FEATURES.AI_BULK_RECOMMENDATIONS && !loadingRecs && recs.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800">
              <HiOutlineLightningBolt className="h-4 w-4 text-indigo-500" />
              AI-Powered Recommendations
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {recs.slice(0, 6).map((r, i) => (
                <div key={i} className={`flex items-center gap-3 rounded-xl border p-3 ${
                  r.priority === 'critical' ? 'border-red-300 bg-red-50' :
                  r.priority === 'high' ? 'border-amber-300 bg-amber-50' :
                  'border-gray-200 bg-gray-50'
                }`}>
                  <div className="text-lg">
                    {r.action === 'CALL' ? '📞' : r.action === 'WHATSAPP' ? '💬' : r.action === 'EMAIL' ? '✉️' : r.action === 'SMS' ? '📝' : '💡'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold text-gray-900">{r.leadName || 'Unknown'}</div>
                    <div className="truncate text-[0.7rem] text-gray-500">{r.message}</div>
                  </div>
                  {r.dueIn && <span className="whitespace-nowrap text-[0.6rem] text-gray-400">{r.dueIn}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Follow-up Cards */}
      <div className="followup-cards grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
        {loadingList ? (
          <div className="col-span-full py-20 text-center text-gray-500" role="status">
            <div className="spinner mx-auto mb-4 h-[30px] w-[30px] rounded-full border-[3px] border-black/10 border-l-indigo-600 animate-spin"></div>
            <p>Loading follow-ups...</p>
          </div>
        ) : followUpsList.length === 0 ? (
          <div className="empty-state col-span-full mt-5">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No follow-ups found</div>
            <div className="empty-state-text">No follow-ups match the current filters.</div>
          </div>
        ) : (
          followUpsList.map((fu) => {
            const isOverdue = !fu.completedAt && new Date(fu.scheduledAt) < new Date() && new Date(fu.scheduledAt).toDateString() !== new Date().toDateString();
            const isToday = new Date(fu.scheduledAt).toDateString() === new Date().toDateString();
            const isCompleted = !!fu.completedAt;
            const TypeIcon = typeIcons[fu.type] || HiOutlinePhone;

            return (
              <div key={fu.id} className={`followup-card ${isOverdue ? 'overdue' : isToday ? 'today' : isCompleted ? '' : 'upcoming'}`}>
                <div className="followup-card-header">
                  <span className="followup-card-lead">{fu.lead?.name || fu.leadName}</span>
                  <span className="followup-card-type">
                    <TypeIcon />
                    {fu.type}
                  </span>
                </div>
                <div className="followup-card-time flex items-center gap-1.5">
                  <HiOutlineCalendar size={14} />
                  {formatDateTime(fu.scheduledAt)}
                  {isOverdue && <span className="badge badge-failed ml-2">Overdue</span>}
                  {isToday && !isCompleted && <span className="badge badge-interested ml-2">Today</span>}
                  {fu.isEscalated && <span className="badge badge-failed ml-1">Escalated</span>}
                </div>
                <div className="mb-1 text-xs text-gray-500">
                  {fu.lead?.course?.name || fu.courseName || 'Unassigned Course'} · <span className={`score-badge score-${(fu.lead?.score || fu.leadScore || 'cold').toLowerCase()} px-1.5 text-[0.65rem]`}>
                    <span className="score-dot h-[5px] w-[5px]"></span>{fu.lead?.score || fu.leadScore || 'COLD'}
                  </span>
                </div>
                {fu.notes && <div className="followup-card-notes"><strong>Notes: </strong>{fu.notes}</div>}
                <div className="followup-card-footer">
                  <span className="text-xs text-gray-400">By {fu.user?.name || fu.userName}</span>
                  {!isCompleted ? (
                    <div className="flex gap-2">
                        <button
                          className="btn btn-success btn-sm"
                          aria-label={`Complete follow-up for ${fu.lead?.name || fu.leadName}`}
                          onClick={() => {
                          setSelectedFUId(fu.id);
                          setShowCompleteModal(true);
                        }}
                      >
                        <HiOutlineCheckCircle /> Complete
                      </button>
                    </div>
                  ) : (
                    <span className="badge badge-converted">
                      <HiOutlineCheckCircle /> {fu.outcome?.replace(/_/g, ' ') || 'Done'}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Complete Follow-up Modal */}
      {showCompleteModal && (
        <div className="modal-overlay fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCompleteModal(false)}>
          <div className="modal w-[90%] max-w-[500px] rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header mb-4 flex items-center justify-between">
              <h3 className="modal-title text-xl font-bold">Log Follow-up Outcome</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowCompleteModal(false)}>
                <HiOutlineX />
              </button>
            </div>
            <form onSubmit={handleComplete}>
              <div className="modal-body flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Outcome</label>
                  <select className="form-select" value={fuOutcome} onChange={(e) => setFuOutcome(e.target.value)}>
                    <option value="CONNECTED">Connected</option>
                    <option value="NOT_REACHABLE">Not Reachable</option>
                    <option value="CALL_BACK">Call Back</option>
                    <option value="INTERESTED">Interested</option>
                    <option value="NOT_INTERESTED">Not Interested</option>
                    <option value="WRONG_NUMBER">Wrong Number</option>
                    <option value="CONVERTED">Converted</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Outcome Notes</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Enter what was discussed..."
                    value={fuNotes}
                    onChange={(e) => setFuNotes(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer mt-5 flex justify-end gap-3">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCompleteModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Log Outcome'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
