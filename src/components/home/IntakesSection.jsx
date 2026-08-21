import { Link } from 'react-router-dom';
import { Section, SectionHeader, PILL_NAVY } from './design-system';

function getIntakeStatus(startDate, endDate) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now >= start && now <= end) return 'OPEN';
  if (now < start) return 'UPCOMING';
  return 'CLOSED';
}

export default function IntakesSection({ intakes }) {
  if (!intakes.length) return null;

  return (
    <Section id="admissions">
      <SectionHeader pill={PILL_NAVY} pillText="Admission Intakes" title="Choose Your Intake" subtitle="Multiple admission cycles throughout the year. Pick the one that fits your timeline." />
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 hidden w-px bg-slate-200 lg:block" />
        <div className="grid gap-6 lg:gap-8">
          {intakes.map((intake, i) => {
            const status = getIntakeStatus(intake.startDate, intake.endDate);
            const isOpen = status === 'OPEN';
            return (
              <div key={intake.id} className={`home-animate-d${Math.min(i + 1, 5)} relative flex items-start gap-6 lg:gap-10`}>
                <div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${isOpen ? 'border-[#A16207] bg-[#A16207]/10' : 'border-slate-200 bg-white'}`}>
                  <span className={`font-['EB_Garamond',serif] text-lg font-bold ${isOpen ? 'text-[#A16207]' : 'text-slate-400'}`}>{i + 1}</span>
                </div>
                <div className={`flex-1 rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md ${isOpen ? 'border-[#A16207]/20 bg-white' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-['EB_Garamond',serif] text-xl font-bold text-slate-900">{intake.name}</h3>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${isOpen ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-500'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {isOpen ? 'Open' : status === 'UPCOMING' ? 'Upcoming' : 'Closed'}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-4 py-2.5">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-400"><rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" /><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                      <div>
                        <p className="text-[0.65rem] font-medium uppercase text-slate-400">Starts</p>
                        <p className="text-sm font-semibold text-slate-700">{new Date(intake.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-4 py-2.5">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-400"><rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" /><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                      <div>
                        <p className="text-[0.65rem] font-medium uppercase text-slate-400">Ends</p>
                        <p className="text-sm font-semibold text-slate-700">{new Date(intake.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                  <Link to={`/apply?intake=${intake.id}`} className={`mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${isOpen || status === 'UPCOMING' ? 'bg-gradient-to-r from-[#A16207] to-[#D97706] text-white shadow-md shadow-amber-500/20 hover:shadow-lg hover:-translate-y-0.5' : 'border border-slate-200 text-slate-400'}`}>
                    {isOpen ? 'Apply Now' : status === 'UPCOMING' ? 'Apply Now' : 'Closed'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
