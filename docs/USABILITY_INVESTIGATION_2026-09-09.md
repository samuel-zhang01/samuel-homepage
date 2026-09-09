# Homepage usability investigation

Reviewed local revision `a60ee8e` on 9 September 2026 using native Microsoft Edge through computer use. No application code was changed. The working tree was clean at the start. The local Next.js development server was started at http://localhost:5174.

## Current changes

The two latest feature commits introduce shared System 7 icons, layered project browsing and standalone project documents, richer project/experience copy, bilingual refinements, recorded MRI imagery, consolidated demo routing, and visibility-aware scientific/game playback. Existing release reports describe extensive automated checks; those historical results were not rerun or counted as this investigation's tests.

## Findings, in priority order

1. **Primary portfolio actions sit too far down the initial About window.** In the observed desktop layout, the biography, working-style panel and RUN/HACK feature fill the visible window. Selected projects is below the fold; Download CV and Contact Samuel are substantially further down. Desktop icons provide alternatives, but visitors must discover them. Put Projects, CV and Contact directly below the opening identity/summary, while retaining the field note further down. Source: `SystemSevenDesktop.tsx`, About content around lines 850–930.

2. **Projects defaults to a complex graph instead of the curated portfolio.** A single click on the desktop Projects icon opened `?view=map`, showing 59 nodes. Labels and links cluster centrally; the subject strip clips at the right edge at the tested desktop size. The selected-work list is a much clearer route to a concrete project. Recommend Selected work as the default, retaining Knowledge graph as an exploration option. This is a usability recommendation, not a functional failure. Source: `ProjectExplorer.tsx:45–53`.

3. **Cold demo opening needs a controlled reproduction.** In Selected work, searching MRI narrowed the list correctly. Clicking Open live demo mounted the demo and changed the button to Go to live demo, but the subsequent screenshot still showed the overview at the top. A later computer-use call detected an external user change, so this observation is not sufficient to declare a reproducible defect. The standalone project's mobile Explore the project action subsequently scrolled successfully. Recheck a cold embedded demo with no concurrent interaction, after its lazy module resolves. Source: `ProjectDocument.tsx:64–78`.

4. **Mobile navigation consumes substantial vertical space.** At a 400 × 818 emulated viewport, four sticky project actions form two rows; after jumping to the MRI demo, the close-demo panel, title, help disclosure and research introduction occupy most of the remaining visible area. Text and controls fit, but reaching an experimental control requires more scrolling. Consider a compact primary action row with secondary actions in a menu and a shorter demo introduction.

5. **The first visit has an artificial startup delay.** The boot screen hides the portfolio until completion, although an Enter the portfolio now button is provided. Source confirms a 2,800ms normal duration and 700ms reduced-motion duration. Consider making this opt-in or letting the portfolio appear immediately with a small decorative startup cue. This timing is from source, not a measured performance benchmark.

## Checks completed

- Opened the local homepage and visually inspected the initial desktop.
- Opened Projects with one click; switched to Selected work.
- Searched for MRI and verified one relevant result and matching detail content.
- Opened the embedded MRI demo and inspected its accessible controls.
- Used Command-K, typed MRI, and pressed Return to open the corresponding standalone project window.
- Inspected the standalone document at a 400 × 818 responsive viewport and verified Explore the project scrolls to its demo section.
- Inspected the visible development console: the observed messages were React development guidance and Fast Refresh; DevTools also indicated three improvement issues, which were not investigated.

## Limits

This is a focused manual review of the local development revision, not the deployed website, a full regression pass, a performance measurement, or an assistive-technology certification. No multilingual interaction pass, physical touch-device test, full CV download flow, complete browser-history matrix, or game lifecycle retest was performed. Native computer-use state changed externally during the embedded demo follow-up; the suspected cold-load scroll issue is explicitly provisional.
