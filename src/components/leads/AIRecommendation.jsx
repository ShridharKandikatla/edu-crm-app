import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { HiOutlineLightningBolt, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineInformationCircle } from 'react-icons/hi';

const PRIORITY_STYLES = {
  critical: 'border-red-500/40 bg-red-500/10 text-red-300',
  high: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  medium: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
  low: 'border-white/10 bg-white/[0.03] text-white/40',
};

const ACTION_ICONS = {
  CALL: '📞',
  WHATSAPP: '💬',
  EMAIL: '✉️',
  SMS: '📝',
  WAIT: '⏰',
};

const formatDueIn = (dateStr) => {
  const diff = new Date(dateStr) - new Date();
  if (diff < 0) return 'overdue';
  const hours = Math.round(diff / 3600000);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
};

export default function AIRecommendation({ leadId, compact = false }) {
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!leadId) return;
    setLoading(true);
    setError('');
    api.ai.getRecommendation(leadId)
      .then(res => {
        if (res?.success && res.data) {
          setRec({
            action: res.data.type,
            message: res.data.notes,
            priority: res.data.confidence,
            reasons: res.data.reason ? [res.data.reason] : [],
            dueIn: res.data.scheduledAt ? formatDueIn(res.data.scheduledAt) : undefined,
          });
        } else {
          setError('Could not load recommendation');
        }
      })
      .catch(() => setError('Could not load recommendation'))
      .finally(() => setLoading(false));
  }, [leadId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-white/30">
        <span className="h-3.5 w-3.5 rounded-full border-2 border-white/10 border-t-indigo-400 animate-spin" />
        Loading recommendation...
      </div>
    );
  }

  if (error || !rec || !rec.action) {
    return null;
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[0.7rem] font-semibold ${PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.medium}`}>
        <span>{ACTION_ICONS[rec.action] || '💡'}</span>
        <span>{rec.action.replace(/_/g, ' ')}</span>
        {rec.dueIn && <span className="opacity-60">· {rec.dueIn}</span>}
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4 text-white" style={{ background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))' }}>
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70">
        <HiOutlineLightningBolt className="h-3.5 w-3.5" />
        AI Recommendation
      </div>
      <div className="mb-2 flex items-start gap-2">
        <span className="mt-0.5 text-lg">{ACTION_ICONS[rec.action] || '💡'}</span>
        <div>
          <div className="text-sm font-bold text-white">{rec.message}</div>
          <div className="mt-1 flex items-center gap-3 text-xs text-white/70">
            <span>Priority: {rec.priority}</span>
            {rec.confidence && <span>Confidence: {rec.confidence}</span>}
            {rec.dueIn && <span>Due: {rec.dueIn}</span>}
          </div>
        </div>
      </div>
      {rec.reasons && rec.reasons.length > 0 && (
        <div className="mt-2 space-y-1 border-t border-white/10 pt-2">
          {rec.reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-white/70">
              <HiOutlineInformationCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
              {r}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BulkRecommendations() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.ai.getRecommendations()
      .then(res => {
        if (res?.success) setRecs(res.data?.recommendations || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        <div className="spinner mx-auto mb-3 h-[24px] w-[24px] rounded-full border-[3px] border-black/10 border-l-indigo-600 animate-spin" />
        Loading recommendations...
      </div>
    );
  }

  if (recs.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
        <HiOutlineCheckCircle className="mx-auto mb-2 h-8 w-8 text-emerald-500/50" />
        <div className="text-sm font-semibold text-gray-600">All caught up!</div>
        <div className="mt-1 text-xs text-gray-400">No pending recommendations right now.</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recs.map((r, i) => (
        <div key={i} className={`flex items-center gap-3 rounded-lg border p-3 ${PRIORITY_STYLES[r.priority] || PRIORITY_STYLES.medium}`}>
          <span className="text-lg">{ACTION_ICONS[r.action] || '💡'}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{r.leadName || 'Unknown Lead'}</div>
            <div className="truncate text-xs opacity-70">{r.message}</div>
          </div>
          {r.dueIn && <span className="whitespace-nowrap text-[0.65rem] opacity-50">{r.dueIn}</span>}
        </div>
      ))}
    </div>
  );
}
