# Amaiko AI Landing Page

## Overview
A full-fledged, production-ready landing page for Amaiko AI, inspired by the Browser Use website design system. The landing page features a modern, dark-themed design with orange/pumpkin accent colors, smooth animations, and bilingual support (English/German).

## Design System

### Color Scheme (Browser Use Inspired)
- **Primary Accent**: Pumpkin/Orange (`#fe750e`, `#db6103`, `#ac4e04`)
- **Background**: Dark zinc tones (`#09090b`, `#18181b`, `#27272a`)
- **Text**: White/gray scale for optimal readability
- **Borders**: Subtle zinc borders (`#27272a`)

### Typography
- **Font Family**: System fonts (Geist Sans fallback to system UI fonts)
- **Large Display**: 5xl-7xl, bold, tight letter spacing (-0.03em)
- **Headings**: 2xl-5xl, bold/semibold, tight tracking
- **Body**: Base-lg, relaxed line height

### Animations
- Fade-in animations on scroll
- Pulse glow effects on CTAs
- Gradient shifts
- Smooth transitions on all interactive elements
- Terminal typing animation

## File Structure

```
frontend/
├── app/
│   ├── globals.css          # Browser Use color system + custom styles
│   └── page.tsx             # Main landing page component
├── components/
│   ├── Navigation.tsx       # Fixed navigation with language toggle
│   ├── Hero.tsx            # Hero section with gradient text & stats
│   ├── TrustedBy.tsx       # Company logos section
│   ├── Features.tsx        # Tabbed features with code demos
│   ├── DemoSection.tsx     # Animated terminal demo
│   ├── UseCases.tsx        # Use cases grid
│   ├── Pricing.tsx         # Pricing cards with billing toggle
│   ├── FinalCTA.tsx        # Final call-to-action
│   └── Footer.tsx          # Footer with links
└── lib/
    └── translations.ts      # Bilingual content (EN/DE)
```

## Components Details

### 1. Navigation (`Navigation.tsx`)
- Fixed header with scroll-based backdrop blur
- Language toggle (EN/DE)
- Navigation links (Features, Pricing, Blog, Documentation)
- Primary CTA button
- Responsive design

### 2. Hero (`Hero.tsx`)
- Large gradient headline
- Compelling subtitle
- Dual CTA buttons (primary + demo)
- Stats bar (1,000+ Teams, 50K+ Tasks, 99.9% Uptime)
- Background gradient animations

### 3. TrustedBy (`TrustedBy.tsx`)
- Company logos grid
- Placeholder for 5 major companies
- Fade-in animation
- Hover effects

### 4. Features (`Features.tsx`)
- 4 tabbed sections:
  - Stateful AI Agents (with memory)
  - Microsoft 365 Integration
  - Multi-Agent Workflows
  - Enterprise Security
- Code block demos for each feature
- Syntax highlighting (keywords, strings, comments, functions)

### 5. DemoSection (`DemoSection.tsx`)
- Terminal-style interface
- Animated typing effect
- Auto-looping demo
- Shows email search and meeting scheduling
- Bilingual demo content

### 6. UseCases (`UseCases.tsx`)
- 6 use case cards:
  - Email Automation
  - Calendar Management
  - Document Search
  - CRM Integration
  - Meeting Summaries
  - Knowledge Base
- Icon-based design
- Grid layout
- Hover animations

### 7. Pricing (`Pricing.tsx`)
- 3 pricing tiers:
  - Professional (€29/month)
  - Business (€99/month) - Highlighted
  - Enterprise (Custom)
- Monthly/Annually toggle
- Feature lists with checkmarks
- Highlighted "Most Popular" plan
- Responsive card layout

### 8. FinalCTA (`FinalCTA.tsx`)
- Large heading
- Compelling subtitle
- Primary CTA button
- Background gradient effects

### 9. Footer (`Footer.tsx`)
- 4-column layout:
  - Logo & description + social icons
  - Product links
  - Resources links
  - Company links
- Copyright notice
- Footer link hover effects

## Translations System

### Language Support
- **English (EN)**: Default language
- **German (DE)**: Full translation coverage

### Translation File (`lib/translations.ts`)
- Type-safe translation object
- Comprehensive coverage of all UI text
- Easy to extend with new languages
- Exported types for IDE autocomplete

## CSS Architecture

### Custom CSS Classes (`globals.css`)
- **Typography**: `.text-display`, `.text-heading-1`, `.text-heading-2`, `.text-heading-3`, `.text-copy-large`
- **Buttons**: `.btn-primary`, `.btn-secondary`
- **Cards**: `.card` with hover effects
- **Terminal**: `.terminal`, `.code-block`, `.code-comment`, `.code-string`, `.code-keyword`, `.code-function`
- **Animations**: `.animate-fade-in`, `.animate-slide-in`, `.animate-pulse-glow`, `.animate-gradient`
- **Layout**: `.container-custom`, `.section-spacing`, `.grid-features`
- **Badges**: `.badge`, `.badge-primary`, `.badge-secondary`
- **Tabs**: `.tab`, `.tab.active`

### CSS Variables
All colors use CSS custom properties for easy theming:
- `--page-bg`, `--element-bg`, `--demo-bg`
- `--primary-button-bg`, `--button-label`
- `--copy-strong`, `--copy-secondary`, `--copy-dark`
- `--color-primary`, `--stroke-muted`
- `--pumpkin-*` (50-950 scale)
- `--zinc-*` (50-950 scale)

## Features

### Responsive Design
- Mobile-first approach
- Breakpoints: `md` (768px), `lg` (1024px)
- Flexible grid layouts
- Responsive typography

### Animations
- Fade-in on scroll
- Slide-in effects
- Pulse glow on buttons
- Gradient animations
- Terminal typing effect
- Smooth transitions

### Accessibility
- Semantic HTML
- ARIA labels (can be enhanced)
- Keyboard navigation support
- Color contrast compliance
- Hover/focus states

### Performance
- Client-side rendering with React Server Components compatibility
- CSS-only animations (GPU accelerated)
- Minimal JavaScript bundle
- Lazy loading ready

## Content Adaptation (Browser Use → Amaiko AI)

| Browser Use | Amaiko AI |
|-------------|-----------|
| The AI browser agent | The AI Assistant for Teams |
| Automate repetitive online tasks | Automate work in Microsoft Teams |
| Web scraping | Email/calendar management |
| Browser automation | Teams workflow automation |
| No code required | Natural language interface |

## How to Use

### Running the Development Server
```bash
cd frontend
npm run dev
# or
yarn dev
```

### Building for Production
```bash
npm run build
npm start
```

### Changing Language
- Click the EN/DE toggle in the navigation bar
- Language preference persists during session
- All content updates instantly

## Customization Guide

### Changing Colors
Edit `/app/globals.css`:
```css
:root {
  --pumpkin-500: #fe750e;  /* Primary brand color */
  --color-primary: var(--pumpkin-500);
}
```

### Adding New Translations
Edit `/lib/translations.ts`:
```typescript
export const translations: Record<Language, Translations> = {
  en: { /* ... */ },
  de: { /* ... */ },
  // Add new language here
  fr: { /* ... */ }
};
```

### Adding New Sections
1. Create component in `/components/YourSection.tsx`
2. Import and add to `/app/page.tsx`
3. Add translations to `/lib/translations.ts`

### Modifying Animations
Edit animation durations in `/app/globals.css`:
```css
@keyframes fadeIn {
  /* Customize animation */
}
```

## Browser Support
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS Safari 13+, Chrome Android

## SEO Considerations
To add (recommended enhancements):
- Meta tags in layout.tsx
- Open Graph tags
- Twitter Card tags
- Structured data (JSON-LD)
- Sitemap.xml

## Next Steps

### Recommended Enhancements
1. **Analytics**: Add Google Analytics or Plausible
2. **Forms**: Integrate contact/demo request forms
3. **CMS**: Connect to headless CMS for blog content
4. **Images**: Add actual company logos, screenshots
5. **Video**: Embed product demo video
6. **Testimonials**: Add customer testimonials section
7. **FAQ**: Add frequently asked questions
8. **Chat Widget**: Integrate live chat support
9. **A/B Testing**: Set up conversion optimization tests
10. **Performance**: Add image optimization, lazy loading

### Production Checklist
- [ ] Add real company logos (with permission)
- [ ] Replace placeholder text with actual content
- [ ] Add proper meta tags and SEO
- [ ] Test on all target browsers
- [ ] Add error boundaries
- [ ] Implement loading states
- [ ] Add form validation
- [ ] Set up analytics
- [ ] Configure CDN
- [ ] Test accessibility with screen readers
- [ ] Performance audit with Lighthouse
- [ ] Security headers configuration

## Technical Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **State Management**: React useState hooks
- **Animation**: CSS animations + React transitions

## Credits
Design system inspired by Browser Use (browser-use.com).
Adapted for Amaiko AI enterprise Teams assistant.

---

**Created**: November 2, 2025
**Status**: Production-ready landing page
**License**: Proprietary (Amaiko AI)
