import {
  HiOutlineBeaker,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineCurrencyDollar,
} from 'react-icons/hi';

export const DEPT_COLORS = {
  Engineering: {
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    border: 'border-blue-500/25',
    ring: 'ring-blue-500/30',
  },
  Management: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/25',
    ring: 'ring-amber-500/30',
  },
  Science: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/25',
    ring: 'ring-emerald-500/30',
  },
  Commerce: {
    bg: 'bg-purple-500/15',
    text: 'text-purple-400',
    border: 'border-purple-500/25',
    ring: 'ring-purple-500/30',
  },
};

export const DEPT_ICONS = {
  Engineering: <HiOutlineCog className="h-4 w-4" />,
  Management: <HiOutlineChartBar className="h-4 w-4" />,
  Science: <HiOutlineBeaker className="h-4 w-4" />,
  Commerce: <HiOutlineCurrencyDollar className="h-4 w-4" />,
};

export const formatFee = (n) => {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
};

export const formatFullFee = (n) => (n ? `₹${n.toLocaleString('en-IN')}` : '—');

export const formatDate = (iso, opts = { month: 'short', year: 'numeric' }) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', opts);
};

export const cx = (...parts) => parts.filter(Boolean).join(' ');

export const GRADIENT_BTN = [
  'rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600',
  'text-sm font-bold text-white shadow-lg shadow-indigo-500/25',
  'transition-all hover:shadow-xl hover:shadow-indigo-500/30',
].join(' ');

export const ICON_PILL = [
  'inline-flex items-center gap-2 rounded-full border px-4 py-1.5',
  'text-xs font-semibold uppercase tracking-widest',
].join(' ');

export const CARD_PANEL = [
  'rounded-2xl border border-white/[0.08] bg-white/[0.03]',
  'p-6 backdrop-blur-sm sm:p-7',
].join(' ');

export const HOME_CSS = `
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
  @keyframes pulse { 0%,100% { box-shadow:0 0 0 0 rgba(99,102,241,0.4); } 50% { box-shadow:0 0 0 12px rgba(99,102,241,0); } }
  @keyframes glow { 0%,100% { opacity:0.4; } 50% { opacity:0.8; } }
  @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
  .home-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
  .home-card:hover { transform:translateY(-4px); }
  html { scroll-behavior: smooth; }
`;

export function Section({ id, eyebrow, title, subtitle, children, className }) {
  return (
    <section id={id} className={`relative px-4 py-16 sm:px-6 lg:px-8 lg:py-20 ${className || ''}`}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          {eyebrow && (
            <div className={cx(ICON_PILL, 'mb-3 border-indigo-500/20 bg-indigo-500/10 text-indigo-400')}>
              {eyebrow}
            </div>
          )}
          <h2 className="mb-3 text-3xl font-extrabold text-white lg:text-4xl">{title}</h2>
          {subtitle && <p className="mx-auto max-w-2xl text-sm text-white/40 sm:text-base">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}
