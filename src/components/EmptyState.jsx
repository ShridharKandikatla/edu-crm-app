export default function EmptyState({ icon = '📋', title, text, action }) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state-icon text-5xl text-gray-300 mb-4">{icon}</div>
      <div className="empty-state-title text-lg font-bold text-gray-800 mb-2">{title}</div>
      {text && <div className="empty-state-text text-sm text-gray-500 max-w-[400px] mx-auto mb-6">{text}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
