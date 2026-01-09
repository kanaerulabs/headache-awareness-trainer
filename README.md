# Headache Awareness Trainer

[![CI](https://github.com/kanaerulabs/jinit-labs-headache-awareness-trainer/workflows/CI/badge.svg)](https://github.com/kanaerulabs/jinit-labs-headache-awareness-trainer/actions/workflows/ci.yml)
[![Deploy to Production](https://github.com/kanaerulabs/jinit-labs-headache-awareness-trainer/workflows/Deploy%20to%20Production/badge.svg)](https://github.com/kanaerulabs/jinit-labs-headache-awareness-trainer/actions/workflows/deploy-production.yml)

Learn to listen to your body before the headache speaks.

## Overview

An awareness training app for people with chronic mild-to-moderate tension headaches who need to build interoception skills. This is not a tracker - it's an AWARENESS TRAINER that focuses on psychosomatic patterns and body signal recognition.

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Local Database**: IndexedDB (via idb)
- **PWA**: Progressive Web App with offline support
- **Deployment**: Vercel

## Features

### Phase 1 - Learn (Week 1)
- Educational content hub
- Quick onboarding flow
- Basic logging (intensity + note)
- Simple check-ins

### Phase 2 - Notice (Week 2-3)
- Progressive feature unlocking
- Headache type & location tracking
- Body tension awareness
- Calendar view

### Phase 3 - Understand (Week 4+)
- AI pattern recognition
- Personal insights
- Correlation analysis
- Trend visualization

### Phase 4 - Prevent (Ongoing)
- Proactive alerts
- Early intervention tracking
- Continuous pattern discovery

## Getting Started

### Prerequisites

- Node.js 18+ (LTS)
- pnpm 9+

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open browser
open http://localhost:3000
```

### Build for Production

```bash
# Create production build
pnpm build

# Start production server
pnpm start
```

### PWA Testing

The PWA features work best in production mode:

```bash
pnpm build
pnpm start
```

Then test:
- Add to Home Screen functionality
- Offline mode
- Push notifications (when implemented)

## Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (main)/            # Main app routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Feature components
├── lib/                  # Utilities and helpers
│   ├── db/              # IndexedDB utilities
│   └── utils.ts         # General utilities
├── stores/              # Zustand stores
├── public/              # Static assets
│   ├── manifest.json    # PWA manifest
│   └── icons/          # PWA icons
└── types/              # TypeScript type definitions
```

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Component-first architecture

### State Management

- Use Zustand for global state
- Keep state minimal and focused
- Persist critical data in IndexedDB

### Data Storage

- Local-first architecture
- All data in IndexedDB (no server in MVP)
- Privacy-first: no data transmission
- Export functionality for user control

### Progressive Enhancement

- Week 1: Minimal features
- Week 2+: Unlock additional tracking
- Week 3+: Full feature set
- Focus: More data over perfect data

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Deploy automatically

Environment variables (none required for MVP):
- Future: Add analytics opt-in
- Future: Add cloud sync endpoint

## License

Proprietary - jinit-labs

## Support

For questions or issues, contact the development team.

---

Generated with Kanaeru AI Platform
