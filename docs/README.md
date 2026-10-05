# Documentation

[README](../README.md) covers the product, local setup, release checks and Docker deployment. [Continue here](../continue.md) records the current maintenance handoff and review boundaries. [AGENTS.md](../AGENTS.md) contains the repository's working instructions.

The current portfolio has 41 project records, 28 routed project demos, nine desk apps, four locales, five library documents and 18 evidence-backed capabilities. The profile graph contains 106 nodes and 387 edges. Recent work restores the native icon originals, improves desktop/phone demo readability, adds Contact/YASA call-booking links and preserves calculator precision between operations.

The last recorded production deployment is `aed8ebc` on 5 October 2026. Its Docker-context and maskable-icon repairs, full build and focused public-origin checks are [recorded separately](VERIFICATION.md#5-october-docker-context-repair) from later checkout changes. Read each verification section's scope before treating it as evidence for a newer revision.

| Document | Purpose |
| --- | --- |
| [Verification and maintenance](VERIFICATION.md) | Current checks, historical scopes, known limits, cleanup and reproduction |
| [Profile knowledge graph workflow](KNOWLEDGE_GRAPH_WORKFLOW.md) | Source-backed records, automatic evidence links and future-agent maintenance |
| [Translation workflow](PROJECT_COPY_WORKFLOW.md) | Four locales, dynamic labels, source-language exceptions and checks |
| [System 7 design benchmark](SYSTEM7_DESIGN_BENCHMARK.md) | Maintained design contracts and primary historical sources |
| [Artwork guide](PROJECT_ARTWORK.md) | Delivered illustrations/icons, original prompts and MRI provenance |
| [Icon provenance manifest](SYSTEM7_ICON_PROMPTS.json) | Canonical subject prompts, source/delivery hashes and native-artwork recovery |
| [Project source record](PROJECT_SOURCE_RECORD.md) | Original repository revisions, file hashes and recorded scientific outcomes |
| [Project-copy audit receipts](../scripts/fixtures/project-copy-audits/README.md) | Check-only dictionary registrations, source inventories and explained source-language identities |
| [Licence](../LICENSE) | Attribution, non-commercial use and free share-alike terms for original code |
| [Third-party notices](../THIRD_PARTY_NOTICES.md) | Dependency and scientific-source licences/attribution |

For profile or document changes, start with the profile workflow and run `npm run check:profile`, `npm run check:graph` and `npm run check:locales`. Copy changes also need `npm run check:project-copy`; icon changes need `npm run check:icons` and the compiled browser audit. Run `npm run check:release` before release. The verification guide's [reproduction instructions](VERIFICATION.md#reproduce) list the external browser tools and maintained runners; the ordinary build does not require them.

Temporary review logs and screenshots belong under ignored `.codex/reports/`. Update the verification guide and concise handoff instead of adding overlapping dated reports. Archive completed local evidence outside the checkout, preserving failed attempts and their hashes. Keep scientific source records, licences and reusable QA fixtures with their consumers.
