# Cohesion and repository cleanup

This checkpoint brings together the System 7 artwork, depth, translations, scientific media and content improvements, followed by a targeted maintainability review.

## Structure and stale code

The 27-way demo switch is now an exhaustive typed component registry. Each entry retains its existing dynamic import and loading UI. The search builder reads that same registry and validates literal IDs, named components and duplicate mappings. Adding a demo requires a registry entry at type-check time; rendering and search use one source of truth. React components remain the unit of composition and encapsulation.

Removed the unused global project-card/grid/tool/number styles, including their mobile overrides. These belonged to the old card layout and had no application references; the current split-pane layout uses its own CSS module. Removed two unreferenced CSS marker classes. Existing prose boundaries now use the shared shadow token. The loading indicator previously animated background position on a solid background; it now has a visible striped face with stepped opacity, and reduced-motion mode disables animation.

The import scan found no orphaned application modules (middleware and type declarations are framework/compiler entry points). TypeScript found no unused local declarations or parameters. Both unused-code checks are now enabled in `tsconfig.json`, so future regressions fail validation. The optional media checklist moved from the repository root to [the media backlog](MEDIA_BACKLOG.md), with its future scope stated explicitly.

## Verification

The release check includes deployment-script fixtures, Finder checks, dependency audit/signature verification, ESLint, all data/search/localization/scientific/navigation/style gates, TypeScript, the production build and bundle limits. Browser follow-up covers demo routing, the four-language open/close lifecycle and project navigation. The full release check passed, including zero known dependency vulnerabilities, 312 verified registry signatures and 48 attestations. Compiled browser checks passed for all 40 project routes at 1440px English UK and 390px Traditional Chinese (80 visits), the lifecycle in all four locales at both widths (8 combinations), and 15 existing navigation assertions. No uncaught page errors, document overflow or KaTeX errors were recorded in the route sweep.

Rounded production output remains 118 browser files / 5.10 MiB, 249.8 KiB initial JavaScript gzip and 4.80 MiB traced application runtime. No new timing benchmark is claimed. Latest compiled QA ran on port 5177; logs and temporary scripts are in `/tmp/samuel-cleanup/`.

Earlier source figures, generated icons and review screenshots retain their attribution and provenance. Reviewed source and documentation are included in the Git checkpoint; generated builds, local caches, dependency directories and temporary QA scripts remain ignored or outside the repository. No deployment command is part of this update.
