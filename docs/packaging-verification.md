# Submission Packaging Verification

7 October 2026, branch `Submission---Prep`.

- Packaging successfully created a 149-file source/evidence ZIP and verified
  each archive entry's length and SHA-256 against its input file.
- The ZIP was extracted into a separate ignored `submissions/package-check-*`
  directory. Its Docker Compose configuration passed `config -q`.
- Both extracted production Docker images built successfully under separate
  `a3-package-check` tags. Frontend/API compilation and TypeScript passed;
  Prisma Client generation succeeded. Dependency installation layers were
  reused from Docker's existing cache, not a fresh network install.
- Running application containers and the original database were not replaced.
- Final documentation-only changes were included in a regenerated archive;
  application source and lockfiles are unchanged from the extracted build.
- The manifest identifies the base commit and uncommitted working-tree changes.
  It does not identify this candidate as an approved committed release.

The resulting archive was checked for excluded dependency/build/private-env/
tool/raw-result paths. Example environments, Dockerfiles, schema, lockfiles,
tests, and retained evidence remain included. This is not an exhaustive
credential or privacy audit.

No second stack was started, so an independently running extracted-copy check
remains pending in `submission-checklist.md`. Previous 22-test browser results
and 18 Lighthouse audits apply to the application source, not a new browser run
from this package. No live database, personal final video, or completed official
AI acknowledgement is included or verified. Nothing has been uploaded.

Regenerate with `./scripts/prepare-submission.ps1` after approval/commit or edits.
Review the final manifest and follow `submission-checklist.md` before uploading.
