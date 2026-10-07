# Simulated Records Evidence

Branch: `Simulated---records`. Verified 7 October 2026.

## Dataset and Reporting

The API creates a singleton `SimulationBatch` with one labelled five-word list,
two labelled configurations (Wordle/EASY and Word Search/CUSTOM), and 17 events:
eight visits, five successes, one failure, and three page-time measurements.
The average simulated duration is 30 seconds. Phonemes remain arrays, including
the multi-character token `dʒ`; hints and activity settings are persisted.
No HTML outputs are fabricated by sample creation.

The dashboard's recorded view excludes batch-owned records. The simulated view
includes only those records and labels its warning as a demonstration, not a
real failure. Ordinary interactions with the builders remain recorded usage.
Saved Data uses ownership markers to label simulation records even after rename.

## Safety and Verification

- Sample creation and removal are atomic serializable transactions with bounded
  retries. Creation is idempotent and does not overwrite an existing dataset.
- Cleanup targets the batch ID, not names, prefixes, timestamps, or all records.
- Teacher-created configurations referencing the sample list block removal
  with 409, preventing cascade deletion of those teacher records.
- Cancellation leaves the dataset intact. Removal can be repeated safely.
- Docker frontend/API production builds, TypeScript, lint, and Prisma schema
  validation passed. Schema additions preserve existing records as non-simulated.
- Final full Playwright suite: 18 passed in 14.9 seconds. New live tests verify reload
  persistence, expected metrics, source separation, phoneme arrays, visible
  labels, concurrent creation, confirmation cancellation, blocked dependencies,
  name-collision safety, and preservation of original teacher lists.
- Pending sample operations disable report switching and refresh. A controlled
  browser test exercises this race protection without changing the database.
- When metrics are unavailable, dataset status is also marked unavailable and
  mutation controls are disabled rather than claiming the dataset is absent.
- Tests create temporary records and remove them in cleanup. They skip rather
  than remove a demonstration dataset that already existed before the test.
- A simulated mobile screenshot is retained as `simulation-mobile.png`; the
  test checks no horizontal overflow at 390px. Desktop/mobile theme regression
  screenshots remain available in the local Playwright results.
- The retained `simulation-summary.json` records 18 Lighthouse accessibility
  audits scoring 100 with no failed automated checks; representative dashboard
  reports are `simulation-dashboard-desktop.html` and
  `simulation-dashboard-mobile.html`. The capture covers the initial recorded
  view, not the final unavailable-status or pending-operation states, which are
  covered by the browser regression tests instead.

## Limits

Lighthouse audits the initial recorded view, not the simulated warning or every
mutation state. Screen-reader and full manual contrast checks remain outstanding.
These endpoints use the existing unauthenticated local API; do not expose the
mutation API publicly without appropriate access control. Historical load-test
results are not a new capacity measurement of this version.

If a teacher edits or deletes sample items individually, remove and recreate
the batch to reset the demonstration. Removal also deletes outputs associated
with the owned sample configurations, as stated in the confirmation prompt.
