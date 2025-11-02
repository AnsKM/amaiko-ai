'use client';

import { Language, translations } from '@/lib/translations';
import { useState, useEffect } from 'react';

interface NavigationProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function Navigation({ language, onLanguageChange }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const t = translations[language].nav;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[var(--page-bg)]/80 backdrop-blur-md border-b border-[var(--stroke-muted)]' : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold gradient-text">Amaiko AI</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-[var(--nav-default)] hover:text-[var(--color-primary)] transition-colors">
              {t.features}
            </a>
            <a href="#pricing" className="text-[var(--nav-default)] hover:text-[var(--color-primary)] transition-colors">
              {t.pricing}
            </a>
            <a href="#blog" className="text-[var(--nav-default)] hover:text-[var(--color-primary)] transition-colors">
              {t.blog}
            </a>
            <a href="#docs" className="text-[var(--nav-default)] hover:text-[var(--color-primary)] transition-colors">
              {t.documentation}
            </a>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <div className="flex items-center bg-[var(--element-bg)] rounded-lg p-1 border border-[var(--stroke-muted)]">
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  language === 'en'
                    ? 'bg-[var(--active-tab-bg)] text-[var(--active-tab-label)]'
                    : 'text-[var(--default-tab-label)] hover:opacity-70'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('de')}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  language === 'de'
                    ? 'bg-[var(--active-tab-bg)] text-[var(--active-tab-label)]'
                    : 'text-[var(--default-tab-label)] hover:opacity-70'
                }`}
              >
                DE
              </button>
            </div>

            {/* CTA Button */}
            <button className="btn-primary hidden md:block">
              {t.getStarted}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
