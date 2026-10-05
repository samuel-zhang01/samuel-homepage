# System 7 design benchmark

The project interface should read as one Macintosh application: white documents, layered gray chrome, compact controls, legible content, and richer color inside the experiments. This specification targets the System 7 / 7.5 period around 1995, with explicit modern web adaptations. The values below are implementation decisions, not claims of pixel-perfect emulation.

The 9 September 2026 refinement keeps the smoother typography and accessible navigation while restoring more of the original desktop's depth. Named gray surfaces, crisp bevels, recessed lists and small hard shadows distinguish the layers. This direction follows the user's current preference and supersedes the earlier restriction to a flatter paper/chrome palette.

The 4 October 2026 first-visitor and visibility reviews establish the current contract: use the same system font and 22/18/15/13/12px type scale across profile, project documents and demos. Inline/menu/navigation icons are 16px; cards, Finder results, Contact destinations and the phone window switcher use 32px; desktop launchers and primary project headings use 48px. Primary and sharing actions use the same neutral beveled control family; bold text identifies a primary destination and the outlined ring identifies a default action. This supersedes the earlier serif project headings and coloured primary/share button skins.

Orbital Lab, Desk Arcade and Home Lab are the visual references for calm chrome and clear experiments. Keep warm reading paper, hard window shadows, recessed lists, complete explanations and scientific instrument colours. State colours still distinguish outcomes, uncertainties and errors beside their results; instructions and contribution sections stay visible.

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
| Primary destination | `.s7-button.is-primary`: bold black label on white with the shared raised bevel and control height. | Use for demos, applications and the principal document action. Retain an explicit verb label, hover feedback, keyboard focus and native disabled semantics. This does not imply a Return-key default. |
| Share action | `.s7-button.is-share`: black label on the same raised light-gray face as ordinary controls. | Label sharing explicitly. Announce copy success and present a selectable address when clipboard access is unavailable. |
| Pressed action | Native `:active`: black face and white lettering; relief disappears. | Momentary feedback while activating; distinct from persistent selection. |
| Disabled action | Native `disabled`: muted gray text/edge, neutral face, no hover/press treatment. | Preserve readable label and disabled semantics. Do not use opacity on the entire control subtree. |
| Toggle | `.s7-button[aria-pressed]`: label-sized content; recessed face when selected, with no generated checkmark or reserved marker slot. | Selection retains its inset treatment on hover; pressing still inverts. Native button toggles one setting. Mutually exclusive form values should retain radio semantics. |
| Icon action | `.s7-button--icon`: compact square shape; restrained 16–20px artwork. | Accessible name is mandatory; tooltip is supplementary. Minimum 44px target on coarse pointers. |
| View tabs | `.s7-tabs` with `.s7-tab`: recessed gray strip, beveled inactive tabs, selected tab with inset relief, clear border and normal-case label. | ARIA tab pattern only when content is an actual tab panel; use links for navigation. Keyboard arrows, Home/End and focus behavior belong to the component. Tabs are a website adaptation, not a claimed stock 1992 Toolbox control. |
| Select | `ClassicSelect`: square raised light-gray trigger, current value, downward triangle and 1px hard shadow; same UI font in trigger and list. The white option list sits inside a beveled gray frame with a small hard shadow. | Keep existing combobox/listbox, typeahead, disabled options, native form value, viewport placement and focus restoration. The expanded trigger inverts; selection uses blue plus a checkmark. |

Use shared gray relief for controls, a bold white face for primary destinations and the outlined ring for form defaults. Control geometry stays consistent, with 44px targets on coarse pointers and compact touch layouts. Keep bevels crisp and shallow; metallic gradients, soft glows and pill toggles do not belong in this control family. Dark navy identifies selected content and links. Scientific series retain their domain colors and legends.

## Shared icon vocabulary

Use [`System7Icon`](../src/components/System7Icon.tsx) and the assets in [`public/system7-icons`](../public/system7-icons) across desktop shortcuts, menus, Finder results and compact project artwork. The `System7IconKind` union is the canonical vocabulary. Reuse its subject or object before adding another drawing:

| Role | Representative kinds |
|---|---|
| Navigation and records | `profile`, `computer`, `folder`, `document`, `briefcase`, `university`, `pdf`, `mail` |
| Desk tools | `note`, `sketch`, `tasks`, `clock`, `calendar`, `calculator`, `converter`, `palette` |
| Project subjects | `microscope`, `finance`, `chart`, `molecule`, `shield`, `book`, `mri`, `flow`, `network`, `orbital` |
| Activities and collections | `runner`, `game`, `accessories`, `photos`, `controls`, `secret` |

The generated family uses crisp dark outlines, light upper edges, a small neutral palette and restrained blue, gold or red details. Every kind has one canonical asset in [`SYSTEM7_ICONS`](../src/lib/system7Icons.ts); all surfaces render that same image, including callers passing the compatibility `miniature` flag. COVERD uses its original owned logo on a white backing instead of a generated substitute. Use `--s7-icon-inline` (16px) in text, menus and inline navigation, `--s7-icon-document` (32px) for cards, Finder results, Contact destinations and the phone window switcher, and `--s7-icon-desktop` (48px) for desktop launchers and primary project headings. Keep these sizes at narrow widths; increase the surrounding target for touch. The shared renderer centers measured alpha bounds at 90% of a square frame with equal scaling on both axes. Preserve the artwork's proportions and the untouched 1254px generated source files; generated subjects use pixelated sampling and the original brand uses smooth sampling. Never crush artwork into a smaller art field and enlarge it afterward. Required browser-format derivatives must sample the native original directly. The top-left menu uses the black person mark; education institution branding uses official vector logos rather than initials.

Icons are decorative (`alt=""`, `aria-hidden`); translated text names the destination or action. An icon-only control still needs its own accessible label. Keep the artwork recognizable against white, gray and selected navy backgrounds. Document headers and compact rows use the same subject icon; larger scientific diagrams retain their authored display size.

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

Chrome uses the existing Chicago/Geneva system stack; headings and prose use Geneva and readable platform sans-serif fallbacks. Reserve Monaco/Courier for code and aligned measurements. Project-specific serif headings and responsive oversized display type interrupt the shared hierarchy. This is a local-font strategy, not a new font download. Do not embed proprietary historical fonts merely to obtain a bitmap appearance. Keep antialiasing and browser zoom available.

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
| `--s7-action` | `#11177a` | Navigation accent; buttons use neutral faces |
| `--s7-action-hover` | `#080d54` | Darker navigation accent |
| `--s7-action-edge` | `#080d54` | Share-address text and focus indicator |
| `--s7-action-soft` | `#ecece6` | Quiet row hover and share-address surfaces |
| `--s7-context-paper` | `#f8f5ec` | Warm reading and contextual surfaces |
| `--s7-info` / `--s7-info-soft` | `#214ea5` / `#edf3ff` | Instructions, active controls and information panels |
| `--s7-success` / `--s7-success-soft` | `#17664f` / `#e5f3ec` | Confirmed, valid, available and completed states |
| `--s7-warning` / `--s7-warning-soft` | `#80510c` / `#fff3d6` | Reservations, conflicts, limitations and caution |
| `--s7-accent` / `--s7-accent-soft` | `#514293` / `#f0ebfa` | Context, selected entities and comparison panels |
| `--s7-danger` / `--s7-danger-soft` | `#993b40` / `#fbecee` | Errors, failed checks and rejected results |

These tokens give each shade a consistent structural role. Reuse them for new chrome instead of introducing unrelated colors. Use white and warm paper for reading and saturated accents for selected content or meaningful experiment states. Grey remains the window furniture. Pair state colour with explicit text, checks, borders or patterns. Primary and sharing labels use black on neutral faces; selection colors and scientific palettes retain their separate meanings.

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
- Desktop windows use a narrow gray inner frame, a recessed document boundary and a hard outer shadow. Window and Find titles contain centered text on a solid clearing. Active title bars use a centered 14px horizontal stripe band with gray lines and white highlights, even within taller touch hit areas. Inactive title bars have plain subdued chrome. The active application icon belongs on the right of the main menu bar. This follows the title-band and application-menu placement in Apple's [HIG, printed pp. 135, 139–140][hig].
- `.s7-table` uses a light-gray header with a top highlight, white rows, thin horizontal rules, left-aligned labels and tabular numerals. A selected row uses the selection colors. Wide data tables scroll in their own labeled region; prose must still reflow.
- `.s7-note` is a plain labeled note with a thin border. Internal audit receipts belong in development documentation. A visitor-facing limitation belongs beside the result it qualifies. Use an information tint for explanations, an accent tint for context and a caution tint only where caution is intended. Actual errors retain explicit text and a recognizable status cue.
- Preserve color maps, molecule atoms, graph clusters, uncertainty bands and chart series in their scientific regions. Their legends carry domain meaning; the shared palette styles their surrounding controls and explanatory panels.

## Phone working area

Review real 320×568 and 390×844 portrait views. Keep 12–16px inside content panels and 16–24px between major sections; an 8px outer frame may surround a padded panel. Remove compounded gutters instead of shrinking type, icons or touch targets. At the short phone size, retain at least 300px of scrollable window content. Navigation and ordinary form controls need 44px targets; dense game boards and periodic-table cells need a separate interaction review.

The window title names the demo. Its phone toolbar should keep Back, Share and any project-specific action without repeating the full title. Let the toolbar scroll away with the content. Keep primary plots and canvases useful, normally at least 220px high. Preserve wide diagrams, full labels and legends with a contained, focusable pan region and a visible swipe/arrow-key hint. Do not stretch an authored scientific image to meet a height target; assess its useful field and original aspect ratio separately. Text-led experiences need comfortable reading and control space rather than an artificial plot-height requirement.

Use one clear vertical scrolling owner, except for an instrument that requires its own reader or work area. Put document provenance after the initial PDF viewport and desk backup controls after the app launchers. Keep that context reachable with keyboard navigation. Graph and orbital controls retain their explanations and provide a direct phone jump to the instrument. Review English and Traditional Chinese primary views, spot-check the other locales, and compare desktop references. Each demo needs a separate adversarial decision on visual coherence, readability and useful display area; a passing geometry check alone is not a visual grade.

Run `npm run check:phone-space` against a compiled preview with `PLAYWRIGHT_CORE_PATH` set to an external Playwright installation and `REVIEW_ORIGIN` set to that preview. `BROWSER_ENGINE` selects Chromium, Firefox or WebKit; `PHONE_SPACE_LOCALES`, `PHONE_SPACE_SIZES`, `PHONE_SPACE_GROUP` and `PHONE_SPACE_SLUGS` narrow the matrix. Set `PHONE_SPACE_REPORT_DIR` under ignored `.codex/reports/`. Use the maintained deep journey and icon runners alongside it to check real interactions and canonical artwork.

## Project browser

The knowledge graph remains the first view. **Selected work** and **All projects** use a left list pane with visible search and discipline filters, alongside the selected project's details in the right pane. Selecting a row updates those details within the same project window. The list and detail content scroll independently, with gray framing and white content wells separating their roles.

Project details offer explicit **Open in new tab** and **Open live demo** actions where applicable, alongside the project's website, files, application and repository links. Embedded demonstrations open on request. **Connections** returns to the graph with the project selected. At narrow widths, the list and detail views take turns using the available width; **Back to list** restores browsing. Keep these controls and their labels available in English and both maintained Mandarin editions.

Selected work uses the catalogue's `featured` metadata as an editorial shortlist. Orbital Lab brings three visual representations and the mathematics behind them; Neural CFD Surrogates connects three model architectures with recorded fields and qualified evaluation results; Home Lab adds dependency tracing, failure simulation and backup planning. These deeper experiences now join the shortlist. CV Keyword Automator remains available in All projects. Feature future entries when their explanation and evidence support a substantial visit, keeping the shortlist smaller than the complete archive.

The graph uses the same recessed backing to separate its white canvas from the pale inspector, with raised controls and disclosure bars around them. Its legend sits above the canvas. Topic captions retain complete intended captions at 15px, avoid text collisions and remain stable on hover. Displaced captions have thin leaders and matching hit bounds; review the scrolled canvas at 320px, since it lies below the initial fold. Documents use a double header seam, fine section rules and a recessed frame around live experiments. Demo anchor spacing follows the measured sticky toolbar height so wrapped controls remain clear of the destination. The [current audit](VERIFICATION.md) records compiled browser coverage; the primary sources below define the design reference.

## Modern accessibility requirements

Use at least 44px targets for coarse pointers and compact touch layouts as a deliberate project adaptation. WCAG 2.2 AA’s target-size criterion is 24 CSS pixels or qualifying spacing/exceptions; 44px is our more generous choice, not a System 7 measurement. [W3C target-size guidance][targets]

Normal text needs at least 4.5:1 contrast; larger text has a 3:1 threshold. Default, focus, hover, selected and disabled states must remain distinguishable without relying on hue alone. [W3C contrast guidance][contrast] The keyboard focus indicator is separate from the default-button ring. Keep reduced-motion support, browser zoom, semantic headings, keyboard access and visible scrollbars. Use disclosure controls for navigation or optional tools; project explanations, instructions, methods and contribution details stay visible. Test 320px, 390px, 768px and desktop widths in English, Simplified Chinese and Traditional Chinese, including 200% zoom.

## Maintaining the shared styles

Use tokens and explicit component classes from `src/app/system7.css`. Edit named rules in the owning module and remove superseded declarations when changing a control group. Preserve layout, translations and simulation behavior; a broad override cannot reliably replace an older, more specific skin.

Keep authored text selectors scoped to their actual children. Scientific SVG/canvas colors communicate data; KaTeX and `[data-math-equation]` subtrees retain their own typography. Project prose stays visible on warm paper, while controls and interactive instruments use the shared relief and local meaningful colors.

Selection uses the existing button face, relief and ARIA state. Leading checkmarks or empty marker columns do not belong in action buttons; native checkboxes and listbox selection marks retain their semantics. Validate default, focus, pressed, disabled and selected states, narrow translated labels, keyboard navigation and edge-positioned popovers. Source and build checks complement actual visual review.

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
