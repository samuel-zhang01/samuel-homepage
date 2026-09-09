# Desktop windows and CV review — 9 September 2026

> Historical review of an earlier checkpoint. For the current implementation, language coverage and validation, see the [documentation index](../README.md). Counts and release conclusions below apply only to the recorded checkpoint.

Reviewed a dedicated Edge CUA tab on `http://127.0.0.1:5174`, at the browser's approximately 1466 × 854 desktop size and 390 × 844 mobile size. This supplements the scientific review; the parent task owns production build verification. No email or external contact message was sent.

## Browser coverage

- **Documents:** opened the compiled English CV, maximised the reader, zoomed from 100% to 60% and reset, scrolled continuously into page 2, and switched to the seven-page reinforcement-learning syllabus. Both document selections loaded. The rebuilt Simplified Chinese CV subsequently loaded through its new cache-version URL on mobile, with translated controls and both page images present.
- **Contact:** inspected Internet, Electronic Mail and LinkedIn tabs. The email destination is a `mailto:` link; social destinations are the correct displayed profile URLs. Readable text and controls remain inside the window. Contact destinations were inspected without launching mail or sending anything.
- **Desk Arcade:** inspected the seven-game menu and Minefield. A revealed mine produced the loss state; New field reset it; flag mode marked a cell and changed the remaining-mine count to 9. On Simplified Chinese mobile, switched to Snake, started it, then paused it after visible movement. Direction controls and start/pause/reset actions remain reachable by vertical scrolling.
- **Finder:** opened File → Find, entered `microrobot`, obtained one matching project and used Open to launch its project window. Result selection is readable against the blue selection background.
- Mobile arcade width remained exactly 390 px without document-level horizontal overflow. The mobile viewport override was reset. The latest document-page warning/error console log was empty.

## Corrections

### Mobile arcade copy

Existing helper, status and score-label text was 7–10 px. A narrow mobile rule in `src/app/globals.css` raises explanatory paragraphs, statuses, score labels, key hints and labelled action buttons to 12 px with the existing system font. Pixel-grid/game artwork is unchanged. Computed browser styles confirmed 12 px in the Snake header, status, score labels and keyboard hint.

### Restore the accurate 2023 CV research description

The reader exposed a stale CV bullet assigning the separately dated GROMACS setup to the June–July 2023 King's research role. The older source at `874e1ed:others/CVtemplateAI.tex`, in its Royal Society / King's summer-research entry, explicitly describes analysing protein–membrane interactions in silico and iterating experimental design.

The corrected English bullet is:

> Studied protein–membrane interactions in silico and used the analysis to refine experimental design.

Natural CN/TW equivalents replace the same stale bullet. The role title, dates, other claims and document design remain unchanged. Older performance/distributed-computing claims were not restored.

Updated sources are `others/Samuel-Zhang-Applied-AI-CV.tex` and the three maintained files under `others/localised-cv/`. English editions were rebuilt with pdfLaTeX; Mandarin editions with XeLaTeX. Simplified Chinese resolves the same TeX Gyre Termes and AR PL SungtiL GB fonts by TeX Live filename because family-name lookup was unavailable on this Mac. The Traditional Chinese edition retains its existing Times New Roman / Songti TC fallback.

All eight rendered pages were visually inspected before replacing public PDFs. All four remain two pages with unchanged first-page extracted text. Second-page text differences are confined to the corrected bullet and incidental extraction spacing. No compilation warnings, missing characters or overfull boxes were reported.

Public PDF hashes and the four `src/lib/i18n.ts` URL cache versions were updated together:

| Edition | SHA-256 |
| --- | --- |
| en-GB | `216b048d4bcccaa7ffc753e131998ce12203250b71b8810c637cdaade13215b8` |
| en-US | `faa600bc92f8d3b035d36e8d1e00d1f6c7eb450b7a0f2077f3fb9bac9d80d973` |
| zh-CN | `a4d6ac8c0877b8fdc65ddcf17ed777327d4a92aa6f2fc496dda8a2535158b35d` |
| zh-TW | `92a17e0355a076b269b756e410893ce7c27ac4a07a2d2cb6c1d41395f9d21114` |

## Verification and local evidence

Passed `check-project-artifacts.mjs` (192 hash-pinned files), `check-locales.mjs`, `check-project-css-modules.mjs`, `npx tsc --noEmit`, and scoped whitespace checks. Browser interaction verifies the small CSS change; no game logic was changed.

Preferred screenshots under `/tmp/desktop-browser-qa/`:

- `documents-cv-desktop.png`: desktop reader before the content-only CV correction.
- `documents-cv-page2.png`: evidence of the original dated-claim mismatch.
- `documents-cn-mobile-updated.png`: rebuilt Mandarin CV and current URL version.
- `contact-desktop.png`: contact window and readable default tabs.
- `arcade-menu-desktop.png`: seven-game menu and Minefield.
- `finder-microrobot-desktop.png`: one-result Finder search.
- `snake-cn-mobile-paused.png`: touch start/pause interaction before typography correction.
- `snake-cn-mobile-readable.png`: final 12 px helper/status labels.

Reviewed PDF renders and compile logs are under `/tmp/cv-research-correction/<PDF basename>/`; each contains `review-1.png`, `review-2.png`, the rebuilt PDF and extracted `text.txt`. The prior public PDFs are retained in that temporary directory with `-before.pdf` suffixes. These are local QA artifacts, not site assets.

This was a representative game interaction review, not an exhaustive playthrough of all seven games.
