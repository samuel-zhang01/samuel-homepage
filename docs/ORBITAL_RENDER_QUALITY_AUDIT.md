# Orbital rendering and desktop layout follow-up

5 September 2026. Extends the [initial orbital/detail audit](ORBITAL_AND_DETAIL_AUDIT.md).

## Changes

- ASCII now uses 160 × 72 cells in the wide Fine view and 240 × 108 in Ultra;
  compact views use 96 × 58 and 128 × 77. The former grids were 76 × 36 and
  40 × 28. All use 12,000 deterministic probability samples and weight-preserving
  bilinear projection to reduce grid flicker.
- Crucially, the canvas bitmap follows its measured CSS width and device pixel
  ratio rather than stretching fixed-resolution text. Backing stores are capped
  at 2,560 px wide and 3× pixel density to bound graphics memory. Resize and zoom
  changes trigger remeasurement. Density and surface modes share this treatment.
- **Density 3D** draws back-to-front, alpha-composited probability points. A
  classic square-thumb opacity slider changes visibility without changing the
  wavefunction. Points are equal-weight samples, not literal individual electrons.
- **Smooth 3D** uses antialiased WebGL, perspective, smooth gradient normals and
  restrained phase-coloured lighting. An 80-cell marching-tetrahedra grid extracts
  a surface at 1% of the sampled peak |ψ|². This is not a fixed probability
  enclosure or an electron boundary. Sub-grid features can be omitted; clipping
  to a slab does not cap or fill the cut faces.
- Meshing runs in a same-origin worker, with a three-entry cache and stale-result
  rejection. A bound derived from the isovalue resolves compact high-n cores.
  Tests caught phase errors near nodes: signed-amplitude interpolation and the
  adaptive spatial bound corrected the verified cases. Rotating reuses geometry.
- Unsupported or lost WebGL contexts return to ASCII with translated feedback.
  Worker and GPU resources are released on unmount. Development effect replay
  was explicitly tested after it exposed premature graphics-context disposal.
- Both 3D modes export PNGs; ASCII retains text exports with model notes and
  sources. All modes share an orientation compass, phase controls, slicing,
  pointer/keyboard rotation and reduced-motion handling.
- The periodic table is a collapsible section above the viewer, closed initially
  so it does not displace the model. Group/period labels, block key, reference link,
  and an updated return-to-view action clarify navigation. DOM and visual order
  agree. Shell totals, period/group/block and subshell unpaired counts derive from
  the existing reference configurations. No new unverified atomic-property
  dataset was copied. [Ptable](https://ptable.com/#Electrons) was reviewed as the
  requested interaction reference.
- Electron filling uses equal-weight SVG arrows with matching baselines and
  translated accessible counts, including singular English. Desktop icons now
  use two balanced columns instead of six fixed rows and a stranded third column.
  Mobile retains three columns; label wrapping is balanced and short viewports
  can scroll the icon area independently.

## Verification

- Production browser matrix: four locales (en-GB, en-US, zh-CN, zh-TW) at 320,
  390, 768 and 1440 CSS px, at 2× pixel density. Fine/Ultra, all three render modes,
  C/Fe/Ce presets, table selection, icon bounds and spacing passed. No page,
  console, HTTP or WebGL errors and no document overflow were observed.
- Backing-store measurements included 282 CSS px → 564 pixels on a 320 px phone,
  352 → 704 on a 390 px phone, and approximately 900 → 1800 on desktop. An
  additional 3× phone screenshot check confirmed the same sizing rule.
- Six repeated ASCII → density → surface cycles passed. A production PNG export
  was decoded for its signature/dimensions and contained 412,962 bytes; text
  exports retained the one-electron caveat and source URLs.
- Reduced-motion changes stopped rotation. An actual WebGL context-loss event
  returned to ASCII. A simulated no-WebGL browser returned to translated ASCII
  feedback. These are distinct from claiming tests on every physical GPU.
- Root computer-use inspection confirmed the final controls, model and table
  placement. Screenshots additionally checked mobile labels and p/d/f renderings.
- `check:orbitals`: **474** checks, including 18 new surface/work-bound tests
  (finite geometry, phase, normals, known 1s radius and invalid inputs).
- `check:desk`: 28; `check:controls`: 20. Locale checks cover **83** orbital keys
  in four locales, plus existing core/archive translations and Traditional-Chinese
  residue checks. Full lint, dependency audit/signatures and release build passed.
- Final build: 83 generated paths, 102 browser files (3.49 MiB), 2,049 traced
  runtime files and 3.27 MiB application runtime. Initial route JavaScript remains
  approximately 212 kB. No new package dependencies or third-party runtime
  requests were added.

Browser coverage here is Edge/Chromium, including touch and high-DPI emulation,
not native Safari/iOS or assistive-technology certification. Scientific limits
from the initial audit still apply: this is an educational Z=1 one-electron
model, not a many-electron or molecular quantum-chemistry solver. These changes
are locally verified; the previously rejected SSH authentication still prevents
claiming deployment to the live server.

## Motion, density and Note Pad follow-up

Also 5 September 2026; supersedes the original 12.5 Hz rotation cap.

- Rotation now uses timestamp-based `requestAnimationFrame` callbacks, drawing
  directly into the canvas and updating the compass without rendering the whole
  React application every frame. The angle advances at the same speed at
  simulated 60/120/144 Hz; hidden/inactive and reduced-motion stops are retained.
  [Browser scheduling reference](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame).
- Density points are solid discs with a narrow antialiased rim, rather than
  Gaussian sprites. The minimum diameter follows the effective pixel density,
  and default opacity is 45%. Sampling and scientific interpretation are unchanged.
- Point vertices upload once per cloud. Rotation reuses depth/order arrays and
  updates only 16-bit sorted indices instead of rebuilding all vertex data and
  allocating thousands of JavaScript objects each frame.
- Note Pad page arrows moved out of the paper into a previous / page count / next
  footer group. Both have 44 px targets; compact windows put save status above
  navigation. Existing translated labels, page retention and ruled text remain.
- Production browser tests repeated the full four-locale × four-width orbital
  matrix and added the same 16-case Note Pad navigation matrix. No overflow,
  page-text loss or script errors were observed. Computer-use and screenshot
  inspection confirmed the footer and the clearer density points.
- Six production motion cases (desktop/phone × ASCII/density/surface) recorded
  approximately 60 FPS and a 16.7 ms median interval. The tests also cover pause,
  reset, manual rotation and changing modes/opacity while rotating. Steady
  rotation made zero full vertex-buffer uploads. Physical 120/144 Hz hardware
  was not available; the frame-rate-independent maths is covered by unit tests.
- Orbital checks now total **479**. Repeated mode changes, exports, reduced
  motion, actual context loss and forced no-WebGL fallback passed again.
- Deployment handoff changed at the user's request: push to GitHub and let the
  user deploy on their server. `deploy.sh` now performs a protected fast-forward
  update, locked dependency installation, checks, build and verified replacement.
  Seventeen scenarios exercise real temporary Git repositories with simulated
  Docker/npm, including rollback; this is not a live-server deployment claim.
