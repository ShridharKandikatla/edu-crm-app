import { Link } from 'react-router-dom';
import {
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
} from 'react-icons/hi';
import { cx, formatDate, GRADIENT_BTN, ICON_PILL } from './homeUi';

function isOpen(intake) {
  const now = new Date();
  const start = intake.startDate ? new Date(intake.startDate) : null;
  const end = intake.endDate ? new Date(intake.endDate) : null;
  if (start && Number.isNaN(start.getTime())) return false;
  if (end && Number.isNaN(end.getTime())) return false;
  return (!start || start <= now) && (!end || now <= end);
}

export default function IntakesSection({ intakes }) {
  return (
    <section id="admissions" className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <div className={cx(ICON_PILL, 'mb-3 border-sky-500/20 bg-sky-500/10 text-sky-400')}>
            <HiOutlineCalendar className="h-3.5 w-3.5" />
            Academic Intake
          </div>
          <h2 className="mb-3 text-3xl font-extrabold text-white lg:text-4xl">Admissions Open for These Intakes</h2>
          <p className="mx-auto max-w-2xl text-sm text-white/40 sm:text-base">
            Apply for the next available academic session. Pick your intake and get started today.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {intakes.map((intake, i) => {
            const open = isOpen(intake);
            return (
              <div
                key={intake.id}
                className="home-card flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6"
                style={{ animation: `fadeUp 0.4s ease ${i * 0.05}s both` }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className={cx(
                      'flex h-10 w-10 items-center justify-center rounded-xl',
                      open ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.06] text-white/25',
                    )}
                  >
                    <HiOutlineCalendar className="h-5 w-5" />
                  </div>
                  {open ? (
                    <span className="flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-widest text-emerald-400">
                      <HiOutlineCheckCircle className="h-3 w-3" />
                      Open
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-widest text-white/30">
                      Upcoming
                    </span>
                  )}
                </div>

                <h3 className="mb-1 text-base font-extrabold text-white">{intake.name}</h3>
                <p className="text-[0.7rem] text-white/35">
                  Available for all active programs · Apply online
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white/[0.04] px-3 py-2.5">
                    <div className="text-[0.6rem] font-semibold uppercase tracking-widest text-white/25">
                      Application Starts
                    </div>
                    <div className="mt-0.5 text-sm font-bold text-white">
                      {formatDate(intake.startDate, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] px-3 py-2.5">
                    <div className="text-[0.6rem] font-semibold uppercase tracking-widest text-white/25">
                      Application Ends
                    </div>
                    <div className="mt-0.5 text-sm font-bold text-white">
                      {formatDate(intake.endDate, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <Link
                  to={`/apply?intake=${intake.id}`}
                  className={`group/btn mt-5 flex items-center justify-center gap-2 px-4 py-2.5 text-xs ${GRADIENT_BTN}`}
                >
                  Apply for {intake.name}
                  <HiOutlineArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
              </div>
            );
          })}
        </div>

        {intakes.length === 0 && (
          <p className="mt-6 text-center text-sm text-white/30">New intakes will be announced soon.</p>
        )}
      </div>
    </section>
  );
}
