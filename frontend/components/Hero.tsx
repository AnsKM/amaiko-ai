'use client';

import { Language, translations } from '@/lib/translations';

interface HeroProps {
  language: Language;
}

export default function Hero({ language }: HeroProps) {
  const t = translations[language].hero;
  const stats = translations[language].stats;

  return (
    <section className="section-spacing pt-32 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--pumpkin-500)] opacity-10 blur-3xl rounded-full animate-pulse-glow" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[var(--pumpkin-600)] opacity-10 blur-3xl rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Title */}
          <h1 className="text-display mb-6 animate-fade-in">
            <span className="gradient-text">{t.title}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-copy-large max-w-3xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {t.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <button className="btn-primary text-lg px-8 py-4">
              {t.cta}
            </button>
            <button className="btn-secondary text-lg px-8 py-4">
              {t.demo}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="stat-card">
              <div className="stat-number">{stats.teams}</div>
              <div className="stat-label">Active Teams</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.tasksAutomated}</div>
              <div className="stat-label">Tasks Automated</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.uptime}</div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
