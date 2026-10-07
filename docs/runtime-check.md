# Packaged-Copy Runtime Check

Verified 7 October 2026 on `Runtime-Check`. This stage changes documentation and
retains evidence only; application source and dependency versions are unchanged.

## Package and Isolation

- Tested archive: `Benjamin-Colston-22557298-A3-20261007-025957-412.zip`.
- SHA-256: `1243A5105210ED319BA367F50B3AF8AEA90272724EF32EDCF80DC30F5A892558`.
- 150 verified files, extracted to
  `submissions/runtime-check-20261007-025957/cse3cwa-project`.
- Ran `docker compose -p a3-runtime-check-20261007 up --build -d` from the copy.
  Its newly created volume was `a3-runtime-check-20261007_postgres-data`, separate
  from `cse3cwa-project_postgres-data`. Initial stored counts were all zero.
- The original containers were temporarily stopped because names/ports are fixed.
  No volume was deleted. Runtime images were built under separate project tags;
  Docker reused build/dependency cache from the preceding packaged build.
- Ran `npm ci` in the extracted frontend: 367 packages installed successfully
  from the included lockfile. Chromium was already installed on this machine.

## Results

- Extracted `/health` and `/dashboard` returned 200; `/metrics` read the fresh DB.
- Ran the extracted frontend's own `npm run test:e2e`: **22 passed in 20.6 seconds**.
  Coverage includes CRUD, dashboard errors/empty/mobile views, sample creation,
  reload persistence, source separation, protected cleanup, concurrent creation,
  compact Wordle layout, and Word Search keyboard/exact-instance pointer selection.
- Both stored-output tests load database configurations into their respective
  builders, persist HTML, retrieve it through Saved Data, compare the downloaded
  bytes with the database output, and play that exact standalone download.
  Retained screenshots: `../testing/evidence/runtime-check/stored-wordle.png`
  and `stored-word-search.png` in the same directory.
- Created another labelled sample batch and restarted all three test containers.
  Afterwards it still had one list, two configurations, five sample successes,
  one sample failure, and a 30,000ms average. Scoped removal then succeeded;
  no lists, configurations, stored outputs, or simulation batch remained.
  Normal test interaction telemetry remains in the isolated test database.
- Stopped the test project without deleting its volume and restored the original
  stack using `docker compose up -d --no-build`. Its original list, configuration,
  and stored-output IDs matched the pre-check snapshot; health/dashboard were 200.

## Dependency Security Follow-Up

Installation exposed npm audit findings: frontend **11 (10 high, 1 critical)**;
API lockfile **14 (13 high, 1 critical)**. Raw reports are retained under
`../testing/evidence/runtime-check/frontend-audit.json` and `api-audit.json`.
Counts describe flagged packages and dependency chains, not distinct proven
exploitable application bugs. Browser-test success is not security clearance.

Both services pin Next.js 16.3.0. Maintainer advisories confirm affected ranges:
[Windows-hosted RCE](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36),
[AVIF image optimization](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4),
and [Node ImageResponse](https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j).
Their exposure conditions differ: the tested Docker servers use Linux, and
source search found no `next/image`, `next/og`, or `ImageResponse` use. This does
not prove all dependency risks are absent. Review patched versions and transitive
dependencies on a separate security branch, then rerun builds/tests and regenerate
the archive. Do not run `npm audit fix --force` blindly or expose this local,
unauthenticated demonstration publicly.

## Next Actions

User approval/commit/merge remain outstanding. The tested archive does not
contain this subsequently added evidence; regenerate after the approved stage.
Resolve the dependency findings before treating the package as security-ready.
Complete the final video, official AI acknowledgement, references/portal checks,
and upload using `submission-checklist.md`. No upload was performed.
