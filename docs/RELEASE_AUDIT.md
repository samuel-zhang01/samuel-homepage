# Samuel System 7 — release audit

Audit date: 4 September 2026

Target: `main` → `https://me.samuelzhang.co.uk`

This record accompanies the System 7 authenticity, responsive-layout,
localisation, performance and security sweep. It records repeatable evidence;
it is not a claim that every browser or assistive-technology combination can
be exhaustively proven.

## Release decision

The source, isolated production build and hardened local container candidate
are release-ready. Production rollout must additionally pass the public-origin
probes in `deploy.sh`. The script restores the previously running image if
post-start validation fails.

## Design contract

- The desktop shell uses a Chicago-first chrome stack and a Geneva-first
  content stack, with Monaco/Courier reserved for machine-like readouts.
- Desktop artwork uses 32 × 32 pixel icon plates; menu artwork uses 16 × 16
  plates, following the 1992 Macintosh Human Interface Guidelines.
- Controls use square corners, hard black keylines, one-pixel highlights and
  shadows, dotted keyboard focus, and restrained colour. Glass, blur, pills,
  soft floating cards and decorative glow were removed from the core UI.
- The layout is designed in black and white first. Colour identifies state,
  evidence category, or a project accent rather than supplying structure by
  itself.
- Desktop windows retain direct manipulation. Compact and short-landscape
  viewports deliberately trade free window movement for a single usable app
  surface and a persistent app switcher.
- Long or expert material follows progressive disclosure: guided archive
  shelves, explicit detail panels, and a direct “Skip to interactive lab”
  control.

Reference: [Macintosh Human Interface Guidelines (1992)](https://tecfa.unige.ch/tecfa/teaching/LME/lombard/HIGuidelines.pdf)

## Automated evidence

| Gate | Result |
| --- | --- |
| TypeScript | Pass — `npx tsc --noEmit` |
| ESLint | Pass — no warnings in release run |
| Dependency audit | Pass — 0 known vulnerabilities at the configured threshold |
| Registry provenance | Pass — 308 package signatures and 47 attestations verified |
| Artifact boundary | Pass — 9 reviewed, hash-pinned artifacts; 9,579,048 bytes |
| Local data boundary | Pass — 1 reviewed fixture, 24 rows, no raw public endpoint |
| Project catalogue | Pass — 31 records, 27 demos, 14 experiences, 6 shelves, 5 artifacts |
| CSS-module references | Pass — 2,190 static references resolved |
| Locale inventory | Pass — 626 shell strings, 47 project summary/suite strings, 273 RUN/HACK source strings, 275 RUN/HACK translations, 216 archive keys |
| Static production build | Pass — 78 generated routes |
| Browser output budget | Pass — 97 files, 3.37 MiB; enforced cap 120 files / 4 MiB |
| Standalone runtime budget | Pass — 2,044 files, 3.16 MiB; enforced cap 2,500 files / 4 MiB |

The authoritative command is:

```bash
npm run check:release
```

## Manual browser matrix

| Surface | Sizes exercised | Checks |
| --- | --- | --- |
| Desktop shell | 1440 × 900, 1466 × 858 | window focus/drag/zoom, menu bar, project split panes, no page overflow |
| Narrow phone | 320 × 568, 390 × 844 | single-window layout, switcher, wrapping, 44 px coarse-pointer controls |
| Short landscape | 844 × 390 | usable first screen, outer scrolling, RUN/HACK two-column hero |
| PDF reader | 320 × 568, 844 × 390, desktop | worker/module delivery, rendered canvases, stage-only scroll, fallback link |
| Project archive | desktop and compact | 27 lazy exhibits mount, guided/catalogue/map views, deep links, interactive-lab skip |
| Contact chooser | 390 px touch profile | tabs, arrow/Home/End keys, email/copy/profile/project actions |
| Locales | en-GB, en-US, zh-CN, zh-TW | route metadata, document labels, archive schemas, Taiwan terminology |

Archive chrome, summaries and suite descriptions are localised. Project titles,
Portfolio Map analytical copy, longer source-traced technical evidence and
interactive lab copy remain in British English; the archive discloses that
boundary instead of implying full narrative translation.

## Defects closed in this sweep

- Replaced the broken bundled PDF.js runtime path with pinned same-origin ESM
  and worker assets generated from the installed dependency.
- Rebuilt RUN/HACK timeline geometry so the rule joins the first and last
  marker centres on desktop and compact horizontal layouts.
- Removed a nested Project-window scroll range and cleared retained compact
  offsets when resizing back to desktop.
- Made compact system menus independently scrollable and restored trigger
  focus after dismissal or state-changing menu commands.
- Replaced inert Contact service rows with keyboard-operable tabs and real
  actions; added the missing GitHub destination.
- Converted COVERD and RUN/HACK chrome away from dark gradients, glow, rounded
  cards and oversized display typography.
- Added viewport clamping when Restart restores floating windows.
- Removed client-side OpenCC from the runtime bundle; a static conversion map
  is checked against OpenCC during development instead.
- Lazy-loaded PDF, arcade, HPLC and Desk Accessory application chunks.
- Frame-limited Sketch Pad pointer updates, constrained its storage envelope,
  and reused strict calculator tape validation for both direct and backup load.
- Removed unused starter SVG assets and eliminated unrestricted `next/image`
  exceptions for reviewed local photography.
- Normalised American-English interface spellings and Taiwan-preferred terms,
  then rebuilt and visually checked the affected two-page CV PDFs.
- Localised transient archive loaders, supporting-document metadata and the
  legacy-browser essentials notice instead of allowing brief English-only UI.
- Restricted the Docker authoring context while explicitly including the two
  reviewed CV sources required by the production locale gate.

## Security and deployment boundary

- Production runs as an unprivileged user on a read-only filesystem.
- Linux capabilities are dropped; `no-new-privileges`, PID, CPU, memory and log
  limits are set; writable cache paths are explicit `noexec` tmpfs mounts.
- The Node base image is digest-pinned. Package-manager executables are removed
  from the runtime stage.
- Middleware rejects untrusted production Host headers with 421 and rejects
  state-changing HTTP methods with 405.
- Responses require CSP, clickjacking, MIME-sniffing, cross-origin and canonical
  HTTPS/HSTS protections. TLS termination and certificate renewal remain the
  reverse proxy's responsibility.
- Deployment validates `/`, `/desk`, `/projects`, `/sidequest` and
  `/en-gb/desk`, then checks the public HTTPS origin when
  `VERIFY_PUBLIC_ORIGIN=1`.

## Residual, non-blocking work

- Next.js hydration currently requires inline bootstrap scripts, so production
  CSP permits `'unsafe-inline'` for scripts while still forbidding
  `'unsafe-eval'`, inline event-handler attributes and untrusted origins.
- The four complete Mandarin dictionaries are still present in initial locale
  bundles. Splitting locale payloads at build time would reduce the English
  first load further, but it is a larger architecture change than this release.
- A Playwright suite should preserve the manual 27-exhibit, menu-focus,
  responsive and backup round-trip checks as CI regression tests.
- `public/headshot2.jpeg` is an unused legacy binary; it can be removed in a
  future asset-only cleanup after confirming it is not part of an external
  content workflow.
