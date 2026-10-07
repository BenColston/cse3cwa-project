# Assessment 3 Submission Review

Reviewed 7 October 2026 against the supplied Assessment 3 brief and the existing
repository. This is a working checklist, not a completed submission declaration.
The subsequently supplied Assessment 3 rubric weights dashboard/reporting at
6 marks, persistence at 6, observability at 5, testing/accessibility at 4, and
code quality/GitHub at 4 (25 total). Dashboard-stage updates below reflect the
implemented interface; this checklist is not a predicted grade.

## Requirement Status

| Requirement | Status | Evidence or remaining work |
| --- | --- | --- |
| Extend the existing Next.js builder | Implemented | Separate Next.js frontend and API services continue the earlier project. |
| Store and retrieve phoneme content and activity settings | Implemented | Prisma models, Postgres persistence, CRUD routes, Saved Data, and builder save/load workflows. |
| Database-backed operational statistics | Implemented | `UsageEvent`, `/metrics/events`, and `/metrics` feed the dashboard's usage, duration, and generation summaries. |
| Data-driven dashboard interface | Implemented; final demonstration pending | `/dashboard` presents stored totals, per-type saved configurations and builder visits, generation outcomes, page-time samples, and health. |
| Simulated input records | Implemented | Dashboard controls create an owned, labelled dataset with phoneme content, both activity types, settings, hints, and persisted sample events. Separate reporting and guarded cleanup are tested. |
| Visible operational indicators and alerts | Implemented | Dashboard shows health/metrics status, warnings, empty-data states, and request errors. The simulated failure is explicitly labelled and excluded from recorded failures. |
| Reporting views | Implemented | Dashboard activity table compares current configurations and recorded builder visits, reports the most-used type (including ties), and links to saved data/outputs and builders. |
| `/health` returns 200 | Verified live | Returned 200 with `status: ok`. This checks API liveness, not database readiness. |
| Playwright builder and generated-output use cases | Verified in Polish | Full suite: 22 passed. Includes persisted playable downloads and compact Wordle layout across four viewports and phoneme lengths. |
| Staged JMeter workflow testing and interpretation | Historical stages plus current smoke | Existing stages are retained; the highest stage had timeouts. Final-review one-user smoke passed 22 requests with zero failures. Higher-load stages were not repeated. |
| Lighthouse results and resulting design changes | Fresh Polish evidence plus historical reports | All 18 fresh desktop/mobile accessibility audits scored 100, with zero failed audits. Original reports remain retained; manual limitations are documented. |
| Final 3-8 minute video covering all requested features | User verification needed | Test footage has been recorded; final coverage must include the new dashboard/reporting interface and simulated-data workflow. |
| Code ZIP and repository link | Preparation implemented; final approval pending | `scripts/prepare-submission.ps1` creates a filtered ZIP and verifies every archived file hash. Repository link is in README. Regenerate after final approval/commit; see `submission-checklist.md`. |
| At least five sources in APA 7 style | Draft prepared | See `references.md`; review relevance and include the references in the submission format accepted by the coordinator. |
| AI acknowledgement | User action | Complete the official LMS form. No completed acknowledgement was verified in the repository. |

The original review returned 200 for the frontend, `/health`, and `/metrics`,
but 404 for `/dashboard`. The subsequent dashboard branch implements that route
and includes a live database-backed browser test, in addition to controlled
responses for failure and empty-data coverage. Successful endpoint responses
alone do not establish database readiness or full requirement compliance.

## Stage Progress

1. Dashboard interface: implemented and verified, with retained test/audit evidence.
2. Simulated records: implemented and merged before this review. Synthetic
   metrics remain separate from recorded usage.
3. Dashboard and simulation regression coverage: implemented, including safe
   cleanup. Continue the documented manual accessibility checks.
4. Integrated review: completed in `final-review.md`. Presentation findings are
   resolved on `Polish`, with current evidence in
   `../testing/lighthouse/evidence/presentation-polish.md`.
5. After approving and merging polish, use `video-walkthrough.md` and prepare
   the references, acknowledgement, and ZIP. Regenerate old HTML for filming.
6. Submission preparation on `Submission---Prep`: repeatable filtered packaging,
   per-file/archive hashes, and final upload/extracted-copy checks are provided.
   See `submission-checklist.md`. Personal video, official acknowledgement,
   applicable deadline, portal format, and final upload remain unverified.
7. Packaged runtime verification on `Runtime-Check`: isolated fresh database,
   22 passing browser tests, restart persistence, and original stack restoration
   are documented in `runtime-check.md`. Dependency audit findings need a separate
   security follow-up before declaring the package security-ready.
8. `Security-Fixes` applies Next.js/Prisma patches and compatible transitive
   updates. Critical findings are removed; remaining high dependency warnings
   are documented in `security-fixes.md`. Regenerate earlier archives after approval.

Keep each step on a feature branch, with user-reviewed commits and merges.
Do not implement changes on `main`.

## Evidence Interpretation

- Configuration totals are current database rows, not lifetime creations.
- Average page time is derived from recorded visible-page durations; it is not
  a measure of learning outcomes or complete user-session duration.
- Download-generation events and stored HTML outputs are separate measurements.
- HTTP failures in JMeter are not automatically app generation-failure events.
- The 10,000-user JMeter stage recorded 207,680 requests and 3,903 timeouts
  (1.88%). Its observed peak was 389 active threads, not 10,000 simultaneous
  users. See the retained findings for ramp-up, skipped requests, and cleanup.
- A Lighthouse accessibility score of 100 is not WCAG certification. Retain
  the documented manual-check limitations and explain the keyboard improvements.

## Final Video Guide

The implemented dashboard and simulation workflow are covered by the timed
steps and dialogue in `video-walkthrough.md`. Rehearse using newly generated
activities after the approved polish merge. Keep the total within 3-8 minutes.

1. Introduce Benjamin Colston, student 22557298, with face, voice, and student ID.
2. Show the running application and explain frontend -> API -> Postgres data flow.
3. Show saved phoneme content, a labelled simulated-data example, dashboard
   metrics, reporting summaries, health status, and an appropriate alert state.
4. Load stored data into a builder, generate an activity, and demonstrate the
   standalone output. Explain how persisted data drives it.
5. Show Playwright tests and their results, including a builder and player case.
6. Show the staged JMeter reports and interpret the highest-stage failures;
   do not spend the recording waiting for the long load test.
7. Show Lighthouse before/after results and explain labelling, keyboard, and
   mobile-layout changes, plus remaining manual accessibility limitations.
8. Show the GitHub homepage and staged commit history, then briefly conclude.

## Packaging Checklist

- Include frontend/API source, Prisma schema, Docker configuration, package
  manifests and lockfiles, test source, concise retained evidence, and docs.
- Exclude `node_modules`, `.git`, `.next`, private `.env` files, local `.tools`,
  and generated caches. Keep `.env.example` and setup instructions.
- Avoid bundling large raw test result directories unless requested. Preserve
  the original reports locally and include the tracked summaries and evidence.
- Verify the packaged copy can be installed and run with the documented steps.
- Include the GitHub repository link, final video, reviewed references, and
  completed official AI acknowledgement as required by the submission portal.
- Confirm the LMS submission format: the brief says video only with no written
  report, but also contains Word/PDF similarity-score wording. Ask the coordinator
  how to satisfy that wording rather than assuming an extra report is required.

The supplied brief does not explicitly require cloud hosting. Confirm any
additional current LMS or lecturer deployment instructions before adding AWS
work to this stage.
