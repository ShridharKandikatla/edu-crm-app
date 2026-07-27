import {
  HiOutlinePhone, HiOutlineMail, HiOutlineCalendar,
  HiOutlineUser, HiOutlineTag, HiOutlineClock, HiOutlineX,
  HiOutlineLightningBolt, HiPencil
} from 'react-icons/hi';

function AiScoreGauge({ score }) {
  const tier = score >= 70 ? 'HOT' : score >= 40 ? 'WARM' : 'COLD';
  const color = score >= 70 ? '#f87171' : score >= 40 ? '#fbbf24' : '#60a5fa';
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-14 w-14 flex-shrink-0">
        <svg className="h-14 w-14 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
          <circle cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-extrabold" style={{ color }}>{score}</span>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <HiOutlineLightningBolt className="h-3.5 w-3.5" style={{ color }} />
          <span className="text-[0.7rem] font-bold uppercase tracking-wider" style={{ color }}>AI Score</span>
        </div>
        <div className="mt-0.5 text-[0.65rem] text-white/30">{tier} · Rule-based</div>
      </div>
    </div>
  );
}

export default function LeadProfileCard({ lead, initials, counselor, formatDate, onEdit }) {
  return (
    <div className="lead-profile-card mb-6">
      <div className="lead-profile-header">
        <div className="flex items-start justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="lead-profile-avatar">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="lead-profile-name truncate">{lead.name}</div>
              <div className="lead-profile-course">{lead.course?.name || 'No Course Selected'} · {lead.intake?.name || 'No Intake'}</div>
              <div className="lead-profile-badges">
                <span className={`badge badge-${lead.status.toLowerCase().replace(/_/g, '-')} bg-white/20 text-white`}>
                  {lead.status.replace(/_/g, ' ')}
                </span>
                <span className={`score-badge bg-white/20 ${
                  lead.score === 'HOT' ? 'text-red-400' : lead.score === 'WARM' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  <span className="score-dot" style={{ background: lead.score === 'HOT' ? '#f87171' : lead.score === 'WARM' ? '#fbbf24' : '#60a5fa' }}></span>
                  {lead.score}
                </span>
              </div>
            </div>
          </div>
          {onEdit && (
            <button
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-blue-600 bg-white hover:bg-white/90 shadow-sm transition-colors flex-shrink-0"
              onClick={onEdit}
              title="Edit lead details"
            >
              <HiPencil className="h-4 w-4" />
              <span className="text-sm font-medium">Edit Lead</span>
            </button>
          )}
        </div>
        {typeof lead.aiScore === 'number' && lead.aiScore > 0 && (
          <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
            <AiScoreGauge score={lead.aiScore} />
          </div>
        )}
      </div>

      <div className="lead-profile-body">
        <div className="lead-info-row">
          <HiOutlinePhone className="lead-info-icon" />
          <span className="lead-info-label">Phone</span>
          <span className="lead-info-value">{lead.phone}</span>
        </div>
        <div className="lead-info-row">
          <HiOutlineMail className="lead-info-icon" />
          <span className="lead-info-label">Email</span>
          <span className="lead-info-value">{lead.email || '—'}</span>
        </div>
        <div className="lead-info-row">
          <HiOutlineTag className="lead-info-icon" />
          <span className="lead-info-label">Source</span>
          <span className="lead-info-value">{(lead.source || '').replace(/_/g, ' ')}</span>
        </div>
        <div className="lead-info-row">
          <HiOutlineUser className="lead-info-icon" />
          <span className="lead-info-label">Counselor</span>
          <span className="lead-info-value">{counselor?.name || 'Unassigned'}</span>
        </div>
        <div className="lead-info-row">
          <HiOutlineCalendar className="lead-info-icon" />
          <span className="lead-info-label">Created</span>
          <span className="lead-info-value">{formatDate(lead.createdAt)}</span>
        </div>
        <div className="lead-info-row">
          <HiOutlineClock className="lead-info-icon" />
          <span className="lead-info-label">Last Contact</span>
          <span className="lead-info-value">{formatDate(lead.lastContactDate)}</span>
        </div>
        {lead.failureReason && (
          <div className="lead-info-row bg-red-50 mx-[-24px] mb-[-24px] p-3 px-6 rounded-b-2xl">
            <HiOutlineX className="lead-info-icon text-red-600" />
            <span className="lead-info-label text-red-600">Failure Reason</span>
            <span className="lead-info-value text-red-600">{lead.failureReason}</span>
          </div>
        )}
      </div>
    </div>
  );
}
