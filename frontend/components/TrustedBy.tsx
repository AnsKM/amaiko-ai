'use client';

import { Language, translations } from '@/lib/translations';

interface TrustedByProps {
  language: Language;
}

export default function TrustedBy({ language }: TrustedByProps) {
  const t = translations[language].trustedBy;

  // Placeholder company names
  const companies = [
    'Microsoft',
    'SAP',
    'Siemens',
    'Deutsche Bank',
    'BMW',
  ];

  return (
    <section className="section-spacing bg-[var(--element-bg)]">
      <div className="container-custom">
        <p className="text-center text-[var(--copy-secondary)] mb-12 text-sm uppercase tracking-wider">
          {t.title}
        </p>
        <div className="logo-grid">
          {companies.map((company, index) => (
            <div
              key={company}
              className="flex items-center justify-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="text-2xl font-bold text-[var(--copy-secondary)] hover:text-[var(--color-primary)] transition-colors">
                {company}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
