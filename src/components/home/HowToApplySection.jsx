import { Link } from 'react-router-dom';
import { HiOutlineArrowRight, HiOutlineCheckCircle, HiOutlineDocumentText } from 'react-icons/hi';
import { cx, GRADIENT_BTN, ICON_PILL } from './homeUi';

const STEPS = [
  {
    icon: <HiOutlineDocumentText className="h-5 w-5" />,
    step: '01',
    title: 'Submit Your Inquiry',
    text: 'Fill the online application form and choose your program and intake.',
  },
  {
    icon: <HiOutlineCheckCircle className="h-5 w-5" />,
    step: '02',
    title: 'Get Your Application Number',
    text: 'Receive your unique application number instantly on screen and via email/WhatsApp.',
  },
  {
    icon: <HiOutlineArrowRight className="h-5 w-5" />,
    step: '03',
    title: 'Track Your Admission',
    text: 'A counselor follows up within 24 hours. Track your status anytime online.',
  },
];

export default function HowToApplySection() {
  return (
    <section className="relative bg-white/[0.015] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <div className={cx(ICON_PILL, 'mb-3 border-indigo-500/20 bg-indigo-500/10 text-indigo-400')}>
            How to Apply
          </div>
          <h2 className="mb-3 text-3xl font-extrabold text-white lg:text-4xl">Apply in 3 Easy Steps</h2>
          <p className="mx-auto max-w-2xl text-sm text-white/40 sm:text-base">
            No documents needed to start — just fill the form and get your application number instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.step} className="relative rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                  {s.icon}
                </div>
                <span className="text-3xl font-extrabold text-white/[0.06]">{s.step}</span>
              </div>
              <h3 className="mb-1.5 text-sm font-bold text-white">{s.title}</h3>
              <p className="text-xs leading-relaxed text-white/40">{s.text}</p>
              {i < STEPS.length - 1 && (
                <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-white/10 md:block">
                  <HiOutlineArrowRight className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/apply" className={`group inline-flex items-center gap-2 px-8 py-4 ${GRADIENT_BTN}`}>
            Start Your Application
            <HiOutlineArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
