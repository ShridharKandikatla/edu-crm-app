import { Link } from 'react-router-dom';
import { Section, SectionHeader, PILL_NAVY } from './design-system';
import { APP_NAME } from '../../constants/app';

const STEPS = [
  { num: '01', title: 'Submit Inquiry', desc: 'Fill out a quick online form with your basic details and program preference.' },
  { num: '02', title: 'Get Application Number', desc: 'Receive your unique application number instantly via SMS and email.' },
  { num: '03', title: 'Track Admission', desc: 'Monitor your admission status in real-time through your personalized dashboard.' },
];

export default function HowToApplySection() {
  return (
    <Section id="how-to-apply" alt>
      <SectionHeader pill={PILL_NAVY} pillText="How to Apply" title="3 Simple Steps" subtitle={`Getting started at ${APP_NAME} is quick and hassle-free. Here's how to begin your journey.`} />
      <div className="grid gap-6 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.num} className={`home-animate-d${i + 1} relative`}>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <span className="font-['EB_Garamond',serif] text-4xl font-bold text-slate-200">{s.num}</span>
              <h3 className="mt-3 font-['EB_Garamond',serif] text-xl font-bold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.desc}</p>
            </div>
            {i < 2 && (
              <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 text-slate-300 sm:block lg:hidden">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link to="/apply" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#A16207] to-[#D97706] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5">
          Start Your Application
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
      </div>
    </Section>
  );
}
