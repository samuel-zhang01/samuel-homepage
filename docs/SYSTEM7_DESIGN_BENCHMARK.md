# System 7 design benchmark

The project interface should read as one Macintosh application: white documents, layered gray chrome, compact controls, legible content, and richer color inside the experiments. This specification targets the System 7 / 7.5 period around 1995, with explicit modern web adaptations. The values below are implementation decisions, not claims of pixel-perfect emulation.

The 9 September 2026 refinement keeps the smoother typography and accessible navigation while restoring more of the original desktop's depth. Named gray surfaces, crisp bevels, recessed lists and small hard shadows distinguish the layers. This direction follows the user's current preference and supersedes the earlier restriction to a flatter paper/chrome palette.

The subsequent usability polish adds a blue primary-action tier for opening live demos and documents, a pale-blue sharing tier, and quiet blue and warm-paper content surfaces. These are deliberate modern cues requested by the user; they retain the desktop's existing bevels, typography and neutral window frames.

## Historical reference and visual evidence

Apple’s *Macintosh Human Interface Guidelines* was first published in November 1992; the linked copy is a 1995 printing. It specifies 12-point Chicago for Roman system controls, with script-appropriate fonts and enough vertical space for other writing systems. Push buttons invert while pressed. A default button has a three-pixel outer black border separated by one white pixel. Pop-up menus show the current value and a triangle, retaining their font when opened. Color should communicate meaning and must not be the only cue. These are the historical anchors; the book does not prescribe this website’s CSS sizes or palette. [HIG, printed pp. 19–24, 60, 82–90, 204–207, 258–265][hig]

The contemporary Toolbox reference distinguishes rounded action buttons, square checkboxes marked with an X, radio buttons, pop-up menus, and scroll bars. It documents shared system controls rather than a separate bespoke skin for every application. Its illustrations are a primary reference for shape and behavior. [Inside Macintosh, chapter 5, pp. 5-2–5-7][toolbox]

Apple’s **1994 System 7.5 Upgrade Guide** provides authentic software screenshots to inspect side by side:

| Original screen | Exact reference | Visual lesson for this implementation |
|---|---|---|
| System 7.5 Installer | [Printed p. 11 / PDF p. 17][installer] | A square pop-up, white description area, grouped destination controls, dimmed unavailable action, and one outlined default button. |
| Macintosh Guide: Index | [Printed p. 35 / PDF p. 40][guide] | Three clear mode controls above two bounded lists; selected content inverts; instructions sit next to the relevant list. |
| CPU Energy Saver | [Printed p. 63 / PDF p. 68][energy] | Thin group boundaries, ordinary readable labels, distinct radio/checkbox controls, and a small status region. |

These examples support document structure and consistent controls. They do not justify copying the printed manual’s pink annotations into the application. The linked [System 7.0 gallery][gallery70] and [System 7.5.3 gallery][gallery753] are useful supplementary collections of original-software captures; 7.5.3 is a later reference, not proof of an exact 1995 release appearance. The primary Apple screenshots above are the implementation benchmark.

## Shared control library

Use one named vocabulary. Existing component classes may control placement and sizing; the shared class owns the control’s typography, border, surface, and states. A scientific plot, draggable graph node, chess square, piano key, or visual editor handle is not automatically a push button.

| Control | Shared contract | Interaction and accessibility |
|---|---|---|
| Normal action | `.s7-button`: raised light-gray face, black 1px boundary, 3px radius, highlight/shadow bevel, hard 1px outer shadow, 13px UI font. | Native button; verb label; hover lightens the neutral face; no movement or scale effect. |
| Default action | `.s7-button.is-default`: white face, retained bevel, white separation and black outer ring. | Visual priority only. The owning form/dialog must define any Return-key behavior; never hijack Enter in an editor. `MacButton primary` is a compatibility alias for this presentation. |
| Primary destination | `.s7-button.is-primary`: bold white label on blue, matching blue bevel and a 44px minimum target. | Use for live demos, applications and the principal document action. Retain an explicit verb label, hover feedback, keyboard focus and native disabled semantics. This does not imply a Return-key default. |
| Share action | `.s7-button.is-share`: white label on indigo with a matching bevel. Project toolbar actions share a 44px minimum height. | Colour does not change the button's dimensions. Label sharing explicitly. Announce copy success and present a selectable address when clipboard access is unavailable. |
| Pressed action | Native `:active`: black face and white lettering; relief disappears. | Momentary feedback while activating; distinct from persistent selection. |
| Disabled action | Native `disabled`: muted gray text/edge, neutral face, no hover/press treatment. | Preserve readable label and disabled semantics. Do not use opacity on the entire control subtree. |
| Toggle | `.s7-button[aria-pressed]`: consistent dimensions; checked marker and darker, recessed face when selected. | Selection retains its inset treatment on hover; pressing still inverts. Native button toggles one setting. Mutually exclusive form values should retain radio semantics. |
| Icon action | `.s7-button--icon`: compact square shape; restrained 16–20px artwork. | Accessible name is mandatory; tooltip is supplementary. Minimum 44px target on coarse pointers. |
| View tabs | `.s7-tabs` with `.s7-tab`: recessed gray strip, beveled inactive tabs, white selected tab with a dark top rule, clear border and normal-case label. | ARIA tab pattern only when content is an actual tab panel; use links for navigation. Keyboard arrows, Home/End and focus behavior belong to the component. Tabs are a website adaptation, not a claimed stock 1992 Toolbox control. |
| Select | `ClassicSelect`: square raised light-gray trigger, current value, downward triangle and 1px hard shadow; same UI font in trigger and list. The white option list sits inside a beveled gray frame with a small hard shadow. | Keep existing combobox/listbox, typeahead, disabled options, native form value, viewport placement and focus restoration. The expanded trigger inverts; selection uses blue plus a checkmark. |

Use the shared gray relief for ordinary controls, the outlined ring for form defaults and solid blue for primary destinations. Keep bevels crisp and shallow; metallic gradients, soft glows and pill toggles do not belong in this control family. Dark navy identifies selected content and links; the brighter action blue highlights a clear next step. Scientific series retain their domain colors and legends.

## Shared icon vocabulary

Use [`System7Icon`](../src/components/System7Icon.tsx) and the assets in [`public/system7-icons`](../public/system7-icons) across desktop shortcuts, menus, Finder results and compact project artwork. The `System7IconKind` union is the canonical vocabulary. Reuse its subject or object before adding another drawing:

| Role | Representative kinds |
|---|---|
| Navigation and records | `profile`, `computer`, `folder`, `document`, `briefcase`, `university`, `pdf`, `mail` |
| Desk tools | `note`, `sketch`, `tasks`, `clock`, `calendar`, `calculator`, `converter`, `palette` |
| Project subjects | `microscope`, `finance`, `chart`, `molecule`, `shield`, `book`, `mri`, `flow`, `network`, `orbital` |
| Activities and collections | `runner`, `game`, `accessories`, `photos`, `controls`, `secret` |

The family uses crisp dark outlines, light upper edges, a small neutral palette and restrained blue, gold or red details. Selected kinds use transparent generated PNGs; every kind has a companion SVG. Pass `miniature` for 16px menu/Finder artwork so fine raster details do not collapse. Existing desktop wrappers display 32px icons; compact project rows use 42px on desktop and 48px on narrow layouts. Let the surrounding control set the size and preserve square proportions.

Icons are decorative (`alt=""`, `aria-hidden`); translated text names the destination or action. An icon-only control still needs its own accessible label. Keep the artwork recognizable against white, gray and selected navy backgrounds. Full project illustrations remain available in document headers, while compact rows use the shared subject icons. Retain the COVERD brand asset in its existing frame.

## Typography and localization

The hierarchy below is a modern screen specification. Historical points on a low-density display are not CSS pixels on a current device.

| Role | Shared token / class | Target |
|---|---|---|
| Document title | `--s7-title` / `.s7-title` | 22px, weight 700, line height 1.2 |
| Section title | `--s7-heading` / `.s7-heading` | 18px, weight 700, line height 1.3 |
| Explanatory prose | `--s7-text` / `.s7-prose` | 15px, normal weight, line height 1.55 |
| Controls and table headings | `--s7-ui` / `.s7-label` | 13px, normal or deliberate 700 weight, line height 1.4 |
| Window title | `.mac-titlebar h2` | 13px, weight 700, line height 1.4 |
| Supporting metadata | `--s7-small` / `.s7-small` | 12px minimum, line height 1.45 |
| Source code / aligned readings | `--s7-font-mono` | Monaco/Courier family; preserve authored formatting |
| Equations | Existing `MathEquation` | KaTeX’s own glyph sizing, spacing and MathML; never style its descendant spans through a panel selector |

Chrome uses the existing Chicago/Geneva system stack; prose uses Geneva and readable platform sans-serif fallbacks. This is a local-font strategy, not a new font download. Do not embed proprietary historical fonts merely to obtain a bitmap appearance. Keep antialiasing and browser zoom available.

Simplified Chinese uses PingFang SC / Microsoft YaHei / Noto Sans CJK SC fallbacks; Traditional Chinese uses PingFang TC / Microsoft JhengHei / Noto Sans CJK TC. These are explicitly modern substitutes. Preserve `lang` and the locale boundary. Do not convert a Traditional Chinese string merely by changing its font. Leave at least 1.4 line height in chrome, permit labels to wrap, and never shrink CJK text to fit a Latin-width button. Use sentence case for descriptive labels; preserve genuine acronyms, code identifiers and source quotations. Remove decorative uppercase and tracking in migrated chrome.

## Palette, structure and notes

| Token | Value | Intended role |
|---|---|---|
| `--s7-ink` | `#000` | Text and primary boundaries |
| `--s7-paper` | `#fff` | Documents, lists, inputs and default button faces |
| `--s7-surface` | `#f2f2f2` | Light supporting surfaces, menus and control hover faces |
| `--s7-raised` | `#e8e8e8` | Ordinary button/select faces, menu bar and active title label |
| `--s7-chrome` | `#d6d6d6` | Toolbars, window frames, inactive tabs and status areas |
| `--s7-recess` | `#bcbcbc` | Recessed tab strips, selected toggles and backing surfaces |
| `--s7-highlight` | `#fff` | Top/left raised edges and bottom/right inset edges |
| `--s7-edge` | `#777` | Raised/inset relief edges, secondary boundaries and hard control shadows |
| `--s7-shadow` | `#aaa` | Fine rules and secondary structure |
| `--s7-muted` | `#555` | Supporting text on white/gray |
| `--s7-selection` | `#11177a` | Selected rows/options, links and navigation cues |
| `--s7-selection-text` | `#fff` | Text on selection |
| `--s7-action` | `#214ea5` | Primary destination face and sharing edge |
| `--s7-action-hover` | `#173b84` | Primary destination hover face |
| `--s7-action-edge` | `#122d66` | Blue action boundary and sharing label |
| `--s7-action-soft` | `#e8eefb` | Document/demo headers and walkthrough surfaces |
| `--s7-share` | `#514293` | Sharing face; white text has 8.23:1 declared-colour contrast |
| `--s7-share-hover` | `#403278` | Sharing hover face |
| `--s7-share-edge` | `#302660` | Sharing boundary and dark bevel |
| `--s7-context-paper` | `#f8f5ec` | Quiet contextual notes and the latest-project card |

These tokens give each shade a consistent structural role. Reuse them for new chrome instead of introducing unrelated colors. White remains the main reading surface; depth comes from the surrounding frame and controls, with pale blue and warm paper reserved for supporting tiers. Primary white-on-blue text has 7.78:1 contrast, its hover state 10.53:1, and the sharing label 11.33:1. The selection colors and scientific palettes retain their separate meanings.

| Structural token | Contract |
|---|---|
| `--s7-relief-raised` | Inset 1px top/left white highlight and 1px bottom/right `--s7-edge` (`#777`) shadow. |
| `--s7-relief-inset` | Inset 1px top/left `--s7-edge` shadow and 1px bottom/right white highlight. |
| `--s7-frame-well` | Outer 1px top/left `--s7-edge` shadow and 1px bottom/right white highlight around a bounded well. |
| `--s7-title-lines` | Repeating 4px horizontal pattern: 1px white, 1px `--s7-edge`, then 2px `--s7-raised`. Keep the title label on a solid face. |
| `--s7-popup-shadow` | A 3px hard black shadow at 35% opacity. |

Components may add a small outer shadow to lift an action or frame. Selected toggles and inputs use inset relief; `.s7-well` combines inset relief with the outer well frame. Apply textures to narrow chrome areas, such as title bars and the ribbed project-tab backing, while retaining plain reading surfaces.

- Use one-pixel internal rules; reserve stronger boundaries for the window and default-action ring. Avoid putting every paragraph inside a raised box.
- `.s7-panel` is a white bounded region. `.s7-well` adds a recessed white surface where a list or bounded content area needs it. `.s7-toolbar` groups related controls on beveled gray chrome with an 8px gap and wrapping. Use 12–16px panel padding and 16–24px between major sections.
- Desktop windows use a narrow gray inner frame, a recessed document boundary and a hard outer shadow. Active title bars retain their horizontal pattern with gray lines and white highlights; the title itself stays on a solid, readable surface.
- `.s7-table` uses a light-gray header with a top highlight, white rows, thin horizontal rules, left-aligned labels and tabular numerals. A selected row uses the selection colors. Wide data tables scroll in their own labeled region; prose must still reflow.
- `.s7-note` is a plain labeled note with a thin border. Internal audit receipts belong in development documentation. A visitor-facing limitation belongs beside the result it qualifies. Remove tinted caution strips from ordinary explanation; actual errors retain explicit text and a recognizable status cue.
- Keep color maps, molecule atoms, graph clusters, uncertainty bands and charts inside their bounded scientific region. Their legends carry meaning; shell unification must not recolor them.

## Project browser

The knowledge graph remains the first view. **Selected work** and **All projects** use a left list pane with visible search and discipline filters, alongside the selected project's details in the right pane. Selecting a row updates those details within the same project window. The list and detail content scroll independently, with gray framing and white content wells separating their roles.

Project details offer explicit **Open in new tab** and **Open live demo** actions where applicable, alongside the project's website, files, application and repository links. Embedded demonstrations open on request. **Connections** returns to the graph with the project selected. At narrow widths, the list and detail views take turns using the available width; **Back to list** restores browsing. Keep these controls and their labels available in English and both maintained Mandarin editions.

The graph uses the same recessed backing to separate its white canvas from the pale inspector, with raised controls and disclosure bars around them. Documents use a double header seam, fine section rules and a recessed frame around live experiments. Demo anchor spacing follows the measured sticky toolbar height so wrapped controls remain clear of the destination. See the [depth refinement review](archive/SYSTEM7_DEPTH_REFINEMENT_2026-09-09.md) for the earlier-version comparison, inspected primary screenshots and representative browser checks.

## Modern accessibility requirements

Use at least 44px targets for coarse pointers and compact touch layouts as a deliberate project adaptation. WCAG 2.2 AA’s target-size criterion is 24 CSS pixels or qualifying spacing/exceptions; 44px is our more generous choice, not a System 7 measurement. [W3C target-size guidance][targets]

Normal text needs at least 4.5:1 contrast; larger text has a 3:1 threshold. Default, focus, hover, selected and disabled states must remain distinguishable without relying on hue alone. [W3C contrast guidance][contrast] The keyboard focus indicator is separate from the default-button ring. Keep reduced-motion support, browser zoom, semantic headings, native disclosure controls, keyboard access and visible scrollbars. Test 320px, 390px, 768px and desktop widths in English, Simplified Chinese and Traditional Chinese, including 200% zoom.

## Repository findings and migration

The initial audit found 39 project CSS modules and 26 project TSX files importing `DemoChrome`. The following findings motivated the shared control library and remain useful guidance when extending it:

| Location | Initial issue | Implementation guidance |
|---|---|---|
| `src/app/globals.css` | Global `.mac-button`, broad desktop/accessory styles, separate locale font variables. | Import `system7.css` once. Keep desktop behavior stable; reuse neutral/relief tokens for menu and window surfaces. Opt project documents into `.system7-project`. Do not append a universal button override. |
| `DemoChrome.tsx/.module.css` | Separate MacButton skin; tinted paper, striped body, blue purpose card, 10px tracked metadata. | Emit shared root/button classes; simplify shared frame and instruction disclosure; retain props, localization and demo content. |
| `ClassicSelect.module.css` | Tripled `.trigger` specificity and separately hardcoded palette/font values. | Consume shared tokens and use one explicit trigger attribute/class selector; preserve behavior and portal styling. |
| Project CSS modules | Repeated `viewTabs`, `panelHeading`, `metricGrid`, action colors and literal font sizes. Some files contain a second appended “System 7 surface pass.” | Migrate a whole named control group at once. Delete its superseded skin declarations, retain layout rules, and add canonical classes in its TSX. |
| Scientific/math panels | Broad descendant `span` selectors previously damaged KaTeX. Some SVG styles intentionally use color/size overrides. | Scope authored text selectors to actual children; leave SVG/canvas and `[data-math-equation]` subtrees untouched. |

Implement shared tokens and explicit classes first, then the archive/project document controls, then demo navigation/action groups, then prose and notes. Retain useful descriptions, interactive state and simulation calculations. Replace internal source receipts with the project’s purpose, method and carefully described results. Do not use `!important`, wildcard descendants, runtime DOM restyling or ever-increasing repeated classes as a migration mechanism. A low-specificity rule can establish defaults; it cannot reliably replace an old higher-specificity skin until that skin is removed.

Validation should include one control-state matrix covering normal/default/focus/pressed/disabled/toggle/icon/tab/select; narrow translated labels; keyboard navigation; popovers near screen edges; and representative scientific surfaces. This matrix belongs in development/QA, not as another visible portfolio view. CSS-module resolution and production build checks complement visual review; neither proves that a button is readable.

## Sources

1. Apple Computer, *Macintosh Human Interface Guidelines*, first published November 1992; linked copy is a 1995 printing. [Full primary document][hig]. Printed page numbers are 23 lower than the zero-index PDF page numbers in this copy.
2. Apple Computer, *Inside Macintosh: Macintosh Toolbox Essentials*. [Apple-hosted primary reference][toolbox], chapter 5, Control Manager.
3. Apple Computer, *Macintosh System 7.5 Upgrade Guide*, 1994. [Primary manual mirrored by MacHut][upgrade], screenshots at printed pp. 11, 35 and 63.
4. GUIdebook / Marcin Wichary, [System 7.0][gallery70] and [System 7.5.3][gallery753] screenshot collections. Supplementary period-software evidence; gallery publication/capture date differs from software release date.
5. W3C WAI, [Understanding SC 2.5.8: Target Size (Minimum)][targets] and [Understanding SC 1.4.3: Contrast (Minimum)][contrast]. Current web accessibility adaptations.

[hig]: https://tecfa.unige.ch/tecfa/teaching/LME/lombard/HIGuidelines.pdf
[toolbox]: https://developer.apple.com/library/archive/documentation/mac/pdf/MacintoshToolboxEssentials.pdf
[upgrade]: https://machut.net/files/manuals/mac_os_7/0307163ASYS75UPG.PDF
[installer]: https://machut.net/files/manuals/mac_os_7/0307163ASYS75UPG.PDF#page=17
[guide]: https://machut.net/files/manuals/mac_os_7/0307163ASYS75UPG.PDF#page=40
[energy]: https://machut.net/files/manuals/mac_os_7/0307163ASYS75UPG.PDF#page=68
[gallery70]: https://guidebookgallery.org/screenshots/macos70/
[gallery753]: https://guidebookgallery.org/screenshots/macos753/
[targets]: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
[contrast]: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
