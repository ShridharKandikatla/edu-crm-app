import { Link } from 'react-router-dom';
import { Section, SectionHeader, CARD, DEPT_COLORS } from './design-system';

export default function PricingSection({ courses }) {
  if (!courses.length) return null;

  const grouped = courses.reduce((acc, c) => {
    (acc[c.department] = acc[c.department] || []).push(c);
    return acc;
  }, {});

  return (
    <Section id="fees" alt>
      <SectionHeader pillText="Fee Structure" title="Transparent Pricing" subtitle="No hidden charges. View the complete fee structure for all programs and plan your investment in education." />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(grouped).map(([dept, list]) => {
          const colors = DEPT_COLORS[dept] || DEPT_COLORS.Engineering;
          return (
            <div key={dept} className={`${CARD} border-l-4`} style={{ borderLeftColor: colors.accent }}>
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.icon}`}>
                  {dept.charAt(0)}
                </span>
                <div>
                  <h3 className="font-['EB_Garamond',serif] text-lg font-bold text-slate-900">{dept}</h3>
                  <p className="text-xs text-slate-400">{list.length} program{list.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {list.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-['EB_Garamond',serif] text-lg font-bold text-[#A16207]">
                        {Number(c.fee).toLocaleString('en-IN')}
                      </p>
                      <p className="text-[0.65rem] text-slate-400">total</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to={`/apply?dept=${encodeURIComponent(dept)}`} className="mt-5 flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50">
                Apply for {dept}
              </Link>
            </div>
          );
        })}
      </div>

    </Section>
  );
}
