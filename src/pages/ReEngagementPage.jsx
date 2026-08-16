import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { HiOutlineRefresh, HiOutlineEye, HiOutlinePhone, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { useToast } from '../context/ToastContext';
import { SkeletonCard } from '../components/Skeleton';
import ConfirmModal from '../components/ConfirmModal';

export default function ReEngagementPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 12;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reEngageTarget, setReEngageTarget] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.leads.getReEngagement({ page: currentPage, limit: pageSize });
      if (res && res.success) {
        setLeads(res.data || []);
        setTotal(res.pagination?.total || 0);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleReEngage = async (leadId) => {
    setReEngageTarget(leadId);
    setConfirmOpen(true);
  };

  const confirmReEngage = async () => {
    if (!reEngageTarget) return;
    setConfirmLoading(true);
    try {
      await api.leads.reEngage(reEngageTarget);
      toast.success('Lead successfully moved back to follow-up!');
      setConfirmOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to re-engage lead');
    } finally {
      setConfirmLoading(false);
      setReEngageTarget(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Re-engagement Pipeline</h2>
          <p className="page-subtitle">{total} leads eligible for re-engagement</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="card mb-6 border-none text-white" style={{ background: 'linear-gradient(to bottom right, #312e81, #4f46e5)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 text-2xl">
            <HiOutlineRefresh />
          </div>
          <div>
            <h3 className="mb-1 text-base font-bold">Re-engagement Rules</h3>
            <p className="text-[0.8125rem] opacity-80">
              Failed leads become re-engageable after 30 days • Assigned to a different counselor • Maximum 2 attempts per lead
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">
          {leads.map((lead) => {
            const isReEngaged = lead.status === 'RE_ENGAGED';
            return (
              <div
                key={lead.id}
                className="card border-l-[3px]"
                style={{ borderLeftColor: isReEngaged ? '#f59e0b' : '#6366f1' }}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="text-[0.9375rem] font-bold text-gray-900">{lead.name}</div>
                    <div className="text-xs text-gray-500">{lead.phone} · {lead.email || 'No email'}</div>
                  </div>
                  <span className={`badge ${isReEngaged ? 'badge-re-engaged' : 'badge-follow-up'}`}>
                    {isReEngaged ? 'Re-engaged' : 'Eligible'}
                  </span>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[0.65rem] font-semibold uppercase text-gray-400">Course</div>
                    <div className="text-[0.8125rem] font-medium">{lead.course?.name || lead.courseName || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold uppercase text-gray-400">Failed Reason</div>
                    <div className="text-[0.8125rem] font-medium text-red-600">{lead.failureReason || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold uppercase text-gray-400">Failed Date</div>
                    <div className="text-[0.8125rem] font-medium">{formatDate(lead.failedAt || lead.updatedAt)}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold uppercase text-gray-400">Previous Counselor</div>
                    <div className="text-[0.8125rem] font-medium">{lead.counselor?.name || lead.assignedCounselor || '—'}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isReEngaged && hasPermission('re_engage') && (
                    <button className="btn btn-primary btn-sm flex-1" aria-label={`Re-engage lead ${lead.name}`} onClick={() => handleReEngage(lead.id)}>
                      <HiOutlineRefresh /> Re-engage
                    </button>
                  )}
                  <button className="btn btn-secondary btn-sm flex-1" aria-label={`View lead ${lead.name}`} onClick={() => navigate(`/leads/${lead.id}`)}>
                    <HiOutlineEye /> View
                  </button>
                  <a href={`tel:${lead.phone}`} className="btn btn-ghost btn-icon btn-sm inline-flex items-center justify-center" aria-label={`Call ${lead.name}`}>
                    <HiOutlinePhone />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && total === 0 && (
        <div className="empty-state mt-10">
          <div className="empty-state-icon">🔄</div>
          <div className="empty-state-title">No leads for re-engagement</div>
          <div className="empty-state-text">Failed leads become eligible for re-engagement after 30 days.</div>
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

      <ConfirmModal
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setReEngageTarget(null); }}
        onConfirm={confirmReEngage}
        title="Re-engage Lead"
        message="Are you sure you want to re-engage this lead? It will be reassigned to a new counselor."
        confirmText="Re-engage"
        loading={confirmLoading}
      />
    </div>
  );
}
