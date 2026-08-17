import { APP_UNIVERSITY_NAME } from '../constants/app';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const humanize = (str) => (str || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const TEMPLATE_VARIABLES = ['name', 'phone', 'email', 'course', 'intake', 'university', 'fee', 'intakeDate', 'counselor', 'status', 'score', 'source', 'followUp'];

export function buildTemplateContext(lead = {}, university = APP_UNIVERSITY_NAME) {
  const nextFollowUp = (lead.followUps || []).find((fu) => (fu.status || '') !== 'COMPLETED' && !fu.isCompleted);
  const fee = typeof lead.course?.fee === 'number' && lead.course.fee > 0
    ? `₹${lead.course.fee.toLocaleString('en-IN')}`
    : '';
  return {
    name: lead.name || '',
    phone: lead.phone || '',
    email: lead.email || '',
    course: lead.course?.name || '',
    intake: lead.intake?.name || '',
    university: university || APP_UNIVERSITY_NAME,
    fee,
    intakeDate: formatDate(lead.intake?.startDate),
    counselor: lead.counselor?.name || '',
    status: humanize(lead.status),
    score: lead.score || '',
    source: humanize(lead.source),
    followUp: formatDateTime(nextFollowUp?.scheduledAt),
  };
}
