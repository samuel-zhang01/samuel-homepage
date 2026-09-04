# Ruled-paper, classic-control and orbital audit

Date: 5 September 2026. Follow-up to the [interaction audit](INTERACTION_AUDIT_2026-09-05.md).

## Reported details fixed

- Note Pad rules repeated one pixel farther apart than text line boxes, were
  anchored to the bottom of a resizable surface, and did not follow textarea
  scrolling. Rules and writing now share an exact 28 px pitch, top origin and
  local scrolling background. The phone margin and 16 px editing font align.
- Calculator rules belong to the scrolling tape list, not the outer panel.
  Calendar writing uses the same paper logic. Wrapped Quick List tasks use
  clean separators; the converter swap control is square rather than circular.
- All 51 former native select sites now use one classic pop-up menu. The new
  orbital app uses that same control for its two selectors. Menus have square
  paper surfaces, hard borders/shadows, navy selection and checkmarks, with
  scrolling, viewport placement and 44 px coarse-pointer targets.
- Fifteen options previously relied on their visible label as their value.
  Translation could therefore change demo state into an unrecognized value.
  Stable values are now explicit, while labels remain localized.
- Menu tests also found label-trigger reopening and delayed ancestor-scroll
  dismissal. Options live outside wrapping labels, and menus follow their
  trigger until it leaves the containing viewport.

## Orbital Lab

The app is independently implemented from analytic hydrogenic radial functions
and real spherical harmonics. It includes 118 selectable elements, neutral
electron configurations, occupied-subshell/component selection, Hund-filling
boxes, node counts, a radial probability graph, rotating ASCII clouds, a thin
central slab and downloadable text studies.

Sources:

- [NIST neutral-atom configurations](https://math.nist.gov/DFTdata/atomdata/configuration.html)
- [NIST Elemental Data Index](https://physics.nist.gov/PhysRefData/Elements/per_noframes.html), including the modern [lawrencium assignment](https://physics.nist.gov/cgi-bin/Elements/elInfo.pl?element=103)
- [Hydrogen atom wavefunctions, University of Texas](https://farside.ph.utexas.edu/teaching/qm/Quantum/node44.html)
- [Spherical harmonics, University of Texas](https://farside.ph.utexas.edu/teaching/qmech/lectures/node76.html)
- [Ptable](https://ptable.com/) supplied the requested interaction reference, not copied implementation or artwork.

The model is non-relativistic, one-electron and Z = 1. Selecting an atom does
not solve its many-electron wavefunction. NIST-listed configurations through
104 are reference compilations, not a blanket claim of experimental measurement;
105–118 use an explicitly illustrative Aufbau rule. The independent detached
lanthanoid/actinoid rows are layout families, not claims about differentiating
electron occupancy.

Samples represent |ψ|² within 99.5% of radial probability. Phase ink is sign,
not charge; overlapping projected samples use majority phase rather than quantum
interference. The real m index is not a unique Lz eigenvalue for nonzero m.
The graph is P(r) = r²|R(r)|², not local 3-D density. Each cloud is independently
fitted to the frame; thin-slab contrast is separately rescaled. These limits
appear in the interface and exported studies.

Independent reviews caught and corrected a Ce preset selecting 5d instead of
its advertised 4f, exported files losing reference/model caveats, a nearly
end-on initial camera obscuring lobes, and unreadably small ASCII glyphs on
phones. Responsive grid density, a near-side-on starting view and a return-to-
cloud action after periodic-table selection address those issues.

## Verification and scope

- Three independent agents handled paper geometry, classic controls and
  scientific data/mathematics, followed by cross-review and root computer-use
  inspection of the actual local app.
- Paper: 27 accessory/viewport/language cases in isolated Edge, including
  40-line notes, mobile wrapping, an arbitrary 137 px scroll, maximization and
  eight calculator entries. Pixel scans verified constant rule spacing.
- Controls: keyboard commit/cancel, typeahead, focus return, wrapping,
  disabled/options-changing states, modal nesting, repeated toggling,
  118-item scrolling and 21 enabled selections across 11 demos. No exposed
  native select sites remain outside the shared hidden form element.
- Orbital UI: all four locales at 320, 390, 768 and 1440 px; presets, component
  changes, periodic table, export caveats, rotation, app deactivation and
  reduced-motion changes. No document overflow or runtime exceptions observed.
- `check:desk`: 28 existing deterministic regressions.
- `check:controls`: 20 new keyboard/typeahead/placement regressions.
- `check:orbitals`: 456 checks for element totals, shell capacities,
  configuration exceptions, normalized radial functions, orthogonality,
  node crossings, real harmonics, probability sampling and work bounds.
- Locale gate: 56 orbital keys in four locales, Mandarin coverage and a
  Traditional-Chinese residue check, alongside the existing archive/core gates.
- The full release gate passed: lint, dependency signatures/audit, artifact and
  catalogue gates, locale/style checks and isolated production build. No new
  dependencies or runtime third-party requests were added.
- The final production build was served separately for desktop (1440 px) and
  phone (390 px) smoke tests: project sorting changed actual rows, classic menus
  stayed in bounds, the element menu reached both ends of its 118-item list,
  and Ce selected a rendered 4f cloud. No hydration, console, chunk or HTTP
  errors were observed. Orbital routes in all four locales, Desk Accessories
  and Projects also returned HTTP 200 with `nosniff` headers.

Local cold sampling of all 78 supported model orbitals measured a 1.5 ms median
and 3.7 ms maximum in the review browser. That is one machine's helper benchmark,
not a cross-device guarantee. Samples are cached with bounded memory; rotating
reuses them and is capped at 12.5 updates per second.

The final production checkpoint has 83 generated paths, 101 browser files
(3.47 MiB), 2,048 traced runtime files and 3.25 MiB of application runtime.
Initial route JavaScript is approximately 212 kB; the orbital app is lazy-loaded.

Limits: browser matrices used Edge/Chromium, not native Safari/iOS or a full
assistive-technology certification. The Safari-compatible portal fallback was
tested by disabling Popover support in Edge. Hidden-tab handling was tested
with a simulated visibility event because the headless runner kept pages
visible. Scientific calculations do not include electron correlation,
relativity, molecular bonding, real element-specific orbital sizes or measured
superheavy configurations. Public deployment remains subject to the existing
unresolved SSH access blocker; this record does not claim the changes are live.
