import { useState, useEffect, useMemo, useRef } from 'react';
import {
  HiExclamationCircle,
  HiOutlineArrowRight,
  HiOutlineArrowSmLeft,
  HiOutlineBeaker,
  HiOutlineBookOpen,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineChat,
  HiOutlineCheck,
  HiOutlineChevronDown,
  HiOutlineClock,
  HiOutlineCog,
  HiOutlineCurrencyDollar,
  HiOutlineDocument,
  HiOutlineDocumentText,
  HiOutlineDownload,
  HiOutlineDuplicate,
  HiOutlineExclamation,
  HiOutlineGlobeAlt,
  HiOutlineInformationCircle,
  HiOutlineLink,
  HiOutlineLockClosed,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineSearch,
  HiOutlineShieldCheck,
  HiOutlineUpload,
  HiOutlineUser,
  HiOutlineUserGroup,
  HiOutlineX,
} from 'react-icons/hi';
import { config } from '../config/env';
import { APP_NAME, APP_INITIAL, APP_UNIVERSITY_NAME, APP_DESCRIPTION } from '../constants/app';
import ChatBot from '../components/apply/ChatBot';
import { api } from '../services/api';
import { useSeo } from '../utils/seo';

const API_BASE = config.apiUrl.replace(/\/api\/?$/, '');

const SOURCE_OPTIONS = [
  { value: 'WEBSITE', label: 'Website' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'GOOGLE_ADS', label: 'Google Ads' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'JUSTDIAL', label: 'JustDial' },
  { value: 'WALK_IN', label: 'Walk-in' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'PHONE_INQUIRY', label: 'Phone Inquiry' },
  { value: 'EMAIL_INQUIRY', label: 'Email Inquiry' },
  { value: 'EVENT', label: 'Event / Seminar' },
  { value: 'OTHER', label: 'Other' },
];

const DEPT_COLORS = {
  Engineering: {
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    border: 'border-blue-500/25',
    ring: 'ring-blue-500/30',
  },
  Management: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/25',
    ring: 'ring-amber-500/30',
  },
  Science: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/25',
    ring: 'ring-emerald-500/30',
  },
  Commerce: {
    bg: 'bg-purple-500/15',
    text: 'text-purple-400',
    border: 'border-purple-500/25',
    ring: 'ring-purple-500/30',
  },
};

const DEPT_ICONS = {
  Engineering: <HiOutlineCog className="h-4 w-4" />,
  Management: <HiOutlineChartBar className="h-4 w-4" />,
  Science: <HiOutlineBeaker className="h-4 w-4" />,
  Commerce: <HiOutlineCurrencyDollar className="h-4 w-4" />,
};

const CSS = `
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
  @keyframes slideIn { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
  @keyframes slideLeft { from { opacity:0; transform:translateX(-30px); } to { opacity:1; transform:translateX(0); } }
  @keyframes checkPop { 0% { transform:scale(0); } 60% { transform:scale(1.15); } 100% { transform:scale(1); } }
  @keyframes pulse { 0%,100% { box-shadow:0 0 0 0 rgba(99,102,241,0.4); } 50% { box-shadow:0 0 0 12px rgba(99,102,241,0); } }
  @keyframes glow { 0%,100% { opacity:0.4; } 50% { opacity:0.8; } }
  @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
  .apply-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
  .apply-card:hover { transform:translateY(-4px); }
  .apply-card.selected { transform:translateY(-6px) scale(1.02); }
`;

const formatFee = (n) => {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
};
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILE_SIZE_MB = 10;

const GRADIENT_BTN = [
  'rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600',
  'text-sm font-bold text-white shadow-lg shadow-indigo-500/25',
  'transition-all hover:shadow-xl hover:shadow-indigo-500/30',
].join(' ');
const GRADIENT_BTN_DISABLED = `${GRADIENT_BTN} disabled:cursor-not-allowed disabled:opacity-50`;
const CARD_PANEL = [
  'rounded-2xl border border-white/[0.08] bg-white/[0.03]',
  'p-6 backdrop-blur-sm sm:p-7',
].join(' ');
const STATUS_BADGE = [
  'rounded-full px-2.5 py-1',
  'text-[0.65rem] font-bold uppercase tracking-wide',
].join(' ');
const ICON_PILL = [
  'inline-flex items-center gap-2 rounded-full border px-4 py-1.5',
  'text-xs font-semibold uppercase tracking-widest',
].join(' ');
const cx = (...parts) => parts.filter(Boolean).join(' ');

/* ─── Step indicator ─── */
function StepBar({ step, onStepClick }) {
  const steps = ['Select Course', 'Your Details', 'Confirmation'];
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {steps.map((label, i) => {
        const active = i === step;
        const done = i < step;
        const clickable = done;
        return (
          <div key={label} className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <div
                onClick={clickable ? () => onStepClick(i) : undefined}
                className={cx(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                  done
                    ? 'bg-indigo-500 text-white cursor-pointer hover:bg-indigo-400'
                    : active
                      ? 'bg-white text-[#0a0a1a] ring-2 ring-indigo-400'
                      : 'bg-white/10 text-white/40',
                )}
              >
                {done ? (
                  <HiOutlineCheck className="h-3.5 w-3.5" strokeWidth={3} />
                ) : i + 1}
              </div>
              <span
                onClick={clickable ? () => onStepClick(i) : undefined}
                className={`hidden text-xs font-semibold sm:inline ${
                  clickable
                    ? 'text-indigo-300 cursor-pointer hover:text-white'
                    : active
                      ? 'text-white'
                      : 'text-white/30'
                }`}
              >
                {label}
              </span>
            </div>
            {i < 2 && (
              <div
                className={`h-px w-6 sm:w-10 transition-colors duration-300 ${
                  done ? 'bg-indigo-500' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Course Step ─── */
function CourseStep({ courses, selectedId, onSelect, initialDept }) {
  const [deptFilter, setDeptFilter] = useState(initialDept || 'All');
  useEffect(() => {
    if (initialDept) setDeptFilter(initialDept);
  }, [initialDept]);
  const departments = useMemo(() => ['All', ...new Set(courses.map(c => c.department))], [courses]);
  const filtered = useMemo(
    () => deptFilter === 'All' ? courses : courses.filter(c => c.department === deptFilter),
    [courses, deptFilter],
  );

  return (
    <div style={{ animation: 'fadeUp 0.5s ease both' }}>
      {/* Section title */}
      <div className="mb-8 text-center">
        <div className={cx(ICON_PILL, 'mb-3 border-indigo-500/20 bg-indigo-500/10 text-indigo-400')}>
          <HiOutlineBookOpen className="h-3.5 w-3.5" />
          Explore Programmes
        </div>
        <h2 className="mb-2 text-3xl font-extrabold text-white lg:text-4xl">
          Choose Your{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Dream Course
          </span>
        </h2>
        <p className="text-sm text-white/40">Select a programme to get started, or skip to fill your details first</p>
      </div>

      {/* Department filters */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
        {departments.map(d => {
          const active = deptFilter === d;
          const dc = DEPT_COLORS[d] || {};
          return (
            <button
              key={d}
              onClick={() => setDeptFilter(d)}
              className={cx(
                [
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5',
                  'text-xs font-semibold transition-all duration-200',
                ].join(' '),
                active
                  ? `${dc.bg || 'bg-white/15'} ${dc.text || 'text-white'} ${dc.border || 'border-white/25'}`
                  : 'border-white/[0.06] bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/60',
              )}
            >
              {d !== 'All' && DEPT_ICONS[d]}
              {d}
            </button>
          );
        })}
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course, i) => {
          const sel = selectedId === course.id;
          const dc = DEPT_COLORS[course.department] || {};
          return (
            <button
              key={course.id}
              onClick={() => onSelect(sel ? '' : course.id)}
              className={cx(
                'apply-card group relative overflow-hidden rounded-2xl border text-left transition-all duration-300',
                sel
                  ? `selected border-indigo-500/60 bg-indigo-500/10 ring-2 ${dc.ring || 'ring-indigo-500/30'} shadow-xl`
                  : 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.15] hover:bg-white/[0.06]',
              )}
              style={{ animation: `fadeUp 0.4s ease ${i * 0.04}s both` }}
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className={cx(
                      'flex h-full w-full items-center justify-center bg-gradient-to-br',
                      'from-white/[0.06] to-transparent',
                    )}
                  >
                    <HiOutlineBookOpen className="h-14 w-14 text-white/[0.06]" strokeWidth={1} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-transparent to-transparent" />
                {/* Fee badge */}
                <div
                  className={cx(
                    'absolute right-3 top-3 rounded-lg bg-black/50 px-2.5 py-1 text-xs font-bold',
                    'text-white backdrop-blur-sm',
                  )}
                >
                  ₹{formatFee(course.fee)}
                </div>
                {/* Selection indicator */}
                {sel && (
                  <div
                    className={cx(
                      'absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500',
                      'shadow-lg shadow-indigo-500/40',
                    )}
                    style={{ animation: 'checkPop 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
                  >
                    <HiOutlineCheck className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div
                  className={cx(
                    [
                      'mb-2 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5',
                      'text-[0.65rem] font-bold uppercase tracking-wider',
                    ].join(' '),
                    dc.bg || '',
                    dc.text || '',
                    dc.border || '',
                  )}
                >
                  {DEPT_ICONS[course.department]}
                  {course.department}
                </div>
                <h3 className="mb-2 text-sm font-bold leading-tight text-white">{course.name}</h3>
                <div className="flex items-center gap-3 text-[0.7rem] text-white/35">
                  <span className="flex items-center gap-1">
                    <HiOutlineClock className="h-3 w-3" />
                    {course.duration}
                  </span>
                  {course.seats && (
                    <span className="flex items-center gap-1">
                      <HiOutlineUserGroup className="h-3 w-3" />
                      {course.seats} seats
                    </span>
                  )}
                </div>
                <div
                  className={cx(
                    'mt-3 border-t pt-3 text-xs font-semibold',
                    sel ? 'border-indigo-500/20 text-indigo-400' : 'border-white/[0.05] text-white/25',
                  )}
                >
                  {sel ? '✓ Selected' : '₹' + course.fee.toLocaleString()}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-white/25">
        You can also{' '}
        <button onClick={() => onSelect('')} className="underline transition-colors hover:text-indigo-400">
          skip and fill your details first
        </button>
      </p>
    </div>
  );
}

/* ─── Details Step ─── */
function DetailsStep({ form, errors, inputClass, onChange, onFocus, onBlur, selectedCourse, onClearCourse, intakes }) {
  const charCount = (cur, max) => (
    <span className={`mt-1 block text-right text-[0.65rem] ${cur > max * 0.9 ? 'text-amber-400' : 'text-white/15'}`}>
      {cur}/{max}
    </span>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]" style={{ animation: 'slideIn 0.4s ease both' }}>
      {/* Form */}
      <div className="space-y-4">
        {/* Name */}
        <Field label="Full Name" required error={errors.name} icon="user">
          <input
            id="a-name"
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            onFocus={() => onFocus('name')}
            onBlur={() => onBlur('name')}
            placeholder="John Doe"
            className={`${inputClass('name')} pl-11`}
            maxLength={100}
            autoComplete="name"
            inputMode="text"
            required
          />
        </Field>

        {/* Phone + Email */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Phone" required error={errors.phone} icon="phone">
            <input
              id="a-phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={onChange}
              onFocus={() => onFocus('phone')}
              onBlur={() => onBlur('phone')}
              placeholder="98765 43210"
              className={`${inputClass('phone')} pl-11`}
              maxLength={10}
              autoComplete="tel"
              inputMode="numeric"
              pattern="[6-9][0-9]{9}"
              required
            />
          </Field>
          <Field label="Email" optional error={errors.email} icon="email">
            <input
              id="a-email"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              onFocus={() => onFocus('email')}
              onBlur={() => onBlur('email')}
              placeholder="you@example.com"
              className={`${inputClass('email')} pl-11`}
              maxLength={100}
              autoComplete="email"
              inputMode="email"
            />
          </Field>
        </div>

        {/* Source */}
        <Field label="How did you hear about us?" required error={errors.source} icon="globe">
          <select
            name="source"
            value={form.source}
            onChange={onChange}
            onFocus={() => onFocus('source')}
            onBlur={() => onBlur('source')}
            className={`${inputClass('source')} pl-11 pr-10 appearance-none`}
            required
          >
            <option value="" className="bg-[#0a0a1a]">Select a source...</option>
            {SOURCE_OPTIONS.map(s => (
              <option key={s.value} value={s.value} className="bg-[#0a0a1a]">{s.label}</option>
            ))}
          </select>
          <Chevron />
        </Field>

        {/* Other source */}
        {form.source === 'OTHER' && (
          <div style={{ animation: 'fadeUp 0.25s ease' }}>
            <Field label="Please Specify" required error={errors.otherSource} icon="info">
              <input
                id="a-other"
                type="text"
                name="otherSource"
                value={form.otherSource}
                onChange={onChange}
                onFocus={() => onFocus('otherSource')}
                onBlur={() => onBlur('otherSource')}
                placeholder="e.g. YouTube, WhatsApp..."
                className={`${inputClass('otherSource')} pl-11`}
                maxLength={50}
                inputMode="text"
              />
            </Field>
          </div>
        )}

        {/* Intake */}
        {intakes.length > 0 && (
          <Field label="Preferred Intake" optional error={errors.intakeId} icon="calendar">
            <select
              name="intakeId"
              value={form.intakeId}
              onChange={onChange}
              onFocus={() => onFocus('intakeId')}
              onBlur={() => onBlur('intakeId')}
              className={`${inputClass('intakeId')} pl-11 pr-10 appearance-none`}
            >
              <option value="" className="bg-[#0a0a1a]">Select an intake...</option>
              {intakes.map(intake => {
                const start = new Date(intake.startDate).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: 'numeric',
                });
                return (
                  <option key={intake.id} value={intake.id} className="bg-[#0a0a1a]">
                    {intake.name} ({start})
                  </option>
                );
              })}
            </select>
            <Chevron />
          </Field>
        )}

        {/* Message */}
        <Field label="Message" optional error={errors.notes}>
          <textarea
            id="a-notes"
            name="notes"
            value={form.notes}
            rows={3}
            onChange={onChange}
            onFocus={() => onFocus('notes')}
            onBlur={() => onBlur('notes')}
            placeholder="Any specific questions or requirements..."
            className={`${inputClass('notes')} resize-none`}
            maxLength={500}
          />
          {charCount(form.notes.length, 500)}
        </Field>
      </div>

      {/* Sidebar — selected course + trust */}
      <div className="space-y-4">
        {/* Selected course card */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/30">Selected Programme</div>
          {selectedCourse ? (
            <div className="flex items-start gap-3">
              {selectedCourse.image ? (
                <img src={selectedCourse.image} alt="" className="h-14 w-14 flex-shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                  <HiOutlineBookOpen className="h-6 w-6 text-white/10" strokeWidth={1.5} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-white">{selectedCourse.name}</div>
                <div className="mt-0.5 text-xs text-white/35">
                  {selectedCourse.department} &middot; {selectedCourse.duration}
                </div>
                <div className="mt-1 text-sm font-bold text-indigo-400">₹{selectedCourse.fee.toLocaleString()}</div>
              </div>
              <button
                type="button"
                onClick={onClearCourse}
                className="rounded-lg p-1 text-white/30 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Remove course"
              >
                <HiOutlineX className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <p className="text-xs text-white/20">No course selected — you can choose later</p>
          )}
        </div>

        {/* Trust signals */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/30">Why {APP_NAME}?</div>
          <div className="space-y-3">
            {[
              { icon: <HiOutlineShieldCheck className="h-4 w-4" />, text: '100% Confidential' },
              { icon: <HiOutlineClock className="h-4 w-4" />, text: 'Reply within 24 hours' },
              { icon: <HiOutlinePhone className="h-4 w-4" />, text: 'Free Counselling' },
              { icon: <HiOutlineLockClosed className="h-4 w-4" />, text: 'Data never shared' },
            ].map(s => (
              <div key={s.text} className="flex items-center gap-2.5 text-xs text-white/40">
                <span
                  className={cx(
                    'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg',
                    'bg-indigo-500/10 text-indigo-400',
                  )}
                >
                  {s.icon}
                </span>
                {s.text}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { val: '500+', label: 'Students' },
            { val: '95%', label: 'Placed' },
            { val: '50+', label: 'Faculty' },
            { val: '10+', label: 'Years' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center">
              <div className="text-lg font-extrabold text-white">{s.val}</div>
              <div className="text-[0.65rem] text-white/30">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Success Step ─── */
function SuccessStep({ isDuplicate, message, application, phone, onTrack, onReset }) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopy = async () => {
    if (!application?.applicationNumber) return;
    try {
      await navigator.clipboard.writeText(application.applicationNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const handleCopyLink = async () => {
    if (!trackLink) return;
    try {
      await navigator.clipboard.writeText(trackLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const phoneDigits = String(phone || '')
    .replace(/\D/g, '')
    .replace(/^0/, '');
  const trackLink = application?.applicationNumber && phoneDigits
    ? `${window.location.origin}${window.location.pathname}?track=${encodeURIComponent(application.applicationNumber)}&phone=${phoneDigits}`
    : '';

  const shareLink = (() => {
    if (!phoneDigits || !application?.applicationNumber) return '';
    const intl = phoneDigits.length === 10 ? `91${phoneDigits}` : phoneDigits;
    const text = trackLink
      ? `My application number is ${application.applicationNumber}. Track your application status here: ${trackLink}`
      : `My application number is ${application.applicationNumber}. I'll use it to track my application status.`;
    return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
  })();

  return (
    <div className="mx-auto max-w-lg text-center" style={{ animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-10 backdrop-blur-xl">
        {/* Animated check */}
        <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600"
            style={{ animation: 'pulse 2s ease-in-out infinite' }}
          />
          <svg
            className="relative h-12 w-12 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" style={{ animation: 'checkPop 0.5s ease 0.3s both', transformOrigin: 'center' }} />
          </svg>
        </div>

        <div className={cx(ICON_PILL, 'mb-3 border-emerald-500/20 bg-emerald-500/10 text-emerald-400')}>
          {isDuplicate ? 'Already Registered' : 'Inquiry Received'}
        </div>

        <h2 className="mb-3 text-3xl font-extrabold text-white">
          {isDuplicate ? 'Welcome Back!' : "You're All Set!"}
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-white/40">{message}</p>

        {application?.applicationNumber && (
          <div
            className="mb-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-6 py-4"
            style={{ animation: 'fadeUp 0.4s ease 0.2s both' }}
          >
            <div className="text-[0.65rem] font-semibold uppercase tracking-widest text-indigo-300/70">
              Your Application Number
            </div>
            <div className="mt-1 flex items-center justify-center gap-3">
              <div className="text-xl font-extrabold tracking-wide text-white select-all">
                {application.applicationNumber}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className={cx(
                  'inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1',
                  'text-[0.65rem] font-semibold text-indigo-300 transition hover:bg-white/[0.12]',
                )}
              >
                {copied ? (
                  <>
                    <HiOutlineCheck className="h-3 w-3" strokeWidth={2.5} />
                    Copied!
                  </>
                ) : (
                  <>
                    <HiOutlineDuplicate className="h-3 w-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="mt-0.5 text-[0.7rem] text-white/30">
              Keep this safe — you'll need it to track your application
            </div>
            {shareLink && (
              <a
                href={shareLink}
                target="_blank"
                rel="noreferrer"
                className={cx(
                  'mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-2',
                  [
                    'text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30',
                    'transition hover:bg-emerald-500/25',
                  ].join(' '),
                )}
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                Save on WhatsApp
              </a>
            )}
            {trackLink && (
              <button
                type="button"
                onClick={handleCopyLink}
                className={cx(
                  'mt-3 inline-flex items-center gap-2 rounded-xl bg-indigo-500/15 px-4 py-2',
                  'text-xs font-semibold text-indigo-300 ring-1 ring-indigo-500/30',
                  'transition hover:bg-indigo-500/25',
                )}
              >
                {copiedLink ? (
                  <HiOutlineCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
                ) : (
                  <HiOutlineLink className="h-3.5 w-3.5" />
                )}
                {copiedLink ? 'Link Copied!' : 'Copy Tracking Link'}
              </button>
            )}
          </div>
        )}

        {/* Next steps */}
        <div className="mb-8 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
              <HiOutlinePhone className="h-4 w-4" />
            </div>
            <div className="text-sm font-bold text-white">Next Step</div>
            <div className="mt-0.5 text-xs text-white/30">Our counsellor will call you within 24 hours</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400">
              <HiOutlineMail className="h-4 w-4" />
            </div>
            <div className="text-sm font-bold text-white">Check Email</div>
            <div className="mt-0.5 text-xs text-white/30">Confirmation details sent to your inbox</div>
          </div>
        </div>

        <button
          onClick={onTrack}
          className={`mb-3 w-full py-3.5 ${GRADIENT_BTN}`}
        >
          Track My Application
        </button>

        <button
          onClick={onReset}
          className={cx(
            'w-full rounded-xl border border-white/[0.1] bg-white/[0.06] py-3.5',
            'text-sm font-semibold text-white transition-all hover:bg-white/[0.1]',
          )}
        >
          Submit Another Inquiry
        </button>
      </div>
    </div>
  );
}

/* ─── Reusable building blocks ─── */
const ICONS = {
  user: <HiOutlineUser className="h-[18px] w-[18px]" />,
  phone: <HiOutlinePhone className="h-[18px] w-[18px]" />,
  email: <HiOutlineMail className="h-[18px] w-[18px]" />,
  globe: <HiOutlineGlobeAlt className="h-[18px] w-[18px]" />,
  info: <HiOutlineInformationCircle className="h-[18px] w-[18px]" />,
  calendar: <HiOutlineCalendar className="h-[18px] w-[18px]" />,
  doc: <HiOutlineDocument className="h-[18px] w-[18px]" />,
};

function WhatsAppIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.668-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function FeesIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h2m4 0h4m-6 4l3-8m-1.293-1.293a1 1 0 112.586 0l3 3M17 7l1 1" />
    </svg>
  );
}

function Field({ label, required, optional, error, icon, children }) {
  return (
    <div className="group/f">
      <label className="mb-1.5 flex items-center gap-2 text-[0.8125rem] font-semibold tracking-wide text-white/50">
        {label}
        {required && <span className="text-pink-400 text-[0.7rem] font-normal normal-case">*required</span>}
        {optional && <span className="text-white/20 text-[0.7rem] font-normal normal-case italic">optional</span>}
      </label>
      <div className="relative">
        {icon && (
          <span
            className={cx(
              'pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-white/25',
              'transition-colors group-focus-within/f:text-indigo-400',
            )}
          >
            {ICONS[icon]}
          </span>
        )}
        {children}
      </div>
      {error && (
        <p
          className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-400"
          style={{ animation: 'fadeUp 0.2s ease' }}
        >
          <HiExclamationCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function Chevron() {
  return (
    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25">
      <HiOutlineChevronDown className="h-4 w-4" />
    </span>
  );
}

/* ═══ Track portal (self-service) ═══ */
const STATUS_STEPS = [
  { key: 'INQUIRY', label: 'Inquiry', color: '#818cf8' },
  { key: 'APPLIED', label: 'Applied', color: '#38bdf8' },
  { key: 'OFFERED', label: 'Offered', color: '#fbbf24' },
  { key: 'ENROLLED', label: 'Enrolled', color: '#34d399' },
];
const DOC_TYPE_LABELS = {
  PHOTO_ID: 'Photo ID',
  MARKSHEET_10: 'Marksheet (10th)',
  MARKSHEET_12: 'Marksheet (12th)',
  DEGREE_CERTIFICATE: 'Degree Certificate',
  TRANSFER_CERTIFICATE: 'Transfer Certificate',
  ID_PROOF: 'ID Proof',
  RESUME: 'Resume',
  OTHER: 'Other',
};
const FEE_STATUS_LABELS = { PENDING: 'Pending', PARTIAL: 'Partially Paid', PAID: 'Paid' };
const FEE_STATUS_COLORS = { PENDING: '#f87171', PARTIAL: '#fbbf24', PAID: '#34d399' };
const formatDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};
const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function TrackPortal({ initialNumber, initialPhone, onNewApplication }) {
  const [appNumber, setAppNumber] = useState(initialNumber || '');
  const [phone, setPhone] = useState(initialPhone || '');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('OTHER');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const fileRef = useRef(null);
  const trackInput = [
    'w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-[0.9375rem] text-white',
    'outline-none transition-all duration-200 placeholder:text-white/20 border-white/[0.08]',
    'hover:border-white/[0.15] focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20',
  ].join(' ');

  const track = async (e) => {
    e.preventDefault();
    if (!appNumber.trim()) { setError('Please enter your application number.'); return; }
    if (phone.length < 10) { setError('Please enter the 10-digit phone number you used when applying.'); return; }
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const data = await api.portal.track(appNumber.trim().toUpperCase(), phone);
      setResult(data?.data?.application || null);
    } catch (err) {
      setError(err.message || 'Could not find your application. Please check the number and phone.');
    } finally {
      setLoading(false);
    }
  };

  const uploadDoc = async (e) => {
    e.preventDefault();
    if (!result) return;
    if (!file) { setUploadMsg({ ok: false, text: 'Please choose a file to upload.' }); return; }
    if (file.size > MAX_FILE_SIZE) {
      setUploadMsg({ ok: false, text: `File too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.` });
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    setUploadMsg(null);
    setUploading(true);
    try {
      await api.portal.uploadDocument(result.applicationNumber, phone, file, docType);
      setUploadMsg({ ok: true, text: 'Document uploaded successfully.' });
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      const fresh = await api.portal.track(result.applicationNumber, phone);
      setResult(fresh?.data?.application || result);
    } catch (err) {
      setUploadMsg({ ok: false, text: err.message || 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const autoTrackedRef = useRef(false);

  useEffect(() => {
    if (autoTrackedRef.current) return;
    if (initialNumber && initialPhone) {
      autoTrackedRef.current = true;
      track({ preventDefault: () => {} });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const statusIndex = STATUS_STEPS.findIndex((s) => s.key === result?.status);

  return (
    <div className="mx-auto max-w-2xl" style={{ animation: 'fadeUp 0.5s ease' }}>
      {!result ? (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm sm:p-10">
          <div className="mb-6 text-center">
            <div
              className={cx(
                'mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl',
                'bg-indigo-500/15 text-indigo-400',
              )}
            >
              <HiOutlineDocumentText className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Track Your Application</h3>
            <p className="mt-1 text-sm text-white/40">
              Enter the application number you received and the phone number you applied with.
            </p>
          </div>
          <form onSubmit={track} className="space-y-4">
            <Field label="Application Number" required icon="doc">
              <input
                className={trackInput}
                value={appNumber}
                onChange={(e) =>
                  setAppNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20))
                }
                placeholder="e.g. APP-2026-000123"
                autoComplete="off"
              />
            </Field>
            <Field label="Phone Number" required icon="phone">
              <input
                className={trackInput}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                inputMode="numeric"
              />
            </Field>
            {error && (
              <div
                className={cx(
                  'flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10',
                  'px-4 py-3 text-sm text-red-300',
                )}
                role="alert"
              >
                <HiExclamationCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`flex w-full items-center justify-center gap-2 px-6 py-3.5 ${GRADIENT_BTN_DISABLED}`}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  Track Application
                  <HiOutlineSearch className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-white/20">
            Don't have an application yet?{' '}
            <button onClick={onNewApplication} className="underline transition-colors hover:text-indigo-400">
              Apply now
            </button>
          </p>
        </div>
      ) : (
        <TrackResult
          application={result}
          statusIndex={statusIndex}
          fileRef={fileRef}
          docType={docType}
          setDocType={setDocType}
          setFile={setFile}
          uploading={uploading}
          uploadMsg={uploadMsg}
          uploadDoc={uploadDoc}
          onReset={() => { setResult(null); setUploadMsg(null); setFile(null); }}
        />
      )}
    </div>
  );
}

function TrackResult({
  application,
  statusIndex,
  fileRef,
  docType,
  setDocType,
  setFile,
  uploading,
  uploadMsg,
  uploadDoc,
  onReset,
}) {
  const feePct =
    application.feeTotal > 0
      ? Math.min(100, Math.round((application.feePaid / application.feeTotal) * 100))
      : 0;
  const feeColor = FEE_STATUS_COLORS[application.feeStatus] || '#818cf8';

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className={CARD_PANEL} style={{ animation: 'fadeUp 0.4s ease' }}>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[0.65rem] font-semibold uppercase tracking-widest text-white/30">Application</div>
            <div className="mt-0.5 text-xl font-extrabold tracking-wide text-white select-all">
              {application.applicationNumber}
            </div>
            <div className="mt-0.5 text-xs text-white/40">
              {application.lead?.name ? `${application.lead.name} · ` : ''}
              {application.course?.name ? `Applied for ${application.course.name}` : 'Course not selected yet'}
            </div>
          </div>
          <button
            onClick={onReset}
            className={cx(
              'flex items-center gap-1 rounded-lg border border-white/[0.1] bg-white/[0.06] px-3 py-1.5',
              'text-xs font-semibold text-white/60 transition-all hover:bg-white/[0.1] hover:text-white',
            )}
          >
            <HiOutlineArrowSmLeft className="h-3 w-3" />
            Track Another
          </button>
        </div>

        {/* Status pipeline */}
        <div className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-white/30">Status</span>
            <span
              className={STATUS_BADGE}
              style={{
                color: STATUS_STEPS[Math.max(0, statusIndex)]?.color,
                background: `${STATUS_STEPS[Math.max(0, statusIndex)]?.color}1a`,
              }}
            >
              {STATUS_STEPS[Math.max(0, statusIndex)]?.label || application.status}
            </span>
          </div>
          <div className="flex items-center">
            {STATUS_STEPS.map((s, i) => (
              <div key={s.key} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all"
                    style={{
                      background: i <= statusIndex ? s.color : 'rgba(255,255,255,0.06)',
                      color: i <= statusIndex ? '#0a0a1a' : 'rgba(255,255,255,0.3)',
                      boxShadow: i === statusIndex ? `0 0 0 4px ${s.color}26` : 'none',
                    }}
                  >
                    {i < statusIndex ? (
                      <HiOutlineCheck className="h-3.5 w-3.5" strokeWidth={3} />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className="mt-1.5 text-[0.6rem] font-semibold"
                    style={{ color: i <= statusIndex ? s.color : 'rgba(255,255,255,0.25)' }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div
                    className="mx-2 mb-4 h-0.5 flex-1 rounded-full"
                    style={{ background: i < statusIndex ? s.color : 'rgba(255,255,255,0.08)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
            <div className="text-[0.6rem] font-semibold uppercase tracking-widest text-white/25">Applied</div>
            <div className="mt-0.5 text-xs font-semibold text-white/80">{formatDateTime(application.appliedAt)}</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
            <div className="text-[0.6rem] font-semibold uppercase tracking-widest text-white/25">Offer</div>
            <div className="mt-0.5 text-xs font-semibold text-white/80">{formatDateTime(application.offerDate)}</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
            <div className="text-[0.6rem] font-semibold uppercase tracking-widest text-white/25">Enrolled</div>
            <div className="mt-0.5 text-xs font-semibold text-white/80">{formatDateTime(application.enrolledAt)}</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
            <div className="text-[0.6rem] font-semibold uppercase tracking-widest text-white/25">Intake</div>
            <div className="mt-0.5 text-xs font-semibold text-white/80">
              {application.intake ? (
                <>
                  {application.intake.name}
                  {application.intake.startDate ? (
                    <span className="text-white/40">
                      {' '}· {formatDateTime(application.intake.startDate).split(',')[0]}
                    </span>
                  ) : null}
                </>
              ) : (
                'Not selected'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fee card */}
      <div className={CARD_PANEL} style={{ animation: 'fadeUp 0.4s ease 0.08s both' }}>
        <div className="mb-4 flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-sm font-bold text-white">
            <FeesIcon className="h-4 w-4 text-emerald-400" />
            Fees
          </h4>
            <span className={STATUS_BADGE} style={{ color: feeColor, background: `${feeColor}1a` }}>
            {FEE_STATUS_LABELS[application.feeStatus] || application.feeStatus}
          </span>
        </div>
        <div className="mb-2 flex items-end justify-between text-sm">
          <span className="text-white/40">Paid so far</span>
          <span className="font-bold text-white">
            ₹{formatFee(application.feePaid)}
            <span className="font-normal text-white/30"> of ₹{formatFee(application.feeTotal)}</span>
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${feePct}%`, background: `linear-gradient(90deg, ${feeColor}, ${feeColor}cc)` }}
          />
        </div>
        <div className="mt-2 text-right text-[0.7rem] font-semibold" style={{ color: feeColor }}>
          {feePct}% paid
        </div>

        {application.payments?.length > 0 && (
          <div className="mt-5">
            <div className="mb-2 text-[0.65rem] font-semibold uppercase tracking-widest text-white/25">
              Payment History
            </div>
            <div className="space-y-2">
              {application.payments.map((p) => (
                <div
                  key={p.id}
                  className={cx(
                    'flex items-center justify-between rounded-xl border',
                    'border-white/[0.06] bg-white/[0.03] px-4 py-2.5',
                  )}
                >
                  <div>
                    <div className="text-sm font-semibold text-white">₹{formatFee(p.amount)}</div>
                    <div className="text-[0.7rem] text-white/30">
                      {p.method || 'Payment'}
                      {p.reference ? ` · ${p.reference}` : ''}
                    </div>
                  </div>
                  <div className="text-[0.7rem] font-medium text-white/40">{formatDateTime(p.paidAt)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Documents card */}
      <div className={CARD_PANEL} style={{ animation: 'fadeUp 0.4s ease 0.16s both' }}>
        <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
          <HiOutlineDocument className="h-4 w-4 text-indigo-400" />
          Documents
        </h4>

        {application.documents?.length > 0 && (
          <div className="mb-5 space-y-2">
              {application.documents.map((d) => (
                <div
                  key={d.id}
                  className={cx(
                    'flex items-center justify-between gap-3 rounded-xl border',
                    'border-white/[0.06] bg-white/[0.03] px-4 py-3',
                  )}
                >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cx(
                      'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                      'bg-indigo-500/15 text-[0.6rem] font-bold text-indigo-300',
                    )}
                  >
                    {d.type?.split('_')[0] || 'DOC'}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{d.originalName}</div>
                    <div className="text-[0.7rem] text-white/30">
                      {DOC_TYPE_LABELS[d.type] || d.type}
                      {d.size != null ? ` · ${formatSize(d.size)}` : ''}
                    </div>
                  </div>
                </div>
                <a
                  href={`${API_BASE}${d.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className={cx(
                    [
                      'flex flex-shrink-0 items-center gap-1.5 rounded-lg border',
                      'border-white/[0.1] bg-white/[0.06] px-3 py-1.5',
                    ].join(' '),
                    'text-xs font-semibold text-white/70 transition-all hover:bg-white/[0.12] hover:text-white',
                  )}
                >
                  <HiOutlineUpload className="h-3.5 w-3.5" />
                  View
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Upload form */}
        <form onSubmit={uploadDoc} className="rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] p-4">
          <div className="mb-3 text-[0.65rem] font-semibold uppercase tracking-widest text-white/25">
            Upload a document
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className={cx(
                'rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white',
                'outline-none transition-colors focus:border-indigo-500/60',
              )}
            >
              {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k} className="bg-[#15152b]">{v}</option>
              ))}
            </select>
            <input
              ref={fileRef}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className={cx(
                [
                  'block w-full cursor-pointer rounded-xl border border-white/[0.08] bg-white/[0.04]',
                  'px-3 py-2 text-xs text-white/60 outline-none',
                ].join(' '),
                [
                  'file:mr-3 file:cursor-pointer file:rounded-lg file:border-0',
                  'file:bg-indigo-500/20 file:px-3 file:py-1.5',
                ].join(' '),
                'file:text-xs file:font-semibold file:text-indigo-300',
              )}
            />
            <p className="col-span-full text-[0.65rem] text-white/25">
              Max file size: {MAX_FILE_SIZE_MB}MB (PDF, image, Word or text)
            </p>
          </div>
          {uploadMsg && (
            <p
              className={cx(
                'mt-3 flex items-center gap-1.5 text-xs font-medium',
                uploadMsg.ok ? 'text-emerald-400' : 'text-red-400',
              )}
            >
              {uploadMsg.ok ? (
                <HiOutlineCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
              ) : (
                <HiExclamationCircle className="h-3.5 w-3.5" />
              )}
              {uploadMsg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={uploading}
            className={`mt-4 flex w-full items-center justify-center gap-2 px-6 py-3 ${GRADIENT_BTN_DISABLED}`}
          >
            {uploading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                Upload Document
                <HiOutlineDownload className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ═══ MAIN COMPONENT ═══ */
export default function ApplyPage() {
  const [publicFeatures, setPublicFeatures] = useState({});
  const [mode, setMode] = useState('form'); // 'form' | 'chat' | 'track'
  const [courses, setCourses] = useState([]);
  const [intakes, setIntakes] = useState([]);
  const [step, setStep] = useState(0);
  const [selectedDept, setSelectedDept] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    otherSource: '',
    courseId: '',
    intakeId: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);
  const [trackNumber, setTrackNumber] = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const submitControllerRef = useRef(null);

  useEffect(() => {
    return () => { submitControllerRef.current?.abort(); };
  }, []);

  useSeo({
    title: `Apply for Admission ${new Date().getFullYear()} — Free Online Application at ${APP_UNIVERSITY_NAME}`,
    description: APP_DESCRIPTION,
    canonical: `${window.location.origin}/apply`,
  });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    fetch(`${API_BASE}/api/public/features`, { signal: controller.signal })
      .then(r => r.json())
      .then(res => { if (!cancelled && res.success && res.data) setPublicFeatures(res.data); })
      .catch(() => {});
    return () => { cancelled = true; controller.abort(); };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const num = params.get('track');
    if (num) {
      setTrackNumber(num.toUpperCase());
      setTrackPhone((params.get('phone') || '').replace(/\D/g, '').slice(0, 10));
      setMode('track');
    } else if (params.get('mode') === 'track') {
      setMode('track');
    }
  }, []);

  const chatEnabled = Boolean(publicFeatures.AI_CHATBOT);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    fetch(`${API_BASE}/api/public/courses`, { signal: controller.signal })
      .then(r => r.json())
      .then(res => { if (!cancelled && res.success) setCourses(res.data.courses || []); })
      .catch(() => {});
    fetch(`${API_BASE}/api/public/intakes`, { signal: controller.signal })
      .then(r => r.json())
      .then(res => { if (!cancelled && res.success) setIntakes(res.data.intakes || []); })
      .catch(() => {});
    return () => { cancelled = true; controller.abort(); };
  }, []);

  // Deep-link prefill: /apply?course=<id>&intake=<id> or /apply?dept=<name>
  const prefillAppliedRef = useRef(false);
  useEffect(() => {
    if (prefillAppliedRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('course');
    const intakeId = params.get('intake');
    const dept = params.get('dept');
    if (!courseId && !intakeId && !dept) return;
    const courseOk = !courseId || courses.some(c => c.id === courseId);
    const intakeOk = !intakeId || intakes.some(i => i.id === intakeId);
    if (!courseOk || !intakeOk) return;
    prefillAppliedRef.current = true;
    setForm(prev => ({
      ...prev,
      courseId: courseId || prev.courseId,
      intakeId: intakeId || prev.intakeId,
    }));
    if (courseId) {
      const course = courses.find(c => c.id === courseId);
      if (course) setSelectedDept(course.department);
      setStep(1);
    } else if (dept) {
      setSelectedDept(dept);
    }
  }, [courses, intakes]);

  const selectedCourse = useMemo(() => courses.find(c => c.id === form.courseId), [courses, form.courseId]);

  const sanitizeName = (v) => v.replace(/[^a-zA-Z\s.'-]/g, '').replace(/\s{2,}/g, ' ');
  const sanitizePhone = (v) => v.replace(/\D/g, '').slice(0, 10);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === 'name') next = sanitizeName(value);
    if (name === 'phone') next = sanitizePhone(value);
    if (name === 'otherSource') next = value.replace(/[^a-zA-Z\s,.'-]/g, '').slice(0, 50);
    if (name === 'notes') next = value.slice(0, 500);
    if (name === 'email') next = value.replace(/\s/g, '').slice(0, 100);
    setForm(prev => ({ ...prev, [name]: next }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'source' && value !== 'OTHER') {
      setErrors(prev => {
        const n = { ...prev };
        delete n.otherSource;
        return n;
      });
    }
  };

  const validateField = (name) => {
    const errs = {};
    if (name === 'name') {
      const v = form.name.trim();
      if (!v) errs.name = 'Full name is required';
      else if (v.length < 2) errs.name = 'Name must be at least 2 characters';
      else if (v.length > 100) errs.name = 'Name must be under 100 characters';
      else if (!/^[a-zA-Z\s.'-]+$/.test(v)) errs.name = 'Name can only contain letters, spaces, periods, hyphens';
      else if (/^[\s.'-]|[\s.'-]$/.test(v)) errs.name = 'Name cannot start or end with special characters';
    }
    if (name === 'phone') {
      const v = form.phone.trim();
      if (!v) errs.phone = 'Phone number is required';
      else if (v.length < 10) errs.phone = 'Enter a valid 10-digit phone number';
      else if (!/^[6-9]\d{9}$/.test(v)) errs.phone = 'Enter a valid Indian mobile number (starts with 6-9)';
    }
    if (name === 'email') {
      const v = form.email.trim();
      if (v) {
        if (v.length > 100) errs.email = 'Email must be under 100 characters';
        else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v)) {
          errs.email = 'Enter a valid email address';
        }
      }
    }
    if (name === 'source') {
      if (!form.source) errs.source = 'Please select how you heard about us';
    }
    if (name === 'otherSource') {
      if (form.source === 'OTHER') {
        const v = form.otherSource.trim();
        if (!v) errs.otherSource = 'Please specify the source';
        else if (v.length < 2) errs.otherSource = 'Specify at least 2 characters';
        else if (v.length > 50) errs.otherSource = 'Source must be under 50 characters';
      }
    }
    if (name === 'notes') {
      const v = form.notes;
      if (v.length > 500) errs.notes = 'Message must be under 500 characters';
    }
    setErrors(prev => {
      const next = { ...prev };
      Object.keys(errs).forEach(k => { next[k] = errs[k]; });
      if (!errs[name] && next[name]) delete next[name];
      return next;
    });
    return Object.keys(errs).length === 0;
  };

  const validateDetails = () => {
    const fields = ['name', 'phone', 'email', 'source', 'otherSource', 'notes'];
    let valid = true;
    fields.forEach(f => { if (!validateField(f)) valid = false; });
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateDetails()) return;
    setErrors(prev => { const n = { ...prev }; delete n.submit; return n; });
    submitControllerRef.current?.abort();
    const controller = new AbortController();
    submitControllerRef.current = controller;
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        source: form.source,
        email: form.email || undefined,
        courseId: form.courseId || undefined,
        intakeId: form.intakeId || undefined,
        notes: form.source === 'OTHER'
          ? `Source: ${form.otherSource.trim()}${form.notes ? `\n${form.notes}` : ''}`
          : form.notes || undefined,
      };
      const res = await fetch(`${API_BASE}/api/public/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const json = await res.json();
      if (!res.ok) {
        setErrors({ submit: json.message || 'Something went wrong. Please try again.' });
        return;
      }
      const payload_data = json.data || json;
      clearTrackParams();
      setIsDuplicate(!!payload_data.isDuplicate);
      setSubmitMessage(payload_data.message || 'Thank you! Your inquiry has been submitted.');
      setSubmittedApp(payload_data.application || null);
      setSubmitted(true);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setErrors({ submit: 'Network error. Please check your connection and try again.' });
    } finally {
      if (submitControllerRef.current === controller) setSubmitting(false);
    }
  };

  const inputBase = [
    'w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-[0.9375rem] text-white',
    'outline-none transition-all duration-200 placeholder:text-white/20',
  ].join(' ');
  const inputClass = (f) => {
    if (errors[f]) {
      return `${inputBase} border-red-500/50 bg-red-500/[0.06] focus:border-red-400 focus:ring-2 focus:ring-red-500/20`;
    }
    if (focusedField === f) {
      return `${inputBase} border-indigo-500/60 bg-white/[0.07] ring-2 ring-indigo-500/20`;
    }
    return cx(
      inputBase,
      'border-white/[0.08] hover:border-white/[0.15]',
      'focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20',
    );
  };

  const clearTrackParams = () => {
    if (window.location.search.includes('track=')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const handleReset = () => {
    clearTrackParams();
    setSubmitted(false);
    setSubmittedApp(null);
    setForm({ name: '', email: '', phone: '', source: '', otherSource: '', courseId: '', intakeId: '', notes: '' });
    setSelectedDept('');
    setErrors({});
    setStep(0);
  };

  const handleTrackNow = () => {
    if (submittedApp?.applicationNumber) setTrackNumber(submittedApp.applicationNumber);
    if (form.phone) setTrackPhone(form.phone);
    setSubmitted(false);
    setMode('track');
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#0a0a1a' }}>
        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-60"
            style={{
              background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)',
              animation: 'float 20s ease-in-out infinite',
            }}
          />
          <div
            className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full opacity-60"
            style={{
              background: 'radial-gradient(circle, rgba(147,51,234,0.16) 0%, transparent 70%)',
              animation: 'float 16s ease-in-out infinite reverse',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          {/* Header */}
          <div
            className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:justify-between"
            style={{ animation: 'fadeUp 0.5s ease' }}
          >
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className={cx(
                  'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br',
                  'from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-lg shadow-indigo-500/25',
                )}
              >
                {APP_INITIAL}
              </div>
              <div>
                <div className="text-base font-extrabold text-white">{APP_UNIVERSITY_NAME}</div>
                <div className="text-[0.7rem] text-white/30">Education Admission Management</div>
              </div>
            </div>
            {/* Mode toggle + Step bar */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              {!submitted && (
                <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.04] p-1">
                  <button
                    onClick={() => { clearTrackParams(); setMode('form'); }}
                    className={cx(
                      'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5',
                      'text-[0.65rem] font-semibold transition-all sm:px-3 sm:text-xs',
                      mode === 'form' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50',
                    )}
                  >
                    <HiOutlineDocumentText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Fill Form
                  </button>
                  <button
                    onClick={() => setMode('track')}
                    className={cx(
                      'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5',
                      'text-[0.65rem] font-semibold transition-all sm:px-3 sm:text-xs',
                      mode === 'track' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50',
                    )}
                  >
                    <HiOutlineSearch className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Track
                  </button>
                  {chatEnabled && (
                    <button
                      onClick={() => { clearTrackParams(); setMode('chat'); }}
                      className={cx(
                        'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5',
                        'text-[0.65rem] font-semibold transition-all sm:px-3 sm:text-xs',
                        mode === 'chat' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50',
                      )}
                    >
                      <HiOutlineChat className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      Chat with AI
                      <span
                        className={cx(
                          'rounded bg-indigo-500/30 px-1 py-0.5 text-[0.55rem] font-bold',
                          'text-indigo-300 sm:text-[0.6rem]',
                        )}
                      >
                        NEW
                      </span>
                    </button>
                  )}
                </div>
              )}
              {!submitted && mode === 'form' && (
                <StepBar step={step} onStepClick={(i) => { if (i < step) setStep(i); }} />
              )}
            </div>
          </div>

          {/* Error alert */}
          {errors.submit && (
            <div
              className={cx(
                'mx-auto mb-6 max-w-2xl flex items-start gap-3 rounded-xl border',
                'border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300',
              )}
              role="alert"
              style={{ animation: 'fadeUp 0.25s ease' }}
            >
              <HiOutlineExclamation className="mt-0.5 h-4 w-4 flex-shrink-0" />
              {errors.submit}
            </div>
          )}

          {/* Steps */}
          {submitted ? (
            <SuccessStep
              isDuplicate={isDuplicate}
              message={submitMessage}
              application={submittedApp}
              phone={form.phone}
              onTrack={handleTrackNow}
              onReset={handleReset}
            />
          ) : mode === 'track' ? (
            <TrackPortal initialNumber={trackNumber} initialPhone={trackPhone} onNewApplication={() => setMode('form')} />
          ) : mode === 'chat' && chatEnabled ? (
            <div className="mx-auto max-w-2xl" style={{ animation: 'fadeUp 0.5s ease' }}>
              <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm">
                <ChatBot onLeadCreated={(data) => {
                  setIsDuplicate(false);
                  setSubmitMessage(data.message || 'Your inquiry has been submitted!');
                  setSubmitted(true);
                }} />
              </div>
              <p className="mt-4 text-center text-xs text-white/20">
                Prefer to fill out a form?{' '}
                <button onClick={() => { clearTrackParams(); setMode('form'); }} className="underline transition-colors hover:text-indigo-400">
                  Switch to form mode
                </button>
              </p>
            </div>
          ) : step === 0 ? (
            <>
              <CourseStep
              courses={courses}
              selectedId={form.courseId}
              initialDept={selectedDept}
              onSelect={(id) => {
                setForm(prev => ({ ...prev, courseId: id }));
                if (id) setStep(1);
              }}
            />
              <div className="mt-8 flex justify-center" style={{ animation: 'fadeUp 0.5s ease 0.3s both' }}>
                <button
                  onClick={() => setStep(1)}
                  className={`group relative overflow-hidden px-10 py-3.5 ${GRADIENT_BTN}`}
                >
                  <span className="relative flex items-center gap-2">
                    {form.courseId ? 'Continue with Selected Course' : 'Skip — Fill Details Instead'}
                        <HiOutlineArrowRight
                          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                          strokeWidth={2.5}
                        />
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              <DetailsStep
                form={form} errors={errors}
                inputClass={inputClass} onChange={handleChange}
                onFocus={setFocusedField} onBlur={() => setFocusedField('')}
                selectedCourse={selectedCourse}
                onClearCourse={() => setForm(prev => ({ ...prev, courseId: '' }))}
                intakes={intakes}
              />
              <div
                className="mt-8 flex items-center justify-center gap-4"
                style={{ animation: 'fadeUp 0.4s ease 0.2s both' }}
              >
                <button
                  onClick={() => setStep(0)}
                  className={cx(
                    'rounded-xl border border-white/[0.08] bg-white/[0.04] px-6 py-3 text-sm font-semibold',
                    'text-white/50 transition-all hover:bg-white/[0.08] hover:text-white',
                  )}
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`group relative overflow-hidden px-10 py-3.5 ${GRADIENT_BTN_DISABLED}`}
                >
                  <span
                    className={cx(
                      'absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500',
                      'opacity-0 transition-opacity group-hover:opacity-100',
                    )}
                  />
                  <span className="relative flex items-center gap-2">
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Inquiry
                    <HiOutlineArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={2.5}
                    />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
