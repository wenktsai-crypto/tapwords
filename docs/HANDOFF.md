# Tapwords handoff

Last updated: 2026-09-14. Written for whoever picks this project up next: a future coding session, a developer helping out, or the tutor checking the content.

## What it is

Tapwords is a calm, self-guided reading app for a small number of dyslexic children aged about 7 to 11, used on an iPad. It follows the structure of a well-known Orton-Gillingham style program's Steps 1 to 4 (sound cards, finger tapping, welded sounds, controlled word lists with nonsense words, decodable stories) with entirely original words, sentences and stories. The program's brand name is deliberately never used in the app or repository; the only place it appears is the local folder name on the author's Mac.

Books 1 to 3 (Steps 1 to 3) were the first version and have been live for a while. Book 4 (the silent e) has now been built and reviewed the same way.

- Live app: https://wenktsai-crypto.github.io/tapwords/
- Repository: https://github.com/wenktsai-crypto/tapwords (public; every push to `main` re-runs all tests and republishes in 5 to 8 minutes)
- Design specs: `docs/superpowers/specs/2026-09-12-reading-app-design.md` (Books 1 to 3), `docs/superpowers/specs/2026-09-13-book-3-deepening-and-book-4-design.md` (deeper Book 3, and Book 4)
- Build plans, in order: `docs/superpowers/plans/2026-09-12-core-app-substep-1-1.md`, `2026-09-13-installable-offline-and-browser-tests.md`, `2026-09-13-content-placement-recording-backup.md`, `2026-09-13-book-3-deepening-and-book-4.md`

## How to run and check it

    npm install
    npm run dev          # local, prints a Network address for the iPad
    npm test             # 375 unit tests: engine, content checker, screens, store, build output
    npm run typecheck
    npm run build
    npm run e2e          # 9 Playwright tests at iPad size (first time: npx playwright install chromium)

Never mutation-test the browser suite with `npx playwright test` alone: it serves whatever is
already in `dist/`, so a change to `src/` appears to have no effect and a broken guard looks
like a passing one. Only `npm run e2e` rebuilds first. Two guards have shipped on this project
whose authors believed false evidence; this is one of the ways to get it.

All four commands were green on `main` at handoff. The README explains the parent-facing side (home-screen install, placement check, recording, backup).

## Where things live

| Area | Path | Notes |
|---|---|---|
| Content | `src/content/substeps/s1-1.ts` … `s4-6.ts`, `src/content/cards.ts`, `src/content/parts.ts`, `src/content/index.ts` | One file per section; register new ones in `index.ts` in teaching order. `parts.ts` is where the silent-e pairing logic lives (see "Decisions worth knowing") |
| Content checker | `src/content/check.ts`, `tests/content/*.test.ts`, `tests/content/all.test.ts` | Runs on every `npm test`; see "Checker blind spots" below |
| Engine (no React, no browser) | `src/engine/session.ts` (builds a session), `progression.ts` (advancement, placement), `strength.ts`, `review.ts`, `availability.ts` | |
| Storage and audio | `src/store/idb.ts` (IndexedDB), `src/store/backup.ts`, `src/audio/browser.ts`, `src/audio/recorder.ts` | Fakes for tests in `store/memory.ts`, `audio/fake.ts` |
| Screens | `src/ui/screens/` (Home, ParentArea, PlacementScreen, RecordScreen, BackupPanel), `src/ui/session/` (the six session parts and the runner) | |
| Browser tests | `tests/e2e/*.spec.ts`, helpers in `tests/e2e/helpers.ts` | The `autoPlay` helper reads `data-*` hints from the screens to answer correctly |
| Publishing | `.github/workflows/deploy.yml` | Builds with `BASE_PATH=/tapwords/` |

## The twenty-two sections

Numbering and concepts follow the program's published scope and sequence for Steps 1 to 4, so "she's on 4.2" means the same thing in both. Substep 1.2 teaches its many sounds in five ordered groups (b sh u / h j c k ck / e v w / x y z / ch th qu wh); the child sees it as one section, but the engine only shows words, sentences and stories the current group can read. Sight words are declared per section and are cumulative.

What is deliberately different from the program: every word, sentence and story is original; the sight-word lists are our own; the lesson has six parts rather than ten; there is no handwriting.

The tutor should confirm the section order against the edition they teach, and confirm the six Book 4 titles and their order in particular — the list is visible in the app's "Start at" menu.

| Section | Title | Teaches |
|---|---|---|
| 1.1 | First sounds and short words | The consonants f, l, m, n, r, s, d, g, p, t and the short vowels a, i, o; blending and stretching out short words |
| 1.2 | New sounds, a few at a time | The rest of the single-letter sounds and letter pairs (b, sh, u, h, j, c, k, ck, e, v, w, x, y, z, ch, th, qu, wh), taught in five small groups |
| 1.3 | Three sounds with digraphs | Three-sound words that include a letter pair sharing one sound, such as "wish" and "chop" |
| 1.4 | Double letters ff, ll, ss, and all | The doubling rule at the end of a short word (off, bill, miss, call) |
| 1.5 | The nose sounds am and an | The "welded" am and an sounds, said through the nose (ham, fan) |
| 1.6 | Adding s and es | Adding s or es to make a word plural (bugs, wishes) — narrowed to plurals where the added s says /s/; see "Known polish items" below |
| 2.1 | Welded sounds: ang, ing, ong, ung, ank, ink, onk, unk | Eight more welded endings (bang, pink), plus adding s to them |
| 2.2 | Four sounds in a word | Four-sound words (flag, steps, brushes) |
| 2.3 | The odd ones: ild, ind, old, ost, olt | Five endings that break the usual short-vowel rule (mold, host) |
| 2.4 | Five sounds in a word | Five-sound words (spend, crafts) |
| 2.5 | Three-letter blends | Words that start with three letters blended together, up to six sounds (sprint, scraps) |
| 3.1 | Two syllables, no blends | Two-syllable words with no blends, including compound words (sunset) and five simple prefixes (misfed, unlock) |
| 3.2 | Two syllables with blends | Two-syllable words with blends (grandchild, problem), and more prefixes |
| 3.3 | Words that end in ct | Two-syllable words ending in ct (connect), and prefixes on them (conflict) |
| 3.4 | Three or more syllables | Longer words built only from closed syllables (basketball), and prefixes on them (disconnect) |
| 3.5 | Adding ed and ing | The ed and ing endings on words whose spelling doesn't change (shifted, expanding) |
| 4.1 | Silent e with a and i | The `a_e` and `i_e` cards — a silent e that makes the vowel before it say its own name (cake, ride) |
| 4.2 | Silent e with o and u | The `o_e` and `u_e` cards, the same pattern with two more vowels (hope, cube) |
| 4.3 | Silent e with e, and u_e saying oo | The `e_e` card (Pete, theme) and `u_e`'s second sound, "oo" (rule, flute) |
| 4.4 | Silent e after blends and digraphs | No new cards — the same silent-e pattern in words that also start with a blend or letter pair (stride, globe) |
| 4.5 | Long words with a silent-e syllable | No new cards — splitting a longer word into syllables, one of which uses the silent-e pattern (cupcake, invite) |
| 4.6 | Adding s, and words that break the rule | No new cards — adding s to a silent-e word (cakes), and the three exceptions have, give, live |

## Decisions worth knowing (not obvious from the code)

- **Sections that introduce no new cards** (1.3, 1.6, 2.2, 2.4, 2.5, 3.1 to 3.4) use the cards of their own word bank as "current" for the sound-card drill, capped at 10 for the forward drill. Without this the whole drill counted as review.
- **Story question choices are shuffled per session** in the engine; the authored files all list the right answer first.
- **Proper nouns** (Sam, Pam, Dan, Jan, Nan, Atlantic, Wisconsin, Manhattan) are capitalised in `text` with lower-case parts. The checker compares texts case-insensitively. Capitalised words are never targets or distractors in "hear it, find it", because a capital letter would give the answer away.
- **Welded endings.** A word ending in am, an, all, ang, ing, ong, ung, ank, ink, onk, unk, old or olt must tap that ending as the welded card, and so cannot appear before the section that teaches it. ild, ind and ost are exempt because wind, cost and lost are regular.
- **Question prompts are spoken by the app**, so they may use words the child has not learned. Titles and answer choices must stay decodable.
- **Backup "replace"** writes the backup's data first and only then removes what was there, so a failure midway cannot empty the device. Backup files are plain JSON with recordings as base64.
- **Damaged data** is never discarded silently: the home screen offers restore from a backup or a hold-to-confirm fresh start.
- **Touch targets** are 64px everywhere, including the tapping dots for long words (the drawn circle shrinks, the hit box does not).
- **A silent e is its own kind of sound card.** Book 4 added two new card types: `vce` (a vowel that says its own name because a silent e sits later in the same syllable — a, e, i, o, u) and `silent` (a letter that is shown but makes no sound and is never tapped). "cake" has four letters but three taps: c, then a (which says "ay" because of the e), then k. The e itself is drawn dimmed, gets no tap dot, and a curved line arcs from the a to the e on screen to show the job the e is doing.
- **`src/content/parts.ts`** is the one place that works out which silent e belongs to which vowel, and which letters in a word actually make a sound (and so get a tap dot). Both the content checker and the on-screen tiles call into these same functions, so that logic exists exactly once.
- **Two of the new sound cards are never drilled on their own**: `e_silent` (there is nothing to say) and `u_e_oo`, the second sound of the `u_e` card — the "oo" in "rule" rather than the usual "yoo" in "mule". Drilling it as its own flashcard would be unanswerable, since it looks identical to `u_e`. It is taught only inside real words, in section 4.3.
- **have, give, live break the silent-e rule on purpose.** English words don't end in a bare v, so these three are tapped as h, a, "ve" (the v and e together count as one sound) rather than the usual silent-e pattern. The content checker has a specific allowance for this: "ve" is accepted as a way of spelling the v sound only under a tag named `silent-e-exception`, which only these three words use.

## Checker blind spots

The content checker enforces: cards taught before use, parts spelling the text, welded endings, syllable indexes in range, sentence and story words taught, minimum counts, one bank per word text (case-insensitive), a silent letter must be paired with a silent-e vowel earlier in its own syllable (and that vowel must have exactly one such partner), and "ve" is only accepted as a spelling of the v sound under the `silent-e-exception` tag. It does **not** check story titles, question prompts, answer choices, or a duplicate text inside the same section, and it cannot judge whether a nonsense word is safe or a question has two defensible answers. Those were checked by a reviewer reading every word. When adding content, do the same by hand.

Nonsense-word bar: pronounceable, follows the section's pattern, never a real word, name or slang, never one letter away from a rude word.

**One recorded sound per card — the rule no automated check can see.** Every sound card has exactly one recorded sound, and the app plays that same recording every time the card is tapped: in a lesson, a sentence, a story, or just sitting in a section's word-bank list. So a word only belongs in a section if every one of its letters takes the sound already taught for that letter's card. The traps that catch even a careful author: s saying /z/ instead of /s/ ("rose"), z saying /s/ instead of /z/ ("pretzel"), c saying /s/ instead of /k/ ("cent"), g saying /j/ instead of /g/ ("huge"), and the "ed" ending on a word where it isn't said plainly as "ed" (jumped says "t", filled says "d"). None of this is about spelling, so `src/content/check.ts` cannot see it — a person has to read every word.

## Known polish items (reviewed as minor, no child-safety issue)

- A few "have fun" story endings in 3.3 and 3.4; a few answer distractors not drawn from their own story (1.3, 1.4, 1.6, 2.4).
- Bank-only words that are bookish for the age (3.2: complex, insult, husband, absent; 3.4: misconduct, combatant, enlistment, investment, commitment, consultant; also vat, cam, sham, rind, volt). They appear in word work and read-aloud lists, never in sentences.
- Sections 1.3 and 1.6 have only four or five review-eligible cards, so the 85 percent review gate is measured on a small sample there.
- Sentences or stories borrowed from an earlier section as a fallback are recorded under the current section's strength key. The fallback never fires on the current content.
- `IdbStore.saveClip` and `deleteClip` are outside the store's serial write queue (single writer today, so harmless).
- The single "th" sound card is recorded as the unvoiced sound (as in "thumb"), but words like "then", "that" and "this" — which use the other, voiced "th" sound — appear starting in section 1.2. This has been true since version one.
- The "es" word ending (as in "boxes") is heard from the app as "e" then "s", but many of those words are actually said with a "z" sound at the end. There is no separate sound card for that, so this has been true since version one.
- Some Book 3 words are split into syllables in a mechanical, rule-following way (such as com|plim|ent) rather than how a dictionary would split them. This is a longstanding choice the tutor should weigh in on.
- Words with a doubled consonant (such as "rabbit") are tapped as two separate sounds (rab|bit), even though only one sound is heard.
- Section 1.6 was narrowed to only plurals where the added "s" sounds like "s" (not "z"), because the s sound card has only one recorded sound. The "z"-sounding plural (as in "dogs") is not taught until a later book.
- The curved bridge line that connects a vowel to its silent e (Book 4) has been checked in a browser test but not yet tried on a real iPad.
- The tutor should confirm the six Book 4 section titles and their teaching order against the app's own "Start at" menu.
- Tile *colour* (the cue that says vowel, consonant or welded) sits at roughly 1.2:1 against the page. It is legible in good light on a good screen and the calm palette is deliberate, but it is the weakest signal in the app, and it is why a Book 4 bug that coloured a silent-e card as a consonant went unnoticed by eye through twenty reviews. Worth a tutor's opinion on a real iPad.
- Welded "am" and "an" are tapped as one piece only at the END OF A WORD (pan, dustpan), never mid-word (blanket, pancake, Manhattan). That is what the checker enforces and what the whole program now does; four Book 4 words were corrected to match in September 2026.

## What comes next

1. **Real-iPad check** by the family: one full session including the read-aloud, add to home screen, airplane-mode reopen, back up from the grown-up area. Fix whatever it turns up.
2. **Tutor review** of the section order and a sample of lessons.
3. **Polish** from the list above, if wanted.
4. **Books 5 to 12** are out of scope for now. The engine needs no code changes for more sections: add cards to `cards.ts`, a substep file, register it, and make the checker pass. Book 4 proved this out — two new card types (`vce` and `silent`) and a new way of drawing a word on screen (the bridge line) were both added without changing how the engine builds a session, so the same machinery is ready for Book 5.

## How the work was done (for future agent-driven sessions)

The plans were executed with a controller session dispatching one agent per task in isolated git worktrees, a reviewer per task, and a whole-branch review at the end. Practical notes: worktree-isolated agents cannot write outside their worktree, so reports were copied over; content sections were authored in parallel only where their card dependencies allowed (step 1 had to go 1.2, then 1.3/1.4/1.5, then 1.6); cross-section duplicate words only appear when everything is registered, so register early and run the checker; commit trailers from different agents were normalised at merge. The most capable model hit a usage limit partway through, and the faster model authored most of steps 2 and 3, with word-by-word reviews catching what mattered.
