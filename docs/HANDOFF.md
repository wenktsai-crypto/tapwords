# Tapwords handoff

Last updated: 2026-09-13. Written for whoever picks this project up next: a future coding session, a developer helping out, or the tutor checking the content.

## What it is

Tapwords is a calm, self-guided reading app for a small number of dyslexic children aged about 7 to 11, used on an iPad. It follows the structure of a well-known Orton-Gillingham style program's Steps 1 to 3 (sound cards, finger tapping, welded sounds, controlled word lists with nonsense words, decodable stories) with entirely original words, sentences and stories. The program's brand name is deliberately never used in the app or repository; the only place it appears is the local folder name on the author's Mac.

Version one is complete and published.

- Live app: https://wenktsai-crypto.github.io/tapwords/
- Repository: https://github.com/wenktsai-crypto/tapwords (public; every push to `main` re-runs all tests and republishes in 5 to 8 minutes)
- Design spec: `docs/superpowers/specs/2026-09-12-reading-app-design.md`
- Build plans, in order: `docs/superpowers/plans/2026-09-12-core-app-substep-1-1.md`, `2026-09-13-installable-offline-and-browser-tests.md`, `2026-09-13-content-placement-recording-backup.md`

## How to run and check it

    npm install
    npm run dev          # local, prints a Network address for the iPad
    npm test             # 238 unit tests: engine, content checker, screens, store, build output
    npm run typecheck
    npm run build
    npm run e2e          # 8 Playwright tests at iPad size (first time: npx playwright install chromium)

All four commands were green on `main` at handoff. The README explains the parent-facing side (home-screen install, placement check, recording, backup).

## Where things live

| Area | Path | Notes |
|---|---|---|
| Content | `src/content/substeps/s1-1.ts` … `s3-5.ts`, `src/content/cards.ts`, `src/content/index.ts` | One file per substep; register new ones in `index.ts` in teaching order |
| Content checker | `src/content/check.ts`, `tests/content/*.test.ts`, `tests/content/all.test.ts` | Runs on every `npm test`; see "Checker blind spots" below |
| Engine (no React, no browser) | `src/engine/session.ts` (builds a session), `progression.ts` (advancement, placement), `strength.ts`, `review.ts`, `availability.ts` | |
| Storage and audio | `src/store/idb.ts` (IndexedDB), `src/store/backup.ts`, `src/audio/browser.ts`, `src/audio/recorder.ts` | Fakes for tests in `store/memory.ts`, `audio/fake.ts` |
| Screens | `src/ui/screens/` (Home, ParentArea, PlacementScreen, RecordScreen, BackupPanel), `src/ui/session/` (the six session parts and the runner) | |
| Browser tests | `tests/e2e/*.spec.ts`, helpers in `tests/e2e/helpers.ts` | The `autoPlay` helper reads `data-*` hints from the screens to answer correctly |
| Publishing | `.github/workflows/deploy.yml` | Builds with `BASE_PATH=/tapwords/` |

## The sixteen sections

Numbering and concepts follow the program's published scope and sequence for Steps 1 to 3, so "she's on 2.3" means the same thing in both. Substep 1.2 teaches its many sounds in five ordered groups (b sh u / h j c k ck / e v w / x y z / ch th qu wh); the child sees it as one section, but the engine only shows words, sentences and stories the current group can read. Sight words are declared per section and are cumulative.

What is deliberately different from the program: every word, sentence and story is original; the sight-word lists are our own; the lesson has six parts rather than ten; there is no handwriting.

The tutor should confirm the section order against the edition they teach. The list of titles is visible in the app's "Start at" menu.

## Decisions worth knowing (not obvious from the code)

- **Sections that introduce no new cards** (1.3, 1.6, 2.2, 2.4, 2.5, 3.1 to 3.4) use the cards of their own word bank as "current" for the sound-card drill, capped at 10 for the forward drill. Without this the whole drill counted as review.
- **Story question choices are shuffled per session** in the engine; the authored files all list the right answer first.
- **Proper nouns** (Sam, Pam, Dan, Jan, Nan, Atlantic, Wisconsin, Manhattan) are capitalised in `text` with lower-case parts. The checker compares texts case-insensitively. Capitalised words are never targets or distractors in "hear it, find it", because a capital letter would give the answer away.
- **Welded endings.** A word ending in am, an, all, ang, ing, ong, ung, ank, ink, onk, unk, old or olt must tap that ending as the welded card, and so cannot appear before the section that teaches it. ild, ind and ost are exempt because wind, cost and lost are regular.
- **Question prompts are spoken by the app**, so they may use words the child has not learned. Titles and answer choices must stay decodable.
- **Backup "replace"** writes the backup's data first and only then removes what was there, so a failure midway cannot empty the device. Backup files are plain JSON with recordings as base64.
- **Damaged data** is never discarded silently: the home screen offers restore from a backup or a hold-to-confirm fresh start.
- **Touch targets** are 64px everywhere, including the tapping dots for long words (the drawn circle shrinks, the hit box does not).

## Checker blind spots

The content checker enforces: cards taught before use, parts spelling the text, welded endings, syllable indexes in range, sentence and story words taught, minimum counts, one bank per word text (case-insensitive). It does **not** check story titles, question prompts, answer choices, or a duplicate text inside the same section, and it cannot judge whether a nonsense word is safe or a question has two defensible answers. Those were checked by a reviewer reading every word. When adding content, do the same by hand.

Nonsense-word bar: pronounceable, follows the section's pattern, never a real word, name or slang, never one letter away from a rude word.

## Known polish items (reviewed as minor, no child-safety issue)

- A few "have fun" story endings in 3.3 and 3.4; a few answer distractors not drawn from their own story (1.3, 1.4, 1.6, 2.4).
- Bank-only words that are bookish for the age (3.2: complex, insult, husband, absent; 3.4: misconduct, combatant, enlistment, investment, commitment, consultant; also vat, cam, sham, rind, volt). They appear in word work and read-aloud lists, never in sentences.
- Sections 1.3 and 1.6 have only four or five review-eligible cards, so the 85 percent review gate is measured on a small sample there.
- Sentences or stories borrowed from an earlier section as a fallback are recorded under the current section's strength key. The fallback never fires on the current content.
- `IdbStore.saveClip` and `deleteClip` are outside the store's serial write queue (single writer today, so harmless).

## What comes next

1. **Real-iPad check** by the family: one full session including the read-aloud, add to home screen, airplane-mode reopen, back up from the grown-up area. Fix whatever it turns up.
2. **Tutor review** of the section order and a sample of lessons.
3. **Polish** from the list above, if wanted.
4. **Steps 4 to 12** are out of scope for v1. The engine needs no code changes for more sections: add cards to `cards.ts`, a substep file, register it, and make the checker pass.

## How the work was done (for future agent-driven sessions)

The plans were executed with a controller session dispatching one agent per task in isolated git worktrees, a reviewer per task, and a whole-branch review at the end. Practical notes: worktree-isolated agents cannot write outside their worktree, so reports were copied over; content sections were authored in parallel only where their card dependencies allowed (step 1 had to go 1.2, then 1.3/1.4/1.5, then 1.6); cross-section duplicate words only appear when everything is registered, so register early and run the checker; commit trailers from different agents were normalised at merge. The most capable model hit a usage limit partway through, and the faster model authored most of steps 2 and 3, with word-by-word reviews catching what mattered.
