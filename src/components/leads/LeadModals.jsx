import { HiOutlineX } from 'react-icons/hi';
import { renderTemplate } from '../../utils/renderTemplate';

export default function LeadModals({
  showFollowUpModal, setShowFollowUpModal,
  showCompleteFUModal, setShowCompleteFUModal,
  showConvertModal, setShowConvertModal,
  showFailModal, setShowFailModal,
  fuType, setFuType, fuScheduledAt, setFuScheduledAt, fuNotes, setFuNotes,
  handleScheduleFollowUp,
  fuOutcome, setFuOutcome, fuCompleteNotes, setFuCompleteNotes,
  handleCompleteFollowUp,
  convertCourseId, setConvertCourseId, convertIntakeId, setConvertIntakeId,
  courses, intakes, handleConvertLead,
  failureReason, setFailureReason, handleFailLead,
  templates, templateContext,
  submitting
}) {
  return (
    <>
      {/* Schedule Follow-up Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000]" onClick={() => setShowFollowUpModal(false)}>
          <div className="modal bg-white dark:bg-[#1f2530] p-6 rounded-2xl w-[90%] max-w-[500px]" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex justify-between mb-4">
              <h3 className="modal-title text-xl font-bold">Schedule Follow-up</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowFollowUpModal(false)}>
                <HiOutlineX />
              </button>
            </div>
            <form onSubmit={handleScheduleFollowUp}>
              <div className="modal-body flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={fuType} onChange={(e) => setFuType(e.target.value)}>
                    <option value="CALL">Call</option>
                    <option value="EMAIL">Email</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="SMS">SMS</option>
                    <option value="IN_PERSON">In Person</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Scheduled Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={fuScheduledAt}
                    onChange={(e) => setFuScheduledAt(e.target.value)}
                    required
                  />
                </div>
                {(templates || []).filter(t => t.isActive).length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Use Template</label>
                    <select
                      className="form-select"
                      defaultValue=""
                      onChange={(e) => {
                        const t = (templates || []).find(x => x.id === e.target.value);
                        if (t) setFuNotes(renderTemplate(t.body, templateContext || {}));
                      }}
                    >
                      <option value="">Select a template...</option>
                      {templates.filter(t => t.isActive).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Add notes for this follow-up..."
                    value={fuNotes}
                    onChange={(e) => setFuNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer flex justify-end gap-3 mt-5">
                <button type="button" className="btn btn-secondary" onClick={() => setShowFollowUpModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Scheduling...' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Follow-up Modal */}
      {showCompleteFUModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000]" onClick={() => setShowCompleteFUModal(false)}>
          <div className="modal bg-white dark:bg-[#1f2530] p-6 rounded-2xl w-[90%] max-w-[500px]" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex justify-between mb-4">
              <h3 className="modal-title text-xl font-bold">Log Follow-up Outcome</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowCompleteFUModal(false)}>
                <HiOutlineX />
              </button>
            </div>
            <form onSubmit={handleCompleteFollowUp}>
              <div className="modal-body flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Outcome</label>
                  <select className="form-select" value={fuOutcome} onChange={(e) => setFuOutcome(e.target.value)}>
                    <option value="CONNECTED">Connected</option>
                    <option value="NOT_REACHABLE">Not Reachable</option>
                    <option value="CALL_BACK">Call Back</option>
                    <option value="INTERESTED">Interested</option>
                    <option value="NOT_INTERESTED">Not Interested</option>
                    <option value="WRONG_NUMBER">Wrong Number</option>
                    <option value="CONVERTED">Converted</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Outcome Notes</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Enter what was discussed (optional)"
                    value={fuCompleteNotes}
                    onChange={(e) => setFuCompleteNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer flex justify-end gap-3 mt-5">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCompleteFUModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Log Outcome'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Lead Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000]" onClick={() => setShowConvertModal(false)}>
          <div className="modal bg-white dark:bg-[#1f2530] p-6 rounded-2xl w-[90%] max-w-[500px]" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex justify-between mb-4">
              <h3 className="modal-title text-xl font-bold">Convert Lead to Admission</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowConvertModal(false)}>
                <HiOutlineX />
              </button>
            </div>
            <form onSubmit={handleConvertLead}>
              <div className="modal-body flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Admitted Course</label>
                  <select
                    className="form-select"
                    value={convertCourseId}
                    onChange={(e) => setConvertCourseId(e.target.value)}
                    required
                  >
                    <option value="">Select course...</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Academic Intake</label>
                  <select
                    className="form-select"
                    value={convertIntakeId}
                    onChange={(e) => setConvertIntakeId(e.target.value)}
                    required
                  >
                    <option value="">Select intake...</option>
                    {intakes.map(i => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer flex justify-end gap-3 mt-5">
                <button type="button" className="btn btn-secondary" onClick={() => setShowConvertModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={submitting}>
                  {submitting ? 'Converting...' : 'Confirm Conversion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fail Lead Modal */}
      {showFailModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000]" onClick={() => setShowFailModal(false)}>
          <div className="modal bg-white dark:bg-[#1f2530] p-6 rounded-2xl w-[90%] max-w-[500px]" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex justify-between mb-4">
              <h3 className="modal-title text-xl font-bold text-red-600">Mark Lead as Failed</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowFailModal(false)}>
                <HiOutlineX />
              </button>
            </div>
            <form onSubmit={handleFailLead}>
              <div className="modal-body flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Failure Reason</label>
                  <select
                    className="form-select"
                    value={failureReason}
                    onChange={(e) => setFailureReason(e.target.value)}
                    required
                  >
                    <option value="">Select reason...</option>
                    <option value="Fee too high">Fee too high</option>
                    <option value="Chose competitor">Chose competitor</option>
                    <option value="Not reachable">Not reachable</option>
                    <option value="Lost interest">Lost interest</option>
                    <option value="Location issue">Location issue</option>
                    <option value="Financial constraints">Financial constraints</option>
                    <option value="Postponed admission">Postponed admission</option>
                    <option value="Joined another course">Joined another course</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer flex justify-end gap-3 mt-5">
                <button type="button" className="btn btn-secondary" onClick={() => setShowFailModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
