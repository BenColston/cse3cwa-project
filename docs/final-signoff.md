# Assessment 3 Final Technical Check

Benjamin Colston, student 22557298. Prepared 7 October 2026 on `Final`.
Repository: https://github.com/BenColston/CSE3CWA-Project

This is a technical handover, not proof of a completed or accepted submission.
The branch starts at `eb48577`, merging the reviewed security stage. Application
files match security-review commit `a071ab4`; this stage changes documentation
and generates a new package only. No commits or uploads are performed here.

## Technical Status

- Both services use Next.js 16.3.6. The API uses Prisma CLI/client 6.19.3 and
  the reviewed API-scoped deepmerge-ts 8.0.2 override in its manifest/lockfile.
- Final local dependency-security run: four checks passed. Final browser run:
  **22 passed in 20.1 seconds**, including both stored playable downloads.
- Health and dashboard returned 200. Original saved totals are one word list,
  one configuration, and one stored output.
- Both production Docker builds, lint, and in-container dependency tests passed
  in `security-review.md`. No new application build is claimed for this docs-only
  stage. Tests create/clean their own content; original data is preserved.
- Retained full audits contain five high braces/tooling findings per service;
  production-only audits contain zero findings. Installed Docker images still
  include dev tooling. Neither automated tests nor filtered audits certify
  security or public-deployment readiness. See `security-review.md`.
- Prior isolated ZIP runtime checks, Lighthouse audits, and staged JMeter runs
  remain dated historical evidence. The isolated ZIP run preceded dependency
  patches; later Docker/browser checks verify the patched application source.
  Do not claim the new ZIP was independently run on a fresh machine.

## Package Handover

`./scripts/prepare-submission.ps1` generates the current candidate ZIP, SHA-256
file, and per-file manifest in ignored `submissions/`. The manifest records the
base commit, branch, and any uncommitted inputs. Every entry is verified against
source bytes. Required schema, Dockerfiles, lockfiles, setup examples, tests,
retained evidence, references, and video script are included.

The archive omits dependencies, private environment/key files, Git/build caches,
downloaded tools, and large raw test runs. It contains no live database backup,
personal final video, or completed official AI form. Inspect the source/evidence
for private information; path filtering is not a general secret scanner.

After approving and committing this stage, regenerate the ZIP so its manifest
identifies the final approved revision. Do not submit older pre-patch ZIPs.
Use `submission-checklist.md` for extraction/runtime and portal checks.

## User Sign-Off Still Needed

- Verify the final video is 3-8 minutes and shows face, voice, student ID,
  dashboard/reporting, labelled simulations/alerts, data flow, playable stored
  outputs, Playwright, JMeter, Lighthouse, and GitHub homepage/history.
- Complete the official LMS AI acknowledgement with actual assistance and review.
- Review the seven-source APA draft against the sources actually used and the
  coordinator's accepted format. At least five relevant sources are required.
- Confirm the applicable deadline/extension and the brief's conflicting
  video-only versus Turnitin similarity-score instructions in LMS.
- Confirm the final approved ZIP/repository/video/form are uploaded correctly,
  required similarity checking is satisfied, and a receipt is retained.

These personal/portal items are unverified, not automatically marked incomplete
in your own submission. No video recording or official acknowledgement was
inspected during this stage. No extra written report is assumed to be required.
