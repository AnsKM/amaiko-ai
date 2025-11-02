'use client';

import { Language, translations } from '@/lib/translations';

interface WhyAmaikoProps {
  language: Language;
}

export default function WhyAmaiko({ language }: WhyAmaikoProps) {
  const t = translations[language].whyAmaiko;

  return (
    <section className="section-spacing">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-heading-2 mb-4">{t.title}</h2>
            <p className="text-heading-4 text-[var(--copy-secondary)]">
              {t.tagline}
            </p>
          </div>

          {/* Problem Statement */}
          <div className="mb-12">
            <h3 className="text-heading-3 mb-6 text-[var(--copy-strong)]">
              {t.problem.heading}
            </h3>
            <div className="space-y-4">
              {t.problem.points.map((point, index) => (
                <div key={index} className="flex items-start gap-4">
                  <span className="text-2xl mt-1">❌</span>
                  <p className="text-copy-large text-[var(--copy-secondary)] flex-1">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Solution */}
          <div className="card bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-primary)]/10 border-2 border-[var(--color-primary)]/20 p-8">
            <h3 className="text-heading-3 mb-4 text-[var(--copy-strong)]">
              {t.solution.heading}
            </h3>
            <p className="text-copy-large mb-6 text-[var(--copy-secondary)]">
              {t.solution.description}
            </p>
            <p className="text-copy-large font-semibold text-[var(--color-primary)] mb-6">
              {t.solution.unique}
            </p>
            <p className="text-copy text-[var(--copy-secondary)]">
              {t.solution.buddyCollaboration}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
