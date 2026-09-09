# System 7 design benchmark

The project interface should read as one Macintosh application: a quiet document surface, a compact control layer, legible content, and richer color inside the experiments. This specification targets the System 7 / 7.5 period around 1995, with explicit modern web adaptations. The values below are implementation decisions, not claims of pixel-perfect emulation.

## Historical reference and visual evidence

Apple’s 1992 guidance specifies 12-point Chicago for Roman system controls, with script-appropriate fonts and enough vertical space for other writing systems. Push buttons invert while pressed. A default button has a three-pixel outer black border separated by one white pixel. Pop-up menus show the current value and a triangle, retaining their font when opened. Color should communicate meaning and must not be the only cue. These are the historical anchors; the book does not prescribe this website’s CSS sizes or palette. [HIG, printed pp. 19–24, 60, 82–90, 204–207, 258–265][hig]

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
| Normal action | `.s7-button`: white face, black 1px boundary, 3px radius, hard 1px shadow, 13px UI font. | Native button; verb label; hover stays neutral; no movement or scale effect. |
| Default action | `.s7-button.is-default`: white separation and black outer ring. | Visual priority only. The owning form/dialog must define any Return-key behavior; never hijack Enter in an editor. `MacButton primary` is a compatibility alias for this presentation. |
| Pressed action | Native `:active`: black face and white lettering; relief disappears. | Momentary feedback while activating; distinct from persistent selection. |
| Disabled action | Native `disabled`: muted gray text/edge, neutral face, no hover/press treatment. | Preserve readable label and disabled semantics. Do not use opacity on the entire control subtree. |
| Toggle | `.s7-button[aria-pressed]`: consistent dimensions; checked marker and inset face when selected. | Native button toggles one setting. Mutually exclusive form values should retain radio semantics. |
| Icon action | `.s7-button--icon`: compact square shape; restrained 16–20px artwork. | Accessible name is mandatory; tooltip is supplementary. Minimum 44px target on coarse pointers. |
| View tabs | `.s7-tabs` with `.s7-tab`: gray inactive tabs, white selected tab adjoining its document, clear border and normal-case label. | ARIA tab pattern only when content is an actual tab panel; use links for navigation. Keyboard arrows, Home/End and focus behavior belong to the component. Tabs are a website adaptation, not a claimed stock 1992 Toolbox control. |
| Select | `ClassicSelect`: square white trigger, current value, downward triangle, 1px hard shadow; same UI font in trigger and list. | Keep existing combobox/listbox, typeahead, disabled options, native form value, viewport placement and focus restoration. Selection uses blue plus a checkmark. |

Avoid mixing permanent blue action buttons, outlined default buttons, metallic gradients, colored call-to-action cards, and pill toggles in one toolbar. Blue identifies selected content and links. Scientific series retain their domain colors and legends.

## Typography and localization

The hierarchy below is a modern screen specification. Historical points on a low-density display are not CSS pixels on a current device.

| Role | Shared token / class | Target |
|---|---|---|
| Document title | `--s7-title` / `.s7-title` | 22px, weight 700, line height 1.2 |
| Section title | `--s7-heading` / `.s7-heading` | 18px, weight 700, line height 1.3 |
| Explanatory prose | `--s7-text` / `.s7-prose` | 15px, normal weight, line height 1.55 |
| Controls and table headings | `--s7-ui` / `.s7-label` | 13px, normal or deliberate 700 weight, line height 1.4 |
| Supporting metadata | `--s7-small` / `.s7-small` | 12px minimum, line height 1.45 |
| Source code / aligned readings | `--s7-font-mono` | Monaco/Courier family; preserve authored formatting |
| Equations | Existing `MathEquation` | KaTeX’s own glyph sizing, spacing and MathML; never style its descendant spans through a panel selector |

Chrome uses the existing Chicago/Geneva system stack; prose uses Geneva and readable platform sans-serif fallbacks. This is a local-font strategy, not a new font download. Do not embed proprietary historical fonts merely to obtain a bitmap appearance. Keep antialiasing and browser zoom available.

Simplified Chinese uses PingFang SC / Microsoft YaHei / Noto Sans CJK SC fallbacks; Traditional Chinese uses PingFang TC / Microsoft JhengHei / Noto Sans CJK TC. These are explicitly modern substitutes. Preserve `lang` and the locale boundary. Do not convert a Traditional Chinese string merely by changing its font. Leave at least 1.4 line height in chrome, permit labels to wrap, and never shrink CJK text to fit a Latin-width button. Use sentence case for descriptive labels; preserve genuine acronyms, code identifiers and source quotations. Remove decorative uppercase and tracking in migrated chrome.

## Palette, structure and notes

| Token | Value | Intended role |
|---|---|---|
| `--s7-ink` | `#000` | Text and primary boundaries |
| `--s7-paper` | `#fff` | Documents, lists, inputs, normal button faces |
| `--s7-chrome` | `#ddd` | Toolbars, tab backs, status areas |
| `--s7-shadow` | `#aaa` | Hard relief and secondary structure |
| `--s7-muted` | `#555` | Supporting text on white/gray |
| `--s7-selection` | `#11177a` | Selected rows/options, links and navigation cues |
| `--s7-selection-text` | `#fff` | Text on selection |

These exact hex values are the project palette. They were chosen to remove the current collection of slightly different warm grays, navy shades and tinted paper surfaces.

- Use one-pixel internal rules; reserve stronger boundaries for the window and default-action ring. Avoid putting every paragraph inside a raised box.
- `.s7-panel` is a white bounded region. `.s7-toolbar` groups related controls with an 8px gap and wrapping. Use 12–16px panel padding and 16–24px between major sections.
- `.s7-table` uses a gray header, white rows, thin horizontal rules, left-aligned labels and tabular numerals. A selected row uses the selection colors. Wide data tables scroll in their own labeled region; prose must still reflow.
- `.s7-note` is a plain labeled note with a thin border. Internal audit receipts belong in development documentation. A visitor-facing limitation belongs beside the result it qualifies. Remove tinted caution strips from ordinary explanation; actual errors retain explicit text and a recognizable status cue.
- Keep color maps, molecule atoms, graph clusters, uncertainty bands and charts inside their bounded scientific region. Their legends carry meaning; shell unification must not recolor them.

## Modern accessibility requirements

Use at least 44px targets for coarse pointers and compact touch layouts as a deliberate project adaptation. WCAG 2.2 AA’s target-size criterion is 24 CSS pixels or qualifying spacing/exceptions; 44px is our more generous choice, not a System 7 measurement. [W3C target-size guidance][targets]

Normal text needs at least 4.5:1 contrast; larger text has a 3:1 threshold. Default, focus, hover, selected and disabled states must remain distinguishable without relying on hue alone. [W3C contrast guidance][contrast] The keyboard focus indicator is separate from the default-button ring. Keep reduced-motion support, browser zoom, semantic headings, native disclosure controls, keyboard access and visible scrollbars. Test 320px, 390px, 768px and desktop widths in English, Simplified Chinese and Traditional Chinese, including 200% zoom.

## Repository findings and migration

The initial audit found 39 project CSS modules and 26 project TSX files importing `DemoChrome`. Shared controls exist, but several independent skins compete:

| Current location | Concrete issue | Migration |
|---|---|---|
| `src/app/globals.css` | Global `.mac-button`, broad desktop/accessory styles, separate locale font variables. | Import `system7.css` once. Keep legacy desktop rules stable; opt project documents into `.system7-project`. Do not append a universal button override. |
| `DemoChrome.tsx/.module.css` | Separate MacButton skin; tinted paper, striped body, blue purpose card, 10px tracked metadata. | Emit shared root/button classes; simplify shared frame and instruction disclosure; retain props, localization and demo content. |
| `ClassicSelect.module.css` | Tripled `.trigger` specificity and separately hardcoded palette/font values. | Consume shared tokens and use one explicit trigger attribute/class selector; preserve behavior and portal styling. |
| Project CSS modules | Repeated `viewTabs`, `panelHeading`, `metricGrid`, action colors and literal font sizes. Some files contain a second appended “System 7 surface pass.” | Migrate a whole named control group at once. Delete its superseded skin declarations, retain layout rules, and add canonical classes in its TSX. |
| Scientific/math panels | Broad descendant `span` selectors previously damaged KaTeX. Some SVG styles intentionally use color/size overrides. | Scope authored text selectors to actual children; leave SVG/canvas and `[data-math-equation]` subtrees untouched. |

Implement shared tokens and explicit classes first, then the archive/project document controls, then demo navigation/action groups, then prose and notes. Retain useful descriptions, interactive state and simulation calculations. Replace internal source receipts with the project’s purpose, method and carefully described results. Do not use `!important`, wildcard descendants, runtime DOM restyling or ever-increasing repeated classes as a migration mechanism. A low-specificity rule can establish defaults; it cannot reliably replace an old higher-specificity skin until that skin is removed.

Validation should include one control-state matrix covering normal/default/focus/pressed/disabled/toggle/icon/tab/select; narrow translated labels; keyboard navigation; popovers near screen edges; and representative scientific surfaces. This matrix belongs in development/QA, not as another visible portfolio view. CSS-module resolution and production build checks complement visual review; neither proves that a button is readable.

## Sources

1. Apple Computer, *Macintosh Human Interface Guidelines*, 1992. [Full primary document][hig]. Printed page numbers are 23 lower than the zero-index PDF page numbers in this copy.
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
