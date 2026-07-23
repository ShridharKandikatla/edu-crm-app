export default function ActivityTimeline({ activities, formatDateTime, getActivityDotClass }) {
  return (
    <div className="timeline animate-fade-in">
      {activities.length > 0 ? activities.map((activity) => (
        <div key={activity.id} className="timeline-item">
          <div className={`timeline-dot ${getActivityDotClass(activity.action)}`}></div>
          <div className="timeline-content">
            <div className="timeline-title">{activity.description}</div>
            {activity.oldValue && (
              <div className="timeline-description">
                Changed from <strong>{activity.oldValue}</strong> to <strong>{activity.newValue}</strong>
              </div>
            )}
            <div className="timeline-time">{formatDateTime(activity.createdAt)}</div>
          </div>
        </div>
      )) : (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No activity yet</div>
          <div className="empty-state-text">Activities will appear here as actions are taken on this lead.</div>
        </div>
      )}
    </div>
  );
}
