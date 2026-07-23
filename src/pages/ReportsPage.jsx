import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import { api } from '../services/api';
import { HiOutlineDownload } from 'react-icons/hi';
import { useToast } from '../context/ToastContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-[10px] border border-gray-200 bg-white p-3 text-[0.8125rem] shadow-lg">
        <p className="mb-1 font-bold">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#4f46e5' }} className="font-medium">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#64748b'];

export default function ReportsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('source');
  const [loading, setLoading] = useState(true);
  
  const [sourceReport, setSourceReport] = useState([]);
  const [counselorReport, setCounselorReport] = useState([]);
  const [courseReport, setCourseReport] = useState([]);
  const [followUpStats, setFollowUpStats] = useState(null);
  const [followUpOutcomes, setFollowUpOutcomes] = useState([]);

  const handleExport = async () => {
    try {
      await api.reports.exportReport(activeTab);
      toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} report downloaded!`);
    } catch (error) {
      toast.error(error.message || 'Failed to export report');
    }
  };

  const fetchedTabs = useRef(new Set());

  const loadReportData = useCallback(async () => {
    if (fetchedTabs.current.has(activeTab)) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      if (activeTab === 'source') {
        const res = await api.reports.getSourceReport();
        if (res.success) setSourceReport(res.data.report || []);
      } else if (activeTab === 'counselor') {
        const res = await api.reports.getCounselorReport();
        if (res.success) setCounselorReport(res.data.report || []);
      } else if (activeTab === 'course') {
        const res = await api.reports.getCourseReport();
        if (res.success) setCourseReport(res.data.report || []);
      } else if (activeTab === 'followup') {
        const [statsRes, listRes] = await Promise.all([
          api.followUps.getStats(),
          api.followUps.getAll({ limit: 1000 })
        ]);
        if (statsRes.success) setFollowUpStats(statsRes.data);
        if (listRes.success) {
          const followUps = listRes.data || [];
          const outcomes = ['CONNECTED', 'NOT_REACHABLE', 'CALL_BACK', 'INTERESTED', 'NOT_INTERESTED', 'WRONG_NUMBER'];
          const counts = outcomes.map(outcome => ({
            name: outcome.replace(/_/g, ' '),
            value: followUps.filter(f => f.outcome === outcome).length
          })).filter(c => c.value > 0);
          setFollowUpOutcomes(counts);
        }
      }
      fetchedTabs.current.add(activeTab);
    } catch {} finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { loadReportData(); }, [loadReportData]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Reports & Analytics</h2>
          <p className="page-subtitle">Detailed performance analytics</p>
        </div>
        <button className="btn btn-secondary" aria-label="Export report" onClick={handleExport}>
          <HiOutlineDownload /> Export Report
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs" role="tablist" aria-label="Report types">
        <button className={`tab ${activeTab === 'source' ? 'active' : ''}`} role="tab" aria-selected={activeTab === 'source'} onClick={() => setActiveTab('source')}>Source Performance</button>
        <button className={`tab ${activeTab === 'counselor' ? 'active' : ''}`} role="tab" aria-selected={activeTab === 'counselor'} onClick={() => setActiveTab('counselor')}>Counselor Performance</button>
        <button className={`tab ${activeTab === 'course' ? 'active' : ''}`} role="tab" aria-selected={activeTab === 'course'} onClick={() => setActiveTab('course')}>Course Performance</button>
        <button className={`tab ${activeTab === 'followup' ? 'active' : ''}`} role="tab" aria-selected={activeTab === 'followup'} onClick={() => setActiveTab('followup')}>Follow-up Compliance</button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500" role="status">
          <div className="spinner mx-auto mb-4 h-[30px] w-[30px] rounded-full border-[3px] border-black/10 border-l-indigo-600 animate-spin"></div>
          <p>Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Source Performance */}
          {activeTab === 'source' && (
            <div className="animate-fade-in">
              <div className="chart-grid">
                <div className="chart-card chart-card-full">
                  <div className="chart-card-header">
                    <div>
                      <div className="chart-card-title">Source-wise Conversion</div>
                      <div className="chart-card-subtitle">Total leads vs conversions by source</div>
                    </div>
                  </div>
                  {sourceReport.length === 0 ? (
                    <div className="flex h-[350px] items-center justify-center text-gray-500">No source data recorded</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={sourceReport} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="source" tick={{ fontSize: 11, fill: '#6b7280' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="total" name="Total Leads" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="converted" name="Converted" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="failed" name="Failed" fill="#f87171" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="data-table-wrapper mt-6">
                <div className="data-table-header">
                  <div className="data-table-title">Source Performance Details</div>
                </div>
                {sourceReport.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No details available</div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Source</th>
                        <th>Total Leads</th>
                        <th>Converted</th>
                        <th>Failed</th>
                        <th>Conversion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sourceReport.map(s => (
                        <tr key={s.source}>
                          <td className="font-semibold">{s.source}</td>
                          <td>{s.total}</td>
                          <td className="font-semibold text-emerald-600">{s.converted}</td>
                          <td className="font-semibold text-red-600">{s.failed}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-[60px] overflow-hidden rounded-full bg-gray-200">
                                <div className="h-full rounded-full" style={{ width: `${s.rate}%`, background: s.rate >= 30 ? '#10b981' : s.rate >= 15 ? '#f59e0b' : '#ef4444' }} />
                              </div>
                              <span className="text-[0.8125rem] font-semibold">{s.rate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Counselor Performance */}
          {activeTab === 'counselor' && (
            <div className="animate-fade-in">
              <div className="chart-grid">
                <div className="chart-card chart-card-full">
                  <div className="chart-card-header">
                    <div>
                      <div className="chart-card-title">Counselor Comparison</div>
                      <div className="chart-card-subtitle">Assigned vs Converted vs Failed</div>
                    </div>
                  </div>
                  {counselorReport.length === 0 ? (
                    <div className="flex h-[350px] items-center justify-center text-gray-500">No counselor stats available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={counselorReport} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="assigned" name="Assigned" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="converted" name="Converted" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="failed" name="Failed" fill="#f87171" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {counselorReport.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No details available</div>
              ) : (
                <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                  {counselorReport.map((c, i) => {
                    const avatarInitials = c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    return (
                      <div key={c.id} className="card">
                        <div className="mb-4 flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white"
                            style={{ background: COLORS[i % COLORS.length] }}
                          >
                            {avatarInitials}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{c.name}</div>
                            <div className="text-xs text-gray-500">
                              Target: {c.target} | Conversion Rate: {c.rate}%
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-lg bg-gray-50 p-2 text-center">
                            <div className="font-extrabold text-indigo-600">{c.assigned}</div>
                            <div className="text-[0.65rem] text-gray-500">Assigned</div>
                          </div>
                          <div className="rounded-lg bg-emerald-50 p-2 text-center">
                            <div className="font-extrabold text-emerald-600">{c.converted}</div>
                            <div className="text-[0.65rem] text-gray-500">Converted</div>
                          </div>
                          <div className="rounded-lg bg-red-50 p-2 text-center">
                            <div className="font-extrabold text-red-600">{c.failed}</div>
                            <div className="text-[0.65rem] text-gray-500">Failed</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Course Performance */}
          {activeTab === 'course' && (
            <div className="animate-fade-in">
              <div className="data-table-wrapper">
                <div className="data-table-header">
                  <div className="data-table-title">Course-wise Performance</div>
                </div>
                {courseReport.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No course performance records found</div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Total Leads</th>
                        <th>Converted</th>
                        <th>Conversion Rate</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseReport.map(c => (
                        <tr key={c.id}>
                          <td className="font-semibold">{c.name}</td>
                          <td>{c.total}</td>
                          <td className="font-semibold text-emerald-600">{c.converted}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-[60px] overflow-hidden rounded-full bg-gray-200">
                                <div className="h-full rounded-full bg-indigo-600" style={{ width: `${c.rate}%` }} />
                              </div>
                              <span className="font-semibold">{c.rate}%</span>
                            </div>
                          </td>
                          <td className="font-bold text-indigo-600">₹{c.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Follow-up Compliance */}
          {activeTab === 'followup' && (
            <div className="animate-fade-in">
              <div className="kpi-grid mb-6">
                <div className="kpi-card primary">
                  <div className="kpi-value">{followUpStats?.total || 0}</div>
                  <div className="kpi-label">Total Follow-ups</div>
                </div>
                <div className="kpi-card success">
                  <div className="kpi-value">{followUpStats?.completed || 0}</div>
                  <div className="kpi-label">Completed</div>
                </div>
                <div className="kpi-card danger">
                  <div className="kpi-value">{followUpStats?.overdue || 0}</div>
                  <div className="kpi-label">Overdue</div>
                </div>
                <div className="kpi-card info">
                  <div className="kpi-value">{followUpStats?.complianceRate || 0}%</div>
                  <div className="kpi-label">Compliance Rate</div>
                </div>
              </div>

              <div className="chart-grid">
                <div className="chart-card">
                  <div className="chart-card-header">
                    <div>
                      <div className="chart-card-title">Follow-up Status</div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed', value: followUpStats?.completed || 0 },
                          { name: 'Overdue', value: followUpStats?.overdue || 0 },
                          { name: 'Upcoming', value: followUpStats?.upcoming || 0 },
                        ].filter(d => d.value > 0)}
                        cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={3}
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                        <Cell fill="#6366f1" />
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '12px' }} iconType="circle" iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <div className="chart-card-header">
                    <div>
                      <div className="chart-card-title">Outcome Distribution</div>
                    </div>
                  </div>
                  {followUpOutcomes.length === 0 ? (
                    <div className="flex h-[280px] items-center justify-center text-gray-500">
                      No follow-ups logged with outcomes yet
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={followUpOutcomes}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" name="Count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
