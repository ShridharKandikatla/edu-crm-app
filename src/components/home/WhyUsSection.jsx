import { Section, SectionHeader, CARD, PILL_NAVY } from './design-system';
import { APP_NAME } from '../../constants/app';

const FEATURES = [
  { title: 'Placement Support', desc: '94% placement rate with top recruiters visiting campus every year.', icon: 'M2 12L6 8L10 12L14 4', color: 'bg-[#A16207]/10 text-[#A16207]' },
  { title: 'Expert Faculty', desc: 'Learn from industry veterans and PhD scholars with real-world experience.', icon: 'M8 2L10 6H14L11 9L12 13L8 10.5L4 13L5 9L2 6H6L8 2Z', color: 'bg-[#1E3A5F]/10 text-[#1E3A5F]' },
  { title: 'Modern Labs', desc: 'State-of-the-art laboratories equipped with the latest technology.', icon: 'M3 3H13V13H3V3ZM7 7V11M5 9H9', color: 'bg-emerald-100 text-emerald-700' },
  { title: 'Scholarships', desc: 'Merit-based and need-based scholarships covering up to 50% tuition.', icon: 'M8 1L10 5.5L15 6.2L11.5 9.6L12.4 14.5L8 12.2L3.6 14.5L4.5 9.6L1 6.2L6 5.5L8 1Z', color: 'bg-amber-100 text-amber-700' },
  { title: 'Campus Hostel', desc: 'Comfortable on-campus accommodation with 24/7 security and Wi-Fi.', icon: 'M2 12H14V14H2V12ZM3 12V6L8 2L13 6V12M5 12V8H7V12M9 12V8H11V12', color: 'bg-purple-100 text-purple-700' },
  { title: 'Global Exposure', desc: 'International exchange programs with 50+ partner universities worldwide.', icon: 'M8 1C4.13 1 1 4.13 1 8C1 11.87 4.13 15 8 15C11.87 15 15 11.87 15 8C15 4.13 11.87 1 8 1ZM1 8H15M8 1C5.5 3.5 4.5 6 4.5 8C4.5 10 5.5 12.5 8 15M8 1C10.5 3.5 11.5 6 11.5 8C11.5 10 10.5 12.5 8 15', color: 'bg-sky-100 text-sky-700' },
];

export default function WhyUsSection() {
  return (
    <Section id="why-us">
      <SectionHeader pill={PILL_NAVY} pillText="Why Choose Us" title={`Why ${APP_NAME}?`} subtitle="We don't just offer degrees — we build careers. Here's what sets us apart." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <div key={f.title} className={`home-animate-d${Math.min(i + 1, 5)} ${CARD} group`}>
            <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.color}`}>
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d={f.icon} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <h3 className="mt-4 font-['EB_Garamond',serif] text-xl font-bold text-slate-900">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
