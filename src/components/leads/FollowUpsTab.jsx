import { HiOutlinePlus, HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi';

export default function FollowUpsTab({ followUps, onSchedule, onComplete, formatDateTime }) {
  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <button className="btn btn-primary btn-sm" onClick={onSchedule}>
          <HiOutlinePlus /> Schedule Follow-up
        </button>
      </div>
      {followUps.length > 0 ? followUps.map((fu) => {
        const isOverdue = !fu.completedAt && new Date(fu.scheduledAt) < new Date();
        const isCompleted = !!fu.completedAt;
        return (
          <div key={fu.id} className={`followup-card mb-3 ${isOverdue ? 'overdue' : isCompleted ? '' : 'upcoming'}`}>
            <div className="followup-card-header">
              <span className="followup-card-lead flex items-center gap-1.5">
                {isCompleted ? <HiOutlineCheckCircle className="text-emerald-500" /> : isOverdue ? <HiOutlineClock className="text-red-600" /> : <HiOutlineClock className="text-amber-500" />}
                {fu.type}
              </span>
              <div className="flex gap-2 items-center">
                <span className={`badge ${isCompleted ? 'badge-converted' : isOverdue ? 'badge-failed' : 'badge-new'}`}>
                  {isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Scheduled'}
                </span>
                {!isCompleted && (
                  <button
                    className="btn btn-success btn-xs text-[0.7rem] py-0.5 px-1.5"
                    onClick={() => onComplete(fu.id)}
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
            <div className="followup-card-time">
              Scheduled: {formatDateTime(fu.scheduledAt)}
              {isCompleted && ` · Completed: ${formatDateTime(fu.completedAt)}`}
            </div>
            {fu.notes && <div className="followup-card-notes"><strong>Notes: </strong>{fu.notes}</div>}
            {fu.outcome && (
              <div className="followup-card-footer border-t border-gray-100 pt-1.5 mt-1.5">
                <span className="text-[0.75rem] text-gray-500">Outcome: <strong>{fu.outcome.replace(/_/g, ' ')}</strong></span>
              </div>
            )}
          </div>
        );
      }) : (
        <div className="empty-state">
          <div className="empty-state-icon">📞</div>
          <div className="empty-state-title">No follow-ups</div>
          <div className="empty-state-text">Schedule a follow-up to start tracking communications.</div>
        </div>
      )}
    </div>
  );
}
