import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { SkeletonTable } from '../components/Skeleton';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import LeadFilters from '../components/leads/LeadFilters';
import LeadTable from '../components/leads/LeadTable';
import LeadPagination from '../components/leads/LeadPagination';
import { HiOutlinePlus, HiOutlineFilter, HiOutlineDownload } from 'react-icons/hi';
import { useToast } from '../context/ToastContext';
import { STATUS_OPTIONS, SCORE_OPTIONS, SOURCE_OPTIONS } from '../constants/filterOptions';

export default function LeadListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [leadsList, setLeadsList] = useState([]);
  const [counselorsList, setCounselorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalLeads, setTotalLeads] = useState(0);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [scoreFilter, setScoreFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCounselorId, setSelectedCounselorId] = useState('');
  const [bulkAssignLoading, setBulkAssignLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const pageSize = 10;

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: pageSize, sortBy: sortField, sortDir };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (scoreFilter !== 'ALL') params.score = scoreFilter;
      if (sourceFilter !== 'ALL') params.source = sourceFilter;

      const res = await api.leads.getAll(params);
      if (res && res.success && res.data) {
        setLeadsList(res.data || []);
        setTotalLeads(res.pagination?.total || 0);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, currentPage, statusFilter, scoreFilter, sourceFilter, sortField, sortDir]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch]);

  useEffect(() => {
    if (user && ['ADMIN', 'MANAGER'].includes(user.role)) {
      api.users.getAll().then(res => {
        if (res && res.success && res.data) {
          setCounselorsList(res.data.filter(u => u.role === 'COUNSELOR' || u.role === 'TELECALLER'));
        }
      }).catch(() => {});
    }
  }, [user]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (scoreFilter !== 'ALL') params.score = scoreFilter;
      if (sourceFilter !== 'ALL') params.source = sourceFilter;
      await api.leads.export(params);
      toast.success('CSV downloaded successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to export leads');
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.ceil(totalLeads / pageSize) || 1;

  const toggleSelectAll = () => {
    setSelectedLeads(prev =>
      prev.length === leadsList.length ? [] : leadsList.map(l => l.id)
    );
  };

  const toggleSelect = (id) => {
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setCurrentPage(1);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleBulkAssign = async () => {
    if (!selectedCounselorId || selectedLeads.length === 0) return;
    try {
      setBulkAssignLoading(true);
      await api.leads.bulkAssign(selectedLeads, selectedCounselorId);
      setSelectedLeads([]);
      setShowAssignModal(false);
      fetchLeads();
    } catch (error) {
      toast.error(error.message || 'Failed to assign leads');
    } finally {
      setBulkAssignLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Lead Management" subtitle={`${totalLeads} leads total`}>
        <button className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
          <HiOutlineFilter /> <span className="hidden sm:inline">Filters</span>
        </button>
        <button className="btn btn-secondary" onClick={handleExport} disabled={exporting}>
          <HiOutlineDownload /> <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export CSV'}</span>
        </button>
        <button className="btn btn-primary" onClick={() => navigate('/leads/new')}>
          <HiOutlinePlus /> <span className="hidden sm:inline">Add Lead</span>
        </button>
      </PageHeader>

      {showFilters && (
        <LeadFilters
          search={search} setSearch={setSearch}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          scoreFilter={scoreFilter} setScoreFilter={setScoreFilter}
          sourceFilter={sourceFilter} setSourceFilter={setSourceFilter}
          setCurrentPage={setCurrentPage}
        />
      )}

      <div className="data-table-wrapper">
        {loading ? (
          <div className="p-5">
            <SkeletonTable rows={8} cols={5} />
          </div>
        ) : leadsList.length === 0 ? (
          <EmptyState icon="👥" title="No leads found" text="Try tweaking your search or filters." />
        ) : (
          <LeadTable
            leads={leadsList}
            selectedLeads={selectedLeads}
            toggleSelect={toggleSelect}
            toggleSelectAll={toggleSelectAll}
            sortField={sortField}
            sortDir={sortDir}
            handleSort={handleSort}
            formatDate={formatDate}
          />
        )}

        {!loading && (
          <LeadPagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalLeads={totalLeads}
            pageSize={pageSize}
          />
        )}
      </div>

      {selectedLeads.length > 0 && (
        <div className="bulk-action-bar animate-fade-in-up">
          <span><span className="count">{selectedLeads.length}</span> leads selected</span>
          {['ADMIN', 'MANAGER'].includes(user?.role) && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowAssignModal(true)}>
              Assign Counselor
            </button>
          )}
          <button className="btn btn-ghost btn-sm text-white" onClick={() => setSelectedLeads([])}>
            Cancel
          </button>
        </div>
      )}

      <Modal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign leads"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowAssignModal(false)} disabled={bulkAssignLoading}>Cancel</button>
            <button className="btn btn-primary" onClick={handleBulkAssign} disabled={bulkAssignLoading || !selectedCounselorId}>
              {bulkAssignLoading ? 'Assigning...' : 'Assign'}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-500 mb-5">
          Assign {selectedLeads.length} selected leads to a counselor.
        </p>
        <div className="form-group">
          <label className="form-label">Select Counselor</label>
          <select className="form-select" value={selectedCounselorId} onChange={(e) => setSelectedCounselorId(e.target.value)} required>
            <option value="">Choose counselor...</option>
            {counselorsList.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  );
}
