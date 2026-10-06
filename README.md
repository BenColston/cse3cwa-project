# CSE3CWA Project

Benjamin Colston - 22557298

## Overview

This project is the phoneme activity builder developed across Assessments 1,
2, and 3. It includes a frontend, backend API, Postgres database, Prisma schema,
validation, Docker support, stored activity workflows, and usage instrumentation.
Assessment 3 is still in progress: the metrics API and testing evidence exist,
but the dashboard interface, labelled simulated records, and operational
reporting views remain to be completed.

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

The schema is in:

```text
api/prisma/schema.prisma
```

## API Endpoints

```text
GET     /health
GET     /metrics
POST    /metrics/events

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
database readiness. A dashboard consuming these endpoints is not yet implemented.

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

Lighthouse accessibility audits, before-and-after evidence, and manual-check
limitations are in [testing/lighthouse/README.md](testing/lighthouse/README.md).

JMeter load-test setup, stage commands, and report guidance are in
[testing/jmeter/README.md](testing/jmeter/README.md). Start with its one-user
smoke test before increasing the traffic level.

- Do not include `node_modules` in the submitted zip.
- Include the GitHub repository link.
- The Assignment 3 video must be 3 to 8 minutes and include your face, voice,
  student ID, working application, dashboard, data-driven features, alerts,
  reporting views, observability metrics, Playwright tests, JMeter results,
  Lighthouse results, and the GitHub homepage and commits.
- Complete the remaining dashboard and reporting requirements before recording
  the final walkthrough. Previously recorded test footage may still be useful.
- Submit the required AI acknowledgement using the LMS template and review the
  reference draft against the work actually used.
