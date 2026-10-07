# Presentation Polish Verification

Verified on 7 October 2026 on `Polish`. No commits or merges are made by this
stage; user approval is required.

## Changes

- Newly generated Wordle HTML uses 48px-high cells capped at 56px wide. Board
  and keyboard appear side by side at desktop widths and stack on mobile.
- Styles are scoped to Wordle rows; Word Search tiles and game logic are unchanged.
- About, Saved Data, and page metadata now describe Assessment 3. Student
  details and the About video placeholder remain.
- Previously saved or downloaded HTML is immutable content for this change.
  Regenerate and store a fresh output to use the updated presentation.

## Verification

- Production frontend Docker build passed, including TypeScript; the updated
  frontend is running at `http://localhost:3000` against the existing API/database.
- Frontend lint passed. Full Playwright suite: **22 passed in 20.4 seconds**.
- Layout checks cover 3-, 4-, 5-, and a longer 7-phoneme stress case, including
  multi-character tokens, at 1280x900, 820x1180, 390x844, and 320x800.
  Cells remain 48px high, no horizontal overflow is detected, desktop controls
  and keyboard fit the viewport, and all tested targets can be solved.
- A fresh UI download verifies the deployed generator. Existing integrated
  tests also verify stored configurations, persisted downloads, and gameplay
  for both activity types. The copy test checks the retained video placeholder.
- Desktop and full-page mobile screenshots were visually inspected. On narrow
  mobile the keyboard remains below the board with normal vertical scrolling.

## Retained Evidence

- [Desktop screenshot](polish-wordle-desktop.png),
  [320px mobile screenshot](polish-wordle-mobile.png).
- [Fresh Lighthouse summary](polish-summary.json): **18 accessibility audits,
  all 100/100, zero failed automated audits** across seven app routes and two
  newly downloaded games, each on desktop and mobile.
- Generated Wordle reports: [desktop](polish-wordle-desktop.html),
  [mobile](polish-wordle-mobile.html).
- Full raw reports remain locally in
  `testing/lighthouse/results/polish-2026-10-07T02-42-33-196Z`.
- Original tall Wordle screenshot remains in `testing/evidence/final-review`;
  original baseline Lighthouse reports are not replaced.

Audits cover initial light-theme pages, not every alert or theme. A score of
100 does not establish WCAG compliance. Manual screen-reader, full contrast,
and all-variant accessibility checks remain outstanding. Historical JMeter
results and the final-review smoke predate this presentation-only change;
high-load tests were not rerun.
