import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineArrowRight,
  HiOutlineDocumentText,
  HiOutlineMenu,
  HiOutlineSearch,
  HiOutlineX,
} from 'react-icons/hi';
import { APP_INITIAL, APP_UNIVERSITY_NAME } from '../../constants/app';
import { cx, GRADIENT_BTN } from './homeUi';

const LINKS = [
  { href: '#programs', label: 'Programs' },
  { href: '#fees', label: 'Fees' },
  { href: '#admissions', label: 'Admissions' },
  { href: '#team', label: 'Our Managers' },
  { href: '#why-us', label: 'Why Us' },
  { href: '#faq', label: 'FAQ' },
];

export default function HomeNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a1a]/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-3">
          <div
            className={cx(
              'flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br',
              'from-indigo-500 to-purple-600 text-base font-bold text-white shadow-lg shadow-indigo-500/25',
            )}
          >
            {APP_INITIAL}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold text-white">{APP_UNIVERSITY_NAME}</div>
            <div className="text-[0.65rem] text-white/30">Admissions Open 2026</div>
          </div>
        </a>

        <div className="hidden items-center gap-6 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[0.8125rem] font-semibold text-white/50 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2.5 lg:flex">
          <Link
            to="/apply?track=1"
            className={cx(
              'flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04]',
              'px-3.5 py-2 text-xs font-semibold text-white/60 transition-all hover:bg-white/[0.08] hover:text-white',
            )}
          >
            <HiOutlineSearch className="h-4 w-4" />
            Track Application
          </Link>
          <Link to="/apply" className={`flex items-center gap-1.5 px-4 py-2 ${GRADIENT_BTN}`}>
            Apply Now
            <HiOutlineArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-2 text-white/70 lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <HiOutlineX className="h-5 w-5" /> : <HiOutlineMenu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/[0.06] bg-[#0a0a1a]/95 px-4 pb-5 pt-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <Link
              to="/apply?track=1"
              onClick={() => setOpen(false)}
              className={cx(
                'flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.08]',
                'bg-white/[0.04] px-3.5 py-2.5 text-xs font-semibold text-white/60',
              )}
            >
              <HiOutlineDocumentText className="h-4 w-4" />
              Track Application
            </Link>
            <Link
              to="/apply"
              onClick={() => setOpen(false)}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 ${GRADIENT_BTN}`}
            >
              Apply Now
              <HiOutlineArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
