import EmptyState from '../EmptyState';

export default function RecentLeadsTable({ leads }) {
  if (leads.length === 0) {
    return <EmptyState icon="👥" title="No incoming leads" />;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Course</th>
          <th>Source</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => (
          <tr key={lead.id}>
            <td className="font-semibold text-gray-900">{lead.name}</td>
            <td>{lead.course?.name || lead.courseName || 'Unassigned'}</td>
            <td>
              <span className="text-xs">
                {(lead.source || '').replace(/_/g, ' ')}
              </span>
            </td>
            <td>
              <span className={`badge badge-${(lead.status || '').toLowerCase().replace(/_/g, '-')}`}>
                {(lead.status || '').replace(/_/g, ' ')}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
