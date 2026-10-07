# Remaining Dependency Review

7 October 2026, branch `Security-Review`. This follows the historical findings
in `security-fixes.md`; it is not a public-deployment security certification.

## Prisma Dependency Patch

The API applies a narrowly scoped npm override:
`@prisma/config@6.19.3` -> `deepmerge-ts@8.0.2`. Prisma CLI/client remain 6.19.3;
Next.js remains 16.3.6. No database schema or game logic was changed.

The [advisory](https://github.com/advisories/GHSA-ggr8-5vv4-36mx) identifies
recursive object graph stack exhaustion below version 8. The
[version-8 release notes](https://github.com/RebeccaStevens/deepmerge-ts/releases/tag/v8.0.0)
list changes to Map merging, merge metadata, and `deepmergeInto` input mutation.
Prisma's installed config loader imports ordinary `deepmerge` as the c12 merger.
This project has no Map-based custom Prisma config or custom merge hooks.
The override is outside Prisma's declared pinned version, so local compatibility
tests are necessary and do not imply official Prisma upstream endorsement.

`api/tests/dependency-security.test.mjs` checks the resolved lockfile version,
normal nested merging/input preservation, both recursive-input merge APIs, and
Prisma's actual loading of a temporary JS config. Run with `npm run test:security`
inside `api`. Revisit/remove this override when an upstream compatible fix is
available or whenever Prisma is upgraded; do not broaden it automatically.

## Current Audits

Fresh reports are in `../testing/evidence/security-review/`.

| Scope | Frontend | API |
| --- | --- | --- |
| Full dependency audit | 5 high, 0 critical | 5 high, 0 critical |
| Production-only audit | 0 findings | 0 findings |

The API's three remaining Prisma/deepmerge findings from the preceding stage
are removed. Full audits still report the braces/ESLint dependency chain.

## Unpatched Tooling Risk

The [braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
currently lists no patched release. Each full audit reports five high findings
in the braces -> micromatch -> fast-glob -> Next ESLint plugin/config chain.
We did not downgrade ESLint/Next, hide the warning, or vendor an unreviewed fork.

Keep lint/build tooling inputs trusted: do not run these tools against arbitrary
untrusted patterns or repositories. The unchanged Dockerfiles retain dev
dependencies, so the images still contain this chain; `--omit=dev` audit output
is a filtered dependency view, not proof that installed images are clean.
Track an upstream patch. Before public deployment, also address the application's
lack of authentication and externally published local-demo ports. These
limitations are not removed by the override.

## Verification

Four local dependency-security checks and API lint passed. All four checks also
passed inside the Linux API container. Both Docker production builds passed,
including locked installs, Prisma generation, and TypeScript. API startup's
schema-sync command succeeded against the unchanged database schema.

The full browser suite passed **22 tests in 20.2 seconds**, including both stored
playable downloads. Health/dashboard returned 200. After cleanup the original
saved totals remained one list, one configuration, and one output, with no sample
batch present. No database volume was deleted. Existing Lighthouse and high-load
JMeter evidence remains historical; those stages were not repeated here.

Old ZIPs lack this patch. Regenerate only after approval/commit for the final
submission. Personal video, official AI acknowledgement, and LMS upload checks
remain user tasks. No commits or uploads were made by this stage.
