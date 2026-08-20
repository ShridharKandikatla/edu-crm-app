import { useState } from 'react';
import { Section, SectionHeader, CARD, PILL_NAVY } from './design-system';
import { APP_NAME } from '../../constants/app';

export const FAQS = [
  { q: 'How do I apply for admission?', a: 'Click the "Apply Now" button, fill in your basic details, select your preferred program and intake, and submit. You will receive an application number instantly via SMS and email.' },
  { q: 'What documents are required?', a: 'You need a valid ID proof (Aadhaar/Passport), 10th and 12th mark sheets, graduation certificates (for PG programs), passport-size photographs, and transfer certificate from your previous institution.' },
  { q: 'Are scholarships available?', a: 'Yes. We offer merit-based scholarships (based on entrance exam scores and academic record) and need-based financial aid covering up to 50% of tuition fees. You can check eligibility during the application process.' },
  { q: 'What is the fee payment schedule?', a: 'Fees can be paid in annual installments. The first installment is due at the time of admission confirmation. EMI options are available through our partnered financial institutions.' },
  { q: 'Can I track my admission status?', a: 'Yes. Use the "Track Application" option on our website by entering your application number and registered mobile number to see real-time updates on your admission status.' },
  { q: `What placements does ${APP_NAME} offer?`, a: 'We have a 94% placement record with top companies like TCS, Infosys, Wipro, HCL, Amazon, and Deloitte recruiting from our campus. Our dedicated placement cell provides training, mock interviews, and career counseling.' },
];

function FaqItem({ q, a, isOpen, onClick }) {
  return (
    <div className={`rounded-xl border transition-all ${isOpen ? 'border-[#1E3A5F]/20 bg-[#1E3A5F]/[0.03] shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
      <button onClick={onClick} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" aria-expanded={isOpen}>
        <span className={`text-sm font-semibold ${isOpen ? 'text-[#1E3A5F]' : 'text-slate-700'}`}>{q}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#1E3A5F]' : 'text-slate-400'}`}>
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-5 pb-4">
          <p className="text-sm leading-relaxed text-slate-500">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <Section id="faq">
      <SectionHeader pill={PILL_NAVY} pillText="FAQ" title="Frequently Asked Questions" subtitle="Everything you need to know about admissions, fees, and the application process." />
      <div className="mx-auto max-w-3xl space-y-3">
        {FAQS.map((f, i) => (
          <FaqItem key={i} q={f.q} a={f.a} isOpen={openIdx === i} onClick={() => setOpenIdx(openIdx === i ? null : i)} />
        ))}
      </div>
    </Section>
  );
}
