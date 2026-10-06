# Lighthouse Accessibility Audits

Audits the running Docker frontend and freshly downloaded Wordle and Word
Search activities using pinned Lighthouse 13.5.0. Requires Node.js >=22.19,
frontend dependencies, and the Playwright Chromium browser. This test-only
package does not change the application's production dependencies.

## Run

From the repository root:

```powershell
docker compose up --build -d
cd frontend
npm ci
npm run test:e2e:install
cd ../testing/lighthouse
npm ci
npm run audit -- review
```

Use a descriptive lowercase label such as `baseline`, `after`, or `review`.
Each run gets a timestamped directory; previous results are preserved.
The defaults are frontend `http://localhost:3000` and API
`http://localhost:4080`. Override with `FRONTEND_URL` and `API_URL` if needed.

The runner exports both HTML downloads, verifies they open, then serves only
those files on a temporary loopback HTTP port for Lighthouse. The server and
browser processes close after the run. It does not create word lists or saved
configurations. Real builder visits and downloads can record normal usage
events in the dashboard; these are not mocked or removed.

## Scope and Evidence

- Home, About, Wordle, Word Search, Saved Data, and Settings.
- Both freshly generated standalone activities.
- Desktop preset and default mobile emulation, in fresh light-theme sessions.
- Accessibility category only, not performance or load testing.
- HTML and JSON reports per page and a versioned `summary.json`.

Full local reports are in `results/<label>-<UTC timestamp>/`. They are ignored
by Git. The `evidence` directory retains the original baseline and after
summaries, representative HTML reports for the two improved pages, and the
findings. Open an HTML report directly in a browser for the video.

Do not rerun the current fixed application and describe that result as the
original baseline. Use the saved baseline reports for the before comparison.
Rebuild the frontend container after future app changes before rerunning.

Regression tests from `frontend`:

```powershell
npm run test:e2e
npm run lint
```

## Limits and Manual Follow-Up

A score of 100 is not a WCAG compliance claim. Lighthouse's score excludes
manual checks. These runs cover initial light-theme pages, not every state,
saved dataset, alert, validation error, or theme.

Manual work still needed:

- Full keyboard-only navigation, visible focus, and logical focus order.
- Screen-reader usability testing of the new keyboard word selection. Both
  versions now support it; see [keyboard refinement evidence](evidence/word-search-keyboard.md).
- Screen-reader review of phoneme pronunciation, guess feedback, word-search
  coordinates, and success/error announcements.
- Dark-theme contrast, zoom/reflow, narrow layouts, and larger grids.
- Feedback that communicates cell results without relying on colour alone.

The label regressions confirm accessible names on the repaired controls and
keyboard editing/regeneration of the downloaded textarea. The additional
`frontend/e2e/word-search-accessibility.spec.ts` tests verify keyboard word
selection, cancellation, focus navigation, and exact-instance pointer dragging
in both the preview and downloaded game. The original baseline/after evidence
is preserved unchanged; the keyboard stage has its own summary and reports.

## Sources

- [Lighthouse overview](https://developer.chrome.com/docs/lighthouse/overview)
- [Lighthouse accessibility scoring](https://developer.chrome.com/docs/lighthouse/accessibility/scoring)
- [Official Lighthouse Node example](https://github.com/GoogleChrome/lighthouse/blob/main/docs/readme.md)
