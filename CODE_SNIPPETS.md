# Amaiko AI Landing Page - Key Code Snippets

## Browser Use Color System Implementation

### CSS Variables (globals.css)
```css
:root {
  /* Pumpkin/Orange Scale - Primary Brand Colors */
  --pumpkin-500: #fe750e;  /* Primary CTA color */
  --pumpkin-600: #db6103;
  --pumpkin-700: #ac4e04;

  /* Zinc Scale - Background & Text */
  --zinc-950: #09090b;     /* Main background */
  --zinc-800: #27272a;     /* Cards background */
  --zinc-400: #a1a1aa;     /* Secondary text */
  --zinc-50: #fafafa;      /* Primary text */
}

.dark {
  --page-bg: var(--zinc-950);
  --element-bg: var(--zinc-900);
  --primary-button-bg: var(--pumpkin-500);
  --copy-strong: var(--zinc-50);
  --copy-secondary: var(--zinc-400);
}
```

## Component Examples

### Hero Section with Gradient Text
```tsx
// Hero.tsx
<h1 className="text-display mb-6 animate-fade-in">
  <span className="gradient-text">{t.title}</span>
</h1>
```

### Language Toggle
```tsx
// Navigation.tsx
<div className="flex items-center bg-[var(--element-bg)] rounded-lg p-1">
  <button
    onClick={() => onLanguageChange('en')}
    className={`px-3 py-1 rounded ${
      language === 'en' ? 'bg-[var(--active-tab-bg)]' : ''
    }`}
  >
    EN
  </button>
  <button onClick={() => onLanguageChange('de')}>DE</button>
</div>
```

### Terminal Animation
```tsx
// DemoSection.tsx
useEffect(() => {
  const interval = setInterval(() => {
    if (currentIndex < demoSteps.length) {
      setTerminalOutput((prev) => [...prev, demoSteps[currentIndex]]);
      currentIndex++;
    }
  }, 600);
}, []);
```

### Tabbed Features
```tsx
// Features.tsx
<div className="flex gap-3 justify-center mb-12">
  {tabs.map((tab) => (
    <button
      onClick={() => setActiveTab(tab.id)}
      className={`tab ${activeTab === tab.id ? 'active' : ''}`}
    >
      {tab.label}
    </button>
  ))}
</div>
```

### Syntax-Highlighted Code
```tsx
// Features.tsx - Code demo
<div className="code-block space-y-2">
  <div><span className="code-comment">// Agent with memory</span></div>
  <div>
    <span className="code-keyword">const</span>{' '}
    <span className="code-function">agent</span> ={' '}
    <span className="code-keyword">new</span>{' '}
    <span className="code-function">AmaikoAgent</span>()
  </div>
</div>
```

### Pricing Cards with Highlight
```tsx
// Pricing.tsx
<div className={`card ${
  plan.highlighted ? 'ring-2 ring-[var(--color-primary)] scale-105' : ''
}`}>
  {plan.highlighted && (
    <div className="absolute -top-4">
      <span className="badge-primary">{plan.popular}</span>
    </div>
  )}
</div>
```

## Animation Examples

### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}
```

### Pulse Glow
```css
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(254, 117, 14, 0.2);
  }
  50% {
    box-shadow: 0 0 40px rgba(254, 117, 14, 0.4);
  }
}

.btn-primary:hover {
  box-shadow: 0 0 30px rgba(254, 117, 14, 0.3);
}
```

## Translation System

### Type-Safe Translations
```tsx
// lib/translations.ts
export type Language = 'en' | 'de';

export interface Translations {
  nav: {
    features: string;
    pricing: string;
    // ...
  };
  hero: {
    title: string;
    subtitle: string;
    // ...
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: { features: 'Features', pricing: 'Pricing' },
    hero: { title: 'The AI Assistant for Teams' }
  },
  de: {
    nav: { features: 'Funktionen', pricing: 'Preise' },
    hero: { title: 'Der KI-Assistent für Teams' }
  }
};
```

### Using Translations
```tsx
// Any component
const t = translations[language].nav;
return <a href="#features">{t.features}</a>;
```

## Responsive Design

### Grid Layouts
```css
.grid-features {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}
```

### Responsive Typography
```css
.text-display {
  @apply text-5xl md:text-7xl font-bold tracking-tight;
}
```

## Custom Components

### Button Styles
```css
.btn-primary {
  @apply px-6 py-3 rounded-lg font-medium transition-all duration-200;
  background-color: var(--primary-button-bg);
  color: var(--button-label);
}

.btn-primary:hover {
  @apply scale-105 shadow-lg;
}
```

### Card with Hover Effect
```css
.card {
  @apply rounded-xl border p-6 transition-all duration-300;
  background-color: var(--element-bg);
  border-color: var(--stroke-muted);
}

.card:hover {
  @apply shadow-lg;
  border-color: var(--color-primary);
}
```

## Usage in Components

### Main Page Structure
```tsx
// app/page.tsx
export default function Home() {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <div className="min-h-screen">
      <Navigation language={language} onLanguageChange={setLanguage} />
      <Hero language={language} />
      <TrustedBy language={language} />
      <Features language={language} />
      <DemoSection language={language} />
      <UseCases language={language} />
      <Pricing language={language} />
      <FinalCTA language={language} />
      <Footer language={language} />
    </div>
  );
}
```

## Best Practices Used

### 1. Type Safety
```tsx
interface NavigationProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}
```

### 2. Animation Delays
```tsx
<div
  className="animate-fade-in"
  style={{ animationDelay: `${index * 0.1}s` }}
>
```

### 3. CSS Custom Properties
```tsx
<div style={{ color: 'var(--color-primary)' }}>
```

### 4. Responsive Classes
```tsx
<div className="flex flex-col sm:flex-row gap-4">
```

### 5. Hover States
```tsx
<a className="hover:text-[var(--color-primary)] transition-colors">
```

---

These snippets demonstrate the key implementation patterns used throughout the Amaiko AI landing page, following Browser Use design principles while maintaining modern React and TypeScript best practices.
