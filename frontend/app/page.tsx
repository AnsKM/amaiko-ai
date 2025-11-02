'use client';

import { useState } from 'react';
import { Language } from '@/lib/translations';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import TrustedBy from '@/components/TrustedBy';
import WhyAmaiko from '@/components/WhyAmaiko';
import Features from '@/components/Features';
import DemoSection from '@/components/DemoSection';
import UseCases from '@/components/UseCases';
import Pricing from '@/components/Pricing';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <div className="min-h-screen">
      <Navigation language={language} onLanguageChange={setLanguage} />
      <Hero language={language} />
      <TrustedBy language={language} />
      <WhyAmaiko language={language} />
      <Features language={language} />
      <DemoSection language={language} />
      <UseCases language={language} />
      <Pricing language={language} />
      <FinalCTA language={language} />
      <Footer language={language} />
    </div>
  );
}
