import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Section } from './design-system';
import { APP_NAME } from '../../constants/app';

function isOpen(i) {
  const now = new Date();
  return now >= new Date(i.startDate) && now <= new Date(i.endDate);
}

function AnimatedCounter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 1200;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, end]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function HeroSection({ courses, intakes, completedLeads }) {
  return (
    <Section id="top" className="overflow-hidden bg-gradient-to-b from-[#f0f4f8] to-white pt-16 lg:pt-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#A16207]/5 blur-3xl" />
        <div className="absolute -left-32 top-1/2 h-[400px] w-[400px] rounded-full bg-[#1E3A5F]/5 blur-3xl" />
      </div>

      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="home-animate">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#A16207]/20 bg-[#A16207]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#A16207]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#A16207]" />
            Admissions Open 2026
          </span>

          <h1 className="mt-6 font-['EB_Garamond',serif] text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl xl:text-7xl">
            Shape Your Future
            <br />
            at <span className="text-[#1E3A5F]">{APP_NAME}</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-500 lg:text-lg">
            Explore {courses.length || '10+'} programs across Engineering, Management, Science & Commerce.
            Apply online, track your admission, and secure your seat today.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/apply" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#A16207] to-[#D97706] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5">
              Apply Now
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
            <a href="#programs" className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1E3A5F] px-7 py-3.5 text-sm font-bold text-[#1E3A5F] transition-all hover:bg-[#1E3A5F] hover:text-white hover:-translate-y-0.5">
              Explore Programs
            </a>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <div className="absolute -left-4 -top-4 rounded-2xl bg-[#A16207]/10 px-4 py-2 font-['EB_Garamond',serif] text-sm font-bold text-[#A16207] shadow-sm">
              #1 Ranked University
            </div>
            <div className="space-y-4">
              {[
                { label: 'Programs Available', value: courses.length || '10+' },
                { label: 'Intakes Open', value: intakes.filter(isOpen).length || '3' },
                { label: 'Students Enrolled', value: `${completedLeads || '500'}+` },
                { label: 'Placement Rate', value: '94%' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-5 py-3.5">
                  <span className="text-sm font-medium text-slate-500">{s.label}</span>
                  <span className="font-['EB_Garamond',serif] text-xl font-bold text-[#1E3A5F]">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-2xl border border-[#A16207]/10 bg-[#A16207]/5" />
          <div className="absolute -left-6 -top-6 h-24 w-24 rounded-2xl border border-[#1E3A5F]/10 bg-[#1E3A5F]/5" />
        </div>
      </div>

      <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:mt-20">
        {[
          { label: 'Programs', value: courses.length || 10, suffix: '+' },
          { label: 'Completed Admissions', value: completedLeads || 500, suffix: '+' },
          { label: 'Open Intakes', value: intakes.filter(isOpen).length || 3, suffix: '' },
          { label: 'Placement Rate', value: 94, suffix: '%' },
        ].map((s, i) => (
          <div key={s.label} className={`home-animate-d${i + 1} rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm`}>
            <div className="font-['EB_Garamond',serif] text-3xl font-bold text-[#1E3A5F] lg:text-4xl">
              <AnimatedCounter end={s.value} suffix={s.suffix} />
            </div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
