import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useSeo } from '../utils/seo';
import {
  APP_DESCRIPTION,
  APP_KEYWORDS,
  APP_NAME,
  APP_UNIVERSITY_NAME,
  APP_CONTACT,
} from '../constants/app';
import HomeNav from '../components/home/HomeNav';
import HeroSection from '../components/home/HeroSection';
import ProgramsSection from '../components/home/ProgramsSection';
import PricingSection from '../components/home/PricingSection';
import IntakesSection from '../components/home/IntakesSection';
import ManagersSection from '../components/home/ManagersSection';
import WhyUsSection from '../components/home/WhyUsSection';
import HowToApplySection from '../components/home/HowToApplySection';
import FaqSection, { FAQS } from '../components/home/FaqSection';
import HomeFooter from '../components/home/HomeFooter';
import { HOME_CSS } from '../components/home/homeUi';

const ORIGIN = typeof window !== 'undefined' ? window.location.origin : '';

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [intakes, setIntakes] = useState([]);
  const [team, setTeam] = useState({ completedLeads: 0, topCounselors: [], topTelecallers: [] });
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      api.public.getCourses(),
      api.public.getIntakes(),
      api.public.getTeam(),
    ]).then(([coursesRes, intakesRes, teamRes]) => {
      if (cancelled) return;
      if (coursesRes.status === 'fulfilled') {
        setCourses(coursesRes.value?.data?.courses || []);
      }
      if (intakesRes.status === 'fulfilled') {
        setIntakes(intakesRes.value?.data?.intakes || []);
      }
      if (teamRes.status === 'fulfilled') {
        const d = teamRes.value?.data || {};
        setTeam({
          completedLeads: d.completedLeads || 0,
          topCounselors: d.topCounselors || [],
          topTelecallers: d.topTelecallers || [],
        });
      }
      if (coursesRes.status === 'rejected' && intakesRes.status === 'rejected' && teamRes.status === 'rejected') {
        setError('Some content could not be loaded. Please refresh the page.');
      }
    });
    return () => { cancelled = true; };
  }, []);

  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollegeOrUniversity',
        name: APP_UNIVERSITY_NAME,
        url: ORIGIN,
        description: APP_DESCRIPTION,
        address: { '@type': 'PostalAddress', streetAddress: APP_CONTACT.address },
        telephone: APP_CONTACT.phone,
        email: APP_CONTACT.email,
      },
      ...courses.map((c) => ({
        '@type': 'Course',
        name: c.name,
        description: `${c.name} (${c.department}) — ${c.duration} program at ${APP_UNIVERSITY_NAME}. Apply online for admission 2026.`,
        provider: { '@type': 'CollegeOrUniversity', name: APP_UNIVERSITY_NAME, url: ORIGIN },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: c.fee,
          url: `${ORIGIN}/apply?course=${c.id}`,
          availability: 'https://schema.org/InStock',
        },
      })),
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  }), [courses]);

  useSeo({
    title: `Admissions 2026 — Apply Online at ${APP_NAME}`,
    description: APP_DESCRIPTION,
    keywords: APP_KEYWORDS,
    canonical: `${ORIGIN}/`,
    jsonLd,
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#0a0a1a' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderLeftColor: '#4f46e5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <>
      <style>{HOME_CSS}</style>
      <div id="top" className="relative min-h-screen overflow-x-hidden" style={{ background: '#0a0a1a' }}>
        <HomeNav />
        {error && (
          <div className="mx-auto mt-6 max-w-6xl px-4">
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-xs text-amber-300">
              {error}
            </p>
          </div>
        )}
        <main>
          <HeroSection courses={courses} intakes={intakes} completedLeads={team.completedLeads} />
          <ProgramsSection courses={courses} />
          <PricingSection courses={courses} />
          <IntakesSection intakes={intakes} />
          <ManagersSection
            topCounselors={team.topCounselors}
            topTelecallers={team.topTelecallers}
            completedLeads={team.completedLeads}
          />
          <WhyUsSection />
          <HowToApplySection />
          <FaqSection />
        </main>
        <HomeFooter />
      </div>
    </>
  );
}
