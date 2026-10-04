# Working on this portfolio

Keep the System 7 visual language consistent. Use the shared typography, icon sizes, paper/chrome colours and bevelled controls in `src/app/system7.css`. Preserve the hard window shadows. Scientific plots, game boards and instrument states can retain colours that communicate their data.

Render interface icons with `System7Icon` and register app/project identities in `src/lib/iconIdentity.ts`. Use the same generated PNG for desktop, menus, Finder, title bars and app interiors. Use 16px for inline/navigation icons, 32px for document/card icons and 48px for desktop launchers. New identities require explicit entries; avoid alternate SVG miniatures, emoji artwork and generic fallbacks. Keep prompts and hashes in `docs/SYSTEM7_ICON_PROMPTS.json`, then run `npm run check:icons` and the compiled icon browser audit for affected surfaces.

For new experiences, education, capabilities or documents, follow [the profile graph workflow](docs/KNOWLEDGE_GRAPH_WORKFLOW.md). Read the supplied evidence first, then add records and stable references to `src/data/profile.ts` and `src/data/documents.ts`. Declare a new record's direct `projectSlugs` and `relatedProjectSlugs` there once. The shared resolver and graph adapter update profile links, project provenance, graph navigation and export automatically.

Connect each capability to concrete project or role evidence and named sources. Keep direct work distinct from related research. Dates and similar technology names do not establish provenance. Preserve stated qualifiers such as a predicted degree result. Read an uploaded LinkedIn export before using it; unavailable pages cannot substantiate new claims. Private files can inform a record but must not become public URLs.

Add reviewed copy for all four locales. Keep existing anchor and graph IDs stable. Run `npm run check:profile`, `npm run check:graph`, `npm run check:locales` and the checks appropriate to the change. Review affected browser journeys, including source documents, keyboard navigation and a narrow mobile window.

Update the current audit and `continue.md` with the actual scope of verification. Preserve unrelated working-tree changes. Temporary screenshots and QA logs belong under ignored `.codex/reports/`.
