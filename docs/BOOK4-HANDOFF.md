# Book 4 and deeper Book 3 — handoff

Written 2026-09-14 at the end of the second session (the first was 2026-09-13).
The work is on branch `book4-silent-e`, not on `main`. The branch is green:
309 tests, typecheck clean. `npm run build` and `npm run e2e` were not run this
session.

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
(git-ignored, exists only on this Mac; it holds every ruling R1 to R31 and every
review finding — read it first)

## What is DONE and reviewed clean

| Task | What it did |
|---|---|
| 1 | Card model: `vce` and `silent` card types, `parts.ts` helpers, seven new cards |
| 2 | Checker rules: a silent letter must partner a silent-e vowel in its syllable |
| 3 | Engine: undrillable cards never reach a sound drill |
| 4 | Tiles keyed by card id; sound cards show their own face ("a_e") |
| 5 | `SoundTiles` + the bridge line (fix round verified by mutation testing and independent contrast arithmetic: silent tile at opacity 0.7 is 3.07:1) |
| 6 | Three taps for a four-letter word; syllable-mark test now genuinely discriminates |
| 7 | `SoundTiles` wired into the word-work screen, with a wrap guard (no arc when the vowel and its e sit on different rows) |
| 8 | Section 4.1, silent e with a and i — every nonsense word independently walked |
| 16 | Section 3.2 deepened (two fix rounds; `compost` and `pretzel` removed, see lessons) |
| 17 | Section 3.3 deepened (two fix rounds) |
| 19 | Section 3.5 deepened (two fix rounds; the "jump-ed" lesson bug is fixed here) |
| 22 | Fixtures widened to the full chain; vat/cam/sham/rind/volt retired; but/did/had/got/hot/went/let added to banks |

## What is MID-LOOP (resume the loop, do not redo)

- **Task 9, section 4.2.** Authored and reviewed; the review was strong (the
  reviewer ran the real engine with group 2 deleted and proved zero u_e words
  reach group 1, including the title and all nine answer choices). Fix round 1
  landed as commit `73c3479` (jode→vode, fode→zode — both were obscene verb
  forms in Spanish and Portuguese — plus a pronoun and a prompt). **Its scoped
  re-review is still owed.** The implementer died before appending a fix report
  to `task-9-report.md`, so the re-reviewer must judge from the diff.
- **Task 18, section 3.4.** Fix round 1 landed (all five original Criticals
  fixed properly; two nonsense words the spec itself names as failures were
  found sitting in the file and removed). The full review then found three new
  Importants, and **fix round 2 died before it started**. Re-dispatch a fresh
  implementer with these, verbatim from the ledger:
  1. `unpacking`, `kickboxing`, `disgusting` use the `-ing` **suffix** a section
     before 3.5 teaches it (concept `suffix-ing`). The checker passed them only
     because the concept tag was omitted. Drop all three.
  2. Seven nonsense words (`vandriplat`, `fantoblip`, `fantriplem`,
     `conshadrup`, `wintroblun`, `sonclatrim`, `vindraclosh`) have a blend
     between two vowels and so no all-closed reading; and none of the twenty
     nonsense words has a `syllables` array while all forty real words do.
     Swap the seven for blend-free shapes and add `syllables` to all twenty
     (3.3 shows the pattern: `{ ...nonsense('tandect', ...), syllables: [3] }`).
  3. Story 3 Q2 "Who sorted out the lunchboxes?" — Dan is defensible via "Dan
     got the chips back". One-word fix.
  Plus minors: story 2 line 1 is present tense; story 4's title "Dan Has
  Chickenpox" over a past-tense story; sentence "Pam and Sam have fun in
  Manhattan." should go.
- **Task 15, section 3.1.** Fix round 1 was merged in session one (commit
  `0d04861`). **Its scoped re-review was never dispatched**, in either session.
  The findings it must verdict are in the ledger under "Task 15 (3.1) content
  review".

## What has NOT STARTED

- **Task 10** — section 4.3 (e_e and u_e_oo, **one group**, ruling R13). The
  dispatch prompt's decisions are worth reusing: u_e_oo words must be
  unambiguously /oo/ (rule, flute, rude, June, brute, prune, plume, crude,
  dude); e_e yields only a handful (eve, Pete, Steve, theme, Zeke); banned:
  these, scene, gene, here, use, fuse, sure, cure.
- **Tasks 11 to 13** — sections 4.4, 4.5, 4.6. Briefs are already extracted in
  the ledger directory and carry the full rules. Ruling R7 binds 4.6: plural s
  only after bases ending k, p, t or f.
- **Task 14** — register Book 4 in `src/content/index.ts`, re-tighten the
  relaxed card test in `all.test.ts`, fix cross-section duplicates that only
  appear once everything is registered.
- **Task 20** — Playwright test playing a Book 4 session, and the first real
  look at the bridge line. The only screenshot so far is of the word-work
  screen for a Book 1 word (in the session scratchpad, now gone).
- **Task 21** — whole-branch review, docs, four gates, publish. Also correct the
  spec's 4.2 example row: `huge` cannot be a 4.2 word (its g says /j/), ruling R30.
- **The program-wide one-sound audit (ruling R31, below).** Dispatched, died
  before writing anything. Scope: sections 1.1 to 2.5, 3.1, 3.3, 3.5 and 4.1,
  checking every bank word in both directions and running the chunk walk on
  every nonsense word. Findings go to a file, then ONE batched fix dispatch.

## What this session learned, on top of the first session's five lessons

The first session's five lessons still hold and are now written into the spec:
one sound per card, the nonsense safety walk, syllable type is part of the
sequence, stories need events, every wrong answer must be in its own story.
Six more, each from a real defect found this session:

1. **A word in the bank is heard, too.** The spec used to say a wrong-sound
   word "may sit in a word bank, where the child reads it rather than hearing
   the app say it". That is false: word work draws tap items from the bank and
   plays each card as she taps it (`src/engine/session.ts`, `TapDots.tsx`). The
   spec is corrected; the rule now binds every word in a section. Consequence
   still to act on: 3.5's bank holds `jumped`, `packed`, `bumped`, `thanked`
   (ed says /t/), and version-one sections may hold plural-s words whose s says
   /z/. That is what the audit above is for.
2. **The one-sound audit runs in both directions.** Authors checked "s saying
   /z/" and missed `pretzel`, where the z says /s/. Also c→/s/, g→/j/ (`huge`),
   voiced th.
3. **The safety walk is not English-only.** `jode` and `fode` are everyday
   obscenities in Spanish and Portuguese. Authors already rejected French
   `pute`; apply the same bar to Spanish and Portuguese every time.
4. **The wordlist lacks inflected forms.** `grosking` passed `grep -ix` and is
   one letter from `grossing`. Check base + s/ing/ed by hand.
5. **Run the chunk walk, not just the whole-word walk.** `distrunpock` and
   `blenmafrosh`, the spec's own named failures, survived in 3.4 because
   nobody read their displayed chunks. Deletion neighbours matter too
   (`clict` is one deletion from a vulgar word).
6. **Retire without replacing when the replacement is worse.** `holt` for
   `volt` and `swam`/`clam` for `cam`/`sham` were reversed; the banks sit well
   above the checker's 20-word floor (ruling R29).

## Open questions for a person, not an agent

- **The tutor should confirm the section order.** Six Book 4 titles appear in
  the app's "Start at" menu once Task 14 lands.
- **Mechanically-closed syllable divisions** in 3.4 (com|plim|ent and friends),
  ruling R21 — pre-existing convention; a tutor should decide.
- **The `es` ending is heard as /e/+/s/ where the word says /iz/** (wishes,
  boxes, sunglasses). There is no `es` card; 1.6 spells it e,s. Program-wide
  since version one.
- **The single `th` card is recorded voiceless ("thumb")**, yet 1.2 teaches
  then/that/this and stories use "then". Same class; program-wide since
  version one. A tutor decision.
- **Nobody has seen the bridge line on a real screen.** Geometry is arithmetic
  only, verified at all five tile variants. Task 20 and a real iPad settle it.

## How to resume

1. `git checkout book4-silent-e`, `npm install`, `npm test` — expect 309 green.
2. Read the ledger. Every ruling is prefixed `Ruling R<n>:`.
3. Resume with `superpowers:subagent-driven-development`; the ledger's first
   line names the plan.
4. Order: the three owed reviews first (Task 9 re-review, Task 15 re-review,
   Task 18 fix round 2 then its re-review), the R31 audit, then Tasks 10 to 13
   (10 alone, then 11 to 13 in parallel), then 14, 20, 21.
5. Use the `Claude Fable 5.1` commit trailer (ruling R23), and normalise any
   agent's trailer at merge.

## A note on running the agents

Both sessions ended on a usage limit with agents in flight. Before
re-dispatching, check every dead agent's worktree for **uncommitted diffs as
well as commits**: this session the only surviving work was an uncommitted,
already-tested diff in a worktree, recovered by inspecting `git diff` there,
running the section's test, and committing it. Prefer fewer, larger dispatches
late in a session, and land a green commit before starting anything expensive.
