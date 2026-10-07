# Assessment 3 Submission Checklist

Benjamin Colston, student 22557298.
Repository: https://github.com/BenColston/CSE3CWA-Project

## Code Package

From PowerShell at the repository root on an approved feature branch:

```powershell
./scripts/prepare-submission.ps1
```

The command creates a timestamped ZIP, SHA-256 checksum, and per-file manifest
under `submissions/` (ignored by Git). It packages current tracked and non-ignored
files, including uncommitted changes, not just HEAD. It verifies all archived
bytes against their source hashes and checks required setup files are present.
Regenerate after approval, commits, or any edits; use only the final approved ZIP.
The checksum/manifest are local verification aids, not extra mandated uploads.

Included: frontend/API source, lockfiles, Prisma schema, Docker configuration,
example environments, tests, retained evidence, references, script, and guides.
Excluded: dependencies, Git internals, private environment files, key files,
build caches, browser traces/reports, downloaded tools, and large raw test runs.
This is not a general secret scanner: personally inspect source and evidence
for credentials or private data before upload. No live database backup is included.
Fresh databases can use Dashboard's labelled sample-record controls.

## Check the Packaged Copy

Current preparation results and limitations are in `packaging-verification.md`.

1. Extract the final ZIP to a new folder, not over the current repository.
2. Open PowerShell in its `cse3cwa-project` folder. Run `docker compose config -q`.
3. Stop the original stack with `docker compose down` before running the copy:
   fixed container names and ports would otherwise conflict. Do not use `-v`;
   preserve the original database volume.
4. In the extracted copy, run `docker compose up --build -d`. Dockerfiles use
   `npm ci` from the included lockfiles. A different Compose project directory
   may create a fresh database volume rather than use the original teacher data.
5. Open `http://localhost:3000/dashboard` and `http://localhost:4080/health`.
   Create sample records, load both saved configurations, and generate/play
   fresh HTML. Confirm stored outputs can be downloaded through Saved Data.
6. To rerun browser tests, follow the frontend setup in README. Test results
   depend on running services and installed Chromium; neither is bundled.
7. Stop the copied stack when finished. Restore the original stack if needed.

Archive hash verification and Compose validation do not prove a fresh machine
can install/run the package. Record the extracted-copy runtime check separately;
do not treat earlier tests on the working repository as that check.

## Final Upload Items

- Approved code ZIP and repository link (also present in README).
- Final video, 3-8 minutes, with readable app/testing evidence, face, voice,
  and student ID. Follow `video-walkthrough.md`; inspect the finished recording.
- Official LMS AI acknowledgement, completed with your actual AI use and review.
- At least five relevant academic/industry sources in APA 7 style. The seven
  entries in `references.md` are a draft; check they reflect sources actually used.

The supplied brief's due date is 4 October 2026. Confirm your applicable deadline
or approved extension in LMS; this checklist does not establish an extension.
The brief also conflicts between video-only/no written report and Word/PDF
similarity-score instructions. Confirm the accepted Turnitin upload format with
the coordinator; do not assume a code ZIP/video alone satisfies similarity rules.

Video, acknowledgement, portal format, applicable deadline, and successful upload
remain user-verification items. No submission is made by the packaging command.
