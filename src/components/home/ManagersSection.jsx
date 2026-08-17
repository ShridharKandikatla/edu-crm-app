import {
  HiOutlineBadgeCheck,
  HiOutlineStar,
  HiOutlineUserGroup,
} from 'react-icons/hi';
import { cx, ICON_PILL } from './homeUi';

function privacyName(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Team Member';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function initials(fullName = '') {
  return fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

function PerformerCard({ person, rank, accent }) {
  const accentBg = accent === 'tele' ? 'bg-purple-500/15 text-purple-400' : 'bg-indigo-500/15 text-indigo-400';
  const gradient = accent === 'tele'
    ? 'from-purple-500 to-fuchsia-600'
    : 'from-indigo-500 to-purple-600';

  return (
    <div
      className={cx(
        'home-card flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5',
      )}
    >
      <div className="relative flex-shrink-0">
        <div
          className={cx(
            'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-extrabold text-white',
            gradient,
          )}
        >
          {initials(person.name)}
        </div>
        <div className={cx('absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full', accentBg)}>
          <HiOutlineStar className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate text-sm font-bold text-white">{privacyName(person.name)}</div>
          {rank === 1 && <HiOutlineBadgeCheck className="h-4 w-4 flex-shrink-0 text-emerald-400" />}
        </div>
        <div className="mt-0.5 text-[0.7rem] text-white/35">Top Performer · {person.converted} Completed Admissions</div>
      </div>
      <div
        className={cx(
          'flex-shrink-0 rounded-xl px-3 py-1.5 text-center',
          accent === 'tele' ? 'bg-purple-500/10' : 'bg-indigo-500/10',
        )}
      >
        <div className={cx('text-lg font-extrabold', accent === 'tele' ? 'text-purple-300' : 'text-indigo-300')}>
          #{rank}
        </div>
        <div className="text-[0.55rem] font-bold uppercase tracking-widest text-white/30">Rank</div>
      </div>
    </div>
  );
}

export default function ManagersSection({ topCounselors, topTelecallers, completedLeads }) {
  return (
    <section id="team" className="relative bg-white/[0.015] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <div className={cx(ICON_PILL, 'mb-3 border-purple-500/20 bg-purple-500/10 text-purple-400')}>
            <HiOutlineUserGroup className="h-3.5 w-3.5" />
            Our Managers
          </div>
          <h2 className="mb-3 text-3xl font-extrabold text-white lg:text-4xl">Meet Our Top Performers</h2>
          <p className="mx-auto max-w-2xl text-sm text-white/40 sm:text-base">
            {completedLeads > 0
              ? `${completedLeads}+ completed admissions powered by our top counselors and telecallers.`
              : 'Our dedicated counselors and telecallers guide every applicant through admission.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                <HiOutlineStar className="h-4 w-4" />
              </span>
              <h3 className="text-base font-bold text-white">Top Counselors</h3>
            </div>
            <div className="space-y-3">
              {topCounselors.map((p, i) => (
                <PerformerCard key={p.id} person={p} rank={i + 1} accent="counselor" />
              ))}
              {topCounselors.length === 0 && (
                <p className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-center text-sm text-white/30">
                  Counselor rankings will appear here soon.
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400">
                <HiOutlineStar className="h-4 w-4" />
              </span>
              <h3 className="text-base font-bold text-white">Top Telecallers</h3>
            </div>
            <div className="space-y-3">
              {topTelecallers.map((p, i) => (
                <PerformerCard key={p.id} person={p} rank={i + 1} accent="tele" />
              ))}
              {topTelecallers.length === 0 && (
                <p className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-center text-sm text-white/30">
                  Telecaller rankings will appear here soon.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
