import { Link } from 'react-router-dom';
import { APP_NAME, APP_CONTACT } from '../../constants/app';

export default function HomeFooter() {
  return (
    <footer className="bg-[#1E3A5F]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#A16207] font-['EB_Garamond',serif] text-sm font-bold text-white shadow-md">E</span>
              <span className="font-['EB_Garamond',serif] text-lg font-bold text-white">{APP_NAME}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-300">Empowering students with quality education and career opportunities since 2010.</p>
            <div className="mt-5 space-y-2">
              <a href={`tel:${APP_CONTACT.phone}`} className="flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-[#D97706]">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M14.5 11.5V13.5C14.5 14.05 14.05 14.5 13.5 14.5C7.4 14.5 2.5 9.6 2.5 3.5C2.5 2.95 2.95 2.5 3.5 2.5H5.5L7 5.5L5.8 6.3C6.36 7.47 7.13 8.24 8.3 8.8L9.1 7.5L12.1 9V11.5H14.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
                {APP_CONTACT.phone}
              </a>
              <a href={`mailto:${APP_CONTACT.email}`} className="flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-[#D97706]">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" /><path d="M1 5L8 9L15 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                {APP_CONTACT.email}
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Quick Links</h4>
            <ul className="mt-4 space-y-2.5">
              {[{ l: 'Programs', h: '#programs' }, { l: 'Fee Structure', h: '#fees' }, { l: 'Admissions', h: '#admissions' }, { l: 'FAQ', h: '#faq' }].map((x) => (
                <li key={x.h}><a href={x.h} className="text-sm text-slate-300 transition-colors hover:text-[#D97706]">{x.l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Get Started</h4>
            <ul className="mt-4 space-y-2.5">
              {[{ l: 'Apply Online', h: '/apply' }, { l: 'Track Application', h: '/apply?mode=track' }, { l: 'Why Choose Us', h: '#why-us' }, { l: 'Our Team', h: '#team' }].map((x) => (
                <li key={x.h}>
                  {x.h.startsWith('/') ? (
                    <Link to={x.h} className="text-sm text-slate-300 transition-colors hover:text-[#D97706]">{x.l}</Link>
                  ) : (
                    <a href={x.h} className="text-sm text-slate-300 transition-colors hover:text-[#D97706]">{x.l}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Contact</h4>
            <ul className="mt-4 space-y-2.5">
              <li className="text-sm text-slate-300">{APP_CONTACT.address}</li>
              <li><a href={`tel:${APP_CONTACT.phone}`} className="text-sm text-slate-300 transition-colors hover:text-[#D97706]">{APP_CONTACT.phone}</a></li>
              <li><a href={`mailto:${APP_CONTACT.email}`} className="text-sm text-slate-300 transition-colors hover:text-[#D97706]">{APP_CONTACT.email}</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-slate-400 transition-colors hover:text-[#D97706]">Privacy Policy</a>
            <a href="#" className="text-xs text-slate-400 transition-colors hover:text-[#D97706]">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
