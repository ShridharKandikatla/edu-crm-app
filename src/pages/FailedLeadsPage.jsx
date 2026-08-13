import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  HiOutlineRefresh, HiOutlineEye,
  HiOutlineChevronLeft, HiOutlineChevronRight,
} from 'react-icons/hi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useToast } from '../context/ToastContext';
import { SkeletonBlock, SkeletonTable } from '../components/Skeleton';
import ConfirmModal from '../components/ConfirmModal';

export default function FailedLeadsPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const canReEngagePermission = hasPermission('re_engage');
  
  const [failedLeadsList, setFailedLeadsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reasonFilter, setReasonFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reEngageTarget, setReEngageTarget] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  
  const pageSize = 10;

  const fetchFailedLeads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.leads.getAll({ status: 'FAILED', limit: 1000 });
      if (res && res.success && res.data) setFailedLeadsList(res.data || []);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFailedLeads(); }, [fetchFailedLeads]);

  const daysSinceFailed = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const filteredLeads = useMemo(() => {
    let result = [...failedLeadsList];
    if (reasonFilter !== 'ALL') {
      result = result.filter(l => l.failureReason === reasonFilter);
    }
    return result.sort((a, b) => new Date(b.failedAt || b.updatedAt) - new Date(a.failedAt || a.updatedAt));
  }, [failedLeadsList, reasonFilter]);

  const failureReasons = useMemo(() => {
    return [...new Set(failedLeadsList.map(l => l.failureReason).filter(Boolean))];
  }, [failedLeadsList]);

  const reasonCounts = useMemo(() => {
    return failureReasons.map(reason => ({
      name: reason,
      value: failedLeadsList.filter(l => l.failureReason === reason).length,
    }));
  }, [failedLeadsList, failureReasons]);

  const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#06b6d4', '#8b5cf6', '#ec4899', '#6b7280'];

  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleReEngage = async (leadId) => {
    setReEngageTarget(leadId);
    setConfirmOpen(true);
  };

  const confirmReEngage = async () => {
    if (!reEngageTarget) return;
    setConfirmLoading(true);
    try {
      await api.leads.reEngage(reEngageTarget);
      toast.success('Lead successfully moved back to follow-ups!');
      setConfirmOpen(false);
      fetchFailedLeads();
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
          <h2 className="page-title">Failed Leads</h2>
          <p className="page-subtitle">{failedLeadsList.length} leads that didn't convert</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="chart-grid mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="chart-card">
              <SkeletonBlock height="24px" width="40%" className="mb-4" />
              <SkeletonBlock height="250px" />
            </div>
            <div className="chart-card">
              <SkeletonBlock height="24px" width="40%" className="mb-4" />
              <SkeletonBlock height="250px" />
            </div>
          </div>
          <SkeletonTable rows={5} cols={6} />
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="chart-grid mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <div className="chart-card-title">Failure Reasons Breakdown</div>
                  <div className="chart-card-subtitle">Why leads didn't convert</div>
                </div>
              </div>
              {reasonCounts.length === 0 ? (
                <div className="flex h-[250px] items-center justify-center text-gray-500">
                  No failure reasons recorded yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={reasonCounts} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" paddingAngle={3}>
                      {reasonCounts.map((entry, i) => (
                        <Cell key={i} fill={colors[i % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <div className="chart-card-title">Re-engagement Opportunities</div>
                  <div className="chart-card-subtitle">Leads eligible for re-engagement (30+ days)</div>
                </div>
              </div>
              <div className="max-h-[250px] overflow-y-auto py-5">
                {failureReasons.length === 0 ? (
                  <div className="p-4 px-4 text-center text-[0.875rem] text-gray-500">
                    No failed leads to analyze
                  </div>
                ) : (
                  failureReasons.map((reason, i) => {
                    const count = failedLeadsList.filter(l => l.failureReason === reason).length;
                    const reEngageable = failedLeadsList.filter(l =>
                      l.failureReason === reason &&
                      daysSinceFailed(l.failedAt || l.updatedAt) >= 30
                    ).length;
                    return (
                      <div key={reason} className="flex items-center justify-between border-b border-gray-100 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ background: colors[i % colors.length] }} />
                          <span className="text-[0.8125rem] font-medium">{reason}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[0.8125rem] text-gray-500">{count} total</span>
                          <span className="badge badge-interested">{reEngageable} re-engageable</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="filter-bar mb-6 overflow-x-auto" role="group" aria-label="Filter by failure reason">
            <span className="text-xs font-semibold text-gray-700 shrink-0">Reason:</span>
            <select
              className="form-select"
              aria-label="Filter by failure reason"
              value={reasonFilter}
              onChange={(e) => { setReasonFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="ALL">All Reasons</option>
              {failureReasons.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="data-table-wrapper overflow-x-auto">
            {filteredLeads.length === 0 ? (
              <div className="empty-state p-16 text-center">
                <div className="empty-state-icon">👥</div>
                <div className="empty-state-title">No failed leads found</div>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Course</th>
                    <th>Failure Reason</th>
                    <th>Failed Date</th>
                    <th>Days Since</th>
                    <th>Counselor</th>
                    <th>Re-engage</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeads.map((lead) => {
                    const days = daysSinceFailed(lead.failedAt || lead.updatedAt);
                    const canReEngage = days >= 30;
                    return (
                      <tr key={lead.id}>
                        <td>
                          <div className="text-[0.8125rem] font-semibold text-gray-900">{lead.name}</div>
                          <div className="text-[0.7rem] text-gray-400">{lead.phone}</div>
                        </td>
                        <td className="text-[0.8125rem]">{lead.course?.name || lead.courseName || '—'}</td>
                        <td>
                          <span className="badge badge-failed">{lead.failureReason}</span>
                        </td>
                        <td className="text-[0.8125rem] text-gray-500">{formatDate(lead.failedAt || lead.updatedAt)}</td>
                        <td>
                          <span
                            className="text-[0.75rem] font-semibold"
                            style={{ color: days >= 30 ? '#059669' : '#dc2626' }}
                          >
                            {days || 0} days
                          </span>
                        </td>
                        <td className="text-[0.8125rem]">{lead.counselor?.name || lead.assignedCounselor || '—'}</td>
                        <td>
                          {canReEngage ? (
                            <span className="badge badge-converted">Eligible</span>
                          ) : (
                            <span className="badge bg-gray-100 text-gray-500">
                              {30 - (days || 0)}d remaining
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button className="btn btn-ghost btn-icon btn-sm" aria-label={`View lead ${lead.name}`} title="View" onClick={() => navigate(`/leads/${lead.id}`)}>
                              <HiOutlineEye />
                            </button>
                            {canReEngage && canReEngagePermission && (
                              <button
                                className="btn btn-ghost btn-icon btn-sm text-emerald-600"
                                aria-label={`Re-engage lead ${lead.name}`}
                                title="Re-engage"
                                onClick={() => handleReEngage(lead.id)}
                              >
                                <HiOutlineRefresh />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {filteredLeads.length > 0 && (
              <div className="data-table-footer">
                <span>Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length}</span>
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
        </>
      )}

      <ConfirmModal
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setReEngageTarget(null); }}
        onConfirm={confirmReEngage}
        title="Re-engage Lead"
        message="Are you sure you want to re-engage this lead? It will be moved back to the follow-up pipeline."
        confirmText="Re-engage"
        loading={confirmLoading}
      />
    </div>
  );
}
