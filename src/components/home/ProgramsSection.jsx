import { Link } from 'react-router-dom';
import {
  HiOutlineArrowRight,
  HiOutlineBookOpen,
  HiOutlineClock,
  HiOutlineUserGroup,
} from 'react-icons/hi';
import { cx, DEPT_COLORS, DEPT_ICONS, formatFee, ICON_PILL } from './homeUi';

export default function ProgramsSection({ courses }) {
  return (
    <section id="programs" className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <div className={cx(ICON_PILL, 'mb-3 border-indigo-500/20 bg-indigo-500/10 text-indigo-400')}>
            <HiOutlineBookOpen className="h-3.5 w-3.5" />
            Explore Programs
          </div>
          <h2 className="mb-3 text-3xl font-extrabold text-white lg:text-4xl">
            Our Programs for{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Admission 2026
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-white/40 sm:text-base">
            Browse engineering, management, science and commerce programs with duration, fee structure and seat
            availability.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, i) => {
            const dc = DEPT_COLORS[course.department] || {};
            return (
              <div
                key={course.id}
                className="home-card group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]"
                style={{ animation: `fadeUp 0.4s ease ${i * 0.04}s both` }}
              >
                <div className="relative h-44 overflow-hidden">
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={`${course.name} at ${course.department}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/[0.06] to-transparent">
                      <HiOutlineBookOpen className="h-14 w-14 text-white/[0.06]" strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-transparent to-transparent" />
                  <div className="absolute right-3 top-3 rounded-lg bg-black/50 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
                    ₹{formatFee(course.fee)}
                  </div>
                </div>

                <div className="p-5">
                  <div
                    className={cx(
                      'mb-2 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5',
                      'text-[0.65rem] font-bold uppercase tracking-wider',
                      dc.bg || '',
                      dc.text || '',
                      dc.border || '',
                    )}
                  >
                    {DEPT_ICONS[course.department]}
                    {course.department}
                  </div>
                  <h3 className="mb-2 text-base font-bold leading-tight text-white">{course.name}</h3>
                  <div className="flex items-center gap-3 text-[0.7rem] text-white/35">
                    <span className="flex items-center gap-1">
                      <HiOutlineClock className="h-3 w-3" />
                      {course.duration}
                    </span>
                    {course.seats != null && (
                      <span className="flex items-center gap-1">
                        <HiOutlineUserGroup className="h-3 w-3" />
                        {course.seats} seats
                      </span>
                    )}
                  </div>
                  <div className="mt-4 border-t border-white/[0.06] pt-4">
                    <Link
                      to={`/apply?course=${course.id}`}
                      className={cx(
                        'group/btn flex w-full items-center justify-center gap-2 rounded-xl',
                        'border border-indigo-500/30 bg-indigo-500/10 px-4 py-2.5',
                        'text-xs font-bold text-indigo-300 transition-all hover:bg-indigo-500/20 hover:text-white',
                      )}
                    >
                      Apply Now
                      <HiOutlineArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {courses.length === 0 && (
          <p className="mt-6 text-center text-sm text-white/30">Programs are being updated. Check back soon.</p>
        )}
      </div>
    </section>
  );
}
