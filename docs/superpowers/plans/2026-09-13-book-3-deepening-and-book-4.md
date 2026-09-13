# Book 3 Deepening and Book 4 (Silent E) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Double the practice material in Tapwords' five Book 3 sections, and add Book 4 — six new sections teaching the silent-e syllable — including the first change to the tapping model, where a letter is shown but never tapped.

**Architecture:** Two new card types carry the whole feature. A `vce` card is a long vowel that owes its sound to a silent e later in the syllable; a `silent` card is a letter shown with no sound and no tap dot. A word's `parts` still spell the word exactly as before, so every existing checker rule holds. The screens gain a shared `SoundTiles` component that renders a word's letter tiles and draws an SVG arc from each silent-e vowel to its partner e. The engine only has to learn to keep undrillable cards out of the sound-card drill.

**Tech Stack:** React 18 + TypeScript + Vite, Vitest + Testing Library (jsdom), Playwright for browser tests. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-13-book-3-deepening-and-book-4-design.md` — read it before Task 1. It carries the teaching order, the content rules, and the decisions the owner made.

## Global Constraints

- **Never write the word "Wilson"** in any file under `src/`, `tests/`, `docs/`, `public/` or `README.md`. `tests/content/all.test.ts` asserts this over the whole content tree. The program is referred to as "the program" or by no name at all.
- **Every command's output must be shown before any claim that it passed.** "Should work" is not acceptable. The four gates are `npm test`, `npm run typecheck`, `npm run build`, `npm run e2e`.
- **Commit after every task**, with a plain-English message in the imperative mood describing what changed for the child or the reader, not the implementation. End each commit message with the trailer `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- **Content rules, applied to every word, sentence, story and question added by this plan:**
  - Decodable with cards taught at or before its own section.
  - No word text may exist in two sections' banks (case-insensitive; the checker enforces it).
  - Nonsense words: pronounceable, follow the section's pattern, never a real word, name or slang, never one letter from a rude word.
  - Sentences and story sentences use only taught words and declared sight words.
  - Story titles and answer choices must be decodable. Question prompts are spoken by the app and may use any words.
  - Every answer choice must be answerable from its own story, and exactly one choice may be defensible.
  - Stories are authored with the correct answer at index 0; the engine shuffles per session.
  - **Reject any word where a letter takes a sound the child has not been taught.** In Book 4 the trap is s saying /z/: *these, rose, nose, wise, chose, those, close* are all banned. Use *theme, eve, Pete, Steve, hope, stone, woke, globe* instead.
  - Proper nouns are capitalised in `text` with lower-case `parts`, and are never used as a "find" target or distractor.
- **Minimums the checker enforces per section:** 20 real words, 10 nonsense words, 6 sentences, 1 story, 1 question per story.

---

## File Structure

**Modified — model and rules**
- `src/content/types.ts` — two new `CardType` values, two new optional `Card` fields.
- `src/content/parts.ts` — **new.** Pure helpers over a word's parts: silent-letter pairing, sounding indexes, card display. No React, no browser.
- `src/content/cards.ts` — seven new cards.
- `src/content/check.ts` — silent-e pairing rules, `display` counts as introduced.
- `src/engine/session.ts` — undrillable cards never reach a drill.

**Modified — screens**
- `src/ui/tiles.ts` — lookup by card id alongside the existing lookup by letter.
- `src/ui/components/SoundTiles.tsx` — **new.** A word's letter tiles plus the silent-e bridge arcs.
- `src/ui/components/TapDots.tsx` — uses `SoundTiles`; dots only for sounding parts.
- `src/ui/session/WordWorkPart.tsx` — uses `SoundTiles`.
- `src/ui/session/SoundCardsPart.tsx` — shows a card's `display`.
- `src/ui/screens/RecordScreen.tsx` — shows `display`, hides silent cards.
- `src/ui/styles.css` — tile colours for the two new types, bridge arc.

**Created — content**
- `src/content/substeps/s4-1.ts` … `s4-6.ts`, registered in `src/content/index.ts`.

**Modified — content**
- `src/content/substeps/s3-1.ts` … `s3-5.ts` — deepened.

**Created — tests**
- `tests/content/parts.test.ts`, `tests/content/s4-1.test.ts` … `s4-6.test.ts`, `tests/ui/soundtiles.test.tsx`, `tests/e2e/silente.spec.ts`.

**Modified — tests**
- `tests/content/cards.test.ts`, `tests/content/check.test.ts`, `tests/content/all.test.ts`, `tests/ui/tapdots.test.tsx`, `tests/engine/*`.

**Modified — docs**
- `docs/HANDOFF.md`, `README.md`.

## Task Order and Parallelism

Tasks 1–7 are the code change and must land in order; nothing else can start until Task 7 is merged, because the content files need the new card types.

After Task 7:
- Tasks 8, 9, 10 must run **in order** (4.2's words may use 4.1's cards, and so on).
- Tasks 11, 12, 13 may run **in parallel** with each other once Task 10 is merged. None of them touches `src/content/index.ts`.
- Tasks 15–19 (Book 3) may run **in parallel** with each other and with Tasks 8–13 from the moment Task 7 is merged. They touch only their own section file and its test.
- Task 14 registers Book 4 and needs Tasks 8–13.
- Tasks 20 and 21 are last and need everything.

An agent working in an isolated worktree cannot write outside it. Before starting, it must `git merge --ff-only <plan-branch>`, and additionally `git merge --no-edit <sha>` for any sibling task whose output it depends on. Reports go to a path inside the worktree and are copied over by the controller.

---

### Task 1: The card and part model

**Files:**
- Modify: `src/content/types.ts`
- Create: `src/content/parts.ts`
- Modify: `src/content/cards.ts`
- Test: `tests/content/parts.test.ts` (create), `tests/content/cards.test.ts` (modify)

**Interfaces:**
- Consumes: nothing.
- Produces: `CardType` gains `'vce' | 'silent'`; `Card` gains `display?: string` and `drill?: boolean`; and from `src/content/parts.ts`:
  - `cardMap(cards: Card[]): Map<string, Card>`
  - `cardDisplay(card: Card): string`
  - `isDrillable(card: Card): boolean`
  - `syllableOf(word: Word, index: number): number`
  - `silentPartners(word: Word, cards: Map<string, Card>): { vowel: number; silent: number }[]`
  - `soundingIndexes(word: Word, cards: Map<string, Card>): number[]`
  - New card ids: `a_e`, `i_e`, `o_e`, `u_e`, `e_e`, `u_e_oo`, `e_silent`.

- [ ] **Step 1: Write the failing test**

Create `tests/content/parts.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { word } from '../../src/content/build';
import { cardMap, cardDisplay, isDrillable, silentPartners, soundingIndexes, syllableOf } from '../../src/content/parts';

const cards = cardMap(CARDS);
const cake = word('cake', 'c,a:a_e,k,e:e_silent');
const invite = word('invite', 'i,n,v,i:i_e,t,e:e_silent', { syllables: [2] });

describe('word parts', () => {
  it('pairs a silent letter with the vowel it works on', () => {
    expect(silentPartners(cake, cards)).toEqual([{ vowel: 1, silent: 3 }]);
  });

  it('pairs within a syllable, not across one', () => {
    expect(silentPartners(invite, cards)).toEqual([{ vowel: 3, silent: 5 }]);
    expect(syllableOf(invite, 0)).toBe(0);
    expect(syllableOf(invite, 3)).toBe(1);
  });

  it('leaves a silent letter unpaired when no vowel-consonant-e vowel precedes it', () => {
    const bad = word('ake', 'a,k,e:e_silent');
    expect(silentPartners(bad, cards)).toEqual([]);
  });

  it('counts only the parts that make a sound', () => {
    expect(soundingIndexes(cake, cards)).toEqual([0, 1, 2]);
    expect(soundingIndexes(word('map', 'm,a,p'), cards)).toEqual([0, 1, 2]);
  });

  it('shows a silent-e vowel as the a_e pattern on its sound card, and as a bare letter in a word', () => {
    const aE = CARDS.find((c) => c.id === 'a_e')!;
    expect(aE.grapheme).toBe('a');
    expect(cardDisplay(aE)).toBe('a_e');
    expect(cardDisplay(CARDS.find((c) => c.id === 'm')!)).toBe('m');
  });

  it('keeps the silent e and the second u_e sound out of the card drill', () => {
    expect(isDrillable(CARDS.find((c) => c.id === 'e_silent')!)).toBe(false);
    expect(isDrillable(CARDS.find((c) => c.id === 'u_e_oo')!)).toBe(false);
    expect(isDrillable(CARDS.find((c) => c.id === 'a_e')!)).toBe(true);
    expect(isDrillable(CARDS.find((c) => c.id === 'm')!)).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/content/parts.test.ts`
Expected: FAIL — cannot resolve `../../src/content/parts`.

- [ ] **Step 3: Widen the card model**

In `src/content/types.ts`, replace the `CardType` alias and the `Card` interface with:

```ts
export type CardType =
  | 'consonant'
  | 'vowel'
  | 'digraph'
  | 'welded'
  /** A long vowel that owes its sound to a silent letter later in the same syllable. */
  | 'vce'
  /** A letter that is shown but makes no sound, and is never tapped. */
  | 'silent';

export interface Card {
  id: string;            // e.g. "sh"
  grapheme: string;      // the letters as they appear inside a word: "a" for the a_e card
  /** What the sound card itself shows, when that differs from the letters in a word: "a_e". */
  display?: string;
  keyword: string;       // e.g. "ship"
  phonemeLabel: string;  // spoken by the computer voice when no clip is recorded
  type: CardType;
  /** False for a card that is never drilled on its own: a silent letter, or a second sound
   * of a spelling that already has a card in the deck. Defaults to true. */
  drill?: boolean;
}
```

- [ ] **Step 4: Write the part helpers**

Create `src/content/parts.ts`:

```ts
import type { Card, Word } from './types';

export function cardMap(cards: Card[]): Map<string, Card> {
  return new Map(cards.map((c) => [c.id, c]));
}

/** The sound card's own face. A silent-e vowel is written "a" inside a word but drilled as "a_e". */
export function cardDisplay(card: Card): string {
  return card.display ?? card.grapheme;
}

/** A silent letter has no sound to drill, and a second sound of a spelling that already has a
 * card would make the drill unanswerable, so neither is ever shown as a card on its own. */
export function isDrillable(card: Card): boolean {
  return card.type !== 'silent' && card.drill !== false;
}

/** Which syllable a part belongs to. Syllable 0 runs up to the first index in word.syllables. */
export function syllableOf(word: Word, index: number): number {
  return (word.syllables ?? []).filter((start) => start <= index).length;
}

/** Pairs each silent letter with the vowel it works on: the nearest vowel-consonant-e vowel
 * before it in the same syllable. A silent letter with no such vowel, or a vowel with no silent
 * partner, is a content error; check.ts reports it and the screens simply draw no arc. */
export function silentPartners(word: Word, cards: Map<string, Card>): { vowel: number; silent: number }[] {
  const typeAt = (i: number) => cards.get(word.parts[i].card)?.type;
  const out: { vowel: number; silent: number }[] = [];
  word.parts.forEach((_, i) => {
    if (typeAt(i) !== 'silent') return;
    for (let j = i - 1; j >= 0; j--) {
      if (syllableOf(word, j) !== syllableOf(word, i)) break;
      if (typeAt(j) === 'vce') {
        out.push({ vowel: j, silent: i });
        return;
      }
    }
  });
  return out;
}

/** Indexes of the parts that make a sound, in order. These are the tap dots: "cake" has three. */
export function soundingIndexes(word: Word, cards: Map<string, Card>): number[] {
  return word.parts.map((_, i) => i).filter((i) => cards.get(word.parts[i].card)?.type !== 'silent');
}
```

- [ ] **Step 5: Add the seven cards**

In `src/content/cards.ts`, add a helper beside the existing `card()`:

```ts
/** A long vowel that says its name because of a silent e later in the syllable. Inside a word the
 * tile shows the bare vowel, because that is what the child sees; the sound card shows "a_e". */
function vce(id: string, grapheme: string, keyword: string, phonemeLabel: string, extra: Partial<Card> = {}): Card {
  return { id, grapheme, display: `${grapheme}_e`, keyword, phonemeLabel, type: 'vce', ...extra };
}
```

and append to the end of `CARDS`:

```ts
  // Book 4: the silent-e syllable
  vce('a_e', 'a', 'cake', 'a says its name, ay'),
  vce('i_e', 'i', 'ride', 'i says its name, eye'),
  vce('o_e', 'o', 'hope', 'o says its name, oh'),
  vce('u_e', 'u', 'mule', 'u says its name, yoo'),
  vce('e_e', 'e', 'Pete', 'e says its name, ee'),
  // The second sound of the same spelling, as in rule. Never drilled as a card of its own,
  // because it would be indistinguishable from u_e in the deck.
  vce('u_e_oo', 'u', 'rule', 'u_e can also say oo', { drill: false }),
  { id: 'e_silent', grapheme: 'e', display: 'e', keyword: 'silent e', phonemeLabel: 'silent e', type: 'silent', drill: false },
```

`Card` must be imported as a type in `cards.ts` if it is not already.

- [ ] **Step 6: Update the card list test**

In `tests/content/cards.test.ts`, replace the type assertion line and add a case:

```ts
      expect(['consonant', 'vowel', 'digraph', 'welded', 'vce', 'silent']).toContain(c.type);
```

```ts
  it('includes the silent-e cards Book 4 needs, written the way the child meets them', () => {
    const byId = new Map(CARDS.map((c) => [c.id, c]));
    for (const id of ['a_e', 'i_e', 'o_e', 'u_e', 'e_e', 'u_e_oo', 'e_silent']) {
      expect(byId.has(id), `missing card ${id}`).toBe(true);
    }
    for (const id of ['a_e', 'i_e', 'o_e', 'u_e', 'e_e', 'u_e_oo']) {
      const c = byId.get(id)!;
      expect(c.type, id).toBe('vce');
      expect(c.grapheme.length, id).toBe(1);
      expect(c.display, id).toBe(`${c.grapheme}_e`);
    }
    expect(byId.get('e_silent')!.type).toBe('silent');
  });
```

- [ ] **Step 7: Run the tests**

Run: `npx vitest run tests/content/parts.test.ts tests/content/cards.test.ts`
Expected: PASS, all cases.

- [ ] **Step 8: Run the whole suite and the typechecker**

Run: `npm test && npm run typecheck`
Expected: PASS. The seven new cards are not yet introduced by any section, so `tests/content/all.test.ts`'s "introduces every card in exactly one substep group" will **fail**. That is expected at this point. Relax that test for the duration of the build by skipping cards no section has reached yet:

```ts
  it('introduces every card in exactly one substep group', () => {
    const seen = new Map<string, number>();
    for (const s of CONTENT.substeps) for (const g of s.groups) for (const c of g.cards) seen.set(c, (seen.get(c) ?? 0) + 1);
    // A card that no section introduces yet is pending content, not a duplicate. Task 14
    // re-tightens this to require exactly one for every card.
    for (const card of CONTENT.cards) expect(seen.get(card.id) ?? 1, `card ${card.id}`).toBe(1);
  });
```

Re-run `npm test` and show it green before committing.

- [ ] **Step 9: Commit**

```bash
git add src/content/types.ts src/content/parts.ts src/content/cards.ts tests/content/parts.test.ts tests/content/cards.test.ts tests/content/all.test.ts
git commit -m "Teach the app that a letter can be silent"
```

---

### Task 2: Checker rules for silent e

**Files:**
- Modify: `src/content/check.ts`
- Test: `tests/content/check.test.ts`

**Interfaces:**
- Consumes: `cardMap`, `silentPartners` from `src/content/parts.ts` (Task 1).
- Produces: no new exports. `checkContent` gains two error messages and one relaxation.

- [ ] **Step 1: Write the failing tests**

Append to `tests/content/check.test.ts`. Follow the file's existing pattern for building a tiny `Content`; if it has a local `make()`-style helper, use it. Otherwise build inline as below.

```ts
import { cardMap } from '../../src/content/parts';

describe('silent-e rules', () => {
  const cards = [
    { id: 'c', grapheme: 'c', keyword: 'cat', phonemeLabel: 'c', type: 'consonant' as const },
    { id: 'k', grapheme: 'k', keyword: 'kite', phonemeLabel: 'k', type: 'consonant' as const },
    { id: 'a', grapheme: 'a', keyword: 'apple', phonemeLabel: 'a', type: 'vowel' as const },
    { id: 'a_e', grapheme: 'a', display: 'a_e', keyword: 'cake', phonemeLabel: 'ay', type: 'vce' as const },
    { id: 'e_silent', grapheme: 'e', display: 'e', keyword: 'silent e', phonemeLabel: 'silent e', type: 'silent' as const, drill: false },
  ];
  const min = { real: 0, nonsense: 0, sentences: 0, stories: 0, questions: 0 };
  const substep = (words: Word[]) => ({
    id: '4.1', title: 'Silent e', parentSummary: 'x',
    groups: [{ cards: ['c', 'k', 'a', 'a_e', 'e_silent'], lesson: [] }],
    concepts: [], sightWords: [], words, sentences: [], stories: [],
  });

  it('accepts a silent e that follows the vowel it works on', () => {
    const errors = checkContent({ cards, substeps: [substep([word('cake', 'c,a:a_e,k,e:e_silent')])] }, min);
    expect(errors).toEqual([]);
  });

  it('rejects a silent e with no silent-e vowel before it', () => {
    const errors = checkContent({ cards, substeps: [substep([word('cake', 'c,a,k,e:e_silent')])] }, min);
    expect(errors.join('\n')).toMatch(/"cake".*silent .* no .* vowel/i);
  });

  it('rejects a silent-e vowel with no silent partner', () => {
    const errors = checkContent({ cards, substeps: [substep([word('cak', 'c,a:a_e,k')])] }, min);
    expect(errors.join('\n')).toMatch(/"cak".*0 silent partner/i);
  });

  it('rejects a silent-e vowel whose partner is in the next syllable', () => {
    const errors = checkContent(
      { cards, substeps: [substep([word('cakcake', 'c,a:a_e,k,c,a,k,e:e_silent', { syllables: [3] })])] },
      min,
    );
    expect(errors.join('\n')).toMatch(/silent partner/i);
  });

  it('lets a lesson show a card by its sound-card face', () => {
    const s = substep([word('cake', 'c,a:a_e,k,e:e_silent')]);
    s.groups[0].lesson = [{ show: ['a_e'] }, { try: 'cake' }];
    expect(checkContent({ cards, substeps: [s] }, min)).toEqual([]);
  });
});
```

Import `word` from `../../src/content/build` and `Word` as a type from `../../src/content/types` at the top of the file if they are not already imported.

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run tests/content/check.test.ts`
Expected: the four new silent-e cases FAIL (no such errors are produced, and `show: ['a_e']` is reported as shown before its card is taught).

- [ ] **Step 3: Add the rules**

In `src/content/check.ts`, import the helpers:

```ts
import { cardMap, silentPartners } from './parts';
```

Inside `checkContent`, build the map once beside `cardById`:

```ts
  const cards = cardMap(content.cards);
```

In the group loop where a card's grapheme is registered, also register its sound-card face:

```ts
        const card = cardById.get(c);
        if (card) {
          introducedGraphemes.add(card.grapheme);
          // A lesson may show "a_e", the face of the card, as well as the bare letter a word uses.
          if (card.display) introducedGraphemes.add(card.display);
        }
```

In the per-word loop, after the welded-ending check and before the syllable check, add:

```ts
      // A silent letter only makes sense as the partner of a vowel earlier in its syllable, and
      // such a vowel is silent-e only if it has exactly one partner. Either half alone is a typo.
      const pairs = silentPartners(w, cards);
      w.parts.forEach((p, i) => {
        const type = cards.get(p.card)?.type;
        if (type === 'silent' && !pairs.some((pair) => pair.silent === i)) {
          errors.push(`${s.id}: "${w.text}" has a silent "${p.grapheme}" with no silent-e vowel before it in the same syllable`);
        }
        if (type === 'vce') {
          const n = pairs.filter((pair) => pair.vowel === i).length;
          if (n !== 1) errors.push(`${s.id}: "${w.text}" has a silent-e vowel with ${n} silent partners in its syllable (need exactly 1)`);
        }
      });
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run tests/content/check.test.ts`
Expected: PASS, all cases including the pre-existing ones.

- [ ] **Step 5: Run the whole suite**

Run: `npm test && npm run typecheck`
Expected: PASS. Books 1 to 3 contain no `vce` or `silent` parts, so the new rules are inert there.

- [ ] **Step 6: Commit**

```bash
git add src/content/check.ts tests/content/check.test.ts
git commit -m "Catch a silent e that is not doing a job"
```

---

### Task 3: Keep undrillable cards out of the drill

**Files:**
- Modify: `src/engine/session.ts:126-157` (the current/earlier card sets and the three drills)
- Test: `tests/engine/session.test.ts` if it exists, otherwise create `tests/engine/drill.test.ts`

**Interfaces:**
- Consumes: `isDrillable` from `src/content/parts.ts` (Task 1).
- Produces: no signature change. `SessionPlan.forwardCards`, `SessionPlan.reverseItems[].target`, `reverseItems[].choices` and `spelling` items of type `sound` never contain an undrillable card id.

- [ ] **Step 1: Write the failing test**

Create `tests/engine/drill.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { CONTENT } from '../../src/content';
import { cardMap, isDrillable } from '../../src/content/parts';
import { buildSession } from '../../src/engine/session';
import { seeded } from '../../src/engine/rng';
import type { ProfileState } from '../../src/engine/types';

const cards = cardMap(CONTENT.cards);
const undrillable = CONTENT.cards.filter((c) => !isDrillable(c)).map((c) => c.id);

function stateFor(substep: string): ProfileState {
  // Mirror the shape tests/engine/progression.test.ts uses for a fresh profile.
  return { currentSubstep: substep, currentGroup: 0, sessionsCompleted: 0, lessonPending: true, strengths: {} } as ProfileState;
}

describe('the sound-card drill', () => {
  it('knows there are cards that must never be drilled', () => {
    expect(undrillable).toContain('e_silent');
    expect(undrillable).toContain('u_e_oo');
  });

  it('never shows one, in any drill, in any section', () => {
    for (const s of CONTENT.substeps) {
      for (let seed = 1; seed <= 5; seed++) {
        const plan = buildSession(CONTENT, stateFor(s.id), seeded(seed));
        const shown = [
          ...plan.forwardCards,
          ...plan.reverseItems.flatMap((r) => [r.target, ...r.choices]),
          ...plan.spelling.flatMap((item) => (item.type === 'sound' ? [item.card, ...item.choices] : [])),
        ];
        for (const id of shown) {
          expect(isDrillable(cards.get(id)!), `${s.id} seed ${seed} showed ${id}`).toBe(true);
        }
      }
    }
  });
});
```

If `ProfileState` needs more fields, copy the exact fresh-profile shape from `tests/engine/progression.test.ts` rather than inventing one.

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/engine/drill.test.ts`
Expected: the first case FAILS (`e_silent` is drillable until Task 1's cards exist — if Task 1 is merged it passes) and the second PASSES trivially, because no section teaches a silent-e card yet. Both must be in place now so Task 8 cannot regress them.

- [ ] **Step 3: Filter the card sets**

In `src/engine/session.ts`, import the helper:

```ts
import { cardMap, isDrillable } from '../content/parts';
```

Inside `buildSession`, immediately after `const strengths = state.strengths;`:

```ts
  // A silent letter has no sound, and a second sound of a spelling already in the deck would make
  // the drill unanswerable. Both still appear inside words; neither is ever drilled as a card.
  const deck = cardMap(content.cards);
  const drillable = (id: string) => {
    const c = deck.get(id);
    return c !== undefined && isDrillable(c);
  };
```

Then filter the three sources:

```ts
  const currentCards = (usingStandIns
    ? [...new Set(sub.words.flatMap((w) => w.parts.map((p) => p.card)))]
    : declaredCards
  ).filter(drillable);
  const allCards = availableCards(content, sub.id, groupIndex).filter(drillable);
```

and add `.filter((c) => drillable(c.item))` to the `earlierCards` chain, after the existing `.filter((c) => !currentCards.includes(c.item))`.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run tests/engine/drill.test.ts && npm test`
Expected: PASS. Watch for a section whose `currentCards` becomes empty — none exist today, and Book 4's sections all have drillable cards in their banks.

- [ ] **Step 5: Commit**

```bash
git add src/engine/session.ts tests/engine/drill.test.ts
git commit -m "Never ask the child for the sound of a silent letter"
```

---

### Task 4: Tiles know which card they are

**Files:**
- Modify: `src/ui/tiles.ts`
- Modify: `src/ui/session/SoundCardsPart.tsx:112, 133` (the two `Tile` renders)
- Modify: `src/ui/screens/RecordScreen.tsx:62` and the card list it maps
- Modify: `src/ui/styles.css`
- Test: `tests/ui/soundcards.test.tsx`, `tests/ui/record.test.tsx`

**Interfaces:**
- Consumes: `cardDisplay`, `isDrillable` from `src/content/parts.ts` (Task 1).
- Produces: from `src/ui/tiles.ts`, `cardTypeById(cards: Card[], id: string): CardType`, alongside the existing `cardTypeFor(cards, grapheme)` which is unchanged and still used where only a letter is known.

- [ ] **Step 1: Write the failing tests**

Append to `tests/ui/soundcards.test.tsx`, following that file's existing render helper:

```ts
  it('shows a silent-e vowel card as the a_e pattern, not a bare letter', () => {
    const { container } = renderWithServices(
      <SoundCardsPart forwardCards={['a_e']} reverseItems={[]} onComplete={() => {}} />,
    );
    expect(container.querySelector('.tile')?.textContent).toBe('a_e');
    expect(screen.getByText(/as in cake/i)).toBeInTheDocument();
  });
```

Append to `tests/ui/record.test.tsx`:

```ts
  it('offers a recording slot for each sound, and none for the silent e', async () => {
    renderWithServices(<RecordScreen onBack={() => {}} />);
    expect(await screen.findByTestId('card-row-a_e')).toBeInTheDocument();
    expect(screen.queryByTestId('card-row-e_silent')).toBeNull();
  });
```

Match each file's existing import and render style exactly; do not introduce a second way of rendering.

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run tests/ui/soundcards.test.tsx tests/ui/record.test.tsx`
Expected: FAIL — the tile reads "a" and a silent-e row is present.

- [ ] **Step 3: Add the lookup by id**

In `src/ui/tiles.ts`, add below the existing function:

```ts
/** A letter can belong to more than one card — short e and silent e are both "e" — so anywhere a
 * word's part is on screen, the card id is the only correct key. `cardTypeFor` stays for the two
 * places that genuinely have nothing but a letter: the tile tray and a lesson's `show` step. */
export function cardTypeById(cards: Card[], id: string): CardType {
  return cards.find((c) => c.id === id)?.type ?? 'consonant';
}
```

- [ ] **Step 4: Show the card's own face**

In `src/ui/session/SoundCardsPart.tsx`, import `cardDisplay` from `../../content/parts` and replace both `grapheme={card.grapheme}` with `grapheme={cardDisplay(card)}`.

In `src/ui/screens/RecordScreen.tsx`, import `cardDisplay` from `../../content/parts`, filter the list, and use the card's own type:

```tsx
          {content.cards.filter((c) => c.type !== 'silent').map((c) => {
```

```tsx
                <Tile grapheme={cardDisplay(c)} type={c.type} />
```

The `cardTypeFor` import in `RecordScreen.tsx` is now unused — remove it.

- [ ] **Step 5: Give the new types a colour**

In `src/ui/styles.css`, find the existing `.tile-vowel` and `.tile-welded` rules. Add beside them:

```css
/* A silent-e vowel is still a vowel — same colour, so the child reads it as one. */
.tile-vce { /* copy the declarations of .tile-vowel exactly */ }
/* A letter that makes no sound: present, readable, plainly not part of the tapping. */
.tile-silent { background: var(--paper); color: var(--muted); border-style: dashed; }
```

Copy `.tile-vowel`'s declarations literally into `.tile-vce`; do not use `@extend` or a comma selector, so the two can diverge later. Use the variable names that already exist in the file — check the `:root` block and substitute real ones for `--paper` and `--muted` if those names are not defined.

- [ ] **Step 6: Run the tests**

Run: `npx vitest run tests/ui/soundcards.test.tsx tests/ui/record.test.tsx && npm test && npm run typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/ui/tiles.ts src/ui/session/SoundCardsPart.tsx src/ui/screens/RecordScreen.tsx src/ui/styles.css tests/ui/soundcards.test.tsx tests/ui/record.test.tsx
git commit -m "Show the silent-e sound cards by their own name"
```

---

### Task 5: The tile row and the bridge line

**Files:**
- Create: `src/ui/components/SoundTiles.tsx`
- Modify: `src/ui/styles.css`
- Test: `tests/ui/soundtiles.test.tsx` (create)

**Interfaces:**
- Consumes: `cardMap`, `silentPartners`, `soundingIndexes` from `src/content/parts.ts` (Task 1); `cardTypeById` from `src/ui/tiles.ts` (Task 4).
- Produces: `SoundTiles({ word, tapped, size, className })` — renders one `Tile` per part inside a `div.tilerow`, plus an `svg[data-testid="vce-bridge"]` when the word has silent-e pairs. `tapped` counts **sounding** parts, not parts.

- [ ] **Step 1: Write the failing test**

Create `tests/ui/soundtiles.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { SoundTiles } from '../../src/ui/components/SoundTiles';
import { word } from '../../src/content/build';
import { renderWithServices } from './helpers';

describe('SoundTiles', () => {
  it('shows every letter, including the silent one', () => {
    const { container } = renderWithServices(<SoundTiles word={word('cake', 'c,a:a_e,k,e:e_silent')} tapped={0} />);
    expect([...container.querySelectorAll('.tile')].map((t) => t.textContent)).toEqual(['c', 'a', 'k', 'e']);
  });

  it('dims the silent letter and marks it as the silent type', () => {
    const { container } = renderWithServices(<SoundTiles word={word('cake', 'c,a:a_e,k,e:e_silent')} tapped={0} />);
    const tiles = container.querySelectorAll('.tile');
    expect(tiles[3].classList.contains('tile-silent')).toBe(true);
    expect(tiles[3].classList.contains('tile-dim')).toBe(true);
    expect(tiles[1].classList.contains('tile-vce')).toBe(true);
  });

  it('draws a bridge from the vowel to the e it belongs to', () => {
    const { container } = renderWithServices(<SoundTiles word={word('cake', 'c,a:a_e,k,e:e_silent')} tapped={0} />);
    expect(container.querySelector('[data-testid="vce-bridge"]')?.getAttribute('data-pairs')).toBe('1-3');
  });

  it('bridges the right pair in a long word', () => {
    const w = word('invite', 'i,n,v,i:i_e,t,e:e_silent', { syllables: [2] });
    const { container } = renderWithServices(<SoundTiles word={w} tapped={0} />);
    expect(container.querySelector('[data-testid="vce-bridge"]')?.getAttribute('data-pairs')).toBe('3-5');
  });

  it('draws no bridge for a word with no silent letter', () => {
    const { container } = renderWithServices(<SoundTiles word={word('map', 'm,a,p')} tapped={0} />);
    expect(container.querySelector('[data-testid="vce-bridge"]')).toBeNull();
  });

  it('lights a silent letter together with the vowel it serves', () => {
    const w = word('cake', 'c,a:a_e,k,e:e_silent');
    const { container } = renderWithServices(<SoundTiles word={w} tapped={2} />);
    const tiles = container.querySelectorAll('.tile');
    expect(tiles[1].classList.contains('tile-selected')).toBe(true);   // the a is tapped
    expect(tiles[3].classList.contains('tile-selected')).toBe(true);   // so its e lights too
    expect(tiles[2].classList.contains('tile-selected')).toBe(false);  // the k is not yet
  });

  it('marks syllable starts', () => {
    const w = word('invite', 'i,n,v,i:i_e,t,e:e_silent', { syllables: [2] });
    const { container } = renderWithServices(<SoundTiles word={w} tapped={0} />);
    const starts = container.querySelectorAll('.tile-syllable-start');
    expect(starts.length).toBe(1);
    expect(starts[0].textContent).toBe('v');
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/ui/soundtiles.test.tsx`
Expected: FAIL — cannot resolve `SoundTiles`.

- [ ] **Step 3: Build the component**

Create `src/ui/components/SoundTiles.tsx`:

```tsx
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Word } from '../../content/types';
import { cardMap, silentPartners, soundingIndexes } from '../../content/parts';
import { useServices } from '../services';
import { cardTypeById } from '../tiles';
import { Tile } from './Tile';

interface Props {
  word: Word;
  /** How many of the word's *sounds* have been tapped. A silent letter has no sound of its own
   * and lights up with the vowel it serves. */
  tapped?: number;
  size?: 'normal' | 'large';
  className?: string;
}

interface Arc { x1: number; x2: number; y: number }

export function SoundTiles({ word, tapped = 0, size = 'normal', className }: Props) {
  const { content } = useServices();
  const cards = cardMap(content.cards);
  const pairs = silentPartners(word, cards);
  const sounding = soundingIndexes(word, cards);
  const starts = new Set(word.syllables ?? []);

  const rowRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLElement | null)[]>([]);
  const [arcs, setArcs] = useState<Arc[]>([]);

  // The arc has to start and end on real tiles, so it is measured after layout and again on
  // resize. Under jsdom every rectangle is zero; the overlay still renders, which is what the
  // tests assert on, and the browser test covers how it actually looks.
  const measure = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    const base = row.getBoundingClientRect();
    const next: Arc[] = [];
    for (const { vowel, silent } of pairs) {
      const a = tileRefs.current[vowel]?.getBoundingClientRect();
      const b = tileRefs.current[silent]?.getBoundingClientRect();
      if (!a || !b) continue;
      next.push({
        x1: a.left - base.left + a.width / 2,
        x2: b.left - base.left + b.width / 2,
        y: a.bottom - base.top,
      });
    }
    setArcs(next);
  }, [pairs]);

  useLayoutEffect(measure, [measure, word]);

  useEffect(() => {
    if (pairs.length === 0) return;
    // ResizeObserver does not exist in jsdom, so guard rather than polyfill.
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro && rowRef.current) ro.observe(rowRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure, pairs.length]);

  const litVowels = new Set(sounding.slice(0, tapped));
  const isLit = (i: number) => litVowels.has(i) || pairs.some((p) => p.silent === i && litVowels.has(p.vowel));

  return (
    <div className={['tilerow', className].filter(Boolean).join(' ')} ref={rowRef}>
      <div className="row row-tight">
        {word.parts.map((p, i) => {
          const type = cardTypeById(content.cards, p.card);
          return (
            <Tile
              key={i}
              ref={(el: HTMLElement | null) => { tileRefs.current[i] = el; }}
              grapheme={p.grapheme}
              type={type}
              size={size}
              selected={isLit(i)}
              dim={type === 'silent'}
              className={starts.has(i) ? 'tile-syllable-start' : ''}
            />
          );
        })}
      </div>
      {pairs.length > 0 && (
        <svg
          className="vce-bridge"
          data-testid="vce-bridge"
          data-pairs={pairs.map((p) => `${p.vowel}-${p.silent}`).join(' ')}
          aria-hidden="true"
        >
          {arcs.map((a, i) => (
            <path key={i} d={`M ${a.x1} ${a.y} Q ${(a.x1 + a.x2) / 2} ${a.y + 26} ${a.x2} ${a.y}`} />
          ))}
        </svg>
      )}
    </div>
  );
}
```

`Tile` is currently a plain function component and cannot take a `ref`. Convert it with `forwardRef`, keeping every existing prop and both branches:

```tsx
import { forwardRef } from 'react';
import type { CardType } from '../../content/types';

interface Props { /* unchanged */ }

export const Tile = forwardRef<HTMLElement, Props>(function Tile(
  { grapheme, type = 'consonant', size = 'normal', selected, dim, onClick, label, className },
  ref,
) {
  const cls = ['tile', `tile-${type}`, `tile-${size}`, selected ? 'tile-selected' : '', dim ? 'tile-dim' : '', className ?? ''].filter(Boolean).join(' ');
  if (!onClick) return <span className={cls} ref={ref as React.Ref<HTMLSpanElement>}>{grapheme}</span>;
  return (
    <button type="button" className={cls} ref={ref as React.Ref<HTMLButtonElement>} onClick={onClick} aria-label={label ?? grapheme}>
      {grapheme}
    </button>
  );
});
```

- [ ] **Step 4: Style the row and the arc**

In `src/ui/styles.css`, beside the existing `.tapdots` rules:

```css
.tilerow { position: relative; padding-bottom: 30px; }
.vce-bridge {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
.vce-bridge path { fill: none; stroke: var(--accent); stroke-width: 4; stroke-linecap: round; opacity: 0.7; }
```

- [ ] **Step 5: Run the tests**

Run: `npx vitest run tests/ui/soundtiles.test.tsx`
Expected: PASS, all seven cases.

- [ ] **Step 6: Run the whole suite**

Run: `npm test && npm run typecheck`
Expected: PASS. `Tile` is used in several places; the `forwardRef` conversion must not change any of them.

- [ ] **Step 7: Commit**

```bash
git add src/ui/components/SoundTiles.tsx src/ui/components/Tile.tsx src/ui/styles.css tests/ui/soundtiles.test.tsx
git commit -m "Draw the line from the vowel to the e that makes it say its name"
```

---

### Task 6: Three taps for a four-letter word

**Files:**
- Modify: `src/ui/components/TapDots.tsx`
- Test: `tests/ui/tapdots.test.tsx`

**Interfaces:**
- Consumes: `SoundTiles` (Task 5), `cardMap`, `soundingIndexes` (Task 1).
- Produces: no signature change. `TapDots` renders one dot per **sound**, labelled `Sound 1` upward.

- [ ] **Step 1: Write the failing tests**

Append to `tests/ui/tapdots.test.tsx`:

```tsx
import { word } from '../../src/content/build';

describe('TapDots with a silent letter', () => {
  const cake = () => word('cake', 'c,a:a_e,k,e:e_silent');

  it('gives a four-letter word three dots and four tiles', () => {
    const { container } = renderWithServices(<TapDots word={cake()} mode="try" onResult={() => {}} />);
    expect(container.querySelectorAll('button.dot').length).toBe(3);
    expect(container.querySelectorAll('.tile').length).toBe(4);
    expect(screen.queryByRole('button', { name: 'Sound 4' })).toBeNull();
  });

  it('plays the three sounds it has, not the silent one', async () => {
    const user = userEvent.setup();
    const audio = new FakeAudio();
    const onResult = vi.fn();
    renderWithServices(<TapDots word={cake()} mode="try" onResult={onResult} />, { audio });
    await user.click(screen.getByRole('button', { name: 'Sound 1' }));
    await user.click(screen.getByRole('button', { name: 'Sound 2' }));
    await user.click(screen.getByRole('button', { name: 'Sound 3' }));
    expect(audio.played).toEqual(['c', 'a_e', 'k']);
    await user.click(await screen.findByRole('button', { name: 'Blend' }));
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true));
    expect(audio.spoken).toContain('cake');
  });

  it('in demo mode, steps through the sounds only', async () => {
    const audio = new FakeAudio();
    const onResult = vi.fn();
    renderWithServices(<TapDots word={cake()} mode="demo" onResult={onResult} />, { audio });
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true));
    expect(audio.played).toEqual(['c', 'a_e', 'k']);
  });

  it('marks the syllable start on the dot that belongs to it', () => {
    const w = word('invite', 'i,n,v,i:i_e,t,e:e_silent', { syllables: [2] });
    const { container } = renderWithServices(<TapDots word={w} mode="try" onResult={() => {}} />);
    expect(container.querySelectorAll('button.dot').length).toBe(5);
    const marked = container.querySelectorAll('button.dot.dot-syllable-start');
    expect(marked.length).toBe(1);
    expect(marked[0].getAttribute('aria-label')).toBe('Sound 3');
  });
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run tests/ui/tapdots.test.tsx`
Expected: the four new cases FAIL — there are four dots and the demo plays `e_silent`.

- [ ] **Step 3: Rewrite TapDots around sounds**

In `src/ui/components/TapDots.tsx`:

Replace the `cardTypeFor`/`Tile` imports with `SoundTiles`, and import the part helpers:

```tsx
import { cardMap, soundingIndexes } from '../../content/parts';
import { SoundTiles } from './SoundTiles';
```

Inside the component, derive the sounding indexes once:

```tsx
  const sounding = soundingIndexes(word, cardMap(content.cards));
```

Every place that counted `word.parts.length` as the number of taps now uses `sounding.length`, and every place that indexed `word.parts[i]` for a tap now uses `word.parts[sounding[i]]`:

- the demo loop: `for (let i = 0; i < sounding.length; i++) { setTapped(i + 1); await audio.playCard(word.parts[sounding[i]].card); ... }`
- `tapDot`: guard on `tappedRef.current >= sounding.length`, and play `word.parts[sounding[i]].card`
- `const done = tapped >= sounding.length;`
- `const long = word.parts.length > 6;` — unchanged, this is about how much fits on screen

Replace the tiles `<div className="row row-tight">…</div>` block entirely with:

```tsx
      <SoundTiles word={word} tapped={tapped} />
```

and render the dots from `sounding`:

```tsx
      <div className="dots">
        {sounding.map((partIndex, i) =>
          mode === 'try' ? (
            <button
              key={i}
              type="button"
              className={`dot ${i < tapped ? 'dot-lit' : ''} ${starts.has(partIndex) ? 'dot-syllable-start' : ''}`}
              aria-label={`Sound ${i + 1}`}
              onClick={() => tapDot(i)}
            />
          ) : (
            <span key={i} className={`dot ${i < tapped ? 'dot-lit' : ''} ${starts.has(partIndex) ? 'dot-syllable-start' : ''}`} aria-hidden="true" />
          ),
        )}
      </div>
```

`starts` stays `new Set(word.syllables ?? [])` — indexes into `parts` — and is now read through `partIndex`, which is what makes the syllable mark land on the right dot.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run tests/ui/tapdots.test.tsx`
Expected: PASS — the four new cases **and** all eight pre-existing ones, including the StrictMode, ghost-tap and double-blend cases. For a word with no silent letter, `sounding` is every index, so nothing about Books 1 to 3 changes.

- [ ] **Step 5: Run the whole suite**

Run: `npm test && npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/ui/components/TapDots.tsx tests/ui/tapdots.test.tsx
git commit -m "Give a silent letter no tap dot of its own"
```

---

### Task 7: The rest of the screens

**Files:**
- Modify: `src/ui/session/WordWorkPart.tsx:120`
- Test: `tests/ui/wordwork.test.tsx`

**Interfaces:**
- Consumes: `SoundTiles` (Task 5).
- Produces: nothing new.

- [ ] **Step 1: Write the failing test**

Append to `tests/ui/wordwork.test.tsx`, following that file's existing setup for rendering a `find` or `tap` item. Build an item whose word is `word('cake', 'c,a:a_e,k,e:e_silent')` and assert:

```tsx
  it('shows a silent-e word with its bridge line when the word is displayed', () => {
    // build the item the way the other cases in this file do, with the word above
    expect(container.querySelector('[data-testid="vce-bridge"]')?.getAttribute('data-pairs')).toBe('1-3');
    expect(container.querySelectorAll('.tile').length).toBe(4);
  });
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/ui/wordwork.test.tsx`
Expected: FAIL — no bridge element.

- [ ] **Step 3: Swap the tile row**

In `src/ui/session/WordWorkPart.tsx`, replace:

```tsx
          {item.word.parts.map((p, k) => <Tile key={k} grapheme={p.grapheme} type={cardTypeFor(content.cards, p.grapheme)} size="large" />)}
```

with:

```tsx
          <SoundTiles word={item.word} tapped={item.word.parts.length} size="large" />
```

Import `SoundTiles` from `../components/SoundTiles`. Remove the `cardTypeFor` and `Tile` imports if they become unused; leave them if the file uses them elsewhere.

`tapped` is deliberately larger than the sound count here: this is the word being shown, not tapped, so every tile is lit.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run tests/ui/wordwork.test.tsx && npm test && npm run typecheck && npm run build`
Expected: PASS on all four.

- [ ] **Step 5: Check it by eye once**

Run: `npm run dev`, open the printed address, start a session, and confirm the tapping screen still looks right for an ordinary Book 1 word. There is no Book 4 content yet, so the bridge cannot be seen in the app until Task 14. Paste what you saw into the task report.

- [ ] **Step 6: Commit**

```bash
git add src/ui/session/WordWorkPart.tsx tests/ui/wordwork.test.tsx
git commit -m "Show the silent-e bridge everywhere a word is displayed"
```

---

### Tasks 8 to 13: Book 4 content, one section each

Each of these six tasks is self-contained below. They differ in their section, their cards and their word patterns; the rules and steps are repeated in full in each, because an implementer sees only its own task.

---

### Task 8: Section 4.1 — silent e with a and i

**Depends on:** Task 7.

**Files:**
- Create: `src/content/substeps/s4-1.ts`
- Test: `tests/content/s4-1.test.ts`

**Interfaces:**
- Consumes: the `vce` and `silent` card types and the cards `a_e i_e o_e u_e e_e u_e_oo e_silent` (Task 1); the silent-e checker rules (Task 2).
- Produces: `export const SUBSTEP_4_1: Substep` from `src/content/substeps/s4-1.ts`. Task 14 imports it under that exact name and registers it.

**Read before writing a single word:** `docs/superpowers/specs/2026-09-13-book-3-deepening-and-book-4-design.md`, sections "Part two" and "Decisions the owner made".

**Template.** Copy the shape of `src/content/substeps/s3-5.ts`. Export `SUBSTEP_4_1: Substep` with `id`, `title`, `parentSummary` (two or three sentences addressed to a parent, plain English, no jargon, no program name), `groups`, `concepts`, `sightWords`, `words`, `sentences`, `stories`.

**Targets for this section:** at least 30 real words, 15 nonsense words, 12 sentences, and 2 stories with 2 or 3 questions each. The checker's floor is lower (20/10/6/1/1); hit the targets, not the floor.

**How a silent-e word is written.** The vowel maps to its `vce` card and the final e to `e_silent`:

```ts
word('cake', 'c,a:a_e,k,e:e_silent')
word('smile', 's,m,i:i_e,l,e:e_silent')
word('invite', 'i,n,v,i:i_e,t,e:e_silent', { syllables: [2] })
```

`word` and `nonsense` are imported from `../build`. A nonsense word takes the same shape: `nonsense('blane', 'b,l,a:a_e,n,e:e_silent')`.

**Content rules — every one of these binds every word, sentence, story and question you write:**
- Decodable with cards taught at or before this section.
- No word text may exist in two sections' banks (case-insensitive). The checker catches this only once everything is registered, at Task 14 — so avoid obvious collisions with the sections before yours.
- Nonsense words: pronounceable, follow the section's pattern, never a real word, name or slang, never one letter from a rude word. Rejected in the first build: gick, gock, crup, loxes, unstrict, rong, dall, thell, sut, tud, huck.
- Sentences and story sentences use only taught words and the sight words this section or an earlier one declares.
- Story titles and answer choices must be decodable. Question prompts are spoken aloud by the app and may use any words.
- Every answer choice must be answerable from its own story, and exactly one choice may be defensible.
- Author every story question with the correct answer at index 0; the engine shuffles per session.
- Proper nouns are capitalised in `text` with lower-case `parts`, and are never used as a "find" target or distractor.
- **Reject any word where a letter takes a sound the child has not been taught.** The trap in Book 4 is s saying /z/. Banned outright: these, rose, nose, wise, chose, those, close, doze, prize, confuse, refuse, surprise. Say each candidate aloud before you use it.
- Spoken lesson lines must never put a schwa on a consonant: write "b", not "buh".
- Never write the word "Wilson".

**Steps:**

- [ ] **Step 1: Write the test first**

Create `tests/content/s4-1.test.ts` modelled exactly on `tests/content/s3-5.test.ts`: import `CARDS`, `checkContent`, the earlier substeps this one depends on, and this one; build a small `Content`; assert `checkContent(content)` is `[]`. Then add this section's own rule:

```ts
  it('ends every real word with a silent e that is doing a job', () => {
    const cards = cardMap(CARDS);
    for (const w of SUBSTEP_4_1.words) {
      expect(w.parts[w.parts.length - 1].card, w.text).toBe('e_silent');
      expect(w.parts.filter((p) => cards.get(p.card)?.type === 'vce').length, w.text).toBe(1);
    }
  });

  it('teaches a before i, and keeps them in separate groups', () => {
    expect(SUBSTEP_4_1.groups.map((g) => g.cards)).toEqual([['a_e', 'e_silent'], ['i_e']]);
  });
```

Import `cardMap` from `../../src/content/parts` and `CARDS` from `../../src/content/cards`.

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/content/s4-1.test.ts`
Expected: FAIL — cannot resolve `../../src/content/substeps/s4-1`.

- [ ] **Step 3: Write the section**

Create `src/content/substeps/s4-1.ts`.

- `id: '4.1'`, `title: 'Silent e with a and i'`.
- **Two groups**, so the lesson lands one vowel at a time:
  `groups: [{ cards: ['a_e', 'e_silent'], lesson: [...] }, { cards: ['i_e'], lesson: [...] }]`.
  `e_silent` is introduced with the first group because the first group needs it.
- **The engine filters words, sentences and stories by group.** Group 1's material may use only `a_e` — no `i_e` anywhere in it. The whole-program test at Task 14 requires each group to have at least one story and two sentences it can read on its own, so you must write an `a_e`-only story as well as a mixed one.
- `concepts: ['silent-e']`.
- Words: at least 16 using `a_e` and at least 16 using `i_e`, plus 15 nonsense words split across both. Real candidates — check each aloud before using: cake, made, name, game, late, gate, tape, safe, wave, cave, date, fade, lane, male, bake, rake, sale, tale, pale, mane / ride, smile, time, dime, mile, pile, side, wide, life, line, mine, fine, five, hide, bite, kite, ripe, wipe, nine, vine.
- `sightWords`: only what your stories actually need. Put a short comment beside each saying which story needs it.
- The first group's lesson must teach the idea outright: the e at the end makes no sound of its own; its job is to make the vowel say its name. Show `a_e`, tap `cake`, then let her try `made`, `name`, `late`. The second group's lesson does the same for `i_e` and can lean on what group 1 taught.

- [ ] **Step 4: Run the test**

Run: `npx vitest run tests/content/s4-1.test.ts`
Expected: PASS with zero checker errors. Fix the content, never the checker.

- [ ] **Step 5: Read every word back**

Read the finished file top to bottom against the content rules above. Check by hand what the checker cannot see: every nonsense word against the safety bar, every story title and answer choice for decodability, every question for a second defensible answer, every real word for a letter taking an untaught sound, every story for an ending that actually ends. Write what you checked, and what you rejected, into your report.

- [ ] **Step 6: Run the whole suite and commit**

Run: `npm test && npm run typecheck`

```bash
git add src/content/substeps/s4-1.ts tests/content/s4-1.test.ts
git commit -m "Teach the e that makes a and i say their names"
```

---

### Task 9: Section 4.2 — silent e with o and u

**Depends on:** Task 8.

**Files:**
- Create: `src/content/substeps/s4-2.ts`
- Test: `tests/content/s4-2.test.ts`

**Interfaces:**
- Consumes: the `vce` and `silent` card types and the cards `a_e i_e o_e u_e e_e u_e_oo e_silent` (Task 1); the silent-e checker rules (Task 2).
- Produces: `export const SUBSTEP_4_2: Substep` from `src/content/substeps/s4-2.ts`. Task 14 imports it under that exact name and registers it.

**Read before writing a single word:** `docs/superpowers/specs/2026-09-13-book-3-deepening-and-book-4-design.md`, sections "Part two" and "Decisions the owner made".

**Template.** Copy the shape of `src/content/substeps/s3-5.ts`. Export `SUBSTEP_4_2: Substep` with `id`, `title`, `parentSummary` (two or three sentences addressed to a parent, plain English, no jargon, no program name), `groups`, `concepts`, `sightWords`, `words`, `sentences`, `stories`.

**Targets for this section:** at least 30 real words, 15 nonsense words, 12 sentences, and 2 stories with 2 or 3 questions each. The checker's floor is lower (20/10/6/1/1); hit the targets, not the floor.

**How a silent-e word is written.** The vowel maps to its `vce` card and the final e to `e_silent`:

```ts
word('cake', 'c,a:a_e,k,e:e_silent')
word('smile', 's,m,i:i_e,l,e:e_silent')
word('invite', 'i,n,v,i:i_e,t,e:e_silent', { syllables: [2] })
```

`word` and `nonsense` are imported from `../build`. A nonsense word takes the same shape: `nonsense('blane', 'b,l,a:a_e,n,e:e_silent')`.

**Content rules — every one of these binds every word, sentence, story and question you write:**
- Decodable with cards taught at or before this section.
- No word text may exist in two sections' banks (case-insensitive). The checker catches this only once everything is registered, at Task 14 — so avoid obvious collisions with the sections before yours.
- Nonsense words: pronounceable, follow the section's pattern, never a real word, name or slang, never one letter from a rude word. Rejected in the first build: gick, gock, crup, loxes, unstrict, rong, dall, thell, sut, tud, huck.
- Sentences and story sentences use only taught words and the sight words this section or an earlier one declares.
- Story titles and answer choices must be decodable. Question prompts are spoken aloud by the app and may use any words.
- Every answer choice must be answerable from its own story, and exactly one choice may be defensible.
- Author every story question with the correct answer at index 0; the engine shuffles per session.
- Proper nouns are capitalised in `text` with lower-case `parts`, and are never used as a "find" target or distractor.
- **Reject any word where a letter takes a sound the child has not been taught.** The trap in Book 4 is s saying /z/. Banned outright: these, rose, nose, wise, chose, those, close, doze, prize, confuse, refuse, surprise. Say each candidate aloud before you use it.
- Spoken lesson lines must never put a schwa on a consonant: write "b", not "buh".
- Never write the word "Wilson".

**Steps:**

- [ ] **Step 1: Write the test first**

Create `tests/content/s4-2.test.ts` modelled exactly on `tests/content/s3-5.test.ts`: import `CARDS`, `checkContent`, the earlier substeps this one depends on, and this one; build a small `Content`; assert `checkContent(content)` is `[]`. Then add this section's own rule:

```ts
  it('uses only the o and u silent-e vowels', () => {
    for (const w of SUBSTEP_4_2.words) {
      const vowel = w.parts.find((p) => p.card.endsWith('_e') && p.card !== 'e_silent');
      expect(['o_e', 'u_e'], w.text).toContain(vowel?.card);
    }
  });

  it('teaches o before u, and keeps them in separate groups', () => {
    expect(SUBSTEP_4_2.groups.map((g) => g.cards)).toEqual([['o_e'], ['u_e']]);
  });
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/content/s4-2.test.ts`
Expected: FAIL — cannot resolve `../../src/content/substeps/s4-2`.

- [ ] **Step 3: Write the section**

Create `src/content/substeps/s4-2.ts`.

- `id: '4.2'`, `title: 'Silent e with o and u'`. Two groups: `[{ cards: ['o_e'], lesson: [...] }, { cards: ['u_e'], lesson: [...] }]`.
- `concepts: []` — `silent-e` was introduced in 4.1 and concepts are cumulative.
- Group 1's material may use only `o_e` (plus everything from Books 1 to 3 and from 4.1). It needs its own story and two sentences.
- `o_e` candidates: hope, stone, woke, home, bone, note, rope, hole, pole, joke, code, mole, spoke, dome, cone, tone, robe, mode, lone, sole.
- `u_e` candidates, the *mule* sound /yoo/: mule, cube, cute, fume, use, mute, huge, cure, pure, duke.
- **Banned here, because s or z would say /z/:** rose, nose, close, chose, those, doze, hose, prose, fuse.
- **Leave for 4.3:** June, rule, flute, prune, tune, dune — those are the /oo/ sound and belong to the `u_e_oo` card. **Leave for 4.4:** globe, stove, smoke, slope, stroke, throne.
- Both lessons say plainly that this is the same rule as 4.1 with a different vowel.

- [ ] **Step 4: Run the test**

Run: `npx vitest run tests/content/s4-2.test.ts`
Expected: PASS with zero checker errors. Fix the content, never the checker.

- [ ] **Step 5: Read every word back**

Read the finished file top to bottom against the content rules above. Check by hand what the checker cannot see: every nonsense word against the safety bar, every story title and answer choice for decodability, every question for a second defensible answer, every real word for a letter taking an untaught sound, every story for an ending that actually ends. Write what you checked, and what you rejected, into your report.

- [ ] **Step 6: Run the whole suite and commit**

Run: `npm test && npm run typecheck`

```bash
git add src/content/substeps/s4-2.ts tests/content/s4-2.test.ts
git commit -m "Teach the e that makes o and u say their names"
```

---

### Task 10: Section 4.3 — silent e with e, and u-e's second sound

**Depends on:** Task 9.

**Files:**
- Create: `src/content/substeps/s4-3.ts`
- Test: `tests/content/s4-3.test.ts`

**Interfaces:**
- Consumes: the `vce` and `silent` card types and the cards `a_e i_e o_e u_e e_e u_e_oo e_silent` (Task 1); the silent-e checker rules (Task 2).
- Produces: `export const SUBSTEP_4_3: Substep` from `src/content/substeps/s4-3.ts`. Task 14 imports it under that exact name and registers it.

**Read before writing a single word:** `docs/superpowers/specs/2026-09-13-book-3-deepening-and-book-4-design.md`, sections "Part two" and "Decisions the owner made".

**Template.** Copy the shape of `src/content/substeps/s3-5.ts`. Export `SUBSTEP_4_3: Substep` with `id`, `title`, `parentSummary` (two or three sentences addressed to a parent, plain English, no jargon, no program name), `groups`, `concepts`, `sightWords`, `words`, `sentences`, `stories`.

**Targets for this section:** at least 30 real words, 15 nonsense words, 12 sentences, and 2 stories with 2 or 3 questions each. The checker's floor is lower (20/10/6/1/1); hit the targets, not the floor.

**How a silent-e word is written.** The vowel maps to its `vce` card and the final e to `e_silent`:

```ts
word('cake', 'c,a:a_e,k,e:e_silent')
word('smile', 's,m,i:i_e,l,e:e_silent')
word('invite', 'i,n,v,i:i_e,t,e:e_silent', { syllables: [2] })
```

`word` and `nonsense` are imported from `../build`. A nonsense word takes the same shape: `nonsense('blane', 'b,l,a:a_e,n,e:e_silent')`.

**Content rules — every one of these binds every word, sentence, story and question you write:**
- Decodable with cards taught at or before this section.
- No word text may exist in two sections' banks (case-insensitive). The checker catches this only once everything is registered, at Task 14 — so avoid obvious collisions with the sections before yours.
- Nonsense words: pronounceable, follow the section's pattern, never a real word, name or slang, never one letter from a rude word. Rejected in the first build: gick, gock, crup, loxes, unstrict, rong, dall, thell, sut, tud, huck.
- Sentences and story sentences use only taught words and the sight words this section or an earlier one declares.
- Story titles and answer choices must be decodable. Question prompts are spoken aloud by the app and may use any words.
- Every answer choice must be answerable from its own story, and exactly one choice may be defensible.
- Author every story question with the correct answer at index 0; the engine shuffles per session.
- Proper nouns are capitalised in `text` with lower-case `parts`, and are never used as a "find" target or distractor.
- **Reject any word where a letter takes a sound the child has not been taught.** The trap in Book 4 is s saying /z/. Banned outright: these, rose, nose, wise, chose, those, close, doze, prize, confuse, refuse, surprise. Say each candidate aloud before you use it.
- Spoken lesson lines must never put a schwa on a consonant: write "b", not "buh".
- Never write the word "Wilson".

**Steps:**

- [ ] **Step 1: Write the test first**

Create `tests/content/s4-3.test.ts` modelled exactly on `tests/content/s3-5.test.ts`: import `CARDS`, `checkContent`, the earlier substeps this one depends on, and this one; build a small `Content`; assert `checkContent(content)` is `[]`. Then add this section's own rule:

```ts
  it('uses only the e silent-e vowel and the second sound of u', () => {
    for (const w of SUBSTEP_4_3.words) {
      const vowel = w.parts.find((p) => p.card.endsWith('_e') && p.card !== 'e_silent');
      expect(['e_e', 'u_e_oo'], w.text).toContain(vowel?.card);
    }
  });

  it('never shows the second u sound as a card face of its own', () => {
    for (const g of SUBSTEP_4_3.groups) {
      for (const step of g.lesson) {
        if ('show' in step) expect(step.show).not.toContain('u_e_oo');
      }
    }
  });

  it('teaches both in one group, because the second u sound is not a new card face', () => {
    expect(SUBSTEP_4_3.groups.map((g) => g.cards)).toEqual([['e_e', 'u_e_oo']]);
  });
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/content/s4-3.test.ts`
Expected: FAIL — cannot resolve `../../src/content/substeps/s4-3`.

- [ ] **Step 3: Write the section**

Create `src/content/substeps/s4-3.ts`.

- `id: '4.3'`, `title: 'Silent e with e, and u_e saying oo'`. **One group teaching both cards:** `groups: [{ cards: ['e_e', 'u_e_oo'], lesson: [...] }]`, with a single lesson that teaches `e_e` first and then turns to the second sound of `u_e`.

  Why one group and not two, since 4.1 and 4.2 each use two: a group exists so the sound-card drill can introduce one new card face at a time. `u_e_oo` is not a new face — it is a second sound for the `u_e` card the child already has, and it is never drilled (`drill: false`). Splitting it into its own group would leave that group's drill showing nothing but `e_e`, a card taught moments earlier, which is worse than not splitting. Everything else about the section is unchanged.
- `e_e` is genuinely rare in one-syllable words. Honest candidates: eve, Pete, Steve, theme, gene. Banned: scene (c says /s/), here and mere (r-controlled, not taught), these (s says /z/).
- **If you cannot find enough honest `e_e` real words, say so plainly in your report and fill the bank with `u_e_oo` words rather than inventing strained ones.** Do not take `compete`, `complete`, `concrete` or `athlete` — they are two-syllable and belong to Task 12 (section 4.5).
- `u_e_oo` candidates, the *rule* sound /oo/: June, rule, flute, prune, tune, dune, plume, brute, crude, dude, rude, jute, flume.
- **The second group's lesson must say plainly that this is the same spelling with a second sound**, and that when one sound does not make a word she should try the other. Show the card face `u_e` — never `u_e_oo`, which is an internal name for a card the child never sees on its own.
- The section's sound-card drill will show `e_e` as its one current card, plus review cards from earlier sections. That is correct and expected: `e_e` is the only new card face this section teaches.

- [ ] **Step 4: Run the test**

Run: `npx vitest run tests/content/s4-3.test.ts`
Expected: PASS with zero checker errors. Fix the content, never the checker.

- [ ] **Step 5: Read every word back**

Read the finished file top to bottom against the content rules above. Check by hand what the checker cannot see: every nonsense word against the safety bar, every story title and answer choice for decodability, every question for a second defensible answer, every real word for a letter taking an untaught sound, every story for an ending that actually ends. Write what you checked, and what you rejected, into your report.

- [ ] **Step 6: Run the whole suite and commit**

Run: `npm test && npm run typecheck`

```bash
git add src/content/substeps/s4-3.ts tests/content/s4-3.test.ts
git commit -m "Teach the last silent-e vowel, and u's second sound"
```

---

### Task 11: Section 4.4 — silent e after blends and digraphs

**Depends on:** Task 10. May run in parallel with Tasks 12 and 13.

**Files:**
- Create: `src/content/substeps/s4-4.ts`
- Test: `tests/content/s4-4.test.ts`

**Interfaces:**
- Consumes: the `vce` and `silent` card types and the cards `a_e i_e o_e u_e e_e u_e_oo e_silent` (Task 1); the silent-e checker rules (Task 2).
- Produces: `export const SUBSTEP_4_4: Substep` from `src/content/substeps/s4-4.ts`. Task 14 imports it under that exact name and registers it.

**Read before writing a single word:** `docs/superpowers/specs/2026-09-13-book-3-deepening-and-book-4-design.md`, sections "Part two" and "Decisions the owner made".

**Template.** Copy the shape of `src/content/substeps/s3-5.ts`. Export `SUBSTEP_4_4: Substep` with `id`, `title`, `parentSummary` (two or three sentences addressed to a parent, plain English, no jargon, no program name), `groups`, `concepts`, `sightWords`, `words`, `sentences`, `stories`.

**Targets for this section:** at least 30 real words, 15 nonsense words, 12 sentences, and 2 stories with 2 or 3 questions each. The checker's floor is lower (20/10/6/1/1); hit the targets, not the floor.

**How a silent-e word is written.** The vowel maps to its `vce` card and the final e to `e_silent`:

```ts
word('cake', 'c,a:a_e,k,e:e_silent')
word('smile', 's,m,i:i_e,l,e:e_silent')
word('invite', 'i,n,v,i:i_e,t,e:e_silent', { syllables: [2] })
```

`word` and `nonsense` are imported from `../build`. A nonsense word takes the same shape: `nonsense('blane', 'b,l,a:a_e,n,e:e_silent')`.

**Content rules — every one of these binds every word, sentence, story and question you write:**
- Decodable with cards taught at or before this section.
- No word text may exist in two sections' banks (case-insensitive). The checker catches this only once everything is registered, at Task 14 — so avoid obvious collisions with the sections before yours.
- Nonsense words: pronounceable, follow the section's pattern, never a real word, name or slang, never one letter from a rude word. Rejected in the first build: gick, gock, crup, loxes, unstrict, rong, dall, thell, sut, tud, huck.
- Sentences and story sentences use only taught words and the sight words this section or an earlier one declares.
- Story titles and answer choices must be decodable. Question prompts are spoken aloud by the app and may use any words.
- Every answer choice must be answerable from its own story, and exactly one choice may be defensible.
- Author every story question with the correct answer at index 0; the engine shuffles per session.
- Proper nouns are capitalised in `text` with lower-case `parts`, and are never used as a "find" target or distractor.
- **Reject any word where a letter takes a sound the child has not been taught.** The trap in Book 4 is s saying /z/. Banned outright: these, rose, nose, wise, chose, those, close, doze, prize, confuse, refuse, surprise. Say each candidate aloud before you use it.
- Spoken lesson lines must never put a schwa on a consonant: write "b", not "buh".
- Never write the word "Wilson".

**Steps:**

- [ ] **Step 1: Write the test first**

Create `tests/content/s4-4.test.ts` modelled exactly on `tests/content/s3-5.test.ts`: import `CARDS`, `checkContent`, the earlier substeps this one depends on, and this one; build a small `Content`; assert `checkContent(content)` is `[]`. Then add this section's own rule:

```ts
  it('starts every real word with a blend or a digraph', () => {
    const cards = cardMap(CARDS);
    for (const w of SUBSTEP_4_4.words.filter((w) => w.kind === 'real')) {
      const first = cards.get(w.parts[0].card);
      const second = cards.get(w.parts[1].card);
      const isDigraph = first?.type === 'digraph';
      const isBlend = first?.type === 'consonant' && second?.type === 'consonant';
      expect(isDigraph || isBlend, w.text).toBe(true);
    }
  });
```

Import `cardMap` from `../../src/content/parts` and `CARDS` from `../../src/content/cards`.

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/content/s4-4.test.ts`
Expected: FAIL — cannot resolve `../../src/content/substeps/s4-4`.

- [ ] **Step 3: Write the section**

Create `src/content/substeps/s4-4.ts`.

- `id: '4.4'`, `title: 'Silent e after blends and digraphs'`.
- **One group with no new cards:** `groups: [{ cards: [], lesson: [...] }]`. A section with no cards of its own uses its word bank as the stand-in set for the sound drill, exactly as 3.1 to 3.4 already do. This is existing engine behaviour and needs no code change.
- `concepts: []`.
- Every real word opens with a blend (two or three consonants) or a digraph. Candidates: stride, flame, globe, shape, shade, while, whale, slide, glide, stove, smoke, snake, stale, blame, plane, crane, grade, trade, shine, chime, spine, spike, stripe, strike, scale, slope, flake, drive, grape, state, skate, plate, slate, shave, brave, crave, grave, stroke, throne, swine, twine, flute is 4.3's so leave it.
- **Banned here:** chose, those, close, nose, prize, phase (/z/); stage, change (g says /j/, not taught); whole (irregular).
- The lesson's point is that nothing new is being learned: the same silent e, now after the blends and digraphs she already knows.

- [ ] **Step 4: Run the test**

Run: `npx vitest run tests/content/s4-4.test.ts`
Expected: PASS with zero checker errors. Fix the content, never the checker.

- [ ] **Step 5: Read every word back**

Read the finished file top to bottom against the content rules above. Check by hand what the checker cannot see: every nonsense word against the safety bar, every story title and answer choice for decodability, every question for a second defensible answer, every real word for a letter taking an untaught sound, every story for an ending that actually ends. Write what you checked, and what you rejected, into your report.

- [ ] **Step 6: Run the whole suite and commit**

Run: `npm test && npm run typecheck`

```bash
git add src/content/substeps/s4-4.ts tests/content/s4-4.test.ts
git commit -m "Bring blends and digraphs into silent-e words"
```

---

### Task 12: Section 4.5 — long words with a silent-e syllable

**Depends on:** Task 10. May run in parallel with Tasks 11 and 13.

**Files:**
- Create: `src/content/substeps/s4-5.ts`
- Test: `tests/content/s4-5.test.ts`

**Interfaces:**
- Consumes: the `vce` and `silent` card types and the cards `a_e i_e o_e u_e e_e u_e_oo e_silent` (Task 1); the silent-e checker rules (Task 2).
- Produces: `export const SUBSTEP_4_5: Substep` from `src/content/substeps/s4-5.ts`. Task 14 imports it under that exact name and registers it.

**Read before writing a single word:** `docs/superpowers/specs/2026-09-13-book-3-deepening-and-book-4-design.md`, sections "Part two" and "Decisions the owner made".

**Template.** Copy the shape of `src/content/substeps/s3-5.ts`. Export `SUBSTEP_4_5: Substep` with `id`, `title`, `parentSummary` (two or three sentences addressed to a parent, plain English, no jargon, no program name), `groups`, `concepts`, `sightWords`, `words`, `sentences`, `stories`.

**Targets for this section:** at least 30 real words, 15 nonsense words, 12 sentences, and 2 stories with 2 or 3 questions each. The checker's floor is lower (20/10/6/1/1); hit the targets, not the floor.

**How a silent-e word is written.** The vowel maps to its `vce` card and the final e to `e_silent`:

```ts
word('cake', 'c,a:a_e,k,e:e_silent')
word('smile', 's,m,i:i_e,l,e:e_silent')
word('invite', 'i,n,v,i:i_e,t,e:e_silent', { syllables: [2] })
```

`word` and `nonsense` are imported from `../build`. A nonsense word takes the same shape: `nonsense('blane', 'b,l,a:a_e,n,e:e_silent')`.

**Content rules — every one of these binds every word, sentence, story and question you write:**
- Decodable with cards taught at or before this section.
- No word text may exist in two sections' banks (case-insensitive). The checker catches this only once everything is registered, at Task 14 — so avoid obvious collisions with the sections before yours.
- Nonsense words: pronounceable, follow the section's pattern, never a real word, name or slang, never one letter from a rude word. Rejected in the first build: gick, gock, crup, loxes, unstrict, rong, dall, thell, sut, tud, huck.
- Sentences and story sentences use only taught words and the sight words this section or an earlier one declares.
- Story titles and answer choices must be decodable. Question prompts are spoken aloud by the app and may use any words.
- Every answer choice must be answerable from its own story, and exactly one choice may be defensible.
- Author every story question with the correct answer at index 0; the engine shuffles per session.
- Proper nouns are capitalised in `text` with lower-case `parts`, and are never used as a "find" target or distractor.
- **Reject any word where a letter takes a sound the child has not been taught.** The trap in Book 4 is s saying /z/. Banned outright: these, rose, nose, wise, chose, those, close, doze, prize, confuse, refuse, surprise. Say each candidate aloud before you use it.
- Spoken lesson lines must never put a schwa on a consonant: write "b", not "buh".
- Never write the word "Wilson".

**Steps:**

- [ ] **Step 1: Write the test first**

Create `tests/content/s4-5.test.ts` modelled exactly on `tests/content/s3-5.test.ts`: import `CARDS`, `checkContent`, the earlier substeps this one depends on, and this one; build a small `Content`; assert `checkContent(content)` is `[]`. Then add this section's own rule:

```ts
  it('gives every real word a syllable split, with the silent e inside one syllable', () => {
    const cards = cardMap(CARDS);
    for (const w of SUBSTEP_4_5.words.filter((w) => w.kind === 'real')) {
      expect(w.syllables?.length ?? 0, w.text).toBeGreaterThanOrEqual(1);
      const pairs = silentPartners(w, cards);
      expect(pairs.length, w.text).toBe(1);
      expect(syllableOf(w, pairs[0].vowel), w.text).toBe(syllableOf(w, pairs[0].silent));
    }
  });
```

Import `cardMap`, `silentPartners` and `syllableOf` from `../../src/content/parts`, and `CARDS` from `../../src/content/cards`.

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/content/s4-5.test.ts`
Expected: FAIL — cannot resolve `../../src/content/substeps/s4-5`.

- [ ] **Step 3: Write the section**

Create `src/content/substeps/s4-5.ts`.

- `id: '4.5'`, `title: 'Long words with a silent-e syllable'`. One group, no new cards: `groups: [{ cards: [], lesson: [...] }]`. `concepts: []`.
- Every real word has two or more syllables, a `syllables` array marking where each new syllable starts, and exactly one silent-e syllable.
- The owner confirmed the child is comfortable with long words, so these may appear in sentences and stories, not only in the word bank.
- Candidates — **check every one against the cards taught so far before using it**: invite, reptile, stampede, compete, complete, inside, cupcake, sunshine, mistake, pancake, textile, include, athlete, concrete, sunstroke, handshake, milkshake, hillside, backbone, homemade, bedtime, lifetime, landslide, inflate, costume (the u is the *rule* sound, so it takes `u_e_oo`).
- **Banned:** confuse, refuse, surprise, advise (s says /z/); decide, invoice (c says /s/); entire, admire (r-controlled, not taught); daytime (`ay` is not taught).
- Worked examples of the notation:
  ```ts
  word('invite', 'i,n,v,i:i_e,t,e:e_silent', { syllables: [2] })
  word('cupcake', 'c,u,p,c,a:a_e,k,e:e_silent', { syllables: [3] })
  ```

- [ ] **Step 4: Run the test**

Run: `npx vitest run tests/content/s4-5.test.ts`
Expected: PASS with zero checker errors. Fix the content, never the checker.

- [ ] **Step 5: Read every word back**

Read the finished file top to bottom against the content rules above. Check by hand what the checker cannot see: every nonsense word against the safety bar, every story title and answer choice for decodability, every question for a second defensible answer, every real word for a letter taking an untaught sound, every story for an ending that actually ends. Write what you checked, and what you rejected, into your report.

- [ ] **Step 6: Run the whole suite and commit**

Run: `npm test && npm run typecheck`

```bash
git add src/content/substeps/s4-5.ts tests/content/s4-5.test.ts
git commit -m "Put a silent-e syllable inside longer words"
```

---

### Task 13: Section 4.6 — adding s, and words that break the rule

**Depends on:** Task 10. May run in parallel with Tasks 11 and 12.

**Files:**
- Create: `src/content/substeps/s4-6.ts`
- Test: `tests/content/s4-6.test.ts`

**Interfaces:**
- Consumes: the `vce` and `silent` card types and the cards `a_e i_e o_e u_e e_e u_e_oo e_silent` (Task 1); the silent-e checker rules (Task 2).
- Produces: `export const SUBSTEP_4_6: Substep` from `src/content/substeps/s4-6.ts`. Task 14 imports it under that exact name and registers it.

**Read before writing a single word:** `docs/superpowers/specs/2026-09-13-book-3-deepening-and-book-4-design.md`, sections "Part two" and "Decisions the owner made".

**Template.** Copy the shape of `src/content/substeps/s3-5.ts`. Export `SUBSTEP_4_6: Substep` with `id`, `title`, `parentSummary` (two or three sentences addressed to a parent, plain English, no jargon, no program name), `groups`, `concepts`, `sightWords`, `words`, `sentences`, `stories`.

**Targets for this section:** at least 30 real words, 15 nonsense words, 12 sentences, and 2 stories with 2 or 3 questions each. The checker's floor is lower (20/10/6/1/1); hit the targets, not the floor.

**How a silent-e word is written.** The vowel maps to its `vce` card and the final e to `e_silent`:

```ts
word('cake', 'c,a:a_e,k,e:e_silent')
word('smile', 's,m,i:i_e,l,e:e_silent')
word('invite', 'i,n,v,i:i_e,t,e:e_silent', { syllables: [2] })
```

`word` and `nonsense` are imported from `../build`. A nonsense word takes the same shape: `nonsense('blane', 'b,l,a:a_e,n,e:e_silent')`.

**Content rules — every one of these binds every word, sentence, story and question you write:**
- Decodable with cards taught at or before this section.
- No word text may exist in two sections' banks (case-insensitive). The checker catches this only once everything is registered, at Task 14 — so avoid obvious collisions with the sections before yours.
- Nonsense words: pronounceable, follow the section's pattern, never a real word, name or slang, never one letter from a rude word. Rejected in the first build: gick, gock, crup, loxes, unstrict, rong, dall, thell, sut, tud, huck.
- Sentences and story sentences use only taught words and the sight words this section or an earlier one declares.
- Story titles and answer choices must be decodable. Question prompts are spoken aloud by the app and may use any words.
- Every answer choice must be answerable from its own story, and exactly one choice may be defensible.
- Author every story question with the correct answer at index 0; the engine shuffles per session.
- Proper nouns are capitalised in `text` with lower-case `parts`, and are never used as a "find" target or distractor.
- **Reject any word where a letter takes a sound the child has not been taught.** The trap in Book 4 is s saying /z/. Banned outright: these, rose, nose, wise, chose, those, close, doze, prize, confuse, refuse, surprise. Say each candidate aloud before you use it.
- Spoken lesson lines must never put a schwa on a consonant: write "b", not "buh".
- Never write the word "Wilson".

**Steps:**

- [ ] **Step 1: Write the test first**

Create `tests/content/s4-6.test.ts` modelled exactly on `tests/content/s3-5.test.ts`: import `CARDS`, `checkContent`, the earlier substeps this one depends on, and this one; build a small `Content`; assert `checkContent(content)` is `[]`. Then add this section's own rule:

```ts
  it('ends every plural in the s card and tags it as a suffix', () => {
    const plurals = SUBSTEP_4_6.words.filter((w) => w.concepts?.includes(SUFFIX_S));
    expect(plurals.length).toBeGreaterThanOrEqual(20);
    for (const w of plurals) expect(w.parts[w.parts.length - 1].card, w.text).toBe('s');
  });

  it('teaches exactly the three words that break the rule', () => {
    const exceptions = SUBSTEP_4_6.words.filter((w) => w.concepts?.includes('silent-e-exception')).map((w) => w.text);
    expect(exceptions.sort()).toEqual(['give', 'have', 'live']);
  });

  it('taps an exception word as a short vowel with the e folded into the v', () => {
    const have = SUBSTEP_4_6.words.find((w) => w.text === 'have')!;
    expect(have.parts.map((p) => `${p.grapheme}:${p.card}`)).toEqual(['h:h', 'a:a', 've:v']);
  });
```

Declare `SUFFIX_S` at the top of the test as the exact concept string used in `src/content/substeps/s1-6.ts` — open that file and copy it; do not guess it.

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/content/s4-6.test.ts`
Expected: FAIL — cannot resolve `../../src/content/substeps/s4-6`.

- [ ] **Step 3: Write the section**

Create `src/content/substeps/s4-6.ts`.

- `id: '4.6'`, `title: 'Adding s, and words that break the rule'`. One group, no new cards: `groups: [{ cards: [], lesson: [...] }]`.
- `concepts: ['silent-e-exception']`.
- **Two kinds of word, taught separately in the lesson.**

  **1. Adding s to silent-e words.** Tag each with the suffix-s concept string copied from `src/content/substeps/s1-6.ts`.

  **Only bases ending in k, p, t or f may be used**, because every other ending makes the plural say /z/, a sound she has not been taught. So: cakes, bakes, rakes, flakes, snakes, jokes, spikes, kites, bites, notes, gates, dates, plates, skates, hopes, ropes, capes, grapes, shapes, stripes, mistakes, cupcakes, pancakes, milkshakes, handshakes, lifetimes.

  **Rejected for /z/ — do not use any of these:** rides, smiles, flames, names, times, lines, stones, holes, tunes, cubes, waves, mules, globes, homes.

  **2. The exception words: have, give, live.** They end in a silent e but the vowel stays short. Tap them as an ordinary closed syllable with the e folded into the v:

  ```ts
  word('have', 'h,a,ve:v', { concepts: ['silent-e-exception'] })
  word('give', 'g,i,ve:v', { concepts: ['silent-e-exception'] })
  word('live', 'l,i,ve:v', { concepts: ['silent-e-exception'] })
  ```

  This needs **one change to `src/content/check.ts`**: add `ve: 'silent-e-exception'` to the `SPELLING_RULES` map, with a comment saying that English never ends a word in a bare v, so the e is part of the v's spelling rather than a silent letter doing a job. That is what lets the checker accept a part whose grapheme ("ve") differs from its card's grapheme ("v"), exactly as it already does for `ff`, `ll`, `ss` and `zz`.

  Do **not** add a third silent card, and do **not** relax the silent-e pairing rule added in Task 2. Those rules exist to catch typos and must keep working.

- Nonsense words here follow kind 1: a nonsense silent-e base ending in k, p, t or f, plus s.
- The lesson must name the exception honestly: these three words look like silent-e words but are not, and she simply has to know them. Three words is a short list — say so, so it does not feel like a new rule to learn.
- Check whether `tests/content/check.test.ts` already covers the `SPELLING_RULES` mechanism generically. Add a case for the `ve` entry only if it does not, and say in your report what you found.

- [ ] **Step 4: Run the test**

Run: `npx vitest run tests/content/s4-6.test.ts`
Expected: PASS with zero checker errors. Fix the content, never the checker.

- [ ] **Step 5: Read every word back**

Read the finished file top to bottom against the content rules above. Check by hand what the checker cannot see: every nonsense word against the safety bar, every story title and answer choice for decodability, every question for a second defensible answer, every real word for a letter taking an untaught sound, every story for an ending that actually ends. Write what you checked, and what you rejected, into your report.

- [ ] **Step 6: Run the whole suite and commit**

Run: `npm test && npm run typecheck`

```bash
git add src/content/substeps/s4-6.ts tests/content/s4-6.test.ts
git commit -m "Add s to silent-e words, and meet the ones that break the rule"
```

---

### Task 14: Register Book 4

**Files:**
- Modify: `src/content/index.ts`
- Modify: `tests/content/all.test.ts`
- Modify: any Book 4 section file, to fix what registration reveals
- Test: `tests/content/all.test.ts`

**Depends on:** Tasks 8–13.

**Interfaces:**
- Consumes: `SUBSTEP_4_1` … `SUBSTEP_4_6`.
- Produces: `CONTENT.substeps` has twenty-two entries.

- [ ] **Step 1: Update the whole-program test first**

In `tests/content/all.test.ts`, extend the expected id list:

```ts
    expect(CONTENT.substeps.map((s) => s.id)).toEqual([
      '1.1', '1.2', '1.3', '1.4', '1.5', '1.6',
      '2.1', '2.2', '2.3', '2.4', '2.5',
      '3.1', '3.2', '3.3', '3.4', '3.5',
      '4.1', '4.2', '4.3', '4.4', '4.5', '4.6',
    ]);
```

and change its title from "the sixteen substeps" to "the twenty-two substeps". Re-tighten the card test that Task 1 relaxed, back to its original form:

```ts
    for (const card of CONTENT.cards) expect(seen.get(card.id), `card ${card.id}`).toBe(1);
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/content/all.test.ts`
Expected: FAIL — sixteen ids, and several cards introduced by no group.

- [ ] **Step 3: Register the six sections**

In `src/content/index.ts`, add the six imports and append `SUBSTEP_4_1, SUBSTEP_4_2, SUBSTEP_4_3, SUBSTEP_4_4, SUBSTEP_4_5, SUBSTEP_4_6` to the `substeps` array, in order, matching the file's existing formatting.

- [ ] **Step 4: Run it and fix what registration reveals**

Run: `npx vitest run tests/content/all.test.ts`

A word text that exists in two sections' banks is only detectable now, because each section's own test builds a partial content tree. Expect some. For each duplicate, decide which section should own the word and remove it from the other, replacing it with a word of the same pattern so the section stays above its minimums. Do not silence the checker.

The same is true of the "every section has a readable story of its own" and "at least two readable sentences of its own" cases, which run per group — a two-group section like 4.1 needs a story its **first** group can already read, using only `a_e` words.

Repeat until `npx vitest run tests/content/all.test.ts` is green, then run `npm test && npm run typecheck && npm run build`.

- [ ] **Step 5: See it in the app**

Run `npm run dev`. In the grown-up area, set the section to 4.1 and play a session. Confirm: the `a_e` sound card shows "a_e"; a silent-e word shows four tiles and three dots; the bridge line runs from the vowel to the e and looks right. Take a screenshot and attach it to the task report.

- [ ] **Step 6: Commit**

```bash
git add src/content/index.ts tests/content/all.test.ts src/content/substeps/
git commit -m "Turn on Book 4 in the app"
```

---

### Tasks 15 to 19: Deepen the five Book 3 sections

One task per section. Each is self-contained below and touches only its own section file and its own test.

---

### Task 15: Deepen section 3.1

**Depends on:** Task 7. May run in parallel with Tasks 8 to 13 and with the other Book 3 tasks.

**Files:**
- Modify: `src/content/substeps/s3-1.ts`
- Test: `tests/content/s3-1.test.ts`

**Interfaces:**
- Consumes: nothing from the other tasks. This section teaches no new cards and its shape does not change.
- Produces: nothing other tasks import. `SUBSTEP_3_1` keeps its name, id and title.

**Read first:** `docs/superpowers/specs/2026-09-13-book-3-deepening-and-book-4-design.md`, section "Part one".

**Why:** the child using this app is ten and is working inside Book 3. She may sit on one section for weeks, and today each section has only two stories. This adds to what is there; it does not restructure it.

**Targets for this section:** 35 real words, 20 nonsense words, 18 sentences, and 4 stories with 2 or 3 questions each. Keep everything already in the file except the retirements below, and add to the right existing group, keeping the file's grouping comments.

**Content rules — every one of these binds every word, sentence, story and question you add:**
- Decodable with cards taught at or before this section.
- No word text may exist in two sections' banks (case-insensitive). The checker catches cross-section collisions only once everything is registered, so prefer words obviously specific to this section's pattern.
- Nonsense words: pronounceable, follow the section's pattern, never a real word, name or slang, never one letter from a rude word. Rejected in the first build: gick, gock, crup, loxes, unstrict, rong, dall, thell, sut, tud, huck.
- Sentences and story sentences use only taught words and declared sight words.
- Story titles and answer choices must be decodable. Question prompts are spoken aloud and may use any words.
- Every answer choice must be answerable from its own story, and exactly one choice may be defensible.
- Author every question with the correct answer at index 0; the engine shuffles per session.
- No story may end on "and they had fun" or any other non-ending. A story ends when something is resolved.
- Nothing bookish. The reader is ten: no words she would never say or meet.
- Spoken lesson lines must never put a schwa on a consonant: write "b", not "buh".
- Never write the word "Wilson".

**Retire from this section** — each replaced by a word of the same pattern with the same number of sounds, so the section's shape does not change: `vat`, `cam`, `sham`, `rind` and `volt`, if and only if they appear in this file. Ignore any that do not.

**Steps:**

- [ ] **Step 1: Tighten the test first**

In `tests/content/s3-1.test.ts`, add two cases that fail against today's file:

```ts
  it('has enough to read for a child who stays here a few weeks', () => {
    expect(SUBSTEP_3_1.words.filter((w) => w.kind === 'real').length).toBeGreaterThanOrEqual(35);
    expect(SUBSTEP_3_1.words.filter((w) => w.kind === 'nonsense').length).toBeGreaterThanOrEqual(20);
    expect(SUBSTEP_3_1.sentences.length).toBeGreaterThanOrEqual(18);
    expect(SUBSTEP_3_1.stories.length).toBeGreaterThanOrEqual(4);
    for (const st of SUBSTEP_3_1.stories) expect(st.questions.length, st.title).toBeGreaterThanOrEqual(2);
  });

  it("has retired the words that are not worth a ten-year-old's time", () => {
    const texts = new Set(SUBSTEP_3_1.words.map((w) => w.text.toLowerCase()));
    for (const gone of ['vat', 'cam', 'sham', 'rind', 'volt']) expect(texts.has(gone), gone).toBe(false);
  });
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run tests/content/s3-1.test.ts`
Expected: FAIL on the counts.

- [ ] **Step 3: Write the content**

Add words, nonsense words, sentences and stories to `src/content/substeps/s3-1.ts`, and make the retirements.

Also replace any answer distractor in this section's stories that cannot be judged from its own story — the spec lists 3.1 as having some.

- [ ] **Step 4: Run the test**

Run: `npx vitest run tests/content/s3-1.test.ts`
Expected: PASS with zero checker errors. Fix the content, never the checker.

- [ ] **Step 5: Read every word back**

Read the whole finished file top to bottom against the content rules above — the old content as well as the new, because the retirements and the distractor fixes touch what was already there. Write what you checked, and what you rejected, into your report.

- [ ] **Step 6: Run the whole suite and commit**

Run: `npm test && npm run typecheck`

```bash
git add src/content/substeps/s3-1.ts tests/content/s3-1.test.ts
git commit -m "Give section 3.1 more to read"
```

---

### Task 16: Deepen section 3.2

**Depends on:** Task 7. May run in parallel with Tasks 8 to 13 and with the other Book 3 tasks.

**Files:**
- Modify: `src/content/substeps/s3-2.ts`
- Test: `tests/content/s3-2.test.ts`

**Interfaces:**
- Consumes: nothing from the other tasks. This section teaches no new cards and its shape does not change.
- Produces: nothing other tasks import. `SUBSTEP_3_2` keeps its name, id and title.

**Read first:** `docs/superpowers/specs/2026-09-13-book-3-deepening-and-book-4-design.md`, section "Part one".

**Why:** the child using this app is ten and is working inside Book 3. She may sit on one section for weeks, and today each section has only two stories. This adds to what is there; it does not restructure it.

**Targets for this section:** 35 real words, 20 nonsense words, 18 sentences, and 4 stories with 2 or 3 questions each. Keep everything already in the file except the retirements below, and add to the right existing group, keeping the file's grouping comments.

**Content rules — every one of these binds every word, sentence, story and question you add:**
- Decodable with cards taught at or before this section.
- No word text may exist in two sections' banks (case-insensitive). The checker catches cross-section collisions only once everything is registered, so prefer words obviously specific to this section's pattern.
- Nonsense words: pronounceable, follow the section's pattern, never a real word, name or slang, never one letter from a rude word. Rejected in the first build: gick, gock, crup, loxes, unstrict, rong, dall, thell, sut, tud, huck.
- Sentences and story sentences use only taught words and declared sight words.
- Story titles and answer choices must be decodable. Question prompts are spoken aloud and may use any words.
- Every answer choice must be answerable from its own story, and exactly one choice may be defensible.
- Author every question with the correct answer at index 0; the engine shuffles per session.
- No story may end on "and they had fun" or any other non-ending. A story ends when something is resolved.
- Nothing bookish. The reader is ten: no words she would never say or meet.
- Spoken lesson lines must never put a schwa on a consonant: write "b", not "buh".
- Never write the word "Wilson".

**Retire from this section** — each replaced by a word of the same pattern with the same number of sounds, so the section's shape does not change: `complex`, `insult`, `husband` and `absent` — bookish words a ten-year-old has no use for. Also `vat`, `cam`, `sham`, `rind` and `volt` if they appear in this file.

**Steps:**

- [ ] **Step 1: Tighten the test first**

In `tests/content/s3-2.test.ts`, add two cases that fail against today's file:

```ts
  it('has enough to read for a child who stays here a few weeks', () => {
    expect(SUBSTEP_3_2.words.filter((w) => w.kind === 'real').length).toBeGreaterThanOrEqual(35);
    expect(SUBSTEP_3_2.words.filter((w) => w.kind === 'nonsense').length).toBeGreaterThanOrEqual(20);
    expect(SUBSTEP_3_2.sentences.length).toBeGreaterThanOrEqual(18);
    expect(SUBSTEP_3_2.stories.length).toBeGreaterThanOrEqual(4);
    for (const st of SUBSTEP_3_2.stories) expect(st.questions.length, st.title).toBeGreaterThanOrEqual(2);
  });

  it("has retired the words that are not worth a ten-year-old's time", () => {
    const texts = new Set(SUBSTEP_3_2.words.map((w) => w.text.toLowerCase()));
    for (const gone of ['complex', 'insult', 'husband', 'absent', 'vat', 'cam', 'sham', 'rind', 'volt']) expect(texts.has(gone), gone).toBe(false);
  });
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run tests/content/s3-2.test.ts`
Expected: FAIL on the counts.

- [ ] **Step 3: Write the content**

Add words, nonsense words, sentences and stories to `src/content/substeps/s3-2.ts`, and make the retirements.



- [ ] **Step 4: Run the test**

Run: `npx vitest run tests/content/s3-2.test.ts`
Expected: PASS with zero checker errors. Fix the content, never the checker.

- [ ] **Step 5: Read every word back**

Read the whole finished file top to bottom against the content rules above — the old content as well as the new, because the retirements and the distractor fixes touch what was already there. Write what you checked, and what you rejected, into your report.

- [ ] **Step 6: Run the whole suite and commit**

Run: `npm test && npm run typecheck`

```bash
git add src/content/substeps/s3-2.ts tests/content/s3-2.test.ts
git commit -m "Give section 3.2 more to read"
```

---

### Task 17: Deepen section 3.3

**Depends on:** Task 7. May run in parallel with Tasks 8 to 13 and with the other Book 3 tasks.

**Files:**
- Modify: `src/content/substeps/s3-3.ts`
- Test: `tests/content/s3-3.test.ts`

**Interfaces:**
- Consumes: nothing from the other tasks. This section teaches no new cards and its shape does not change.
- Produces: nothing other tasks import. `SUBSTEP_3_3` keeps its name, id and title.

**Read first:** `docs/superpowers/specs/2026-09-13-book-3-deepening-and-book-4-design.md`, section "Part one".

**Why:** the child using this app is ten and is working inside Book 3. She may sit on one section for weeks, and today each section has only two stories. This adds to what is there; it does not restructure it.

**Targets for this section:** 35 real words, 20 nonsense words, 18 sentences, and 4 stories with 2 or 3 questions each. Keep everything already in the file except the retirements below, and add to the right existing group, keeping the file's grouping comments.

**Content rules — every one of these binds every word, sentence, story and question you add:**
- Decodable with cards taught at or before this section.
- No word text may exist in two sections' banks (case-insensitive). The checker catches cross-section collisions only once everything is registered, so prefer words obviously specific to this section's pattern.
- Nonsense words: pronounceable, follow the section's pattern, never a real word, name or slang, never one letter from a rude word. Rejected in the first build: gick, gock, crup, loxes, unstrict, rong, dall, thell, sut, tud, huck.
- Sentences and story sentences use only taught words and declared sight words.
- Story titles and answer choices must be decodable. Question prompts are spoken aloud and may use any words.
- Every answer choice must be answerable from its own story, and exactly one choice may be defensible.
- Author every question with the correct answer at index 0; the engine shuffles per session.
- No story may end on "and they had fun" or any other non-ending. A story ends when something is resolved.
- Nothing bookish. The reader is ten: no words she would never say or meet.
- Spoken lesson lines must never put a schwa on a consonant: write "b", not "buh".
- Never write the word "Wilson".

**Retire from this section** — each replaced by a word of the same pattern with the same number of sounds, so the section's shape does not change: `vat`, `cam`, `sham`, `rind` and `volt`, if they appear in this file.

**Steps:**

- [ ] **Step 1: Tighten the test first**

In `tests/content/s3-3.test.ts`, add two cases that fail against today's file:

```ts
  it('has enough to read for a child who stays here a few weeks', () => {
    expect(SUBSTEP_3_3.words.filter((w) => w.kind === 'real').length).toBeGreaterThanOrEqual(35);
    expect(SUBSTEP_3_3.words.filter((w) => w.kind === 'nonsense').length).toBeGreaterThanOrEqual(20);
    expect(SUBSTEP_3_3.sentences.length).toBeGreaterThanOrEqual(18);
    expect(SUBSTEP_3_3.stories.length).toBeGreaterThanOrEqual(4);
    for (const st of SUBSTEP_3_3.stories) expect(st.questions.length, st.title).toBeGreaterThanOrEqual(2);
  });

  it("has retired the words that are not worth a ten-year-old's time", () => {
    const texts = new Set(SUBSTEP_3_3.words.map((w) => w.text.toLowerCase()));
    for (const gone of ['vat', 'cam', 'sham', 'rind', 'volt']) expect(texts.has(gone), gone).toBe(false);
  });
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run tests/content/s3-3.test.ts`
Expected: FAIL on the counts.

- [ ] **Step 3: Write the content**

Add words, nonsense words, sentences and stories to `src/content/substeps/s3-3.ts`, and make the retirements.

Also: replace this section's "have fun" story ending with a real ending, and replace any answer distractor that cannot be judged from its own story. The spec lists 3.3 as having both problems.

- [ ] **Step 4: Run the test**

Run: `npx vitest run tests/content/s3-3.test.ts`
Expected: PASS with zero checker errors. Fix the content, never the checker.

- [ ] **Step 5: Read every word back**

Read the whole finished file top to bottom against the content rules above — the old content as well as the new, because the retirements and the distractor fixes touch what was already there. Write what you checked, and what you rejected, into your report.

- [ ] **Step 6: Run the whole suite and commit**

Run: `npm test && npm run typecheck`

```bash
git add src/content/substeps/s3-3.ts tests/content/s3-3.test.ts
git commit -m "Give section 3.3 more to read, and a real ending"
```

---

### Task 18: Deepen section 3.4

**Depends on:** Task 7. May run in parallel with Tasks 8 to 13 and with the other Book 3 tasks.

**Files:**
- Modify: `src/content/substeps/s3-4.ts`
- Test: `tests/content/s3-4.test.ts`

**Interfaces:**
- Consumes: nothing from the other tasks. This section teaches no new cards and its shape does not change.
- Produces: nothing other tasks import. `SUBSTEP_3_4` keeps its name, id and title.

**Read first:** `docs/superpowers/specs/2026-09-13-book-3-deepening-and-book-4-design.md`, section "Part one".

**Why:** the child using this app is ten and is working inside Book 3. She may sit on one section for weeks, and today each section has only two stories. This adds to what is there; it does not restructure it.

**Targets for this section:** 35 real words, 20 nonsense words, 18 sentences, and 4 stories with 2 or 3 questions each. Keep everything already in the file except the retirements below, and add to the right existing group, keeping the file's grouping comments.

**Content rules — every one of these binds every word, sentence, story and question you add:**
- Decodable with cards taught at or before this section.
- No word text may exist in two sections' banks (case-insensitive). The checker catches cross-section collisions only once everything is registered, so prefer words obviously specific to this section's pattern.
- Nonsense words: pronounceable, follow the section's pattern, never a real word, name or slang, never one letter from a rude word. Rejected in the first build: gick, gock, crup, loxes, unstrict, rong, dall, thell, sut, tud, huck.
- Sentences and story sentences use only taught words and declared sight words.
- Story titles and answer choices must be decodable. Question prompts are spoken aloud and may use any words.
- Every answer choice must be answerable from its own story, and exactly one choice may be defensible.
- Author every question with the correct answer at index 0; the engine shuffles per session.
- No story may end on "and they had fun" or any other non-ending. A story ends when something is resolved.
- Nothing bookish. The reader is ten: no words she would never say or meet.
- Spoken lesson lines must never put a schwa on a consonant: write "b", not "buh".
- Never write the word "Wilson".

**Retire from this section** — each replaced by a word of the same pattern with the same number of sounds, so the section's shape does not change: `misconduct`, `combatant`, `enlistment`, `investment`, `commitment` and `consultant` — bookish words a ten-year-old has no use for. Also `vat`, `cam`, `sham`, `rind` and `volt` if they appear in this file.

**Steps:**

- [ ] **Step 1: Tighten the test first**

In `tests/content/s3-4.test.ts`, add two cases that fail against today's file:

```ts
  it('has enough to read for a child who stays here a few weeks', () => {
    expect(SUBSTEP_3_4.words.filter((w) => w.kind === 'real').length).toBeGreaterThanOrEqual(35);
    expect(SUBSTEP_3_4.words.filter((w) => w.kind === 'nonsense').length).toBeGreaterThanOrEqual(20);
    expect(SUBSTEP_3_4.sentences.length).toBeGreaterThanOrEqual(18);
    expect(SUBSTEP_3_4.stories.length).toBeGreaterThanOrEqual(4);
    for (const st of SUBSTEP_3_4.stories) expect(st.questions.length, st.title).toBeGreaterThanOrEqual(2);
  });

  it("has retired the words that are not worth a ten-year-old's time", () => {
    const texts = new Set(SUBSTEP_3_4.words.map((w) => w.text.toLowerCase()));
    for (const gone of ['misconduct', 'combatant', 'enlistment', 'investment', 'commitment', 'consultant', 'vat', 'cam', 'sham', 'rind', 'volt']) expect(texts.has(gone), gone).toBe(false);
  });
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run tests/content/s3-4.test.ts`
Expected: FAIL on the counts.

- [ ] **Step 3: Write the content**

Add words, nonsense words, sentences and stories to `src/content/substeps/s3-4.ts`, and make the retirements.

Also: replace this section's "have fun" story ending with a real ending, and replace any answer distractor that cannot be judged from its own story.

- [ ] **Step 4: Run the test**

Run: `npx vitest run tests/content/s3-4.test.ts`
Expected: PASS with zero checker errors. Fix the content, never the checker.

- [ ] **Step 5: Read every word back**

Read the whole finished file top to bottom against the content rules above — the old content as well as the new, because the retirements and the distractor fixes touch what was already there. Write what you checked, and what you rejected, into your report.

- [ ] **Step 6: Run the whole suite and commit**

Run: `npm test && npm run typecheck`

```bash
git add src/content/substeps/s3-4.ts tests/content/s3-4.test.ts
git commit -m "Give section 3.4 more to read, and a real ending"
```

---

### Task 19: Deepen section 3.5

**Depends on:** Task 7. May run in parallel with Tasks 8 to 13 and with the other Book 3 tasks.

**Files:**
- Modify: `src/content/substeps/s3-5.ts`
- Test: `tests/content/s3-5.test.ts`

**Interfaces:**
- Consumes: nothing from the other tasks. This section teaches no new cards and its shape does not change.
- Produces: nothing other tasks import. `SUBSTEP_3_5` keeps its name, id and title.

**Read first:** `docs/superpowers/specs/2026-09-13-book-3-deepening-and-book-4-design.md`, section "Part one".

**Why:** the child using this app is ten and is working inside Book 3. She may sit on one section for weeks, and today each section has only two stories. This adds to what is there; it does not restructure it.

**Targets for this section:** 35 real words, 20 nonsense words, 18 sentences, and 4 stories with 2 or 3 questions each. Keep everything already in the file except the retirements below, and add to the right existing group, keeping the file's grouping comments.

**Content rules — every one of these binds every word, sentence, story and question you add:**
- Decodable with cards taught at or before this section.
- No word text may exist in two sections' banks (case-insensitive). The checker catches cross-section collisions only once everything is registered, so prefer words obviously specific to this section's pattern.
- Nonsense words: pronounceable, follow the section's pattern, never a real word, name or slang, never one letter from a rude word. Rejected in the first build: gick, gock, crup, loxes, unstrict, rong, dall, thell, sut, tud, huck.
- Sentences and story sentences use only taught words and declared sight words.
- Story titles and answer choices must be decodable. Question prompts are spoken aloud and may use any words.
- Every answer choice must be answerable from its own story, and exactly one choice may be defensible.
- Author every question with the correct answer at index 0; the engine shuffles per session.
- No story may end on "and they had fun" or any other non-ending. A story ends when something is resolved.
- Nothing bookish. The reader is ten: no words she would never say or meet.
- Spoken lesson lines must never put a schwa on a consonant: write "b", not "buh".
- Never write the word "Wilson".

**Retire from this section** — each replaced by a word of the same pattern with the same number of sounds, so the section's shape does not change: `vat`, `cam`, `sham`, `rind` and `volt`, if they appear in this file.

**Steps:**

- [ ] **Step 1: Tighten the test first**

In `tests/content/s3-5.test.ts`, add two cases that fail against today's file:

```ts
  it('has enough to read for a child who stays here a few weeks', () => {
    expect(SUBSTEP_3_5.words.filter((w) => w.kind === 'real').length).toBeGreaterThanOrEqual(35);
    expect(SUBSTEP_3_5.words.filter((w) => w.kind === 'nonsense').length).toBeGreaterThanOrEqual(20);
    expect(SUBSTEP_3_5.sentences.length).toBeGreaterThanOrEqual(18);
    expect(SUBSTEP_3_5.stories.length).toBeGreaterThanOrEqual(4);
    for (const st of SUBSTEP_3_5.stories) expect(st.questions.length, st.title).toBeGreaterThanOrEqual(2);
  });

  it("has retired the words that are not worth a ten-year-old's time", () => {
    const texts = new Set(SUBSTEP_3_5.words.map((w) => w.text.toLowerCase()));
    for (const gone of ['vat', 'cam', 'sham', 'rind', 'volt']) expect(texts.has(gone), gone).toBe(false);
  });
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run tests/content/s3-5.test.ts`
Expected: FAIL on the counts.

- [ ] **Step 3: Write the content**

Add words, nonsense words, sentences and stories to `src/content/substeps/s3-5.ts`, and make the retirements.

Also replace any answer distractor that cannot be judged from its own story. Note that every word in this section ends in `ed` or `ing` and the file's existing test asserts that — every word you add must keep it true.

- [ ] **Step 4: Run the test**

Run: `npx vitest run tests/content/s3-5.test.ts`
Expected: PASS with zero checker errors. Fix the content, never the checker.

- [ ] **Step 5: Read every word back**

Read the whole finished file top to bottom against the content rules above — the old content as well as the new, because the retirements and the distractor fixes touch what was already there. Write what you checked, and what you rejected, into your report.

- [ ] **Step 6: Run the whole suite and commit**

Run: `npm test && npm run typecheck`

```bash
git add src/content/substeps/s3-5.ts tests/content/s3-5.test.ts
git commit -m "Give section 3.5 more to read"
```

---

### Task 20: A browser test for a silent-e session

**Files:**
- Create: `tests/e2e/silente.spec.ts`
- Modify: `tests/e2e/helpers.ts` if the `autoPlay` helper needs to know about sound-count dots

**Depends on:** Task 14.

**Interfaces:**
- Consumes: the `data-*` hints the session screens already expose, and `data-testid="vce-bridge"` from Task 5.

- [ ] **Step 1: Write the failing test**

Create `tests/e2e/silente.spec.ts`, modelled on `tests/e2e/session.spec.ts`. It must:

```ts
import { test, expect } from '@playwright/test';
```

1. Open the app, go to the grown-up area, and set the current section to 4.1 the way `tests/e2e/parent.spec.ts` does.
2. Start a session and reach the word-work part.
3. Find a word-work item whose word is a silent-e word, and assert:

```ts
    const bridge = page.getByTestId('vce-bridge').first();
    await expect(bridge).toBeVisible();
    const box = await bridge.boundingBox();
    expect(box!.width).toBeGreaterThan(20);   // a real arc, not a collapsed one
```

4. Assert the dot count is one fewer than the tile count on that screen.
5. Play the session to the end with the existing `autoPlay` helper, proving nothing in the six parts breaks on Book 4 content.

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx playwright install chromium` if needed, then `npm run e2e -- silente`
Expected: FAIL before the helper changes, if any are needed.

- [ ] **Step 3: Make it pass**

Change `tests/e2e/helpers.ts` only if `autoPlay` counts dots from tiles. It should count `button.dot` directly.

- [ ] **Step 4: Run the browser suite**

Run: `npm run e2e`
Expected: PASS, all nine specs.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/silente.spec.ts tests/e2e/helpers.ts
git commit -m "Check a silent-e session end to end in a real browser"
```

---

### Task 21: Whole-branch review, docs, and the four gates

**Files:**
- Modify: `docs/HANDOFF.md`, `README.md`

**Depends on:** everything.

- [ ] **Step 1: Read the whole branch's content**

Read every new and changed word, sentence, story title, question and answer choice across Books 3 and 4 in one pass, by a reviewer who authored none of it. This is the step that caught five cross-file defects in the first build and it cannot be skipped or delegated to the checker. Check specifically:

- a nonsense word that is a real word, a name, slang, or one letter from a rude word
- a question with two defensible answers, or an answer not in its own story
- a spoken lesson line that says a consonant with a schwa ("buh" instead of "b")
- a word where a letter takes a sound the child has not been taught, especially s saying /z/
- a story that stops rather than ends
- the same word text used as a "find" target and a distractor in one section
- any occurrence of the word "Wilson"

Fix what you find. Small one-word content fixes are faster done here than sent back.

- [ ] **Step 2: Update the handoff**

In `docs/HANDOFF.md`: change "sixteen sections" to twenty-two throughout; add Book 4 to the section table; describe the silent-e model in the "Decisions worth knowing" list — `vce` and `silent` card types, three taps for "cake", the bridge line, `parts.ts` as the one place the pairing logic lives, and that `e_silent` and `u_e_oo` are never drilled; add the new checker rules to the enforced list; move "Steps 4 to 12 out of scope" to "Books 5 to 12 out of scope" and note that the machinery for Book 5 now exists.

In `README.md`: update any count of sections, and add a sentence to the parent-facing part explaining that in Book 4 a word can have more letters than taps, and what the curved line means.

- [ ] **Step 3: Run all four gates and show the output**

```bash
npm test
npm run typecheck
npm run build
npm run e2e
```

Paste the real output of each. No claim of completion before all four are green.

- [ ] **Step 4: Commit and publish**

```bash
git add docs/HANDOFF.md README.md
git commit -m "Write down how silent e works, for whoever comes next"
```

Merge to `main`. The Pages workflow re-runs every test and republishes in five to eight minutes; watch it with `gh run watch` and confirm the live site serves the new sections before reporting done.

---

## Self-Review

**Spec coverage.** Part one (deeper Book 3) → Tasks 15–19. Part two (Book 4's six sections) → Tasks 8–14. Part three: content types → Task 1; new cards → Task 1; tapping → Task 6; bridge line → Task 5; other screens → Tasks 4 and 7; engine → Task 3; checker → Task 2. Verification → Tasks 20 and 21. The spec's "Risks" section is answered by Task 14 Step 5 and Task 20 (the bridge on real hardware) and by Task 21's docs step (teaching order, which the tutor confirms from the app's own menu).

**Type consistency.** `cardMap`, `cardDisplay`, `isDrillable`, `syllableOf`, `silentPartners`, `soundingIndexes` are defined in Task 1 and used under those exact names in Tasks 2, 3, 5, 6. `cardTypeById` is defined in Task 4 and used in Task 5. `SoundTiles`'s `tapped` prop counts sounds, and both callers (Tasks 6 and 7) pass it that way.

**Known open question.** Task 13 carries a real fork — how to tap *have*, *give*, *live*, which end in a silent e that does not make the vowel say its name. The task names both routes, states which to try first, and requires the choice be recorded. This is the one place in the plan an implementer must decide something; it is flagged rather than hidden.
