# Samuel System 7

Samuel Zhang's personal portfolio, presented as a playful System 7-inspired desktop. The site keeps the main experience inside one browser tab: biography, experience, projects, COVERD, games, CVs and supporting documents all open as movable desktop windows.

Production site: [me.samuelzhang.co.uk](https://me.samuelzhang.co.uk)

## What is included

- Four fully routed locales: British English, American English, Simplified Chinese and Traditional Chinese.
- A language selector beside the desktop clock, with locale persistence and mobile-safe menus.
- An in-browser résumé and four downloadable, two-page Applied AI CVs.
- Updated experience spanning COVERD, Marsh, Pfizer, King's College London and the Singapore Civil Defence Force.
- Built-in PDF previews, four profile-themed games and small desktop easter eggs.
- Keyboard focus states, accessible controls, reduced-motion support and first-visit mobile guidance.
- Responsive System 7 windows tested from 320 px mobile screens through 1440 px desktops.

## Technology

- Next.js 15 App Router
- React 19 and TypeScript
- Hand-written CSS and SVG System 7 artwork
- Static generation for the locale and application routes
- A standalone, non-root Docker runtime

## Local development

Node.js 20.9 or newer is required.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

Before publishing, run:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm audit --audit-level=moderate
```

## Docker deployment

The Compose service exposes the app on host port `1111` and includes a health check.

```bash
./deploy.sh
```

The script supports both the current `docker compose` command and the legacy `docker-compose` binary. It builds the production image, starts the service and waits for the container health check to pass.

Equivalent manual commands:

```bash
docker compose up -d --build
docker compose logs -f samuel-homepage
```

The runtime container is read-only, runs as an unprivileged user, drops Linux capabilities and uses `no-new-privileges`. A reverse proxy can route the public hostname to port `1111` and terminate TLS.

## Content structure

- `src/components/SystemSevenDesktop.tsx` contains the desktop applications and portfolio content.
- `src/lib/i18n.ts` contains locale definitions and interface translations.
- `src/app/[locale]` generates the locale-aware routes.
- `others/` contains the maintained LaTeX CV sources.
- `public/` contains the downloadable CVs, public case studies and optimized image assets.

The confidential Marsh research and consulting source documents used while drafting the portfolio are deliberately excluded from the repository and are not served by the site.
