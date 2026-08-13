import { useState, useCallback, useRef, useEffect } from 'react';
import { HiOutlineSparkles, HiOutlineArrowPath, HiOutlinePaperAirplane } from 'react-icons/hi2';
import ChartCard from './ChartCard';
import { SkeletonText } from '../Skeleton';
import { api } from '../../services/api';

const ROLE_TABS = [
  { key: 'admin', label: 'Admin' },
  { key: 'manager', label: 'Manager' },
  { key: 'counselor', label: 'Counselor' },
  { key: 'telecaller', label: 'Telecaller' },
];

const HIGHLIGHT_COLORS = {
  positive: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', dot: 'bg-amber-500' },
  critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', dot: 'bg-red-500' },
};

const PRIORITY_STYLES = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700',
};

const EFFORT_STYLES = {
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

const SUGGESTED_PROMPTS = [
  'Which counselor is underperforming and why?',
  'What is my best lead source by conversion rate?',
  'How can I improve my conversion rate?',
  'Show me revenue breakdown by course',
  'What follow-up strategy should I use for cold leads?',
];

export default function AIInsightsCard({ insights, loading, onRefresh }) {
  const [activeRole, setActiveRole] = useState('admin');
  const [expandedRecs, setExpandedRecs] = useState(true);

  const [prompt, setPrompt] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);
  const queryControllerRef = useRef(null);

  useEffect(() => {
    return () => { queryControllerRef.current?.abort(); };
  }, []);

  const handleRefresh = useCallback(() => {
    if (onRefresh) onRefresh();
  }, [onRefresh]);

  const handleSubmitPrompt = useCallback(async (e) => {
    e.preventDefault();
    const text = prompt.trim();
    if (!text || queryLoading) return;

    queryControllerRef.current?.abort();
    const controller = new AbortController();
    queryControllerRef.current = controller;

    setQueryLoading(true);
    setPrompt('');

    const userEntry = { role: 'user', text, timestamp: Date.now() };
    setQueryHistory(prev => [...prev, userEntry]);

    try {
      const res = await api.ai.dashboardQuery(text, { signal: controller.signal });
      if (res?.success) {
        const aiEntry = { role: 'ai', text: res.data.reply, engine: res.data.engine, timestamp: Date.now() };
        setQueryHistory(prev => [...prev, aiEntry]);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      const errEntry = { role: 'ai', text: 'Failed to get a response. Please try again.', engine: 'error', timestamp: Date.now() };
      setQueryHistory(prev => [...prev, errEntry]);
    } finally {
      if (queryControllerRef.current === controller) setQueryLoading(false);
    }
  }, [prompt, queryLoading]);

  const handleSuggestedPrompt = useCallback((text) => {
    setPrompt(text);
  }, []);

  if (loading && !insights) {
    return (
      <ChartCard title="AI Insights" subtitle="Powered by Grok" delay="0.75s">
        <div className="space-y-4 mt-2">
          <SkeletonText lines={2} />
          <div className="grid grid-cols-2 gap-3">
            <SkeletonText lines={2} />
            <SkeletonText lines={2} />
          </div>
          <SkeletonText lines={3} />
        </div>
      </ChartCard>
    );
  }

  if (!insights) return null;

  const roleData = insights.roleStatus?.[activeRole];

  return (
    <ChartCard
      title="AI Insights"
      subtitle={
        <span className="flex items-center gap-1.5">
          Powered by {insights.engine === 'groq' ? 'Groq' : insights.engine === 'openai' ? 'GPT' : 'Analysis'}
          {loading && <span className="inline-block w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />}
        </span>
      }
      delay="0.75s"
    >
      <div className="space-y-5 mt-2">

        {/* ── Prompt Input ── */}
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl p-4 border border-indigo-100 dark:from-indigo-950/60 dark:to-violet-950/60 dark:border-indigo-900/60">
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineSparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-semibold text-indigo-700">Ask about your data</span>
          </div>

          <form onSubmit={handleSubmitPrompt} className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Which courses have the best ROI this month?"
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-[#1f2530] border border-indigo-200 dark:border-indigo-800/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-gray-400"
              disabled={queryLoading}
            />
            <button
              type="submit"
              disabled={!prompt.trim() || queryLoading}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              {queryLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <HiOutlinePaperAirplane className="w-4 h-4" />
              )}
            </button>
          </form>

          {/* Suggested prompts */}
          {queryHistory.length === 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {SUGGESTED_PROMPTS.map((sp, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedPrompt(sp)}
                  className="px-2.5 py-1 text-[11px] text-indigo-600 bg-white dark:bg-[#1f2530] border border-indigo-200 rounded-full hover:bg-indigo-50 transition-colors"
                >
                  {sp}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Query History ── */}
        {queryHistory.length > 0 && (
          <div className="space-y-3">
            {queryHistory.map((entry, i) => (
              <div key={i} className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
                  entry.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-[#1f2530] border border-gray-200'
                }`}>
                  {entry.role === 'ai' && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <HiOutlineSparkles className="w-3 h-3 text-indigo-500" />
                      <span className="text-[10px] font-semibold text-indigo-500">
                        {entry.engine === 'groq' ? 'Groq' : entry.engine === 'error' ? 'Error' : 'Demo'}
                      </span>
                    </div>
                  )}
                  <p className={`text-sm leading-relaxed whitespace-pre-line ${entry.role === 'user' ? 'text-white' : 'text-gray-700'}`}>
                    {entry.text}
                  </p>
                </div>
              </div>
            ))}
            {queryLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-[#1f2530] border border-gray-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => { setQueryHistory([]); }}
              className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              Clear chat
            </button>
          </div>
        )}

        {/* ── Divider ── */}
        <div className="border-t border-gray-100" />

        {/* Summary */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100 dark:from-indigo-950/60 dark:to-purple-950/60 dark:border-indigo-900/60">
          <p className="text-sm text-gray-700 leading-relaxed">{insights.summary}</p>
        </div>

        {/* Highlights */}
        {insights.highlights?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {insights.highlights.map((h, i) => {
              const c = HIGHLIGHT_COLORS[h.type] || HIGHLIGHT_COLORS.warning;
              return (
                <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg ${c.bg} border ${c.border}`}>
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${c.dot}`} />
                  <span className={`text-xs ${c.text} leading-relaxed`}>{h.text}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Role Status Tabs */}
        <div>
          <div className="flex items-center gap-1 mb-3 border-b border-gray-100 pb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-2">Role Status</span>
            {ROLE_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveRole(tab.key)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeRole === tab.key
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {roleData && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 leading-relaxed mb-2">{roleData.overview}</p>
              {roleData.metrics?.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {roleData.metrics.map((m, i) => (
                    <div key={i} className="bg-white dark:bg-[#1f2530] rounded-md p-2 border border-gray-100">
                      <div className="text-[10px] text-gray-400 uppercase tracking-wide">{m.label}</div>
                      <div className="text-sm font-bold text-gray-800 mt-0.5">{m.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chart Insights */}
        {insights.chartInsights?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Chart Insights</h4>
            <div className="space-y-2">
              {insights.chartInsights.map((ci, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-1.5 py-0.5 rounded">
                      {ci.chart?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{ci.insight}</p>
                  {ci.suggestion && (
                    <p className="text-xs text-indigo-600 mt-1 leading-relaxed">
                      <span className="font-semibold">Suggestion:</span> {ci.suggestion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {insights.recommendations?.length > 0 && (
          <div>
            <button
              onClick={() => setExpandedRecs(!expandedRecs)}
              className="flex items-center gap-2 mb-2 group"
            >
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recommendations</h4>
              <span className="text-[10px] text-gray-400 group-hover:text-gray-600">
                {expandedRecs ? '(click to collapse)' : '(click to expand)'}
              </span>
            </button>
            {expandedRecs && (
              <div className="space-y-2">
                {insights.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 bg-white dark:bg-[#1f2530] rounded-lg border border-gray-100">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 mt-0.5 ${PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.medium}`}>
                      {rec.priority?.toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] text-gray-400 uppercase">{rec.category}</span>
                      <p className="text-xs text-gray-700 leading-relaxed">{rec.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feature Suggestions */}
        {insights.featureSuggestions?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Suggested Features</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {insights.featureSuggestions.map((fs, i) => (
                <div key={i} className="bg-white dark:bg-[#1f2530] rounded-lg p-3 border border-gray-100 hover:border-indigo-200 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gray-800">{fs.feature}</span>
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${EFFORT_STYLES[fs.effort] || ''}`}>
                      {fs.effort}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{fs.benefit}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Refresh button */}
        <div className="flex justify-end pt-1">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-50"
          >
            <HiOutlineArrowPath className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Insights'}
          </button>
        </div>
      </div>
    </ChartCard>
  );
}
