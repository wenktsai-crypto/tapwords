# Content 1.2 to 3.5, Placement Check, Recording, Backup and Restore Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish version one of Tapwords: every substep from 1.2 to 3.5 authored and passing the content checker, a placement check a parent can run with the child, a sound-recording page, backup and restore of everything on the device, and a recovery screen for damaged data.

**Architecture:** Content stays one TypeScript file per substep under `src/content/substeps/`, registered in `src/content/index.ts` and verified by the checker in `src/content/check.ts` (extended here with a welded-ending rule and syllable validation). The engine gains per-group filtering of sentences and stories (so a 1.2 group-one session never shows a story with sounds from group four) and a placement-list helper; everything else is UI on top of the existing `Store` and `AudioPlayer` interfaces, plus one new `Recorder` interface with a browser and a fake implementation. Backup is a plain JSON file written and read by `src/store/backup.ts` against the `Store` interface.

**Tech Stack:** TypeScript, React 18, Vite 5, Vitest 2 (jsdom + Testing Library), Playwright 1.63, idb-keyval, MediaRecorder (browser), Web Share API with anchor-download fallback.

**Spec:** `docs/superpowers/specs/2026-09-12-reading-app-design.md` (sections 3, 5, 6, 8.3, 8.4, 9).

## Global Constraints

- The app must not use the Wilson name anywhere in code, content, or docs. Working name: Tapwords.
- All content is original. Word lists, sentences, and stories are written for this project (spec 3.5).
- Every substep must pass `checkContent(CONTENT)` with the production minimums in `MIN`: 20 real words, 10 nonsense words, 6 sentences, 1 story, 1 question per story (spec 3.4).
- Every word, sentence, and story uses only sounds and concepts from its substep or earlier (spec success criteria); the checker enforces it and no test may lower `MIN` for a real substep.
- Unit tests live under `tests/**/*.test.ts(x)` and run with `npm test`; browser tests under `tests/e2e/*.spec.ts` run with `npm run e2e`.
- `npm test`, `npm run typecheck`, and `npm run build` must pass before every commit. `npm run e2e` must pass before the commits of Task 23 and Task 24.
- No network calls at runtime other than loading the app's own files (spec 8.1). No new runtime dependencies.
- The engine (`src/engine`) never imports React or touches browser APIs.
- Calm presentation rules (spec 4.3, 7): no red marks, no X, no scores shown to the child, touch targets at least 64px, everything a tap or a drag.
- Commit after every task with a plain-English message ending in `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Nothing is pushed to any remote in this plan.

---

## File structure

```
src/content/cards.ts                     add the `ed` suffix card (Task 1)
src/content/check.ts                     welded-ending rule, syllable validation (Task 1)
src/content/index.ts                     register substeps 1.2 to 3.5 (Tasks 8-22)
src/content/substeps/s1-2.ts ... s3-5.ts one file per substep (Tasks 8-22)
src/engine/session.ts                    usableSentences / usableStories per group (Task 2)
src/engine/progression.ts                placementLists() (Task 4)
src/ui/components/TapDots.tsx            syllable gaps, long-word sizing (Task 3)
src/ui/styles.css                        tile sizing for long words, placement, record, backup styles
src/ui/screens/PlacementScreen.tsx       parent-run placement check (Task 4)
src/ui/screens/Home.tsx                  placement entry, restore entry, damaged-data screen (Tasks 4, 7)
src/ui/screens/ParentArea.tsx            buttons for placement, recording, backup (Tasks 4, 5, 7)
src/audio/types.ts, recorder.ts, fake.ts Recorder interface, BrowserRecorder, FakeRecorder (Task 5)
src/ui/screens/RecordScreen.tsx          record a clip per card (Task 5)
src/store/types.ts, idb.ts, memory.ts    setLogs, clearAll, CorruptDataError (Tasks 6, 7)
src/store/backup.ts                      createBackup, parseBackup, restoreBackup (Task 6)
src/ui/files.ts                          saveTextFile() via share sheet or download (Task 7)
src/ui/screens/BackupPanel.tsx           back up / restore controls (Task 7)
src/ui/services.tsx, src/main.tsx        recorder and saveFile wired into Services (Tasks 5, 7)
tests/content/check.test.ts              new checker rules (Task 1)
tests/content/s1-2.test.ts ... s3-5.test.ts  per-substep tests (Tasks 8-22)
tests/engine/session.test.ts             sentence/story availability (Task 2)
tests/engine/progression.test.ts         placementLists (Task 4)
tests/ui/tapdots.test.tsx                syllable gap (Task 3)
tests/ui/placement.test.tsx              placement screen (Task 4)
tests/ui/record.test.tsx                 recording screen (Task 5)
tests/store/backup.test.ts, contract.ts  backup round trip, new store methods (Task 6)
tests/ui/backup.test.tsx, home.test.tsx  backup panel, damaged data (Task 7)
tests/ui/helpers.tsx                     FakeRecorder and saveFile in makeServices (Tasks 5, 7)
tests/e2e/parent.spec.ts                 placement and backup/restore in a real browser (Task 23)
README.md                                placement, recording, backup instructions (Task 24)
```

## Execution notes for the orchestrator

- Tasks 1, 2 and 3 touch disjoint files and can run in parallel. They must all be merged before any content task starts (content relies on the `ed` card and the new checker rules).
- Content tasks run in three waves of five: wave A is 1.2 to 1.6 (Tasks 8-12), wave B is 2.1 to 2.5 (Tasks 13-17), wave C is 3.1 to 3.5 (Tasks 18-22). Within a wave the five agents work in isolated worktrees on their own files only and do **not** edit `src/content/index.ts`; the orchestrator registers the wave's substeps in `index.ts` after merging, runs `npm test`, and fixes any cross-substep duplicate word by removing it from the later substep. Each wave must be merged and green before the next wave starts, because later substeps' tests build their `Content` from every earlier substep.
- Tasks 4, 5, 6 and 7 are independent of content and can run alongside the content waves. Task 7 depends on Tasks 4, 5 and 6 (it edits `Home.tsx`, `ParentArea.tsx`, `services.tsx`, `helpers.tsx` after them). Task 5 and Task 6 are independent of each other; Task 5 edits `services.tsx`/`helpers.tsx`, so run Task 5 and Task 7 sequentially.
- Task 23 needs all content merged (the placement check shows lists from 1.3 and 1.6). Task 24 is last.

---

## Content authoring recipe (used by Tasks 8 to 22)

Every content task follows this recipe; the task itself gives the substep's specifics.

**Words.** Use the helpers in `src/content/build.ts`: `cvc('map')` for one card per letter, `word('off', 'o,ff:f')` for anything else (`grapheme:card`, card defaults to the grapheme), `nonsense(text, spec)` and `cvcNonsense(text)` for nonsense. A word's `parts` are its tapping pattern: digraphs (`sh`, `ck`, `ch`, `th`, `qu`, `wh`) and welded sounds (`all`, `am`, `an`, `ang`…`unk`, `ild`, `ind`, `old`, `ost`, `olt`, and the `ed` suffix) are single parts whose grapheme equals the card id. Doubled letters `ff`, `ll`, `ss`, `zz` are one part mapped to the single card (`'ff:f'`) and are only allowed once the `doubling` concept has been introduced (substep 1.4). Two-syllable and longer words repeat the letter when a consonant is doubled across syllables: `word('rabbit', 'r,a,b,b,i,t', { syllables: [3] })`.

**Rules the checker enforces (so write to them from the start):**
- A word may only use cards taught at or before its substep (for 1.2, at or before its group).
- `parts` graphemes joined must equal `text`.
- A word text may live in only one substep's bank across the whole program. If you suspect a word was used earlier, search: `grep -rn "'word'" src/content/substeps/`.
- A word whose text ends in `am`, `an`, `all`, `ang`, `ing`, `ong`, `ung`, `ank`, `ink`, `onk`, `unk`, `old`, or `olt` must tap that ending as the welded card, so such words cannot appear before the substep that introduces the card (1.4 for `all`, 1.5 for `am`/`an`, 2.1 for the `ng`/`nk` family, 2.3 for `old`/`olt`). Before then, simply do not use words with those endings (no "ham", "fan", "ball", "ring" before their time). `ild`, `ind`, `ost` are not enforced because "wind", "cost", "lost" are regular; use your judgment and tap "find", "wild", "most" as welded from 2.3 on.
- `syllables`, when present, must be strictly increasing indexes into `parts`, each greater than 0 and less than `parts.length`.
- Sentences and stories may only use real words from this or an earlier substep's bank, plus sight words declared in this or an earlier substep. Nonsense words never appear in sentences.
- Minimums: 20 real, 10 nonsense, 6 sentences, 1 story with 1 question. Aim for 24 to 36 real words, 12 to 16 nonsense, 8 sentences, 2 stories with 2 questions each so sessions do not repeat too fast.

**Style rules the checker cannot enforce:**
- No `-ed` or `-ing` suffix words before 3.5. No `-s`/`-es` plurals or verb forms before 1.6. No blends (two consonants in a row within one syllable) before 2.2. No three-letter blends before 2.5.
- Nonsense words must be pronounceable, follow the substep's pattern, and never be real words or rude. Avoid nonsense words that are one letter away from a rude word.
- Sentences: 4 to 9 words, one idea each, present tense preferred, calm and a little funny. Capitalise the first word and end with a period or question mark. Sight words allowed are exactly the cumulative `sightWords` lists.
- Stories: 5 to 8 sentences, a title made of taught words, a small concrete event a child can picture (a pet, a snack, a game). Questions have three text choices where exactly one is right and the other two are plausible words from the story.
- `parentSummary`: two sentences a parent can read, naming the sounds or pattern in plain words with two example words.
- Lesson: 6 to 10 steps per group: a `say` that names the new thing in one sentence, a `show` of the new tiles, a `say` that explains tapping or the rule in one sentence, one `tap` demonstration, then two to four `try` words. `tap` and `try` words must be in this substep's bank and use only cards taught by that group or earlier.

**Sight words** are cumulative. Declare only the new ones for your substep, exactly as listed in the task.

**The per-substep test** builds its own `Content` from the real card list and every substep up to and including the new one (so it does not need `index.ts`), runs the checker at production minimums, and asserts the substep-specific facts named in the task.

**Verification for every content task:**

```bash
npx vitest run tests/content/sX-Y.test.ts   # your file, must pass
npm run typecheck
```

Do not edit `src/content/index.ts` or any other existing file. Commit only your two new files.

---

### Task 1: Checker rules for welded endings and syllables, and the `ed` card

**Files:**
- Modify: `src/content/cards.ts`
- Modify: `src/content/check.ts`
- Test: `tests/content/check.test.ts`, `tests/content/cards.test.ts`

**Interfaces:**
- Consumes: `checkContent(content, min)` and `SPELLING_RULES` from `src/content/check.ts`.
- Produces: a card with id `ed` (grapheme `ed`, keyword `landed`, type `welded`); exported `WELDED_ENDINGS: string[]`; two new checker error messages: `` `${s.id}: "${w.text}" ends in "${g}" which must be tapped as the welded card "${g}"` `` and `` `${s.id}: "${w.text}" has invalid syllables [${w.syllables}]` ``.

- [ ] **Step 1: Write the failing tests**

Append to `tests/content/check.test.ts` inside `describe('checkContent', …)`:

```ts
  it('requires a word ending in a welded sound to tap it as the welded card', () => {
    const s = sub({
      groups: [{ cards: ['m', 'a', 'p', 's', 't', 'h', 'am'], lesson: [{ try: 'map' }] }],
      words: [cvc('map'), cvcNonsense('tas'), word('ham', 'h,a,m')],
    });
    const errors = checkContent(content(s), tiny);
    expect(errors.some((e) => e.includes('"ham"') && e.includes('welded card "am"'))).toBe(true);
    const ok = sub({
      groups: [{ cards: ['m', 'a', 'p', 's', 't', 'h', 'am'], lesson: [{ try: 'map' }] }],
      words: [cvc('map'), cvcNonsense('tas'), word('ham', 'h,am')],
    });
    expect(checkContent(content(ok), tiny)).toEqual([]);
  });

  it('rejects a welded ending before its card is taught', () => {
    const errors = checkContent(content(sub({ words: [cvc('map'), cvcNonsense('tas'), word('pam', 'p,a,m')] })), tiny);
    expect(errors.some((e) => e.includes('"pam"') && e.includes('welded card "am"'))).toBe(true);
  });

  it('does not apply the welded rule to ild, ind, ost', () => {
    const s = sub({
      groups: [{ cards: ['m', 'a', 'p', 's', 't', 'o', 'l', 'c'], lesson: [{ try: 'map' }] }],
      words: [cvc('map'), cvcNonsense('tas'), cvc('cost')],
    });
    expect(checkContent(content(s), tiny)).toEqual([]);
  });

  it('validates syllable split points', () => {
    const bad = sub({ words: [cvc('map'), cvcNonsense('tas'), word('mapmat', 'm,a,p,m,a,t', { syllables: [0, 6] })] });
    const errors = checkContent(content(bad), tiny);
    expect(errors.some((e) => e.includes('"mapmat"') && e.includes('invalid syllables'))).toBe(true);
    const good = sub({ words: [cvc('map'), cvcNonsense('tas'), word('mapmat', 'm,a,p,m,a,t', { syllables: [3] })] });
    expect(checkContent(content(good), tiny)).toEqual([]);
  });
```

In `tests/content/cards.test.ts`, add `'ed'` to the list in `includes the cards needed through step 3`.

- [ ] **Step 2: Run them to see them fail**

Run: `npx vitest run tests/content/check.test.ts tests/content/cards.test.ts`
Expected: the four new checker tests fail (no welded-ending or syllable errors are produced) and the card test fails with `missing card ed`.

- [ ] **Step 3: Add the card and the rules**

In `src/content/cards.ts`, after the `olt` card:

```ts
  // Suffix taught in 3.5; tapped as one unit like a welded sound
  card('ed', 'landed', 'welded', 'ed, as in landed'),
```

In `src/content/check.ts`, after `MIN`:

```ts
/** Endings that must always be tapped as the welded card of the same spelling. ild, ind and ost
 * are left out because "wind", "cost" and "lost" are regular closed syllables. */
export const WELDED_ENDINGS = ['ang', 'ing', 'ong', 'ung', 'ank', 'ink', 'onk', 'unk', 'all', 'old', 'olt', 'am', 'an'];
```

Inside the `for (const w of s.words)` loop, after the `parts spell` check, add:

```ts
      const ending = WELDED_ENDINGS.find((g) => w.text.endsWith(g));
      const lastPart = w.parts[w.parts.length - 1];
      if (ending && lastPart && lastPart.grapheme !== ending) {
        errors.push(`${s.id}: "${w.text}" ends in "${ending}" which must be tapped as the welded card "${ending}"`);
      }
      if (w.syllables) {
        const ok = w.syllables.every((x, i) => Number.isInteger(x) && x > 0 && x < w.parts.length && (i === 0 || x > w.syllables![i - 1]));
        if (!ok) errors.push(`${s.id}: "${w.text}" has invalid syllables [${w.syllables}]`);
      }
```

Note the longest endings come first in `WELDED_ENDINGS` so "bang" matches `ang` before `an` would be considered; `find` returns the first match, so keep the order as written.

- [ ] **Step 4: Run all tests, type check, commit**

Run: `npm test && npm run typecheck`
Expected: all pass (substep 1.1 has no words ending in those graphemes; if the 1.1 test fails on a word, that word must be replaced, but none currently ends in am/an/all).

```bash
git add src/content/cards.ts src/content/check.ts tests/content/check.test.ts tests/content/cards.test.ts
git commit -m "Check welded endings and syllable splits, and add the -ed suffix card

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Sentences and stories filtered by what the current group has taught

**Files:**
- Modify: `src/engine/session.ts`
- Test: `tests/engine/session.test.ts`

**Interfaces:**
- Consumes: `availableWords(content, substepId, groupIndex)` from `src/engine/availability.ts`; `tokenize` from `src/content/check.ts`.
- Produces: `usableSentences(content, substepId, groupIndex): { text: string; substep: string }[]` and `usableStories(content, substepId, groupIndex): { story: Story; substep: string }[]`, both exported from `src/engine/session.ts`. `SpellingItem` of type `sentence` and `SessionPlan.readAloud.sentences` keep their shapes; `SessionPlan.story` keeps its shape.

Why: 1.2 teaches its cards in five groups but has one sentence and story list. Without filtering, a child on group one (b, sh, u) would be asked to order a sentence containing "wet" (e is group three). The fix chooses only sentences and stories whose every word is a real word available at this group or a sight word, falling back to earlier substeps when the current one has too few.

- [ ] **Step 1: Write the failing tests**

Append to `tests/engine/session.test.ts` (check the existing imports; add `usableSentences`, `usableStories` to the import from `../../src/engine/session`, `CARDS` from `../../src/content/cards`, `cvc`, `cvcNonsense` from `../../src/content/build`, `CONTENT` from `../../src/content`, and `type Content` from `../../src/content/types` if not already imported):

```ts
describe('sentence and story availability by group', () => {
  const one = CONTENT.substeps[0];
  const grouped: Content = {
    cards: CARDS,
    substeps: [
      one,
      {
        ...one,
        id: '1.2',
        title: 'Grouped',
        groups: [
          { cards: ['b', 'u'], lesson: [] },
          { cards: ['e'], lesson: [] },
        ],
        sightWords: [],
        words: [cvc('bud'), cvc('tub'), cvc('bed'), cvcNonsense('bup')],
        sentences: ['The bud is in the tub.', 'The bed is in the fog.'],
        stories: [
          { title: 'The Tub', sentences: ['The bud is in the tub.'], questions: [{ prompt: 'q', choices: ['a', 'b', 'c'], answer: 0 }] },
          { title: 'The Bed', sentences: ['The bed is in the fog.'], questions: [{ prompt: 'q', choices: ['a', 'b', 'c'], answer: 0 }] },
        ],
      },
    ],
  };

  it('keeps only sentences whose words are taught by the current group', () => {
    const g0 = usableSentences(grouped, '1.2', 0);
    expect(g0.filter((s) => s.substep === '1.2').map((s) => s.text)).toEqual(['The bud is in the tub.']);
    const g1 = usableSentences(grouped, '1.2', 1).filter((s) => s.substep === '1.2').map((s) => s.text);
    expect(g1).toEqual(['The bud is in the tub.', 'The bed is in the fog.']);
  });

  it('falls back to earlier substeps sentences after the current ones', () => {
    const g0 = usableSentences(grouped, '1.2', 0);
    expect(g0[0].substep).toBe('1.2');
    expect(g0.some((s) => s.substep === '1.1')).toBe(true);
  });

  it('keeps only stories whose sentences are all readable, falling back to earlier substeps', () => {
    expect(usableStories(grouped, '1.2', 0).map((s) => s.story.title)).toEqual(['The Tub']);
    const none: Content = { ...grouped, substeps: [grouped.substeps[0], { ...grouped.substeps[1], stories: [grouped.substeps[1].stories[1]] }] };
    const fallback = usableStories(none, '1.2', 0);
    expect(fallback.length).toBeGreaterThan(0);
    expect(fallback.every((s) => s.substep === '1.1')).toBe(true);
  });

  it('builds a group-one session whose sentences and story avoid untaught sounds', () => {
    const plan = buildSession(grouped, initialState('1.2'), seeded(5));
    const texts = [
      ...plan.spelling.filter((i) => i.type === 'sentence').map((i) => (i as { text: string }).text),
      ...plan.readAloud.sentences,
      ...plan.story.sentences,
    ];
    for (const t of texts) expect(t, t).not.toMatch(/bed/);
  });
});
```

- [ ] **Step 2: Run to see them fail**

Run: `npx vitest run tests/engine/session.test.ts`
Expected: FAIL with `usableSentences is not a function` (or not exported).

- [ ] **Step 3: Implement**

In `src/engine/session.ts` add the import `import { tokenize } from '../content/check';` and these functions above `buildSession`:

```ts
function readableWordSet(content: Content, substepId: string, groupIndex: number): Set<string> {
  const idx = substepIndex(content, substepId);
  const words = new Set(
    availableWords(content, substepId, groupIndex)
      .filter((w) => w.word.kind === 'real')
      .map((w) => w.word.text.toLowerCase()),
  );
  content.substeps.slice(0, idx + 1).forEach((s) => s.sightWords.forEach((sw) => words.add(sw.toLowerCase())));
  return words;
}

const readable = (text: string, known: Set<string>) => tokenize(text).every((t) => known.has(t));

/** Current-substep sentences the child can read at this group, then earlier substeps' sentences (latest first). */
export function usableSentences(content: Content, substepId: string, groupIndex: number): { text: string; substep: string }[] {
  const idx = substepIndex(content, substepId);
  const known = readableWordSet(content, substepId, groupIndex);
  const cur = content.substeps[idx].sentences.filter((t) => readable(t, known)).map((text) => ({ text, substep: substepId }));
  const earlier = content.substeps
    .slice(0, idx)
    .reverse()
    .flatMap((s) => s.sentences.map((text) => ({ text, substep: s.id })));
  return [...cur, ...earlier];
}

/** Current-substep stories fully readable at this group; if none, the nearest earlier substep's stories. */
export function usableStories(content: Content, substepId: string, groupIndex: number): { story: Story; substep: string }[] {
  const idx = substepIndex(content, substepId);
  const known = readableWordSet(content, substepId, groupIndex);
  const cur = content.substeps[idx].stories.filter((st) => st.sentences.every((t) => readable(t, known))).map((story) => ({ story, substep: substepId }));
  if (cur.length > 0) return cur;
  for (let i = idx - 1; i >= 0; i--) {
    const s = content.substeps[i];
    if (s.stories.length > 0) return s.stories.map((story) => ({ story, substep: s.id }));
  }
  return [];
}
```

Then in `buildSession` replace the sentence and story picks:

```ts
  // Sentences the child can actually read at this group; earlier substeps' sentences fill any gap.
  const sentencePool = usableSentences(content, sub.id, groupIndex);
  const curSentences = sentencePool.filter((s) => s.substep === sub.id).map((s) => s.text);
  const pickSentences = (k: number) => {
    const picked = sample(curSentences, k, rng);
    const rest = sentencePool.filter((s) => s.substep !== sub.id).map((s) => s.text);
    return topUp(picked, rest, k);
  };
  const spellSentences: SpellingItem[] = pickSentences(COUNTS.spellSentence).map((text) => ({ type: 'sentence', text, substep: sub.id, words: shuffle(text.split(/\s+/), rng) }));
```

and

```ts
  const readAloud = { words: [...raCur, ...raRev], sentences: pickSentences(COUNTS.readAloudSentences) };

  // 6. story
  const stories = usableStories(content, sub.id, groupIndex);
  const story = stories.length > 0 ? stories[(n - 1) % stories.length].story : sub.stories[(n - 1) % sub.stories.length];
```

Keep `substep: sub.id` on sentence items (the strength key stays per current substep; that is acceptable and matches how the read-aloud part keys sentences).

- [ ] **Step 4: Run all tests, type check, commit**

Run: `npm test && npm run typecheck`
Expected: all pass. If an existing session test asserted that sentences come from `sub.sentences` only, it still holds for 1.1 (one group, everything readable).

```bash
git add src/engine/session.ts tests/engine/session.test.ts
git commit -m "Only use sentences and stories the current card group can read, with earlier substeps as backup

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Tap dots for long and two-syllable words

**Files:**
- Modify: `src/ui/components/TapDots.tsx`
- Modify: `src/ui/styles.css`
- Test: `tests/ui/tapdots.test.tsx`

**Interfaces:**
- Consumes: `Word.syllables` from `src/content/types.ts`.
- Produces: tiles at a syllable start carry class `tile-syllable-start`; the wrapper carries `tapdots-long` when the word has more than six parts.

- [ ] **Step 1: Write the failing test**

Append to `tests/ui/tapdots.test.tsx` (reuse its existing render helper and imports; the file already imports `TapDots` and `renderWithServices` or equivalent):

```tsx
  it('marks syllable starts and shrinks long words', () => {
    const word = { text: 'sunsetlamp', parts: 'sunsetlamp'.split('').map((g) => ({ grapheme: g, card: g })), kind: 'real' as const, syllables: [3, 6] };
    const { container } = renderWithServices(<TapDots word={word} mode="try" onResult={() => {}} />);
    expect(container.querySelector('.tapdots')?.classList.contains('tapdots-long')).toBe(true);
    const starts = container.querySelectorAll('.tile-syllable-start');
    expect(starts.length).toBe(2);
    expect(starts[0].textContent).toBe('s');
    expect(starts[1].textContent).toBe('l');
  });

  it('does not shrink or split a short word', () => {
    const word = { text: 'map', parts: 'map'.split('').map((g) => ({ grapheme: g, card: g })), kind: 'real' as const };
    const { container } = renderWithServices(<TapDots word={word} mode="try" onResult={() => {}} />);
    expect(container.querySelector('.tapdots')?.classList.contains('tapdots-long')).toBe(false);
    expect(container.querySelectorAll('.tile-syllable-start').length).toBe(0);
  });
```

- [ ] **Step 2: Run to see it fail**

Run: `npx vitest run tests/ui/tapdots.test.tsx`
Expected: FAIL, no `tapdots-long` class and no `tile-syllable-start` elements.

- [ ] **Step 3: Implement**

In `src/ui/components/Tile.tsx` add an optional `className?: string` prop and include it in `cls`:

```tsx
export function Tile({ grapheme, type = 'consonant', size = 'normal', selected, dim, onClick, label, className }: Props) {
  const cls = ['tile', `tile-${type}`, `tile-${size}`, selected ? 'tile-selected' : '', dim ? 'tile-dim' : '', className ?? ''].filter(Boolean).join(' ');
```

In `src/ui/components/TapDots.tsx`:

```tsx
  const starts = new Set(word.syllables ?? []);
  const long = word.parts.length > 6;
  return (
    <div className={`tapdots ${long ? 'tapdots-long' : ''}`}>
      <div className="row row-tight">
        {word.parts.map((p, i) => (
          <Tile key={i} grapheme={p.grapheme} type={cardTypeFor(content.cards, p.grapheme)} selected={i < tapped} className={starts.has(i) ? 'tile-syllable-start' : ''} />
        ))}
      </div>
```

and give each dot the same syllable gap:

```tsx
            <button key={i} type="button" className={`dot ${i < tapped ? 'dot-lit' : ''} ${starts.has(i) ? 'dot-syllable-start' : ''}`} aria-label={`Sound ${i + 1}`} onClick={() => tapDot(i)} />
          ) : (
            <span key={i} className={`dot ${i < tapped ? 'dot-lit' : ''} ${starts.has(i) ? 'dot-syllable-start' : ''}`} aria-hidden="true" />
```

In `src/ui/styles.css` append:

```css
.row-tight { gap: 10px; }
.tile-syllable-start { margin-left: 22px; }
.dot-syllable-start { margin-left: 22px; }
.tapdots-long .tile { min-width: 60px; height: 76px; font-size: 40px; padding: 0 8px; }
.tapdots-long .dots { gap: 14px; }
.tapdots-long .dot { width: 40px; height: 40px; }
```

Check the existing `.tile` and `.dot` rules in `styles.css` for the property names used for size (width/height/min-width) and mirror them so the override actually applies; keep the tap target of a dot at 40px or more with the surrounding gap making 64px of touch room, and never below 40px.

- [ ] **Step 4: Run all tests, type check, commit**

Run: `npm test && npm run typecheck`

```bash
git add src/ui/components/Tile.tsx src/ui/components/TapDots.tsx src/ui/styles.css tests/ui/tapdots.test.tsx
git commit -m "Show syllable gaps and smaller tiles for long words in the tapping view

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Placement check

**Files:**
- Modify: `src/engine/progression.ts`
- Create: `src/ui/screens/PlacementScreen.tsx`
- Modify: `src/ui/screens/Home.tsx`, `src/ui/screens/ParentArea.tsx`, `src/ui/styles.css`
- Test: `tests/engine/progression.test.ts`, `tests/ui/placement.test.tsx`, `tests/ui/home.test.tsx`, `tests/ui/parent.test.tsx`

**Interfaces:**
- Consumes: `PLACEMENT_SUBSTEPS`, `suggestPlacement(results)`, `moveTo(state, id)` from `src/engine/progression.ts`; `sample` and `Rng` from `src/engine/rng.ts`; `initialState` from `src/engine/types.ts`.
- Produces: `placementLists(content, rng, counts?)` returning `PlacementList[]` where `interface PlacementList { substep: string; title: string; words: Word[] }`; `PlacementScreen` with props `{ onDone: (substepId: string) => void; onCancel: () => void }`.

- [ ] **Step 1: Write the failing engine test**

Append to `tests/engine/progression.test.ts` (add `placementLists` to the import from `../../src/engine/progression`, and import `CONTENT` from `../../src/content`, `seeded` from `../../src/engine/rng`, `CARDS` from `../../src/content/cards`, `cvc`, `cvcNonsense` from `../../src/content/build`, `type Content` from `../../src/content/types` as needed):

```ts
describe('placementLists', () => {
  it('returns 5 real and 3 nonsense words for each placement substep that exists, in order', () => {
    const one = CONTENT.substeps[0];
    const content: Content = {
      cards: CARDS,
      substeps: [one, { ...one, id: '1.2', title: 'x', words: [cvc('bat')] }, { ...one, id: '1.3', title: 'Digraphs', words: one.words }],
    };
    const lists = placementLists(content, seeded(1));
    expect(lists.map((l) => l.substep)).toEqual(['1.1', '1.3']);
    expect(lists[1].title).toBe('Digraphs');
    for (const l of lists) {
      expect(l.words.filter((w) => w.kind === 'real').length).toBe(5);
      expect(l.words.filter((w) => w.kind === 'nonsense').length).toBe(3);
      expect(new Set(l.words.map((w) => w.text)).size).toBe(8);
    }
  });
});
```

- [ ] **Step 2: Run to see it fail**

Run: `npx vitest run tests/engine/progression.test.ts`
Expected: FAIL, `placementLists` is not exported.

- [ ] **Step 3: Implement the helper**

In `src/engine/progression.ts` add imports `import type { Word } from '../content/types';` and `import { sample, shuffle, type Rng } from './rng';`, then after `suggestPlacement`:

```ts
export interface PlacementList {
  substep: string;
  title: string;
  words: Word[];
}

/** Short word lists for the placement check, one per placement substep present in the content. */
export function placementLists(content: Content, rng: Rng, counts = { real: 5, nonsense: 3 }): PlacementList[] {
  return PLACEMENT_SUBSTEPS.filter((id) => content.substeps.some((s) => s.id === id)).map((id) => {
    const sub = getSubstep(content, id);
    const real = sample(sub.words.filter((w) => w.kind === 'real'), counts.real, rng);
    const nonsense = sample(sub.words.filter((w) => w.kind === 'nonsense'), counts.nonsense, rng);
    return { substep: id, title: sub.title, words: shuffle([...real, ...nonsense], rng) };
  });
}
```

Run: `npx vitest run tests/engine/progression.test.ts` — Expected: PASS.

- [ ] **Step 4: Write the failing screen test**

Create `tests/ui/placement.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlacementScreen } from '../../src/ui/screens/PlacementScreen';
import { CONTENT } from '../../src/content';
import { CARDS } from '../../src/content/cards';
import { cvc, cvcNonsense } from '../../src/content/build';
import type { Content } from '../../src/content/types';
import { renderWithServices } from './helpers';

const one = CONTENT.substeps[0];
const three: Content = {
  cards: CARDS,
  substeps: [
    one,
    { ...one, id: '1.2', title: 'Second', words: [cvc('bat'), cvcNonsense('bip')] },
    { ...one, id: '1.3', title: 'Third', words: one.words },
    { ...one, id: '1.4', title: 'Fourth', words: one.words },
    { ...one, id: '1.5', title: 'Fifth', words: one.words },
    { ...one, id: '1.6', title: 'Sixth', words: one.words },
  ],
};

async function markList(user: ReturnType<typeof userEvent.setup>, got: number, missed: number) {
  for (let i = 0; i < got; i++) await user.click(screen.getByRole('button', { name: /got it/i }));
  for (let i = 0; i < missed; i++) await user.click(screen.getByRole('button', { name: /missed it/i }));
}

describe('PlacementScreen', () => {
  it('shows lists in order, stops after the first list below 75%, and suggests the last passed one', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    renderWithServices(<PlacementScreen onDone={onDone} onCancel={() => {}} />, { content: three });

    await user.click(screen.getByRole('button', { name: /begin/i }));
    expect(screen.getByText(/list 1 of 3/i)).toBeInTheDocument();
    await markList(user, 8, 0);          // 1.1 passes
    expect(screen.getByText(/list 2 of 3/i)).toBeInTheDocument();
    await markList(user, 6, 2);          // 1.3 passes at exactly 75%
    expect(screen.getByText(/list 3 of 3/i)).toBeInTheDocument();
    await markList(user, 3, 5);          // 1.6 fails; the check stops

    expect(await screen.findByText(/we suggest starting at 1\.3/i)).toBeInTheDocument();
    expect((screen.getByLabelText(/start at/i) as HTMLSelectElement).value).toBe('1.3');
    await user.click(screen.getByRole('button', { name: /use this/i }));
    expect(onDone).toHaveBeenCalledWith('1.3');
  });

  it('lets the parent change the suggestion before accepting', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    renderWithServices(<PlacementScreen onDone={onDone} onCancel={() => {}} />, { content: three });
    await user.click(screen.getByRole('button', { name: /begin/i }));
    await markList(user, 0, 8);          // 1.1 fails straight away
    expect(await screen.findByText(/we suggest starting at 1\.1/i)).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/start at/i), '1.2');
    await user.click(screen.getByRole('button', { name: /use this/i }));
    expect(onDone).toHaveBeenCalledWith('1.2');
  });

  it('can be cancelled', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderWithServices(<PlacementScreen onDone={() => {}} onCancel={onCancel} />, { content: three });
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
```

- [ ] **Step 5: Run to see it fail**

Run: `npx vitest run tests/ui/placement.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 6: Write the screen**

Create `src/ui/screens/PlacementScreen.tsx`:

```tsx
import { useMemo, useState } from 'react';
import { placementLists, suggestPlacement, type PlacementResult } from '../../engine/progression';
import { useServices } from '../services';
import { BigButton } from '../components/BigButton';

interface Props {
  onDone: (substepId: string) => void;
  onCancel: () => void;
}

type Phase = { name: 'intro' } | { name: 'list'; list: number; word: number; correct: number } | { name: 'result'; suggestion: string };

/** A parent sits with the child; words appear one at a time; the parent marks each. The check stops at
 * the first list under 75% and suggests the last list that passed (spec 5.1). */
export function PlacementScreen({ onDone, onCancel }: Props) {
  const { content, rng } = useServices();
  const lists = useMemo(() => placementLists(content, rng), [content, rng]);
  const [phase, setPhase] = useState<Phase>({ name: 'intro' });
  const [results, setResults] = useState<PlacementResult[]>([]);
  const [choice, setChoice] = useState('');

  const finish = (all: PlacementResult[]) => {
    const suggestion = suggestPlacement(all);
    setChoice(suggestion);
    setPhase({ name: 'result', suggestion });
  };

  const mark = (correct: boolean) => {
    if (phase.name !== 'list') return;
    const list = lists[phase.list];
    const total = list.words.length;
    const c = phase.correct + (correct ? 1 : 0);
    if (phase.word + 1 < total) {
      setPhase({ ...phase, word: phase.word + 1, correct: c });
      return;
    }
    const all = [...results, { substep: list.substep, correct: c, total }];
    setResults(all);
    const passed = c / total >= 0.75;
    if (passed && phase.list + 1 < lists.length) setPhase({ name: 'list', list: phase.list + 1, word: 0, correct: 0 });
    else finish(all);
  };

  if (phase.name === 'intro') {
    return (
      <div className="stage" data-testid="part" data-part="placement-intro">
        <h2>Find the starting point</h2>
        <p className="caption">Sit with your child. Words appear one at a time. Ask them to read each word out loud, then tap "Got it" or "Missed it". The check stops on its own when the words get too hard. It takes about five minutes.</p>
        <div className="row">
          <BigButton onClick={() => (lists.length ? setPhase({ name: 'list', list: 0, word: 0, correct: 0 }) : finish([]))}>Begin</BigButton>
          <BigButton variant="quiet" onClick={onCancel}>Cancel</BigButton>
        </div>
      </div>
    );
  }

  if (phase.name === 'list') {
    const list = lists[phase.list];
    const word = list.words[phase.word];
    return (
      <div className="stage" data-testid="part" data-part="placement" data-list={list.substep}>
        <p className="caption">List {phase.list + 1} of {lists.length}: word {phase.word + 1} of {list.words.length}</p>
        <p className="bigword">{word.text}</p>
        {word.kind === 'nonsense' && <p className="caption">(a made-up word)</p>}
        <div className="row">
          <BigButton onClick={() => mark(true)}>Got it</BigButton>
          <BigButton variant="quiet" onClick={() => mark(false)}>Missed it</BigButton>
        </div>
        <BigButton variant="quiet" onClick={onCancel}>Cancel</BigButton>
      </div>
    );
  }

  const sub = content.substeps.find((s) => s.id === phase.suggestion);
  return (
    <div className="stage" data-testid="part" data-part="placement-result">
      <h2>We suggest starting at {phase.suggestion}</h2>
      <p className="caption">{sub?.title}. {sub?.parentSummary}</p>
      <ul className="caption">
        {results.map((r) => <li key={r.substep}>{r.substep}: {r.correct} of {r.total}</li>)}
      </ul>
      <label>
        Start at
        <select value={choice} onChange={(e) => setChoice(e.target.value)}>
          {content.substeps.map((s) => <option key={s.id} value={s.id}>{s.id} {s.title}</option>)}
        </select>
      </label>
      <div className="row">
        <BigButton onClick={() => onDone(choice)}>Use this</BigButton>
        <BigButton variant="quiet" onClick={onCancel}>Cancel</BigButton>
      </div>
    </div>
  );
}
```

Run: `npx vitest run tests/ui/placement.test.tsx` — Expected: PASS.

- [ ] **Step 7: Wire it into Home and the grown-up area (failing tests first)**

Append to `tests/ui/home.test.tsx` (use the file's existing render approach; it renders `<Home onStart onParent />` with `renderWithServices`):

```tsx
  it('can create a child from the placement check', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    renderWithServices(<Home onStart={() => {}} onParent={() => {}} />, { store });
    await user.click(await screen.findByRole('button', { name: /add a child/i }));
    await user.type(screen.getByLabelText(/name/i), 'Ava');
    await user.click(screen.getByRole('button', { name: /find the starting point/i }));
    await user.click(screen.getByRole('button', { name: /begin/i }));
    for (let i = 0; i < 8; i++) await user.click(screen.getByRole('button', { name: /missed it/i }));
    await user.click(await screen.findByRole('button', { name: /use this/i }));
    expect(await screen.findByRole('button', { name: /^Ava$/ })).toBeInTheDocument();
    expect((await store.listProfiles())[0].state.currentSubstep).toBe('1.1');
  });
```

Append to `tests/ui/parent.test.tsx`:

```tsx
  it('can move the child by running the placement check', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    const profile = { id: 'p1', name: 'Sam', color: 'sky', createdAt: 'd', state: { ...initialState('1.1'), sessionsCompleted: 4 } };
    await store.saveProfile(profile);
    renderWithServices(<ParentArea profile={profile} onBack={vi.fn()} />, { store, content: twoSubsteps });
    await user.click(await screen.findByRole('button', { name: /placement check/i }));
    await user.click(screen.getByRole('button', { name: /begin/i }));
    for (let i = 0; i < 8; i++) await user.click(screen.getByRole('button', { name: /got it/i }));
    await user.selectOptions(await screen.findByLabelText(/start at/i), '1.2');
    await user.click(screen.getByRole('button', { name: /use this/i }));
    await waitFor(async () => expect((await store.listProfiles())[0].state.currentSubstep).toBe('1.2'));
    expect((await store.listProfiles())[0].state.substepEnteredAt).toBe(4);
    expect(await screen.findByText(/grown-up area/i)).toBeInTheDocument();
  });
```

Run both files; expected: FAIL (no such buttons).

In `src/ui/screens/Home.tsx`: add `import { PlacementScreen } from './PlacementScreen';`, a state `const [placing, setPlacing] = useState(false);`, extract profile creation into a function:

```tsx
  const create = async (substep: string) => {
    if (!name.trim()) return;
    const p: Profile = { id: newId(), name: name.trim(), color, createdAt: new Date().toISOString(), state: initialState(substep) };
    try {
      setError(null);
      await store.saveProfile(p);
      setProfiles(await store.listProfiles());
      setName('');
      setAdding(false);
      setPlacing(false);
    } catch {
      setError("We couldn't save that. Try again.");
      setPlacing(false);
    }
  };
  const save = (e: FormEvent) => { e.preventDefault(); create(start); };
```

Render, before the normal `.screen` return:

```tsx
  if (placing) {
    return (
      <div className="screen">
        <div className="topbar"><span>New child: {name.trim()}</span></div>
        <PlacementScreen onDone={create} onCancel={() => setPlacing(false)} />
      </div>
    );
  }
```

Inside the add form, under the "Start at" select and its caption:

```tsx
            <BigButton variant="quiet" onClick={() => setPlacing(true)} disabled={!name.trim()}>Find the starting point with a short check</BigButton>
```

Check `BigButton` accepts `disabled` (it is used with `disabled` in `SessionRunner`, so it does).

In `src/ui/screens/ParentArea.tsx`: add `import { PlacementScreen } from './PlacementScreen';`, state `const [view, setView] = useState<'main' | 'placement'>('main');`, a handler:

```tsx
  const placed = async (substepId: string) => {
    try {
      const next = { ...profile, state: moveTo(profile.state, substepId) };
      await store.saveProfile(next);
      setProfile(next);
      setTarget(substepId);
      setNote(`Moved to ${substepId} after the placement check. The next session starts with its lesson.`);
    } catch {
      setNote("We couldn't save that. Try again.");
    }
    setView('main');
  };
```

and, before the main return:

```tsx
  if (view === 'placement') {
    return (
      <div className="screen">
        <div className="topbar"><span>Grown-up area: {profile.name}</span></div>
        <PlacementScreen onDone={placed} onCancel={() => setView('main')} />
      </div>
    );
  }
```

Add a "Tools" card under the move form:

```tsx
        <div className="card">
          <h2>Tools</h2>
          <div className="row">
            <BigButton variant="quiet" onClick={() => setView('placement')}>Run the placement check</BigButton>
          </div>
        </div>
```

- [ ] **Step 8: Run everything, type check, commit**

Run: `npm test && npm run typecheck`
Expected: all pass, including the existing e2e helper's assumption that the "Start at" select still exists on the add form.

```bash
git add src/engine/progression.ts src/ui/screens/PlacementScreen.tsx src/ui/screens/Home.tsx src/ui/screens/ParentArea.tsx src/ui/styles.css tests/engine/progression.test.ts tests/ui/placement.test.tsx tests/ui/home.test.tsx tests/ui/parent.test.tsx
git commit -m "Add the placement check a grown-up runs with the child, from the add-child form and the grown-up area

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Recording sounds

**Files:**
- Modify: `src/audio/types.ts`, `src/audio/fake.ts`
- Create: `src/audio/recorder.ts`, `src/ui/screens/RecordScreen.tsx`
- Modify: `src/ui/services.tsx`, `src/main.tsx`, `src/ui/screens/ParentArea.tsx`, `tests/ui/helpers.tsx`, `src/ui/styles.css`
- Test: `tests/audio/fake.test.ts`, `tests/ui/record.test.tsx`, `tests/ui/parent.test.tsx`

**Interfaces:**
- Consumes: `Store.saveClip`, `Store.listClipIds`, `AudioPlayer.playCard`.
- Produces: `interface Recorder { supported(): boolean; start(): Promise<void>; stop(): Promise<Blob> }` in `src/audio/types.ts`; `BrowserRecorder` in `src/audio/recorder.ts`; `FakeRecorder` in `src/audio/fake.ts` with `starts: number` and `stops: number`; `Services.recorder: Recorder`; `RecordScreen` with props `{ onBack: () => void }`.

- [ ] **Step 1: Write the failing tests**

Append to `tests/audio/fake.test.ts`:

```ts
import { FakeRecorder } from '../../src/audio/fake';

describe('FakeRecorder', () => {
  it('counts starts and stops and returns a small audio blob', async () => {
    const r = new FakeRecorder();
    expect(r.supported()).toBe(true);
    await r.start();
    const blob = await r.stop();
    expect(blob.size).toBeGreaterThan(0);
    expect(blob.type).toBe('audio/webm');
    expect(r.starts).toBe(1);
    expect(r.stops).toBe(1);
  });
});
```

Create `tests/ui/record.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecordScreen } from '../../src/ui/screens/RecordScreen';
import { MemoryStore } from '../../src/store/memory';
import { FakeAudio, FakeRecorder } from '../../src/audio/fake';
import { renderWithServices } from './helpers';

describe('RecordScreen', () => {
  it('records a clip for a card, saves it, and can play it back', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    const audio = new FakeAudio();
    const recorder = new FakeRecorder();
    renderWithServices(<RecordScreen onBack={() => {}} />, { store, audio, recorder });

    const row = await screen.findByTestId('card-row-sh');
    expect(within(row).getByText(/not recorded/i)).toBeInTheDocument();
    await user.click(within(row).getByRole('button', { name: /record/i }));
    expect(recorder.starts).toBe(1);
    await user.click(within(row).getByRole('button', { name: /stop/i }));
    await waitFor(() => expect(within(row).getByText(/^recorded$/i)).toBeInTheDocument());
    expect(await store.listClipIds()).toEqual(['sh']);

    await user.click(within(row).getByRole('button', { name: /play/i }));
    expect(audio.played).toContain('sh');
  });

  it('explains when recording is not possible on this browser', async () => {
    class NoRecorder extends FakeRecorder { supported() { return false; } }
    renderWithServices(<RecordScreen onBack={() => {}} />, { recorder: new NoRecorder() });
    expect(await screen.findByText(/can't record/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^record/i })).toBeNull();
  });

  it('says so when the microphone cannot be used', async () => {
    const user = userEvent.setup();
    class DeniedRecorder extends FakeRecorder { async start() { throw new Error('denied'); } }
    renderWithServices(<RecordScreen onBack={() => {}} />, { recorder: new DeniedRecorder() });
    const row = await screen.findByTestId('card-row-f');
    await user.click(within(row).getByRole('button', { name: /record/i }));
    expect(await screen.findByText(/couldn't use the microphone/i)).toBeInTheDocument();
  });

  it('goes back', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    renderWithServices(<RecordScreen onBack={onBack} />);
    await user.click(await screen.findByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalled();
  });
});
```

Append to `tests/ui/parent.test.tsx`:

```tsx
  it('opens the recording page from the tools', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    const profile = { id: 'p1', name: 'Sam', color: 'sky', createdAt: 'd', state: initialState('1.1') };
    await store.saveProfile(profile);
    renderWithServices(<ParentArea profile={profile} onBack={vi.fn()} />, { store, content: twoSubsteps });
    await user.click(await screen.findByRole('button', { name: /record sounds/i }));
    expect(await screen.findByText(/record the sounds/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(await screen.findByText(/grown-up area/i)).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run to see them fail**

Run: `npx vitest run tests/audio/fake.test.ts tests/ui/record.test.tsx tests/ui/parent.test.tsx`
Expected: FAIL (`FakeRecorder` missing, `RecordScreen` missing, `recorder` not a Services field).

- [ ] **Step 3: Implement the interface, fake and browser recorder**

`src/audio/types.ts` add:

```ts
export interface Recorder {
  /** False when this browser has no microphone recording support. */
  supported(): boolean;
  /** Asks for the microphone on first use and starts recording. Rejects if the microphone is refused. */
  start(): Promise<void>;
  /** Stops and resolves with the recorded audio. */
  stop(): Promise<Blob>;
}
```

`src/audio/fake.ts` add:

```ts
import type { AudioPlayer, Recorder } from './types';

export class FakeRecorder implements Recorder {
  starts = 0;
  stops = 0;
  supported() { return true; }
  async start() { this.starts++; }
  async stop() { this.stops++; return new Blob(['fake'], { type: 'audio/webm' }); }
}
```

Create `src/audio/recorder.ts`:

```ts
import type { Recorder } from './types';

export class BrowserRecorder implements Recorder {
  private rec: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];

  supported() {
    return typeof MediaRecorder !== 'undefined' && typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
  }

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.chunks = [];
    this.rec = new MediaRecorder(this.stream);
    this.rec.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.rec.start();
  }

  stop() {
    return new Promise<Blob>((resolve, reject) => {
      const rec = this.rec;
      if (!rec) return reject(new Error('not recording'));
      rec.onstop = () => {
        const type = rec.mimeType || 'audio/mp4';
        this.stream?.getTracks().forEach((t) => t.stop());
        this.stream = null;
        this.rec = null;
        resolve(new Blob(this.chunks, { type }));
      };
      rec.stop();
    });
  }
}
```

`src/ui/services.tsx`: add `import type { AudioPlayer, Recorder } from '../audio/types';` (replace the existing AudioPlayer import) and `recorder: Recorder;` to `Services`. `src/main.tsx`: `import { BrowserRecorder } from './audio/recorder';` and `recorder: new BrowserRecorder(),` in the services object. `tests/ui/helpers.tsx`: import `FakeRecorder` and add `recorder: new FakeRecorder(),` to `makeServices`.

- [ ] **Step 4: Write the screen**

Create `src/ui/screens/RecordScreen.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { useServices } from '../services';
import { cardTypeFor } from '../tiles';
import { Tile } from '../components/Tile';
import { BigButton } from '../components/BigButton';

interface Props {
  onBack: () => void;
}

/** One row per sound card. A grown-up records the sound in their own voice; the app then uses
 * that clip instead of the computer voice wherever the card is played (spec 6). */
export function RecordScreen({ onBack }: Props) {
  const { content, store, audio, recorder } = useServices();
  const [recorded, setRecorded] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<string | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    store.listClipIds().then((ids) => setRecorded(new Set(ids)), () => setNote("We couldn't read the saved recordings."));
  }, [store]);

  const start = async (id: string) => {
    if (active) return;
    setNote('');
    try {
      await recorder.start();
      setActive(id);
    } catch {
      setNote("We couldn't use the microphone. Check that this app is allowed to use it, then try again.");
    }
  };

  const stop = async (id: string) => {
    if (active !== id) return;
    try {
      const blob = await recorder.stop();
      await store.saveClip(id, blob);
      setRecorded((r) => new Set([...r, id]));
    } catch {
      setNote("We couldn't save that recording. Try again.");
    } finally {
      setActive(null);
    }
  };

  return (
    <div className="screen">
      <div className="topbar">
        <span>Record the sounds</span>
        <BigButton variant="quiet" onClick={onBack} disabled={active !== null}>Back</BigButton>
      </div>
      <div className="stage">
        <p className="caption">Tap Record, say the sound once, clearly, then tap Stop. Say the sound, not the letter name: "mmm", not "em". You can play it back and record again any time.</p>
        {!recorder.supported() && <p className="caption">This browser can't record. The computer voice will be used instead.</p>}
        {note && <p className="caption">{note}</p>}
        <ul className="cardlist">
          {content.cards.map((c) => {
            const isActive = active === c.id;
            return (
              <li key={c.id} className="cardrow" data-testid={`card-row-${c.id}`}>
                <Tile grapheme={c.grapheme} type={cardTypeFor(content.cards, c.grapheme)} />
                <span className="cardrow-keyword">{c.keyword}</span>
                <span className="cardrow-status">{recorded.has(c.id) ? 'Recorded' : 'Not recorded'}</span>
                <div className="row">
                  {recorder.supported() && !isActive && <BigButton variant="quiet" onClick={() => start(c.id)} disabled={active !== null}>Record</BigButton>}
                  {isActive && <BigButton onClick={() => stop(c.id)}>Stop</BigButton>}
                  {recorded.has(c.id) && <BigButton variant="quiet" onClick={() => audio.playCard(c.id)} disabled={active !== null}>Play</BigButton>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
```

Append to `src/ui/styles.css`:

```css
.cardlist { list-style: none; padding: 0; margin: 0; width: 100%; max-width: 760px; display: flex; flex-direction: column; gap: 12px; }
.cardrow { display: grid; grid-template-columns: auto 1fr auto auto; gap: 16px; align-items: center; padding: 8px 12px; background: var(--quiet); border-radius: var(--radius); }
.cardrow-keyword { color: var(--muted); }
.cardrow-status { font-size: 16px; color: var(--muted); }
@media (max-width: 600px) { .cardrow { grid-template-columns: auto 1fr; } }
```

In `src/ui/screens/ParentArea.tsx`: extend the view state to `'main' | 'placement' | 'record'`, import `RecordScreen`, render `if (view === 'record') return <RecordScreen onBack={() => setView('main')} />;`, and add `<BigButton variant="quiet" onClick={() => setView('record')}>Record sounds</BigButton>` to the Tools row.

- [ ] **Step 5: Run all tests, type check, commit**

Run: `npm test && npm run typecheck`

```bash
git add src/audio src/ui/screens/RecordScreen.tsx src/ui/screens/ParentArea.tsx src/ui/services.tsx src/main.tsx src/ui/styles.css tests/audio/fake.test.ts tests/ui/record.test.tsx tests/ui/parent.test.tsx tests/ui/helpers.tsx
git commit -m "Let a grown-up record each sound in their own voice

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Backup file: create, parse, restore

**Files:**
- Modify: `src/store/types.ts`, `src/store/idb.ts`, `src/store/memory.ts`
- Create: `src/store/backup.ts`
- Test: `tests/store/contract.ts`, `tests/store/backup.test.ts`

**Interfaces:**
- Consumes: `Store` and `Profile` from `src/store/types.ts`; `SessionLog` from `src/engine/types.ts`.
- Produces: `Store.setLogs(profileId: string, logs: SessionLog[]): Promise<void>` and `Store.clearAll(): Promise<void>`; in `src/store/backup.ts`: `interface BackupFile { app: 'tapwords'; version: 1; createdAt: string; profiles: { profile: Profile; logs: SessionLog[] }[]; clips: { cardId: string; type: string; base64: string }[] }`, `createBackup(store): Promise<BackupFile>`, `parseBackup(text: string): BackupFile` (throws `Error('This file is not a Tapwords backup.')`), `restoreBackup(store, backup, mode: 'replace' | 'merge'): Promise<number>` (returns the number of profiles written), `blobToBase64(blob): Promise<string>`, `base64ToBlob(base64, type): Blob`, and `backupFileName(date?: Date): string` returning `tapwords-backup-YYYY-MM-DD.json`.

- [ ] **Step 1: Write the failing tests**

Append to `tests/store/contract.ts` inside `storeContract`:

```ts
  it('replaces a profile\'s logs wholesale with setLogs', async () => {
    const s = make();
    await s.saveProfile(profile('p1'));
    const l = (n: number) => ({ sessionNumber: n, date: 'd', substep: '1.1', complete: true, readAloudDone: false, responses: [] });
    await s.appendLog('p1', l(1));
    await s.setLogs('p1', [l(5), l(4)]);
    expect((await s.listLogs('p1')).map((x) => x.sessionNumber)).toEqual([4, 5]);
  });

  it('clearAll removes profiles, logs and clips', async () => {
    const s = make();
    await s.saveProfile(profile('p1'));
    await s.appendLog('p1', { sessionNumber: 1, date: 'd', substep: '1.1', complete: true, readAloudDone: false, responses: [] });
    await s.saveClip('a', new Blob(['x'], { type: 'audio/webm' }));
    await s.clearAll();
    expect(await s.listProfiles()).toEqual([]);
    expect(await s.listLogs('p1')).toEqual([]);
    expect(await s.listClipIds()).toEqual([]);
  });
```

Create `tests/store/backup.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { MemoryStore } from '../../src/store/memory';
import { initialState } from '../../src/engine/types';
import { backupFileName, base64ToBlob, blobToBase64, createBackup, parseBackup, restoreBackup } from '../../src/store/backup';
import type { Profile } from '../../src/store/types';

const profile = (id: string, name: string): Profile => ({ id, name, color: 'sky', createdAt: '2026-09-12T00:00:00Z', state: { ...initialState('1.1'), sessionsCompleted: 2 } });
const log = (n: number) => ({ sessionNumber: n, date: 'd', substep: '1.1', complete: true, readAloudDone: false, responses: [] });

async function seeded() {
  const s = new MemoryStore();
  await s.saveProfile(profile('p1', 'Sam'));
  await s.saveProfile(profile('p2', 'Ava'));
  await s.appendLog('p1', log(1));
  await s.appendLog('p1', log(2));
  await s.saveClip('m', new Blob([new Uint8Array([1, 2, 3, 250])], { type: 'audio/webm' }));
  return s;
}

describe('base64 helpers', () => {
  it('round-trips binary data', async () => {
    const bytes = new Uint8Array([0, 1, 2, 127, 128, 255]);
    const b64 = await blobToBase64(new Blob([bytes], { type: 'audio/mp4' }));
    const back = base64ToBlob(b64, 'audio/mp4');
    expect(back.type).toBe('audio/mp4');
    expect(new Uint8Array(await back.arrayBuffer())).toEqual(bytes);
  });
});

describe('backup', () => {
  it('captures every profile, its logs, and every clip', async () => {
    const b = await createBackup(await seeded());
    expect(b.app).toBe('tapwords');
    expect(b.version).toBe(1);
    expect(b.profiles.map((p) => p.profile.name).sort()).toEqual(['Ava', 'Sam']);
    expect(b.profiles.find((p) => p.profile.id === 'p1')?.logs.map((l) => l.sessionNumber)).toEqual([1, 2]);
    expect(b.clips.map((c) => c.cardId)).toEqual(['m']);
  });

  it('serialises to JSON text and parses back', async () => {
    const b = await createBackup(await seeded());
    const text = JSON.stringify(b);
    expect(parseBackup(text)).toEqual(b);
  });

  it('rejects text that is not a backup', () => {
    expect(() => parseBackup('not json')).toThrow(/not a Tapwords backup/);
    expect(() => parseBackup(JSON.stringify({ app: 'other' }))).toThrow(/not a Tapwords backup/);
    expect(() => parseBackup(JSON.stringify({ app: 'tapwords', version: 1, profiles: 'nope', clips: [] }))).toThrow(/not a Tapwords backup/);
  });

  it('replace mode wipes the device first', async () => {
    const b = await createBackup(await seeded());
    const target = new MemoryStore();
    await target.saveProfile(profile('p9', 'Old'));
    await target.saveClip('z', new Blob(['z'], { type: 'audio/webm' }));
    const n = await restoreBackup(target, b, 'replace');
    expect(n).toBe(2);
    expect((await target.listProfiles()).map((p) => p.id).sort()).toEqual(['p1', 'p2']);
    expect((await target.listLogs('p1')).length).toBe(2);
    expect(await target.listClipIds()).toEqual(['m']);
    expect((await target.getClip('m'))?.size).toBe(4);
  });

  it('merge mode keeps other profiles and overwrites matching ids', async () => {
    const b = await createBackup(await seeded());
    const target = new MemoryStore();
    await target.saveProfile(profile('p9', 'Old'));
    await target.saveProfile({ ...profile('p1', 'Sam on this device'), state: initialState('1.1') });
    await target.appendLog('p1', log(7));
    await restoreBackup(target, b, 'merge');
    const ids = (await target.listProfiles()).map((p) => p.id).sort();
    expect(ids).toEqual(['p1', 'p2', 'p9']);
    expect((await target.listProfiles()).find((p) => p.id === 'p1')?.name).toBe('Sam');
    expect((await target.listLogs('p1')).map((l) => l.sessionNumber)).toEqual([1, 2]);
  });

  it('names the file by date', () => {
    expect(backupFileName(new Date('2026-09-13T15:00:00Z'))).toMatch(/^tapwords-backup-2026-09-1[34]\.json$/);
  });
});
```

- [ ] **Step 2: Run to see them fail**

Run: `npx vitest run tests/store tests/store/backup.test.ts`
Expected: FAIL (`setLogs`/`clearAll` not functions; backup module missing).

- [ ] **Step 3: Extend the stores**

`src/store/types.ts` add to `Store`:

```ts
  /** Replace every log for a profile (used by restore). */
  setLogs(profileId: string, logs: SessionLog[]): Promise<void>;
  /** Remove every profile, log and clip on this device. */
  clearAll(): Promise<void>;
```

`src/store/memory.ts` add:

```ts
  async setLogs(profileId: string, logs: SessionLog[]) { this.logs.set(profileId, logs.map((l) => structuredClone(l))); }
  async clearAll() { this.profiles.clear(); this.logs.clear(); this.clips.clear(); }
```

`src/store/idb.ts`: import `clear` from `idb-keyval` and add:

```ts
  async setLogs(profileId: string, logs: SessionLog[]) {
    return this.serial(async () => {
      await set(logsKey(profileId), [...logs], this.db);
    });
  }
  async clearAll() {
    return this.serial(async () => {
      await clear(this.db);
    });
  }
```

Run: `npx vitest run tests/store` — the contract tests for both stores pass.

- [ ] **Step 4: Write the backup module**

Create `src/store/backup.ts`:

```ts
import type { SessionLog } from '../engine/types';
import type { Profile, Store } from './types';

export interface BackupFile {
  app: 'tapwords';
  version: 1;
  createdAt: string;
  profiles: { profile: Profile; logs: SessionLog[] }[];
  clips: { cardId: string; type: string; base64: string }[];
}

export const NOT_A_BACKUP = 'This file is not a Tapwords backup.';

export async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}

export function base64ToBlob(base64: string, type: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type });
}

export function backupFileName(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `tapwords-backup-${y}-${m}-${d}.json`;
}

export async function createBackup(store: Store): Promise<BackupFile> {
  const profiles = await store.listProfiles();
  const withLogs = await Promise.all(profiles.map(async (profile) => ({ profile, logs: await store.listLogs(profile.id) })));
  const clipIds = await store.listClipIds();
  const clips: BackupFile['clips'] = [];
  for (const cardId of clipIds) {
    const blob = await store.getClip(cardId);
    if (blob) clips.push({ cardId, type: blob.type || 'audio/mp4', base64: await blobToBase64(blob) });
  }
  return { app: 'tapwords', version: 1, createdAt: new Date().toISOString(), profiles: withLogs, clips };
}

const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null;

function isProfile(x: unknown): x is Profile {
  return isRecord(x) && typeof x.id === 'string' && typeof x.name === 'string' && isRecord(x.state) && typeof x.state.currentSubstep === 'string';
}

export function parseBackup(text: string): BackupFile {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error(NOT_A_BACKUP);
  }
  if (!isRecord(raw) || raw.app !== 'tapwords' || raw.version !== 1 || !Array.isArray(raw.profiles) || !Array.isArray(raw.clips)) throw new Error(NOT_A_BACKUP);
  for (const entry of raw.profiles) {
    if (!isRecord(entry) || !isProfile(entry.profile) || !Array.isArray(entry.logs)) throw new Error(NOT_A_BACKUP);
  }
  for (const clip of raw.clips) {
    if (!isRecord(clip) || typeof clip.cardId !== 'string' || typeof clip.base64 !== 'string' || typeof clip.type !== 'string') throw new Error(NOT_A_BACKUP);
  }
  return raw as unknown as BackupFile;
}

/** Writes the backup into the store. `replace` wipes the device first; `merge` keeps profiles the
 * backup does not mention and overwrites any profile whose id it does. Returns how many profiles were written. */
export async function restoreBackup(store: Store, backup: BackupFile, mode: 'replace' | 'merge'): Promise<number> {
  if (mode === 'replace') await store.clearAll();
  for (const { profile, logs } of backup.profiles) {
    await store.saveProfile(profile);
    await store.setLogs(profile.id, logs);
  }
  for (const clip of backup.clips) await store.saveClip(clip.cardId, base64ToBlob(clip.base64, clip.type));
  return backup.profiles.length;
}
```

- [ ] **Step 5: Run all tests, type check, commit**

Run: `npm test && npm run typecheck`

```bash
git add src/store tests/store
git commit -m "Add backup files: everything on the device in one JSON file, restored by replace or merge

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Backup and restore on screen, and recovery from damaged data

**Files:**
- Create: `src/ui/files.ts`, `src/ui/screens/BackupPanel.tsx`
- Modify: `src/store/types.ts`, `src/store/idb.ts`, `src/ui/services.tsx`, `src/main.tsx`, `tests/ui/helpers.tsx`, `src/ui/screens/ParentArea.tsx`, `src/ui/screens/Home.tsx`, `src/ui/styles.css`
- Test: `tests/ui/backup.test.tsx`, `tests/ui/home.test.tsx`, `tests/store/idb.test.ts`

**Interfaces:**
- Consumes: `createBackup`, `parseBackup`, `restoreBackup`, `backupFileName` from `src/store/backup.ts`; `HoldButton` from `src/ui/components/HoldButton.tsx` (prop `onHold`).
- Produces: `class CorruptDataError extends Error` in `src/store/types.ts`; `Services.saveFile: (name: string, text: string) => Promise<void>`; `saveTextFile(name, text)` in `src/ui/files.ts`; `BackupPanel` with props `{ onRestored?: () => void; restoreOnly?: boolean }`.

- [ ] **Step 1: Write the failing tests**

Create `tests/ui/backup.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BackupPanel } from '../../src/ui/screens/BackupPanel';
import { MemoryStore } from '../../src/store/memory';
import { initialState } from '../../src/engine/types';
import { createBackup } from '../../src/store/backup';
import { renderWithServices } from './helpers';

const profile = (id: string, name: string) => ({ id, name, color: 'sky', createdAt: 'd', state: initialState('1.1') });

describe('BackupPanel', () => {
  it('hands a backup file to saveFile', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    await store.saveProfile(profile('p1', 'Sam'));
    const saveFile = vi.fn(async () => {});
    renderWithServices(<BackupPanel />, { store, saveFile });
    await user.click(screen.getByRole('button', { name: /back up/i }));
    await waitFor(() => expect(saveFile).toHaveBeenCalled());
    const [name, text] = saveFile.mock.calls[0] as unknown as [string, string];
    expect(name).toMatch(/^tapwords-backup-\d{4}-\d{2}-\d{2}\.json$/);
    expect(JSON.parse(text).profiles[0].profile.name).toBe('Sam');
    expect(await screen.findByText(/backup saved/i)).toBeInTheDocument();
  });

  it('restores a chosen file after asking replace or add', async () => {
    const user = userEvent.setup();
    const source = new MemoryStore();
    await source.saveProfile(profile('p1', 'Sam'));
    const text = JSON.stringify(await createBackup(source));
    const target = new MemoryStore();
    await target.saveProfile(profile('p9', 'Old'));
    const onRestored = vi.fn();
    renderWithServices(<BackupPanel onRestored={onRestored} />, { store: target });

    const file = new File([text], 'tapwords-backup.json', { type: 'application/json' });
    await user.upload(screen.getByLabelText(/restore from a backup/i), file);
    await user.click(await screen.findByRole('button', { name: /add to what is here/i }));
    await waitFor(() => expect(onRestored).toHaveBeenCalled());
    expect((await target.listProfiles()).map((p) => p.name).sort()).toEqual(['Old', 'Sam']);
    expect(await screen.findByText(/restored 1 child/i)).toBeInTheDocument();
  });

  it('replace mode removes what was there', async () => {
    const user = userEvent.setup();
    const source = new MemoryStore();
    await source.saveProfile(profile('p1', 'Sam'));
    const text = JSON.stringify(await createBackup(source));
    const target = new MemoryStore();
    await target.saveProfile(profile('p9', 'Old'));
    renderWithServices(<BackupPanel />, { store: target });
    await user.upload(screen.getByLabelText(/restore from a backup/i), new File([text], 'b.json', { type: 'application/json' }));
    await user.click(await screen.findByRole('button', { name: /replace everything/i }));
    await waitFor(async () => expect((await target.listProfiles()).map((p) => p.name)).toEqual(['Sam']));
  });

  it('refuses a file that is not a backup', async () => {
    const user = userEvent.setup();
    renderWithServices(<BackupPanel />);
    await user.upload(screen.getByLabelText(/restore from a backup/i), new File(['hello'], 'x.json', { type: 'application/json' }));
    expect(await screen.findByText(/not a Tapwords backup/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /replace everything/i })).toBeNull();
  });

  it('in restore-only mode offers only replace', async () => {
    const user = userEvent.setup();
    const source = new MemoryStore();
    await source.saveProfile(profile('p1', 'Sam'));
    const text = JSON.stringify(await createBackup(source));
    renderWithServices(<BackupPanel restoreOnly />);
    expect(screen.queryByRole('button', { name: /back up/i })).toBeNull();
    await user.upload(screen.getByLabelText(/restore from a backup/i), new File([text], 'b.json', { type: 'application/json' }));
    expect(await screen.findByRole('button', { name: /replace everything/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add to what is here/i })).toBeNull();
  });
});
```

Append to `tests/ui/home.test.tsx`:

```tsx
  it('offers restore or a fresh start when the saved data is damaged', async () => {
    const user = userEvent.setup();
    let broken = true;
    class CorruptStore extends MemoryStore {
      async listProfiles() {
        if (broken) throw new CorruptDataError();
        return super.listProfiles();
      }
      async clearAll() { broken = false; await super.clearAll(); }
    }
    const store = new CorruptStore();
    renderWithServices(<Home onStart={() => {}} onParent={() => {}} />, { store });
    expect(await screen.findByText(/saved data on this device is damaged/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/restore from a backup/i)).toBeInTheDocument();
    const fresh = screen.getByRole('button', { name: /start fresh/i });
    await user.pointer([{ keys: '[MouseLeft>]', target: fresh }]);
    await new Promise((r) => setTimeout(r, 1700));
    await user.pointer([{ keys: '[/MouseLeft]', target: fresh }]);
    expect(await screen.findByText(/add a child to get started/i)).toBeInTheDocument();
  });

  it('shows a restore control on the home screen', async () => {
    renderWithServices(<Home onStart={() => {}} onParent={() => {}} />);
    expect(await screen.findByLabelText(/restore from a backup/i)).toBeInTheDocument();
  });
```

Add `import { CorruptDataError } from '../../src/store/types';` to the home test imports. Check how `tests/ui/holdbutton.test.tsx` triggers a hold (it may use fake timers or `pointer` events) and copy that exact approach for the "Start fresh" hold rather than the sleep above if the existing test does it differently.

Append to `tests/store/idb.test.ts`:

```ts
  it('reports damaged profile data instead of returning it', async () => {
    const name = `tapwords-test-${Math.random()}`;
    const { createStore, set } = await import('idb-keyval');
    await set('profiles', { nope: true }, createStore(name, 'kv'));
    const s = new IdbStore(name);
    await expect(s.listProfiles()).rejects.toBeInstanceOf(CorruptDataError);
  });
```

with `import { CorruptDataError } from '../../src/store/types';` (check how the existing idb test names its database and imports `IdbStore`; match it).

- [ ] **Step 2: Run to see them fail**

Run: `npx vitest run tests/ui/backup.test.tsx tests/ui/home.test.tsx tests/store/idb.test.ts`
Expected: FAIL (missing module, missing error class, missing UI).

- [ ] **Step 3: Corrupt-data detection and the file helper**

`src/store/types.ts` add:

```ts
export class CorruptDataError extends Error {
  constructor() {
    super('The saved data on this device is damaged.');
    this.name = 'CorruptDataError';
  }
}
```

`src/store/idb.ts`: import `CorruptDataError` and replace `listProfiles`:

```ts
  async listProfiles() {
    const raw = await get<unknown>(PROFILES, this.db);
    if (raw === undefined) return [];
    const ok = Array.isArray(raw) && raw.every((p) => typeof p === 'object' && p !== null && typeof (p as Profile).id === 'string' && typeof (p as Profile).name === 'string' && typeof (p as Profile).state?.currentSubstep === 'string');
    if (!ok) throw new CorruptDataError();
    return raw as Profile[];
  }
```

Create `src/ui/files.ts`:

```ts
/** Hands a text file to the person: the share sheet where there is one (iPad), otherwise a download. */
export async function saveTextFile(name: string, text: string): Promise<void> {
  const blob = new Blob([text], { type: 'application/json' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (typeof File !== 'undefined' && nav.share && nav.canShare) {
    const file = new File([blob], name, { type: 'application/json' });
    if (nav.canShare({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: name });
        return;
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
      }
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
```

`src/ui/services.tsx`: add `saveFile: (name: string, text: string) => Promise<void>;` to `Services`. `src/main.tsx`: `import { saveTextFile } from './ui/files';` and `saveFile: saveTextFile,`. `tests/ui/helpers.tsx`: `saveFile: async () => {},` in `makeServices`.

- [ ] **Step 4: The panel**

Create `src/ui/screens/BackupPanel.tsx`:

```tsx
import { useRef, useState, type ChangeEvent } from 'react';
import { backupFileName, createBackup, parseBackup, restoreBackup, type BackupFile } from '../../store/backup';
import { useServices } from '../services';
import { BigButton } from '../components/BigButton';

interface Props {
  /** Called after a successful restore so the parent screen can reload. */
  onRestored?: () => void;
  /** Hide the back-up button and only offer "replace" (used on the damaged-data screen). */
  restoreOnly?: boolean;
}

export function BackupPanel({ onRestored, restoreOnly = false }: Props) {
  const { store, saveFile } = useServices();
  const [note, setNote] = useState('');
  const [pending, setPending] = useState<BackupFile | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const backUp = async () => {
    setBusy(true);
    setNote('');
    try {
      const b = await createBackup(store);
      await saveFile(backupFileName(), JSON.stringify(b));
      setNote(`Backup saved: ${b.profiles.length} ${b.profiles.length === 1 ? 'child' : 'children'}. Keep the file somewhere safe.`);
    } catch {
      setNote("We couldn't make the backup. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const chose = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNote('');
    try {
      setPending(parseBackup(await file.text()));
    } catch (err) {
      setPending(null);
      setNote((err as Error).message || 'This file could not be read.');
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const restore = async (mode: 'replace' | 'merge') => {
    if (!pending) return;
    setBusy(true);
    try {
      const n = await restoreBackup(store, pending, mode);
      setNote(`Restored ${n} ${n === 1 ? 'child' : 'children'}.`);
      setPending(null);
      onRestored?.();
    } catch {
      setNote("We couldn't restore that. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card backup">
      {!restoreOnly && (
        <>
          <BigButton variant="quiet" onClick={backUp} disabled={busy}>Back up everything on this device</BigButton>
          <p className="caption">Makes one file with every child's progress and the recorded sounds. Save it to Files, iCloud, or email it to yourself.</p>
        </>
      )}
      <label className="filepick">
        Restore from a backup
        <input ref={inputRef} type="file" accept="application/json,.json" onChange={chose} disabled={busy} />
      </label>
      {pending && (
        <div className="card">
          <p className="caption">This backup holds {pending.profiles.length} {pending.profiles.length === 1 ? 'child' : 'children'} ({pending.profiles.map((p) => p.profile.name).join(', ')}), saved {new Date(pending.createdAt).toLocaleDateString()}.</p>
          <div className="row">
            <BigButton onClick={() => restore('replace')} disabled={busy}>Replace everything on this device</BigButton>
            {!restoreOnly && <BigButton variant="quiet" onClick={() => restore('merge')} disabled={busy}>Add to what is here</BigButton>}
            <BigButton variant="quiet" onClick={() => setPending(null)} disabled={busy}>Cancel</BigButton>
          </div>
        </div>
      )}
      {note && <p className="caption">{note}</p>}
    </div>
  );
}
```

Append to `src/ui/styles.css`:

```css
.backup { width: 100%; max-width: 700px; }
.filepick { display: flex; flex-direction: column; gap: 8px; }
.filepick input { font-size: 18px; min-height: 64px; }
```

`src/ui/screens/ParentArea.tsx`: import `BackupPanel` and render `<BackupPanel />` under the Tools card.

`src/ui/screens/Home.tsx`:
- import `CorruptDataError` from `../../store/types`, `BackupPanel` from `./BackupPanel`, `HoldButton` is already imported.
- add state `const [corrupt, setCorrupt] = useState(false);`
- in `load`: `store.listProfiles().then(setProfiles, (e) => { if (e instanceof CorruptDataError) setCorrupt(true); else setError("We couldn't open the saved children. Tap to try again."); });` and reset `setCorrupt(false)` at the start.
- before the placing/normal returns:

```tsx
  if (corrupt) {
    return (
      <div className="screen">
        <div className="stage">
          <h1>Tapwords</h1>
          <p className="caption">The saved data on this device is damaged, so we can't open the children. Restore from a backup file if you have one. Starting fresh removes the damaged data.</p>
          <BackupPanel restoreOnly onRestored={load} />
          <HoldButton onHold={() => store.clearAll().then(load, () => setError("We couldn't clear the data. Try again."))}>Start fresh (hold)</HoldButton>
          {error && <p className="caption">{error}</p>}
        </div>
      </div>
    );
  }
```

- in the profile list, after the "Add a child" button: `<BackupPanel onRestored={load} />`.

- [ ] **Step 5: Run all tests, type check, build, commit**

Run: `npm test && npm run typecheck && npm run build`

```bash
git add src/ui/files.ts src/ui/screens/BackupPanel.tsx src/ui/screens/Home.tsx src/ui/screens/ParentArea.tsx src/ui/services.tsx src/main.tsx src/ui/styles.css src/store/types.ts src/store/idb.ts tests/ui tests/store/idb.test.ts
git commit -m "Back up and restore from the grown-up area and the home screen, and recover from damaged data

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Content tasks

Each content task follows the **Content authoring recipe** above. The task gives: the file, the substep's fixed fields, the word territory, the sight words, the lesson outline, the story brief, and the test. The word lists below are seeds and boundaries, not complete banks; the author fills the bank to the counts in the recipe within the territory.

### Task 8: Substep 1.2

**Files:**
- Create: `src/content/substeps/s1-2.ts` exporting `SUBSTEP_1_2: Substep`
- Test: `tests/content/s1-2.test.ts`

**Fixed fields:** `id: '1.2'`, `title: 'New sounds, a few at a time'`. Concepts: `[]`. New sight words: `['to', 'has', 'his', 'was', 'I', 'you', 'as']`.

**Groups (five, in this order), each with its own lesson:**
1. `['b', 'sh', 'u']`
2. `['h', 'j', 'c', 'k', 'ck']`
3. `['e', 'v', 'w']`
4. `['x', 'y', 'z']`
5. `['ch', 'th', 'qu', 'wh']`

**Territory:** three-sound words only (two-sound allowed for a few like "up", "us", "ox", "ash"). Each group must add at least 6 real and 3 nonsense words that use one of its new cards and otherwise only earlier cards, so that the runtime pool at every group is big enough (the test checks this with `availableWords`). Do not use words ending in am, an, all, or ng/nk endings. Do not use ff/ll/ss/zz. Do not use words that are in 1.1's bank (`grep` `s1-1.ts`). Suggested words per group (use these; add more of the same shape):
1. bat, bad, bag, bit, big, bud, bug, rub, tub, sub, mud, sun, run, fun, nut, rug, dug, tug, up, us, ship, shop, shut, dish, fish, rush, bash; nonsense: bap, bup, sut, shup, shob, tud
2. hat, hit, hop, hug, hum, hut, jab, jog, jug, job, cab, cat, cod, cop, cot, cub, cup, cut, kid, kit, kick, sick, lick, pick, back, pack, sack, rock, sock, lock, duck, luck, tuck, dock, shack, shock; nonsense: hob, jit, kib, cug, tock, huck
3. bed, fed, led, red, wed, web, wet, pet, pen, ten, hen, jet, net, vet, let, leg, peg, beg, keg, win, wig, wag, vat, wish, shed; nonsense: veb, wug, vish, wep, fep
4. box, fox, six, mix, fix, wax, tax, ox, yes, yet, yak, yum, yap, zip, zap, zig, zag, yell (no: ll), zit; nonsense: yip, zot, zub, vox, yeb
5. chip, chop, chin, chat, much, such, rich, thin, thick, that, this, then, them, with, bath, path, moth, math, quit, quiz, quick, whip, whiz, when, which, chuck, check, thud, shush; nonsense: chib, thup, quib, whep, thock

(Group 4 note: "yell" is struck; it needs ll.)

**parentSummary:** name the new consonants, the two new vowels u and e, and the paired letters sh, ck, ch, th, qu, wh; give "bug" and "chip" as examples.

**Lesson outline per group:** say what the new cards are, `show` them, demonstrate `tap` on one word of that group, then three `try` words from that group. Group 1 taps "bug" and tries "tub", "ship", "sun"; group 2 taps "duck" and tries "hat", "jog", "kick"; group 3 taps "wet" and tries "bed", "van" is not allowed (an), use "vet", "wig"; group 4 taps "fox" and tries "six", "yes", "zip"; group 5 taps "chip" and tries "thin", "quit", "when".

**Sentences (8) and stories (2)** may use 1.1 words, 1.2 words, and sight words through 1.2. Because sentences are filtered per group at runtime, write at least two sentences and one story that use only group-1 cards plus 1.1 words (for example "The bug is in the tub." and a story about a bug in a tub), so a child on the first group still gets a story from this substep.

- [ ] **Step 1: Write the test**

Create `tests/content/s1-2.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent } from '../../src/content/check';
import { SUBSTEP_1_1 } from '../../src/content/substeps/s1-1';
import { SUBSTEP_1_2 } from '../../src/content/substeps/s1-2';
import { availableWords } from '../../src/engine/availability';
import { usableStories } from '../../src/engine/session';
import type { Content } from '../../src/content/types';

const content: Content = { cards: CARDS, substeps: [SUBSTEP_1_1, SUBSTEP_1_2] };

describe('substep 1.2 content', () => {
  it('passes the content checker with production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });

  it('teaches its cards in the five ordered groups', () => {
    expect(SUBSTEP_1_2.groups.map((g) => g.cards)).toEqual([
      ['b', 'sh', 'u'],
      ['h', 'j', 'c', 'k', 'ck'],
      ['e', 'v', 'w'],
      ['x', 'y', 'z'],
      ['ch', 'th', 'qu', 'wh'],
    ]);
  });

  it('has enough words and a readable story at every group', () => {
    let previousReal = 0;
    let previousNonsense = 0;
    SUBSTEP_1_2.groups.forEach((_, gi) => {
      const here = availableWords(content, '1.2', gi).filter((w) => w.substep === '1.2');
      const real = here.filter((w) => w.word.kind === 'real').length;
      const nonsense = here.filter((w) => w.word.kind === 'nonsense').length;
      expect(real - previousReal, `group ${gi + 1} real words`).toBeGreaterThanOrEqual(6);
      expect(nonsense - previousNonsense, `group ${gi + 1} nonsense words`).toBeGreaterThanOrEqual(3);
      previousReal = real;
      previousNonsense = nonsense;
      expect(usableStories(content, '1.2', gi).some((s) => s.substep === '1.2'), `group ${gi + 1} story`).toBe(true);
    });
  });

  it('keeps every word to three sounds or fewer', () => {
    for (const w of SUBSTEP_1_2.words) expect(w.parts.length, w.text).toBeLessThanOrEqual(3);
  });
});
```

- [ ] **Step 2: Run it to see it fail** — `npx vitest run tests/content/s1-2.test.ts` — Expected: FAIL, module not found.

- [ ] **Step 3: Write `src/content/substeps/s1-2.ts`** following the recipe and this task's specifics. Skeleton:

```ts
import type { Substep } from '../types';
import { cvc, cvcNonsense, word, nonsense } from '../build';

export const SUBSTEP_1_2: Substep = {
  id: '1.2',
  title: 'New sounds, a few at a time',
  parentSummary: '…',
  groups: [
    { cards: ['b', 'sh', 'u'], lesson: [ { say: '…' }, { show: ['b', 'sh', 'u'] }, { say: '…' }, { tap: 'bug' }, { try: 'tub' }, { try: 'ship' }, { try: 'sun' } ] },
    // four more groups
  ],
  concepts: [],
  sightWords: ['to', 'has', 'his', 'was', 'I', 'you', 'as'],
  words: [ cvc('bat'), /* … */ word('ship', 'sh,i,p'), word('duck', 'd,u,ck'), word('chip', 'ch,i,p'), /* … */ cvcNonsense('bap'), nonsense('shup', 'sh,u,p') /* … */ ],
  sentences: [ /* 8 */ ],
  stories: [ /* 2 */ ],
};
```

- [ ] **Step 4: Run the test and typecheck until green** — `npx vitest run tests/content/s1-2.test.ts && npm run typecheck`. Read every checker error; each names the substep, the word or sentence, and the rule.

- [ ] **Step 5: Commit**

```bash
git add src/content/substeps/s1-2.ts tests/content/s1-2.test.ts
git commit -m "Add substep 1.2 content: the remaining consonants, u and e, and the first digraphs

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Substep 1.3

**Files:** Create `src/content/substeps/s1-3.ts` exporting `SUBSTEP_1_3`; test `tests/content/s1-3.test.ts`.

**Fixed fields:** `id: '1.3'`, `title: 'Three sounds with digraphs'`, one group `{ cards: [], lesson: […] }` (no new cards; the checker allows an empty card list as long as there is one group). Concepts `[]`. New sight words: `['she', 'he', 'we', 'be', 'me', 'they', 'of']`.

**Territory:** three-sound real words and nonsense syllables that contain at least one digraph (sh, ch, th, wh, qu, ck) or mix the 1.2 consonants in new ways, none already used in 1.1 or 1.2 (grep both files). Seeds: wish (if not used in 1.2), shin, shot, shed (check), chum, chug, chap, chick, thug, moth (check), whim, whit, quip, quack, rash, mash, gash, hush, mush, gush, lush, posh, cash, dash, sash, rich (check), such (check), etch is not allowed (tch), tick, tock, neck, deck, peck, heck, wick, lock (check), pick (check), yuck, muck, puck, tuck (check), zap (check); nonsense: shom, chet, thip, whup, quen, vock, jeck, zish, yuth, wush, quib (check), thock (check). Every real word must have at least one digraph or `ck`; the test enforces it.

**Lesson:** say that the paired letters make one sound and get one tap; show `['sh', 'ch', 'th', 'ck']`; tap "wish"; try "chick", "quack", "mush".

**Story brief:** a chick and a duck (only if "duck" is readable: it is in 1.2) at a pond; questions about who got wet.

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent } from '../../src/content/check';
import { SUBSTEP_1_1 } from '../../src/content/substeps/s1-1';
import { SUBSTEP_1_2 } from '../../src/content/substeps/s1-2';
import { SUBSTEP_1_3 } from '../../src/content/substeps/s1-3';
import type { Content } from '../../src/content/types';

const content: Content = { cards: CARDS, substeps: [SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3] };
const DIGRAPHS = new Set(['sh', 'ch', 'th', 'wh', 'qu', 'ck']);

describe('substep 1.3 content', () => {
  it('passes the content checker with production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });
  it('introduces no new cards and uses a digraph in every real word', () => {
    expect(SUBSTEP_1_3.groups.flatMap((g) => g.cards)).toEqual([]);
    for (const w of SUBSTEP_1_3.words) {
      expect(w.parts.length, w.text).toBeLessThanOrEqual(3);
      if (w.kind === 'real') expect(w.parts.some((p) => DIGRAPHS.has(p.grapheme)), w.text).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run to see it fail.** - [ ] **Step 3: Write the file.** - [ ] **Step 4: Run until green with typecheck.** - [ ] **Step 5: Commit** with message `Add substep 1.3 content: three-sound words built with digraphs`.

---

### Task 10: Substep 1.4

**Files:** Create `src/content/substeps/s1-4.ts` exporting `SUBSTEP_1_4`; test `tests/content/s1-4.test.ts`.

**Fixed fields:** `id: '1.4'`, `title: 'Double letters ff, ll, ss, and all'`, one group `{ cards: ['all'], lesson }`. Concepts: `['doubling']`. New sight words: `['for', 'or', 'said', 'one']`.

**Territory:** words ending in ff, ll, ss, zz (tapped as one part, e.g. `word('off', 'o,ff:f')`, `word('bill', 'b,i,ll:l')`) and words with the welded `all` (`word('ball', 'b,all')`). Seeds: off, cuff, puff, huff, muff, bill, fill, hill, pill, will, mill, dull, gull, hull, bell, fell, sell, tell, well, yell, shell, doll, kiss, miss, hiss, boss, moss, toss, loss, mess, less, fuss, pass, fizz, buzz, jazz, ball, call, fall, hall, mall, tall, wall; nonsense: zeff, biff, dall, gell, luss, voss, thill, chuff, wass, zall, hoff, quill is real (use as real).

**Lesson:** say that at the end of a short word, f, l, s and z are doubled but still make one sound; show `['ff', 'll', 'ss']`; tap "off"; try "bell", "miss"; say that a-l-l is a welded chunk said as "all"; show `['all']`; tap "ball"; try "tall".

**Story brief:** a doll that fell off a wall; questions about where it fell and who got it.

**Test:** same shape as Task 9's test with the imports for 1.1 to 1.4 and this assertion:

```ts
  it('uses a doubled letter or all in every real word', () => {
    for (const w of SUBSTEP_1_4.words.filter((w) => w.kind === 'real')) {
      expect(w.parts.some((p) => ['ff', 'll', 'ss', 'zz', 'all'].includes(p.grapheme)), w.text).toBe(true);
    }
    expect(SUBSTEP_1_4.concepts).toContain('doubling');
  });
```

Commit message: `Add substep 1.4 content: ff, ll, ss doubling and the welded all`.

---

### Task 11: Substep 1.5

**Files:** Create `src/content/substeps/s1-5.ts` exporting `SUBSTEP_1_5`; test `tests/content/s1-5.test.ts`.

**Fixed fields:** `id: '1.5'`, `title: 'The nose sounds am and an'`, one group `{ cards: ['am', 'an'], lesson }`. Concepts `[]`. New sight words: `['from', 'have', 'do', 'does']`.

**Territory:** every real word ends in the welded `am` or `an` (`word('ham', 'h,am')`). Seeds: ham, jam, ram, yam, dam, cam, bam, wham, sham, Sam, Pam, fan, man, pan, ran, tan, van, can, ban, than, Dan, Jan, Nan, chan is not a word (skip); nonsense: zam, vam, quam, tham, lan, gan, zan, shan, wan is a word ("wan"), fam, kan, jan is used (Jan), so use "yan". Proper names are allowed as real words; write them capitalised in `text` and use them capitalised in sentences (the tokenizer lowercases, so the checker still matches).

**Lesson:** say that when a or i comes before m or n the sound changes a bit, so we tap am and an as one chunk; show `['am', 'an']`; tap "ham"; try "fan", "jam", "van".

**Story brief:** Sam and Pam and a pan of jam.

**Test assertion:**

```ts
  it('ends every real word in the welded am or an', () => {
    for (const w of SUBSTEP_1_5.words.filter((w) => w.kind === 'real')) {
      expect(['am', 'an'], w.text).toContain(w.parts[w.parts.length - 1].grapheme);
    }
  });
```

Commit message: `Add substep 1.5 content: the welded am and an`.

---

### Task 12: Substep 1.6

**Files:** Create `src/content/substeps/s1-6.ts` exporting `SUBSTEP_1_6`; test `tests/content/s1-6.test.ts`.

**Fixed fields:** `id: '1.6'`, `title: 'Adding s and es'`, one group `{ cards: [], lesson }`. Concepts: `['suffix-s', 'suffix-es']`. New sight words: `['are', 'were', 'what', 'into']`.

**Territory:** base word plus `-s` or `-es`, where the base is a three-sound word taught earlier (it need not be in a bank, but prefer bases that are). Tag each word: `word('bugs', 'b,u,g,s', { concepts: ['suffix-s'] })`, `word('wishes', 'w,i,sh,e,s', { concepts: ['suffix-es'] })`. Seeds: bugs, hats, cups, dogs, cats, pigs, hens, jets, lids, maps, nuts, rugs, tubs, webs, wigs, bells, hills, dolls, fans, cans, hams, ships, chips, chops, sheds, kicks, socks, wishes, dishes, fishes, fixes, boxes, taxes, buses, kisses, misses, passes, bosses, fusses, dresses is a blend (skip); nonsense: bips, tads, wugs, fips, shups, zibs, vushes, quiches is real-ish (skip), thoxes, jexes, kisses is real. Words ending in am/an plus s ("fans", "hams", "cans") end in "ns"/"ms", so the welded-ending rule does not apply, but tap them as `f,an,s` and `h,am,s`.

**Lesson:** say that adding s makes more than one and that s can sound like s or z; show `['s']`; tap "bugs"; try "hats", "dolls"; say that after sh, ch, x, s and z we add es, which is its own beat; show `['e', 's']`; tap "wishes"; try "boxes", "dishes".

**Story brief:** a kid packing boxes with socks and dishes; questions about what went in the boxes.

**Test assertion:**

```ts
  it('tags every real word with a suffix concept and ends it in s', () => {
    for (const w of SUBSTEP_1_6.words.filter((w) => w.kind === 'real')) {
      expect(w.text.endsWith('s'), w.text).toBe(true);
      expect(w.concepts?.some((c) => c === 'suffix-s' || c === 'suffix-es'), w.text).toBe(true);
    }
  });
```

Commit message: `Add substep 1.6 content: base words with the suffixes s and es`.

---

### Task 13: Substep 2.1

**Files:** Create `src/content/substeps/s2-1.ts` exporting `SUBSTEP_2_1`; test `tests/content/s2-1.test.ts`. The test builds content from 1.1 through 2.1 (import `SUBSTEP_1_1` … `SUBSTEP_1_6` from their files).

**Fixed fields:** `id: '2.1'`, `title: 'Welded sounds: ang, ing, ong, ung, ank, ink, onk, unk'`, one group `{ cards: ['ang', 'ing', 'ong', 'ung', 'ank', 'ink', 'onk', 'unk'], lesson }`. Concepts `[]`. New sight words: `['your', 'there', 'their', 'who']`.

**Territory:** one-syllable words ending in one of the eight welded sounds, tapped as `word('bang', 'b,ang')`, plus a few `-s` forms tagged `suffix-s` (`word('rings', 'r,ing,s', { concepts: ['suffix-s'] })`). No `-ing` verb forms (that is 3.5); "ring", "sing", "king", "wing", "thing" are fine because they are base words. Seeds: bang, fang, hang, rang, sang, gang, king, ring, sing, wing, ding, zing, thing, long, song, gong, tong, hung, lung, rung, sung, bank, sank, tank, yank, thank, pink, sink, wink, link, mink, think, rink, honk, bonk, junk, bunk, dunk, hunk, sunk, rings, songs, banks, wings; nonsense: zang, ving, thong is real (skip), jong, wung, dank is real, yink, fonk, gunk is real, zunk, shink, quang, chung.

**Lesson:** say that these chunks are glued together and tapped once; show `['ang', 'ing', 'ong', 'ung']`; tap "bang"; try "king", "song"; show `['ank', 'ink', 'onk', 'unk']`; tap "pink"; try "thank", "junk".

**Story brief:** a king who sang a long song; questions about what he sang and who winked.

**Test assertion:**

```ts
  it('ends every real word in a welded ng or nk sound (with an optional s)', () => {
    const welded = new Set(['ang', 'ing', 'ong', 'ung', 'ank', 'ink', 'onk', 'unk']);
    for (const w of SUBSTEP_2_1.words.filter((w) => w.kind === 'real')) {
      const parts = w.parts.map((p) => p.grapheme);
      const last = parts[parts.length - 1] === 's' ? parts[parts.length - 2] : parts[parts.length - 1];
      expect(welded.has(last), w.text).toBe(true);
    }
  });
```

Commit message: `Add substep 2.1 content: the welded ng and nk sounds`.

---

### Task 14: Substep 2.2

**Files:** Create `src/content/substeps/s2-2.ts` exporting `SUBSTEP_2_2`; test `tests/content/s2-2.test.ts` (content 1.1 through 2.2).

**Fixed fields:** `id: '2.2'`, `title: 'Four sounds in a word'`, one group `{ cards: [], lesson }`. Concepts: `['blend']`. New sight words: `['two', 'too', 'very', 'come']`.

**Territory:** closed-syllable words with exactly four tapped sounds, made by a consonant blend at the start or the end (or both) and no welded chunk except as an ending taught earlier. Tag `-s`/`-es` forms. Seeds: flag, step, stop, spot, slip, clap, drop, grab, trip, swim, snap, plug, glad, club, crab, frog, milk, help, felt, melt, jump, lamp, camp, hand, sand, band, land, went, sent, tent, best, nest, rest, test, fast, last, must, dust, list, lift, gift, soft, left, desk, task, mask, hunt, bump, dump, lump, pump, gulp, self, shelf, chest, brush, crash, flash, fresh, steps, flags, brushes, plants is five (skip); nonsense: flib, stog, plim, crup, drep, snib, glup, tesk, mulp, hift, bonts is five, vamp is real, shrup is 3-letter blend (skip), thrap (skip), quilt is real (use as real).

**Lesson:** say that some words have two consonant sounds next to each other and each gets a tap; show `['f', 'l', 'a', 'g']`; tap "flag"; try "stop", "jump", "hand", "brush".

**Story brief:** a frog on a raft in a pond that must jump fast; questions about where the frog sat and what it did.

**Test assertion:**

```ts
  it('taps four sounds in every word (five when an es is added)', () => {
    for (const w of SUBSTEP_2_2.words) {
      const n = w.parts.length;
      const es = w.concepts?.includes('suffix-es');
      expect(es ? n === 5 : n === 4, w.text).toBe(true);
    }
  });
```

Commit message: `Add substep 2.2 content: four-sound words with blends`.

---

### Task 15: Substep 2.3

**Files:** Create `src/content/substeps/s2-3.ts` exporting `SUBSTEP_2_3`; test `tests/content/s2-3.test.ts` (content 1.1 through 2.3).

**Fixed fields:** `id: '2.3'`, `title: 'The odd ones: ild, ind, old, ost, olt'`, one group `{ cards: ['ild', 'ind', 'old', 'ost', 'olt'], lesson }`. Concepts `[]`. New sight words: `['some', 'would', 'could', 'should']`.

**Territory:** words ending in the five welded exceptions, tapped `word('cold', 'c,old')`, `word('blind', 'b,l,ind')`, plus `-s` forms tagged. Seeds: wild, mild, child, find, kind, mind, bind, blind, grind, hind, rind, old, bold, cold, fold, gold, hold, mold, sold, told, scold, most, host, post, bolt, colt, jolt, molt, volt, colts, finds, holds; nonsense: pild, zind, dold, fost, nolt, thold, shind, quost, vild, jolt is real, yold, chost.

**Lesson:** say that in these chunks the vowel says its name even though the word looks closed; show `['ild', 'ind', 'old']`; tap "cold"; try "find", "wild"; show `['ost', 'olt']`; tap "most"; try "bolt", "gold".

**Story brief:** a child finds a gold bolt in the cold; questions about what was found and where.

**Test assertion:**

```ts
  it('ends every real word in one of the five exceptions (with an optional s)', () => {
    const ends = new Set(['ild', 'ind', 'old', 'ost', 'olt']);
    for (const w of SUBSTEP_2_3.words.filter((w) => w.kind === 'real')) {
      const parts = w.parts.map((p) => p.grapheme);
      const last = parts[parts.length - 1] === 's' ? parts[parts.length - 2] : parts[parts.length - 1];
      expect(ends.has(last), w.text).toBe(true);
    }
  });
```

Commit message: `Add substep 2.3 content: the closed-syllable exceptions ild, ind, old, ost, olt`.

---

### Task 16: Substep 2.4

**Files:** Create `src/content/substeps/s2-4.ts` exporting `SUBSTEP_2_4`; test `tests/content/s2-4.test.ts` (content 1.1 through 2.4).

**Fixed fields:** `id: '2.4'`, `title: 'Five sounds in a word'`, one group `{ cards: [], lesson }`. Concepts `[]`. New sight words: `['put', 'saw', 'want', 'again']`.

**Territory:** closed-syllable words with exactly five tapped sounds (blends at both ends, or a blend plus a digraph) and `-s` forms of four-sound words tagged `suffix-s` (which makes five sounds). Seeds: spend, blend, blimp, blond, brand, clamp, cramp, crisp, crust, draft, drift, frost, grand, grant, grasp, plant, print, slept, spent, stamp, stump, swift, trust, twist, crunch, trench, drench, clench, flinch, shrimp is a three-letter blend (skip), crafts, plants, stamps, drinks (welded: d,r,ink,s is four; skip), tracks (t,r,a,ck,s = five, fine), blocks, trucks, clocks; nonsense: splog is 3-letter (skip), blimt, crest is real, drist, flomp, grunt is real, plisk, stend, trask, brulp, clunt, frisp, swelt.

**Lesson:** say that longer words are just more taps; show `['s', 'p', 'e', 'n', 'd']`; tap "spend"; try "plant", "crisp", "trust".

**Story brief:** a camping trip with a tent, a frost at dawn, and a crisp snack; questions about the weather and the snack.

**Test assertion:** every word has exactly five parts.

Commit message: `Add substep 2.4 content: five-sound closed-syllable words`.

---

### Task 17: Substep 2.5

**Files:** Create `src/content/substeps/s2-5.ts` exporting `SUBSTEP_2_5`; test `tests/content/s2-5.test.ts` (content 1.1 through 2.5).

**Fixed fields:** `id: '2.5'`, `title: 'Three-letter blends'`, one group `{ cards: [], lesson }`. Concepts: `['three-letter-blend']`. New sight words: `['because', 'many', 'any', 'out']`.

**Territory:** words that start with a three-letter blend (scr, spr, str, spl, squ, shr, thr — where sh/th/qu are one tap so "shrimp" is sh,r,i,m,p, five taps, and "squint" is s,qu,i,n,t), four to six tapped sounds, plus `-s`/`-es` forms tagged. Seeds: sprint, strap, strip, strut, strum, scrap, scrub, script, splat, split, splint, sprig, squint, squish, shrimp, shrub, shrug, thrift, thrust, thrash, throb, thrush, scram, scrunch, splash, strand, scripts, sprints, splits, straps, scrubs, stresses (s,t,r,e,ss,e,s = seven; skip), stress (five, fine); nonsense: sprat is real, strop, scrib, splon, squib is real, shrup, thrup, scrant, splad, strug, squend, thrint.

**Lesson:** say that three consonants in a row still get one tap each; show `['s', 't', 'r', 'a', 'p']`; tap "strap"; try "split", "shrug", "sprint".

**Story brief:** a sprint in the rain and a big splash; questions about who won and what got wet.

**Test assertion:** every real word's first two parts are consonants (not vowels) and it has a third consonant part before its first vowel; tapped length between 4 and 6 inclusive unless it carries `suffix-es`.

```ts
  it('starts every real word with a three-letter blend', () => {
    const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
    for (const w of SUBSTEP_2_5.words.filter((w) => w.kind === 'real')) {
      const firstVowel = w.parts.findIndex((p) => vowels.has(p.grapheme));
      const lettersBefore = w.parts.slice(0, firstVowel).map((p) => p.grapheme).join('').length;
      expect(lettersBefore, w.text).toBeGreaterThanOrEqual(3);
      expect(w.parts.length, w.text).toBeLessThanOrEqual(7);
    }
  });
```

Commit message: `Add substep 2.5 content: three-letter blends`.

---

### Task 18: Substep 3.1

**Files:** Create `src/content/substeps/s3-1.ts` exporting `SUBSTEP_3_1`; test `tests/content/s3-1.test.ts` (content 1.1 through 3.1).

**Fixed fields:** `id: '3.1'`, `title: 'Two syllables, no blends'`, one group `{ cards: [], lesson }`. Concepts: `['two-syllable', 'schwa', 'prefix']`. New sight words: `['down', 'now', 'how', 'about']`.

**Territory:** two closed syllables with no blend inside either syllable, including compounds and doubled middle consonants written as two parts; every word carries `syllables: [i]` where `i` is the index of the first part of the second syllable. Prefix words tag `concepts: ['prefix']`; schwa words tag `['schwa']`. Seeds: sunset, sunlit, catnip, bathtub, laptop, pigpen, cannot, upset, until, napkin, muffin, kitten, mitten, button, sudden, happen, lesson, tennis, rabbit, comic, panic, attic, picnic, basket, jacket, pocket, rocket, ticket, velvet, magnet, publish, limit, visit, habit, rapid, solid, timid, vivid, robin, cabin, satin, salad, lemon, melon, seven, wagon, misfit, mishap, unlock, unfit, unzip, unwell, dismiss, inject, insect is a blend in "sect"? (in-sect: s,e,c,t; no blend, fine), input; nonsense: napsit, lobbin, tudmap, fesket, pindot, vimlub, sobbit, cadmun, hupten, zoglit, mibbet, wusdak.

**Lesson:** say that a long word is two short words glued together, each with its own vowel; show `['s', 'u', 'n', 's', 'e', 't']`; tap "sunset"; try "napkin", "rabbit", "unlock".

**Story brief:** a rabbit in a cabin at sunset with a muffin; questions about where and what it ate.

**Test assertion:**

```ts
  it('splits every real word into two syllables with no blend inside a syllable', () => {
    const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
    for (const w of SUBSTEP_3_1.words.filter((w) => w.kind === 'real')) {
      expect(w.syllables, w.text).toHaveLength(1);
      const [cut] = w.syllables!;
      for (const syl of [w.parts.slice(0, cut), w.parts.slice(cut)]) {
        const vi = syl.findIndex((p) => vowels.has(p.grapheme));
        expect(vi, w.text).toBeGreaterThanOrEqual(0);
        const onset = syl.slice(0, vi).length;
        const coda = syl.slice(vi + 1).length;
        expect(onset, `${w.text} onset`).toBeLessThanOrEqual(1);
        expect(coda, `${w.text} coda`).toBeLessThanOrEqual(1);
      }
    }
  });
```

Note: this rule means "inject" (in / ject) passes, while "insect" (in / sect... s,e,c,t has coda c,t of length 2) does not; leave "insect" for 3.3.

Commit message: `Add substep 3.1 content: two closed syllables without blends`.

---

### Task 19: Substep 3.2

**Files:** Create `src/content/substeps/s3-2.ts` exporting `SUBSTEP_3_2`; test `tests/content/s3-2.test.ts` (content 1.1 through 3.2).

**Fixed fields:** `id: '3.2'`, `title: 'Two syllables with blends'`, one group `{ cards: [], lesson }`. Concepts `[]` (uses `two-syllable`, `blend`, `prefix` from before). New sight words: `['little', 'over', 'only', 'other']`.

**Territory:** two closed syllables where at least one syllable has a blend; `syllables: [i]` on every word; prefix words tagged `prefix`; words ending in ct are reserved for 3.3. Seeds: problem, plastic, goblin, dentist, tablet, contest, children, hundred, blanket, trumpet, pumpkin, address, distrust, mistrust, command, unplug, disband, invent, indent, uplift, transmit, transplant, splendid, frantic, drastic, sandwich, imprint, impress, express, absent, admit is no blend (skip), bandit is no blend (skip), grandchild (g,r,a,n,d,ch,ild; syllables [5]), handstand, upstand is not a word (skip), hotdogs? (skip), catfish (no blend; skip), sunblock, kingdom (k,ing,d,o,m; blend? king/dom: no blend; skip), problems, blankets; nonsense: blastin, crimpet, dranlop, flistub, grendit, plomkin, scaltop, trubmit, vindrest, wispram, stubnet, clundip.

**Lesson:** say that syllables can have blends too and we still tap each sound; show `['p', 'r', 'o', 'b', 'l', 'e', 'm']`; tap "problem"; try "blanket", "pumpkin", "unplug".

**Story brief:** a contest to carry a pumpkin across the grass without dropping it.

**Test assertion:** every real word has `syllables` of length 1, at least one syllable has an onset or coda of two or more consonant parts, and no word ends in "ct".

Commit message: `Add substep 3.2 content: two closed syllables with blends`.

---

### Task 20: Substep 3.3

**Files:** Create `src/content/substeps/s3-3.ts` exporting `SUBSTEP_3_3`; test `tests/content/s3-3.test.ts` (content 1.1 through 3.3).

**Fixed fields:** `id: '3.3'`, `title: 'Words that end in ct'`, one group `{ cards: [], lesson }`. Concepts: `['ct-ending']`. New sight words: `['after', 'before', 'people', 'water']`.

**Territory:** words ending in ct: one-syllable bases (act, fact, pact, tact, duct, sect, strict, tract) and two-syllable words (`syllables: [i]`), many built as prefix plus base (tag `prefix`). Seeds: act, fact, pact, tact, duct, strict, tract, connect, district, insect, inspect, contract, subtract, instruct, conflict, object, subject, collect, correct, expect, affect, effect, exact, impact, compact, contact, intact, addict, restrict, constrict, conduct, instinct, distinct, extinct, inject is not ct (skip), facts, acts, insects, objects; nonsense: bract, flict, spect, dract, trunct, plect, conflact, disnect, unstrict, subplict, misduct, intract.

**Lesson:** say that c and t at the end each get a tap; show `['a', 'c', 't']`; tap "act"; try "fact", "insect", "connect".

**Story brief:** kids collect insects for a class project and must be exact when they count.

**Test assertion:** every real word ends in "ct" or "cts"; every word with more than five parts has `syllables`.

Commit message: `Add substep 3.3 content: words ending in ct`.

---

### Task 21: Substep 3.4

**Files:** Create `src/content/substeps/s3-4.ts` exporting `SUBSTEP_3_4`; test `tests/content/s3-4.test.ts` (content 1.1 through 3.4).

**Fixed fields:** `id: '3.4'`, `title: 'Three or more syllables'`, one group `{ cards: [], lesson }`. Concepts: `['multisyllable']`. New sight words: `['know', 'through', 'where', 'here']`.

**Territory:** words of three or more closed syllables only (every syllable has a short vowel closed by a consonant; no open syllables, no `y` vowels, no -ed/-ing); `syllables` has two or more entries. Proper nouns allowed and capitalised. Seeds: basketball, establish, disconnect, fantastic, Atlantic, misconduct, subcontract, inhabit, uncommon, unselfish, disinfect, contradict, badminton, Wisconsin, Manhattan, indistinct, adjustment, punishment, investment, enlistment, commitment, consultant, insistent, contestant, combatant, establishment, Kentucky is a y vowel (skip), abandon is an open first syllable (skip); nonsense: pumkinlab, distracmit, fantoblip, submandix, conbastel, undrimpot, mislantic, trusvendum, inspecton, blimkastin, sunpelmit, grandistop.

**Lesson:** say that big words are just three or more chunks; show the tiles for "sunset" plus "lamp" as an example of chunks; tap "basketball"; try "fantastic", "establish", "disconnect".

**Story brief:** a fantastic basketball contest at Manhattan's public park; questions about who won and what was uncommon.

**Test assertion:**

```ts
  it('has three or more closed syllables in every real word', () => {
    const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
    for (const w of SUBSTEP_3_4.words.filter((w) => w.kind === 'real')) {
      expect(w.syllables!.length, w.text).toBeGreaterThanOrEqual(2);
      const cuts = [0, ...w.syllables!, w.parts.length];
      for (let i = 0; i + 1 < cuts.length; i++) {
        const syl = w.parts.slice(cuts[i], cuts[i + 1]).map((p) => p.grapheme);
        const last = syl[syl.length - 1];
        const welded = ['all', 'am', 'an', 'ang', 'ing', 'ong', 'ung', 'ank', 'ink', 'onk', 'unk', 'ild', 'ind', 'old', 'ost', 'olt'].includes(last);
        expect(welded || !vowels.has(last), `${w.text} syllable ${syl.join('')} is open`).toBe(true);
      }
    }
  });
```

Commit message: `Add substep 3.4 content: words of three or more closed syllables`.

---

### Task 22: Substep 3.5

**Files:** Create `src/content/substeps/s3-5.ts` exporting `SUBSTEP_3_5`; test `tests/content/s3-5.test.ts` (content 1.1 through 3.5).

**Fixed fields:** `id: '3.5'`, `title: 'Adding ed and ing'`, one group `{ cards: ['ed'], lesson }`. Concepts: `['suffix-ed', 'suffix-ing']`. New sight words: `['every', 'something', 'always', 'right']`.

**Territory:** `-ed` and `-ing` added to closed-syllable bases that do not change (no doubling of the final consonant, no dropped e). `-ed` is the welded `ed` card: `word('jumped', 'j,u,m,p,ed', { concepts: ['suffix-ed'] })`; `-ing` is the `ing` card: `word('fishing', 'f,i,sh,ing', { concepts: ['suffix-ing'] })`. Bases with two syllables get `syllables` for the base split and the suffix counts as another syllable only when `ed` says "ed" (after t or d) — keep it simple: set `syllables` to the base's split points plus the index of the suffix part. Seeds: shifted, expanding, jumped, landed, wished, fishing, camping, melted, rested, printed, planted, thanked, chomping, dusting, blasted, drifted, twisted, lifted, handed, banking, thinking, punching, crunching, splashing, inspected, collected, connected, subtracted, unlocked, insisting, acted, tested, ended, rented, hunted, bumped, packed, kicked, licked, checked, brushed, crashed, sniffed, puffed, yelled, filled, spilled, smelled, buzzing, kissing, missing, passing, singing, ringing; nonsense: blimped, tranked, gusted, flisting, dranking, plimmed is doubled (skip), scrunted, thusting, quepped (skip), vashed, wumping, zelted.

**Lesson:** say that ed tells us it already happened and is one tap, and that ing tells us it is happening now; show `['ed', 'ing']`; tap "jumped"; try "landed", "fishing", "melted", "thinking".

**Story brief:** a day that already happened: the class planted seeds, the wind shifted, it rained, and the plants ended up standing; questions about what they planted and what happened after.

**Test assertion:**

```ts
  it('ends every real word in ed or ing, tagged with the matching suffix concept', () => {
    for (const w of SUBSTEP_3_5.words.filter((w) => w.kind === 'real')) {
      const last = w.parts[w.parts.length - 1].grapheme;
      expect(['ed', 'ing'], w.text).toContain(last);
      expect(w.concepts, w.text).toContain(last === 'ed' ? 'suffix-ed' : 'suffix-ing');
    }
  });
```

Commit message: `Add substep 3.5 content: the suffixes ed and ing`.

---

### Wave registration (orchestrator, after each content wave)

After merging a wave, edit `src/content/index.ts` to import and list the new substeps in order, e.g. after wave A:

```ts
import { SUBSTEP_1_1 } from './substeps/s1-1';
import { SUBSTEP_1_2 } from './substeps/s1-2';
import { SUBSTEP_1_3 } from './substeps/s1-3';
import { SUBSTEP_1_4 } from './substeps/s1-4';
import { SUBSTEP_1_5 } from './substeps/s1-5';
import { SUBSTEP_1_6 } from './substeps/s1-6';

export const CONTENT: Content = {
  cards: CARDS,
  substeps: [SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5, SUBSTEP_1_6],
};
```

Then run `npm test && npm run typecheck`. `tests/content/s1-1.test.ts` runs the checker over the whole `CONTENT`, so any cross-substep duplicate shows up as `"<word>" is already in substep <id>'s word bank`; remove the word from the later substep (and from its sentences if used there, replacing it with another taught word), keep counts above the minimums, and rerun. Commit as `Register substeps 1.2 to 1.6` (or 2.x / 3.x).

Also after wave C: add to `tests/content/s1-1.test.ts` (or a new `tests/content/all.test.ts`) an assertion that `CONTENT.substeps.map((s) => s.id)` equals the sixteen ids in order, and that every card in `CARDS` is introduced by exactly one substep group.

---

### Task 23: Browser tests for placement and backup/restore

**Files:**
- Create: `tests/e2e/parent.spec.ts`
- Modify: `tests/e2e/helpers.ts` (add `addChildByPlacement`)

**Interfaces:**
- Consumes: `addChild`, `openGrownUps`, `startSession`, `autoPlay` from `tests/e2e/helpers.ts`; the screens' texts from Tasks 4 and 7.

- [ ] **Step 1: Write the spec**

Append to `tests/e2e/helpers.ts`:

```ts
/** Marks one placement list: `got` "Got it" taps then `missed` "Missed it" taps. */
export async function markPlacementList(page: Page, got: number, missed: number) {
  for (let i = 0; i < got; i++) await page.getByRole('button', { name: /got it/i }).click();
  for (let i = 0; i < missed; i++) await page.getByRole('button', { name: /missed it/i }).click();
}
```

Create `tests/e2e/parent.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { addChild, markPlacementList, openGrownUps } from './helpers';

test('a grown-up can find the starting point with the placement check', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /add a child/i }).click();
  await page.getByLabel(/name/i).fill('Mia');
  await page.getByRole('button', { name: /find the starting point/i }).click();
  await page.getByRole('button', { name: /begin/i }).click();
  await expect(page.getByText(/list 1 of/i)).toBeVisible();
  await markPlacementList(page, 8, 0);   // 1.1 passes
  await markPlacementList(page, 7, 1);   // 1.3 passes
  await markPlacementList(page, 2, 6);   // 1.6 fails; stop
  await expect(page.getByText(/we suggest starting at 1\.3/i)).toBeVisible();
  await page.getByRole('button', { name: /use this/i }).click();
  await expect(page.getByRole('button', { name: /^Mia$/ })).toBeVisible();
  await openGrownUps(page);
  await expect(page.locator('.path-current')).toContainText('1.3');
});

test('a backup made on one device restores on a fresh one', async ({ page, browser }) => {
  await addChild(page, 'Noah', '1.4');
  await openGrownUps(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /back up everything/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^tapwords-backup-\d{4}-\d{2}-\d{2}\.json$/);
  const path = await download.path();
  expect(path).not.toBeNull();

  const fresh = await browser.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true });
  const page2 = await fresh.newPage();
  await page2.goto('/');
  await expect(page2.getByText(/add a child to get started/i)).toBeVisible();
  await page2.getByLabel(/restore from a backup/i).setInputFiles(path!);
  await page2.getByRole('button', { name: /replace everything/i }).click();
  await expect(page2.getByRole('button', { name: /^Noah$/ })).toBeVisible();
  await openGrownUps(page2);
  await expect(page2.locator('.path-current')).toContainText('1.4');
  await fresh.close();
});
```

- [ ] **Step 2: Run**

Run: `npm run e2e`
Expected: all previous specs plus the two new ones pass. If the download never fires, check that headless Chromium has no `navigator.share` (it does not) so `saveTextFile` takes the anchor path; if Playwright blocks downloads, set `acceptDownloads: true` in `playwright.config.ts` `use` (it is the default).

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/parent.spec.ts tests/e2e/helpers.ts
git commit -m "Add browser tests for the placement check and for restoring a backup on a fresh device

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 24: README and final check

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add three sections to the README** after "Put it on the iPad's home screen":

```markdown
## Starting a child at the right place

When you add a child you can either pick a starting point from the list (each entry shows example words) or tap **Find the starting point with a short check**. Sit with your child: words appear one at a time, your child reads each out loud, and you tap **Got it** or **Missed it**. The check stops on its own when the words get too hard and suggests where to begin. You can change the suggestion before saving, and re-run the check any time from the grown-up area (hold the **Grown-ups** button next to the child's name).

## Recording the sounds in your own voice

The app speaks with the device's built-in voice. If you would rather your child hear a person, open the grown-up area, tap **Record sounds**, and record each sound card once: tap **Record**, say the sound (the sound, not the letter name), tap **Stop**. Recordings are kept on the device and included in backups.

## Backing up and moving to another device

In the grown-up area, tap **Back up everything on this device**. On an iPad this opens the share sheet so you can save the file to Files or send it to yourself; on a computer it downloads. The file holds every child's progress and any recorded sounds.

To restore, open Tapwords on the other device, tap **Restore from a backup** on the first screen (or in the grown-up area), choose the file, then choose **Replace everything on this device** or **Add to what is here**. Adding keeps the children already on the device and overwrites only a child with the same identity as one in the backup.

If the app ever says the saved data is damaged, restore from a backup the same way, or hold **Start fresh** to clear it.
```

Also update the "Check it" section's e2e line to mention the placement and backup tests, and the "Where things live" bullet for `src/content` to say there are sixteen substep files.

- [ ] **Step 2: Run everything**

Run: `npm test && npm run typecheck && npm run build && npm run e2e`
Expected: all green. Paste the summary lines into the commit body if anything is notable.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "Explain the placement check, sound recording, and backups in the README

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Plan self-review notes

- **Spec coverage.** 3.1 sequence: Tasks 8-22 cover 1.2 to 3.5 with the 1.2 groups as specified. 3.2 file contents: existing types; step-3 syllables required by the tests of Tasks 18-22. 3.3 cards: `ed` added (Task 1); the count stays about sixty. 3.4 checker: existing rules plus welded endings and syllables (Task 1). 3.5 authorship: recipe forbids copying. 4.2 sentence and story assembly per group: Task 2. 5.1 placement: Task 4 (both paths). 5.4 parent controls: move (existing), placement (Task 4), back up and restore (Task 7), record (Task 5). 6 audio recording: Task 5, clips included in backups (Task 6). 8.3 backup file shape: Task 6 (JSON with base64 clips, replace or merge with the parent asked which). 8.4 corrupt data: Task 7. 9 browser tests: back up and restore into a fresh context and placement (Task 23); other flows already covered by plan 3.
- **Deliberately not done.** The advancement note "read-aloud is the real test" shown to the parent when advancing without a read-aloud (spec 5.3) is not in this plan; it was not in plan 1 either and belongs in a small follow-up. Backups do not encrypt anything; they are plain files of a child's first name and progress.
- **Type consistency.** `PlacementList { substep, title, words }` (Task 4) is only consumed by `PlacementScreen`. `Recorder` (Task 5) is consumed by `RecordScreen` through `Services.recorder`. `Store.setLogs`/`clearAll` (Task 6) are consumed by `restoreBackup` and by `Home` (Task 7). `BackupPanel` props `onRestored`/`restoreOnly` match their use in `Home` and `ParentArea`. `usableSentences`/`usableStories` (Task 2) are consumed by `buildSession` and the 1.2 test (Task 8).
- **Placeholder scan.** Content tasks use seed lists and boundaries by design, with the recipe giving every rule; the `…` in the Task 8 skeleton marks prose the author writes, governed by the recipe's rules for summaries and lessons.
