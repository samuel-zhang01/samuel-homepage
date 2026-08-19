# Samuel System 7

Samuel Zhang's personal portfolio, presented as a playful System 7-inspired desktop. Biography, experience, projects, COVERD, games, CVs and supporting documents open as movable desktop windows inside one browser tab.

Production site: [me.samuelzhang.co.uk](https://me.samuelzhang.co.uk)

## What is included

- Four routed locales: British English, American English, Simplified Chinese and Traditional Chinese.
- A language selector with locale persistence and mobile-safe menus.
- One Documents app with localised Applied AI CVs and continuously scrolling reviewed PDF previews.
- A 31-record project archive with 27 interactive exhibits, five reviewed external-or-artifact actions, counted filters and catalogue, balanced or detail-focused workspaces.
- Built-in PDF previews, four profile-themed games and desktop easter eggs.
- Keyboard focus states, reduced-motion support and small-screen guidance.
- Responsive System 7 windows designed for 320 px mobile screens through large desktops, with pointer- and keyboard-resizable floating windows on desktop.

## Project archive

The Projects folder contains 31 records with discipline, access and featured-work filters plus curated, newest-first and title sorting. Press `/` anywhere in the archive to focus search. Each record follows a `Start small → Move forward → Polish` narrative; 27 include a privacy-safe interactive exhibit. Five reviewed external-or-artifact actions expose supporting PDFs, workbooks or a primary public record. Live websites and immutable source snapshots remain separately labelled, and public visibility is never presented as a licence.

The `Portfolio map · 6 views` command provides six evidence-led views: chronology; an area × access/demo matrix; an exact capability and technology index; a two-project relationship comparison using declared metadata only; a source-audited vision/CFD/MRI model-lineage timeline and logarithmic parameter-scale view; and a derivation ledger that explains every catalogue count. Selecting a record returns to its existing project file. Archive search, filters, sorting, layouts, actions and status announcements follow the selected locale; project titles and source-grounded descriptions remain in British English.

Dedicated project routes open the archive maximised and can shift between catalogue, balanced and detail-focused layouts. On desktop, the System 7 project window supports pointer and keyboard resizing; its title-bar zoom control toggles the maximised and floating presentations. Small screens use the same content in a constrained responsive layout.

The source-faithful architecture studios expose engineering evidence without inventing model results. The microrobot-vision studio includes an optional rotatable tensor graph, an accessible two-dimensional fallback, layer-shape and parameter ledgers, task-head adaptations, checkpoint-definition drift and a sanitised Git timeline. The CFD atlas separates Fourier operators, message-passing depth and U-Net skip routes; the MRI studio traces its residual reconstruction U-Net, frozen segmentation evaluator and learned data-consistency cascade. Differently evaluated runs remain separate rather than being turned into a manufactured leaderboard.

Disclosure is explicit:

- `Public demo` means a sanitised browser port is available.
- `Case study` means reviewed narrative or research evidence is available.
- `Private / redacted` means the live system, operational data, credentials and source remain withheld; any deliberately public artifact is reviewed and pinned separately.
- `Open source` is reserved for material with a clear public licence; public visibility alone is not treated as an open-source grant.

The current repository audit found no Samuel-authored project with an explicit repository-level licence, so the Open source count intentionally remains zero. Nested licences belonging to copied dependencies or teaching infrastructure do not licence their parent repositories.

Private entries use labels, lock icons and patterns as well as colour. Insurance lead matching and other organisational work use synthetic or high-level public reconstructions. GROWMAT links its original external showcase by owner request; live company data, credentials and source remain private.

## Privacy boundaries

Browser exhibits use deterministic, generated or clearly labelled synthetic inputs where private data or runnable source cannot be published. Source evidence, independently implemented reconstruction and illustrative behaviour are identified separately; demos make no live third-party calls or unsupported performance claims.

- Finance examples use invented transactions. Raw statements, databases, identifiers, holdings and upload APIs are not shipped.
- The CV demo uses sample text and deterministic browser-side matching. Personal applications and third-party model calls are excluded.
- Scheduling examples use fictional people and never connect to calendars, email or a database.
- The Parliamo exhibit uses disposable attempts and synthetic evidence. Private learner state, backups, course scans and class archives are excluded; only two anonymous generated workbooks are published.
- Scientific and decision demos use generated illustrations, fixed reviewed metrics or labelled toy calculations. They do not download weights or serve assessed datasets.
- Molecular-recognition and solubility exhibits use deterministic synthetic spectra, geometries, compounds and observations while linking only pinned public equations or primary conference evidence.
- Innovation and venture-reasoning exhibits re-author assessed ideas with fictional organisations and inputs; original submissions, prompts and prose are not served.
- The STUDY-RL atlas separates repository QA evidence from learner progress and keeps restricted applied work undisclosed.
- The chemistry, market-impact and home-lab exhibits publish independently implemented browser calculations and synthetic identifiers, not private course archives, source repositories or live infrastructure state.
- Curated project artifacts are hash-pinned; raw datasets, checkpoints, assessed solutions and notebooks containing local paths are excluded.

## Technology

- Next.js 15 App Router
- React 19 and TypeScript
- Hand-written CSS and SVG System 7 artwork
- Static generation for locale and application routes
- Standalone, non-root Docker runtime

## Local development on port 5174

Node.js 20.16 or newer is required.

```bash
npm ci
npm run dev:lan
```

- This machine: `http://localhost:5174`
- LAN: `http://<machine-ip>:5174`
- Project archive: `http://localhost:5174/projects`
- LAN project archive: `http://<machine-ip>:5174/projects`

`dev:lan` binds the development server to `0.0.0.0`, so use it only on a trusted network. Host firewall rules still apply.

For the default loopback-only Next.js development server, use `npm run dev` and open `http://localhost:3000`.

## Validation

Before publishing, run:

```bash
npm run check:artifacts
npm run check:catalogue
npm run check:styles
npm run lint
npx tsc --noEmit
npm run build
npm audit --audit-level=moderate
```

`npm run build` runs all portfolio gates automatically. The artifact gate rejects unexpected files and verifies reviewed assets by size, signature and SHA-256; the catalogue gate checks unique routes/demos, disclosure rules, source-licence status, local artifact paths and HTTPS references; the CSS-module gate verifies that every static project style reference resolves.

When a development server is already using `.next`, run `npm run build:isolated` instead. It writes the production checkpoint to `.next-build` so the live development cache is not replaced.

## Docker deployment

Compose binds the production container to `0.0.0.0:5174` by default. Override the host port with `HOMEPAGE_PORT=<port>`.

```bash
./deploy.sh
```

The deployment script supports both `docker compose` and the legacy `docker-compose` binary. It checks project artifacts, builds the image, starts the service and waits for its health check.

Equivalent manual commands:

```bash
docker compose up -d --build
docker compose logs -f samuel-homepage
```

The runtime container is read-only, runs as an unprivileged user, drops Linux capabilities and uses `no-new-privileges`. Use a reverse proxy with TLS for public deployment.

## Browser support

The full desktop targets current Chrome, Edge and Firefox releases and Safari 16.4 or newer. Mobile Safari and Chromium-based mobile browsers receive the same content in a small-screen window layout with safe-area handling.

Internet Explorer is not supported by Next.js 15. IE 10/11 receive a small server-rendered fallback with direct CV and email access; the full experience requires a modern JavaScript, CSS Grid and ES2019-capable browser.

## Relevant structure

```text
src/
├── app/
│   ├── [locale]/
│   ├── page.tsx
│   └── projects/page.tsx
├── components/
│   ├── PdfPreview.tsx
│   ├── SystemSevenDesktop.tsx
│   └── projects/
│       ├── DemoChrome.tsx
│       ├── ProjectDemoRouter.tsx
│       ├── ProjectExplorer.tsx
│       ├── PortfolioMap.tsx
│       ├── PortfolioMap.module.css
│       ├── ModelLineageMap.tsx
│       ├── ModelLineageMap.module.css
│       ├── ProjectActions.tsx
│       ├── projectArchiveI18n.ts
│       ├── CvKeywordStudio.tsx
│       ├── SchedulingStudio.tsx
│       ├── InsuranceMatchingDemo.tsx
│       ├── ItalianLearningStudio.tsx
│       ├── FinanceStudio.tsx
│       ├── CourseRecommenderStudio.tsx
│       ├── MriTrustStudio.tsx
│       ├── CfdArchitectureStudio.tsx
│       ├── CfdShowcase.tsx
│       ├── DeferralRiskStudio.tsx
│       ├── SpectroscopyStudio.tsx
│       ├── ThermodynamicsStudio.tsx
│       ├── EnvironmentPlannerStudio.tsx
│       ├── ModelArchitectureStudio.tsx
│       ├── MicrorobotShowcase.tsx
│       ├── ChemistryCodingStudio.tsx
│       ├── HomeLabTopologyStudio.tsx
│       ├── StockMarketStudio.tsx
│       ├── InnovationModelsStudio.tsx
│       ├── VentureReasoningStudio.tsx
│       ├── MolecularRecognitionStudio.tsx
│       ├── DrugSolubilityStudio.tsx
│       ├── BanditStudio.tsx
│       ├── DecisionDemos.tsx
│       ├── ScientificDemos.tsx
│       └── RlAtlasDemo.tsx
├── data/projects.ts
└── lib/i18n.ts

public/projects/
├── neural-cfd-surrogates/
├── parliamo/
└── study-rl/
```

The confidential Marsh research, raw bank statements and other private source material used while developing portfolio work are excluded from the deployed archive.
