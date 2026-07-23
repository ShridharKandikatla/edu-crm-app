import { HiOutlinePhone } from 'react-icons/hi';
import EmptyState from '../EmptyState';

export default function UpcomingFollowUps({ followUps }) {
  if (followUps.length === 0) {
    return (
      <EmptyState icon="📋" title="All caught up!" text="No pending follow-ups" />
    );
  }

  return (
    <div>
      {followUps.map((fu) => {
        const isOverdue = new Date(fu.scheduledAt) < new Date();
        return (
          <div
            key={fu.id}
            className="flex items-center gap-3 py-3 border-b border-gray-100"
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 ${
                isOverdue ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
              }`}
            >
              <HiOutlinePhone />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-[0.8125rem] text-gray-900">
                {fu.lead?.name || fu.leadName}
              </div>
              <div className="text-xs text-gray-500">
                {fu.type} · {fu.lead?.course?.name || fu.courseName || 'General'}
              </div>
            </div>
            <div
              className={`text-xs font-semibold ${
                isOverdue ? 'text-red-600' : 'text-gray-500'
              }`}
            >
              {isOverdue ? 'Overdue' : new Date(fu.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
