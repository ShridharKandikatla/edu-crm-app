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
              <Link to={`/apply?course=${list[0].id}`} className="mt-5 flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50">
                Apply for {dept}
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-12 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center sm:p-8">
        <h3 className="font-['EB_Garamond',serif] text-xl font-bold text-emerald-800">Scholarships Available</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm text-emerald-600">Merit-based and need-based scholarships covering up to 50% of tuition fees. Check eligibility during the application process.</p>
        <Link to="/apply" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#A16207] to-[#D97706] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5">
          Check Eligibility
        </Link>
      </div>
    </Section>
  );
}
