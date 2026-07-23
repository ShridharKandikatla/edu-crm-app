import { HiOutlineCheckCircle, HiOutlinePlus, HiOutlineX, HiOutlineFire } from 'react-icons/hi';

export default function QuickActionsSidebar({ lead, counselor, user, onConvert, onFollowUp, onFail, onReEngage }) {
  return (
    <div>
      <div className="card mb-4">
        <h3 className="text-[0.875rem] font-bold mb-4 text-gray-900">Quick Actions</h3>
        <div className="flex flex-col gap-2">
          {lead.status !== 'CONVERTED' && (
            <button className="btn btn-success w-full" onClick={onConvert}>
              <HiOutlineCheckCircle /> Mark as Converted
            </button>
          )}
          <button className="btn btn-secondary w-full" onClick={onFollowUp}>
            <HiOutlinePlus /> Schedule Follow-up
          </button>
          {lead.status !== 'FAILED' && lead.status !== 'CONVERTED' && (
            <button className="btn btn-danger w-full" onClick={onFail}>
              <HiOutlineX /> Mark as Failed
            </button>
          )}
          {lead.status === 'FAILED' && ['ADMIN', 'MANAGER'].includes(user?.role) && (
            <button className="btn btn-primary w-full bg-indigo-500" onClick={onReEngage}>
              <HiOutlineFire /> Re-engage Lead
            </button>
          )}
        </div>
      </div>

      {counselor && (
        <div className="card mb-4">
          <h3 className="text-[0.875rem] font-bold mb-4 text-gray-900">Assigned Counselor</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-[0.875rem]">
              {(counselor.name || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-[0.875rem]">{counselor.name}</div>
              <div className="text-[0.75rem] text-gray-500">{counselor.role} · {counselor.email}</div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="text-[0.875rem] font-bold mb-3 text-gray-900">Lead Journey</h3>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Created', done: true },
            { label: 'Contacted', done: ['CONTACTED', 'INTERESTED', 'FOLLOW_UP', 'VISITED', 'APPLICATION_STARTED', 'CONVERTED'].includes(lead.status) },
            { label: 'Interested', done: ['INTERESTED', 'FOLLOW_UP', 'VISITED', 'APPLICATION_STARTED', 'CONVERTED'].includes(lead.status) },
            { label: 'Visited', done: ['VISITED', 'APPLICATION_STARTED', 'CONVERTED'].includes(lead.status) },
            { label: 'Applied', done: ['APPLICATION_STARTED', 'CONVERTED'].includes(lead.status) },
            { label: 'Converted', done: lead.status === 'CONVERTED' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[0.7rem] font-bold shrink-0 ${step.done ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                {step.done ? '✓' : i + 1}
              </div>
              <span className={`text-[0.8125rem] ${step.done ? 'font-semibold text-gray-900' : 'font-normal text-gray-400'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
