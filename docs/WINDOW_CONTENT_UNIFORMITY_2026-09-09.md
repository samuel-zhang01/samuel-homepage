# Window and content uniformity — 9 September 2026

The screenshot follow-up repairs shared window controls, brings sharing into line with neighbouring buttons, and makes explanatory content visible in the portfolio's own voice.

## Historical window correction

The September 5 version retained a rule introduced in `8ebe232` on September 4: coarse-pointer close/zoom buttons became 44px tall with negative vertical margins, but their drawn squares kept fixed top offsets. This caused the square to sit too high in the striped title bar.

Close and zoom artwork now centre within their buttons. Compact and coarse-pointer title bars contain the full 44px target in a 45px bar; fine-pointer desktop title bars remain 26px. Resize targets remain at the lower-right corner and use consistent relief, hover, pressed and focus states. Double-clicking a zoom button cannot also trigger the title-bar double-click handler.

## Buttons and visible content

- Share project, Share demo and Share PDF use white labels on indigo. Their colour treatment no longer changes padding or height. Project toolbar actions use a common 44px minimum height and stretch together if text wraps. Primary destination actions retain blue. Declared white-on-indigo contrast is 8.23:1.
- The contribution paragraph is an ordinary **What I did** section. Demo guidance is a prominent heading, purpose paragraph and readable Try this / Watch content, with a single-column arrangement in narrow windows.
- Related explanations, calculations, methodology, result tables, scientific notes and supporting records are permanent sections. Functional project folders, the periodic-table control and graph navigation retain their own interaction state. Lazy images and deferred demo loading remain intact.
- Personal project, career, desktop and demo narration uses I/my, with reviewed Simplified and Traditional Chinese equivalents. Names remain where they identify the author, collaborators, source credits or documents. Traditional Chinese shared demo labels and CV terminology now consistently use 互動示範 and 履歷.

## Verification

- Native Edge computer use checked the compiled 320px GROWMAT reader: centred close artwork, aligned action row, successful copy feedback, and closing back to the project. Desktop checks covered equal-height sharing/navigation actions, always-visible COVERD contribution, restore/maximise controls, title-bar dragging and lower-right resizing.
- The compiled CV demo shows instructions immediately as headings and paragraphs in English and Traditional Chinese. The development review also checked the 320px and 440px layouts. Desktop and responsive viewport checks are not a physical-phone or exhaustive assistive-technology certification.
- Compiled HTTP crawl passed **284/284 routes** across four locales: 160 project overviews, 108 demos and 16 PDFs. All returned 200, the correct language and expected window, without server error digests. Additional overview checks covered 160 explanations, 120 contribution sections and 148 privacy sections: their rendered text is outside disclosures and the old contribution heading is absent. This does not count as 284 manual interaction tests or a check of lazily loaded demo prose.
- Full ESLint, all prebuild repository gates, production compilation and output validation passed. The final terminology changes were followed by fresh search generation, search/copy/locale checks, targeted lint and another production compile. No new dependency or font was added.

Temporary reports are under `/tmp/homepage-uniform-*`. The compiled build is `.next-uniform`; review uses port 5195 and the existing port 5180 preview is refreshed at handoff. No remote push or deployment is part of this checkpoint.
