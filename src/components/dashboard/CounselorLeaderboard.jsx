const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export default function CounselorLeaderboard({ counselors }) {
  if (counselors.length === 0) {
    return (
      <div className="py-10 px-4 text-center text-gray-500 text-sm">
        Leaderboard not available for your role or no active counselors.
      </div>
    );
  }

  const maxConversions = Math.max(...counselors.map(c => c.converted || 0), 1);

  return (
    <div className="px-1">
      {counselors.map((counselor, i) => {
        const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'default';
        const avatarInitials = (counselor.name || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        return (
          <div key={counselor.id} className="leaderboard-item">
            <div className={`leaderboard-rank ${rankClass}`}>{i + 1}</div>
            <div
              className="leaderboard-avatar"
              style={{ background: COLORS[i % COLORS.length] }}
            >
              {avatarInitials}
            </div>
            <div className="leaderboard-name">
              {counselor.name}
              <div className="text-[0.7rem] text-gray-400 font-normal">
                {counselor.assigned} assigned · {counselor.pendingFollowUps || 0} pending
              </div>
            </div>
            <div className="leaderboard-conversions">{counselor.converted}</div>
            <div className="leaderboard-bar">
              <div
                className="leaderboard-bar-fill"
                style={{ width: `${(counselor.converted / maxConversions) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
