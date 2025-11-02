'use client';

import { Language, translations } from '@/lib/translations';
import { useState } from 'react';

interface FeaturesProps {
  language: Language;
}

export default function Features({ language }: FeaturesProps) {
  const t = translations[language].features;
  const [activeTab, setActiveTab] = useState<'stateful' | 'integration' | 'workflows' | 'security'>('stateful');

  const tabs = [
    { id: 'stateful' as const, label: t.tabs.stateful.title },
    { id: 'integration' as const, label: t.tabs.integration.title },
    { id: 'workflows' as const, label: t.tabs.workflows.title },
    { id: 'security' as const, label: t.tabs.security.title },
  ];

  return (
    <section id="features" className="section-spacing">
      <div className="container-custom">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-heading-1 mb-4">{t.title}</h2>
          <p className="text-copy-large">{t.subtitle}</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="max-w-5xl mx-auto">
          <div className="card animate-fade-in">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left side - Description */}
              <div>
                <h3 className="text-heading-3 mb-4">{t.tabs[activeTab].title}</h3>
                <p className="text-copy-large">{t.tabs[activeTab].description}</p>
              </div>

              {/* Right side - Visual */}
              <div className="terminal">
                {activeTab === 'stateful' && (
                  <div className="code-block space-y-2">
                    <div><span className="code-comment">// Agent with memory</span></div>
                    <div><span className="code-keyword">const</span> <span className="code-function">agent</span> = <span className="code-keyword">new</span> <span className="code-function">AmaikoAgent</span>({'\u007b'}</div>
                    <div className="ml-4"><span className="code-string">memory</span>: <span className="code-keyword">true</span>,</div>
                    <div className="ml-4"><span className="code-string">context</span>: <span className="code-string">"team-sales"</span></div>
                    <div>{'\u007d'});</div>
                    <div className="mt-4"><span className="code-comment">// Agent remembers previous interactions</span></div>
                    <div><span className="code-keyword">await</span> agent.<span className="code-function">remember</span>(<span className="code-string">"Last meeting notes"</span>);</div>
                  </div>
                )}
                {activeTab === 'integration' && (
                  <div className="code-block space-y-2">
                    <div><span className="code-comment">// Microsoft 365 Integration</span></div>
                    <div><span className="code-keyword">const</span> <span className="code-function">integrations</span> = {'\u007b'}</div>
                    <div className="ml-4"><span className="code-string">email</span>: Outlook,</div>
                    <div className="ml-4"><span className="code-string">calendar</span>: MSCalendar,</div>
                    <div className="ml-4"><span className="code-string">files</span>: OneDrive,</div>
                    <div className="ml-4"><span className="code-string">sharepoint</span>: SharePoint</div>
                    <div>{'\u007d'};</div>
                    <div className="mt-4"><span className="code-comment">// Search across all platforms</span></div>
                    <div><span className="code-keyword">await</span> agent.<span className="code-function">search</span>(<span className="code-string">"Q4 reports"</span>);</div>
                  </div>
                )}
                {activeTab === 'workflows' && (
                  <div className="code-block space-y-2">
                    <div><span className="code-comment">// Multi-agent workflow</span></div>
                    <div><span className="code-keyword">const</span> <span className="code-function">workflow</span> = <span className="code-keyword">new</span> <span className="code-function">Workflow</span>([</div>
                    <div className="ml-4"><span className="code-string">EmailAgent</span>,</div>
                    <div className="ml-4"><span className="code-string">CalendarAgent</span>,</div>
                    <div className="ml-4"><span className="code-string">CRMAgent</span></div>
                    <div>]);</div>
                    <div className="mt-4"><span className="code-comment">// Agents coordinate automatically</span></div>
                    <div><span className="code-keyword">await</span> workflow.<span className="code-function">execute</span>();</div>
                  </div>
                )}
                {activeTab === 'security' && (
                  <div className="code-block space-y-2">
                    <div><span className="code-comment">// Enterprise Security</span></div>
                    <div><span className="code-keyword">const</span> <span className="code-function">security</span> = {'\u007b'}</div>
                    <div className="ml-4"><span className="code-string">auth</span>: <span className="code-string">"Azure Entra ID"</span>,</div>
                    <div className="ml-4"><span className="code-string">compliance</span>: <span className="code-string">"SOC 2"</span>,</div>
                    <div className="ml-4"><span className="code-string">encryption</span>: <span className="code-string">"AES-256"</span>,</div>
                    <div className="ml-4"><span className="code-string">audit</span>: <span className="code-keyword">true</span></div>
                    <div>{'\u007d'};</div>
                    <div className="mt-4"><span className="code-comment">// Full audit trail</span></div>
                    <div><span className="code-keyword">await</span> security.<span className="code-function">logActivity</span>();</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
