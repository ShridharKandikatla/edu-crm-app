import { Section, SectionHeader, CARD, PILL_NAVY } from './design-system';

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : parts[0].substring(0, 2).toUpperCase();
}

function maskName(name) {
  if (!name) return '***';
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return parts[0].substring(0, 1) + '***';
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function ManagerCard({ name, rank, accent = 'navy' }) {
  const isNavy = accent === 'navy';
  return (
    <div className={`${CARD} flex items-center gap-4`}>
      <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-['EB_Garamond',serif] text-sm font-bold text-white shadow-md ${isNavy ? 'bg-gradient-to-br from-[#1E3A5F] to-[#2563EB]' : 'bg-gradient-to-br from-[#A16207] to-[#D97706]'}`}>
        {getInitials(name)}
        {rank <= 3 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[0.6rem] font-bold shadow-sm" style={{ color: isNavy ? '#1E3A5F' : '#A16207' }}>
            {rank}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{maskName(name)}</p>
        <p className="text-xs text-slate-400">Rank #{rank}</p>
      </div>
    </div>
  );
}

export default function ManagersSection({ topCounselors, topTelecallers, completedLeads }) {
  const hasData = (topCounselors && topCounselors.length) || (topTelecallers && topTelecallers.length);
  if (!hasData) return null;

  return (
    <Section id="team" alt>
      <SectionHeader pill={PILL_NAVY} pillText="Our Top Performers" title="Meet Our Managers" subtitle="Recognizing the dedication of our counseling and telecalling teams who helped students achieve their dreams." />
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 flex items-center gap-2 font-['EB_Garamond',serif] text-lg font-bold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E3A5F]/10 text-sm text-[#1E3A5F]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L10 5.5L15 6.2L11.5 9.6L12.4 14.5L8 12.2L3.6 14.5L4.5 9.6L1 6.2L6 5.5L8 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
            </span>
            Top Counselors
          </h3>
          <div className="space-y-3">
            {topCounselors.map((t, i) => (
              <ManagerCard key={t.name || i} name={t.name} rank={i + 1} accent="navy" />
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-4 flex items-center gap-2 font-['EB_Garamond',serif] text-lg font-bold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#A16207]/10 text-sm text-[#A16207]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 11.5V13.5C14 14.05 13.55 14.5 13 14.5C7.48 14.5 3 10.02 3 4.5C3 3.95 3.45 3.5 4 3.5H6L7.5 6.5L6.2 7.3C6.76 8.47 7.53 9.24 8.7 9.8L9.5 8.5L12.5 10V11.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
            </span>
            Top Telecallers
          </h3>
          <div className="space-y-3">
            {topTelecallers.map((t, i) => (
              <ManagerCard key={t.name || i} name={t.name} rank={i + 1} accent="gold" />
            ))}
          </div>
        </div>
      </div>
      {completedLeads > 0 && (
        <div className="mt-10 rounded-2xl border border-[#1E3A5F]/10 bg-[#1E3A5F]/5 p-6 text-center">
          <p className="font-['EB_Garamond',serif] text-3xl font-bold text-[#1E3A5F]">{completedLeads}+</p>
          <p className="mt-1 text-sm font-medium text-slate-500">Successful admissions facilitated by our team</p>
        </div>
      )}
    </Section>
  );
}
