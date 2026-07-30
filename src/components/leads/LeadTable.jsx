import { HiOutlineDotsVertical } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useFeatures } from '../../hooks/useFeatures';

export default function LeadTable({
  leads, selectedLeads, toggleSelect, toggleSelectAll,
  sortField, sortDir, handleSort, formatDate,
}) {
  const navigate = useNavigate();
  const features = useFeatures()
  const allSelected = selectedLeads.length === leads.length && leads.length > 0;

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th className="w-[40px]" onClick={(e) => e.stopPropagation()}>
            <div
              className={`checkbox ${allSelected ? 'checked' : ''}`}
              onClick={toggleSelectAll}
              role="checkbox"
              aria-checked={allSelected}
              aria-label="Select all leads"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleSelectAll(); } }}
            >
              {allSelected && '✓'}
            </div>
          </th>
          <th className="cursor-pointer" scope="col" onClick={() => handleSort('name')} aria-sort={sortField === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
            Name {sortField === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
          </th>
          <th scope="col" className="hidden md:table-cell">Contact</th>
          <th scope="col" className="hidden lg:table-cell">Course</th>
          <th scope="col" className="hidden lg:table-cell cursor-pointer" onClick={() => handleSort('source')} aria-sort={sortField === 'source' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
            Source {sortField === 'source' && (sortDir === 'asc' ? '↑' : '↓')}
          </th>
          <th className="cursor-pointer" scope="col" onClick={() => handleSort('status')} aria-sort={sortField === 'status' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
            Status {sortField === 'status' && (sortDir === 'asc' ? '↑' : '↓')}
          </th>
          <th scope="col" className="hidden lg:table-cell">Score</th>
              {features.AI_SCORE && (
            <th scope="col" className="hidden xl:table-cell cursor-pointer" onClick={() => handleSort('aiScore')} aria-sort={sortField === 'aiScore' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
              AI Score {sortField === 'aiScore' && (sortDir === 'asc' ? '↑' : '↓')}
            </th>
          )}
          <th scope="col" className="hidden md:table-cell">Counselor</th>
          <th scope="col" className="hidden lg:table-cell cursor-pointer" onClick={() => handleSort('createdAt')} aria-sort={sortField === 'createdAt' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
            Created {sortField === 'createdAt' && (sortDir === 'asc' ? '↑' : '↓')}
          </th>
          <th className="w-[50px]" scope="col"></th>
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => {
          const initials = (lead.name || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
          return (
            <tr key={lead.id} className="cursor-pointer" onClick={() => navigate(`/leads/${lead.id}`)}>
              <td onClick={(e) => e.stopPropagation()}>
                <div
                  className={`checkbox ${selectedLeads.includes(lead.id) ? 'checked' : ''}`}
                  onClick={() => toggleSelect(lead.id)}
                >
                  {selectedLeads.includes(lead.id) && '✓'}
                </div>
              </td>
              <td>
                <div className="flex items-center gap-2.5">
                  <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                    {initials}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-[0.8125rem]">{lead.name}</div>
                    <div className="text-[0.7rem] text-gray-400 md:hidden">{lead.phone}</div>
                    <div className="text-[0.7rem] text-gray-400 hidden md:block">{lead.email || 'No Email'}</div>
                  </div>
                </div>
              </td>
              <td className="text-[0.8125rem] hidden md:table-cell">{lead.phone}</td>
              <td className="hidden lg:table-cell">
                <div className="text-[0.8125rem] max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {lead.course?.name || lead.courseName || '—'}
                </div>
              </td>
              <td className="hidden lg:table-cell">
                <span className="text-[0.75rem] text-gray-500">
                  {(lead.source || '').replace(/_/g, ' ')}
                </span>
              </td>
              <td>
                <span className={`badge badge-${(lead.status || '').toLowerCase().replace(/_/g, '-')}`}>
                  {(lead.status || '').replace(/_/g, ' ')}
                </span>
              </td>
              <td className="hidden lg:table-cell">
                <span className={`score-badge score-${(lead.score || '').toLowerCase()}`}>
                  <span className="score-dot"></span>
                  {lead.score}
                </span>
              </td>
          {features.AI_SCORE && (
                <td className="hidden xl:table-cell">
                  {typeof lead.aiScore === 'number' && lead.aiScore > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-8 overflow-hidden rounded-full bg-white/10">
                        <div className={`h-full rounded-full transition-all duration-500 ${
                          lead.aiScore >= 70 ? 'bg-red-500' : lead.aiScore >= 40 ? 'bg-amber-500' : 'bg-blue-500'
                        }`} style={{ width: `${lead.aiScore}%` }} />
                      </div>
                      <span className={`text-[0.75rem] font-bold ${
                        lead.aiScore >= 70 ? 'text-red-500' : lead.aiScore >= 40 ? 'text-amber-500' : 'text-blue-500'
                      }`}>{lead.aiScore}</span>
                    </div>
                  ) : (
                    <span className="text-[0.75rem] text-gray-400">—</span>
                  )}
                </td>
              )}
              <td className="text-[0.8125rem] hidden md:table-cell">{lead.counselor?.name || lead.assignedCounselor || '—'}</td>
              <td className="hidden lg:table-cell text-[0.75rem] text-gray-500">{formatDate(lead.createdAt)}</td>
              <td onClick={(e) => e.stopPropagation()}>
                <button className="btn btn-ghost btn-icon btn-sm" aria-label={`View details for ${lead.name}`} onClick={() => navigate(`/leads/${lead.id}`)}>
                  <HiOutlineDotsVertical />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
