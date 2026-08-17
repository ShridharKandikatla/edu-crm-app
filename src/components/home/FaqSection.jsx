import { useState } from 'react';
import { HiOutlineChevronDown, HiOutlineQuestionMarkCircle } from 'react-icons/hi';
import { cx, ICON_PILL } from './homeUi';
import { APP_UNIVERSITY_NAME } from '../../constants/app';

export const FAQS = [
  {
    q: 'How do I apply for admission 2026?',
    a: 'Fill the online application form on the Apply page, choose your program and intake, and submit. You will receive your application number instantly, and a counselor will call you within 24 hours.',
  },
  {
    q: 'What programs are available?',
    a: 'We offer engineering (B.Tech), management (BBA, MBA), science (B.Sc) and commerce (B.Com) programs. You can compare durations and fee structure for every program on this page.',
  },
  {
    q: 'How are fees structured? Can I pay in installments?',
    a: 'Fees are shown as the full program total and a per-year figure. Flexible installment plans and merit-based scholarships are available — ask your counselor for details after applying.',
  },
  {
    q: 'Do I need documents to apply online?',
    a: 'No. You only need your name, phone number and the program you are interested in. Documents like marksheets and ID proof are collected after your application is reviewed.',
  },
  {
    q: 'How do I track my application status?',
    a: 'Use the Track Application button with your application number and the phone number you applied with. Your status updates from Inquiry to Applied, Offered and Enrolled.',
  },
  {
    q: 'How soon will the admission team contact me?',
    a: 'Our counselors reach out within 24 hours to guide you through eligibility, fee payment and document submission.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <div className={cx(ICON_PILL, 'mb-3 border-amber-500/20 bg-amber-500/10 text-amber-400')}>
            <HiOutlineQuestionMarkCircle className="h-3.5 w-3.5" />
            Frequently Asked Questions
          </div>
          <h2 className="mb-3 text-3xl font-extrabold text-white lg:text-4xl">Admission FAQs</h2>
          <p className="mx-auto max-w-2xl text-sm text-white/40 sm:text-base">
            Quick answers about applying, fees, and tracking your admission at {APP_UNIVERSITY_NAME}.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const open = openIndex === i;
            return (
              <div
                key={f.q}
                className={cx(
                  'overflow-hidden rounded-2xl border transition-colors',
                  open ? 'border-indigo-500/25 bg-indigo-500/[0.06]' : 'border-white/[0.07] bg-white/[0.03]',
                )}
              >
                <button
                  onClick={() => setOpenIndex(open ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={open}
                >
                  <span className="text-sm font-bold text-white">{f.q}</span>
                  <HiOutlineChevronDown
                    className={cx(
                      'h-4 w-4 flex-shrink-0 text-white/40 transition-transform duration-300',
                      open && 'rotate-180 text-indigo-400',
                    )}
                  />
                </button>
                {open && (
                  <div className="px-5 pb-5">
                    <p className="text-sm leading-relaxed text-white/50">{f.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
