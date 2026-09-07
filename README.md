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
