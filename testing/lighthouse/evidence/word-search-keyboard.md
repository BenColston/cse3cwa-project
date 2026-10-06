# Word Search Keyboard Refinement

Implemented on `WordSearch---Accessibility`, 7 October 2026 (Australia/Sydney).
This resolves the pointer-only selection gap recorded in the earlier
[Lighthouse findings](findings.md). The original baseline and after reports
are preserved as historical evidence, not replaced with new baseline scores.

## Changes

Both the builder preview and freshly generated standalone Word Search now
provide:

- One grid tab stop, with arrow keys moving focus between tiles.
- Enter or Space to start selection, then again at the endpoint to check it.
- Escape to cancel; moving focus outside the grid also cancels pending selection.
- Semantic grid, row, and gridcell structure, with selection state exposed.
- Tile names containing row, column, phoneme, and found state.
- Visible keyboard focus and assistive-technology keyboard instructions.
- The existing pointer-drag workflow and exact selected-instance highlighting.

The downloaded activity updates existing tile buttons instead of replacing
them on every highlight change, so keyboard focus survives selection updates.
Regeneration and grid-size changes reset pending selection state.

Narrow-screen checks also exposed intrinsic-width inputs and the saved
configuration selector widening the builder to 420px at a 390px viewport.
Constrained the Word Search builder's grid track and form controls to their
container. Both default 8-by-8 versions now pass the 390px page-width check.

## Verification

`npm run test:e2e` from `frontend`: **10 passed**. Six new tests verify, in
both versions:

- Horizontal, vertical, diagonal, and reverse word selection using keys.
- Focus retained at the endpoint, with only the chosen cells marked found.
- Tab entry/exit, one tab stop, boundary navigation, and Escape cancellation.
- Invalid non-straight endpoints and unmatched sequences do not mark words.
- Pointer movement outside the grid does not cancel a keyboard selection.
- Regeneration/resize clears selection, with one valid tab stop remaining.
- Dragging a duplicate occurrence marks that occurrence, not another instance.
- Desktop and 390px mobile screenshots; default-grid page width does not overflow.

The drag test scrolls the grid into view before moving the real browser mouse.
Its first run attempted to drag an off-screen row; this was corrected in the
test without relaxing its exact-coordinate assertion.

Frontend production Docker build (including TypeScript) and ESLint passed.
The frontend was rebuilt before verification; API and database were not reset.
All 16 final Lighthouse accessibility audits scored **100**, with zero failed
automated audits. The API health endpoint returned **200** after testing.

## Evidence

- `keyboard-summary.json`: fresh Lighthouse accessibility results for all
  eight targets, desktop and mobile, after the completed refinement.
- `keyboard-word-search-desktop.html` and
  `keyboard-generated-word-search-mobile.html`: representative full reports.
- `keyboard-preview-desktop.png`, `keyboard-preview-mobile.png`,
  `keyboard-download-desktop.png`, and `keyboard-download-mobile.png`:
  screenshots captured by the passing browser tests and visually inspected.
- Full local reports remain in `../results/keyboard-final-<UTC timestamp>/`.
- Executable regression cases are in
  `frontend/e2e/word-search-accessibility.spec.ts`.

## Quick Review

Open the Word Search builder. Tab from Show answers into the grid, use arrows
to a start tile, press Enter, move to a matching word's last tile, then press
Enter again. Try Escape during another selection and Tab out of the grid.
Download fresh HTML and repeat the same steps offline. Previously downloaded
or stored HTML files are unchanged; regenerate them to use the new controls.

## Limits

These are browser-driven keyboard and pointer checks, not a screen-reader
usability study or full WCAG certification. Dark themes, phoneme pronunciation,
all saved-data variants, and every larger-grid/zoom layout still need review.
Lighthouse scores refer to initial light-theme states, not every interaction.

Focus navigation follows the general roving-tabindex conventions described in
[W3C's keyboard interface guidance](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/).
