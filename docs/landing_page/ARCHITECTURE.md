# Architecture Documentation

**Project**: Amaiko AI Landing Page
**Version**: 1.0.0
**Last Updated**: November 2, 2025
**Status**: Production Ready

---

## Table of Contents

1. [High-Level System Architecture](#1-high-level-system-architecture)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Component Architecture](#3-component-architecture)
4. [Design System](#4-design-system)
5. [File Structure](#5-file-structure)
6. [Build Architecture](#6-build-architecture)
7. [Deployment Architecture](#7-deployment-architecture)
8. [Future Backend Architecture](#8-future-backend-architecture)
9. [Scalability Considerations](#9-scalability-considerations)
10. [Security Architecture](#10-security-architecture)

---

## 1. High-Level System Architecture

### Current Architecture (Landing Page Only)

```
┌─────────────────────────────────────────────────────────────┐
│                     User's Browser                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Amaiko Landing Page                           │  │
│  │         (Next.js Static Site)                         │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  React 19 Components                            │  │  │
│  │  │  - Navigation, Hero, Features, etc.             │  │  │
│  │  │  - Client-side rendering                        │  │  │
│  │  │  - State management (useState)                  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Static Data (Bundled at Build Time)            │  │  │
│  │  │  - Translations (EN/DE)                         │  │  │
│  │  │  - CSS Styles (Browser Use theme)               │  │  │
│  │  │  - SVG Icons                                    │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│              GitHub Pages (CDN)                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Static File Delivery                                 │  │
│  │  - HTML, CSS, JavaScript                              │  │
│  │  - Global CDN distribution                            │  │
│  │  - SSL/TLS encryption                                 │  │
│  │  - Caching at edge servers                            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↑
                      GitHub Actions
┌─────────────────────────────────────────────────────────────┐
│              CI/CD Pipeline                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  1. Code Push (main branch)                           │  │
│  │  2. npm install (dependencies)                        │  │
│  │  3. npm run build (Next.js build)                     │  │
│  │  4. npm run export (static export)                    │  │
│  │  5. Deploy to gh-pages branch                         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Summary

| Layer                | Technology     | Version      | Purpose              |
| -------------------- | -------------- | ------------ | -------------------- |
| **Framework**  | Next.js        | 16.0.1       | React framework, SSG |
| **Runtime**    | React          | 19.0.0       | UI components, state |
| **Language**   | TypeScript     | 5.9.0        | Type safety          |
| **Styling**    | Tailwind CSS   | 3.4.16       | Utility-first CSS    |
| **Build Tool** | Turbopack      | (Next.js 16) | Fast builds          |
| **Hosting**    | GitHub Pages   | N/A          | Static hosting       |
| **CI/CD**      | GitHub Actions | N/A          | Automated deployment |
| **Node.js**    | Node.js        | 23.11.0      | JavaScript runtime   |

---

## 2. Frontend Architecture

### Next.js App Router Architecture

Next.js 16 uses the **App Router** (introduced in Next.js 13) which provides:

- Server Components by default
- Improved routing
- Better performance
- Streaming and Suspense support

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js App Router Structure                               │
│                                                             │
│  app/                                                       │
│  ├── layout.tsx          [Server Component]                 │
│  │   ├── HTML structure                                     │
│  │   ├── Global metadata (SEO)                              │
│  │   ├── Font optimization (Geist)                          │
│  │   └── Global CSS import                                  │
│  │                                                          │
│  ├── page.tsx            [Client Component]                 │
│  │   ├── 'use client' directive                             │
│  │   ├── State management (language)                        │
│  │   ├── Component orchestration                            │
│  │   └── Props distribution                                 │
│  │                                                          │
│  └── globals.css         [Global Styles]                    │
│      ├── CSS custom properties                              │
│      ├── Browser Use color palette                          │
│      ├── Tailwind directives                                │
│      └── Custom animations                                  │
└─────────────────────────────────────────────────────────────┘
```

---

### Server vs Client Components

**File**: `app/layout.tsx` (Server Component)

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Server Component - runs at build time
export const metadata: Metadata = {
  title: "Amaiko AI - Your Personal AI Buddy for Knowledge Management",
  description: "Secure company knowledge, boost efficiency & productivity",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**File**: `app/page.tsx` (Client Component)

```typescript
'use client';  // Required for useState, useEffect, event handlers

import { useState } from 'react';
import { Language } from '@/lib/translations';
import Navigation from '@/components/Navigation';
// ... other imports

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <div className="min-h-screen">
      <Navigation language={language} onLanguageChange={setLanguage} />
      {/* ... other components */}
    </div>
  );
}
```

**Why Client Component?**:

- Uses `useState` hook (client-side state)
- Handles user interactions (language toggle, button clicks)
- Manages dynamic animations (terminal typing effect)

---

### Rendering Strategy

**Current**: Client-Side Rendering (CSR) after initial Static Site Generation (SSG)

```
Build Time (next build + export):
┌──────────────────────────────────────────┐
│  1. Next.js builds all pages             │
│  2. Generates static HTML                │
│  3. Bundles JavaScript                   │
│  4. Outputs to out/ directory            │
└──────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────┐
│  Static Files Created:                   │
│  - out/index.html (basic HTML shell)     │
│  - out/_next/static/chunks/*.js          │
│  - out/_next/static/css/*.css            │
└──────────────────────────────────────────┘
        ↓
User Visits Page:
┌──────────────────────────────────────────┐
│  1. Browser downloads index.html         │
│  2. Browser downloads JS bundles         │
│  3. React hydrates HTML                  │
│  4. Components become interactive        │
│  5. Animations start                     │
└──────────────────────────────────────────┘
```

**Future Enhancement**: Server-Side Rendering (SSR) for SEO and performance

- Use `export const dynamic = 'force-static'` for static pages
- Use `export const revalidate = 3600` for Incremental Static Regeneration (ISR)

---

## 3. Component Architecture

### Component Hierarchy

```
HomePage (page.tsx)                        [Client Component]
│
├─→ Navigation                             [Client Component]
│    ├── Logo
│    ├── Menu Items (Features, Pricing, Blog, Docs)
│    ├── Language Toggle (EN/DE)
│    └── CTA Button (Get Started)
│
├─→ Hero                                   [Client Component]
│    ├── Headline (gradient text)
│    ├── Subtitle
│    ├── CTA Buttons (Start Automating, Watch Demo)
│    └── Stats Bar (1,000+ Teams, 50K+ Tasks, 99.9% Uptime)
│
├─→ TrustedBy                              [Client Component]
│    └── Company Logos Grid (5 logos)
│
├─→ WhyAmaiko                              [Client Component]
│    ├── Problem Section (3 pain points)
│    └── Solution Section (AI buddy narrative)
│
├─→ Features                               [Client Component]
│    ├── State: activeTab: string
│    ├── Tab Buttons (4 tabs)
│    └── Code Demo Display (syntax highlighted)
│
├─→ DemoSection                            [Client Component]
│    ├── State: terminalOutput: string[]
│    ├── State: isTyping: boolean
│    ├── Terminal Header (macOS-style dots)
│    └── Animated Terminal Output (looping)
│
├─→ UseCases                               [Client Component]
│    ├── UseCaseIcons (imported SVG components)
│    │    ├── EmailIcon
│    │    ├── CalendarIcon
│    │    ├── DocumentIcon
│    │    ├── CRMIcon
│    │    ├── MeetingIcon
│    │    └── KnowledgeIcon
│    └── Use Case Cards (6 cards in grid)
│
├─→ Pricing                                [Client Component]
│    ├── State: isAnnual: boolean
│    ├── Billing Toggle (Monthly/Annually)
│    └── Pricing Cards (3 tiers)
│         ├── Starter (€24.99/mo)
│         ├── Starter Annual (€19.99/mo) ⭐ Most Popular
│         └── Enterprise (Custom)
│
├─→ FinalCTA                               [Client Component]
│    ├── Headline
│    ├── Subtitle
│    └── CTA Button (Book Your 30-Minute Demo)
│
└─→ Footer                                 [Client Component]
     ├── Logo + Description
     ├── Social Icons
     └── Footer Links (4 columns)
          ├── Product
          ├── Resources
          ├── Company
          └── Copyright
```

---

### Component Design Patterns

#### Pattern 1: Presentational Components

**Example**: Hero.tsx

- **Responsibility**: Display static content based on language prop
- **State**: None (stateless)
- **Props**: `{ language: Language }`
- **Complexity**: Low

```typescript
// Hero.tsx
interface HeroProps {
  language: Language;
}

export default function Hero({ language }: HeroProps) {
  const t = translations[language].hero;

  return (
    <section>
      <h1>{t.title}</h1>
      <p>{t.subtitle}</p>
      <button>{t.cta}</button>
    </section>
  );
}
```

---

#### Pattern 2: Stateful Interactive Components

**Example**: Features.tsx

- **Responsibility**: Manage tab switching, display code demos
- **State**: `activeTab: string`
- **Props**: `{ language: Language }`
- **Complexity**: Medium

```typescript
// Features.tsx
export default function Features({ language }: { language: Language }) {
  const [activeTab, setActiveTab] = useState('stateful');

  return (
    <section>
      <button onClick={() => setActiveTab('stateful')}>Tab 1</button>
      <button onClick={() => setActiveTab('integration')}>Tab 2</button>
      {/* Render content based on activeTab */}
    </section>
  );
}
```

---

#### Pattern 3: Animation Controllers

**Example**: DemoSection.tsx

- **Responsibility**: Manage terminal animation loop
- **State**: `terminalOutput: string[]`, `isTyping: boolean`
- **Props**: `{ language: Language }`
- **Side Effects**: setInterval, setTimeout (managed in useEffect)
- **Complexity**: High

```typescript
// DemoSection.tsx
export default function DemoSection({ language }: { language: Language }) {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let restartTimeout: NodeJS.Timeout;

    const startAnimation = () => {
      // Animation logic
    };

    startAnimation();

    // Cleanup to prevent memory leaks
    return () => {
      clearInterval(interval);
      clearTimeout(restartTimeout);
    };
  }, [language]);

  return <div>{/* Terminal UI */}</div>;
}
```

---

### Component Reusability

**Current Status**: Components are NOT reusable (single-use, landing page specific)

**Potential Refactoring for Reusability**:

```typescript
// Instead of:
export default function Hero({ language }: { language: Language }) {
  const t = translations[language].hero;
  return <section>{/* Hardcoded hero content */}</section>;
}

// Could become:
interface ReusableHeroProps {
  title: string;
  subtitle: string;
  primaryCTA: { text: string; onClick: () => void };
  secondaryCTA: { text: string; onClick: () => void };
  stats: Array<{ label: string; value: string }>;
}

export default function ReusableHero(props: ReusableHeroProps) {
  return <section>{/* Generic hero based on props */}</section>;
}

// Usage:
<ReusableHero
  title={translations[language].hero.title}
  subtitle={translations[language].hero.subtitle}
  // ...
/>
```

**Decision**: Keep components specialized for now (simpler, faster development). Refactor to reusable components if building multiple landing pages.

---

## 4. Design System

### Browser Use Aesthetic

**Inspiration**: [browser-use.com](https://browser-use.com)

**Design Philosophy**:

- Minimalist, modern, professional
- Dark background with high contrast
- Orange accent for energy and action
- Clean typography, generous whitespace
- Subtle animations, smooth transitions

---

### Color Palette

```css
/* Light Mode (Default) */
:root {
  /* Background Colors */
  --bg: #fcfcfc;                    /* Page background */
  --element-bg: #ffffff;            /* Card backgrounds */
  --demo-bg: #09090b;               /* Terminal background */

  /* Primary Color (Orange/Pumpkin) */
  --pumpkin-50: #fff7ed;
  --pumpkin-100: #ffedd5;
  --pumpkin-200: #fed7aa;
  --pumpkin-300: #fdba74;
  --pumpkin-400: #fb923c;
  --pumpkin-500: #fe750e;           /* Primary orange */
  --pumpkin-600: #ea580c;
  --pumpkin-700: #c2410c;
  --pumpkin-800: #9a3412;
  --pumpkin-900: #7c2d12;
  --pumpkin-950: #431407;

  /* Text Colors */
  --copy-strong: #18181b;           /* Headings, strong text */
  --copy-secondary: #71717a;        /* Body text, descriptions */
  --copy-dark: #27272a;             /* Slightly lighter than strong */

  /* Button Colors */
  --primary-button-bg: var(--pumpkin-500);
  --button-label: #ffffff;

  /* Borders */
  --stroke-muted: #27272a;
}

/* Dark Mode (Future Enhancement) */
@media (prefers-color-scheme: dark) {
  :root {
    --page-bg: var(--zinc-950);
    --element-bg: var(--zinc-900);
    --copy-strong: #ffffff;
    --copy-secondary: var(--zinc-500);
  }
}
```

---

### Typography System

**Font Stacks**:

```css
/* Primary Font: Geist Sans (from Vercel) */
--font-geist-sans: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI',
                   Roboto, sans-serif;

/* Monospace Font: Geist Mono (for code) */
--font-geist-mono: 'Geist Mono', 'Courier New', monospace;
```

**Typography Scale**:

| Class                | Font Size       | Line Height | Letter Spacing | Usage           |
| -------------------- | --------------- | ----------- | -------------- | --------------- |
| `.text-display`    | 4.5rem (72px)   | 1.1         | -0.03em        | Hero headline   |
| `.text-heading-1`  | 3.75rem (60px)  | 1.1         | -0.02em        | Section titles  |
| `.text-heading-2`  | 3rem (48px)     | 1.2         | -0.02em        | Subsections     |
| `.text-heading-3`  | 2.25rem (36px)  | 1.3         | -0.01em        | Card titles     |
| `.text-heading-4`  | 1.875rem (30px) | 1.3         | -0.01em        | Small headings  |
| `.text-copy-large` | 1.125rem (18px) | 1.6         | 0              | Large body text |
| `.text-copy`       | 1rem (16px)     | 1.5         | 0              | Standard body   |

---

### Component Styles

#### Buttons

```css
.btn-primary {
  background: var(--primary-button-bg);
  color: var(--button-label);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: var(--pumpkin-600);
  box-shadow: 0 0 20px rgba(254, 117, 14, 0.4); /* Glow effect */
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: var(--copy-strong);
  border: 2px solid var(--stroke-muted);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
```

---

#### Cards

```css
.card {
  background: var(--element-bg);
  border: 1px solid var(--stroke-muted);
  border-radius: 1rem;
  padding: 2rem;
  transition: all 0.3s ease;
}

.card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}
```

---

#### Terminal

```css
.terminal {
  background: var(--demo-bg);
  border: 1px solid var(--stroke-muted);
  border-radius: 0.75rem;
  padding: 1.5rem;
  font-family: var(--font-geist-mono);
  font-size: 0.875rem;
  color: var(--copy-strong);
}
```

---

### Animation Library

```css
/* Fade In */
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

/* Slide In */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slideIn 0.6s ease-out;
}

/* Pulse Glow (for CTAs) */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(254, 117, 14, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(254, 117, 14, 0.6);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Gradient Shift (for hero background) */
@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}
```

---

## 5. File Structure

### Complete Project Tree

```
/Users/anskhalid/CascadeProjects/Live_Coding_Amaiko/amaiko-ai/
│
├── frontend/                          # Next.js frontend application
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root layout (metadata, fonts)
│   │   ├── page.tsx                   # Home page (main orchestrator)
│   │   ├── globals.css                # Global styles + Browser Use theme
│   │   └── favicon.ico                # Site favicon
│   │
│   ├── components/                    # React components
│   │   ├── Navigation.tsx             # Fixed header, language toggle
│   │   ├── Hero.tsx                   # Hero section with stats
│   │   ├── TrustedBy.tsx              # Company logos
│   │   ├── WhyAmaiko.tsx              # Problem-solution narrative
│   │   ├── Features.tsx               # Tabbed features with code demos
│   │   ├── DemoSection.tsx            # Terminal animation (looping)
│   │   ├── UseCases.tsx               # Use cases grid with icons
│   │   ├── Pricing.tsx                # 3-tier pricing cards
│   │   ├── FinalCTA.tsx               # Final call-to-action
│   │   ├── Footer.tsx                 # Footer with links
│   │   └── icons/
│   │       └── UseCaseIcons.tsx       # 6 custom SVG icons
│   │
│   ├── lib/                           # Shared utilities
│   │   └── translations.ts            # Bilingual translations (EN/DE)
│   │
│   ├── public/                        # Static assets
│   │   └── (empty - future images, fonts)
│   │
│   ├── package.json                   # Dependencies, scripts
│   ├── package-lock.json              # Dependency lock file
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── next.config.ts                 # Next.js configuration
│   ├── tailwind.config.ts             # Tailwind CSS configuration
│   ├── postcss.config.mjs             # PostCSS configuration
│   └── .gitignore                     # Git ignore rules
│
├── .github/                           # GitHub configuration
│   └── workflows/
│       └── deploy.yml                 # GitHub Actions deployment
│
├── docs/                              # Documentation
│   ├── USER_FLOW.md                   # User journey documentation
│   ├── DATA_FLOW.md                   # Data flow architecture
│   ├── USE_CASES.md                   # Use case scenarios
│   ├── ARCHITECTURE.md                # This file
│   └── DESIGN_DECISIONS.md            # Design rationale
│
├── FINAL_IMPLEMENTATION_SUMMARY.md    # Implementation summary
├── LANDING_PAGE_README.md             # Landing page documentation
├── README.md                          # Project README
└── .gitignore                         # Root Git ignore

Total Files: ~30
Total Lines of Code: ~3,500
Bundle Size (gzipped): ~80KB
```

---

### Key Configuration Files

#### package.json

```json
{
  "name": "amaiko-landing",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev --port 8200 --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "export": "next export"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "^16.0.1"
  },
  "devDependencies": {
    "typescript": "^5.9.0",
    "tailwindcss": "^3.4.16",
    "@types/react": "^19.0.0",
    "@types/node": "^20"
  }
}
```

#### next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Static export for GitHub Pages
  basePath: '',      // No base path
  images: {
    unoptimized: true  // Required for static export
  },
  reactStrictMode: true,
  swcMinify: true
};

export default nextConfig;
```

#### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pumpkin: {
          50: '#fff7ed',
          500: '#fe750e',  // Primary
          950: '#431407',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 6. Build Architecture

### Next.js Build Process

```
Developer runs: npm run build
        ↓
┌──────────────────────────────────────────────┐
│  Step 1: TypeScript Compilation              │
│  - Transpile .tsx → .jsx                     │
│  - Transpile .ts → .js                       │
│  - Type checking (errors fail build)         │
│  Output: .next/cache/webpack/                │
└──────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────┐
│  Step 2: React Component Processing          │
│  - Transform JSX → React.createElement()     │
│  - Tree-shake unused imports                 │
│  - Optimize component rendering              │
└──────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────┐
│  Step 3: CSS Processing                      │
│  - Process Tailwind directives               │
│  - Purge unused CSS classes                  │
│  - Merge globals.css + Tailwind utilities    │
│  - Minify CSS                                │
│  Output: .next/static/css/[hash].css         │
└──────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────┐
│  Step 4: JavaScript Bundling (Turbopack)     │
│  - Code splitting (chunks)                   │
│  - Bundle translations.ts                    │
│  - Bundle all components                     │
│  - Tree-shake unused code                    │
│  - Minify with SWC                           │
│  Output: .next/static/chunks/*.js            │
└──────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────┐
│  Step 5: Static Generation                   │
│  - Render page.tsx to HTML                   │
│  - Generate index.html                       │
│  - Inject <script> tags for JS bundles       │
│  - Inject <link> tags for CSS                │
│  Output: .next/server/pages/index.html       │
└──────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────┐
│  Step 6: Static Export (npm run export)      │
│  - Copy .next/static/ → out/_next/static/    │
│  - Copy index.html → out/index.html          │
│  - Create 404.html                           │
│  Output: out/ directory (ready for hosting)  │
└──────────────────────────────────────────────┘
```

### Build Output Structure

```
.next/                                 # Build cache
├── cache/                             # Webpack/Turbopack cache
├── server/                            # Server-side code
└── static/
    ├── chunks/                        # JS chunks
    ├── css/                           # CSS files
    └── media/                         # Images, fonts

out/                                   # Static export (deployable)
├── index.html                         # Main landing page
├── 404.html                           # Error page
└── _next/
    └── static/
        ├── chunks/
        │   ├── main-[hash].js         # Main app bundle
        │   ├── page-[hash].js         # Home page component
        │   └── webpack-[hash].js      # Webpack runtime
        ├── css/
        │   └── styles-[hash].css      # Compiled CSS
        └── media/
```

---

## 7. Deployment Architecture

### GitHub Actions CI/CD Pipeline

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '23.11.0'

      - name: Install dependencies
        run: npm install
        working-directory: ./frontend

      - name: Build Next.js app
        run: npm run build
        working-directory: ./frontend

      - name: Export static files
        run: npm run export
        working-directory: ./frontend

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/out
          publish_branch: gh-pages
```

### Deployment Flow Diagram

```
Developer pushes to main branch
        ↓
GitHub webhook triggers Actions runner
        ↓
┌──────────────────────────────────────────────┐
│  GitHub Actions VM (Ubuntu)                  │
│  ┌────────────────────────────────────────┐  │
│  │  1. Checkout code (main branch)        │  │
│  │  2. Install Node.js 23.11.0            │  │
│  │  3. npm install (dependencies)         │  │
│  │  4. npm run build (Next.js build)      │  │
│  │  5. npm run export (static export)     │  │
│  │  6. Deploy out/ to gh-pages branch     │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────┐
│  gh-pages Branch Updated                     │
│  - Commits static files                      │
│  - Force pushes (overwrite previous version) │
└──────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────┐
│  GitHub Pages CDN                            │
│  - Detects new commit on gh-pages            │
│  - Invalidates cache                         │
│  - Distributes to global edge servers        │
│  - HTTPS enabled automatically               │
└──────────────────────────────────────────────┘
        ↓
Site live at: https://[username].github.io/amaiko-ai
```

**Total Deployment Time**: 3-5 minutes

---

## 8. Future Backend Architecture

### Full-Stack Architecture (Planned)

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Browser)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Next.js App (React 19)                               │  │
│  │  - Landing page (current)                             │  │
│  │  - Dashboard (future)                                 │  │
│  │  - Teams app integration (future)                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTPS/REST API
┌─────────────────────────────────────────────────────────────┐
│                Backend (NestJS + Node.js)                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  API Gateway (NestJS Controllers)                     │  │
│  │  - /api/auth (Authentication)                         │  │
│  │  - /api/users (User management)                       │  │
│  │  - /api/knowledge (Knowledge retrieval)               │  │
│  │  - /api/agents (Letta agents)                         │  │
│  │  - /api/webhooks (Microsoft Graph webhooks)           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Services Layer                                       │  │
│  │  - AuthService (OAuth 2.0 + Azure AD)                 │  │
│  │  - KnowledgeService (Vector search)                   │  │
│  │  - LettaService (Agent orchestration)                 │  │
│  │  - GraphService (Microsoft Graph API client)          │  │
│  │  - EmbeddingService (OpenAI embeddings)               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                Database Layer (PostgreSQL 15)               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Tables:                                              │  │
│  │  - users (user accounts)                              │  │
│  │  - organizations (companies)                          │  │
│  │  - knowledge_entries (indexed documents)              │  │
│  │  - conversations (chat history)                       │  │
│  │  - agents (Letta agent instances)                     │  │
│  │                                                       │  │
│  │  Extensions:                                          │  │
│  │  - pgvector (vector similarity search)                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              External Services (Cloud)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Microsoft Graph API                                  │  │
│  │  - Outlook, Teams, SharePoint, OneDrive               │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Azure OpenAI                                         │  │
│  │  - GPT-4 Turbo (LLM)                                  │  │
│  │  - text-embedding-3-large (embeddings)                │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Letta (Agent Framework)                              │  │
│  │  - Stateful AI agents with memory                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Scalability Considerations

### Current Scalability

**Landing Page** (Static Site):

- ✅ **Infinite horizontal scaling**: CDN edge servers globally
- ✅ **No backend load**: All processing in browser
- ✅ **Fast TTFB**: < 100ms (CDN proximity)
- ✅ **Low cost**: Free on GitHub Pages

**Limitations**:

- ⚠️ No user authentication
- ⚠️ No dynamic content
- ⚠️ No server-side processing

---

### Future Backend Scalability

**Database Scaling** (PostgreSQL + pgvector):

- **Read Replicas**: 3-5 read replicas for knowledge queries
- **Connection Pooling**: PgBouncer (1000+ concurrent connections)
- **Vector Index**: HNSW algorithm for < 10ms semantic search
- **Sharding**: Partition by organization ID

**API Scaling** (NestJS):

- **Horizontal Scaling**: 10-50 Kubernetes pods
- **Load Balancer**: Azure Load Balancer
- **Auto-scaling**: CPU > 70% → add pod
- **Rate Limiting**: 100 requests/min per user

**Caching Strategy**:

- **Redis Cache**: Knowledge query results (TTL: 5 min)
- **CDN Cache**: Static assets (TTL: 1 year)
- **Browser Cache**: JS/CSS bundles (immutable)

---

## 10. Security Architecture

### Current Security (Landing Page)

**HTTPS Enforcement**:

- ✅ GitHub Pages enforces HTTPS
- ✅ TLS 1.3 encryption
- ✅ Valid SSL certificate (auto-renewed)

**Content Security**:

- ✅ No user input (no XSS risk)
- ✅ No database (no SQL injection)
- ✅ Static files only (no server vulnerabilities)

**Limitations**:

- ⚠️ No authentication
- ⚠️ No authorization
- ⚠️ No data encryption (no sensitive data)

---

### Future Backend Security

**Authentication** (OAuth 2.0 + Azure AD):

```typescript
interface AuthFlow {
  provider: 'Azure AD';
  flow: 'Authorization Code Flow';
  scopes: ['User.Read', 'Mail.Read', 'Calendars.ReadWrite'];
  token_storage: 'HTTP-only cookies (secure, SameSite=Strict)';
  session_duration: '7 days';
  refresh_tokens: 'Encrypted at rest (AES-256)';
}
```

**Data Encryption**:

- **At Rest**: AES-256 encryption for database
- **In Transit**: TLS 1.3 for all API calls
- **Key Management**: Azure Key Vault

**DSGVO Compliance**:

- **Data Residency**: EU data centers only
- **Right to Erasure**: Delete user data on request
- **Data Portability**: Export user data in JSON
- **Privacy by Design**: Minimal data collection

---

## Summary

The Amaiko AI landing page implements a **modern, scalable, maintainable architecture**:

✅ **Frontend**: Next.js 16 + React 19 + TypeScript (type-safe, performant)
✅ **Design System**: Browser Use aesthetic (professional, modern)
✅ **Build Process**: Turbopack (fast builds) + Static Export (GitHub Pages)
✅ **Deployment**: Automated GitHub Actions CI/CD
✅ **Scalability**: CDN-based, globally distributed
✅ **Security**: HTTPS, static files (no attack surface)

**Future Enhancements**:

- NestJS backend with PostgreSQL + pgvector
- Letta agent integration for stateful AI
- Microsoft Graph API for M365 data access
- Real-time knowledge indexing and retrieval
- Enterprise-grade security and DSGVO compliance

---

**Document Version**: 1.0.0
**Last Updated**: November 2, 2025
**Maintained By**: Amaiko AI Engineering Team
**Related Docs**: [DATA_FLOW.md](./DATA_FLOW.md), [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md)
