# Accessibility Audit Findings

## Environment

Captured on 7 October 2026 (Australia/Sydney) against the running Docker
frontend on port 3000 and API on port 4080. The baseline began at
2026-10-06T19:24:39.168Z; individual audit timestamps are retained in the JSON
summaries. Those UTC timestamps fall on 7 October in Sydney.

Lighthouse 13.5.0, Playwright Chromium 153.0.0.0, accessibility category only.
Each target was audited in desktop and default mobile emulation with a fresh
browser profile. No dark theme or interaction-state audit is claimed.

## Before and After

| Target | Baseline desktop | Baseline mobile | After desktop | After mobile |
| --- | ---: | ---: | ---: | ---: |
| Home | 100 | 100 | 100 | 100 |
| About | 100 | 100 | 100 | 100 |
| Wordle builder | 90 | 90 | 100 | 100 |
| Word Search builder | 100 | 100 | 100 | 100 |
| Saved Data | 100 | 100 | 100 | 100 |
| Settings | 100 | 100 | 100 | 100 |
| Generated Wordle | 100 | 100 | 100 | 100 |
| Generated Word Search | 93 | 93 | 100 | 100 |

All 16 after audits had zero failed automated accessibility audits.

## Fixes

1. `select-name`: the Wordle word-source select had no accessible name. Its
   fieldset legend alone did not label the select. Added an explicit
   `aria-labelledby` reference to the existing visible legend.
2. `aria-prohibited-attr`: the Wordle submitted-guesses container had an
   `aria-label` on a generic div. Added the appropriate `group` role; also
   made the labelled target-hints groups explicit in the preview and generated
   Wordle document.
3. `label`: the generated Word Search textarea had a nearby label that was not
   associated with it. Connected the existing label using `for="wordInput"`.

The frontend container was rebuilt and restarted before the after audits.
The API and persistent database were left running; no database reset occurred.
Generated files in the after run were freshly downloaded, not patched copies
of the baseline files.

## Regression Verification

- Docker frontend production build: passed, including TypeScript checks.
- Playwright: 4 tests passed (two existing workflows and two accessibility
  regressions). The new tests verify Wordle control/group names and keyboard
  editing and regeneration in the downloaded Word Search form.
- Frontend ESLint: passed.
- Audit runner syntax check: passed.

The first regression run exposed an existing order-sensitive CRUD assertion:
both phoneme sequences were present, but the returned words were reversed.
The API does not guarantee input order (reads sort on potentially equal
creation timestamps, and the create response has no word order clause).
The test now asserts the presence of each sequence independently, alongside
its existing word-count assertion. Application/database ordering was not
changed. The subsequent full four-test run passed.

The first lint run scanned minified Playwright trace viewer assets. Generated
`playwright-report` and `test-results` directories are now ignored by ESLint;
application source and test source remain linted.

## Evidence

- `baseline-summary.json` and `after-summary.json`: all 16 results, versions,
  timestamps, and baseline failing selectors/explanations.
- `baseline-wordle-desktop.html` and `after-wordle-desktop.html`.
- `baseline-generated-word-search-desktop.html` and
  `after-generated-word-search-desktop.html`.
- Full 32 HTML and 32 JSON page reports and downloaded activities are retained
  locally in the ignored timestamped `results` directories. Only the compact
  summaries and four representative HTML reports are intended for Git.

## Remaining Accessibility Work

100 is an automated score, not evidence that all users can complete every
workflow. [Lighthouse scoring documentation](https://developer.chrome.com/docs/lighthouse/accessibility/scoring)
explains that manual checks are excluded from the score.

Source inspection identifies a concrete remaining gap: Word Search word
selection uses pointer handlers, with no equivalent keyboard handlers, in
both `frontend/components/WordSearchPreview.tsx` and the generated activity
script in `frontend/lib/htmlGenerators.ts`. Keyboard editing of the form is
tested; keyboard completion of the game is not supported by those handlers.
This is a recommended separate refinement stage, not silently marked passed.

Screen-reader announcements, phoneme pronunciation, colour-independent guess
feedback, all dark-theme states, zoom/reflow, and larger-grid layouts still
need focused manual review. These initial-page audits also do not establish
accessibility of every saved dataset, validation state, or dashboard alert.

## Subsequent Refinement

The pointer-only Word Search selection gap was subsequently addressed in the
[keyboard refinement stage](word-search-keyboard.md). The baseline and after
reports above are retained unchanged; that stage has separate reports and tests.
