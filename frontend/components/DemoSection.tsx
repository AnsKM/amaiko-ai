'use client';

import { Language } from '@/lib/translations';
import { useState, useEffect } from 'react';

interface DemoSectionProps {
  language: Language;
}

export default function DemoSection({ language }: DemoSectionProps) {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const demoSteps = language === 'en'
    ? [
        '$ amaiko search "emails from John about Q4 planning"',
        'Searching across Outlook...',
        'Found 3 emails matching your query:',
        '  1. "Q4 Planning Meeting" - Oct 15',
        '  2. "Q4 Budget Discussion" - Oct 18',
        '  3. "Q4 Strategy Follow-up" - Oct 22',
        '',
        '$ amaiko schedule "meeting with Sarah next week"',
        'Checking Sarah\'s calendar availability...',
        'Optimal time found: Tuesday, 2:00 PM - 3:00 PM',
        'Meeting scheduled successfully!',
        'Invitation sent to sarah@company.com',
      ]
    : [
        '$ amaiko search "E-Mails von John über Q4-Planung"',
        'Durchsuche Outlook...',
        'Gefunden: 3 E-Mails:',
        '  1. "Q4-Planungsbesprechung" - 15. Okt',
        '  2. "Q4-Budgetdiskussion" - 18. Okt',
        '  3. "Q4-Strategie Follow-up" - 22. Okt',
        '',
        '$ amaiko schedule "Meeting mit Sarah nächste Woche"',
        'Prüfe Sarahs Kalender...',
        'Optimale Zeit gefunden: Dienstag, 14:00 - 15:00 Uhr',
        'Meeting erfolgreich geplant!',
        'Einladung an sarah@firma.de gesendet',
      ];

  useEffect(() => {
    let currentIndex = 0;
    let interval: NodeJS.Timeout;
    let restartTimeout: NodeJS.Timeout;

    const startAnimation = () => {
      currentIndex = 0;
      setTerminalOutput([]);
      setIsTyping(true);

      interval = setInterval(() => {
        if (currentIndex < demoSteps.length) {
          setTerminalOutput((prev) => [...prev, demoSteps[currentIndex]]);
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(interval);

          // Restart after 3 seconds
          restartTimeout = setTimeout(() => {
            startAnimation();
          }, 3000);
        }
      }, 600);
    };

    // Start the initial animation
    startAnimation();

    // Cleanup function
    return () => {
      clearInterval(interval);
      clearTimeout(restartTimeout);
    };
  }, [language]); // Only depend on language, not demoSteps

  return (
    <section className="section-spacing bg-[var(--element-bg)]">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-heading-2 mb-4">
              {language === 'en' ? 'See it in action' : 'Sehen Sie es in Aktion'}
            </h2>
            <p className="text-copy-large">
              {language === 'en'
                ? 'Natural language commands that just work'
                : 'Natürliche Sprachbefehle, die einfach funktionieren'}
            </p>
          </div>

          <div className="terminal relative">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--stroke-muted)]">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-[var(--copy-secondary)]">Amaiko Terminal</span>
            </div>

            {/* Terminal Content */}
            <div className="space-y-1 min-h-[300px]">
              {terminalOutput.map((line, index) => (
                <div
                  key={index}
                  className={`animate-slide-in ${
                    line?.startsWith('$')
                      ? 'text-[var(--color-primary)] font-semibold'
                      : line?.startsWith('  ')
                      ? 'text-[var(--copy-secondary)] ml-2'
                      : 'text-[var(--copy-strong)]'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {line || '\u00A0'}
                </div>
              ))}
              {isTyping && (
                <div className="inline-block w-2 h-4 bg-[var(--color-primary)] animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
