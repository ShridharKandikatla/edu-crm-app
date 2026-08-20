import { Link } from 'react-router-dom';
import { Section, SectionHeader, CARD, PILL_NAVY, DEPT_COLORS } from './design-system';

export default function ProgramsSection({ courses }) {
  if (!courses.length) return null;

  return (
    <Section id="programs">
      <SectionHeader pill={PILL_NAVY} pillText="Academic Programs" title="Explore Our Programs" subtitle="Choose from a wide range of undergraduate and postgraduate programs designed to prepare you for the future." />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c, i) => {
          const dept = DEPT_COLORS[c.department] || DEPT_COLORS.Engineering;
          const hasImage = !!c.image;
          return (
            <div key={c.id} className={`home-animate-d${Math.min(i + 1, 5)} ${CARD} group flex flex-col`}>
              <div className={`relative mb-4 flex h-40 items-center justify-center overflow-hidden rounded-xl ${dept.bg}`}>
                {hasImage ? (
                  <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <span className={`text-5xl font-['EB_Garamond',serif] font-bold ${dept.text} opacity-40`}>{c.name.charAt(0)}</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-3 left-3 font-['EB_Garamond',serif] text-sm font-bold text-white drop-shadow">{c.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex rounded-md border px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${dept.bg} ${dept.text} ${dept.border}`}>
                  {c.department}
                </span>
                <span className="text-xs text-slate-400">{c.duration}</span>
              </div>
              <h3 className="mt-3 font-['EB_Garamond',serif] text-xl font-bold text-slate-900">{c.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-['EB_Garamond',serif] text-2xl font-bold text-[#A16207]">
                  {Number(c.fee).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400">total fee</span>
              </div>
              {c.seats != null && (
                <p className="mt-2 text-xs text-slate-400">{c.seats} seats available</p>
              )}
              <div className="mt-auto pt-4">
                <Link to={`/apply?course=${c.id}`} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1E3A5F]/20 bg-[#1E3A5F]/5 px-4 py-2.5 text-sm font-bold text-[#1E3A5F] transition-all hover:bg-[#1E3A5F] hover:text-white">
                  Apply Now
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
