export const TOKENS = {
  navy: { 50: '#f0f4f8', 100: '#d9e2ec', 200: '#bcccdc', 300: '#9fb3c8', 400: '#829ab1', 500: '#627d98', 600: '#486581', 700: '#334e68', 800: '#243b53', 900: '#1E3A5F' },
  gold: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#D97706', 600: '#A16207', 700: '#92400e', 800: '#78350f', 900: '#451a03' },
  slate: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334055', 800: '#1E293B', 900: '#0F172A' },
};

export const DEPT_COLORS = {
  Engineering: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-600', accent: '#2563EB' },
  Management: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'bg-amber-100 text-amber-600', accent: '#D97706' },
  Science: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'bg-emerald-100 text-emerald-600', accent: '#059669' },
  Commerce: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: 'bg-purple-100 text-purple-600', accent: '#7C3AED' },
};

export const GRADIENT_BTN = 'rounded-xl bg-gradient-to-r from-[#A16207] to-[#D97706] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5';

export const OUTLINE_BTN = 'rounded-xl border-2 border-[#1E3A5F] px-6 py-3 text-sm font-bold text-[#1E3A5F] transition-all hover:bg-[#1E3A5F] hover:text-white hover:-translate-y-0.5';

export const CARD = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1';

export const SECTION_BG_ALT = 'bg-slate-50';

export const PILL = (colors = 'border-[#1E3A5F]/20 bg-[#1E3A5F]/5 text-[#1E3A5F]') =>
  `inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${colors}`;

export const PILL_GOLD = PILL('border-[#A16207]/20 bg-[#A16207]/5 text-[#A16207]');
export const PILL_NAVY = PILL('border-[#1E3A5F]/20 bg-[#1E3A5F]/5 text-[#1E3A5F]');

export const HOME_CSS = `
  html { scroll-behavior: smooth; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes countUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .home-animate { animation: fadeUp 0.5s ease both; }
  .home-animate-d1 { animation: fadeUp 0.5s 0.1s ease both; }
  .home-animate-d2 { animation: fadeUp 0.5s 0.2s ease both; }
  .home-animate-d3 { animation: fadeUp 0.5s 0.3s ease both; }
  .home-animate-d4 { animation: fadeUp 0.5s 0.4s ease both; }
  .home-animate-d5 { animation: fadeUp 0.5s 0.5s ease both; }
`;

export function Section({ id, children, className = '', alt = false }) {
  return (
    <section id={id} className={`relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24 ${alt ? SECTION_BG_ALT : ''} ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function SectionHeader({ pill, pillText, title, subtitle }) {
  return (
    <div className="mb-12 text-center lg:mb-16">
      <span className={pill || PILL_NAVY}>{pillText}</span>
      <h2 className="mt-4 font-['EB_Garamond',serif] text-3xl font-bold text-slate-900 lg:text-4xl xl:text-5xl">{title}</h2>
      {subtitle && <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500 lg:text-lg">{subtitle}</p>}
    </div>
  );
}
