# Book 4 and deeper Book 3 — handoff

Written 2026-09-13 for the next session. The work is on branch `book4-silent-e`,
not on `main`. The branch is green: 292 tests, typecheck clean, build clean.

## Why this branch exists

The child this app was built for is ten and is finishing Book 3, so she is close
to the end of what Tapwords has. Two jobs: give the five Book 3 sections about
twice as much to read, and add Book 4, the six sections that teach the silent e.

The owner's decisions, taken before any work started:

- Books 4 **and 5** were scoped first, then narrowed: **deepen Book 3, build
  Book 4 properly, stop before Book 5.**
- A silent e is shown dimmed, gets **no tap dot**, and a **curved bridge line**
  arcs from the vowel to it. "cake" is three taps. The alternative of a fourth
  silent tap was rejected — it would teach that a silent letter is a sound.
- The child is comfortable with multi-syllable words, so Book 4 may use real
  two-syllable words at the program's normal pace.

Spec: `docs/superpowers/specs/2026-09-13-book-3-deepening-and-book-4-design.md`
Plan: `docs/superpowers/plans/2026-09-13-book-3-deepening-and-book-4.md` (22 tasks)
Ledger: `.superpowers/sdd/2026-09-13-book-3-deepening-and-book-4/progress.md`
(git-ignored, but it holds every ruling and every review finding — read it first)

## What is DONE and reviewed clean

| Task | What it did | State |
|---|---|---|
| 1 | Card model: `vce` and `silent` card types, `parts.ts` helpers, seven new cards | merged, review clean |
| 2 | Checker rules: a silent letter must partner a silent-e vowel in its syllable | merged, review clean |
| 3 | Engine: undrillable cards never reach a sound drill | merged, review clean |
| 4 | Tiles keyed by card id; sound cards show their own face ("a_e") | merged, review clean |

## What is DONE but NOT fully reviewed

| Task | What it did | What is missing |
|---|---|---|
| 5 | `SoundTiles` + the bridge line | fix round 1 merged; **its scoped re-review died mid-run and must be redone** |
| 6 | Three taps for a four-letter word | **no review was ever dispatched** |
| 8 | Section 4.1 (silent e with a and i) | fix round 1 merged; **re-review died mid-run** |
| 15 | Section 3.1 deepened | fix round 1 merged; **re-review never dispatched** |
| 17 | Section 3.3 deepened | fix round 1 merged, re-review DONE — **a short follow-up round is owed, see below** |
| 19 | Section 3.5 deepened | fix round 1 merged; **re-review died mid-run** |

## What is HALF DONE

- **Task 16, section 3.2.** Its fix round died. Only the test-fixture widening
  landed (commit `2f846cf`, recovered from the dead agent's worktree — that is
  what made the branch green again). **None of the content fixes were made.**
  The full finding list is in the ledger; the two Critical ones are:
  - `compost` is spelled `c,o,m,p,o,s,t` with two short o's. The second syllable
    takes the **long o**, the welded `ost` card from 2.3. Tapped as written it
    says "com-poss-t", which is not a word. The checker cannot see this because
    `check.ts` deliberately leaves `ost` out of `WELDED_ENDINGS`. Remove the
    word; re-spelling it would make it five taps and no longer two closed
    syllables.
  - Story 4 says the drumstick fell in the mud, then that it is in the lunchbox,
    then that Dan has it, with nothing establishing a second one.
- **Task 18, section 3.4.** Its fix round died with nothing committed. This is
  the worst section; its review FAILED spec compliance with five Criticals. See
  the ledger. The headline: `wristwatches` teaches three false letter-sounds at
  once (a silent `w` the program cannot represent, a split `tch` trigraph, and
  the "a, apple" card where the word needs w-controlled /o/), and `matchboxes`
  splits `tch` the same way. No other word in the program does either.
- **Task 9, section 4.2.** Died almost immediately; nothing of value on disk
  (one stray `tests/_scratch_dump.test.ts` in its worktree). Redispatch from
  scratch.

## What has NOT STARTED

- **Task 7** — wire `SoundTiles` into `WordWorkPart` (one-line swap plus a test).
- **Tasks 10–13** — sections 4.3, 4.4, 4.5, 4.6.
- **Task 14** — register Book 4 in `src/content/index.ts`, re-tighten the
  relaxed card test in `all.test.ts`, and fix the cross-section duplicate words
  that only appear once everything is registered.
- **Task 20** — a Playwright test playing a Book 4 session, and the first look
  at the bridge line on a real screen.
- **Task 21** — whole-branch read-every-word review, docs, four gates, publish.
- **Task 22** — widen what authors can draw on. **Do this early**, see below.

## The follow-up round owed on section 3.3

Its re-review accepted the fix and listed three small things the fix introduced:

- `word('conflict', ...)` was added while `nonsense('conflact', ...)` already
  existed in the same bank, same split, differing only in the second vowel. A
  child drilling "conflact" who says "conflict" is marked wrong. Rename the
  nonsense word or drop `conflict`.
- Story 1 still has no complication, and its new last line introduces "the shed",
  which appears nowhere else in that story. Story 2 now ends on the same beat
  ("run to the shed"), the duplication the author had set out to avoid.
- Story 2's complication contradicts itself: "The duck can grab at the shell."
  then "The duck can not collect the shell."
- Nonsense `twect` is half a step from "twerked" and `skect` is one deleted
  letter from British slang for a promiscuous girl. Verified-safe swaps: `snect`,
  `drict`, `brict`. Do **not** use `twact`.
- Out of scope but noted: story 1 line 6 still says "The insect is intact in the
  cup" — the same wrong shade of "intact" applied to a living animal that was
  fixed for the duck one story later.

## Five things this build learned the hard way

Each was a real defect in content that had already passed every automated check.
The first three are now written into the spec; read it before authoring anything.

1. **A card has exactly one recorded sound.** A word is only usable in a lesson,
   sentence or story if every letter takes the sound the child has been taught.
   Two traps: **s saying /z/** (rose, nose, these, close are banned in Book 4),
   and **the three sounds of `ed`** — *landed* says /ed/, *jumped* says /t/,
   *filled* says /d/. **This was live in the published app**: section 3.5's
   lesson demonstrated the `ed` card on "jumped", so the app said "jump-ed" at
   the moment it was teaching the rule. Fixed on this branch.
2. **The nonsense-word safety walk has a method.** Section 4.1's author ran it,
   found a harmless neighbour, stopped, and shipped a word one letter from an
   ethnic slur. Running it properly killed two more on the same grounds and two
   that turned out to be real words. For every position substitute every letter,
   keep going past the harmless matches, and actually run
   `grep -ix '<word>' /usr/share/dict/words`.
3. **Syllable type is part of the sequence.** Section 3.3's first draft added
   six words that split with an **open** first syllable (e|lect, pro|tect) — a
   type this program does not teach for several books. Every Book 3 word must be
   closed + closed.
4. **Stories must contain events.** Several sections came back as lists of static
   states — "X has Y" five times in seven sentences, or "X can VERB Y"
   throughout — while the questions asked what happened. No character may first
   appear in the last line. A resolution must be narrated, not asserted: "the
   goblin is not mad now" is not an ending.
5. **Every wrong answer must be in its own story.** A distractor naming something
   absent lets her eliminate it by skimming. One section went from one offender
   to six by reasoning exactly backwards — choosing distractors *because* they
   were absent and therefore "cleanly false".

## Do Task 22 early

Three separate authors hit the same wall independently, and the reviews traced
real damage in the text to it:

- The per-section test fixtures loaded only a slice of what the child has been
  taught. `s3-5.test.ts` exposed 242 real words and hid 287, including every
  verb and concrete noun that is not a CVC. One story had no ending because the
  word "put" was unavailable; another's resolution had no agent because "hand"
  and "give" were unavailable. **Four of the five have now been widened** as
  part of their fix rounds (3.1, 3.2, 3.3, 3.5); **3.4 has not.**
- `but`, `did`, `had`, `got`, `hot`, `went` and `let` are in **no word bank
  anywhere in the program**, though every one is decodable from Book 1. This is
  why stories across the whole app read clipped, including the ones shipped in
  version one.
- `vat`, `cam`, `sham`, `rind` and `volt` — the five bookish words the spec asks
  to retire — are in `s1-2.ts`, `s1-5.ts` and `s2-3.ts`, which no task in the
  plan owned. Nobody would have removed them.

## Open questions for a person, not an agent

- **The tutor should confirm the section order.** The correlation to the
  program's scope and sequence is from public knowledge, not a manual. The six
  Book 4 titles appear in the app's "Start at" menu.
- **Mechanically-closed syllable divisions.** Section 3.4 divides `compliment` as
  com|plim|ent, `instrument` as in|strum|ent, `refreshment` as ref|resh|ment —
  a consonant pulled left in each to avoid an open syllable. These are not the
  words' true divisions. The convention predates this branch (insistent,
  contestant, contradict in version one). Ruled out of scope here; a tutor
  should decide whether such words belong in Book 3 at all.
- **Nobody has seen the bridge line.** Its geometry is arithmetic only: a 26px
  dip across a 180px span, 44px of reserved space, clipping checked at all three
  tile sizes. Under jsdom every rectangle is zero. Task 20's Playwright
  screenshot and a real iPad are where this gets settled.
- **Word wrapping is unguarded.** `.row` wraps, so a vowel and its silent e on
  different lines would draw a flat arc across the gap. Claimed unreachable for
  Book 4, but section 4.5 has nine-letter words (`milkshake`, `stampede`) shown
  at `size="large"`. The cheap guard is to skip the arc when the two tiles'
  measured `top` differ. Fold it into Task 7.

## How to resume

1. `git checkout book4-silent-e`, `npm install`, `npm test` — expect 292 green.
2. Read the ledger at
   `.superpowers/sdd/2026-09-13-book-3-deepening-and-book-4/progress.md`.
   Every ruling made on the owner's behalf is in it, prefixed `Ruling:`.
3. Resume with `superpowers:subagent-driven-development`. The ledger's first
   line names the plan, so the skill will pick up where this left off.
4. Order that respects the dependencies: Task 22 first (it unblocks authoring),
   then Task 7, then the two dead fix rounds (3.2 and 3.4), then sections 4.2 to
   4.6 in order, then 14, 20, 21.
5. The re-reviews that died (Tasks 5, 8, 19) and the review never dispatched
   (Task 6) must be run before the final whole-branch review, not skipped.

## A note on running the agents

This session died on a usage limit with five agents in flight. Before
re-dispatching anything, **check the dead agents' worktrees for committed work**
— `git -C .claude/worktrees/agent-<id> log --oneline -1`. One of them had already
committed the fix that made the branch green again, and it would have been
redone from scratch otherwise.
