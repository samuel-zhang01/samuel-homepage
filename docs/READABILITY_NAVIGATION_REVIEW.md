# Readability and navigation review — 11 October 2026

This pass reviewed the portfolio as a visitor trying to understand Samuel's work, choose a project, try an experiment and return to where they started. Three parallel reviewers examined profile copy, navigation and interactive explanations. A second independent review checked the other reviewers' changes. Real Computer Use in connected Edge supplied the visitor journeys and visual checks.

The strongest confusion came from controls whose labels promised a different result, graph state surviving a view change, and technical or internal language appearing before a plain explanation of the work. The System 7 visual language and existing project evidence are preserved.

## Findings and repairs

| Confusing point or path | Why it was confusing | Refinement |
| --- | --- | --- |
| About: `Current · Stealth Startup` beside the career record | The quick fact appeared to identify a current employer, while Experience showed a different current role. | Use the source-backed `Work · Applied AI & product`; no new employment claim. |
| About: COVERD's selected-work description | ATS, specialist dimensions and voice enrichment appeared before its recruitment purpose. | Explain that it reviews applications and supplies a reasoned shortlist, with the recruiter making the decision. |
| About: GROWMAT's selected-work description | Public/private availability did not tell a first-time visitor what the product does. | Lead with laboratory workload and capacity planning, then offer the public showcase. |
| Contact: `YASA booking` | A product name did not explain that the destination books time with Samuel. | `Book time with Samuel`, with a visible note that the booking page opens in a new tab. |
| Experience/education: first project action opened the graph | `Explore connections` was vague and took visitors through an extra map step before the concrete work. | Put project destinations first; name the secondary destination `View relationship map`. |
| Graph subject → All projects → refresh | The URL retained `node`; refresh returned to the graph and the browser title described the wrong view. | Clear the node on either archive-tab exit and `/`; explicit list/selected-work views take precedence over a legacy node. |
| Project Connections → keyboard focus | The graph appeared but focus moved to the inactive Selected work tab. | Focus the graph tab that is actually selected. |
| Archive selection → demo → Back to project | Returning opened an additional standalone project window over the archive already showing that document. | Restore the originating archive selection and filters when it remains available and matches the activity; retain the standalone-document fallback for other origins. |
| Find → search `Start Here` | The visible desktop label was absent from the app search index. | Include English and localized desktop labels alongside window titles and descriptions. |
| Special → `Hide All Windows` | The implementation closes and unmounts the windows, resetting disposable demo state. | Name the existing action `Close All Windows` in all four locales. |
| Course finder → Inspect | Only the selected-row styling changed; no inspection opened. | Open Explain for the clicked course, bring its workspace into view and focus it. |
| Course Explain/What if → select a course outside the top four | The effective shortlist selection overrode the chosen course, making selection appear broken. | These inspection views retain the actual course selection; recommendation selection still follows its visible shortlist. |
| Course explanation: equations touching prose and headings behind the sticky toolbar | Adjacent `w`, `v` and evidence text ran together, and automatic scrolling concealed the explanation's beginning. | Add visible separators and a responsive scroll margin below the toolbar. |
| Spectrum → Reset full view | The reset restored a 70 MHz peak window rather than the entire trace. | Show all 1,201 synthetic samples from 2,000 to 8,000 MHz and confirm the result in the status text. |
| Spectrum → very narrow range or Apply ±1 | A drawn line could coexist with zero sampled rows; the recovery advice allowed another empty interval. | Explain the 5 MHz sample spacing and interpolation; advise a wider interval or a sampled centre. Centre feedback distinguishes an empty interval from fitted sample data. |
| Italian Recall and daily practice | The demo claimed due-date scheduling despite cycling four example cards, and five practice questions were labelled as balancing seven skills. | Describe an interval calculator and four-card cycle; show `5 exercises from 7 skills`. The guide's interpretation now describes calculated intervals rather than waiting for due dates. |
| Mandarin AKC qualification | The translation implied a fellowship rather than the supplementary King's programme. | Preserve the English credential and describe the supplementary programme qualification. [King's programme description](https://www.kcl.ac.uk/akc) supports this distinction. |

All changed visitor copy has explicit Simplified and Traditional Chinese equivalents; UK/US English uses the existing regional resolver. Project IDs, profile qualifiers, calculations, original scientific media and source destinations remain intact.

## Scope and boundaries

Source review covered About, Contact, experience, education, skills, Documents, Finder, menus, the archive and activity lifecycle. Representative explanation review also checked MRI, CFD, microrobots, cliff learning, thermodynamics, solubility, finance import and coverage shift. These source reviews are distinct from the live browser journeys recorded in [verification](VERIFICATION.md#readability-and-navigation-refinement--11-october-2026).

Two established navigation quirks remain documented rather than being redesigned during this pass:

- Desk accessories share the `/desk` directory route. Reloading an open calculator or Note Pad opens the directory rather than that exact tool. In-session window switching remains available.
- Ordinary desktop app opening/focusing replaces the browser address, while project transitions can add history entries. Browser Back is therefore not a complete history of desktop window focus; the menu, launcher and phone switcher remain the app navigation controls.

The MSc's predicted degree result remains qualified; a completed date alone does not establish a confirmed final result. No booking was submitted, message sent, private evidence published or production deployment made during this review.

The final verification receipt records the compiled/browser scope and any build-gate limitation. Earlier screenshots and test results are not counted as a new full-site, cross-browser or physical-phone study.
