# Book 4 and deeper Book 3 — handoff

Written 2026-09-14 at the end of the third session (the first two were
2026-09-13 and the morning of 2026-09-14). The work is on branch
`book4-silent-e`, not on `main`. The branch head is `857be3c` and all four gates
are green on it: `npm test` 55 files / 363 tests, `npm run typecheck`,
`npm run build`, `npm run e2e` 9 of 9 specs.

## What is DONE

Everything in the plan except the last step. All 22 sections are authored,
registered, and reviewed clean:

- **Code (Tasks 1 to 7):** the `vce` and `silent` card types, the seven new
  cards, the checker rules, the engine change (undrillable cards never reach a
  drill), tiles keyed by card id, `SoundTiles` with the bridge line, three taps
  for a four-letter word, and the wrap guard.
- **Book 3 deepened (Tasks 15 to 19, 22):** all five sections at or above 35
  real words, 20 nonsense, 18 sentences, 4 stories; fixtures widened to the
  full chain; common words (but, did, had, got, hot, went, let) added to the
  early banks; vat/cam/sham/rind/volt retired.
- **Book 4 (Tasks 8 to 14):** 4.1 to 4.6 written, each through a full content
  review and one or two fix rounds, and registered in `src/content/index.ts`.
  Registration revealed zero cross-section duplicates and every card
  introduced exactly once. Section 4.3 has 22 real words, not 30: both the
  author and its reviewer measured that as the honest ceiling for e_e and
  /oo/-only u_e words (ruling R42).
- **The program-wide one-sound audit (ruling R31):** run over all 22 sections,
  in both directions, with the chunk-level nonsense walk. The largest finding
  was section 1.6, the one that teaches adding s: it was built on plurals whose
  s says /z/ while the s card plays /s/. It is now narrowed to plurals after
  k, p, t, f, th, sh, ch and its lesson no longer claims the ending "can sound
  like z" (ruling R41). Also fixed: `exact` in 3.3 (x says /gz/), ten `ed`
  words in 3.5, `nip` in 1.1 (a slur), and about thirty nonsense words across
  1.1 to 4.5 that sat one letter or one displayed chunk from a rude word.
- **Task 20:** `tests/e2e/silente.spec.ts` plays a 4.1 session in a real
  browser and passes. The controller has now seen the bridge line on a
  screenshot: four tiles, the e faded and dashed with no dot, three dots, a
  shallow arc from the vowel to the e. It matches the spec.
- **Task 21's docs half:** `docs/HANDOFF.md` has the 22-section table, the
  silent-e model, the new checker rules and a tutor list; `README.md` has the
  parent note; the spec's two wrong example words (`huge`, `rides`) are fixed.

## What is NOT done — the very last stretch

1. **The final whole-branch review never ran.** It was dispatched (opus) and
   died on the session limit before writing anything. Re-dispatch it with the
   prompt recorded in the ledger under "FINAL WHOLE-BRANCH REVIEW dispatched".
   Its package, `review-1735ba5..857be3c.diff` in the ledger directory, is
   still valid because nothing has been committed since `857be3c`. Give it the
   deferred list `final-review-deferred.md` and the three named items below.
2. **ONE fix wave**, after the final review, containing at least:
   - `src/ui/session/SpellingPart.tsx`: the spell-the-sound quiz renders a
     card's tile by `card.grapheme` ("a") instead of `cardDisplay(card)`
     ("a_e"), so the a_e card and the plain a card look identical to the
     child. Two reviewers confirmed it; the fix is that one expression, the
     same one `SoundCardsPart.tsx` already uses. **This is a real child-facing
     bug and must land before publish.**
   - `tests/e2e/silente.spec.ts`: the bridge assertion measures the svg
     container (CSS-sized to the row), so a collapsed arc would still pass.
     Assert on the `<path>` inside it. Then drop the `tile-vce` workaround in
     `tests/e2e/helpers.ts` that exists only because of the SpellingPart bug.
   - `src/content/substeps/s4-6.ts`: `handshakes` taps `h,an,d,…` while 4.5's
     `handshake` and 2.2's `hand` tap `h,a,n,d`. Make 4.6 match.
   - `src/content/substeps/s3-4.ts`: `Manhattan` (man|hat|tan) taps `man` as
     `m,a,n` and `tan` as `t,an`. The program's rule is "welded an only when
     syllable-final", under which that is actually consistent. Verify before
     changing; leave it if the rule holds.
   - `docs/HANDOFF.md` line 20 still says "238 unit tests"; the suite is 363.
   - Whatever the final review adds.
3. One scoped re-review of the fix wave, then the four gates again, then
   `superpowers:finishing-a-development-branch`: merge to `main`, watch the
   Pages workflow with `gh run watch`, and confirm the live site serves
   section 4.1 to 4.6 in the "Start at" menu.
4. Then delete the plan's ledger directory (`.superpowers/sdd/...`) and this
   file, after folding anything still useful into `docs/HANDOFF.md`.

Ledger: `.superpowers/sdd/2026-09-13-book-3-deepening-and-book-4/progress.md`
(git-ignored, only on this Mac). It holds rulings R1 to R43 and every review
finding. `rulings-summary.md` beside it lists the rulings alone.

## Open questions for a person, not an agent

Also written into `docs/HANDOFF.md`'s tutor list:

- The tutor should confirm the six Book 4 titles and their order from the
  app's "Start at" menu.
- Section 1.6 now teaches only the /s/ plural. The /z/ plural (dogs, beds) is
  untaught until a later book. A tutor may prefer a second recording for the
  suffix-s card instead; the audit file names every word that was removed.
- The single `th` card is voiceless; then/that/this appear from 1.2.
- The `es` ending is heard as e+s where the word says /iz/.
- Some Book 3 syllable divisions are mechanically closed (com|plim|ent).
- Doubled consonants are tapped twice (rab|bit, accomplish).
- First-syllable schwa (compete, command) is played as the full short vowel.
- Section 1.1's nonsense words (lod, fod, sog, fot, rog, mog, lat, mot) are
  obscure dictionary entries. Accepted class, but a person may prefer to know.
- Nobody has seen the bridge line on a real iPad. A Chromium screenshot and
  the browser test are the evidence so far.

## Lessons this session added to the previous eleven

1. **Worktree agents start at `main`, not the plan branch.** Every worktree
   dispatch must open with `git merge book4-silent-e` and a check that HEAD is
   recent. One author found no Book 4 at all until it merged.
2. **Commit after every green step.** Seven agents died at once; the two that
   had finished held only uncommitted diffs, recovered by hand from their
   worktrees. Every later dispatch said "commit the RED test, commit the GREEN
   section, commit the read-back fixes", and nothing was lost after that.
3. **Seven concurrent opus agents exhaust a session window in about ninety
   minutes.** Three windows were spent today. Use sonnet for scoped
   re-reviews, haiku for one-word fixes, opus only for authoring and full
   content reviews. Dispatch the final whole-branch review at the start of a
   window, not the end.
4. **The foreign-language bar needs a definition or it kills every word.**
   Every `_ode` shape is one letter from French `gode`. Ruling R35: a direct
   hit (the word or a displayed chunk IS a rude word in Spanish, Portuguese or
   French) is a rejection; one-letter neighbours count only for slurs and
   strong obscenities. Ruling R36: a chunk that is an ordinary English word
   (top, hop) is exempt. Ruling R43: a chunk that also sits inside a real bank
   word of the same section is exempt.
5. **Reviewers' proofs need checking too.** One reviewer said `vode` was clean
   at distance 1 and, in the same report, flagged `zode` for `gode`; both are
   the same distance from it. One author "proved" the engine never reads
   sightWords with a grep that missed `session.ts:84`. The conclusions held;
   the evidence did not.
6. **A ruling can be wrong; correct it in the ledger, not silently.** R38
   struck `bedtime` for having two silent-e syllables. It has one. The 4.5
   author said so, the ruling was corrected, and the word went in.
7. **A test that passes for the wrong reason is worth a finding.** The
   silent-e browser test measured a CSS box that is wide whether or not an
   arc was drawn; a schwa regex covered nine consonants and not the other
   seventeen; a proper-noun test looped over zero items. Ask reviewers to
   mutation-test, and they find these.

## How to resume

1. `git checkout book4-silent-e`, `npm install`, `npm test` — expect 363 green.
2. Read the ledger's last forty lines; the "FIX WAVE LIST SO FAR" entry and
   the final-review dispatch prompt are there.
3. Dispatch the final whole-branch review first, alone, at the start of a
   fresh window. Then one fix wave, one re-review, four gates, publish.
4. Use the `Claude Fable 5.1` commit trailer (ruling R23).
