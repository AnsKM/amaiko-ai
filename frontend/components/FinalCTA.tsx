'use client';

import { Language, translations } from '@/lib/translations';

interface FinalCTAProps {
  language: Language;
}

export default function FinalCTA({ language }: FinalCTAProps) {
  const t = translations[language].finalCta;

  return (
    <section className="section-spacing relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 gradient-bg opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[var(--pumpkin-500)] opacity-5 blur-3xl animate-pulse-glow" />
      </div>

      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-heading-1 mb-6 animate-fade-in">
            {t.title}
          </h2>
          <p className="text-copy-large mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {t.subtitle}
          </p>
          <button className="btn-primary text-lg px-10 py-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {t.cta}
          </button>
        </div>
      </div>
    </section>
  );
}
