import { useState, useRef } from 'react';
import { api } from '../../services/api';
import { config } from '../../config/env';
import { useToast } from '../../context/ToastContext';
import { HiOutlineUpload, HiOutlineTrash, HiOutlineDownload } from 'react-icons/hi';

const BASE = config.apiUrl.replace(/\/api\/?$/, '');

const STATUS_STEPS = ['INQUIRY', 'APPLIED', 'OFFERED', 'ENROLLED'];
const STATUS_LABELS = { INQUIRY: 'Inquiry', APPLIED: 'Applied', OFFERED: 'Offer', ENROLLED: 'Enrolled' };
const STATUS_STYLES = {
  INQUIRY: 'badge-app-inquiry', APPLIED: 'badge-app-applied', OFFERED: 'badge-app-offered', ENROLLED: 'badge-app-enrolled',
};
const FEE_STATUS_STYLES = { PENDING: 'badge-fee-pending', PARTIAL: 'badge-fee-partial', PAID: 'badge-fee-paid' };
const DOC_TYPES = [
  ['PHOTO_ID', 'Photo ID'],
  ['MARKSHEET_10', 'Class 10 Marksheet'],
  ['MARKSHEET_12', 'Class 12 Marksheet'],
  ['DEGREE_CERTIFICATE', 'Degree Certificate'],
  ['TRANSFER_CERTIFICATE', 'Transfer Certificate'],
  ['ID_PROOF', 'ID Proof'],
  ['RESUME', 'Resume'],
  ['OTHER', 'Other'],
];
const PAYMENT_METHODS = ['UPI', 'CASH', 'BANK_TRANSFER', 'CARD', 'CHEQUE', 'DEMAND_DRAFT', 'OTHER'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILE_SIZE_MB = 10;

const fmtCurrency = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

export default function ApplicationDetail({ application: initial, courses = [], intakes = [], onRefresh }) {
  const { toast } = useToast();
  const [application, setApplication] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState('MARKSHEET_12');
  const fileRef = useRef(null);
  const [payForm, setPayForm] = useState({ amount: '', method: 'UPI', reference: '' });
  const [paying, setPaying] = useState(false);
  const [confirmDocId, setConfirmDocId] = useState(null);
  const [confirmPayId, setConfirmPayId] = useState(null);

  const setApp = (app) => {
    setApplication(app);
    onRefresh?.(app);
  };

  const changeStatus = async (status) => {
    if (status === application.status || saving) return;
    try {
      setSaving(true);
      const res = await api.applications.update(application.id, { status });
      if (res?.success) {
        setApp(res.data.application);
        toast.success(`Status updated to ${STATUS_LABELS[status]}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const changeCourse = async (courseId) => {
    if (courseId === application.courseId || saving) return;
    try {
      setSaving(true);
      const res = await api.applications.update(application.id, { courseId: courseId || null });
      if (res?.success) { setApp(res.data.application); toast.success('Course updated'); }
    } catch (err) {
      toast.error(err.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  const changeIntake = async (intakeId) => {
    if (intakeId === application.intakeId || saving) return;
    try {
      setSaving(true);
      const res = await api.applications.update(application.id, { intakeId: intakeId || null });
      if (res?.success) { setApp(res.data.application); toast.success('Intake updated'); }
    } catch (err) {
      toast.error(err.message || 'Failed to update intake');
    } finally {
      setSaving(false);
    }
  };

  const saveFeeTotal = async (value) => {
    const feeTotal = value === '' ? 0 : parseFloat(value);
    if (Number.isNaN(feeTotal) || feeTotal < 0) return;
    try {
      setSaving(true);
      const res = await api.applications.update(application.id, { feeTotal });
      if (res?.success) { setApp(res.data.application); toast.success('Total fee updated'); }
    } catch (err) {
      toast.error(err.message || 'Failed to update total fee');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`);
      e.target.value = '';
      return;
    }
    try {
      setUploading(true);
      const res = await api.applications.uploadDocument(application.id, file, { type: uploadType });
      if (res?.success) {
        toast.success('Document uploaded');
        setApp({
          ...application,
          documents: [res.data.document, ...(application.documents || [])],
        });
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const deleteDoc = async (doc) => {
    try {
      await api.applications.deleteDocument(application.id, doc.id);
      setConfirmDocId(null);
      toast.success('Document deleted');
      setApp({
        ...application,
        documents: (application.documents || []).filter((d) => d.id !== doc.id),
      });
    } catch (err) {
      toast.error(err.message || 'Failed to delete document');
    }
  };

  const addPayment = async (e) => {
    e.preventDefault();
    const amount = parseFloat(payForm.amount);
    if (!amount || amount <= 0) return;
    if (amount > pendingAmount + 0.001) {
      toast.error(`Amount cannot exceed the pending fee of ${fmtCurrency(pendingAmount)}`);
      return;
    }
    try {
      setPaying(true);
      const res = await api.applications.addPayment(application.id, {
        amount,
        method: payForm.method,
        reference: payForm.reference || null,
      });
      if (res?.success) {
        toast.success('Payment recorded');
        setPayForm({ amount: '', method: 'UPI', reference: '' });
        setApp({
          ...application,
          feePaid: res.data.application.feePaid,
          feeStatus: res.data.application.feeStatus,
          payments: [res.data.payment, ...(application.payments || [])],
        });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to record payment');
    } finally {
      setPaying(false);
    }
  };

  const deletePayment = async (payment) => {
    try {
      const res = await api.applications.deletePayment(application.id, payment.id);
      setConfirmPayId(null);
      if (res?.success) {
        toast.success('Payment removed');
        setApp({
          ...application,
          feePaid: Math.max(0, (application.feePaid || 0) - payment.amount),
          feeStatus: res.data?.application?.feeStatus || application.feeStatus,
          payments: (application.payments || []).filter((p) => p.id !== payment.id),
        });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove payment');
    }
  };

  const feePercent = application.feeTotal > 0
    ? Math.min(100, Math.round(((application.feePaid || 0) / application.feeTotal) * 100))
    : 0;
  const pendingAmount = Math.max(0, (application.feeTotal || 0) - (application.feePaid || 0));
  const isFullyPaid = (application.feeTotal || 0) > 0 && pendingAmount <= 0.001;
  const payExceedsPending = pendingAmount <= 0
    || (parseFloat(payForm.amount) > 0 && parseFloat(payForm.amount) > pendingAmount + 0.001);

  const documents = application.documents || [];
  const payments = application.payments || [];
  const stepIndex = STATUS_STEPS.indexOf(application.status);

  return (
    <div className="flex flex-col gap-6">
      {/* Application identity */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-bold text-gray-900">{application.applicationNumber}</div>
          <div className="text-sm text-gray-500">
            {application.lead?.name} · {fmtDate(application.createdAt)}
          </div>
        </div>
        <span className={`badge ${STATUS_STYLES[application.status] || 'badge-secondary'}`}>
          {STATUS_LABELS[application.status] || application.status}
        </span>
      </div>

      {/* Status pipeline */}
      <div>
        <div className="form-label">Application Pipeline</div>
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {STATUS_STEPS.map((step, i) => {
            const active = i <= stepIndex;
            const current = i === stepIndex;
            return (
              <div key={step} className="flex items-center gap-2">
                <button
                  type="button"
                  className={`btn btn-sm ${current ? 'btn-primary' : active ? 'btn-ghost text-indigo-600' : 'btn-ghost'}`}
                  onClick={() => changeStatus(step)}
                  disabled={saving}
                  title={`Move to ${STATUS_LABELS[step]}`}
                >
                  {STATUS_LABELS[step]}
                </button>
                {i < STATUS_STEPS.length - 1 && <div className="h-px w-6 bg-gray-300" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Course / intake / fee total */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="form-group">
          <label className="form-label">Course</label>
          <select
            className="form-select"
            value={application.courseId || ''}
            onChange={(e) => changeCourse(e.target.value)}
            disabled={saving}
          >
            <option value="">— Select course —</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Intake</label>
          <select
            className="form-select"
            value={application.intakeId || ''}
            onChange={(e) => changeIntake(e.target.value)}
            disabled={saving}
          >
            <option value="">— Select intake —</option>
            {intakes.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Total Fee (₹)</label>
          <input
            key={application.feeTotal}
            className="form-input"
            type="number"
            min="0"
            defaultValue={application.feeTotal || 0}
            onBlur={(e) => saveFeeTotal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
            disabled={saving}
          />
        </div>
      </div>

      {/* Fee status */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Fee Status</span>
          <span className={`badge ${FEE_STATUS_STYLES[application.feeStatus] || 'badge-secondary'}`}>
            {application.feeStatus}
          </span>
        </div>
        <div className="mb-1 flex items-center justify-between text-sm text-gray-600">
          <span>{fmtCurrency(application.feePaid || 0)} paid</span>
          <span>of {fmtCurrency(application.feeTotal || 0)}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{ width: `${feePercent}%` }}
          />
        </div>
      </div>

      {/* Documents */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="form-label mb-0">Documents ({documents.length})</div>
          <div className="flex items-center gap-2">
            <select className="form-select" style={{ paddingTop: '4px', paddingBottom: '4px', fontSize: '0.8125rem' }} value={uploadType} onChange={(e) => setUploadType(e.target.value)}>
              {DOC_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
            <button className="btn btn-primary btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading} title={`Max file size: ${MAX_FILE_SIZE_MB}MB`}>
              <HiOutlineUpload /> {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
        <p className="mb-3 text-xs text-gray-400">Max file size: {MAX_FILE_SIZE_MB}MB per document.</p>
        {documents.length === 0 ? (
          <div className="text-sm text-gray-500">No documents uploaded yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-gray-800">{doc.originalName}</div>
                  <div className="text-xs text-gray-500">
                    {DOC_TYPES.find(([v]) => v === doc.type)?.[1] || doc.type} · {fmtDate(doc.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    className="btn btn-ghost btn-sm"
                    href={`${BASE}${doc.url}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Download document"
                  >
                    <HiOutlineDownload />
                  </a>
                  {confirmDocId === doc.id ? (
                    <>
                      <button className="btn btn-sm text-red-600" onClick={() => deleteDoc(doc)}>Confirm</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDocId(null)}>Cancel</button>
                    </>
                  ) : (
                    <button className="btn btn-ghost btn-sm text-red-600" aria-label="Delete document" onClick={() => setConfirmDocId(doc.id)}>
                      <HiOutlineTrash />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Payments */}
      <div>
        <div className="form-label mb-3">Fee Payments ({payments.length})</div>
        {isFullyPaid ? (
          <div className="mb-3 flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            All payments received
          </div>
        ) : payments.length > 0 ? (
          <div className="mb-3 text-xs text-gray-500">Pending: {fmtCurrency(pendingAmount)}</div>
        ) : null}
        {!isFullyPaid && (
          <form onSubmit={addPayment} className="mb-3 grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:grid-cols-4">
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input
              className={`form-input ${payExceedsPending ? 'border-red-400' : ''}`}
              type="number"
              min="0"
              max={pendingAmount > 0 ? pendingAmount : undefined}
              placeholder="e.g. 25000"
              value={payForm.amount}
              onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
              required
            />
            {payExceedsPending && (
              <p className="mt-1 text-xs text-red-600">Cannot exceed pending amount of {fmtCurrency(pendingAmount)}</p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Method</label>
            <select className="form-select" value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Reference (optional)</label>
            <input
              className="form-input"
              value={payForm.reference}
              onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })}
              placeholder="Txn ID / receipt no."
            />
          </div>
          <div>
            <label className="form-label">&nbsp;</label>
            <button className="btn btn-primary w-full" type="submit" disabled={paying || !payForm.amount || payExceedsPending} style={{ height: '45px' }}>
              {paying ? 'Recording...' : 'Add Payment'}
            </button>
          </div>
          </form>
        )}
        {payments.length === 0 ? (
          <div className="text-sm text-gray-500">No payments recorded yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {payments.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <div>
                  <div className="text-sm font-medium text-gray-800">{fmtCurrency(payment.amount)}</div>
                  <div className="text-xs text-gray-500">
                    {payment.method.replace(/_/g, ' ')} · {fmtDate(payment.paidAt)}
                    {payment.reference ? ` · ${payment.reference}` : ''}
                  </div>
                </div>
                {confirmPayId === payment.id ? (
                  <div className="flex items-center gap-1">
                    <button className="btn btn-sm text-red-600" onClick={() => deletePayment(payment)}>Confirm</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setConfirmPayId(null)}>Cancel</button>
                  </div>
                ) : (
                  <button className="btn btn-ghost btn-sm text-red-600" aria-label="Delete payment" onClick={() => setConfirmPayId(payment.id)}>
                    <HiOutlineTrash />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
