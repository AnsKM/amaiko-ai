'use client';

import { Language, translations } from '@/lib/translations';
import {
  EmailIcon,
  CalendarIcon,
  DocumentIcon,
  CRMIcon,
  MeetingIcon,
  KnowledgeIcon,
} from '@/components/icons/UseCaseIcons';

interface UseCasesProps {
  language: Language;
}

export default function UseCases({ language }: UseCasesProps) {
  const t = translations[language].useCases;

  const cases = [
    {
      id: 'email',
      icon: EmailIcon,
      ...t.cases.email,
    },
    {
      id: 'calendar',
      icon: CalendarIcon,
      ...t.cases.calendar,
    },
    {
      id: 'documents',
      icon: DocumentIcon,
      ...t.cases.documents,
    },
    {
      id: 'crm',
      icon: CRMIcon,
      ...t.cases.crm,
    },
    {
      id: 'meetings',
      icon: MeetingIcon,
      ...t.cases.meetings,
    },
    {
      id: 'knowledge',
      icon: KnowledgeIcon,
      ...t.cases.knowledge,
    },
  ];

  return (
    <section className="section-spacing">
      <div className="container-custom">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-heading-1 mb-4">{t.title}</h2>
          <p className="text-copy-large">{t.subtitle}</p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid-features">
          {cases.map((useCase, index) => {
            const IconComponent = useCase.icon;
            return (
              <div
                key={useCase.id}
                className="card group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <IconComponent
                    className="text-[#fe750e]"
                    size={48}
                  />
                </div>
                <h3 className="text-heading-3 mb-3">{useCase.title}</h3>
                <p className="text-copy-large">{useCase.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
