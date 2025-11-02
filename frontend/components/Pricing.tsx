'use client';

import { Language, translations } from '@/lib/translations';
import { useState } from 'react';

interface PricingProps {
  language: Language;
}

export default function Pricing({ language }: PricingProps) {
  const t = translations[language].pricing;
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const plans = [
    {
      id: 'professional',
      ...t.plans.professional,
      highlighted: false,
    },
    {
      id: 'business',
      ...t.plans.business,
      highlighted: true,
    },
    {
      id: 'enterprise',
      ...t.plans.enterprise,
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="section-spacing bg-[var(--element-bg)]">
      <div className="container-custom">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-heading-1 mb-4">{t.title}</h2>
          <p className="text-copy-large mb-8">{t.subtitle}</p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-[var(--page-bg)] rounded-lg p-1 border border-[var(--stroke-muted)]">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[var(--active-tab-bg)] text-[var(--active-tab-label)]'
                  : 'text-[var(--default-tab-label)] hover:opacity-70'
              }`}
            >
              {t.monthly}
            </button>
            <button
              onClick={() => setBillingCycle('annually')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'annually'
                  ? 'bg-[var(--active-tab-bg)] text-[var(--active-tab-label)]'
                  : 'text-[var(--default-tab-label)] hover:opacity-70'
              }`}
            >
              {t.annually}
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`card relative animate-fade-in ${
                plan.highlighted ? 'ring-2 ring-[var(--color-primary)] scale-105' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.highlighted && 'popular' in plan && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="badge-primary px-4 py-1 text-xs font-semibold">
                    {plan.popular}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-heading-3 mb-2">{plan.name}</h3>
                <p className="text-copy-large mb-4">{plan.description}</p>
                <div className="text-5xl font-bold mb-2">
                  <span className="gradient-text">{plan.price}</span>
                </div>
                {plan.price !== 'Custom' && plan.price !== 'Individuell' && (
                  <p className="text-sm text-[var(--copy-secondary)]">
                    {billingCycle === 'monthly'
                      ? language === 'en' ? 'per month' : 'pro Monat'
                      : language === 'en' ? 'per year' : 'pro Jahr'}
                  </p>
                )}
              </div>

              <button
                className={`w-full mb-6 ${
                  plan.highlighted ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {plan.cta}
              </button>

              <div className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--pumpkin-950)] flex items-center justify-center mt-0.5">
                      <svg
                        className="w-3 h-3 text-[var(--pumpkin-400)]"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-[var(--copy-secondary)]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
