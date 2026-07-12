# Remove dead selectors + kebab-case live selectors + re-enable selector-pattern rules — Design

**Date:** 2026-07-11
**Scope:** `src/styles/master.css`, three page `.astro` files, `.stylelintrc.mjs`

## Problem

Task 13 disabled `selector-class-pattern` and `selector-id-pattern` because the ported legacy CSS has 67 class + 3 id names that aren't lowercase-kebab-case (mostly `snake_case`). An audit of those 35 distinct selectors shows **32 are dead** (unreferenced anywhere in markup/content/logic — leftovers from the old app's pages that no longer exist) and **3 are live**. Delete the dead, rename the live to kebab-case, and re-enable both rules.

## The selectors (authoritative source: stylelint's own violation list)

**DELETE — 32 dead** (29 classes + 3 ids), all in `master.css` only:
- Classes: `card_message`, `client_logo`, `code_inline`, `file_info`, `halfMargin`, `link_block`, `link_button`, `link_details`, `link_teaser`, `list_explanation`, `notice_attention`, `notice_negative`, `notice_positive`, `ol_alpha`, `ol_roman`, `open_quote`, `pull_out`, `screen_shot_panels`, `service_logo`, `table_row`, `table_row_alt`, `teaser_img`, `teaser_text`, `th_column`, `th_row`, `title_row`, `ul_disc`, `ul_divided`, `ul_plain`
- IDs: `parallax_intro`, `screen_shots`, `service_intro`

**RENAME — 3 live** (kebab-case), in `master.css` AND every page reference:
| old | new | references |
|---|---|---|
| `ol_decimal` | `ol-decimal` | `master.css`, `iaijutsu.astro` |
| `ul_square` | `ul-square` | `master.css`, `iaijutsu.astro`, `seminars.astro`, `schedule.astro` |
| `ul_inline` | `ul-inline` | `master.css`, `schedule.astro` |

## Approach

1. **Delete the 32 dead selectors** from `master.css`, carefully:
   - For each dead name, `grep -n` every occurrence in `master.css` (they may recur across `@media` blocks).
   - Standalone rule (`.link_block { … }`) → delete the whole rule.
   - In a selector list with a live sibling (`.link_block, .card { … }`) → remove ONLY the dead selector from the list, keep the rule.
   - Compound/descendant where the dead name is present (`.teaser_img img`) → delete (the dead ancestor/target makes the rule dead).
   - If removing a dead selector would ALSO drop styling for a live selector, STOP and report — do not guess.
2. **Rename the 3 live selectors** to kebab-case in `master.css` and the page files above. Pure rename — identical declarations, no rendering change. After: the old names appear NOWHERE in `src`.
3. **Re-enable the rules:** remove `'selector-class-pattern': null` and `'selector-id-pattern': null` (and their comment) from `.stylelintrc.mjs`. The preset re-enforces both.

## Verification
- `npx stylelint "src/**/*.css"` exits **0 with both rules active** — this is the completeness proof: any remaining snake_case/camelCase selector would fail it.
- **No old names remain:** for every one of the 35 old names, `grep -rl <name> src` returns nothing (dead names gone from CSS; live names fully renamed).
- **Live renames consistent:** `ol-decimal`/`ul-square`/`ul-inline` present in `master.css` and their page refs; reference counts match the pre-rename counts (10 / 8 / 2 across the noted pages).
- `npm run check` (0), `npm run build` (6 pages), `npm test` (28 unit + 15 e2e).
- **Cross-browser visual (controller/user):** the list styling on `iaijutsu`, `seminars`, `schedule` (the pages using the live selectors) renders identically; deleting unused rules is a no-op.

## Safety
Deleting a truly-unused rule cannot change rendering; renaming preserves declarations. The stylelint-0 gate + the visual pass are the backstops. The single real risk is deleting a rule that a live selector shares — mitigated by per-selector handling and the escalation rule.

## Non-goals
- No broader dead-CSS sweep (there is likely more dead CSS in `master.css` with kebab-case names that don't trip these rules) — logged separately as an Improvement candidate.
- No visual/layout/breakpoint changes.

## Commits (each with the `Co-Authored-By` footer)
1. `refactor: remove dead legacy css selectors (unused old-app styles)` — the 32 deletions.
2. `refactor: kebab-case live list selectors; re-enable selector-pattern rules` — the 3 renames + `.stylelintrc.mjs`.
