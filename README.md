# CSE3CWA Project

Benjamin Colston - 22557298

## Assignment 2 direction

This project builds on the Assignment 1 phoneme Wordle and Word Search frontend.
Assignment 2 adds a backend, database layer, API routes, validation, and Docker
support so activity data can be stored and reused.

## Current structure

```text
cse3cwa-project/
  frontend/   Assignment 1 Next.js frontend application
  api/        Backend/API service placeholder for the next step
```

The first Assignment 2 step is intentionally structural only. The existing
frontend has been moved into `frontend/` so later branches can add the API,
Postgres database, Prisma schema, and Docker Compose services as separate,
traceable commits.

## Frontend

Run the existing Assignment 1 frontend from the `frontend/` directory:

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Docker base

The project now has a three-service Docker Compose foundation:

```text
frontend  Next.js user interface, exposed on FRONTEND_PORT or 3000
api       Next.js backend/API service, exposed on API_PORT or 4080
db        Postgres database service, exposed on POSTGRES_PORT or 5432
```

Example local Docker command:

```bash
docker compose up --build
```

The API health check should then be available at
`http://localhost:4080/health`.

For an AWS Academy EC2 demonstration, `FRONTEND_PORT` can be set to `80` so the
frontend is available over the standard HTTP port.

## Database foundation

The API service uses Prisma with Postgres. The initial schema stores phoneme word
lists, words with phoneme arrays, activity configurations, and generated HTML
records.

Useful API project commands:

```bash
cd api
copy .env.example .env
npm run prisma:validate
npm run prisma:generate
npm run db:push
```
