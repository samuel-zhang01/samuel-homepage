# Interactive product checkpoint — 11 October 2026

The existing System 7 framing stays in place. Decorative green/amber vertical outcome accents are removed. Product overviews lead with the product image or a playable example, a short feature list and one useful task; the longer method explanation is collapsed.

## Implemented tasks

| Product | Visitor action | Observable result |
| --- | --- | --- |
| Ultra Convert | Edit ALL/ANY match blocks; reorder Convert and Rename; save a rule and add a watched-folder arrival | Matching files follow the saved action order; original files remain; paused watchers skip arrivals until explicitly resumed |
| Ultra Convert | Prepare Finder actions or convert a generated/selected image | Finder prepares a reviewed compatible batch. PNG/JPEG/WebP conversion really runs in the browser and produces a downloadable image |
| VideoMate | Select files and Quick/Full inspection; choose remux, preservation or portable output; step/play the queue | Inspection, candidate creation, verification and publication are separate. Failed decode and excessive shortening withhold output; lost recording content remains missing |
| VideoMate | Change migration policies and pause/resume | Supporting files are copied or excluded; unresolved videos go to review. Candidate files enter the new collection only after verification |
| YASA | Choose hosts and time zone, reserve a slot, complete typed questions and confirm | Required hosts determine availability; optional hosts rank suggestions. Final conflict checking rejects a competing reservation |
| YASA | Download invitation, reschedule or cancel | The browser produces UTC/role-aware ICS; successful rescheduling releases the predecessor; cancellation releases the new slot |

The native conversion and video engines do not run inside the simulated rule/repair flows. Ultra Convert's image tab performs actual local browser conversion. YASA's playground is isolated from the live service and sends no real bookings or messages.

## Product visuals

Ultra Convert captures use the original AppKit sources with an isolated harness, generated image/audio/text examples and a disabled rule stored beneath a temporary directory. The harness never starts native folder automation or loads the operator's preferences. Both images retain the native screenshot dimensions; lossless WebP conversion only changes the file encoding. The overview offers a full-size image link.

YASA's screenshot is the actual public booking page at `schedule.coverd.ai/book/samuel/30mins-chat`, captured on 11 October. Viewing a day showed available slots; no slot was reserved and no booking was submitted. Availability in that image is a dated capture, not a promise of current slots.

VideoMate uses a playable explanation grounded in its native workflow. An isolated generated-fixture Tk window was attempted, but native accessibility selection could not reliably select the dedicated window. No native VideoMate screenshot is claimed. No operator media, state or logs were inspected. The failed capture receipts remain in the local QA archive. The installed Homebrew Tk runtime enabled the isolated attempt.

The public image gate pins three screenshot hashes and checks their formats and byte ceilings. All added descriptions and controls cover UK/US English and Simplified/Traditional Chinese. Manual stepping and reduced-motion behaviour remain available.

## Reviews

Independent Ultra Convert review: **9.4 desktop / 9.3 at 390px / 9.1 at 320px**. Action ordering, watched arrival, keyboard reorder and actual WebP download changed the expected state. See [the detailed review](PRODUCT_CROSS_REVIEW_ULTRA.md).

Independent VideoMate review: **9.4 desktop / 9.2 at 390px / 9.1 at 320px**. A pending candidate remained outside the collection, successful verification published it, damaged-frame remux was withheld, and the shortening guard changed the incomplete-recording outcome. Quick inspection produced no output. The 320px loss message and controls fit.

Independent YASA review: **9.4 desktop / 9.2 at 390px / 9.1 at 320px**. Guest confirmation, Tokyo time-zone display, rescheduling with predecessor-slot release, cancellation and return to availability passed. An initial reschedule reset during active hot reload did not recur from a clean page. The owner's additional source/model review covers optional-versus-required attendance, stale-slot rejection and UTC/role-aware ICS. See [the source and test record](YASA_BOOKING_REFINEMENT.md).

These are scoped adversarial agent assessments, not a recruited user study. During concurrent edits, hot reload briefly lost a lazy stylesheet and enlarged artwork; a full reload restored the correct CSS. Final compiled route checks must also verify lazy stylesheet arrival.

Focused model checks cover 20 Ultra planning/action-order cases, 72 VideoMate shortening policies plus queue publication timing, and YASA reservation/booking/ICS invariants. The scoped checkpoint passes all prebuild checks, full lint and an optimized isolated build. Its output contains 122 browser files / 5.34 MiB, including a separately bounded 257.1 KiB math renderer; initial JavaScript is 260.2 KiB gzip and application runtime is 5.06 MiB. The requested lazy product/ML content allowance is 5.5 MiB; the 270 KiB initial-load ceiling is unchanged.

The first isolated build exposed an accidentally included concurrent source-visibility paragraph; that unrelated edit was excluded from the staged checkpoint, without altering the shared working copy. A symlinked dependency tree then failed standalone tracing across the temporary directory boundary; a local filesystem-cloned dependency tree resolved it. Both failed logs are retained. A full release check and the expanded ML/AI review are still required after the next implementation batch.
