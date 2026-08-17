import { Link } from 'react-router-dom';
import {
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
  HiOutlineChevronDown,
  HiOutlineUserGroup,
} from 'react-icons/hi';
import { APP_NAME, APP_TAGLINE } from '../../constants/app';
import { cx, GRADIENT_BTN, ICON_PILL } from './homeUi';

export default function HeroSection({ courses, intakes, completedLeads }) {
  const stats = [
    { label: 'Programs', value: String(courses.length || 0) },
    { label: 'Completed Admissions', value: completedLeads ? `${completedLeads}+` : '0' },
    { label: 'Open Intakes', value: String(intakes.length || 0) },
    { label: 'Placement Rate', value: '95%' },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(79,70,229,0.22) 0%, transparent 70%)',
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(147,51,234,0.18) 0%, transparent 70%)',
            animation: 'float 16s ease-in-out infinite reverse',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
        <div
          className={cx(ICON_PILL, 'mb-6 border-emerald-500/20 bg-emerald-500/10 text-emerald-400')}
          style={{ animation: 'fadeUp 0.5s ease both' }}
        >
          <HiOutlineCheckCircle className="h-3.5 w-3.5" />
          {APP_TAGLINE}
        </div>

        <h1
          className="mx-auto mb-6 max-w-4xl text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl"
          style={{ animation: 'fadeUp 0.6s ease 0.1s both' }}
        >
          Admissions Open 2026 —{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            B.Tech, BBA, MBA, B.Sc &amp; More
          </span>
        </h1>

        <p
          className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-white/45 sm:text-base lg:text-lg"
          style={{ animation: 'fadeUp 0.6s ease 0.2s both' }}
        >
          Apply online at {APP_NAME} in minutes — compare programs and fees, choose your intake, and get your
          application number instantly. Our top counselors will guide you through admission.
        </p>

        <div
          className="flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animation: 'fadeUp 0.6s ease 0.3s both' }}
        >
          <Link to="/apply" className={`group flex w-full items-center justify-center gap-2 px-8 py-4 text-base sm:w-auto ${GRADIENT_BTN}`}>
            Apply Now — It's Free
            <HiOutlineArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
          </Link>
          <a
            href="#programs"
            className={cx(
              'flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1]',
              'bg-white/[0.05] px-8 py-4 text-sm font-semibold text-white/70 transition-all',
              'hover:bg-white/[0.1] hover:text-white sm:w-auto',
            )}
          >
            Explore Programs
            <HiOutlineChevronDown className="h-4 w-4" />
          </a>
        </div>

        {/* Stats strip */}
        <div
          className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4"
          style={{ animation: 'fadeUp 0.6s ease 0.4s both' }}
        >
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-5 backdrop-blur-sm">
              <div className="text-2xl font-extrabold text-white lg:text-3xl">{s.value}</div>
              <div className="mt-1 flex items-center justify-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-widest text-white/30">
                <HiOutlineUserGroup className="h-3.5 w-3.5" />
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
