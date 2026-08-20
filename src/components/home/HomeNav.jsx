import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../../constants/app';

const NAV_LINKS = [
  { label: 'Programs', href: '#programs' },
  { label: 'Fees', href: '#fees' },
  { label: 'Admissions', href: '#admissions' },
  { label: 'Our Managers', href: '#team' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'FAQ', href: '#faq' },
];

export default function HomeNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 border-b transition-all duration-300 ${scrolled ? 'border-slate-200 bg-white/90 shadow-sm backdrop-blur-xl' : 'border-transparent bg-white/70 backdrop-blur-md'}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1E3A5F] font-['EB_Garamond',serif] text-sm font-bold text-white shadow-md">
            E
          </span>
          <span className="font-['EB_Garamond',serif] text-lg font-bold text-slate-900">{APP_NAME}</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-[0.8125rem] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/apply?mode=track" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50">
            Track Application
          </Link>
          <Link to="/apply" className="rounded-lg bg-gradient-to-r from-[#A16207] to-[#D97706] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition-all hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5">
            Apply Now
          </Link>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 lg:hidden" aria-label="Toggle menu">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {mobileOpen ? (
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 lg:hidden">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
              {l.label}
            </a>
          ))}
          <div className="mt-3 flex flex-col gap-2">
            <Link to="/apply?mode=track" onClick={() => setMobileOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-600">
              Track Application
            </Link>
            <Link to="/apply" onClick={() => setMobileOpen(false)} className="rounded-lg bg-gradient-to-r from-[#A16207] to-[#D97706] px-5 py-2.5 text-center text-sm font-bold text-white shadow-md">
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
