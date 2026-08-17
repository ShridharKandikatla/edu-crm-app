import { Link } from 'react-router-dom';
import { HiOutlineBadgeCheck, HiOutlineArrowRight, HiOutlineCurrencyDollar } from 'react-icons/hi';
import { cx, DEPT_COLORS, DEPT_ICONS, formatFullFee, ICON_PILL } from './homeUi';

function durationYears(duration = '') {
  const m = String(duration).match(/(\d+)/);
  return m ? Number(m[1]) : 1;
}

export default function PricingSection({ courses }) {
  const departments = ['Engineering', 'Management', 'Science', 'Commerce']
    .map((d) => ({ name: d, items: courses.filter((c) => c.department === d) }))
    .filter((g) => g.items.length > 0);

  return (
    <section id="fees" className="relative bg-white/[0.015] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <div className={cx(ICON_PILL, 'mb-3 border-amber-500/20 bg-amber-500/10 text-amber-400')}>
            <HiOutlineCurrencyDollar className="h-3.5 w-3.5" />
            Fee Structure 2026
          </div>
          <h2 className="mb-3 text-3xl font-extrabold text-white lg:text-4xl">Programs &amp; Fee Structure</h2>
          <p className="mx-auto max-w-2xl text-sm text-white/40 sm:text-base">
            Transparent fees for every program — see the total fee and annual installments before you apply.
          </p>
        </div>

        <div className="space-y-8">
          {departments.map((group) => {
            const dc = DEPT_COLORS[group.name] || {};
            return (
              <div key={group.name}>
                <div className="mb-4 flex items-center gap-2.5">
                  <span
                    className={cx(
                      'flex h-8 w-8 items-center justify-center rounded-lg border',
                      dc.bg || '',
                      dc.text || '',
                      dc.border || '',
                    )}
                  >
                    {DEPT_ICONS[group.name]}
                  </span>
                  <h3 className="text-lg font-bold text-white">{group.name} Programs</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((course) => {
                    const years = Math.max(1, durationYears(course.duration));
                    return (
                      <div
                        key={course.id}
                        className="home-card rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5"
                      >
                        <div className="text-sm font-bold text-white">{course.name}</div>
                        <div className="mt-1 text-[0.7rem] text-white/35">
                          {course.duration} · Full program
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="rounded-xl bg-white/[0.04] px-3 py-2.5">
                            <div className="text-[0.6rem] font-semibold uppercase tracking-widest text-white/25">
                              Total Fee
                            </div>
                            <div className="mt-0.5 text-base font-extrabold text-indigo-400">
                              {formatFullFee(course.fee)}
                            </div>
                          </div>
                          <div className="rounded-xl bg-white/[0.04] px-3 py-2.5">
                            <div className="text-[0.6rem] font-semibold uppercase tracking-widest text-white/25">
                              Per Year
                            </div>
                            <div className="mt-0.5 text-base font-extrabold text-white">
                              {formatFullFee(Math.round(course.fee / years))}
                            </div>
                          </div>
                        </div>
                        <Link
                          to={`/apply?course=${course.id}`}
                          className={cx(
                            'group/btn mt-4 flex items-center justify-center gap-2 rounded-xl',
                            'border border-white/[0.1] bg-white/[0.05] px-4 py-2.5',
                            'text-xs font-bold text-white/60 transition-all hover:bg-white/[0.1] hover:text-white',
                          )}
                        >
                          Apply for This Program
                          <HiOutlineArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className={cx(
            'mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border',
            'border-emerald-500/20 bg-emerald-500/[0.06] px-6 py-5 sm:flex-row',
          )}
        >
          <div className="flex items-start gap-3 text-left">
            <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <HiOutlineBadgeCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-bold text-white">Scholarships &amp; Easy Installments Available</div>
              <div className="mt-0.5 text-xs text-white/40">
                Merit-based scholarships and flexible fee payment plans for eligible students.
              </div>
            </div>
          </div>
          <Link
            to="/apply"
            className={cx(
              'group/btn flex flex-shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600',
              'px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25',
            )}
          >
            Check Eligibility
            <HiOutlineArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
