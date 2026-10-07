# Dependency Security Follow-Up

7 October 2026, branch `Security-Fixes`. This is a scoped dependency update,
not a claim that the application is secure or ready for public hosting.

## Changes

- Both services: Next.js and matching `eslint-config-next` 16.3.0 -> 16.3.6.
  The maintainer's [ImageResponse advisory](https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j)
  identifies 16.3.6 as patched for that critical affected range. Earlier Windows
  and AVIF advisories are linked in the historical `runtime-check.md`.
- API: Prisma CLI and client 6.19.0 -> 6.19.3, pinned together. Schema unchanged.
  The version-6 patch updates its `effect` dependency to 3.21.0.
- Compatible lockfile fixes include sharp 0.35.5, brace-expansion 1.1.21/5.0.12,
  js-yaml 4.3.2, source-map-js 1.2.2, and frontend nanoid 3.3.20.
- No application/gameplay changes, major migrations, forced audit fixes, or
  broad dependency overrides were introduced. React versions remain unchanged.

## Audit Results

| Service / Scope | Before | After |
| --- | --- | --- |
| Frontend full | 10 high, 1 critical | 5 high, 0 critical |
| API full | 13 high, 1 critical | 8 high, 0 critical |
| Frontend production-only | Not captured before | 0 findings |
| API production-only | Not captured before | 3 high, 0 critical |

Fresh raw reports: `../testing/evidence/security-fixes/`, full and production
scope for each service. Original reports remain in `runtime-check/` evidence.
Audit counts include dependency-chain findings, not independent exploit proofs.

## Unresolved Risks

- **braces**: five reported high findings per service form the braces ->
  micromatch -> fast-glob -> Next ESLint plugin/config chain. Registry's latest
  braces is still 3.0.3 and the [advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
  flags it. npm's forced remedy proposes downgrading the ESLint config to 14.2.35.
  That is not an appropriate automatic fix for this Next.js 16 project.
- **deepmerge-ts**: three additional API findings form the deepmerge-ts ->
  `@prisma/config` -> Prisma chain. Prisma 6.19.3 still pins deepmerge-ts 7.1.5;
  npm reports versions below 8 as affected and proposes a Prisma 6.12.0 downgrade.
  A major transitive override or ORM downgrade requires its own compatibility
  review, not a silent packaging change. It remains in the production-only audit.
- Dockerfiles install development dependencies and retain Prisma CLI for startup
  schema sync. Production-only audit results therefore do not describe every
  installed package in the actual images; full-image dependency warnings remain.
- The API has no authentication and Compose publishes ports. Keep this a local
  demonstration; patching Next.js does not add public-deployment access controls.

Do not suppress these findings or label the full audit clean. Review upstream
patches and mitigation options before public deployment, with targeted tests if
changing Prisma config/CLI or dependency resolution.

## Verification and Release

Both frontend/API lint checks passed. Prisma schema validation and client
generation passed with 6.19.3. Docker builds include TypeScript and locked `npm ci`.
Both Docker production images built successfully and services restarted against
the existing database. The full Playwright suite passed **22 tests in 20.8s**,
including both persisted playable downloads. Health and dashboard returned 200;
saved totals remained one list, one configuration, and one stored output after
test cleanup. No database schema changes or volume deletions were performed.

Lighthouse and high-load JMeter stages were not repeated for this dependency-only
change; retained reports remain historical. A new filtered/hash-verified candidate
ZIP was generated after verification. Regenerate once more after approval/commit
so its manifest identifies the final reviewed revision.

Older ZIPs contain the vulnerable versions. Regenerate after user approval and
commit; do not upload a pre-fix archive. Earlier packaged-copy/load/Lighthouse
reports are historical, not new security clearance. No commits/uploads are made.
