import { HiOutlineSearch } from 'react-icons/hi';
import { STATUS_OPTIONS, SCORE_OPTIONS, SOURCE_OPTIONS } from '../../constants/filterOptions';

export default function LeadFilters({
  search, setSearch, statusFilter, setStatusFilter,
  scoreFilter, setScoreFilter, sourceFilter, setSourceFilter,
  setCurrentPage,
}) {
  const hasFilters = statusFilter !== 'ALL' || scoreFilter !== 'ALL' || sourceFilter !== 'ALL' || search;

  return (
    <div className="filter-bar animate-fade-in-up">
      <div className="topbar-search w-full sm:w-[220px]">
        <HiOutlineSearch className="topbar-search-icon" />
        <input
          type="text"
          className="topbar-search-input"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <select
        className="form-select"
        value={statusFilter}
        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
      >
        {STATUS_OPTIONS.map(s => (
          <option key={s} value={s}>{s === 'ALL' ? 'All Status' : s.replace(/_/g, ' ')}</option>
        ))}
      </select>
      <select
        className="form-select"
        value={scoreFilter}
        onChange={(e) => { setScoreFilter(e.target.value); setCurrentPage(1); }}
      >
        {SCORE_OPTIONS.map(s => (
          <option key={s} value={s}>{s === 'ALL' ? 'All Scores' : s}</option>
        ))}
      </select>
      <select
        className="form-select"
        value={sourceFilter}
        onChange={(e) => { setSourceFilter(e.target.value); setCurrentPage(1); }}
      >
        {SOURCE_OPTIONS.map(s => (
          <option key={s} value={s}>{s === 'ALL' ? 'All Sources' : s.replace(/_/g, ' ')}</option>
        ))}
      </select>
      {hasFilters && (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setStatusFilter('ALL'); setScoreFilter('ALL');
            setSourceFilter('ALL'); setSearch('');
            setCurrentPage(1);
          }}
        >
          Clear all
        </button>
      )}
    </div>
  );
}
