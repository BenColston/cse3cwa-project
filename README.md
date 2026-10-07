# CSE3CWA Project

Benjamin Colston - 22557298

## Overview

This project is the phoneme activity builder developed across Assessments 1,
2, and 3. It includes a frontend, backend API, Postgres database, Prisma schema,
validation, Docker support, stored activity workflows, and usage instrumentation.
Assessment 3 is still in progress: the dashboard now presents database-backed
metrics, an activity report, health indicators, and generation warnings.
The dashboard can create and remove a labelled simulated dataset and report its
metrics separately from recorded usage. Final submission preparation remains.

Repository: https://github.com/BenColston/CSE3CWA-Project

Teachers can save phoneme word lists, create Wordle or Word Search activity
configurations from stored data, generate downloadable HTML activities, and
store generated HTML outputs against saved activity configurations.

## Project Structure

```text
cse3cwa-project/
  frontend/   Next.js frontend for the activity builder
  api/        Next.js API service with Prisma and Postgres integration
  testing/    JMeter and Lighthouse tooling and retained evidence
  docs/       Submission review and reference draft
```

## Main Features

- Phoneme word lists stored in Postgres.
- Words store phonemes as arrays, including multi-character phoneme symbols.
- Activity configurations store activity type, difficulty, selected word list,
  and JSON settings.
- Generated HTML outputs can be stored and downloaded from saved activities.
- Wordle and Word Search builders can load saved backend word lists.
- Saved configurations can be reloaded into the builders.
- `/dashboard` reports saved content, per-type configurations and builder visits,
  page-time samples, generation outcomes, and stored output totals.
- Dashboard refresh supports loading, empty-data, failed-request, and recovery
  states without presenting old metrics as current.
- Repeatable sample content and events are database-backed and clearly labelled;
  cleanup protects teacher-created records and dependent configurations.
- `/health` endpoint returns `200 OK` when the API is running.
- Docker Compose runs the frontend, API, and database together.

## Docker Run

From the project root:

```bash
docker compose up --build
```

Then open:

```text
Frontend: http://localhost:3000
API health: http://localhost:4080/health
```

The API container runs `npx prisma db push` before startup so a fresh Docker
Postgres database is synced with the Prisma schema.

To stop the stack:

```bash
docker compose down
```

## Local Development

Frontend:

```bash
cd frontend
npm install
npm run dev
```

API:

```bash
cd api
copy .env.example .env
npm install
npm run prisma:generate
npm run db:push
npm run dev
```

The frontend expects the API at `http://localhost:4080` by default. This can be
changed with `NEXT_PUBLIC_API_BASE_URL`.

## Database Model

The Prisma schema includes:

- `WordList` for teacher-created phoneme word lists.
- `WordEntry` for words and their phoneme arrays.
- `ActivityConfig` for Wordle and Word Search settings.
- `GeneratedOutput` for stored downloadable HTML output.
- `UsageEvent` for persisted page-duration, activity-use, and generation events.
- `SimulationBatch` for explicit ownership of demonstration content and events.

The schema is in:

```text
api/prisma/schema.prisma
```

## API Endpoints

```text
GET     /health
GET     /metrics
GET     /metrics?source=simulated
POST    /metrics/events
POST    /simulation
DELETE  /simulation

GET     /word-lists
POST    /word-lists
GET     /word-lists/:id
PUT     /word-lists/:id
DELETE  /word-lists/:id

GET     /activities
POST    /activities
GET     /activities/:id
PUT     /activities/:id
DELETE  /activities/:id

GET     /activities/:id/outputs
POST    /activities/:id/outputs
```

The API includes validation and consistent JSON error responses.

### Operational metrics

`GET /metrics` returns word-list and activity-configuration totals, saved
successful outputs, failed generation events, average recorded page duration,
and activity-use counts by type. The frontend records builder visits, visible
page duration, and HTML download outcomes through `POST /metrics/events`.

Supported event payloads:

```json
{ "eventType": "PAGE_VIEW", "durationMs": 42000 }
{ "eventType": "ACTIVITY_USED", "activityType": "WORDLE" }
{ "eventType": "GENERATION_SUCCEEDED", "activityType": "WORDLE" }
{ "eventType": "GENERATION_FAILED", "activityType": "WORD_SEARCH" }
```

Page durations are limited to one day per event. Activity type is required for
activity-use and generation events. Successful and failed generation attempts
are counted from their respective events; stored downloadable HTML files are
reported separately.

Activity creation totals represent currently saved configurations, not lifetime
creation counts. `/health` is an API liveness check; it does not establish
database readiness. The dashboard checks health and metrics independently and
reports failures separately. Metrics refresh on entry and on explicit refresh;
there is no automatic polling. Tied activity-use counts are displayed as a tie.

`/metrics` defaults to recorded data and excludes records owned by a simulation
batch. `source=simulated` reports only batch-owned records; other source values
return 400. Ordinary builder visits and downloads remain recorded interactions,
even when a teacher chooses sample content. They are not synthetic events.

### Simulated demonstration

1. Open `/dashboard` and select **Create sample records** near the bottom.
2. The view switches to **Simulated demonstration**: one five-word phoneme list,
   one Wordle configuration, one Word Search configuration, eight sample visits,
   five sample successes, one sample failure, and three page-time samples with a
   30-second average. No generated HTML is fabricated.
3. Reload and select **Simulated demonstration** again to show persistence. In
   Saved Data, the sample list/configurations carry simulation labels and can be
   loaded into the builders using the normal saved-data workflow.
4. Switch to **Recorded usage** to show that synthetic failures and durations
   do not change the recorded report.
5. Select **Remove sample records** and confirm. This removes only batch-owned
   records and associated outputs. Removal is blocked with 409 if a teacher-created
   configuration depends on the sample list; move or delete that configuration
   explicitly first. An unrelated teacher list is never selected by its name.

Create is idempotent: an existing batch is not duplicated or overwritten. To
reset edited or individually deleted sample records, remove the batch and create
it again. The API uses serializable transactions with bounded conflict retries.
The existing API is intended for the local classroom demonstration; these
mutation endpoints do not add authentication for a public deployment.

## Demonstration Workflow

1. Open `http://localhost:3000/saved-data`.
2. Save a phoneme word list.
3. Open the Wordle or Word Search builder.
4. Select the saved backend word list.
5. Save an activity configuration.
6. Load the saved configuration.
7. Store generated HTML.
8. Return to Saved Data and download the stored HTML output.

## Verification Commands

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

API:

```bash
cd api
npm run lint
npm run build
npm run prisma:validate
```

Docker:

```bash
docker compose up --build
```

Browser tests:

```bash
cd frontend
npm install
npm run test:e2e:install
npm run test:e2e
```

Run the Docker Compose stack from the project root before starting the browser
tests. They use the frontend at `http://localhost:3000` and API at
`http://localhost:4080`; the word-list test creates and deletes its own test
record. Playwright saves failure traces, screenshots, videos, and an HTML report
under `frontend/test-results` and `frontend/playwright-report`. Open the report
with `npm run test:e2e:report` from `frontend`.

## Submission Notes

The requirement-by-requirement status and remaining work are documented in
[docs/assignment-3-review.md](docs/assignment-3-review.md). The industry-source
reference draft is in [docs/references.md](docs/references.md).
The integrated review and resolved presentation findings are in
[docs/final-review.md](docs/final-review.md); a timed video script is in
[docs/video-walkthrough.md](docs/video-walkthrough.md).
Final packaging and upload checks are in
[docs/submission-checklist.md](docs/submission-checklist.md). On an approved
feature branch, run `./scripts/prepare-submission.ps1` in PowerShell to create
a verified ZIP and hash manifest under `submissions/`. It includes current
uncommitted files; regenerate after approval/commit and any further edits.
The extracted-copy runtime results and dependency security follow-up are in
[docs/runtime-check.md](docs/runtime-check.md). Successful functional checks do
not clear the reported npm audit findings or make this local API public-ready.
Patched versions and remaining dependency warnings are documented in
[docs/security-fixes.md](docs/security-fixes.md). Regenerate older ZIPs after
approval; they do not receive dependency updates automatically.

Lighthouse accessibility audits, before-and-after evidence, and manual-check
limitations are in [testing/lighthouse/README.md](testing/lighthouse/README.md).
Dashboard verification is documented in
[testing/lighthouse/evidence/dashboard-interface.md](testing/lighthouse/evidence/dashboard-interface.md).
Simulation persistence, isolation, and cleanup evidence is in
[testing/lighthouse/evidence/simulated-records.md](testing/lighthouse/evidence/simulated-records.md).
Compact Wordle layout verification is in
[testing/lighthouse/evidence/presentation-polish.md](testing/lighthouse/evidence/presentation-polish.md).
Regenerate previously downloaded or stored Wordle HTML to receive the new layout.

JMeter load-test setup, stage commands, and report guidance are in
[testing/jmeter/README.md](testing/jmeter/README.md). Start with its one-user
smoke test before increasing the traffic level.

- Do not include `node_modules` in the submitted zip.
- Include the GitHub repository link.
- The Assignment 3 video must be 3 to 8 minutes and include your face, voice,
  student ID, working application, dashboard, data-driven features, alerts,
  reporting views, observability metrics, Playwright tests, JMeter results,
  Lighthouse results, and the GitHub homepage and commits.
- Review and merge the approved work before recording the final walkthrough.
  Previously recorded test footage may still be useful.
- Submit the required AI acknowledgement using the LMS template and review the
  reference draft against the work actually used.
