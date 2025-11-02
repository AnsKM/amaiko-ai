'use client';

import { Language, translations } from '@/lib/translations';

interface FooterProps {
  language: Language;
}

export default function Footer({ language }: FooterProps) {
  const t = translations[language].footer;

  return (
    <footer className="border-t border-[var(--stroke-muted)] bg-[var(--element-bg)]">
      <div className="container-custom section-spacing">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Description */}
          <div>
            <span className="text-2xl font-bold gradient-text mb-4 block">Amaiko AI</span>
            <p className="text-sm text-[var(--copy-secondary)]">
              {language === 'en'
                ? 'Automate your work in Microsoft Teams with intelligent AI agents.'
                : 'Automatisieren Sie Ihre Arbeit in Microsoft Teams mit intelligenten KI-Agenten.'}
            </p>
            <div className="flex gap-4 mt-6">
              {/* Social Icons */}
              <a href="#" className="footer-link hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="footer-link hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="footer-link hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4">{t.product.title}</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="footer-link">{t.product.links.features}</a></li>
              <li><a href="#pricing" className="footer-link">{t.product.links.pricing}</a></li>
              <li><a href="#docs" className="footer-link">{t.product.links.documentation}</a></li>
              <li><a href="#api" className="footer-link">{t.product.links.apiReference}</a></li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold mb-4">{t.resources.title}</h4>
            <ul className="space-y-3">
              <li><a href="#blog" className="footer-link">{t.resources.links.blog}</a></li>
              <li><a href="#guides" className="footer-link">{t.resources.links.guides}</a></li>
              <li><a href="#help" className="footer-link">{t.resources.links.helpCenter}</a></li>
              <li><a href="#community" className="footer-link">{t.resources.links.community}</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">{t.company.title}</h4>
            <ul className="space-y-3">
              <li><a href="#about" className="footer-link">{t.company.links.about}</a></li>
              <li><a href="#careers" className="footer-link">{t.company.links.careers}</a></li>
              <li><a href="#contact" className="footer-link">{t.company.links.contact}</a></li>
              <li><a href="#privacy" className="footer-link">{t.company.links.privacy}</a></li>
              <li><a href="#terms" className="footer-link">{t.company.links.terms}</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-[var(--stroke-muted)] text-center text-sm text-[var(--copy-secondary)]">
          {t.copyright}
        </div>
      </div>
    </footer>
  );
}
