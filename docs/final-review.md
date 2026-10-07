# Assignment 3 Integrated Review

Reviewed on 7 October 2026 on `Final-review`. This stage adds integrated tests
and submission guidance, not application behaviour changes. It is not a grade
prediction or confirmation that the final submission has been uploaded.

Presentation follow-up on `Polish`: the two presentation findings below are
resolved. New generated Wordle files use compact responsive rows and a
side-by-side desktop keyboard; About, Saved Data, and metadata use Assessment 3
copy. The About video placeholder remains. Previously downloaded or stored HTML
must be regenerated to receive the new layout.

## Findings

1. **Resolved on `Polish`:** the original standalone Wordle
   board uses full-width square cells, making three-phoneme rows unusually tall.
   The 1280px screenshot is 2450px high and its keyboard is below the first
   screen. Gameplay works, but compact, responsive rows would improve usability
   and the demonstration. Inspect `frontend/lib/htmlGenerators.ts`, lines 43-44
   and 86 at review time. The original screenshot is retained under
   `testing/evidence/final-review`; current evidence is linked below.
2. **Resolved on `Polish`:** About, Saved Data, and metadata previously referred to
   Assessment 2. Inspect `frontend/app/about/page.tsx`,
   `frontend/app/saved-data/page.tsx`, and `frontend/app/layout.tsx`. Refresh this
   text in the same presentation-polish stage without changing the user's
   previously retained video placeholder.
3. **Submission tasks are not complete:** verify the final video covers the new
   dashboard and simulations; complete the official AI acknowledgement; review
   references; prepare and independently check the ZIP. No final upload or
   existing personal recording was inspected in this review.

No functional regression was found in the exercised stored-data and generated
activity workflows. Remaining manual accessibility and public-deployment
limitations are listed below; automated checks do not establish their absence.

## Rubric Mapping

| Category | Weight | Verified evidence and remaining considerations |
| --- | --- | --- |
| Dashboard, reporting and generation | 6 | Database-backed dashboard, per-type report, source separation, alerts, and stored playable outputs for both games. Compact Wordle presentation is verified on desktop and mobile. |
| Database persistence and stored activity data | 6 | Lists, phoneme arrays, hints, settings, activity configurations, usage events, and outputs persist through the API. Tests reload data and compare downloaded HTML byte-for-byte with stored content. |
| Observability and statistics | 5 | Health, saved counts, visits, page-duration samples, most-used type/ties, generation events, and stored-output counts. Synthetic events are explicitly labelled and excluded from recorded metrics. Health is API liveness, not database readiness. |
| Testing and accessibility | 4 | Polish full suite: 22 Playwright tests passed in 20.4 seconds. Final-review JMeter smoke: 22 requests, zero failures; it predates presentation polish. Retained load and Lighthouse evidence have stated limitations. |
| Code quality and GitHub | 4 | Separate frontend/API, Prisma models, reusable client/data/game modules, scoped simulation transactions, tests, setup docs, and staged branches/merges. Show repository homepage and commits in the video; do not claim a mark for commit count alone. |

## Verification Details

- Both integrated tests create uniquely named temporary lists/configurations,
  load the configuration through the builder, store generated HTML, download it
  through Saved Data, and play that exact stored artifact.
- Wordle verifies the database-selected `jam` target, including multi-character
  `dʒ`, and submits the correct phoneme sequence. Word Search verifies an 8x8
  grid, finds the stored `jam` sequence by keyboard, and checks the selected path.
- Temporary content, dependent configurations, and outputs are removed by
  deleting only the test-owned list. Simulation tests also clean up their own
  samples and preserve a pre-existing demonstration dataset.
- After testing, saved totals remained one list, one configuration, and one
  output, with no simulation batch present. Normal test/audit visits and
  downloads remain recorded telemetry, not fabricated classroom usage.
- Frontend lint and TypeScript `--noEmit` passed. Production application builds
  and schema validation passed in the previous simulation stage; this review
  changes no production application code and does not claim a new Docker build.
- JMeter used fresh generated fixtures and one user with two loops, covering
  both activity types. Summary: average 11.36ms, p95 16ms, zero errors.
  `testing/jmeter/evidence/final-smoke-summary.json` preserves this result without
  replacing the original baseline. Raw report:
  `testing/jmeter/results/users-1-20261007-132407-eded53/report/index.html`.
- Higher-load runs remain historical evidence, not fresh capacity measurements
  of this version. At the 10,000 configured-user stage, 3,903 of 207,680 requests
  timed out (1.88%); measured peak active threads were 389, not 10,000 simultaneous
  users. Explain those limitations rather than describing that stage as a pass.
- Retained Lighthouse simulation-stage summary: 18 accessibility checks scored
  100, with zero failed automated audits. These cover initial light-theme pages,
  not every alert, theme, or mutation state. No audits were rerun in this
  test/documentation-only review; preserve the original before/after reports.

## Remaining Limits

Manual screen-reader, full contrast, zoom/reflow, and all-variant checks remain
outstanding. A score of 100 is not WCAG certification. The local API has no
authentication; public hosting requires appropriate access controls. Metrics
describe stored records and recorded browser events, not student learning or
maximum production capacity.

## Next Stage

Presentation fixes are complete on `Polish`; see
`../testing/lighthouse/evidence/presentation-polish.md` for current verification.
After user approval and merge, follow `video-walkthrough.md` and the packaging
checklist in `assignment-3-review.md`. Commits and merges remain user-owned.
