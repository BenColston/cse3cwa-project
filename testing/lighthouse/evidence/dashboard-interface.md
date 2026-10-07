# Dashboard Interface Evidence

Branch: `Dashboard---Interface`. Verified 7 October 2026.

## Implemented

- `/dashboard` consumes the existing database-backed `/metrics` endpoint and
  checks API liveness through `/health` separately.
- Saved word-list, configuration, and output totals; per-type configurations
  and builder visits; most-used activity including ties; generation outcomes;
  average visible-page duration and the number of samples.
- Loading, empty-data, unavailable-health, metrics failure, retry/recovery,
  and failed-generation warning states. Refresh errors clear stale totals.
- Dashboard access from navigation and Home, compact navigation on narrower
  screens, accessible table headings, status announcements, and light/dark
  presentation. Health checks and metrics requests time out after 10 seconds.

## Verification

- Docker production build and TypeScript checks passed.
- Frontend lint passed.
- Full Playwright suite: 15 passed in 16.2 seconds, including five dashboard
  tests alongside the existing builder and standalone game regressions.
- Controlled API responses exercise failure, recovery, empty data, ties, and
  loading without inserting artificial events in the database.
- A separate browser test loads real API metrics and compares the saved
  word-list count to the rendered value.
- Screenshots and horizontal-overflow checks cover 1440px desktop, 820px tablet,
  and 390px mobile in both light and dark themes. Representative images are
  retained as `dashboard-desktop-light.png` and `dashboard-mobile-dark.png`.
- Lighthouse dashboard accessibility: desktop 100 and mobile 100, with zero
  failed automated accessibility audits. Reports: `dashboard-desktop.html`
  and `dashboard-mobile.html`.

The original test run had two ambiguous alert selectors matching Next.js's
route announcer as well as the dashboard alert. Selectors were scoped to the
main content and the complete suite passed on rerun. Visual review also found
dark-theme link contrast that was corrected before the final verification.

## Limits

- A healthy API does not establish database readiness. Metrics retrieval is
  reported independently.
- Configuration counts are current records, not cumulative lifetime creations.
- Usage records include ordinary test/audit builder visits and downloads.
  Download outcomes are separate from stored generated-output counts.
- This stage does not implement a labelled simulated-record workflow.
- Lighthouse runs audit initial light-theme states. Visual dark-theme checks
  are not a substitute for a complete contrast or screen-reader audit.
- No WCAG certification, maximum load capacity, or final submission-readiness
  claim is made by this evidence.
