import { Link } from 'react-router-dom';
import {
  HiOutlineArrowRight,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineSearch,
} from 'react-icons/hi';
import {
  APP_CONTACT,
  APP_INITIAL,
  APP_NAME,
  APP_UNIVERSITY_NAME,
} from '../../constants/app';
import { cx } from './homeUi';
import { HiOutlineMapPin } from 'react-icons/hi2';

export default function HomeFooter() {
  return (
    <footer id="contact" className="relative border-t border-white/[0.06] bg-black/20 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <div
              className={cx(
                'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br',
                'from-indigo-500 to-purple-600 text-base font-bold text-white',
              )}
            >
              {APP_INITIAL}
            </div>
            <div className="text-base font-extrabold text-white">{APP_UNIVERSITY_NAME}</div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/40">
            {APP_NAME} makes admission easy for students and parents — compare programs and fees, apply online for
            B.Tech, BBA, MBA, B.Sc and B.Com admissions 2026, and track your application status anytime.
          </p>
          <div className="mt-5 space-y-2.5 text-sm text-white/40">
            <p className="flex items-center gap-2.5">
              <HiOutlineMapPin className="h-4 w-4 flex-shrink-0 text-indigo-400" />
              {APP_CONTACT.address}
            </p>
            <p className="flex items-center gap-2.5">
              <HiOutlinePhone className="h-4 w-4 flex-shrink-0 text-indigo-400" />
              {APP_CONTACT.phone}
            </p>
            <p className="flex items-center gap-2.5">
              <HiOutlineMail className="h-4 w-4 flex-shrink-0 text-indigo-400" />
              {APP_CONTACT.email}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-4 text-xs font-bold uppercase tracking-widest text-white/30">Quick Links</div>
          <ul className="space-y-2.5 text-sm text-white/45">
            {[
              { label: 'Programs & Fees', href: '#programs' },
              { label: 'Fee Structure', href: '#fees' },
              { label: 'Admission Intakes', href: '#admissions' },
              { label: 'Our Managers', href: '#team' },
              { label: 'FAQs', href: '#faq' },
            ].map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition-colors hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-4 text-xs font-bold uppercase tracking-widest text-white/30">Get Started</div>
          <ul className="space-y-2.5 text-sm text-white/45">
            <li>
              <Link to="/apply" className="flex items-center gap-1.5 transition-colors hover:text-white">
                Apply for Admission 2026
                <HiOutlineArrowRight className="h-3.5 w-3.5" />
              </Link>
            </li>
            <li>
              <Link to="/apply?mode=track" className="flex items-center gap-1.5 transition-colors hover:text-white">
                <HiOutlineSearch className="h-3.5 w-3.5" />
                Track Your Application
              </Link>
            </li>
            <li>
              <Link to="/login" className="transition-colors hover:text-white">
                Staff / Admin Login
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-2 border-t border-white/[0.06] pt-6 text-xs text-white/25 sm:flex-row">
        <span>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</span>
        <span>Education Admission Management</span>
      </div>
    </footer>
  );
}
