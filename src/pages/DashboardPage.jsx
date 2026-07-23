import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlinePhone,
  HiOutlineXCircle,
  HiOutlineFire,
  HiOutlineCurrencyRupee,
} from 'react-icons/hi';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SkeletonCard } from '../components/Skeleton';
import ChartCard from '../components/dashboard/ChartCard';
import KPICard from '../components/dashboard/KPICard';
import CounselorLeaderboard from '../components/dashboard/CounselorLeaderboard';
import RecentLeadsTable from '../components/dashboard/RecentLeadsTable';
import UpcomingFollowUps from '../components/dashboard/UpcomingFollowUps';
import AIInsightsCard from '../components/dashboard/AIInsightsCard';
import { FunnelChart, SourcePieChart, TrendAreaChart } from '../components/dashboard/Charts';
import { StatusDistributionChart, ConversionDonutChart, MonthlyComparisonChart } from '../components/dashboard/AdditionalCharts';

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [counselors, setCounselors] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState([]);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('charts');
  const insightsControllerRef = useRef(null);

  const fetchInsights = useCallback(async () => {
    if (!isAdmin) return;
    insightsControllerRef.current?.abort();
    const controller = new AbortController();
    insightsControllerRef.current = controller;
    setInsightsLoading(true);
    try {
      const res = await api.ai.getDashboardInsights({ signal: controller.signal });
      if (res?.success) setInsights(res.data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        // Insights load failed silently
      }
    } finally {
      if (insightsControllerRef.current === controller) setInsightsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const results = await Promise.allSettled([
          api.dashboard.getStats(),
          api.dashboard.getCharts(),
          api.leads.getAll({ limit: 5 }),
          api.followUps.getAll({ limit: 5 }),
        ]);

        const [statsResult, chartsResult, leadsResult, followUpsResult] = results;

        if (statsResult.status === 'fulfilled' && statsResult.value?.success) {
          setStats(statsResult.value.data);
        }
        if (chartsResult.status === 'fulfilled' && chartsResult.value?.success) {
          setCharts(chartsResult.value.data);
        }
        if (leadsResult.status === 'fulfilled' && leadsResult.value?.success) {
          setRecentLeads(leadsResult.value.data || []);
        }
        if (followUpsResult.status === 'fulfilled' && followUpsResult.value?.success) {
          setUpcomingFollowUps(followUpsResult.value.data || []);
        }

        try {
          const counselorRes = await api.reports.getCounselorReport();
          if (counselorRes.success) {
            setCounselors((counselorRes.data.report || []).slice(0, 5));
          }
        } catch {
          // Counselor/Telecaller role might not have access
        }

      } catch {
        // Dashboard data load failed silently
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  useEffect(() => {
    return () => { insightsControllerRef.current?.abort(); };
  }, []);

  useEffect(() => {
    if (activeTab === 'ai' && isAdmin && !insights && !insightsLoading) {
      fetchInsights();
    }
  }, [activeTab, isAdmin, insights, insightsLoading, fetchInsights]);

  const funnelData = useMemo(() =>
    (charts?.leadFunnel || []).map((item, idx) => ({ ...item, color: COLORS[idx % COLORS.length] })),
    [charts]
  );

  const pieData = useMemo(() =>
    (charts?.sourceData || []).map((item, idx) => ({ ...item, color: COLORS[(idx + 2) % COLORS.length] })),
    [charts]
  );

  const trendData = useMemo(() => charts?.trendData || [], [charts]);

  if (loading) {
    return (
      <div>
        <div className="kpi-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-5 mt-6">
          <SkeletonCard className="h-[300px]" />
          <SkeletonCard className="h-[300px]" />
        </div>
      </div>
    );
  }

  const ds = stats || {
    totalLeads: 0, newThisMonth: 0, converted: 0, conversionRate: 0,
    pendingFollowUps: 0, failed: 0, hotLeads: 0, revenue: 0, totalLeadsChange: 0,
  };

  const kpiCards = [
    { label: 'Total Leads', value: ds.totalLeads, change: ds.totalLeadsChange, icon: HiOutlineUsers, variant: 'primary', footer: `${ds.newThisMonth || 0} new this month` },
    { label: 'Converted', value: ds.converted, change: 8.3, icon: HiOutlineCheckCircle, variant: 'success', footer: `${ds.conversionRate}% conversion rate` },
    { label: 'Pending Follow-ups', value: ds.pendingFollowUps, change: -5.2, icon: HiOutlinePhone, variant: 'warning', footer: 'Due today & overdue' },
    { label: 'Failed Leads', value: ds.failed, change: -3.1, icon: HiOutlineXCircle, variant: 'danger', footer: 'This month' },
    { label: 'Hot Leads', value: ds.hotLeads, change: 15.0, icon: HiOutlineFire, variant: 'info', footer: 'Ready to convert' },
    { label: 'Revenue', value: `₹${(ds.revenue / 100000).toFixed(1)}L`, change: 22.4, icon: HiOutlineCurrencyRupee, variant: 'success', footer: 'From converted leads', isText: true },
  ];

  return (
    <div>
      <div className="kpi-grid">
        {kpiCards.map((kpi, i) => (
          <KPICard key={kpi.label} {...kpi} index={i} />
        ))}
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 mt-6 mb-5 border-b border-gray-200 pb-px">
        <button
          onClick={() => setActiveTab('charts')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors -mb-px ${
            activeTab === 'charts'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Charts
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors -mb-px ${
              activeTab === 'ai'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            AI Insights
          </button>
        )}
      </div>

      {activeTab === 'charts' && (
        <>
          <div className="chart-grid">
            <ChartCard title="Lead Pipeline" subtitle="Current distribution across stages" delay="0.3s">
              <FunnelChart data={funnelData} />
            </ChartCard>
            <ChartCard title="Lead Sources" subtitle="Where your leads come from" delay="0.35s">
              <SourcePieChart data={pieData} />
            </ChartCard>
          </div>

          <div className="chart-grid">
            <ChartCard title="Lead Trends" subtitle="Leads received vs converted (30 days)" delay="0.4s">
              <TrendAreaChart data={trendData} />
            </ChartCard>
            <ChartCard title="Status Distribution" subtitle="Lead pipeline stages" delay="0.45s">
              <StatusDistributionChart data={funnelData} />
            </ChartCard>
          </div>

          <div className="chart-grid">
            <ChartCard title="Conversion Overview" subtitle="Converted vs Failed vs Active" delay="0.5s">
              <ConversionDonutChart data={stats} />
            </ChartCard>
            <ChartCard title="Monthly Comparison" subtitle="Leads vs Conversions" delay="0.55s">
              <MonthlyComparisonChart data={funnelData.slice(0, 6)} />
            </ChartCard>
          </div>

          <div className="chart-grid">
            <ChartCard title="Counselor Leaderboard" subtitle="Top performers this month" delay="0.6s">
              <CounselorLeaderboard counselors={counselors} />
            </ChartCard>
            <ChartCard title="Recent Leads" subtitle="Latest incoming leads" delay="0.65s">
              <RecentLeadsTable leads={recentLeads} />
            </ChartCard>
          </div>

          <div className="chart-grid">
            <ChartCard title="Upcoming Follow-ups" subtitle="Next scheduled actions" delay="0.7s">
              <UpcomingFollowUps followUps={upcomingFollowUps} />
            </ChartCard>
          </div>
        </>
      )}

      {activeTab === 'ai' && isAdmin && (
        <AIInsightsCard
          insights={insights}
          loading={insightsLoading}
          onRefresh={fetchInsights}
        />
      )}
    </div>
  );
}
