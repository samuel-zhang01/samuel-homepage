# YASA guest booking refinement

Source reviewed: `COVERD-YASA` at `af1673c671baaaca9d2e5c321a3d446bfb1e9a35`. No environment files, calendar accounts, production database or external booking endpoints were accessed. The homepage fixture is fictional and lives only in component state.

## Adapted source behaviour

- `availability_service.py`: duration plus buffers advances the candidate grid; individual, weighted round-robin, collective and priority-based first-available allocation; merged required-host interval coverage; optional-host exact-interval checks and guest-local daily suggestions. Optional hosts remain invitations rather than reservations.
- `booking_service.py`: ten-minute selection lifetime, final availability revalidation, required-host allocation snapshots and predecessor/successor time changes. In this browser example, a predecessor remains confirmed until its replacement is committed; cancellation and a confirmed replacement release the old occupied time.
- `booking_questions.py` and `frontend/src/pages/public/BookingPage.tsx`: text, textarea, select and checkbox questions; required name/email/topic validation; guest-local date groups reset when the timezone changes.
- `email_service.py`: actual UTC timestamps, required/optional attendee roles, REQUEST/CANCEL, stable cancellation UID, reminder, escaped text and UTF-8 byte-counted ICS line folding. This example downloads a file and sends no invitation.

The guest page is the default experience. Three meeting types change duration and the default allocation policy. The four policies and collective attendance controls are editable before choosing a time. The former calendar mathematics/DST inspector remains under **Explore scheduling rules**. It mounts only when opened, avoiding an existing server/browser zero-offset formatting mismatch in the hidden inspector during initial hydration.

This is an in-memory demonstration, not a port of PostgreSQL exclusion constraints, Redis locks, Graph sync, signed management tokens, host daily quotas or production email delivery. The simulated 500ms check animates progress; the computation and final check really execute against the current local booking list. Host windows use a fixed November week when London is on GMT. London, New York and Tokyo displays convert the same UTC instants correctly, including Tokyo's next-day times.

## Verification, 11 October 2026

- `node scripts/check-yasa-booking-demo.mjs`: required/optional decisions, optional-host suggestions, round-robin assignment, confirmed occupancy, cancellation release, linked rescheduling, local-day rollover, typed answer validation and UTC role-aware ICS passed.
- `node scripts/check-project-copy.mjs`: 7,942 bilingual entries /42 registered files passed at the checkpoint; the new helper has its own ProjectCopy boundary and registered audit source.
- `node scripts/check-project-css-modules.mjs`: 2,272 references passed at the checkpoint.
- Scoped ESLint and `npx tsc --noEmit --pretty false` passed.
- Desktop: changed Project chat to Team review; booked Monday13:00 while optional Riley was unavailable; changed to15:30, saw the predecessor released; cancelled and saw15:30 offered again. A separate simulated competing booking caused the final check to reject09:15 while preserving guest details.
- Download: clicked **Download calendar invite (.ics)**. The real generated file at `Downloads/yasa-example-invite.ics` contained `DTSTART:20261116T153000Z`, `DTEND:20261116T161500Z`, required Morgan, optional Riley and a15-minute alarm. The extension's download-event receipt timed out; the actual file was subsequently inspected directly. No calendar import was performed.
-390×844: used Enter on a time button, reached typed guest questions, checked invalid email was invalid and completed a valid booking. Confirmation, reschedule/cancel/download actions remained contained and legible.
-320×568, Traditional Chinese: changed Team review, promoted Riley from optional to required; available count fell27→20 and Monday afternoon became unavailable. Date/time controls and attendance buttons remained contained; vertical scrolling is expected.
- Simplified Chinese: changed a select answer to Technical walkthrough, confirmed and saw the translated answer in the invite preview. UK/US English and both Chinese initial pages were reviewed. Tokyo grouped later UTC times under the next guest date.

Self-review: desktop9.3/10,390phone9.2/10,320phone9.0/10. Independent adversarial review remains the parent's release gate. The weakest phone detail is the unavoidable vertical stack of collective attendance controls before time choices; ordinary metadata now sits in a collapsed Meeting details panel.

Owned implementation: `SchedulingStudio.tsx`, `SchedulingStudio.module.css`, `SchedulingBookingFlow.tsx`, `copy/schedulingCopy.ts`, `src/lib/yasaBookingDemo.ts`, `scripts/check-yasa-booking-demo.mjs`, and `scripts/fixtures/project-copy-audits/schedulingCopy.audit.json`.
