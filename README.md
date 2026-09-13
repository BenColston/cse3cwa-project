# CSE3CWA Project

Benjamin Colston - 22557298

## Overview

This project is the Assessment 2 version of the phoneme activity builder. It
extends the Assignment 1 frontend with a backend API, Postgres database, Prisma
schema, validation, Docker support, and stored activity workflows.

Teachers can save phoneme word lists, create Wordle or Word Search activity
configurations from stored data, generate downloadable HTML activities, and
store generated HTML outputs against saved activity configurations.

## Project Structure

```text
cse3cwa-project/
  frontend/   Next.js frontend for the activity builder
  api/        Next.js API service with Prisma and Postgres integration
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

The schema is in:

```text
api/prisma/schema.prisma
```

## API Endpoints

```text
GET     /health

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

## Submission Notes

- Do not include `node_modules` in the submitted zip.
- Include the GitHub repository link.
- The video demonstration should show the student ID, Docker run, health check,
  backend CRUD workflow, configuration save/load, and stored generated HTML.
