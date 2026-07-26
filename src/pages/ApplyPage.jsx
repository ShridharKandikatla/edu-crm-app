import { useState, useEffect, useMemo, useRef } from 'react';
import { config } from '../config/env';
import ChatBot from '../components/apply/ChatBot';

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
  Engineering: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/25', ring: 'ring-blue-500/30' },
  Management: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/25', ring: 'ring-amber-500/30' },
  Science: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/25', ring: 'ring-emerald-500/30' },
  Commerce: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/25', ring: 'ring-purple-500/30' },
};

const DEPT_ICONS = {
  Engineering: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Management: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Science: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  Commerce: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
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
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                  done ? 'bg-indigo-500 text-white cursor-pointer hover:bg-indigo-400' : active ? 'bg-white text-[#0a0a1a] ring-2 ring-indigo-400' : 'bg-white/10 text-white/40'
                }`}
              >
                {done ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}
              </div>
              <span
                onClick={clickable ? () => onStepClick(i) : undefined}
                className={`hidden text-xs font-semibold sm:inline ${clickable ? 'text-indigo-300 cursor-pointer hover:text-white' : active ? 'text-white' : 'text-white/30'}`}
              >
                {label}
              </span>
            </div>
            {i < 2 && (
              <div className={`h-px w-6 sm:w-10 transition-colors duration-300 ${done ? 'bg-indigo-500' : 'bg-white/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Course Step ─── */
function CourseStep({ courses, selectedId, onSelect, onSkip }) {
  const [deptFilter, setDeptFilter] = useState('All');
  const departments = useMemo(() => ['All', ...new Set(courses.map(c => c.department))], [courses]);
  const filtered = useMemo(
    () => deptFilter === 'All' ? courses : courses.filter(c => c.department === deptFilter),
    [courses, deptFilter],
  );

  return (
    <div style={{ animation: 'fadeUp 0.5s ease both' }}>
      {/* Section title */}
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-400">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
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
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                active
                  ? `${dc.bg || 'bg-white/15'} ${dc.text || 'text-white'} ${dc.border || 'border-white/25'}`
                  : 'border-white/[0.06] bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/60'
              }`}
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
              className={`apply-card group relative overflow-hidden rounded-2xl border text-left transition-all duration-300 ${
                sel
                  ? `selected border-indigo-500/60 bg-indigo-500/10 ring-2 ${dc.ring || 'ring-indigo-500/30'} shadow-xl`
                  : 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.15] hover:bg-white/[0.06]'
              }`}
              style={{ animation: `fadeUp 0.4s ease ${i * 0.04}s both` }}
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                {course.image ? (
                  <img src={course.image} alt={course.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/[0.06] to-transparent">
                    <svg className="h-14 w-14 text-white/[0.06]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-transparent to-transparent" />
                {/* Fee badge */}
                <div className="absolute right-3 top-3 rounded-lg bg-black/50 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  ₹{formatFee(course.fee)}
                </div>
                {/* Selection indicator */}
                {sel && (
                  <div className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/40" style={{ animation: 'checkPop 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
                    <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className={`mb-2 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${dc.bg || ''} ${dc.text || ''} ${dc.border || ''}`}>
                  {DEPT_ICONS[course.department]}
                  {course.department}
                </div>
                <h3 className="mb-2 text-sm font-bold leading-tight text-white">{course.name}</h3>
                <div className="flex items-center gap-3 text-[0.7rem] text-white/35">
                  <span className="flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {course.duration}
                  </span>
                  {course.seats && (
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {course.seats} seats
                    </span>
                  )}
                </div>
                <div className={`mt-3 border-t pt-3 text-xs font-semibold ${sel ? 'border-indigo-500/20 text-indigo-400' : 'border-white/[0.05] text-white/25'}`}>
                  {sel ? '✓ Selected' : '₹' + course.fee.toLocaleString()}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Skip hint */}
      <p className="mt-6 text-center text-xs text-white/25">
        You can also{' '}
        <button onClick={onSkip} className="underline transition-colors hover:text-indigo-400">
          skip and fill your details first
        </button>
      </p>
    </div>
  );
}

/* ─── Details Step ─── */
function DetailsStep({ form, errors, focusedField, inputClass, onChange, onFocus, onBlur, selectedCourse, onClearCourse, courses, intakes }) {
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
          <input id="a-name" type="text" name="name" value={form.name} onChange={onChange} onFocus={() => onFocus('name')} onBlur={() => onBlur('name')} placeholder="John Doe" className={`${inputClass('name')} pl-11`} maxLength={100} autoComplete="name" inputMode="text" required />
        </Field>

        {/* Phone + Email */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Phone" required error={errors.phone} icon="phone">
            <input id="a-phone" type="tel" name="phone" value={form.phone} onChange={onChange} onFocus={() => onFocus('phone')} onBlur={() => onBlur('phone')} placeholder="98765 43210" className={`${inputClass('phone')} pl-11`} maxLength={10} autoComplete="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" required />
          </Field>
          <Field label="Email" optional error={errors.email} icon="email">
            <input id="a-email" type="email" name="email" value={form.email} onChange={onChange} onFocus={() => onFocus('email')} onBlur={() => onBlur('email')} placeholder="you@example.com" className={`${inputClass('email')} pl-11`} maxLength={100} autoComplete="email" inputMode="email" />
          </Field>
        </div>

        {/* Source */}
        <Field label="How did you hear about us?" required error={errors.source} icon="globe">
          <select name="source" value={form.source} onChange={onChange} onFocus={() => onFocus('source')} onBlur={() => onBlur('source')} className={`${inputClass('source')} pl-11 pr-10 appearance-none`} required>
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
              <input id="a-other" type="text" name="otherSource" value={form.otherSource} onChange={onChange} onFocus={() => onFocus('otherSource')} onBlur={() => onBlur('otherSource')} placeholder="e.g. YouTube, WhatsApp..." className={`${inputClass('otherSource')} pl-11`} maxLength={50} inputMode="text" />
            </Field>
          </div>
        )}

        {/* Intake */}
        {intakes.length > 0 && (
          <Field label="Preferred Intake" optional error={errors.intakeId} icon="calendar">
            <select name="intakeId" value={form.intakeId} onChange={onChange} onFocus={() => onFocus('intakeId')} onBlur={() => onBlur('intakeId')} className={`${inputClass('intakeId')} pl-11 pr-10 appearance-none`}>
              <option value="" className="bg-[#0a0a1a]">Select an intake...</option>
              {intakes.map(intake => (
                <option key={intake.id} value={intake.id} className="bg-[#0a0a1a]">{intake.name} ({new Date(intake.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })})</option>
              ))}
            </select>
            <Chevron />
          </Field>
        )}

        {/* Message */}
        <Field label="Message" optional error={errors.notes}>
          <textarea id="a-notes" name="notes" value={form.notes} rows={3} onChange={onChange} onFocus={() => onFocus('notes')} onBlur={() => onBlur('notes')} placeholder="Any specific questions or requirements..." className={`${inputClass('notes')} resize-none`} maxLength={500} />
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
                  <svg className="h-6 w-6 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-white">{selectedCourse.name}</div>
                <div className="mt-0.5 text-xs text-white/35">{selectedCourse.department} &middot; {selectedCourse.duration}</div>
                <div className="mt-1 text-sm font-bold text-indigo-400">₹{selectedCourse.fee.toLocaleString()}</div>
              </div>
              <button type="button" onClick={onClearCourse} className="rounded-lg p-1 text-white/30 transition-colors hover:bg-white/10 hover:text-white" aria-label="Remove course">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <p className="text-xs text-white/20">No course selected — you can choose later</p>
          )}
        </div>

        {/* Trust signals */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/30">Why UniCRM?</div>
          <div className="space-y-3">
            {[
              { icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, text: '100% Confidential' },
              { icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, text: 'Reply within 24 hours' },
              { icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>, text: 'Free Counselling' },
              { icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>, text: 'Data never shared' },
            ].map(s => (
              <div key={s.text} className="flex items-center gap-2.5 text-xs text-white/40">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
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
function SuccessStep({ isDuplicate, message, onReset }) {
  return (
    <div className="mx-auto max-w-lg text-center" style={{ animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-10 backdrop-blur-xl">
        {/* Animated check */}
        <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
          <svg className="relative h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" style={{ animation: 'checkPop 0.5s ease 0.3s both', transformOrigin: 'center' }} />
          </svg>
        </div>

        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
          {isDuplicate ? 'Already Registered' : 'Inquiry Received'}
        </div>

        <h2 className="mb-3 text-3xl font-extrabold text-white">
          {isDuplicate ? 'Welcome Back!' : "You're All Set!"}
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-white/40">{message}</p>

        {/* Next steps */}
        <div className="mb-8 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="text-sm font-bold text-white">Next Step</div>
            <div className="mt-0.5 text-xs text-white/30">Our counsellor will call you within 24 hours</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-sm font-bold text-white">Check Email</div>
            <div className="mt-0.5 text-xs text-white/30">Confirmation details sent to your inbox</div>
          </div>
        </div>

        <button
          onClick={onReset}
          className="w-full rounded-xl border border-white/[0.1] bg-white/[0.06] py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/[0.1]"
        >
          Submit Another Inquiry
        </button>
      </div>
    </div>
  );
}

/* ─── Reusable building blocks ─── */
const ICONS = {
  user: <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  phone: <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  email: <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  globe: <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
  info: <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  calendar: <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
};

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
          <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-white/25 transition-colors group-focus-within/f:text-indigo-400">
            {ICONS[icon]}
          </span>
        )}
        {children}
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-400" style={{ animation: 'fadeUp 0.2s ease' }}>
          <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          {error}
        </p>
      )}
    </div>
  );
}

function Chevron() {
  return (
    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
    </span>
  );
}

/* ═══ MAIN COMPONENT ═══ */
export default function ApplyPage() {
  const [mode, setMode] = useState('form'); // 'form' | 'chat'
  const [courses, setCourses] = useState([]);
  const [intakes, setIntakes] = useState([]);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', phone: '', source: '', otherSource: '', courseId: '', intakeId: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const submitControllerRef = useRef(null);

  useEffect(() => {
    return () => { submitControllerRef.current?.abort(); };
  }, []);

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
    if (name === 'source' && value !== 'OTHER') setErrors(prev => { const n = { ...prev }; delete n.otherSource; return n; });
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
        else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v)) errs.email = 'Enter a valid email address';
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

  const handleBlur = (name) => {
    setFocusedField('');
    if (form[name] !== undefined) validateField(name);
  };

  const validateDetails = () => {
    const fields = ['name', 'phone', 'email', 'source', 'otherSource', 'notes'];
    let valid = true;
    fields.forEach(f => { if (!validateField(f)) valid = false; });
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateDetails()) return;
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
      const res = await fetch(`${API_BASE}/api/public/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal });
      const json = await res.json();
      if (!res.ok) { setErrors({ submit: json.message || 'Something went wrong. Please try again.' }); return; }
      const payload_data = json.data || json;
      setIsDuplicate(!!payload_data.isDuplicate);
      setSubmitMessage(payload_data.message || 'Thank you! Your inquiry has been submitted.');
      setSubmitted(true);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setErrors({ submit: 'Network error. Please check your connection and try again.' });
    } finally {
      if (submitControllerRef.current === controller) setSubmitting(false);
    }
  };

  const inputBase = 'w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-[0.9375rem] text-white outline-none transition-all duration-200 placeholder:text-white/20';
  const inputClass = (f) => {
    if (errors[f]) return `${inputBase} border-red-500/50 bg-red-500/[0.06] focus:border-red-400 focus:ring-2 focus:ring-red-500/20`;
    if (focusedField === f) return `${inputBase} border-indigo-500/60 bg-white/[0.07] ring-2 ring-indigo-500/20`;
    return `${inputBase} border-white/[0.08] hover:border-white/[0.15] focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20`;
  };

  const handleReset = () => {
    setSubmitted(false);
    setForm({ name: '', email: '', phone: '', source: '', otherSource: '', courseId: '', intakeId: '', notes: '' });
    setStep(0);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#0a0a1a' }}>
        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)', animation: 'float 20s ease-in-out infinite' }} />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(147,51,234,0.16) 0%, transparent 70%)', animation: 'float 16s ease-in-out infinite reverse' }} />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:justify-between" style={{ animation: 'fadeUp 0.5s ease' }}>
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-lg shadow-indigo-500/25">
                U
              </div>
              <div>
                <div className="text-base font-extrabold text-white">UniCRM University</div>
                <div className="text-[0.7rem] text-white/30">Education Admission Management</div>
              </div>
            </div>
            {/* Mode toggle + Step bar */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              {!submitted && (
                <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.04] p-1">
                  <button
                    onClick={() => setMode('form')}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.65rem] font-semibold transition-all sm:px-3 sm:text-xs ${
                      mode === 'form' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'
                    }`}
                  >
                    <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Fill Form
                  </button>
                  <button
                    onClick={() => setMode('chat')}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.65rem] font-semibold transition-all sm:px-3 sm:text-xs ${
                      mode === 'chat' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'
                    }`}
                  >
                    <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chat with AI
                    <span className="rounded bg-indigo-500/30 px-1 py-0.5 text-[0.55rem] font-bold text-indigo-300 sm:text-[0.6rem]">NEW</span>
                  </button>
                </div>
              )}
              {!submitted && <StepBar step={step} onStepClick={(i) => { if (i < step) setStep(i); }} />}
            </div>
          </div>

          {/* Error alert */}
          {errors.submit && (
            <div className="mx-auto mb-6 max-w-2xl flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert" style={{ animation: 'fadeUp 0.25s ease' }}>
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {errors.submit}
            </div>
          )}

          {/* Steps */}
          {submitted ? (
            <SuccessStep isDuplicate={isDuplicate} message={submitMessage} onReset={handleReset} />
          ) : mode === 'chat' ? (
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
                <button onClick={() => setMode('form')} className="underline transition-colors hover:text-indigo-400">
                  Switch to form mode
                </button>
              </p>
            </div>
          ) : step === 0 ? (
            <>
              <CourseStep courses={courses} selectedId={form.courseId} onSelect={(id) => { setForm(prev => ({ ...prev, courseId: id })); if (id) setStep(1); }} onSkip={() => { setForm(prev => ({ ...prev, courseId: '' })); setStep(1); }} />
              <div className="mt-8 flex justify-center" style={{ animation: 'fadeUp 0.5s ease 0.3s both' }}>
                <button
                  onClick={() => setStep(1)}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-10 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30"
                >
                  <span className="relative flex items-center gap-2">
                    {form.courseId ? 'Continue with Selected Course' : 'Skip — Fill Details Instead'}
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              <DetailsStep
                form={form} errors={errors} focusedField={focusedField}
                inputClass={inputClass} onChange={handleChange}
                onFocus={setFocusedField} onBlur={() => setFocusedField('')}
                selectedCourse={selectedCourse}
                onClearCourse={() => setForm(prev => ({ ...prev, courseId: '' }))}
                courses={courses}
                intakes={intakes}
              />
              <div className="mt-8 flex items-center justify-center gap-4" style={{ animation: 'fadeUp 0.4s ease 0.2s both' }}>
                <button
                  onClick={() => setStep(0)}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/50 transition-all hover:bg-white/[0.08] hover:text-white"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-10 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="relative flex items-center gap-2">
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Inquiry
                        <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
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
