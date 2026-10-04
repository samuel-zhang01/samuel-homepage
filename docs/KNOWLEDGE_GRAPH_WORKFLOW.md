# Maintaining the profile knowledge graph

The graph connects projects, work experience, education, skills, public documents, subjects and methods. Its data comes from the same records as the profile windows. The builder derives edges from stable references; the UI, search, timeline and JSON export consume that result.

| File | Owns |
| --- | --- |
| `src/data/profile.ts` | CV-backed experience, education, skills and public source records |
| `src/data/documents.ts` | Public PDFs and their project/record/source references |
| `src/data/projects.ts` | Project catalogue and optional `concepts` tags |
| `src/data/projectOrigins.ts` | Historical, curated project provenance and separately marked related context |
| `src/data/profileProjectOrigins.ts` | Lightweight shared resolver deriving provenance from profile references without duplicating records |
| `src/data/knowledgeGraph.ts` | Topic/method taxonomy, builder, relationship types and navigation contract |
| `src/data/profileKnowledgeGraph.ts` | Adapter joining profile records with project provenance |
| `src/lib/knowledgeGraphRelations.ts` | Direction-aware relation labels and reviewed CN/TW graph copy |
| `src/components/profileCopy.ts` | Reviewed translations of profile and document prose |

## Add a new experience or education record

1. Read the provided CV, LinkedIn export or other supplied evidence. Add public source metadata to `profileSources` using a stable ID and a public URL. A private file path is not a public citation. Retain the source language and distinguish original evidence from illustrative demos.
2. Add the experience to `profileExperiences` or the degree to `profileEducation`. Reuse a stable, URL-safe `id`; include dates, substantive description and `sourceIds`. Optional `conceptIds` link a record to curated subjects or methods, even before it has a public project.
3. Declare `projectSlugs` on that profile record for work developed there, and `relatedProjectSlugs` for subject connections or later independent work. New records require no duplicate `projectOrigins` entry. Related references stand alone and are not repeated in the direct list. The shared resolver supplies the desktop, project archive and graph. It rejects a project declared both direct and related; shared dates or technology names do not establish employment provenance.
4. Add or update `profileSkills` only where there is concrete evidence. Each skill declares `projectSlugs`, `originIds`, `conceptIds` and `sourceIds`. Put a project in `projectSlugs` only if it demonstrates that capability. Optional `relatedProjectSlugs` supply subject context, which the profile and graph label separately from evidence. For example, the chemistry coursework archive gives context for teaching, while the teaching role and CV substantiate the teaching claim. Direct and related lists cannot contain the same project.
5. For a reviewed PDF shipped under `public/`, add one `supportingDocuments` record with its stable ID, title, description, local `src`, `sourceIds`, and optional `projectSlug`/`originIds`. Add its prose to the profile translation table and check the document's actual public path and PDF bytes. The reader library uses local public assets and downloads the full file before previewing it, so review its byte size and startup as well. Keep an external page or PDF as an HTTPS source citation; it opens the original external URL instead of becoming a reader-library asset.

The adapter automatically includes every profile record and skill. Existing provenance records remain visible without public projects. Existing `experience:` node IDs are retained for education records so shared graph links continue to work. A degree has its own `education` kind and education route.

Historical origin labels, context and project associations remain curated in `projectOrigins.ts`; profile references add to them and do not delete or replace them. When correcting a historical association or its contextual caveat, update that origin explicitly as well as the profile claim. New records declare their references once in the profile and require no historical origin entry.

## What is derived automatically

| Declared data | Graph relationship |
| --- | --- |
| Project `concepts` (or curated `projectConcepts`) | Project explores subjects and uses methods |
| Method taxonomy parent | Method is part of a subject |
| Profile record `projectSlugs` (or historical origin `projects`) | Project was developed in the record |
| Profile record `relatedProjectSlugs` (or historical origin `relatedProjects`) | Related research context, without direct provenance |
| Direct project provenance | Record covers that project's subjects |
| Skill `projectSlugs` | Project is evidence for the skill |
| Skill `relatedProjectSlugs` | Related subject context, without asserting the project demonstrates the skill |
| Skill `originIds` | Skill was practised in the named record |
| Record or skill `conceptIds` | Related subject/method |
| Document `projectSlug` | Document describes that project |
| Document `originIds` | Document supports the named record |
| Document and record cite the same source ID whose URL identifies that PDF | Document supports the record automatically |
| Document and skill cite the same source ID whose URL identifies that PDF | Document becomes evidence for the skill automatically |

Source identity is intentional: citing the CV connects a record to the CV PDF; citing the GROWMAT showcase connects a skill to that document. The source URL must identify the actual PDF, including its domain. A case-study page may describe several attachments; citing that page does not prove a skill appears in every attachment. The local cache parameter `v` is ignored; other local query parameters and all external queries retain their meaning. Free-text similarity and date overlap never create evidence relationships. A new agent adds reviewed records and references to these data files; it does not need to hand-author canvas edges or modify rendering code.

A source entry can describe an external public page or a project case study even if it has no PDF. Source citations appear in the node inspector and exported node metadata. Edge `sourceIds` preserve the cited basis of a relationship. Automatic PDF evidence is derived only when a cited source identifies the actual library document. Explicit document/project/record references retain their separately curated meaning.

External citations keep their exact URL in every locale. Only local portfolio routes have translated editions. A document's optional `projectSlug` associates it with the project; it does not itself register a project activity. The graph opens a PDF activity only when that project's catalogue declares the exact PDF artifact. Library-only PDFs open their document record instead, so adding a related paper does not require duplicate activity declarations.

## Validate and review

Run `npm run check:profile`, `npm run check:graph`, `npm run check:locales` and `npx tsc --noEmit`. The graph check executes the actual TypeScript builder and tests node/reference uniqueness, valid public links, evidence references, project provenance, forward/reverse relation labels, a newly added record with no project, graph layouts, sharing routes and JSON export. It fails on unknown references or skills without evidence.

Review the affected profile window and `/en-gb/projects?view=map&node=experience%3A<id>` in a browser. Follow skill → project → record → source document, check document opening, and review the translated labels in both Mandarin editions. Keep existing shared IDs stable. Graph export uses schema version 2; education, skill and document nodes are distinct kinds, and public source metadata is included.

For navigation changes, run `scripts/check-profile-browser.mjs` against a copied compiled preview in Chromium, Firefox and WebKit. For layout changes, run `npm run check:resize` with `PROJECT_RESIZE_ENGINES=chromium,firefox,webkit`; it resizes actual desktop windows to 320×240 and 640×240 rather than relying only on viewport width. Both checks use `REVIEW_ORIGIN` and an external `PLAYWRIGHT_CORE_PATH`. Follow the [audit's reproduction instructions](DEEP_AUDIT_2026-10-04.md#reproduce) to prepare that preview and the QA tools.

For reader loading or cleanup changes, run `scripts/check-pdf-reader-browser.mjs` with `PDF_READER_ENGINES=chromium,firefox,webkit`. It uses the real worker and library PDFs to test cancellation, resource disposal, active failures and retry. Keep expected cancellation handling scoped to the disposed reader; preserve error UI and diagnostics for active failures.

For graph address changes, run `scripts/check-history-browser.mjs` in each browser engine. It checks native write counts, repeated keyboard activation, a rapid selection burst and Back/Forward. Keep identical URLs free of extra history writes; the browser still limits sufficiently rapid genuine changes.

Construction indexes source-to-record and source-to-skill references instead of comparing every PDF with every record. Layout groups members in one pass; visible-node priority also uses a single pass. The graph index supports direct traversal, the canvas caps visible nodes, and lists/search retain all records. Animation still interpolates coordinates for all nodes and scans edges before drawing; those operations grow with the graph even though the visible node count is capped. Profile performance again before expanding to many thousands of records. Add future records to the data model without raising the visual cap.
