# Documentation

[README](../README.md) covers the product, local setup, release checks and Docker deployment. [Continue here](../continue.md) records the current maintenance handoff and review boundaries. [AGENTS.md](../AGENTS.md) contains the repository's working instructions.

The current portfolio has 42 project records, 29 routed project demos, nine desk apps, four locales, six library documents and 18 capabilities. The profile graph contains 108 nodes and 392 edges. The October explanation pass leads with Selected work, adds Ultra Convert and updated VideoMate walkthroughs, and uses original reports and saved scientific results to explain each project.

The last recorded production deployment is `cc3c03c` on 11 October 2026. Its Docker document packaging and PDF reader repairs, healthy deployment, public HTTPS verification and focused four-locale desktop/phone checks are [recorded here](VERIFICATION.md#docker-document-packaging-repair--11-october-2026). The earlier [locale repair](VERIFICATION.md#6-october-production-redeployment) and [Docker-context/maskable-icon repairs](VERIFICATION.md#5-october-docker-context-repair) retain their separate scopes. Read each verification section's scope before treating it as evidence for a newer revision.

| Document | Purpose |
| --- | --- |
| [Explanation pass](PROJECT_REFINEMENT.md) | Goals, ownership and completion tracking for the October project refinement |
| [Readability and navigation review](READABILITY_NAVIGATION_REVIEW.md) | Seventeen confusing points, repairs, real UI experiments and remaining navigation boundaries |
| [Visitor comprehension review](PROJECT_VISITOR_REVIEW.md) | Adversarial desktop/phone grades, initial failures and repairs |
| [Additional project review](PROJECT_VISITOR_REVIEW_ADDITIONAL.md) | Purposeful demo journeys for the remaining research and utility projects |
| [Decision and research review](PROJECT_VISITOR_REVIEW_DECISIONS.md) | Six further desktop/phone journeys, changed outcomes and interpretation repairs |
| [Academic source research](ACADEMIC_PROJECT_RESEARCH.md) | Original IX repositories, course materials, recorded outcomes and interpretation |
| [Product source research](PRODUCT_REFINEMENT_RESEARCH.md) | Ultra Convert and VideoMate features, preview installation and verification |
| [Interactive product checkpoint](INTERACTIVE_PRODUCT_CHECKPOINT.md) | Native showcases, rule/watch/repair/booking tasks and capture limits |
| [Interactive research checkpoint](INTERACTIVE_RESEARCH_ROOT.md) | Source mapping, meaningful experiments, independent reviews and final compiled checks |
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
