# Core App (Substep 1.1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A working, playable structured-literacy reading app for one substep (1.1) with the full six-part session, the complete engine (session assembly, scoring, review, advancement, placement rule), device storage, audio, a home screen with profiles, and a parent area.

**Architecture:** A static React + TypeScript web app. `src/content` holds data files. `src/engine` is pure logic with no React or browser APIs, tested with Vitest. `src/store` and `src/audio` sit behind interfaces with in-memory fakes for tests and browser implementations for production. `src/ui` renders a session plan and reports scored responses back to the engine.

**Tech Stack:** Vite 5, React 18, TypeScript 5, Vitest 2 (+ jsdom, React Testing Library, fake-indexeddb), idb-keyval, @fontsource/lexend.

**Spec:** `docs/superpowers/specs/2026-09-12-reading-app-design.md`

This is plan 1 of 3. Plan 2 adds substeps 1.2 to 3.5, the placement check screen, the recording page, and backup/restore. Plan 3 adds PWA packaging, Playwright browser tests, and deployment.

## Global Constraints

- The app must not use the Wilson name, logo, or materials anywhere in code, UI copy, or content. Working name: **Tapwords**.
- All content is original. The substep order follows the public scope-and-sequence; no word lists, cards, or stories are copied.
- Presentation rules from spec section 7: one task per screen, touch targets at least 64px, no timers or countdowns shown, no red X on a miss, no score shown to the child mid-session, spoken instructions always shown as a caption.
- Engine code (`src/engine/**`) must not import React or touch `window`, `document`, `localStorage`, `indexedDB`, `speechSynthesis`, or `Audio`.
- Every content file must pass `checkContent` with the production minimums (20 real words, 10 nonsense words, 6 sentences, 1 story).
- Commit after every task with a plain-English message ending in `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Tests are run with `npm test` (Vitest, non-watch). Type check with `npm run typecheck`. Both must pass before every commit.

---

## File structure

```
package.json, tsconfig.json, vite.config.ts, index.html
src/
  main.tsx                     wires real services and mounts <App/>
  App.tsx                      screen state machine: home | session | parent
  content/
    types.ts                   Card, Word, Substep, Content, LessonStep ...
    build.ts                   word()/nonsense()/cvc() helpers for authoring
    cards.ts                   the shared card list (CARDS)
    check.ts                   checkContent(), tokenize(), SPELLING_RULES, MIN
    substeps/s1-1.ts           substep 1.1 data
    index.ts                   CONTENT = { cards, substeps }
  engine/
    types.ts                   ProfileState, ScoredResponse, SessionLog, keys, initialState()
    rng.ts                     Rng, seeded(), shuffle(), sample()
    availability.ts            getSubstep(), getCard(), substepIndex(), availableCards(), availableWords(), findWord()
    strength.ts                INITIAL_STRENGTH, updateStrengths(), decayStrengths()
    review.ts                  Candidate, pickReview()
    session.ts                 SessionPlan types, COUNTS, buildSession(), findChoices()
    progression.ts             ADVANCE, accuracy(), shouldAdvance(), finishSession(), moveTo(), suggestPlacement()
  store/
    types.ts                   Profile, Store interface
    memory.ts                  MemoryStore
    idb.ts                     IdbStore (idb-keyval)
  audio/
    types.ts                   AudioPlayer interface
    fake.ts                    FakeAudio
    browser.ts                 BrowserAudio (speechSynthesis + clips)
  ui/
    styles.css
    services.tsx               ServicesContext, useServices()
    speech.tsx                 SpeechProvider, useSay(), <Caption/>
    tiles.ts                   cardTypeFor()
    components/Tile.tsx, BigButton.tsx, TapDots.tsx, MissReview.tsx, Path.tsx
    screens/Home.tsx, ParentArea.tsx
    session/SessionRunner.tsx, SoundCardsPart.tsx, LessonPart.tsx, WordWorkPart.tsx,
            SpellingPart.tsx, ReadAloudPart.tsx, StoryPart.tsx, SessionEnd.tsx
tests/
  setup.ts
  content/cards.test.ts, check.test.ts, s1-1.test.ts
  engine/availability.test.ts, strength.test.ts, review.test.ts, session.test.ts, progression.test.ts
  store/memory.test.ts, idb.test.ts
  audio/fake.test.ts
  ui/helpers.tsx, tapdots.test.tsx, home.test.tsx, soundcards.test.tsx, lesson.test.tsx,
     wordwork.test.tsx, spelling.test.tsx, readaloud.test.tsx, story.test.tsx, runner.test.tsx, parent.test.tsx
```

---

### Task 1: Project scaffold, content types, and the card list

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `tests/setup.ts`
- Create: `src/content/types.ts`, `src/content/cards.ts`
- Test: `tests/content/cards.test.ts`

**Interfaces:**
- Produces: every type in `src/content/types.ts` (below) and `CARDS: Card[]`.

- [ ] **Step 1: Create the project files**

`package.json`:
```json
{
  "name": "tapwords",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@fontsource/lexend": "^5.1.0",
    "idb-keyval": "^6.2.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/dom": "^10.4.0",
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "fake-indexeddb": "^6.0.0",
    "jsdom": "^25.0.0",
    "typescript": "^5.6.2",
    "vite": "^5.4.8",
    "vitest": "^2.1.1"
  }
}
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "types": ["vite/client", "@testing-library/jest-dom"]
  },
  "include": ["src", "tests", "vite.config.ts"]
}
```

`vite.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    setupFiles: ['tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
```

`tests/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
```

`index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <title>Tapwords</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/App.tsx` (placeholder until Task 9; keep it minimal):
```tsx
export default function App() {
  return <h1>Tapwords</h1>;
}
```

`src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 2: Install and confirm the toolchain runs**

Run: `npm install && npm run typecheck && npx vitest run`
Expected: install succeeds; typecheck prints nothing; vitest reports "No test files found" (exit code may be 1, that is fine for now).

- [ ] **Step 3: Write the content types**

`src/content/types.ts`:
```ts
export type CardType = 'consonant' | 'vowel' | 'digraph' | 'welded';

export interface Card {
  id: string;            // e.g. "sh"
  grapheme: string;      // shown on the tile, usually same as id
  keyword: string;       // e.g. "ship"
  phonemeLabel: string;  // spoken by the computer voice when no clip is recorded
  type: CardType;
}

export interface WordPart {
  grapheme: string;      // letters shown, e.g. "ff"
  card: string;          // card id it is pronounced as, e.g. "f"
}

export interface Word {
  text: string;
  parts: WordPart[];     // in order; also the tapping pattern
  kind: 'real' | 'nonsense';
  concepts?: string[];   // concept tags this word relies on, e.g. ["suffix-s"]
  syllables?: number[];  // indexes into parts where a new syllable begins (step 3)
}

export interface Question {
  prompt: string;
  choices: [string, string, string];
  answer: 0 | 1 | 2;
}

export interface Story {
  title: string;
  sentences: string[];
  questions: Question[];
}

export type LessonStep =
  | { say: string }       // spoken by the app
  | { show: string[] }    // graphemes displayed as tiles
  | { tap: string }       // a word from this substep's bank, tapped out by the app
  | { try: string };      // a word from this substep's bank, tapped by the child

export interface CardGroup {
  cards: string[];        // card ids introduced by this group
  lesson: LessonStep[];   // the mini-lesson for this group
}

export interface Substep {
  id: string;             // "1.1"
  title: string;
  parentSummary: string;
  groups: CardGroup[];    // at least one; most substeps have exactly one
  concepts: string[];     // concept tags introduced here
  sightWords: string[];   // high-frequency words allowed in sentences from here on
  words: Word[];
  sentences: string[];
  stories: Story[];
}

export interface Content {
  cards: Card[];
  substeps: Substep[];    // in teaching order
}
```

- [ ] **Step 4: Write the failing card-list test**

`tests/content/cards.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';

describe('card list', () => {
  it('has unique ids and non-empty fields', () => {
    const ids = CARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of CARDS) {
      expect(c.grapheme.length).toBeGreaterThan(0);
      expect(c.keyword.length).toBeGreaterThan(0);
      expect(c.phonemeLabel.length).toBeGreaterThan(0);
      expect(['consonant', 'vowel', 'digraph', 'welded']).toContain(c.type);
    }
  });

  it('includes the cards needed through step 3', () => {
    const ids = new Set(CARDS.map((c) => c.id));
    for (const id of ['a', 'i', 'o', 'u', 'e', 'sh', 'ch', 'th', 'wh', 'qu', 'ck', 'all', 'am', 'an', 'ang', 'ing', 'ong', 'ung', 'ank', 'ink', 'onk', 'unk', 'ild', 'ind', 'old', 'ost', 'olt']) {
      expect(ids.has(id), `missing card ${id}`).toBe(true);
    }
  });
});
```

- [ ] **Step 5: Run it to see it fail**

Run: `npx vitest run tests/content/cards.test.ts`
Expected: FAIL, cannot find module `../../src/content/cards`.

- [ ] **Step 6: Write the card list**

`src/content/cards.ts`:
```ts
import type { Card, CardType } from './types';

function card(id: string, keyword: string, type: CardType, phonemeLabel?: string): Card {
  return { id, grapheme: id, keyword, type, phonemeLabel: phonemeLabel ?? `${id}, ${keyword}` };
}

export const CARDS: Card[] = [
  // Substep 1.1
  card('f', 'fun', 'consonant', 'fff'),
  card('l', 'lamp', 'consonant', 'lll'),
  card('m', 'man', 'consonant', 'mmm'),
  card('n', 'nut', 'consonant', 'nnn'),
  card('r', 'rat', 'consonant', 'rrr'),
  card('s', 'snake', 'consonant', 'sss'),
  card('d', 'dog', 'consonant'),
  card('g', 'game', 'consonant'),
  card('p', 'pan', 'consonant'),
  card('t', 'top', 'consonant'),
  card('a', 'apple', 'vowel', 'a, apple'),
  card('i', 'itch', 'vowel', 'i, itch'),
  card('o', 'octopus', 'vowel', 'o, octopus'),
  // Substep 1.2 (introduced gradually)
  card('b', 'bat', 'consonant'),
  card('sh', 'ship', 'digraph', 'shh'),
  card('u', 'up', 'vowel', 'u, up'),
  card('h', 'hat', 'consonant'),
  card('j', 'jug', 'consonant'),
  card('c', 'cat', 'consonant'),
  card('k', 'kite', 'consonant'),
  card('ck', 'sock', 'digraph'),
  card('e', 'Ed', 'vowel', 'e, Ed'),
  card('v', 'van', 'consonant', 'vvv'),
  card('w', 'wind', 'consonant'),
  card('x', 'fox', 'consonant', 'ks'),
  card('y', 'yellow', 'consonant'),
  card('z', 'zebra', 'consonant', 'zzz'),
  card('ch', 'chin', 'digraph'),
  card('th', 'thumb', 'digraph'),
  card('qu', 'queen', 'digraph', 'kw'),
  card('wh', 'whistle', 'digraph'),
  // Welded sounds, steps 1.4 to 2.3
  card('all', 'ball', 'welded'),
  card('am', 'ham', 'welded'),
  card('an', 'fan', 'welded'),
  card('ang', 'fang', 'welded'),
  card('ing', 'ring', 'welded'),
  card('ong', 'song', 'welded'),
  card('ung', 'lung', 'welded'),
  card('ank', 'bank', 'welded'),
  card('ink', 'pink', 'welded'),
  card('onk', 'honk', 'welded'),
  card('unk', 'junk', 'welded'),
  card('ild', 'wild', 'welded'),
  card('ind', 'find', 'welded'),
  card('old', 'cold', 'welded'),
  card('ost', 'most', 'welded'),
  card('olt', 'bolt', 'welded'),
];
```

- [ ] **Step 7: Run tests and type check**

Run: `npx vitest run tests/content/cards.test.ts && npm run typecheck`
Expected: 2 tests PASS; typecheck clean.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Set up the project and add content types and the sound card list

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Substep 1.1 content and the content checker

**Files:**
- Create: `src/content/build.ts`, `src/content/check.ts`, `src/content/substeps/s1-1.ts`, `src/content/index.ts`
- Test: `tests/content/check.test.ts`, `tests/content/s1-1.test.ts`

**Interfaces:**
- Consumes: `Content`, `Substep`, `Word` from Task 1.
- Produces: `checkContent(content: Content, min?: typeof MIN): string[]` (empty array means valid), `tokenize(sentence: string): string[]`, `SPELLING_RULES`, `MIN`, `word()`, `nonsense()`, `cvc()`, `cvcNonsense()`, `SUBSTEP_1_1: Substep`, `CONTENT: Content`.

- [ ] **Step 1: Write the authoring helpers**

`src/content/build.ts`:
```ts
import type { Word, WordPart } from './types';

/** "o,ff:f" -> [{grapheme:'o',card:'o'},{grapheme:'ff',card:'f'}] */
export function parts(spec: string): WordPart[] {
  return spec.split(',').map((piece) => {
    const [grapheme, card] = piece.trim().split(':');
    return { grapheme, card: card ?? grapheme };
  });
}

export function word(text: string, spec: string, extra: Partial<Word> = {}): Word {
  return { text, parts: parts(spec), kind: 'real', ...extra };
}

export function nonsense(text: string, spec: string): Word {
  return { text, parts: parts(spec), kind: 'nonsense' };
}

/** One card per letter, e.g. cvc('map'). */
export function cvc(text: string): Word {
  return word(text, text.split('').join(','));
}

export function cvcNonsense(text: string): Word {
  return nonsense(text, text.split('').join(','));
}
```

- [ ] **Step 2: Write the failing checker tests**

`tests/content/check.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { checkContent, tokenize } from '../../src/content/check';
import { CARDS } from '../../src/content/cards';
import { cvc, cvcNonsense, word } from '../../src/content/build';
import type { Content, Substep } from '../../src/content/types';

const tiny = { real: 1, nonsense: 1, sentences: 1, stories: 1 };

function sub(over: Partial<Substep>): Substep {
  return {
    id: '1.1',
    title: 'Test',
    parentSummary: '',
    groups: [{ cards: ['m', 'a', 'p', 's', 't'], lesson: [{ try: 'map' }] }],
    concepts: [],
    sightWords: ['the'],
    words: [cvc('map'), cvcNonsense('mip')],
    sentences: ['The map.'],
    stories: [{ title: 'Map', sentences: ['The map.'], questions: [{ prompt: 'q', choices: ['a', 'b', 'c'], answer: 0 }] }],
    ...over,
  };
}

function content(...substeps: Substep[]): Content {
  return { cards: CARDS, substeps };
}

describe('tokenize', () => {
  it('lowercases and strips punctuation', () => {
    expect(tokenize('The rat sat, on a log!')).toEqual(['the', 'rat', 'sat', 'on', 'a', 'log']);
  });
});

describe('checkContent', () => {
  it('accepts a valid substep', () => {
    expect(checkContent(content(sub({})), tiny)).toEqual([]);
  });

  it('rejects a word using a card not yet taught', () => {
    const errors = checkContent(content(sub({ words: [cvc('map'), cvc('sit'), cvcNonsense('mip')] })), tiny);
    expect(errors.some((e) => e.includes('"sit"') && e.includes('"i"'))).toBe(true);
  });

  it('rejects parts that do not spell the word', () => {
    const errors = checkContent(content(sub({ words: [word('map', 'm,a,t'), cvcNonsense('mip')] })), tiny);
    expect(errors.some((e) => e.includes('parts spell "mat"'))).toBe(true);
  });

  it('rejects a sentence with an untaught word', () => {
    const errors = checkContent(content(sub({ sentences: ['The cat.'] })), tiny);
    expect(errors.some((e) => e.includes('"cat"'))).toBe(true);
  });

  it('rejects ff before the doubling rule is taught', () => {
    const s = sub({ groups: [{ cards: ['o', 'f'], lesson: [] }], words: [word('off', 'o,ff:f'), cvcNonsense('fo')], sentences: ['off'], stories: [{ title: 't', sentences: ['off'], questions: [] }] });
    expect(checkContent(content(s), tiny).some((e) => e.includes('doubling'))).toBe(true);
    const ok = { ...s, concepts: ['doubling'] };
    expect(checkContent(content(ok), tiny)).toEqual([]);
  });

  it('rejects a word using an untaught concept', () => {
    const s = sub({ words: [cvc('map'), word('maps', 'm,a,p,s', { concepts: ['suffix-s'] }), cvcNonsense('mip')] });
    expect(checkContent(content(s), tiny).some((e) => e.includes('suffix-s'))).toBe(true);
  });

  it('rejects a lesson step that refers to a word not in the bank', () => {
    const s = sub({ groups: [{ cards: ['m', 'a', 'p'], lesson: [{ try: 'sat' }] }] });
    expect(checkContent(content(s), tiny).some((e) => e.includes('"sat"'))).toBe(true);
  });

  it('allows a later substep to use earlier words in sentences', () => {
    const s2 = sub({ id: '1.2', groups: [{ cards: ['i'], lesson: [] }], words: [cvc('sit'), cvcNonsense('sip')], sentences: ['The map.'] });
    expect(checkContent(content(sub({}), s2), tiny)).toEqual([]);
  });

  it('enforces minimum counts', () => {
    const errors = checkContent(content(sub({})));
    expect(errors.some((e) => e.includes('real words'))).toBe(true);
    expect(errors.some((e) => e.includes('nonsense words'))).toBe(true);
    expect(errors.some((e) => e.includes('sentences'))).toBe(true);
  });
});
```

- [ ] **Step 3: Run to see it fail**

Run: `npx vitest run tests/content/check.test.ts`
Expected: FAIL, cannot find module `../../src/content/check`.

- [ ] **Step 4: Write the checker**

`src/content/check.ts`:
```ts
import type { Content } from './types';

/** Graphemes that are spellings of an existing card and need a rule taught first. */
export const SPELLING_RULES: Record<string, string> = {
  ff: 'doubling',
  ll: 'doubling',
  ss: 'doubling',
  zz: 'doubling',
};

export const MIN = { real: 20, nonsense: 10, sentences: 6, stories: 1 };

export function tokenize(sentence: string): string[] {
  return sentence
    .toLowerCase()
    .replace(/[^a-z'\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function checkContent(content: Content, min: typeof MIN = MIN): string[] {
  const errors: string[] = [];
  const cardById = new Map(content.cards.map((c) => [c.id, c]));
  const introducedCards = new Set<string>();
  const introducedConcepts = new Set<string>();
  const knownWords = new Set<string>();
  const knownSight = new Set<string>();
  const seenIds = new Set<string>();

  for (const s of content.substeps) {
    if (seenIds.has(s.id)) errors.push(`${s.id}: duplicate substep id`);
    seenIds.add(s.id);
    if (s.groups.length === 0) errors.push(`${s.id}: needs at least one card group`);

    for (const g of s.groups) {
      for (const c of g.cards) {
        if (!cardById.has(c)) errors.push(`${s.id}: introduces unknown card "${c}"`);
        if (introducedCards.has(c)) errors.push(`${s.id}: card "${c}" was already introduced`);
        introducedCards.add(c);
      }
    }
    for (const c of s.concepts) introducedConcepts.add(c);
    for (const sw of s.sightWords) knownSight.add(sw.toLowerCase());

    const bank = new Set(s.words.map((w) => w.text));
    for (const g of s.groups) {
      for (const step of g.lesson) {
        const ref = 'tap' in step ? step.tap : 'try' in step ? step.try : null;
        if (ref !== null && !bank.has(ref)) errors.push(`${s.id}: lesson refers to "${ref}" which is not in this substep's word bank`);
      }
    }

    let real = 0;
    let nonsenseCount = 0;
    for (const w of s.words) {
      if (w.kind === 'real') real++;
      else nonsenseCount++;
      const joined = w.parts.map((p) => p.grapheme).join('');
      if (joined !== w.text) errors.push(`${s.id}: "${w.text}" parts spell "${joined}"`);
      for (const p of w.parts) {
        const card = cardById.get(p.card);
        if (!card) {
          errors.push(`${s.id}: "${w.text}" uses unknown card "${p.card}"`);
          continue;
        }
        if (!introducedCards.has(p.card)) errors.push(`${s.id}: "${w.text}" uses card "${p.card}" before it is taught`);
        const rule = SPELLING_RULES[p.grapheme];
        if (rule) {
          if (!introducedConcepts.has(rule)) errors.push(`${s.id}: "${w.text}" uses "${p.grapheme}" before the ${rule} rule is taught`);
        } else if (p.grapheme !== card.grapheme) {
          errors.push(`${s.id}: "${w.text}" part "${p.grapheme}" does not match card "${p.card}"`);
        }
      }
      for (const c of w.concepts ?? []) {
        if (!introducedConcepts.has(c)) errors.push(`${s.id}: "${w.text}" needs concept "${c}" before it is taught`);
      }
      if (w.kind === 'real') knownWords.add(w.text.toLowerCase());
    }

    if (real < min.real) errors.push(`${s.id}: only ${real} real words (need ${min.real})`);
    if (nonsenseCount < min.nonsense) errors.push(`${s.id}: only ${nonsenseCount} nonsense words (need ${min.nonsense})`);
    if (s.sentences.length < min.sentences) errors.push(`${s.id}: only ${s.sentences.length} sentences (need ${min.sentences})`);
    if (s.stories.length < min.stories) errors.push(`${s.id}: only ${s.stories.length} stories (need ${min.stories})`);

    const checkSentence = (text: string, where: string) => {
      for (const t of tokenize(text)) {
        if (!knownWords.has(t) && !knownSight.has(t)) errors.push(`${s.id}: ${where} uses "${t}" which is not a taught word or sight word`);
      }
    };
    s.sentences.forEach((t, i) => checkSentence(t, `sentence ${i + 1}`));
    for (const st of s.stories) st.sentences.forEach((t, i) => checkSentence(t, `story "${st.title}" sentence ${i + 1}`));
  }
  return errors;
}
```

- [ ] **Step 5: Run the checker tests**

Run: `npx vitest run tests/content/check.test.ts`
Expected: all PASS.

- [ ] **Step 6: Write the failing substep 1.1 test**

`tests/content/s1-1.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { CONTENT } from '../../src/content';
import { checkContent } from '../../src/content/check';

describe('substep 1.1 content', () => {
  it('passes the content checker with production minimums', () => {
    expect(checkContent(CONTENT)).toEqual([]);
  });

  it('only uses 1.1 initial and final consonants by convention', () => {
    const s = CONTENT.substeps[0];
    for (const w of s.words) {
      const first = w.parts[0].card;
      const last = w.parts[w.parts.length - 1].card;
      if (w.parts.length === 3) expect(['f', 'l', 'm', 'n', 'r', 's'], w.text).toContain(first);
      expect(['d', 'g', 'p', 't'], w.text).toContain(last);
    }
  });
});
```

- [ ] **Step 7: Run to see it fail**

Run: `npx vitest run tests/content/s1-1.test.ts`
Expected: FAIL, cannot find module `../../src/content`.

- [ ] **Step 8: Write the 1.1 content and the index**

`src/content/substeps/s1-1.ts`:
```ts
import type { Substep } from '../types';
import { cvc, cvcNonsense, word, nonsense } from '../build';

export const SUBSTEP_1_1: Substep = {
  id: '1.1',
  title: 'First sounds and short words',
  parentSummary:
    'Your child learns the sounds for f, l, m, n, r, s, d, g, p, t and the short vowels a, i, o. They tap out and blend words with two or three sounds, like "map" and "sit".',
  groups: [
    {
      cards: ['f', 'l', 'm', 'n', 'r', 's', 'd', 'g', 'p', 't', 'a', 'i', 'o'],
      lesson: [
        { say: 'Today we start with sounds. Each card shows a letter and makes one sound.' },
        { show: ['m', 'a', 'p'] },
        { say: 'Every word is made of sounds. Let us tap the word map. One tap for each sound, then swipe to blend.' },
        { tap: 'map' },
        { say: 'Now you try. Tap each sound in order, then swipe to say the word.' },
        { try: 'map' },
        { try: 'sit' },
        { try: 'log' },
      ],
    },
  ],
  concepts: [],
  sightWords: ['the', 'a', 'is', 'and', 'on', 'in'],
  words: [
    // real: initial f l m n r s, vowel a i o, final d g p t
    cvc('fat'), cvc('fad'), cvc('fig'), cvc('fit'), cvc('fog'),
    cvc('lap'), cvc('lad'), cvc('lag'), cvc('lid'), cvc('lip'), cvc('lit'), cvc('log'), cvc('lot'), cvc('lop'),
    cvc('map'), cvc('mat'), cvc('mad'), cvc('mid'), cvc('mop'),
    cvc('nap'), cvc('nag'), cvc('nip'), cvc('nit'), cvc('nod'), cvc('not'),
    cvc('rag'), cvc('rat'), cvc('rap'), cvc('rid'), cvc('rig'), cvc('rip'), cvc('rot'), cvc('rod'),
    cvc('sat'), cvc('sad'), cvc('sap'), cvc('sag'), cvc('sit'), cvc('sip'), cvc('sod'),
    word('at', 'a,t'), word('it', 'i,t'),
    // nonsense
    cvcNonsense('fip'), cvcNonsense('lod'), cvcNonsense('mip'), cvcNonsense('rop'), cvcNonsense('sig'),
    cvcNonsense('fod'), cvcNonsense('lig'), cvcNonsense('nat'), cvcNonsense('rit'), cvcNonsense('sog'),
    cvcNonsense('mig'), cvcNonsense('nid'), cvcNonsense('sot'),
    nonsense('ip', 'i,p'), nonsense('og', 'o,g'),
  ],
  sentences: [
    'The rat sat on a log.',
    'The map is on the mat.',
    'A fig is on the lid.',
    'The lad is mad.',
    'Sit on the log and nap.',
    'The rat is fat.',
    'Nod at the lad.',
    'The mop is in the fog.',
  ],
  stories: [
    {
      title: 'Rat on a Log',
      sentences: ['A rat sat on a log.', 'The rat is fat.', 'The log is in the fog.', 'The rat is not sad.', 'The rat sat and sat.'],
      questions: [
        { prompt: 'Where did the rat sit?', choices: ['on a log', 'on a mat', 'on a lid'], answer: 0 },
        { prompt: 'What is the rat like?', choices: ['fat', 'sad', 'mad'], answer: 0 },
      ],
    },
    {
      title: 'The Lad and the Map',
      sentences: ['The lad sat on the mat.', 'A map is on the lid.', 'The lad is not mad.', 'The lad is sad.', 'The lad sat and sat.'],
      questions: [{ prompt: 'Where is the map?', choices: ['on the lid', 'on the log', 'on the rat'], answer: 0 }],
    },
  ],
};
```

`src/content/index.ts`:
```ts
import type { Content } from './types';
import { CARDS } from './cards';
import { SUBSTEP_1_1 } from './substeps/s1-1';

export const CONTENT: Content = {
  cards: CARDS,
  substeps: [SUBSTEP_1_1],
};
```

- [ ] **Step 9: Run all tests and type check**

Run: `npm test && npm run typecheck`
Expected: all PASS. If the checker reports an error in 1.1 (for example a sentence word not in the bank), fix the content, not the checker.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Add the content checker and substep 1.1 words, sentences, stories and lesson

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Engine types, randomness, availability, and strength scores

**Files:**
- Create: `src/engine/types.ts`, `src/engine/rng.ts`, `src/engine/availability.ts`, `src/engine/strength.ts`
- Test: `tests/engine/availability.test.ts`, `tests/engine/strength.test.ts`

**Interfaces:**
- Consumes: `Content`, `Substep`, `Card`, `Word` from Task 1.
- Produces:
  - `Activity`, `Strength`, `Strengths`, `ProfileState`, `ScoredResponse`, `SessionLog`, `cardKey(id)`, `wordKey(substep, text)`, `sentenceKey(substep, text)`, `storyKey(substep, title, i)`, `initialState(substep)`.
  - `Rng = () => number`, `seeded(seed)`, `shuffle(items, rng)`, `sample(items, n, rng)`.
  - `getSubstep(content, id)`, `getCard(content, id)`, `substepIndex(content, id)`, `availableCards(content, substepId, groupIndex): string[]`, `availableWords(content, substepId, groupIndex): { word: Word; substep: string }[]`, `findWord(substep, text): Word`.
  - `INITIAL_STRENGTH`, `DECAY_AFTER_SESSIONS`, `updateStrengths(strengths, responses, sessionNumber)`, `decayStrengths(strengths, sessionNumber)`.

- [ ] **Step 1: Write engine types and rng (no test needed for types; rng is tested through shuffle determinism)**

`src/engine/types.ts`:
```ts
export type Activity =
  | 'sound-reverse'
  | 'tap'
  | 'find'
  | 'build'
  | 'spell-sound'
  | 'spell-word'
  | 'spell-sentence'
  | 'read-aloud'
  | 'story-question';

export interface Strength {
  value: number;      // 0..1
  lastSeen: number;   // session number
}
export type Strengths = Record<string, Strength>;

export interface ProfileState {
  currentSubstep: string;
  currentGroup: number;
  sessionsCompleted: number;
  substepEnteredAt: number;          // sessionsCompleted when this substep was entered
  strengths: Strengths;
  pendingReadAloud: boolean;         // a read-aloud was skipped; offer it first next time
  lessonPending: boolean;            // run the full mini-lesson next session
  lastReadAloudSession: number | null;
}

export interface ScoredResponse {
  itemKey: string;
  activity: Activity;
  correct: boolean;
  isReview: boolean;
  parentMarked: boolean;
}

export interface SessionLog {
  sessionNumber: number;
  date: string;          // ISO
  substep: string;
  complete: boolean;     // false if the child stopped early
  readAloudDone: boolean;
  responses: ScoredResponse[];
}

export const cardKey = (id: string) => `card:${id}`;
export const wordKey = (substep: string, text: string) => `word:${substep}:${text}`;
export const sentenceKey = (substep: string, text: string) => `sentence:${substep}:${text}`;
export const storyKey = (substep: string, title: string, i: number) => `story:${substep}:${title}:${i}`;

export function initialState(substep: string): ProfileState {
  return {
    currentSubstep: substep,
    currentGroup: 0,
    sessionsCompleted: 0,
    substepEnteredAt: 0,
    strengths: {},
    pendingReadAloud: false,
    lessonPending: true,
    lastReadAloudSession: null,
  };
}
```

`src/engine/rng.ts`:
```ts
export type Rng = () => number;

/** Deterministic generator (mulberry32) for tests and reproducible sessions. */
export function seeded(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], rng: Rng): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample<T>(items: T[], n: number, rng: Rng): T[] {
  return shuffle(items, rng).slice(0, Math.max(0, n));
}
```

- [ ] **Step 2: Write the failing availability tests**

`tests/engine/availability.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { cvc, cvcNonsense } from '../../src/content/build';
import type { Content, Substep } from '../../src/content/types';
import { availableCards, availableWords, findWord, getSubstep, substepIndex } from '../../src/engine/availability';
import { seeded, shuffle } from '../../src/engine/rng';

const s11: Substep = {
  id: '1.1', title: '', parentSummary: '', concepts: [], sightWords: [], sentences: [], stories: [],
  groups: [{ cards: ['m', 'a', 'p', 's', 't'], lesson: [] }],
  words: [cvc('map'), cvc('sat'), cvcNonsense('mip')],
};
const s12: Substep = {
  id: '1.2', title: '', parentSummary: '', concepts: [], sightWords: [], sentences: [], stories: [],
  groups: [
    { cards: ['b', 'i'], lesson: [] },
    { cards: ['u', 'h'], lesson: [] },
  ],
  words: [cvc('bat'), cvc('bit'), cvc('hut'), cvc('hat')],
};
const content: Content = { cards: CARDS, substeps: [s11, s12] };

describe('availability', () => {
  it('finds substeps and their index', () => {
    expect(getSubstep(content, '1.2').id).toBe('1.2');
    expect(substepIndex(content, '1.2')).toBe(1);
    expect(() => getSubstep(content, '9.9')).toThrow();
  });

  it('lists cards through the current group only', () => {
    expect(availableCards(content, '1.1', 0)).toEqual(['m', 'a', 'p', 's', 't']);
    expect(availableCards(content, '1.2', 0)).toEqual(['m', 'a', 'p', 's', 't', 'b', 'i']);
    expect(availableCards(content, '1.2', 1)).toContain('h');
  });

  it('filters current-substep words by the cards taught so far', () => {
    const texts = (g: number) => availableWords(content, '1.2', g).map((w) => w.word.text);
    expect(texts(0)).toEqual(['map', 'sat', 'mip', 'bat', 'bit']);
    expect(texts(1)).toContain('hut');
  });

  it('tags words with their substep', () => {
    const w = availableWords(content, '1.2', 1).find((x) => x.word.text === 'map');
    expect(w?.substep).toBe('1.1');
  });

  it('findWord returns the word or throws', () => {
    expect(findWord(s11, 'map').parts.length).toBe(3);
    expect(() => findWord(s11, 'zzz')).toThrow();
  });
});

describe('rng', () => {
  it('is deterministic for a seed', () => {
    expect(shuffle([1, 2, 3, 4, 5], seeded(7))).toEqual(shuffle([1, 2, 3, 4, 5], seeded(7)));
    expect(shuffle([1, 2, 3, 4, 5], seeded(7))).not.toEqual(shuffle([1, 2, 3, 4, 5], seeded(8)));
  });
});
```

- [ ] **Step 3: Run to see it fail**

Run: `npx vitest run tests/engine/availability.test.ts`
Expected: FAIL, cannot find module.

- [ ] **Step 4: Write availability**

`src/engine/availability.ts`:
```ts
import type { Card, Content, Substep, Word } from '../content/types';

export function substepIndex(content: Content, id: string): number {
  const i = content.substeps.findIndex((s) => s.id === id);
  if (i < 0) throw new Error(`Unknown substep ${id}`);
  return i;
}

export function getSubstep(content: Content, id: string): Substep {
  return content.substeps[substepIndex(content, id)];
}

export function getCard(content: Content, id: string): Card {
  const c = content.cards.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown card ${id}`);
  return c;
}

export function findWord(substep: Substep, text: string): Word {
  const w = substep.words.find((x) => x.text === text);
  if (!w) throw new Error(`Word "${text}" is not in substep ${substep.id}`);
  return w;
}

/** All card ids taught up to and including the given group of the given substep, in teaching order. */
export function availableCards(content: Content, substepId: string, groupIndex: number): string[] {
  const idx = substepIndex(content, substepId);
  const out: string[] = [];
  content.substeps.slice(0, idx).forEach((s) => s.groups.forEach((g) => out.push(...g.cards)));
  content.substeps[idx].groups.slice(0, groupIndex + 1).forEach((g) => out.push(...g.cards));
  return out;
}

/** Earlier substeps' words plus current-substep words whose cards are all taught so far. */
export function availableWords(content: Content, substepId: string, groupIndex: number): { word: Word; substep: string }[] {
  const idx = substepIndex(content, substepId);
  const cards = new Set(availableCards(content, substepId, groupIndex));
  const out: { word: Word; substep: string }[] = [];
  content.substeps.slice(0, idx).forEach((s) => s.words.forEach((word) => out.push({ word, substep: s.id })));
  const cur = content.substeps[idx];
  cur.words.filter((w) => w.parts.every((p) => cards.has(p.card))).forEach((word) => out.push({ word, substep: cur.id }));
  return out;
}
```

- [ ] **Step 5: Run availability tests**

Run: `npx vitest run tests/engine/availability.test.ts`
Expected: PASS.

- [ ] **Step 6: Write the failing strength tests**

`tests/engine/strength.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { INITIAL_STRENGTH, decayStrengths, updateStrengths } from '../../src/engine/strength';
import type { ScoredResponse } from '../../src/engine/types';

const r = (itemKey: string, correct: boolean): ScoredResponse => ({ itemKey, correct, activity: 'tap', isReview: false, parentMarked: false });

describe('strengths', () => {
  it('starts new items at the initial value and moves up on correct', () => {
    const s = updateStrengths({}, [r('word:1.1:map', true)], 1);
    expect(s['word:1.1:map'].value).toBeCloseTo(INITIAL_STRENGTH + (1 - INITIAL_STRENGTH) * 0.2);
    expect(s['word:1.1:map'].lastSeen).toBe(1);
  });

  it('halves on a miss', () => {
    const s = updateStrengths({ 'card:a': { value: 0.8, lastSeen: 1 } }, [r('card:a', false)], 2);
    expect(s['card:a'].value).toBeCloseTo(0.4);
    expect(s['card:a'].lastSeen).toBe(2);
  });

  it('does not mutate the input', () => {
    const before = { 'card:a': { value: 0.8, lastSeen: 1 } };
    updateStrengths(before, [r('card:a', false)], 2);
    expect(before['card:a'].value).toBe(0.8);
  });

  it('decays unseen items toward the middle without touching lastSeen', () => {
    const s = decayStrengths({ old: { value: 1, lastSeen: 1 }, fresh: { value: 1, lastSeen: 9 } }, 10);
    expect(s.old.value).toBeCloseTo(0.95);
    expect(s.old.lastSeen).toBe(1);
    expect(s.fresh.value).toBe(1);
  });
});
```

- [ ] **Step 7: Run to see it fail, then write strength**

Run: `npx vitest run tests/engine/strength.test.ts` (expect module-not-found failure), then create:

`src/engine/strength.ts`:
```ts
import type { ScoredResponse, Strengths } from './types';

export const INITIAL_STRENGTH = 0.5;
export const DECAY_AFTER_SESSIONS = 5;

export function updateStrengths(strengths: Strengths, responses: ScoredResponse[], sessionNumber: number): Strengths {
  const next: Strengths = { ...strengths };
  for (const r of responses) {
    const v = next[r.itemKey]?.value ?? INITIAL_STRENGTH;
    next[r.itemKey] = { value: r.correct ? v + (1 - v) * 0.2 : v * 0.5, lastSeen: sessionNumber };
  }
  return next;
}

/** Items not seen for a while drift 10% toward the middle so they resurface in review. */
export function decayStrengths(strengths: Strengths, sessionNumber: number): Strengths {
  const next: Strengths = {};
  for (const [k, s] of Object.entries(strengths)) {
    const stale = sessionNumber - s.lastSeen > DECAY_AFTER_SESSIONS;
    next[k] = stale ? { value: s.value + (INITIAL_STRENGTH - s.value) * 0.1, lastSeen: s.lastSeen } : s;
  }
  return next;
}
```

- [ ] **Step 8: Run all tests and type check, then commit**

Run: `npm test && npm run typecheck`
Expected: all PASS.

```bash
git add -A
git commit -m "Add engine types, seeded randomness, card and word availability, and strength scores

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Review selection

**Files:**
- Create: `src/engine/review.ts`
- Test: `tests/engine/review.test.ts`

**Interfaces:**
- Consumes: `Strengths` (Task 3), `Rng`, `sample` (Task 3), `INITIAL_STRENGTH`.
- Produces: `Candidate<T> = { key: string; substep: string; item: T }`, `REVIEW_FLOOR_SESSIONS`, `pickReview<T>(candidates, strengths, n, sessionNumber, rng): T[]`.

- [ ] **Step 1: Write the failing tests**

`tests/engine/review.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { pickReview, type Candidate } from '../../src/engine/review';
import { seeded } from '../../src/engine/rng';

const cands: Candidate<string>[] = [
  { key: 'card:a', substep: '1.1', item: 'a' },
  { key: 'card:b', substep: '1.1', item: 'b' },
  { key: 'card:c', substep: '1.2', item: 'c' },
  { key: 'card:d', substep: '1.2', item: 'd' },
];

describe('pickReview', () => {
  it('returns nothing for n <= 0 or no candidates', () => {
    expect(pickReview(cands, {}, 0, 5, seeded(1))).toEqual([]);
    expect(pickReview([], {}, 3, 5, seeded(1))).toEqual([]);
  });

  it('never returns duplicates and never more than n', () => {
    for (let seed = 0; seed < 20; seed++) {
      const out = pickReview(cands, {}, 3, 5, seeded(seed));
      expect(out.length).toBe(3);
      expect(new Set(out).size).toBe(3);
    }
  });

  it('prefers weak items', () => {
    const strengths = { 'card:a': { value: 0.05, lastSeen: 5 }, 'card:b': { value: 0.99, lastSeen: 5 }, 'card:c': { value: 0.99, lastSeen: 5 }, 'card:d': { value: 0.99, lastSeen: 5 } };
    let hits = 0;
    for (let seed = 0; seed < 50; seed++) if (pickReview(cands, strengths, 1, 5, seeded(seed))[0] === 'a') hits++;
    expect(hits).toBeGreaterThan(35);
  });

  it('forces one item from any substep not touched recently', () => {
    // 1.1 seen this session, strong; 1.2 never seen -> 1.2 must appear
    const strengths = { 'card:a': { value: 0.99, lastSeen: 5 }, 'card:b': { value: 0.99, lastSeen: 5 } };
    for (let seed = 0; seed < 20; seed++) {
      const out = pickReview(cands, strengths, 1, 5, seeded(seed));
      expect(['c', 'd']).toContain(out[0]);
    }
  });
});
```

- [ ] **Step 2: Run to see it fail, then implement**

Run: `npx vitest run tests/engine/review.test.ts` (expect module-not-found), then create:

`src/engine/review.ts`:
```ts
import type { Strengths } from './types';
import { INITIAL_STRENGTH } from './strength';
import { sample, type Rng } from './rng';

export interface Candidate<T> {
  key: string;
  substep: string;
  item: T;
}

/** A substep untouched for this many sessions gets one forced review item. */
export const REVIEW_FLOOR_SESSIONS = 4;

export function pickReview<T>(cands: Candidate<T>[], strengths: Strengths, n: number, sessionNumber: number, rng: Rng): T[] {
  if (n <= 0 || cands.length === 0) return [];
  const chosen: Candidate<T>[] = [];
  const remaining = [...cands];
  const take = (c: Candidate<T>) => {
    chosen.push(c);
    remaining.splice(remaining.indexOf(c), 1);
  };

  for (const s of [...new Set(cands.map((c) => c.substep))]) {
    if (chosen.length >= n) break;
    const items = remaining.filter((c) => c.substep === s);
    const touched = items.some((c) => {
      const st = strengths[c.key];
      return st !== undefined && sessionNumber - st.lastSeen <= REVIEW_FLOOR_SESSIONS;
    });
    if (!touched && items.length > 0) take(sample(items, 1, rng)[0]);
  }

  while (chosen.length < n && remaining.length > 0) {
    const weights = remaining.map((c) => 1 - (strengths[c.key]?.value ?? INITIAL_STRENGTH) + 0.05);
    const total = weights.reduce((a, b) => a + b, 0);
    let r = rng() * total;
    let i = 0;
    while (i < remaining.length - 1 && r >= weights[i]) {
      r -= weights[i];
      i++;
    }
    take(remaining[i]);
  }
  return chosen.map((c) => c.item);
}
```

- [ ] **Step 3: Run tests, type check, commit**

Run: `npm test && npm run typecheck`
Expected: PASS.

```bash
git add -A
git commit -m "Add review selection weighted toward weak items with a floor per earlier substep

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Session assembly

**Files:**
- Create: `src/engine/session.ts`
- Test: `tests/engine/session.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 3 and 4.
- Produces:
```ts
export interface ReverseItem { target: string; choices: string[]; isReview: boolean }
export interface WordRef { word: Word; substep: string; isReview: boolean }
export type WordWorkItem =
  | (WordRef & { type: 'tap' })
  | (WordRef & { type: 'find'; choices: string[] })
  | (WordRef & { type: 'build' });
export type SpellingItem =
  | { type: 'sound'; card: string; choices: string[]; isReview: boolean }
  | { type: 'word'; word: Word; substep: string; tray: string[]; isReview: boolean }
  | { type: 'sentence'; text: string; substep: string; words: string[] };
export interface SessionPlan {
  sessionNumber: number; substep: string; substepTitle: string;
  lessonMode: 'full' | 'review'; readAloudFirst: boolean;
  forwardCards: string[]; reverseItems: ReverseItem[];
  lesson: LessonStep[];
  wordWork: WordWorkItem[];
  spelling: SpellingItem[];
  readAloud: { words: WordRef[]; sentences: string[] };
  story: Story;
}
export const COUNTS: {...};
export function buildSession(content: Content, state: ProfileState, rng: Rng): SessionPlan;
export function findChoices(target: Word, pool: Word[], rng: Rng): string[];
```

- [ ] **Step 1: Write the failing tests**

`tests/engine/session.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { CONTENT } from '../../src/content';
import { cvc, cvcNonsense } from '../../src/content/build';
import type { Content, Substep, Word } from '../../src/content/types';
import { buildSession, findChoices, COUNTS } from '../../src/engine/session';
import { initialState } from '../../src/engine/types';
import { seeded } from '../../src/engine/rng';

describe('buildSession on substep 1.1 with a fresh profile', () => {
  const plan = buildSession(CONTENT, initialState('1.1'), seeded(3));

  it('numbers the session and names the substep', () => {
    expect(plan.sessionNumber).toBe(1);
    expect(plan.substep).toBe('1.1');
    expect(plan.substepTitle.length).toBeGreaterThan(0);
  });

  it('runs the full lesson the first time and the review version after', () => {
    expect(plan.lessonMode).toBe('full');
    expect(plan.lesson.length).toBeGreaterThan(3);
    const later = buildSession(CONTENT, { ...initialState('1.1'), lessonPending: false, sessionsCompleted: 1 }, seeded(3));
    expect(later.lessonMode).toBe('review');
    expect(later.lesson.every((s) => 'try' in s)).toBe(true);
  });

  it('shows every current card in the forward drill when there is nothing to review', () => {
    expect([...plan.forwardCards].sort()).toEqual([...CONTENT.substeps[0].groups[0].cards].sort());
  });

  it('builds reverse items with three distinct choices including the target, filling from current cards when there is nothing to review', () => {
    expect(plan.reverseItems.length).toBe(COUNTS.reverse);
    expect(new Set(plan.reverseItems.map((r) => r.target)).size).toBe(COUNTS.reverse);
    for (const it of plan.reverseItems) {
      expect(it.choices.length).toBe(3);
      expect(new Set(it.choices).size).toBe(3);
      expect(it.choices).toContain(it.target);
      expect(it.isReview).toBe(false);
    }
  });

  it('builds 12 word-work items cycling tap/find/build with at least 4 nonsense', () => {
    expect(plan.wordWork.length).toBe(COUNTS.wordWork);
    expect(plan.wordWork.map((w) => w.type)).toEqual(['tap', 'find', 'build', 'tap', 'find', 'build', 'tap', 'find', 'build', 'tap', 'find', 'build']);
    expect(plan.wordWork.filter((w) => w.word.kind === 'nonsense').length).toBeGreaterThanOrEqual(COUNTS.minNonsense);
    expect(new Set(plan.wordWork.map((w) => w.word.text)).size).toBe(COUNTS.wordWork);
    for (const w of plan.wordWork) if (w.type === 'find') {
      expect(w.choices.length).toBe(3);
      expect(w.choices).toContain(w.word.text);
    }
  });

  it('builds 3 sound, 5 word, 2 sentence spelling items', () => {
    const types = plan.spelling.map((s) => s.type);
    expect(types.filter((t) => t === 'sound').length).toBe(COUNTS.spellSound);
    expect(types.filter((t) => t === 'word').length).toBe(COUNTS.spellWord);
    expect(types.filter((t) => t === 'sentence').length).toBe(COUNTS.spellSentence);
    for (const s of plan.spelling) {
      if (s.type === 'sound') { expect(s.choices.length).toBe(4); expect(s.choices).toContain(s.card); }
      if (s.type === 'word') { expect(s.tray.length).toBe(s.word.parts.length + 2); for (const p of s.word.parts) expect(s.tray).toContain(p.grapheme); }
      if (s.type === 'sentence') expect([...s.words].sort().join(' ')).toBe(s.text.split(/\s+/).sort().join(' '));
    }
  });

  it('builds a read-aloud list and picks a story by session number', () => {
    expect(plan.readAloud.words.length).toBe(COUNTS.readAloudWords);
    expect(plan.readAloud.sentences.length).toBe(COUNTS.readAloudSentences);
    expect(plan.story.title).toBe(CONTENT.substeps[0].stories[0].title);
    const second = buildSession(CONTENT, { ...initialState('1.1'), sessionsCompleted: 1 }, seeded(3));
    expect(second.story.title).toBe(CONTENT.substeps[0].stories[1].title);
  });

  it('offers a queued read-aloud first', () => {
    expect(plan.readAloudFirst).toBe(false);
    expect(buildSession(CONTENT, { ...initialState('1.1'), pendingReadAloud: true }, seeded(3)).readAloudFirst).toBe(true);
  });

  it('is deterministic for a seed', () => {
    expect(buildSession(CONTENT, initialState('1.1'), seeded(9))).toEqual(buildSession(CONTENT, initialState('1.1'), seeded(9)));
  });
});

describe('buildSession with an earlier substep to review', () => {
  const s11: Substep = { ...CONTENT.substeps[0] };
  const s12: Substep = {
    id: '1.2', title: 'Next', parentSummary: '', concepts: [], sightWords: [], stories: CONTENT.substeps[0].stories,
    groups: [{ cards: ['b', 'u'], lesson: [{ try: 'bat' }] }],
    words: [cvc('bat'), cvc('bud'), cvc('bag'), cvc('bit'), cvc('sub'), cvc('tub'), cvcNonsense('bip'), cvcNonsense('bup'), cvcNonsense('lub'), cvcNonsense('mub')],
    sentences: ['The bat sat.', 'A bud is on the log.', 'The tub is in the fog.'],
  };
  const content: Content = { cards: CARDS, substeps: [s11, s12] };
  const plan = buildSession(content, { ...initialState('1.2'), sessionsCompleted: 5, substepEnteredAt: 5 }, seeded(1));

  it('mixes review items in', () => {
    expect(plan.wordWork.filter((w) => w.isReview).length).toBe(COUNTS.wordWork - COUNTS.wordWorkCurrent);
    expect(plan.wordWork.filter((w) => !w.isReview).every((w) => w.substep === '1.2')).toBe(true);
    // 1.2 here has only two cards, so two current targets and four review targets
    expect(plan.reverseItems.filter((r) => !r.isReview).length).toBe(2);
    expect(plan.reverseItems.filter((r) => r.isReview).length).toBe(COUNTS.reverse - 2);
    expect(plan.forwardCards.length).toBe(2 + COUNTS.forwardReview);
  });

  it('takes fewer current items when the substep has few words', () => {
    // only 6 real + 4 nonsense current words: word-work can still fill 12 with review
    expect(plan.wordWork.length).toBe(COUNTS.wordWork);
  });
});

describe('findChoices', () => {
  const pool: Word[] = [cvc('map'), cvc('mat'), cvc('mad'), cvc('sit'), cvc('log')];
  it('prefers words that differ by one sound', () => {
    const out = findChoices(cvc('map'), pool, seeded(2));
    expect(out.length).toBe(3);
    expect(out).toContain('map');
    expect(out.filter((t) => t === 'mat' || t === 'mad').length).toBe(2);
  });
  it('falls back to any words when there are no near misses', () => {
    const out = findChoices(cvc('log'), [cvc('log'), cvc('sit'), cvc('map')], seeded(2));
    expect(out.sort()).toEqual(['log', 'map', 'sit']);
  });
});
```

- [ ] **Step 2: Run to see it fail, then implement**

Run: `npx vitest run tests/engine/session.test.ts` (expect module-not-found), then create:

`src/engine/session.ts`:
```ts
import type { Content, LessonStep, Story, Word } from '../content/types';
import type { ProfileState } from './types';
import { cardKey, wordKey } from './types';
import { availableCards, availableWords, getSubstep, substepIndex } from './availability';
import { pickReview, type Candidate } from './review';
import { sample, shuffle, type Rng } from './rng';

export interface ReverseItem { target: string; choices: string[]; isReview: boolean }
export interface WordRef { word: Word; substep: string; isReview: boolean }
export type WordWorkItem =
  | (WordRef & { type: 'tap' })
  | (WordRef & { type: 'find'; choices: string[] })
  | (WordRef & { type: 'build' });
export type SpellingItem =
  | { type: 'sound'; card: string; choices: string[]; isReview: boolean }
  | { type: 'word'; word: Word; substep: string; tray: string[]; isReview: boolean }
  | { type: 'sentence'; text: string; substep: string; words: string[] };

export interface SessionPlan {
  sessionNumber: number;
  substep: string;
  substepTitle: string;
  lessonMode: 'full' | 'review';
  readAloudFirst: boolean;
  forwardCards: string[];
  reverseItems: ReverseItem[];
  lesson: LessonStep[];
  wordWork: WordWorkItem[];
  spelling: SpellingItem[];
  readAloud: { words: WordRef[]; sentences: string[] };
  story: Story;
}

export const COUNTS = {
  forwardReview: 6,
  reverse: 6,
  reverseCurrent: 4,
  wordWork: 12,
  wordWorkCurrent: 8,
  minNonsense: 4,
  spellSound: 3,
  spellSoundCurrent: 2,
  spellWord: 5,
  spellWordCurrent: 4,
  spellSentence: 2,
  readAloudWords: 8,
  readAloudCurrent: 6,
  readAloudSentences: 3,
};

export function findChoices(target: Word, pool: Word[], rng: Rng): string[] {
  const others = pool.filter((w) => w.text !== target.text);
  const sameLen = others.filter((w) => w.parts.length === target.parts.length);
  const oneOff = sameLen.filter((w) => w.parts.filter((p, i) => p.card !== target.parts[i].card).length === 1);
  const rest = sameLen.filter((w) => !oneOff.includes(w));
  const picks: Word[] = sample(oneOff, 2, rng);
  if (picks.length < 2) picks.push(...sample(rest, 2 - picks.length, rng));
  if (picks.length < 2) picks.push(...sample(others.filter((w) => !picks.includes(w)), 2 - picks.length, rng));
  return shuffle([target.text, ...picks.map((w) => w.text)], rng);
}

export function buildSession(content: Content, state: ProfileState, rng: Rng): SessionPlan {
  const sub = getSubstep(content, state.currentSubstep);
  const idx = substepIndex(content, sub.id);
  const earlier = content.substeps.slice(0, idx);
  const groupIndex = Math.min(state.currentGroup, sub.groups.length - 1);
  const group = sub.groups[groupIndex];
  const n = state.sessionsCompleted + 1;
  const strengths = state.strengths;

  const currentCards = sub.groups.slice(0, groupIndex + 1).flatMap((g) => g.cards);
  const allCards = availableCards(content, sub.id, groupIndex);
  const earlierCards: Candidate<string>[] = earlier.flatMap((s) => s.groups.flatMap((g) => g.cards.map((c) => ({ key: cardKey(c), substep: s.id, item: c }))));
  const available = availableWords(content, sub.id, groupIndex);
  const currentWords = available.filter((w) => w.substep === sub.id);
  const allWords = available.map((w) => w.word);
  const earlierWords: Candidate<{ word: Word; substep: string }>[] = earlier.flatMap((s) => s.words.map((word) => ({ key: wordKey(s.id, word.text), substep: s.id, item: { word, substep: s.id } })));

  const distractors = (exclude: string[], k: number) => sample(allCards.filter((c) => !exclude.includes(c)), k, rng);
  /** When there is little or nothing to review (a fresh profile on 1.1), fill the slots from current items instead. */
  const topUp = <T,>(picked: T[], pool: T[], n: number): T[] => [...picked, ...sample(pool.filter((x) => !picked.includes(x)), n - picked.length, rng)];

  // 1. sound cards
  const forwardCards = shuffle([...currentCards, ...pickReview(earlierCards, strengths, COUNTS.forwardReview, n, rng)], rng);
  const reverseCur = sample(currentCards, COUNTS.reverseCurrent, rng);
  const reverseRev = pickReview(earlierCards, strengths, COUNTS.reverse - reverseCur.length, n, rng);
  const reverseTargets = [
    ...topUp(reverseCur, currentCards, COUNTS.reverse - reverseRev.length).map((c) => ({ c, isReview: false })),
    ...reverseRev.map((c) => ({ c, isReview: true })),
  ];
  const reverseItems: ReverseItem[] = reverseTargets.map(({ c, isReview }) => ({ target: c, isReview, choices: shuffle([c, ...distractors([c], 2)], rng) }));

  // 2. lesson
  const lesson = state.lessonPending ? group.lesson : group.lesson.filter((s) => 'try' in s);

  // 3. word work
  const curNonsense = currentWords.filter((w) => w.word.kind === 'nonsense');
  const curReal = currentWords.filter((w) => w.word.kind === 'real');
  const pickedNonsense = sample(curNonsense, COUNTS.minNonsense, rng);
  const pickedReal = sample(curReal, COUNTS.wordWorkCurrent - pickedNonsense.length, rng);
  const review = pickReview(earlierWords, strengths, COUNTS.wordWork - COUNTS.wordWorkCurrent, n, rng).map((w) => ({ ...w, isReview: true }));
  const current = topUp([...pickedNonsense, ...pickedReal], currentWords, COUNTS.wordWork - review.length).map((w) => ({ ...w, isReview: false }));
  const types: WordWorkItem['type'][] = ['tap', 'find', 'build'];
  const wordWork: WordWorkItem[] = shuffle([...current, ...review], rng).map((w, i) => {
    const type = types[i % 3];
    return type === 'find' ? { ...w, type, choices: findChoices(w.word, allWords, rng) } : { ...w, type };
  });

  // 4. spelling
  const soundCur = sample(currentCards, COUNTS.spellSoundCurrent, rng);
  const soundRev = pickReview(earlierCards, strengths, COUNTS.spellSound - soundCur.length, n, rng);
  const soundCurrent = topUp(soundCur, currentCards, COUNTS.spellSound - soundRev.length).map((c) => ({ c, isReview: false }));
  const soundReview = soundRev.map((c) => ({ c, isReview: true }));
  const spellSounds: SpellingItem[] = [...soundCurrent, ...soundReview].map(({ c, isReview }) => ({ type: 'sound', card: c, isReview, choices: shuffle([c, ...distractors([c], 3)], rng) }));
  const spellPick = sample(currentWords, COUNTS.spellWordCurrent, rng);
  const spellRev = pickReview(earlierWords, strengths, COUNTS.spellWord - spellPick.length, n, rng).map((w) => ({ ...w, isReview: true }));
  const spellCur = topUp(spellPick, currentWords, COUNTS.spellWord - spellRev.length).map((w) => ({ ...w, isReview: false }));
  const spellWords: SpellingItem[] = [...spellCur, ...spellRev].map((w) => ({
    type: 'word',
    word: w.word,
    substep: w.substep,
    isReview: w.isReview,
    tray: shuffle([...w.word.parts.map((p) => p.grapheme), ...distractors(w.word.parts.map((p) => p.card), 2)], rng),
  }));
  const spellSentences: SpellingItem[] = sample(sub.sentences, COUNTS.spellSentence, rng).map((text) => ({ type: 'sentence', text, substep: sub.id, words: shuffle(text.split(/\s+/), rng) }));
  const spelling = [...spellSounds, ...spellWords, ...spellSentences];

  // 5. read aloud
  const raPick = sample(curReal, COUNTS.readAloudCurrent, rng);
  const raRev = pickReview(earlierWords, strengths, COUNTS.readAloudWords - raPick.length, n, rng).map((w) => ({ ...w, isReview: true }));
  const raCur = topUp(raPick, curReal, COUNTS.readAloudWords - raRev.length).map((w) => ({ ...w, isReview: false }));
  const readAloud = { words: [...raCur, ...raRev], sentences: sample(sub.sentences, COUNTS.readAloudSentences, rng) };

  // 6. story
  const story = sub.stories[(n - 1) % sub.stories.length];

  return {
    sessionNumber: n,
    substep: sub.id,
    substepTitle: sub.title,
    lessonMode: state.lessonPending ? 'full' : 'review',
    readAloudFirst: state.pendingReadAloud,
    forwardCards,
    reverseItems,
    lesson,
    wordWork,
    spelling,
    readAloud,
    story,
  };
}
```

- [ ] **Step 3: Run tests, type check, commit**

Run: `npm test && npm run typecheck`
Expected: PASS. If the "at least 4 nonsense" test fails on a fresh 1.1 profile, it means `pickReview` had nothing to draw from and `current` was short; that cannot happen with 1.1's 15 nonsense words, so check `sample` arguments.

```bash
git add -A
git commit -m "Build the daily session plan: sound cards, lesson, word work, spelling, read-aloud and story

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Progression: finishing a session, advancing, moving, placement rule

**Files:**
- Create: `src/engine/progression.ts`
- Test: `tests/engine/progression.test.ts`

**Interfaces:**
- Consumes: Task 3 types and strength functions, `getSubstep`, `substepIndex`, `cardKey`.
- Produces:
```ts
export const ADVANCE = { minSessions: 3, window: 3, current: 0.9, review: 0.85, readAloud: 0.85, readAloudGrace: 5, groupReverse: 0.8 };
export function accuracy(responses: ScoredResponse[]): number | null;
export function shouldAdvance(state: ProfileState, logs: SessionLog[], content: Content): boolean;
export interface FinishResult { state: ProfileState; advancedTo: string | null; groupAdvanced: boolean }
export function finishSession(state: ProfileState, log: SessionLog, previousLogs: SessionLog[], content: Content): FinishResult;
export function moveTo(state: ProfileState, substepId: string): ProfileState;
export const PLACEMENT_SUBSTEPS = ['1.1', '1.3', '1.6', '2.2', '2.5', '3.1', '3.4'];
export interface PlacementResult { substep: string; correct: number; total: number }
export function suggestPlacement(results: PlacementResult[]): string;
```

- [ ] **Step 1: Write the failing tests**

`tests/engine/progression.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { cvc, cvcNonsense } from '../../src/content/build';
import type { Content, Substep } from '../../src/content/types';
import { ADVANCE, accuracy, finishSession, moveTo, shouldAdvance, suggestPlacement } from '../../src/engine/progression';
import { cardKey, initialState, type ProfileState, type ScoredResponse, type SessionLog } from '../../src/engine/types';

const base: Omit<Substep, 'id' | 'groups'> = { title: '', parentSummary: '', concepts: [], sightWords: [], sentences: [], stories: [], words: [cvc('map'), cvcNonsense('mip')] };
const s11: Substep = { ...base, id: '1.1', groups: [{ cards: ['m', 'a', 'p'], lesson: [] }] };
const s12: Substep = { ...base, id: '1.2', groups: [{ cards: ['b'], lesson: [] }, { cards: ['u'], lesson: [] }] };
const s13: Substep = { ...base, id: '1.3', groups: [{ cards: [], lesson: [] }] };
const content: Content = { cards: CARDS, substeps: [s11, s12, s13] };

const resp = (correct: boolean, over: Partial<ScoredResponse> = {}): ScoredResponse => ({ itemKey: 'word:1.1:map', activity: 'tap', correct, isReview: false, parentMarked: false, ...over });

function log(sessionNumber: number, responses: ScoredResponse[], over: Partial<SessionLog> = {}): SessionLog {
  return { sessionNumber, date: '2026-09-12T00:00:00Z', substep: '1.1', complete: true, readAloudDone: false, responses, ...over };
}

/** n good sessions: 10 current correct, 4 review correct each. */
function goodLogs(n: number, from = 1): SessionLog[] {
  return Array.from({ length: n }, (_, i) => log(from + i, [...Array(10).fill(0).map(() => resp(true)), ...Array(4).fill(0).map(() => resp(true, { isReview: true }))]));
}

describe('accuracy', () => {
  it('returns null for no responses', () => expect(accuracy([])).toBeNull());
  it('computes the fraction correct', () => expect(accuracy([resp(true), resp(false)])).toBe(0.5));
});

describe('shouldAdvance', () => {
  const at = (sessions: number): ProfileState => ({ ...initialState('1.1'), sessionsCompleted: sessions });

  it('needs at least three complete sessions at the substep', () => {
    expect(shouldAdvance(at(2), goodLogs(2), content)).toBe(false);
    expect(shouldAdvance(at(3), goodLogs(3), content)).toBe(true);
    const oneIncomplete = goodLogs(3).map((l, i) => (i === 0 ? { ...l, complete: false } : l));
    expect(shouldAdvance(at(3), oneIncomplete, content)).toBe(false);
  });

  it('ignores sessions from before the child entered the substep', () => {
    const state = { ...at(6), substepEnteredAt: 4 };
    expect(shouldAdvance(state, goodLogs(6), content)).toBe(false);
  });

  it('requires 90% on current items and 85% on review over the last three sessions', () => {
    const weakCurrent = [...goodLogs(2), log(3, [...Array(8).fill(0).map(() => resp(true)), resp(false), resp(false), resp(false), resp(false)])];
    expect(shouldAdvance(at(3), weakCurrent, content)).toBe(false);
    const weakReview = [...goodLogs(2), log(3, [...Array(10).fill(0).map(() => resp(true)), ...Array(4).fill(0).map(() => resp(false, { isReview: true }))])];
    expect(shouldAdvance(at(3), weakReview, content)).toBe(false);
  });

  it('holds the child when the latest read-aloud at this substep failed', () => {
    const logs = [...goodLogs(2), log(3, [...Array(10).fill(0).map(() => resp(true)), resp(false, { activity: 'read-aloud', parentMarked: true }), resp(false, { activity: 'read-aloud', parentMarked: true })], { readAloudDone: true })];
    expect(shouldAdvance(at(3), logs, content)).toBe(false);
  });

  it('advances when the latest read-aloud passed', () => {
    const logs = [...goodLogs(2), log(3, [...Array(10).fill(0).map(() => resp(true)), ...Array(5).fill(0).map(() => resp(true, { activity: 'read-aloud', parentMarked: true }))], { readAloudDone: true })];
    expect(shouldAdvance(at(3), logs, content)).toBe(true);
  });

  it('does not use parent-marked responses in the solo accuracy', () => {
    const logs = [...goodLogs(2), log(3, [...Array(10).fill(0).map(() => resp(true)), ...Array(5).fill(0).map(() => resp(true, { activity: 'read-aloud', parentMarked: true })), resp(false, { parentMarked: true, activity: 'read-aloud' })], { readAloudDone: true })];
    // read-aloud 5/6 = 0.83 < 0.85 -> hold; solo accuracy would be fine
    expect(shouldAdvance(at(3), logs, content)).toBe(false);
  });

  it('allows advancing with no read-aloud only if none happened in the last five sessions', () => {
    const state = { ...at(8), substepEnteredAt: 5 };
    const earlierRA = log(4, [resp(true, { activity: 'read-aloud', parentMarked: true })], { substep: '1.0', readAloudDone: true });
    const logs = [log(1, []), log(2, []), log(3, []), earlierRA, ...goodLogs(4, 5)];
    expect(shouldAdvance(state, logs, content)).toBe(false);
    const older = [earlierRA, log(2, []), log(3, []), log(4, []), ...goodLogs(4, 5)].map((l, i) => ({ ...l, sessionNumber: i + 1 }));
    expect(shouldAdvance({ ...state, substepEnteredAt: 4 }, older, content)).toBe(true);
  });
});

describe('finishSession', () => {
  it('increments the session count, applies strengths, clears lessonPending, queues read-aloud if skipped', () => {
    const state = initialState('1.1');
    const l = log(1, [resp(true), resp(false, { itemKey: cardKey('a'), activity: 'sound-reverse' })]);
    const out = finishSession(state, l, [], content);
    expect(out.state.sessionsCompleted).toBe(1);
    expect(out.state.lessonPending).toBe(false);
    expect(out.state.pendingReadAloud).toBe(true);
    expect(out.state.strengths['word:1.1:map'].value).toBeCloseTo(0.6);
    expect(out.state.strengths[cardKey('a')].value).toBeCloseTo(0.25);
    expect(out.advancedTo).toBeNull();
    expect(out.groupAdvanced).toBe(false);
  });

  it('records a done read-aloud', () => {
    const out = finishSession(initialState('1.1'), log(1, [], { readAloudDone: true }), [], content);
    expect(out.state.pendingReadAloud).toBe(false);
    expect(out.state.lastReadAloudSession).toBe(1);
  });

  it('advances to the next substep when the rule is met', () => {
    const state = { ...initialState('1.1'), sessionsCompleted: 2, lessonPending: false };
    const prev = goodLogs(2);
    const out = finishSession(state, goodLogs(1, 3)[0], prev, content);
    expect(out.advancedTo).toBe('1.2');
    expect(out.state.currentSubstep).toBe('1.2');
    expect(out.state.currentGroup).toBe(0);
    expect(out.state.substepEnteredAt).toBe(3);
    expect(out.state.lessonPending).toBe(true);
  });

  it('moves to the next card group when reverse-drill accuracy on the group is high, before advancing the substep', () => {
    const state = { ...initialState('1.2'), sessionsCompleted: 5, substepEnteredAt: 5 };
    const l = log(6, [resp(true, { itemKey: cardKey('b'), activity: 'sound-reverse' }), resp(true, { itemKey: cardKey('b'), activity: 'sound-reverse' })], { substep: '1.2' });
    const out = finishSession(state, l, [], content);
    expect(out.groupAdvanced).toBe(true);
    expect(out.state.currentGroup).toBe(1);
    expect(out.state.lessonPending).toBe(true);
    expect(out.advancedTo).toBeNull();
  });

  it('does not move groups on a weak reverse drill', () => {
    const state = { ...initialState('1.2'), sessionsCompleted: 5, substepEnteredAt: 5 };
    const l = log(6, [resp(true, { itemKey: cardKey('b'), activity: 'sound-reverse' }), resp(false, { itemKey: cardKey('b'), activity: 'sound-reverse' })], { substep: '1.2' });
    expect(finishSession(state, l, [], content).state.currentGroup).toBe(0);
  });

  it('never advances past the last substep', () => {
    const state = { ...initialState('1.3'), sessionsCompleted: 2 };
    const out = finishSession(state, { ...goodLogs(1, 3)[0], substep: '1.3' }, goodLogs(2).map((l) => ({ ...l, substep: '1.3' })), content);
    expect(out.advancedTo).toBeNull();
    expect(out.state.currentSubstep).toBe('1.3');
  });
});

describe('moveTo', () => {
  it('resets group, entry point and lesson flag', () => {
    const s = moveTo({ ...initialState('1.1'), sessionsCompleted: 7, currentGroup: 1, lessonPending: false }, '1.3');
    expect(s).toMatchObject({ currentSubstep: '1.3', currentGroup: 0, substepEnteredAt: 7, lessonPending: true, sessionsCompleted: 7 });
  });
});

describe('suggestPlacement', () => {
  it('returns the last list that passed, or 1.1', () => {
    expect(suggestPlacement([])).toBe('1.1');
    expect(suggestPlacement([{ substep: '1.1', correct: 4, total: 8 }])).toBe('1.1');
    expect(suggestPlacement([{ substep: '1.1', correct: 8, total: 8 }, { substep: '1.3', correct: 6, total: 8 }, { substep: '1.6', correct: 3, total: 8 }])).toBe('1.3');
    expect(suggestPlacement([{ substep: '1.1', correct: 8, total: 8 }, { substep: '1.3', correct: 5, total: 8 }, { substep: '1.6', correct: 8, total: 8 }])).toBe('1.1');
  });
  it('exposes the thresholds', () => {
    expect(ADVANCE.current).toBe(0.9);
  });
});
```

- [ ] **Step 2: Run to see it fail, then implement**

Run: `npx vitest run tests/engine/progression.test.ts` (expect module-not-found), then create:

`src/engine/progression.ts`:
```ts
import type { Content } from '../content/types';
import { getSubstep, substepIndex } from './availability';
import { decayStrengths, updateStrengths } from './strength';
import { cardKey, type ProfileState, type ScoredResponse, type SessionLog } from './types';

export const ADVANCE = {
  minSessions: 3,
  window: 3,
  current: 0.9,
  review: 0.85,
  readAloud: 0.85,
  readAloudGrace: 5,
  groupReverse: 0.8,
};

export function accuracy(responses: ScoredResponse[]): number | null {
  if (responses.length === 0) return null;
  return responses.filter((r) => r.correct).length / responses.length;
}

export function shouldAdvance(state: ProfileState, logs: SessionLog[], content: Content): boolean {
  const here = logs.filter((l) => l.substep === state.currentSubstep && l.complete && l.sessionNumber > state.substepEnteredAt);
  if (here.length < ADVANCE.minSessions) return false;
  if (state.sessionsCompleted - state.substepEnteredAt < ADVANCE.minSessions) return false;

  const recent = here.slice(-ADVANCE.window).flatMap((l) => l.responses).filter((r) => !r.parentMarked);
  const cur = accuracy(recent.filter((r) => !r.isReview));
  const rev = accuracy(recent.filter((r) => r.isReview));
  if (cur === null || cur < ADVANCE.current) return false;
  if (rev !== null && rev < ADVANCE.review) return false;

  const lastRA = [...here].reverse().find((l) => l.readAloudDone);
  if (lastRA) {
    const a = accuracy(lastRA.responses.filter((r) => r.parentMarked));
    return a === null || a >= ADVANCE.readAloud;
  }
  const lastFew = [...logs].sort((a, b) => a.sessionNumber - b.sessionNumber).slice(-ADVANCE.readAloudGrace);
  return !lastFew.some((l) => l.readAloudDone);
}

export interface FinishResult {
  state: ProfileState;
  advancedTo: string | null;
  groupAdvanced: boolean;
}

export function finishSession(state: ProfileState, log: SessionLog, previousLogs: SessionLog[], content: Content): FinishResult {
  const n = state.sessionsCompleted + 1;
  const sub = getSubstep(content, state.currentSubstep);
  const strengths = decayStrengths(updateStrengths(state.strengths, log.responses, n), n);
  const next: ProfileState = {
    ...state,
    strengths,
    sessionsCompleted: n,
    lessonPending: false,
    pendingReadAloud: !log.readAloudDone,
    lastReadAloudSession: log.readAloudDone ? n : state.lastReadAloudSession,
  };

  const groupIndex = Math.min(state.currentGroup, sub.groups.length - 1);
  if (groupIndex < sub.groups.length - 1) {
    const groupCards = new Set(sub.groups[groupIndex].cards.map(cardKey));
    const acc = accuracy(log.responses.filter((r) => r.activity === 'sound-reverse' && groupCards.has(r.itemKey)));
    if (acc !== null && acc >= ADVANCE.groupReverse) {
      return { state: { ...next, currentGroup: groupIndex + 1, lessonPending: true }, advancedTo: null, groupAdvanced: true };
    }
    return { state: next, advancedTo: null, groupAdvanced: false };
  }

  const idx = substepIndex(content, sub.id);
  if (idx < content.substeps.length - 1 && shouldAdvance(next, [...previousLogs, log], content)) {
    const to = content.substeps[idx + 1].id;
    return { state: { ...next, currentSubstep: to, currentGroup: 0, substepEnteredAt: n, lessonPending: true }, advancedTo: to, groupAdvanced: false };
  }
  return { state: next, advancedTo: null, groupAdvanced: false };
}

export function moveTo(state: ProfileState, substepId: string): ProfileState {
  return { ...state, currentSubstep: substepId, currentGroup: 0, substepEnteredAt: state.sessionsCompleted, lessonPending: true };
}

export const PLACEMENT_SUBSTEPS = ['1.1', '1.3', '1.6', '2.2', '2.5', '3.1', '3.4'];
export const PLACEMENT_PASS = 0.75;

export interface PlacementResult {
  substep: string;
  correct: number;
  total: number;
}

/** Results are given in PLACEMENT_SUBSTEPS order; the check stops at the first failure. */
export function suggestPlacement(results: PlacementResult[]): string {
  let last = '1.1';
  for (const r of results) {
    if (r.total === 0 || r.correct / r.total < PLACEMENT_PASS) break;
    last = r.substep;
  }
  return last;
}
```

- [ ] **Step 3: Run tests, type check, commit**

Run: `npm test && npm run typecheck`
Expected: PASS.

```bash
git add -A
git commit -m "Add session finishing, advancement rule, card-group progress, manual move and placement suggestion

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Storage interface, in-memory store, and IndexedDB store

**Files:**
- Create: `src/store/types.ts`, `src/store/memory.ts`, `src/store/idb.ts`
- Test: `tests/store/memory.test.ts`, `tests/store/idb.test.ts`

**Interfaces:**
- Consumes: `ProfileState`, `SessionLog` (Task 3).
- Produces:
```ts
export interface Profile { id: string; name: string; color: string; createdAt: string; state: ProfileState }
export interface Store {
  listProfiles(): Promise<Profile[]>;
  saveProfile(p: Profile): Promise<void>;       // insert or replace by id
  deleteProfile(id: string): Promise<void>;     // also deletes its logs
  listLogs(profileId: string): Promise<SessionLog[]>;   // ascending by sessionNumber
  appendLog(profileId: string, log: SessionLog): Promise<void>;
  getClip(cardId: string): Promise<Blob | undefined>;
  saveClip(cardId: string, blob: Blob): Promise<void>;
  listClipIds(): Promise<string[]>;
}
export class MemoryStore implements Store {}
export class IdbStore implements Store {}
```

- [ ] **Step 1: Write a shared store test and run it against both implementations**

`tests/store/memory.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { MemoryStore } from '../../src/store/memory';
import { storeContract } from './contract';

describe('MemoryStore', () => storeContract(() => new MemoryStore()));
```

`tests/store/contract.ts`:
```ts
import { it, expect } from 'vitest';
import type { Store, Profile } from '../../src/store/types';
import { initialState } from '../../src/engine/types';

export function storeContract(make: () => Store) {
  const profile = (id: string, name = 'Kid'): Profile => ({ id, name, color: 'sky', createdAt: '2026-09-12T00:00:00Z', state: initialState('1.1') });

  it('saves, lists, replaces and deletes profiles', async () => {
    const s = make();
    expect(await s.listProfiles()).toEqual([]);
    await s.saveProfile(profile('p1'));
    await s.saveProfile(profile('p2', 'Other'));
    expect((await s.listProfiles()).map((p) => p.id)).toEqual(['p1', 'p2']);
    await s.saveProfile(profile('p1', 'Renamed'));
    expect((await s.listProfiles()).find((p) => p.id === 'p1')?.name).toBe('Renamed');
    await s.deleteProfile('p1');
    expect((await s.listProfiles()).map((p) => p.id)).toEqual(['p2']);
  });

  it('appends and lists logs per profile in order, and drops them with the profile', async () => {
    const s = make();
    await s.saveProfile(profile('p1'));
    const l = (n: number) => ({ sessionNumber: n, date: 'd', substep: '1.1', complete: true, readAloudDone: false, responses: [] });
    await s.appendLog('p1', l(1));
    await s.appendLog('p1', l(2));
    await s.appendLog('p2', l(1));
    expect((await s.listLogs('p1')).map((x) => x.sessionNumber)).toEqual([1, 2]);
    await s.deleteProfile('p1');
    expect(await s.listLogs('p1')).toEqual([]);
    expect((await s.listLogs('p2')).length).toBe(1);
  });

  it('stores clips by card id', async () => {
    const s = make();
    expect(await s.getClip('a')).toBeUndefined();
    await s.saveClip('a', new Blob(['x'], { type: 'audio/webm' }));
    expect((await s.getClip('a'))?.size).toBe(1);
    expect(await s.listClipIds()).toEqual(['a']);
  });
}
```

`tests/store/idb.test.ts`:
```ts
import 'fake-indexeddb/auto';
import { describe } from 'vitest';
import { IdbStore } from '../../src/store/idb';
import { storeContract } from './contract';

let n = 0;
describe('IdbStore', () => storeContract(() => new IdbStore(`test-db-${n++}`)));
```

- [ ] **Step 2: Run to see them fail, then implement**

Run: `npx vitest run tests/store` (expect module-not-found), then create:

`src/store/types.ts`:
```ts
import type { ProfileState, SessionLog } from '../engine/types';

export interface Profile {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  state: ProfileState;
}

export interface Store {
  listProfiles(): Promise<Profile[]>;
  saveProfile(p: Profile): Promise<void>;
  deleteProfile(id: string): Promise<void>;
  listLogs(profileId: string): Promise<SessionLog[]>;
  appendLog(profileId: string, log: SessionLog): Promise<void>;
  getClip(cardId: string): Promise<Blob | undefined>;
  saveClip(cardId: string, blob: Blob): Promise<void>;
  listClipIds(): Promise<string[]>;
}
```

`src/store/memory.ts`:
```ts
import type { SessionLog } from '../engine/types';
import type { Profile, Store } from './types';

export class MemoryStore implements Store {
  private profiles = new Map<string, Profile>();
  private logs = new Map<string, SessionLog[]>();
  private clips = new Map<string, Blob>();

  async listProfiles() { return [...this.profiles.values()]; }
  async saveProfile(p: Profile) { this.profiles.set(p.id, structuredClone(p)); }
  async deleteProfile(id: string) { this.profiles.delete(id); this.logs.delete(id); }
  async listLogs(profileId: string) { return [...(this.logs.get(profileId) ?? [])].sort((a, b) => a.sessionNumber - b.sessionNumber); }
  async appendLog(profileId: string, log: SessionLog) { this.logs.set(profileId, [...(this.logs.get(profileId) ?? []), structuredClone(log)]); }
  async getClip(cardId: string) { return this.clips.get(cardId); }
  async saveClip(cardId: string, blob: Blob) { this.clips.set(cardId, blob); }
  async listClipIds() { return [...this.clips.keys()]; }
}
```

`src/store/idb.ts`:
```ts
import { createStore, del, get, keys, set, type UseStore } from 'idb-keyval';
import type { SessionLog } from '../engine/types';
import type { Profile, Store } from './types';

const PROFILES = 'profiles';
const logsKey = (id: string) => `logs:${id}`;
const clipKey = (id: string) => `clip:${id}`;

export class IdbStore implements Store {
  private db: UseStore;
  constructor(dbName = 'tapwords') {
    this.db = createStore(dbName, 'kv');
  }
  async listProfiles() { return ((await get<Profile[]>(PROFILES, this.db)) ?? []); }
  async saveProfile(p: Profile) {
    const all = await this.listProfiles();
    const i = all.findIndex((x) => x.id === p.id);
    if (i >= 0) all[i] = p; else all.push(p);
    await set(PROFILES, all, this.db);
  }
  async deleteProfile(id: string) {
    await set(PROFILES, (await this.listProfiles()).filter((p) => p.id !== id), this.db);
    await del(logsKey(id), this.db);
  }
  async listLogs(profileId: string) {
    return ((await get<SessionLog[]>(logsKey(profileId), this.db)) ?? []).sort((a, b) => a.sessionNumber - b.sessionNumber);
  }
  async appendLog(profileId: string, log: SessionLog) {
    await set(logsKey(profileId), [...(await this.listLogs(profileId)), log], this.db);
  }
  async getClip(cardId: string) { return get<Blob>(clipKey(cardId), this.db); }
  async saveClip(cardId: string, blob: Blob) { await set(clipKey(cardId), blob, this.db); }
  async listClipIds() {
    return (await keys<string>(this.db)).filter((k) => k.startsWith('clip:')).map((k) => k.slice(5));
  }
}
```

- [ ] **Step 3: Run tests, type check, commit**

Run: `npm test && npm run typecheck`
Expected: PASS. If `structuredClone` is missing in the Node version, upgrade Node to 18 or newer.

```bash
git add -A
git commit -m "Add the storage interface with in-memory and IndexedDB implementations

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Audio interface, fake, and browser implementation

**Files:**
- Create: `src/audio/types.ts`, `src/audio/fake.ts`, `src/audio/browser.ts`
- Test: `tests/audio/fake.test.ts`

**Interfaces:**
- Consumes: `Card`, `Store`.
- Produces:
```ts
export interface AudioPlayer { speak(text: string): Promise<void>; playCard(cardId: string): Promise<void>; stop(): void }
export class FakeAudio implements AudioPlayer { spoken: string[]; played: string[]; }
export class BrowserAudio implements AudioPlayer { constructor(cards: Card[], store: Store) }
```

- [ ] **Step 1: Write the failing test**

`tests/audio/fake.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { FakeAudio } from '../../src/audio/fake';

describe('FakeAudio', () => {
  it('records what was spoken and played, in order', async () => {
    const a = new FakeAudio();
    await a.speak('hello');
    await a.playCard('sh');
    a.stop();
    expect(a.spoken).toEqual(['hello']);
    expect(a.played).toEqual(['sh']);
    expect(a.stops).toBe(1);
  });
});
```

- [ ] **Step 2: Run to see it fail, then implement all three files**

`src/audio/types.ts`:
```ts
export interface AudioPlayer {
  /** Speak text with the computer voice. Resolves when finished or cut off. */
  speak(text: string): Promise<void>;
  /** Play a card's recorded clip, or speak its fallback label. */
  playCard(cardId: string): Promise<void>;
  /** Cut off anything currently playing. */
  stop(): void;
}
```

`src/audio/fake.ts`:
```ts
import type { AudioPlayer } from './types';

export class FakeAudio implements AudioPlayer {
  spoken: string[] = [];
  played: string[] = [];
  stops = 0;
  async speak(text: string) { this.spoken.push(text); }
  async playCard(cardId: string) { this.played.push(cardId); }
  stop() { this.stops++; }
}
```

`src/audio/browser.ts`:
```ts
import type { Card } from '../content/types';
import type { Store } from '../store/types';
import type { AudioPlayer } from './types';

export class BrowserAudio implements AudioPlayer {
  private current: HTMLAudioElement | null = null;
  private cards: Map<string, Card>;

  constructor(cards: Card[], private store: Store) {
    this.cards = new Map(cards.map((c) => [c.id, c]));
  }

  stop() {
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    if (this.current) {
      this.current.pause();
      this.current = null;
    }
  }

  speak(text: string): Promise<void> {
    this.stop();
    return new Promise((resolve) => {
      if (typeof speechSynthesis === 'undefined') return resolve();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.85;
      u.lang = 'en-US';
      const voices = speechSynthesis.getVoices();
      const voice = voices.find((v) => v.lang.startsWith('en') && v.localService) ?? voices.find((v) => v.lang.startsWith('en'));
      if (voice) u.voice = voice;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(finish, 1500 + text.length * 90);
      u.onend = finish;
      u.onerror = finish;
      speechSynthesis.speak(u);
    });
  }

  async playCard(cardId: string): Promise<void> {
    this.stop();
    const clip = await this.store.getClip(cardId);
    if (!clip) return this.speak(this.cards.get(cardId)?.phonemeLabel ?? cardId);
    const url = URL.createObjectURL(clip);
    const el = new Audio(url);
    this.current = el;
    await new Promise<void>((resolve) => {
      el.onended = () => resolve();
      el.onerror = () => resolve();
      el.play().catch(() => resolve());
    });
    URL.revokeObjectURL(url);
  }
}
```

- [ ] **Step 3: Run tests, type check, commit**

Run: `npm test && npm run typecheck`
Expected: PASS.

```bash
git add -A
git commit -m "Add the audio interface with a test fake and a browser voice-and-clip player

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: App shell, services, speech captions, shared components, styles, and the Home screen

**Files:**
- Create: `src/ui/services.tsx`, `src/ui/speech.tsx`, `src/ui/tiles.ts`, `src/ui/styles.css`, `src/ui/components/Tile.tsx`, `src/ui/components/BigButton.tsx`, `src/ui/components/HoldButton.tsx`, `src/ui/components/Path.tsx`, `src/ui/screens/Home.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`
- Test: `tests/ui/helpers.tsx`, `tests/ui/home.test.tsx`

**Interfaces:**
- Consumes: `CONTENT`, `Store`, `MemoryStore`, `IdbStore`, `AudioPlayer`, `FakeAudio`, `BrowserAudio`, `Rng`, `seeded`, `initialState`, `Profile`.
- Produces:
```ts
export interface Timing { demoDelayMs: number; previewMs: number; pauseMs: number }
export const DEFAULT_TIMING: Timing = { demoDelayMs: 350, previewMs: 1500, pauseMs: 800 };
export interface Services { content: Content; store: Store; audio: AudioPlayer; rng: Rng; timing: Timing }
export const ServicesContext; export function useServices(): Services;
export function SpeechProvider({children}); export function useSay(): (text: string) => Promise<void>; export function Caption();
export function cardTypeFor(cards: Card[], grapheme: string): CardType;
export function Tile(props: { grapheme: string; type?: CardType; size?: 'normal'|'large'; selected?: boolean; dim?: boolean; onClick?: () => void; label?: string });
export function BigButton(props: { children; onClick; variant?: 'primary'|'quiet'; disabled?: boolean });
export function HoldButton(props: { children; onHold: () => void; ms?: number });
export function Path(props: { current: string });
export function Home(props: { onStart: (p: Profile) => void; onParent: (p: Profile) => void });
export const COLORS = ['sky', 'moss', 'sand', 'plum'];
// tests/ui/helpers.tsx
export function makeServices(over?: Partial<Services>): Services;   // MemoryStore, FakeAudio, seeded(1), all timings 0
export function renderWithServices(ui: ReactElement, over?: Partial<Services>): RenderResult & { services: Services };
```

- [ ] **Step 1: Write services, speech, tiles, components, and styles**

`src/ui/services.tsx`:
```tsx
import { createContext, useContext } from 'react';
import type { Content } from '../content/types';
import type { Store } from '../store/types';
import type { AudioPlayer } from '../audio/types';
import type { Rng } from '../engine/rng';

export interface Timing {
  demoDelayMs: number;   // pause between taps in a demonstration
  previewMs: number;     // how long a word is shown before "build it" hides it
  pauseMs: number;       // short pause after a correct answer
}
export const DEFAULT_TIMING: Timing = { demoDelayMs: 350, previewMs: 1500, pauseMs: 800 };

export interface Services {
  content: Content;
  store: Store;
  audio: AudioPlayer;
  rng: Rng;
  timing: Timing;
}

export const ServicesContext = createContext<Services | null>(null);

export function useServices(): Services {
  const s = useContext(ServicesContext);
  if (!s) throw new Error('ServicesContext is missing');
  return s;
}

export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
```

`src/ui/speech.tsx`:
```tsx
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useServices } from './services';

interface Speech {
  say: (text: string) => Promise<void>;
  caption: string;
}
const SpeechContext = createContext<Speech | null>(null);

export function SpeechProvider({ children }: { children: ReactNode }) {
  const { audio } = useServices();
  const [caption, setCaption] = useState('');
  const say = useCallback(async (text: string) => {
    setCaption(text);
    await audio.speak(text);
  }, [audio]);
  const value = useMemo(() => ({ say, caption }), [say, caption]);
  return <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>;
}

export function useSay() {
  const ctx = useContext(SpeechContext);
  if (!ctx) throw new Error('SpeechProvider is missing');
  return ctx.say;
}

export function Caption() {
  const ctx = useContext(SpeechContext);
  if (!ctx || !ctx.caption) return null;
  return <p className="caption" aria-live="polite">{ctx.caption}</p>;
}
```

`src/ui/tiles.ts`:
```ts
import type { Card, CardType } from '../content/types';

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

export function cardTypeFor(cards: Card[], grapheme: string): CardType {
  const card = cards.find((c) => c.grapheme === grapheme);
  if (card) return card.type;
  if (VOWELS.has(grapheme)) return 'vowel';
  return 'consonant';
}
```

`src/ui/components/Tile.tsx`:
```tsx
import type { CardType } from '../../content/types';

interface Props {
  grapheme: string;
  type?: CardType;
  size?: 'normal' | 'large';
  selected?: boolean;
  dim?: boolean;
  onClick?: () => void;
  label?: string;
}

export function Tile({ grapheme, type = 'consonant', size = 'normal', selected, dim, onClick, label }: Props) {
  const cls = ['tile', `tile-${type}`, `tile-${size}`, selected ? 'tile-selected' : '', dim ? 'tile-dim' : ''].filter(Boolean).join(' ');
  if (!onClick) return <span className={cls}>{grapheme}</span>;
  return (
    <button type="button" className={cls} onClick={onClick} aria-label={label ?? grapheme}>
      {grapheme}
    </button>
  );
}
```

`src/ui/components/BigButton.tsx`:
```tsx
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'quiet';
  disabled?: boolean;
}

export function BigButton({ children, onClick, variant = 'primary', disabled }: Props) {
  return (
    <button type="button" className={`big big-${variant}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
```

`src/ui/components/HoldButton.tsx`:
```tsx
import { useRef, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onHold: () => void;
  ms?: number;
}

/** Fires onHold after the pointer is held down for `ms`. Lets a parent open the grown-up area without a password. */
export function HoldButton({ children, onHold, ms = 1500 }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = () => {
    cancel();
    timer.current = setTimeout(() => {
      timer.current = null;
      onHold();
    }, ms);
  };
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  return (
    <button
      type="button"
      className="big big-quiet hold"
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
}
```

`src/ui/components/Path.tsx`:
```tsx
import { useServices } from '../services';

export function Path({ current }: { current: string }) {
  const { content } = useServices();
  return (
    <ol className="path" aria-label="Progress path">
      {content.substeps.map((s) => (
        <li key={s.id} className={s.id === current ? 'path-current' : ''} aria-current={s.id === current ? 'step' : undefined}>
          <span className="path-id">{s.id}</span> {s.title}
        </li>
      ))}
    </ol>
  );
}
```

`src/ui/styles.css`:
```css
:root {
  --bg: #f6f1e7;
  --ink: #2b2a26;
  --muted: #6b675e;
  --tile: #ffffff;
  --tile-vowel: #ffe2c4;
  --tile-vowel-ink: #7a3d00;
  --tile-welded: #e4ecf7;
  --accent: #2f6f5e;
  --accent-ink: #ffffff;
  --quiet: #e9e3d6;
  --radius: 18px;
}

* { box-sizing: border-box; }

html, body { margin: 0; background: var(--bg); color: var(--ink); }

body {
  font-family: 'Lexend', 'Atkinson Hyperlegible', system-ui, sans-serif;
  font-size: 22px;
  line-height: 1.6;
  letter-spacing: 0.04em;
  -webkit-text-size-adjust: 100%;
}

.screen {
  min-height: 100vh;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.stage {
  flex: 1;
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  text-align: center;
}

.topbar {
  width: 100%;
  max-width: 900px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--muted);
  font-size: 18px;
}

.caption {
  margin: 0;
  color: var(--muted);
  font-size: 20px;
  max-width: 700px;
}

.bigword {
  font-size: 72px;
  letter-spacing: 0.12em;
  line-height: 1.3;
  margin: 0;
}

.bigtext {
  font-size: 44px;
  letter-spacing: 0.08em;
  line-height: 1.6;
  margin: 0;
  max-width: 800px;
}

.row { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; align-items: center; }

.tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  height: 80px;
  padding: 0 18px;
  border-radius: var(--radius);
  border: 2px solid #d8d1c3;
  background: var(--tile);
  color: var(--ink);
  font: inherit;
  font-size: 40px;
  font-weight: 600;
  letter-spacing: 0.06em;
}
.tile-large { min-width: 160px; height: 160px; font-size: 96px; }
.tile-vowel { background: var(--tile-vowel); color: var(--tile-vowel-ink); }
.tile-welded, .tile-digraph { background: var(--tile-welded); }
.tile-selected { outline: 4px solid var(--accent); outline-offset: 2px; }
.tile-dim { opacity: 0.35; }
button.tile { cursor: pointer; }
button.tile:active { transform: scale(0.97); }

.big {
  min-height: 64px;
  min-width: 64px;
  padding: 12px 28px;
  border-radius: 999px;
  border: none;
  font: inherit;
  font-size: 24px;
  cursor: pointer;
}
.big-primary { background: var(--accent); color: var(--accent-ink); }
.big-quiet { background: var(--quiet); color: var(--ink); }
.big:disabled { opacity: 0.4; cursor: default; }

.dots { display: flex; gap: 28px; justify-content: center; }
.dot {
  width: 64px; height: 64px; border-radius: 50%;
  border: 3px solid var(--accent); background: transparent; cursor: pointer;
}
.dot-lit { background: var(--accent); }

.path { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; font-size: 16px; }
.path li { padding: 6px 12px; border-radius: 999px; background: var(--quiet); color: var(--muted); }
.path .path-current { background: var(--accent); color: var(--accent-ink); }
.path-id { font-weight: 600; }

.profiles { display: flex; flex-direction: column; gap: 16px; width: 100%; max-width: 600px; }
.profile-row { display: flex; gap: 12px; align-items: center; }
.profile-row .big-primary { flex: 1; text-align: left; }
.swatch-sky { border-left: 12px solid #7cb7e6; }
.swatch-moss { border-left: 12px solid #8fbf7f; }
.swatch-sand { border-left: 12px solid #e4c17a; }
.swatch-plum { border-left: 12px solid #b891c9; }

form.card { display: flex; flex-direction: column; gap: 16px; width: 100%; max-width: 600px; }
form.card label { display: flex; flex-direction: column; gap: 6px; font-size: 18px; color: var(--muted); }
form.card input, form.card select { font: inherit; font-size: 22px; padding: 12px; border-radius: 12px; border: 2px solid #d8d1c3; }

.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 100%; max-width: 700px; font-size: 18px; }
.stats dt { color: var(--muted); }
.stats dd { margin: 0; font-size: 24px; }

@media (max-width: 600px) {
  body { font-size: 18px; }
  .bigword { font-size: 52px; }
  .bigtext { font-size: 30px; }
  .tile { min-width: 64px; height: 64px; font-size: 30px; }
  .tile-large { min-width: 120px; height: 120px; font-size: 72px; }
}
```

- [ ] **Step 2: Write the test helpers and the failing Home test**

`tests/ui/helpers.tsx`:
```tsx
import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import { CONTENT } from '../../src/content';
import { MemoryStore } from '../../src/store/memory';
import { FakeAudio } from '../../src/audio/fake';
import { seeded } from '../../src/engine/rng';
import { ServicesContext, type Services } from '../../src/ui/services';
import { SpeechProvider } from '../../src/ui/speech';

export function makeServices(over: Partial<Services> = {}): Services {
  return {
    content: CONTENT,
    store: new MemoryStore(),
    audio: new FakeAudio(),
    rng: seeded(1),
    timing: { demoDelayMs: 0, previewMs: 0, pauseMs: 0 },
    ...over,
  };
}

export function renderWithServices(ui: ReactElement, over: Partial<Services> = {}): RenderResult & { services: Services } {
  const services = makeServices(over);
  const utils = render(
    <ServicesContext.Provider value={services}>
      <SpeechProvider>{ui}</SpeechProvider>
    </ServicesContext.Provider>,
  );
  return { ...utils, services };
}
```

`tests/ui/home.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Home } from '../../src/ui/screens/Home';
import { MemoryStore } from '../../src/store/memory';
import { initialState } from '../../src/engine/types';
import { renderWithServices } from './helpers';

describe('Home', () => {
  it('creates a profile with a starting point and starts a session', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    const onStart = vi.fn();
    renderWithServices(<Home onStart={onStart} onParent={vi.fn()} />, { store });

    await user.click(await screen.findByRole('button', { name: /add a child/i }));
    await user.type(screen.getByLabelText(/name/i), 'Sam');
    await user.selectOptions(screen.getByLabelText(/start/i), '1.1');
    await user.click(screen.getByRole('button', { name: /save/i }));

    const saved = await store.listProfiles();
    expect(saved.length).toBe(1);
    expect(saved[0].name).toBe('Sam');
    expect(saved[0].state.currentSubstep).toBe('1.1');
    expect(saved[0].state.lessonPending).toBe(true);

    await user.click(await screen.findByRole('button', { name: /^Sam$/ }));
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ name: 'Sam' }));
  });

  it('opens the grown-up area only after a long press', async () => {
    const store = new MemoryStore();
    await store.saveProfile({ id: 'p1', name: 'Sam', color: 'sky', createdAt: 'd', state: initialState('1.1') });
    const onParent = vi.fn();
    renderWithServices(<Home onStart={vi.fn()} onParent={onParent} />, { store });
    const btn = await screen.findByRole('button', { name: /grown-ups/i });
    vi.useFakeTimers();
    try {
      fireEvent.pointerDown(btn);
      act(() => { vi.advanceTimersByTime(500); });
      fireEvent.pointerUp(btn);
      act(() => { vi.advanceTimersByTime(2000); });
      expect(onParent).not.toHaveBeenCalled();
      fireEvent.pointerDown(btn);
      act(() => { vi.advanceTimersByTime(1600); });
      expect(onParent).toHaveBeenCalledWith(expect.objectContaining({ id: 'p1' }));
    } finally {
      vi.useRealTimers();
    }
  });
});
```

- [ ] **Step 3: Run to see it fail**

Run: `npx vitest run tests/ui/home.test.tsx`
Expected: FAIL, cannot find module `../../src/ui/screens/Home`.

- [ ] **Step 4: Write the Home screen**

`src/ui/screens/Home.tsx`:
```tsx
import { useEffect, useState, type FormEvent } from 'react';
import type { Profile } from '../../store/types';
import { initialState } from '../../engine/types';
import { useServices } from '../services';
import { BigButton } from '../components/BigButton';
import { HoldButton } from '../components/HoldButton';

export const COLORS = ['sky', 'moss', 'sand', 'plum'];

const newId = () => globalThis.crypto?.randomUUID?.() ?? `p-${Date.now()}-${Math.random().toString(36).slice(2)}`;

interface Props {
  onStart: (p: Profile) => void;
  onParent: (p: Profile) => void;
}

export function Home({ onStart, onParent }: Props) {
  const { store, content } = useServices();
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [start, setStart] = useState(content.substeps[0].id);

  useEffect(() => {
    store.listProfiles().then(setProfiles);
  }, [store]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const p: Profile = { id: newId(), name: name.trim(), color, createdAt: new Date().toISOString(), state: initialState(start) };
    await store.saveProfile(p);
    setProfiles(await store.listProfiles());
    setName('');
    setAdding(false);
  };

  const examples = (id: string) => content.substeps.find((s) => s.id === id)!.words.filter((w) => w.kind === 'real').slice(0, 3).map((w) => w.text).join(', ');

  return (
    <div className="screen">
      <div className="stage">
        <h1>Tapwords</h1>
        {profiles === null && <p className="caption">Loading…</p>}
        {profiles !== null && !adding && (
          <div className="profiles">
            {profiles.length === 0 && <p className="caption">Add a child to get started.</p>}
            {profiles.map((p) => (
              <div className="profile-row" key={p.id}>
                <button type="button" className={`big big-primary swatch-${p.color}`} onClick={() => onStart(p)}>
                  {p.name}
                </button>
                <HoldButton onHold={() => onParent(p)}>Grown-ups (hold)</HoldButton>
              </div>
            ))}
            <BigButton variant="quiet" onClick={() => setAdding(true)}>Add a child</BigButton>
          </div>
        )}
        {adding && (
          <form className="card" onSubmit={save}>
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </label>
            <label>
              Color
              <select value={color} onChange={(e) => setColor(e.target.value)}>
                {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label>
              Start at
              <select value={start} onChange={(e) => setStart(e.target.value)}>
                {content.substeps.map((s) => (
                  <option key={s.id} value={s.id}>{s.id} {s.title} (for example: {examples(s.id)})</option>
                ))}
              </select>
            </label>
            <p className="caption">Not sure where to start? Ask the tutor, or pick the first one. You can change this later in the grown-up area.</p>
            <div className="row">
              <button type="submit" className="big big-primary">Save</button>
              <BigButton variant="quiet" onClick={() => setAdding(false)}>Cancel</BigButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Wire App and main**

`src/App.tsx`:
```tsx
import { useState } from 'react';
import type { Profile } from './store/types';
import { Home } from './ui/screens/Home';
import { SpeechProvider } from './ui/speech';

type Screen = { name: 'home' } | { name: 'session'; profile: Profile } | { name: 'parent'; profile: Profile };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const home = () => setScreen({ name: 'home' });
  return (
    <SpeechProvider>
      {screen.name === 'home' && <Home onStart={(profile) => setScreen({ name: 'session', profile })} onParent={(profile) => setScreen({ name: 'parent', profile })} />}
      {screen.name === 'session' && <div className="screen"><p>Session coming soon.</p><button className="big big-quiet" onClick={home}>Back</button></div>}
      {screen.name === 'parent' && <div className="screen"><p>Grown-up area coming soon.</p><button className="big big-quiet" onClick={home}>Back</button></div>}
    </SpeechProvider>
  );
}
```

`src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/lexend/400.css';
import '@fontsource/lexend/600.css';
import './ui/styles.css';
import App from './App';
import { CONTENT } from './content';
import { IdbStore } from './store/idb';
import { BrowserAudio } from './audio/browser';
import { DEFAULT_TIMING, ServicesContext, type Services } from './ui/services';

const store = new IdbStore();
const services: Services = {
  content: CONTENT,
  store,
  audio: new BrowserAudio(CONTENT.cards, store),
  rng: Math.random,
  timing: DEFAULT_TIMING,
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ServicesContext.Provider value={services}>
      <App />
    </ServicesContext.Provider>
  </React.StrictMode>,
);
```

- [ ] **Step 6: Run tests, type check, and a production build**

Run: `npm test && npm run typecheck && npm run build`
Expected: all PASS; `dist/` is produced.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add the app shell, shared components, styles and the home screen with profiles

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: Tapping dots and the miss review

**Files:**
- Create: `src/ui/components/TapDots.tsx`, `src/ui/components/MissReview.tsx`
- Test: `tests/ui/tapdots.test.tsx`

**Interfaces:**
- Consumes: `Word`, `useServices` (audio, content, timing), `useSay`, `Tile`, `cardTypeFor`, `BigButton`, `wait`.
- Produces:
```ts
export function TapDots(props: { word: Word; mode: 'demo' | 'try'; onResult: (correct: boolean) => void });
// Dots are buttons labelled "Sound 1", "Sound 2", ...; the blend control is a button labelled "Blend".
export function MissReview(props: { word: Word; onDone: () => void });
// Says "Let's look at that one.", demonstrates, lets the child try once (unscored), then calls onDone.
```

- [ ] **Step 1: Write the failing tests**

`tests/ui/tapdots.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TapDots } from '../../src/ui/components/TapDots';
import { MissReview } from '../../src/ui/components/MissReview';
import { cvc } from '../../src/content/build';
import { FakeAudio } from '../../src/audio/fake';
import { renderWithServices } from './helpers';

describe('TapDots', () => {
  it('in try mode, tapping dots in order then blending reports correct', async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();
    const audio = new FakeAudio();
    renderWithServices(<TapDots word={cvc('map')} mode="try" onResult={onResult} />, { audio });
    expect(screen.queryByRole('button', { name: 'Blend' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Sound 1' }));
    await user.click(screen.getByRole('button', { name: 'Sound 2' }));
    await user.click(screen.getByRole('button', { name: 'Sound 3' }));
    expect(audio.played).toEqual(['m', 'a', 'p']);
    await user.click(await screen.findByRole('button', { name: 'Blend' }));
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true));
    expect(audio.spoken).toContain('map');
  });

  it('in try mode, tapping out of order reports a miss', async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();
    renderWithServices(<TapDots word={cvc('map')} mode="try" onResult={onResult} />);
    await user.click(screen.getByRole('button', { name: 'Sound 2' }));
    await user.click(screen.getByRole('button', { name: 'Sound 1' }));
    await user.click(screen.getByRole('button', { name: 'Sound 3' }));
    await user.click(await screen.findByRole('button', { name: 'Blend' }));
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(false));
  });

  it('in demo mode, plays each sound then the word and reports done', async () => {
    const onResult = vi.fn();
    const audio = new FakeAudio();
    renderWithServices(<TapDots word={cvc('sit')} mode="demo" onResult={onResult} />, { audio });
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true));
    expect(audio.played).toEqual(['s', 'i', 't']);
    expect(audio.spoken).toContain('sit');
  });
});

describe('MissReview', () => {
  it('explains, demonstrates, lets the child try, then finishes', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    const audio = new FakeAudio();
    renderWithServices(<MissReview word={cvc('log')} onDone={onDone} />, { audio });
    expect(await screen.findByText(/let's look at that one/i)).toBeInTheDocument();
    // demo runs by itself, then the try appears
    await user.click(await screen.findByRole('button', { name: 'Sound 1' }));
    await user.click(screen.getByRole('button', { name: 'Sound 2' }));
    await user.click(screen.getByRole('button', { name: 'Sound 3' }));
    await user.click(await screen.findByRole('button', { name: 'Blend' }));
    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(audio.played.slice(0, 3)).toEqual(['l', 'o', 'g']);
  });
});
```

- [ ] **Step 2: Run to see it fail, then implement**

`src/ui/components/TapDots.tsx`:
```tsx
import { useEffect, useRef, useState } from 'react';
import type { Word } from '../../content/types';
import { useServices, wait } from '../services';
import { cardTypeFor } from '../tiles';
import { Tile } from './Tile';
import { BigButton } from './BigButton';

interface Props {
  word: Word;
  mode: 'demo' | 'try';
  onResult: (correct: boolean) => void;
}

export function TapDots({ word, mode, onResult }: Props) {
  const { audio, content, timing } = useServices();
  const [tapped, setTapped] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [blending, setBlending] = useState(false);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    setTapped(0);
    setWrong(false);
    setBlending(false);
    if (mode !== 'demo') return;
    let cancelled = false;
    (async () => {
      for (let i = 0; i < word.parts.length; i++) {
        if (cancelled) return;
        setTapped(i + 1);
        await audio.playCard(word.parts[i].card);
        await wait(timing.demoDelayMs);
      }
      if (cancelled) return;
      setBlending(true);
      await audio.speak(word.text);
      if (!cancelled) onResultRef.current(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [word, mode, audio, timing.demoDelayMs]);

  const tapDot = async (i: number) => {
    if (mode !== 'try' || tapped >= word.parts.length) return;
    if (i !== tapped) setWrong(true);
    setTapped(tapped + 1);
    await audio.playCard(word.parts[i].card);
  };

  const blend = async () => {
    if (blending) return;
    setBlending(true);
    await audio.speak(word.text);
    onResultRef.current(!wrong);
  };

  const done = tapped >= word.parts.length;
  return (
    <div className="tapdots">
      <div className="row">
        {word.parts.map((p, i) => (
          <Tile key={i} grapheme={p.grapheme} type={cardTypeFor(content.cards, p.grapheme)} selected={i < tapped} />
        ))}
      </div>
      <div className="dots">
        {word.parts.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`dot ${i < tapped ? 'dot-lit' : ''}`}
            aria-label={`Sound ${i + 1}`}
            onClick={() => tapDot(i)}
            disabled={mode === 'demo'}
          />
        ))}
      </div>
      {mode === 'try' && done && !blending && <BigButton onClick={blend}>Blend</BigButton>}
      {blending && <p className="bigword">{word.text}</p>}
    </div>
  );
}
```

`src/ui/components/MissReview.tsx`:
```tsx
import { useEffect, useState } from 'react';
import type { Word } from '../../content/types';
import { useSay } from '../speech';
import { TapDots } from './TapDots';

interface Props {
  word: Word;
  onDone: () => void;
}

export function MissReview({ word, onDone }: Props) {
  const say = useSay();
  const [phase, setPhase] = useState<'intro' | 'demo' | 'try'>('intro');

  useEffect(() => {
    let cancelled = false;
    say("Let's look at that one.").then(() => {
      if (!cancelled) setPhase('demo');
    });
    return () => {
      cancelled = true;
    };
  }, [say, word]);

  return (
    <div className="stage">
      <p className="caption">Let's look at that one.</p>
      {phase === 'demo' && <TapDots word={word} mode="demo" onResult={() => setPhase('try')} />}
      {phase === 'try' && <TapDots word={word} mode="try" onResult={() => onDone()} />}
    </div>
  );
}
```

- [ ] **Step 3: Run tests, type check, commit**

Run: `npm test && npm run typecheck`
Expected: PASS. If the demo test times out, check that `timing.demoDelayMs` is 0 in `makeServices` and that the effect is not re-running because `word` is a new object each render (the tests create the word once inline, which is a single render, so it is stable).

```bash
git add -A
git commit -m "Add finger-tapping dots with demo and try modes, and the miss review flow

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 11: Session part 1: sound cards

**Files:**
- Create: `src/ui/session/SoundCardsPart.tsx`
- Test: `tests/ui/soundcards.test.tsx`

**Interfaces:**
- Consumes: `ReverseItem` (Task 5), `ScoredResponse`, `cardKey`, `getCard`, `Tile`, `BigButton`, `useSay`, `Caption`, `useServices`.
- Produces: `SoundCardsPart(props: { forwardCards: string[]; reverseItems: ReverseItem[]; onComplete: (responses: ScoredResponse[]) => void })`.
- UI contract used by later tests: forward drill has buttons "Hear it", "That's it", "Not sure"; reverse drill shows three tile buttons labelled by grapheme plus "Hear it again"; after a miss a "Next" button appears.

- [ ] **Step 1: Write the failing test**

`tests/ui/soundcards.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SoundCardsPart } from '../../src/ui/session/SoundCardsPart';
import { FakeAudio } from '../../src/audio/fake';
import { renderWithServices } from './helpers';

const reverse = [
  { target: 'm', choices: ['m', 'a', 'p'], isReview: false },
  { target: 'a', choices: ['p', 'a', 'm'], isReview: true },
];

describe('SoundCardsPart', () => {
  it('walks the forward drill then scores the reverse drill', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const audio = new FakeAudio();
    renderWithServices(<SoundCardsPart forwardCards={['m', 'a']} reverseItems={reverse} onComplete={onComplete} />, { audio });

    await user.click(await screen.findByRole('button', { name: /hear it$/i }));
    expect(audio.played).toContain('m');
    await user.click(screen.getByRole('button', { name: /that's it/i }));
    await user.click(screen.getByRole('button', { name: /not sure/i }));

    // reverse item 1: correct
    await waitFor(() => expect(audio.played.at(-1)).toBe('m'));
    await user.click(screen.getByRole('button', { name: 'm' }));
    // reverse item 2: wrong, then Next
    await waitFor(() => expect(audio.played.at(-1)).toBe('a'));
    await user.click(screen.getByRole('button', { name: 'p' }));
    await user.click(await screen.findByRole('button', { name: /next/i }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    const rs = onComplete.mock.calls[0][0];
    expect(rs).toEqual([
      { itemKey: 'card:m', activity: 'sound-reverse', correct: true, isReview: false, parentMarked: false },
      { itemKey: 'card:a', activity: 'sound-reverse', correct: false, isReview: true, parentMarked: false },
    ]);
  });

  it('completes immediately with nothing to do', async () => {
    const onComplete = vi.fn();
    renderWithServices(<SoundCardsPart forwardCards={[]} reverseItems={[]} onComplete={onComplete} />);
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith([]));
  });
});
```

- [ ] **Step 2: Run to see it fail, then implement**

`src/ui/session/SoundCardsPart.tsx`:
```tsx
import { useEffect, useRef, useState } from 'react';
import type { ReverseItem } from '../../engine/session';
import { cardKey, type ScoredResponse } from '../../engine/types';
import { getCard } from '../../engine/availability';
import { useServices } from '../services';
import { Caption, useSay } from '../speech';
import { Tile } from '../components/Tile';
import { BigButton } from '../components/BigButton';

interface Props {
  forwardCards: string[];
  reverseItems: ReverseItem[];
  onComplete: (responses: ScoredResponse[]) => void;
}

export function SoundCardsPart({ forwardCards, reverseItems, onComplete }: Props) {
  const { audio, content } = useServices();
  const say = useSay();
  const [phase, setPhase] = useState<'forward' | 'reverse'>(forwardCards.length > 0 ? 'forward' : 'reverse');
  const [i, setI] = useState(0);
  const [responses, setResponses] = useState<ScoredResponse[]>([]);
  const [missed, setMissed] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const item = phase === 'reverse' ? reverseItems[i] : undefined;

  useEffect(() => {
    if (phase === 'forward' && i === 0) say('Say the sound for each card. Tap "Hear it" to check.');
  }, [phase, i, say]);

  useEffect(() => {
    if (phase !== 'reverse') return;
    if (!item) {
      onCompleteRef.current(responses);
      return;
    }
    let cancelled = false;
    (async () => {
      await say('Which card makes this sound?');
      if (!cancelled) await audio.playCard(item.target);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, i]);

  const nextForward = () => {
    if (i + 1 < forwardCards.length) setI(i + 1);
    else {
      setPhase('reverse');
      setI(0);
    }
  };

  const nextReverse = (rs: ScoredResponse[]) => {
    setMissed(false);
    if (i + 1 < reverseItems.length) setI(i + 1);
    else onCompleteRef.current(rs);
  };

  const answer = async (choice: string) => {
    if (!item || missed) return;
    const correct = choice === item.target;
    const rs = [...responses, { itemKey: cardKey(item.target), activity: 'sound-reverse' as const, correct, isReview: item.isReview, parentMarked: false }];
    setResponses(rs);
    if (correct) nextReverse(rs);
    else {
      setMissed(true);
      await audio.playCard(item.target);
    }
  };

  if (phase === 'forward') {
    const card = getCard(content, forwardCards[i]);
    return (
      <div className="stage" data-part="sound-forward">
        <Caption />
        <Tile grapheme={card.grapheme} type={card.type} size="large" />
        <p className="caption">as in {card.keyword}</p>
        <div className="row">
          <BigButton variant="quiet" onClick={() => audio.playCard(card.id)}>Hear it</BigButton>
          <BigButton onClick={nextForward}>That's it</BigButton>
          <BigButton variant="quiet" onClick={nextForward}>Not sure</BigButton>
        </div>
      </div>
    );
  }

  if (!item) return null;
  return (
    <div className="stage" data-part="sound-reverse">
      <Caption />
      <div className="row">
        {item.choices.map((c) => {
          const card = getCard(content, c);
          return <Tile key={c} grapheme={card.grapheme} type={card.type} size="large" selected={missed && c === item.target} dim={missed && c !== item.target} onClick={() => answer(c)} />;
        })}
      </div>
      <div className="row">
        <BigButton variant="quiet" onClick={() => audio.playCard(item.target)}>Hear it again</BigButton>
        {missed && <BigButton onClick={() => nextReverse(responses)}>Next</BigButton>}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run tests, type check, commit**

Run: `npm test && npm run typecheck`
Expected: PASS.

```bash
git add -A
git commit -m "Add the sound card drill: forward self-check and scored reverse drill

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 12: Session part 2: the mini-lesson

**Files:**
- Create: `src/ui/session/LessonPart.tsx`
- Test: `tests/ui/lesson.test.tsx`

**Interfaces:**
- Consumes: `LessonStep`, `Substep`, `findWord`, `TapDots`, `Tile`, `cardTypeFor`, `BigButton`, `useSay`, `Caption`.
- Produces: `LessonPart(props: { steps: LessonStep[]; substep: Substep; onComplete: () => void })`. Says/shows steps have a "Next" button; tap steps show "Next" after the demonstration; try steps advance by themselves after the blend.

- [ ] **Step 1: Write the failing test**

`tests/ui/lesson.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LessonPart } from '../../src/ui/session/LessonPart';
import { CONTENT } from '../../src/content';
import { FakeAudio } from '../../src/audio/fake';
import { renderWithServices } from './helpers';

describe('LessonPart', () => {
  it('runs say, show, tap and try steps then completes', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const audio = new FakeAudio();
    const steps = [{ say: 'Hello there.' }, { show: ['m', 'a', 'p'] }, { tap: 'map' }, { try: 'sit' }];
    renderWithServices(<LessonPart steps={steps} substep={CONTENT.substeps[0]} onComplete={onComplete} />, { audio });

    await waitFor(() => expect(audio.spoken).toContain('Hello there.'));
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('m')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /next/i }));
    // tap demo runs by itself, then Next appears
    await user.click(await screen.findByRole('button', { name: /next/i }));
    expect(audio.played).toEqual(['m', 'a', 'p']);
    await user.click(await screen.findByRole('button', { name: 'Sound 1' }));
    await user.click(screen.getByRole('button', { name: 'Sound 2' }));
    await user.click(screen.getByRole('button', { name: 'Sound 3' }));
    await user.click(await screen.findByRole('button', { name: 'Blend' }));
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
  });

  it('completes immediately with no steps', async () => {
    const onComplete = vi.fn();
    renderWithServices(<LessonPart steps={[]} substep={CONTENT.substeps[0]} onComplete={onComplete} />);
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
  });
});
```

- [ ] **Step 2: Run to see it fail, then implement**

`src/ui/session/LessonPart.tsx`:
```tsx
import { useEffect, useRef, useState } from 'react';
import type { LessonStep, Substep } from '../../content/types';
import { findWord } from '../../engine/availability';
import { useServices } from '../services';
import { Caption, useSay } from '../speech';
import { cardTypeFor } from '../tiles';
import { Tile } from '../components/Tile';
import { BigButton } from '../components/BigButton';
import { TapDots } from '../components/TapDots';

interface Props {
  steps: LessonStep[];
  substep: Substep;
  onComplete: () => void;
}

export function LessonPart({ steps, substep, onComplete }: Props) {
  const { content } = useServices();
  const say = useSay();
  const [i, setI] = useState(0);
  const [demoDone, setDemoDone] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const step = steps[i];

  useEffect(() => {
    setDemoDone(false);
    if (!step) {
      onCompleteRef.current();
      return;
    }
    if ('say' in step) say(step.say);
    if ('try' in step) say('Your turn. Tap each sound, then blend.');
  }, [i, step, say]);

  const next = () => setI(i + 1);

  if (!step) return null;
  return (
    <div className="stage" data-part="lesson">
      <Caption />
      {'say' in step && <BigButton onClick={next}>Next</BigButton>}
      {'show' in step && (
        <>
          <div className="row">
            {step.show.map((g, k) => <Tile key={k} grapheme={g} type={cardTypeFor(content.cards, g)} size="large" />)}
          </div>
          <BigButton onClick={next}>Next</BigButton>
        </>
      )}
      {'tap' in step && (
        <>
          <TapDots word={findWord(substep, step.tap)} mode="demo" onResult={() => setDemoDone(true)} />
          {demoDone && <BigButton onClick={next}>Next</BigButton>}
        </>
      )}
      {'try' in step && <TapDots word={findWord(substep, step.try)} mode="try" onResult={next} />}
    </div>
  );
}
```

- [ ] **Step 3: Run tests, type check, commit**

Run: `npm test && npm run typecheck`
Expected: PASS.

```bash
git add -A
git commit -m "Add the spoken mini-lesson with tile displays and tapping demonstrations

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 13: Tile builder and session part 3: word work

**Files:**
- Create: `src/ui/components/TileBuilder.tsx`, `src/ui/session/WordWorkPart.tsx`
- Test: `tests/ui/wordwork.test.tsx`

**Interfaces:**
- Consumes: `WordWorkItem`, `wordKey`, `TapDots`, `MissReview`, `Tile`, `BigButton`, `cardTypeFor`, `useSay`, `Caption`, `useServices`, `wait`.
- Produces:
```ts
// A tray of pieces the child taps in order into an answer row; tapping an answer piece removes it.
// data-testid="tray" and data-testid="answer" wrap the two rows; pieces are buttons labelled by their text.
export function TileBuilder(props: { tray: string[]; expected: string[]; kind?: 'tile' | 'chip'; onDone: (correct: boolean) => void });
export function WordWorkPart(props: { items: WordWorkItem[]; onComplete: (responses: ScoredResponse[]) => void });
```

- [ ] **Step 1: Write the failing test**

`tests/ui/wordwork.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WordWorkPart } from '../../src/ui/session/WordWorkPart';
import type { WordWorkItem } from '../../src/engine/session';
import { cvc } from '../../src/content/build';
import { FakeAudio } from '../../src/audio/fake';
import { renderWithServices } from './helpers';

const items: WordWorkItem[] = [
  { type: 'tap', word: cvc('map'), substep: '1.1', isReview: false },
  { type: 'find', word: cvc('sat'), substep: '1.1', isReview: true, choices: ['sad', 'sat', 'sap'] },
  { type: 'build', word: cvc('log'), substep: '1.1', isReview: false },
];

async function tapOut(user: ReturnType<typeof userEvent.setup>, n: number) {
  for (let k = 1; k <= n; k++) await user.click(await screen.findByRole('button', { name: `Sound ${k}` }));
  await user.click(await screen.findByRole('button', { name: 'Blend' }));
}

describe('WordWorkPart', () => {
  it('scores tap, find and build items and reviews a miss', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const audio = new FakeAudio();
    renderWithServices(<WordWorkPart items={items} onComplete={onComplete} />, { audio });

    // 1. tap "map" correctly
    await tapOut(user, 3);

    // 2. find "sat": choose wrong, then work through the miss review
    await waitFor(() => expect(audio.spoken).toContain('sat'));
    await user.click(screen.getByRole('button', { name: 'sad' }));
    expect(await screen.findByText(/let's look at that one/i)).toBeInTheDocument();
    await tapOut(user, 3);

    // 3. build "log": tap l, o, g from the tray then Done
    const tray = await screen.findByTestId('tray');
    for (const g of ['l', 'o', 'g']) await user.click(within(tray).getByRole('button', { name: g }));
    await user.click(screen.getByRole('button', { name: /done/i }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toEqual([
      { itemKey: 'word:1.1:map', activity: 'tap', correct: true, isReview: false, parentMarked: false },
      { itemKey: 'word:1.1:sat', activity: 'find', correct: false, isReview: true, parentMarked: false },
      { itemKey: 'word:1.1:log', activity: 'build', correct: true, isReview: false, parentMarked: false },
    ]);
  });

  it('lets the child remove a tile from the answer row', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderWithServices(<WordWorkPart items={[items[2]]} onComplete={onComplete} />);
    const tray = await screen.findByTestId('tray');
    await user.click(within(tray).getByRole('button', { name: 'o' }));
    await user.click(within(screen.getByTestId('answer')).getByRole('button', { name: /remove o/i }));
    for (const g of ['l', 'o', 'g']) await user.click(within(tray).getByRole('button', { name: g }));
    await user.click(screen.getByRole('button', { name: /done/i }));
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(onComplete.mock.calls[0][0][0].correct).toBe(true);
  });
});
```

- [ ] **Step 2: Run to see it fail, then implement**

`src/ui/components/TileBuilder.tsx`:
```tsx
import { useState } from 'react';
import { useServices } from '../services';
import { cardTypeFor } from '../tiles';
import { Tile } from './Tile';
import { BigButton } from './BigButton';

interface Props {
  tray: string[];
  expected: string[];
  kind?: 'tile' | 'chip';
  onDone: (correct: boolean) => void;
}

export function TileBuilder({ tray, expected, kind = 'tile', onDone }: Props) {
  const { content } = useServices();
  const [used, setUsed] = useState<number[]>([]);
  const joiner = kind === 'tile' ? '' : ' ';

  const pick = (idx: number) => {
    if (used.includes(idx) || used.length >= expected.length) return;
    setUsed([...used, idx]);
  };
  const unpick = (pos: number) => setUsed(used.filter((_, k) => k !== pos));
  const finish = () => onDone(used.map((k) => tray[k]).join(joiner) === expected.join(joiner));

  const piece = (text: string, props: { onClick: () => void; dim?: boolean; label?: string }) =>
    kind === 'tile' ? (
      <Tile grapheme={text} type={cardTypeFor(content.cards, text)} onClick={props.onClick} dim={props.dim} label={props.label} />
    ) : (
      <button type="button" className={`big big-quiet ${props.dim ? 'tile-dim' : ''}`} onClick={props.onClick} aria-label={props.label ?? text}>{text}</button>
    );

  return (
    <div className="builder">
      <div className="row" data-testid="answer">
        {used.length === 0 && <span className="caption">Tap the pieces in order</span>}
        {used.map((k, pos) => <span key={pos}>{piece(tray[k], { onClick: () => unpick(pos), label: `Remove ${tray[k]}` })}</span>)}
      </div>
      <div className="row" data-testid="tray">
        {tray.map((t, idx) => <span key={idx}>{piece(t, { onClick: () => pick(idx), dim: used.includes(idx) })}</span>)}
      </div>
      <BigButton onClick={finish} disabled={used.length !== expected.length}>Done</BigButton>
    </div>
  );
}
```

`src/ui/session/WordWorkPart.tsx`:
```tsx
import { useEffect, useRef, useState } from 'react';
import type { WordWorkItem } from '../../engine/session';
import { wordKey, type ScoredResponse } from '../../engine/types';
import { useServices, wait } from '../services';
import { Caption, useSay } from '../speech';
import { cardTypeFor } from '../tiles';
import { Tile } from '../components/Tile';
import { BigButton } from '../components/BigButton';
import { TapDots } from '../components/TapDots';
import { TileBuilder } from '../components/TileBuilder';
import { MissReview } from '../components/MissReview';

interface Props {
  items: WordWorkItem[];
  onComplete: (responses: ScoredResponse[]) => void;
}

export function WordWorkPart({ items, onComplete }: Props) {
  const { audio, content, timing } = useServices();
  const say = useSay();
  const [i, setI] = useState(0);
  const [responses, setResponses] = useState<ScoredResponse[]>([]);
  const [miss, setMiss] = useState(false);
  const [preview, setPreview] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const item = items[i];

  useEffect(() => {
    if (!item) {
      onCompleteRef.current(responses);
      return;
    }
    let cancelled = false;
    (async () => {
      if (item.type === 'tap') await say('Tap it out, then blend.');
      if (item.type === 'find') {
        await say('Find the word.');
        if (!cancelled) await audio.speak(item.word.text);
      }
      if (item.type === 'build') {
        setPreview(true);
        await say('Look, then build the word.');
        if (!cancelled) await audio.speak(item.word.text);
        await wait(timing.previewMs);
        if (!cancelled) setPreview(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const record = (correct: boolean) => {
    if (!item) return;
    const rs = [...responses, { itemKey: wordKey(item.substep, item.word.text), activity: item.type, correct, isReview: item.isReview, parentMarked: false }];
    setResponses(rs);
    if (correct) advance(rs);
    else setMiss(true);
  };

  const advance = (rs: ScoredResponse[]) => {
    setMiss(false);
    if (i + 1 < items.length) setI(i + 1);
    else onCompleteRef.current(rs);
  };

  if (!item) return null;
  if (miss) return <MissReview word={item.word} onDone={() => advance(responses)} />;

  return (
    <div className="stage" data-part="word-work">
      <Caption />
      {item.type === 'tap' && <TapDots word={item.word} mode="try" onResult={record} />}
      {item.type === 'find' && (
        <>
          <div className="row">
            {item.choices.map((c) => <BigButton key={c} variant="quiet" onClick={() => record(c === item.word.text)}>{c}</BigButton>)}
          </div>
          <BigButton variant="quiet" onClick={() => audio.speak(item.word.text)}>Hear it again</BigButton>
        </>
      )}
      {item.type === 'build' && preview && (
        <div className="row">
          {item.word.parts.map((p, k) => <Tile key={k} grapheme={p.grapheme} type={cardTypeFor(content.cards, p.grapheme)} size="large" />)}
        </div>
      )}
      {item.type === 'build' && !preview && (
        <>
          <TileBuilder tray={buildTray(item.word.parts.map((p) => p.grapheme), content.cards.map((c) => c.grapheme), i)} expected={item.word.parts.map((p) => p.grapheme)} onDone={record} />
          <BigButton variant="quiet" onClick={() => audio.speak(item.word.text)}>Hear it again</BigButton>
        </>
      )}
    </div>
  );
}

/** Word graphemes plus two distractors, in a fixed order derived from the item index (no randomness in the UI). */
function buildTray(graphemes: string[], allGraphemes: string[], seed: number): string[] {
  const extras = allGraphemes.filter((g) => !graphemes.includes(g) && g.length === 1);
  const d1 = extras[seed % extras.length];
  const d2 = extras[(seed + 7) % extras.length];
  const tray = [...graphemes, d1, d2 === d1 ? extras[(seed + 3) % extras.length] : d2];
  // rotate so the answer is not simply the first tiles
  const r = (seed + 2) % tray.length;
  return [...tray.slice(r), ...tray.slice(0, r)];
}
```

- [ ] **Step 3: Run tests, type check, commit**

Run: `npm test && npm run typecheck`
Expected: PASS.

```bash
git add -A
git commit -m "Add word work: tap it out, hear-and-find, and build-from-tiles with miss review

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 14: Session part 4: spelling

**Files:**
- Create: `src/ui/session/SpellingPart.tsx`
- Test: `tests/ui/spelling.test.tsx`

**Interfaces:**
- Consumes: `SpellingItem`, `cardKey`, `wordKey`, `sentenceKey`, `getCard`, `Tile`, `TileBuilder`, `MissReview`, `BigButton`, `useSay`, `Caption`, `useServices`.
- Produces: `SpellingPart(props: { items: SpellingItem[]; onComplete: (responses: ScoredResponse[]) => void })`.

- [ ] **Step 1: Write the failing test**

`tests/ui/spelling.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpellingPart } from '../../src/ui/session/SpellingPart';
import type { SpellingItem } from '../../src/engine/session';
import { cvc } from '../../src/content/build';
import { FakeAudio } from '../../src/audio/fake';
import { renderWithServices } from './helpers';

const items: SpellingItem[] = [
  { type: 'sound', card: 'm', choices: ['a', 'm', 'p', 's'], isReview: false },
  { type: 'word', word: cvc('sit'), substep: '1.1', tray: ['t', 's', 'a', 'i', 'm'], isReview: true },
  { type: 'sentence', text: 'The rat sat.', substep: '1.1', words: ['sat.', 'The', 'rat'] },
];

describe('SpellingPart', () => {
  it('scores a sound, a word and a sentence, with feedback on misses', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const audio = new FakeAudio();
    renderWithServices(<SpellingPart items={items} onComplete={onComplete} />, { audio });

    // sound: wrong then Next
    await waitFor(() => expect(audio.played).toContain('m'));
    await user.click(screen.getByRole('button', { name: 's' }));
    await user.click(await screen.findByRole('button', { name: /next/i }));

    // word: correct
    await waitFor(() => expect(audio.spoken).toContain('sit'));
    const tray = screen.getByTestId('tray');
    for (const g of ['s', 'i', 't']) await user.click(within(tray).getByRole('button', { name: g }));
    await user.click(screen.getByRole('button', { name: /done/i }));

    // sentence: wrong order then Next
    await waitFor(() => expect(audio.spoken).toContain('The rat sat.'));
    const tray2 = screen.getByTestId('tray');
    for (const w of ['rat', 'The', 'sat.']) await user.click(within(tray2).getByRole('button', { name: w }));
    await user.click(screen.getByRole('button', { name: /done/i }));
    expect(await screen.findByText('The rat sat.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toEqual([
      { itemKey: 'card:m', activity: 'spell-sound', correct: false, isReview: false, parentMarked: false },
      { itemKey: 'word:1.1:sit', activity: 'spell-word', correct: true, isReview: true, parentMarked: false },
      { itemKey: 'sentence:1.1:The rat sat.', activity: 'spell-sentence', correct: false, isReview: false, parentMarked: false },
    ]);
  });

  it('runs the miss review after a misspelled word', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderWithServices(<SpellingPart items={[items[1]]} onComplete={onComplete} />);
    const tray = await screen.findByTestId('tray');
    for (const g of ['s', 'a', 't']) await user.click(within(tray).getByRole('button', { name: g }));
    await user.click(screen.getByRole('button', { name: /done/i }));
    expect(await screen.findByText(/let's look at that one/i)).toBeInTheDocument();
    for (let k = 1; k <= 3; k++) await user.click(await screen.findByRole('button', { name: `Sound ${k}` }));
    await user.click(await screen.findByRole('button', { name: 'Blend' }));
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(onComplete.mock.calls[0][0][0].correct).toBe(false);
  });
});
```

- [ ] **Step 2: Run to see it fail, then implement**

`src/ui/session/SpellingPart.tsx`:
```tsx
import { useEffect, useRef, useState } from 'react';
import type { SpellingItem } from '../../engine/session';
import { cardKey, sentenceKey, wordKey, type ScoredResponse } from '../../engine/types';
import { getCard } from '../../engine/availability';
import { useServices } from '../services';
import { Caption, useSay } from '../speech';
import { Tile } from '../components/Tile';
import { BigButton } from '../components/BigButton';
import { TileBuilder } from '../components/TileBuilder';
import { MissReview } from '../components/MissReview';

interface Props {
  items: SpellingItem[];
  onComplete: (responses: ScoredResponse[]) => void;
}

export function SpellingPart({ items, onComplete }: Props) {
  const { audio, content } = useServices();
  const say = useSay();
  const [i, setI] = useState(0);
  const [responses, setResponses] = useState<ScoredResponse[]>([]);
  const [feedback, setFeedback] = useState<'none' | 'sound' | 'word' | 'sentence'>('none');
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const item = items[i];

  const hear = async () => {
    if (!item) return;
    if (item.type === 'sound') await audio.playCard(item.card);
    if (item.type === 'word') await audio.speak(item.word.text);
    if (item.type === 'sentence') await audio.speak(item.text);
  };

  useEffect(() => {
    if (!item) {
      onCompleteRef.current(responses);
      return;
    }
    let cancelled = false;
    (async () => {
      if (item.type === 'sound') await say('Tap the letter that makes this sound.');
      if (item.type === 'word') await say('Spell the word.');
      if (item.type === 'sentence') await say('Put the words in order.');
      if (!cancelled) await hear();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const advance = (rs: ScoredResponse[]) => {
    setFeedback('none');
    if (i + 1 < items.length) setI(i + 1);
    else onCompleteRef.current(rs);
  };

  const record = async (correct: boolean) => {
    if (!item || feedback !== 'none') return;
    const base = { correct, parentMarked: false };
    const r: ScoredResponse =
      item.type === 'sound'
        ? { ...base, itemKey: cardKey(item.card), activity: 'spell-sound', isReview: item.isReview }
        : item.type === 'word'
          ? { ...base, itemKey: wordKey(item.substep, item.word.text), activity: 'spell-word', isReview: item.isReview }
          : { ...base, itemKey: sentenceKey(item.substep, item.text), activity: 'spell-sentence', isReview: false };
    const rs = [...responses, r];
    setResponses(rs);
    if (correct) return advance(rs);
    setFeedback(item.type);
    await hear();
  };

  if (!item) return null;

  if (feedback === 'word' && item.type === 'word') return <MissReview word={item.word} onDone={() => advance(responses)} />;

  return (
    <div className="stage" data-part="spelling">
      <Caption />
      {item.type === 'sound' && (
        <div className="row">
          {item.choices.map((c) => {
            const card = getCard(content, c);
            return <Tile key={c} grapheme={card.grapheme} type={card.type} size="large" selected={feedback === 'sound' && c === item.card} dim={feedback === 'sound' && c !== item.card} onClick={() => record(c === item.card)} />;
          })}
        </div>
      )}
      {item.type === 'word' && <TileBuilder key={i} tray={item.tray} expected={item.word.parts.map((p) => p.grapheme)} onDone={record} />}
      {item.type === 'sentence' && feedback === 'none' && <TileBuilder key={i} kind="chip" tray={item.words} expected={item.text.split(/\s+/)} onDone={record} />}
      {item.type === 'sentence' && feedback === 'sentence' && <p className="bigtext">{item.text}</p>}
      <div className="row">
        <BigButton variant="quiet" onClick={hear}>Hear it again</BigButton>
        {feedback !== 'none' && <BigButton onClick={() => advance(responses)}>Next</BigButton>}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run tests, type check, commit**

Run: `npm test && npm run typecheck`
Expected: PASS.

```bash
git add -A
git commit -m "Add spelling: sound to letter, word dictation from tiles, and sentence ordering

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 15: Read-aloud, story, session end, and the session runner

**Files:**
- Create: `src/ui/session/ReadAloudPart.tsx`, `src/ui/session/StoryPart.tsx`, `src/ui/session/SessionEnd.tsx`, `src/ui/session/SessionRunner.tsx`
- Modify: `src/App.tsx`
- Test: `tests/ui/readaloud.test.tsx`, `tests/ui/story.test.tsx`, `tests/ui/runner.test.tsx`

**Interfaces:**
- Consumes: `SessionPlan`, `buildSession`, `finishSession`, `FinishResult`, `Profile`, `Store`, all parts above, `Path`.
- Produces:
```ts
export function ReadAloudPart(props: { words: WordRef[]; sentences: string[]; substep: string; onComplete: (responses: ScoredResponse[], done: boolean) => void });
// First asks "Is a grown-up with you?" with buttons "Yes" and "Not right now". Then each line has "Got it" / "Missed it".
export function StoryPart(props: { story: Story; substep: string; onComplete: (responses: ScoredResponse[]) => void });
// Title screen with "Start"; each sentence has "Hear it" and "Next"; questions have three choice buttons and "Hear the choices".
export function SessionEnd(props: { plan: SessionPlan; result: FinishResult; onDone: () => void });
export function SessionRunner(props: { profile: Profile; onExit: () => void });
// Has a "Stop for now" button at all times during the session.
```

- [ ] **Step 1: Write the failing tests for the two parts**

`tests/ui/readaloud.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReadAloudPart } from '../../src/ui/session/ReadAloudPart';
import { cvc } from '../../src/content/build';
import { renderWithServices } from './helpers';

const words = [{ word: cvc('map'), substep: '1.1', isReview: false }, { word: cvc('sit'), substep: '1.1', isReview: true }];

describe('ReadAloudPart', () => {
  it('skips when no grown-up is present', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderWithServices(<ReadAloudPart words={words} sentences={['The map.']} substep="1.1" onComplete={onComplete} />);
    await user.click(await screen.findByRole('button', { name: /not right now/i }));
    expect(onComplete).toHaveBeenCalledWith([], false);
  });

  it('lets a parent mark each word and sentence', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderWithServices(<ReadAloudPart words={words} sentences={['The map.']} substep="1.1" onComplete={onComplete} />);
    await user.click(await screen.findByRole('button', { name: /^yes$/i }));
    expect(screen.getByText('map')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /got it/i }));
    expect(screen.getByText('sit')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /missed it/i }));
    expect(screen.getByText('The map.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /got it/i }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0]).toEqual([
      [
        { itemKey: 'word:1.1:map', activity: 'read-aloud', correct: true, isReview: false, parentMarked: true },
        { itemKey: 'word:1.1:sit', activity: 'read-aloud', correct: false, isReview: true, parentMarked: true },
        { itemKey: 'sentence:1.1:The map.', activity: 'read-aloud', correct: true, isReview: false, parentMarked: true },
      ],
      true,
    ]);
  });
});
```

`tests/ui/story.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StoryPart } from '../../src/ui/session/StoryPart';
import { FakeAudio } from '../../src/audio/fake';
import { renderWithServices } from './helpers';

const story = {
  title: 'Rat on a Log',
  sentences: ['A rat sat on a log.', 'The rat is fat.'],
  questions: [
    { prompt: 'Where did the rat sit?', choices: ['on a log', 'on a mat', 'on a lid'] as [string, string, string], answer: 0 as const },
    { prompt: 'What is the rat like?', choices: ['fat', 'sad', 'mad'] as [string, string, string], answer: 0 as const },
  ],
};

describe('StoryPart', () => {
  it('reads sentence by sentence then asks questions', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const audio = new FakeAudio();
    renderWithServices(<StoryPart story={story} substep="1.1" onComplete={onComplete} />, { audio });
    await user.click(await screen.findByRole('button', { name: /start/i }));
    expect(screen.getByText('A rat sat on a log.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /hear it/i }));
    expect(audio.spoken).toContain('A rat sat on a log.');
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => expect(audio.spoken).toContain('Where did the rat sit?'));
    await user.click(screen.getByRole('button', { name: 'on a mat' }));
    await user.click(await screen.findByRole('button', { name: /next/i }));
    await user.click(await screen.findByRole('button', { name: 'fat' }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toEqual([
      { itemKey: 'story:1.1:Rat on a Log:0', activity: 'story-question', correct: false, isReview: false, parentMarked: false },
      { itemKey: 'story:1.1:Rat on a Log:1', activity: 'story-question', correct: true, isReview: false, parentMarked: false },
    ]);
  });
});
```

- [ ] **Step 2: Run to see them fail, then implement the two parts**

`src/ui/session/ReadAloudPart.tsx`:
```tsx
import { useEffect, useState } from 'react';
import type { WordRef } from '../../engine/session';
import { sentenceKey, wordKey, type ScoredResponse } from '../../engine/types';
import { Caption, useSay } from '../speech';
import { BigButton } from '../components/BigButton';

interface Props {
  words: WordRef[];
  sentences: string[];
  substep: string;
  onComplete: (responses: ScoredResponse[], done: boolean) => void;
}

export function ReadAloudPart({ words, sentences, substep, onComplete }: Props) {
  const say = useSay();
  const [phase, setPhase] = useState<'ask' | 'read'>('ask');
  const [i, setI] = useState(0);
  const [responses, setResponses] = useState<ScoredResponse[]>([]);

  const lines = [
    ...words.map((w) => ({ text: w.word.text, itemKey: wordKey(w.substep, w.word.text), isReview: w.isReview })),
    ...sentences.map((s) => ({ text: s, itemKey: sentenceKey(substep, s), isReview: false })),
  ];

  useEffect(() => {
    if (phase === 'ask') say('Is a grown-up with you? It is time to read out loud.');
    if (phase === 'read' && i === 0) say('Grown-up: tap "Got it" or "Missed it" after each line.');
  }, [phase, i, say]);

  const mark = (correct: boolean) => {
    const line = lines[i];
    const rs = [...responses, { itemKey: line.itemKey, activity: 'read-aloud' as const, correct, isReview: line.isReview, parentMarked: true }];
    setResponses(rs);
    if (i + 1 < lines.length) setI(i + 1);
    else onComplete(rs, true);
  };

  if (phase === 'ask') {
    return (
      <div className="stage" data-part="read-aloud-ask">
        <Caption />
        <div className="row">
          <BigButton onClick={() => (lines.length ? setPhase('read') : onComplete([], true))}>Yes</BigButton>
          <BigButton variant="quiet" onClick={() => onComplete([], false)}>Not right now</BigButton>
        </div>
      </div>
    );
  }

  const line = lines[i];
  return (
    <div className="stage" data-part="read-aloud">
      <Caption />
      <p className={line.text.includes(' ') ? 'bigtext' : 'bigword'}>{line.text}</p>
      <div className="row">
        <BigButton onClick={() => mark(true)}>Got it</BigButton>
        <BigButton variant="quiet" onClick={() => mark(false)}>Missed it</BigButton>
      </div>
      <p className="caption">{i + 1} of {lines.length}</p>
    </div>
  );
}
```

`src/ui/session/StoryPart.tsx`:
```tsx
import { useEffect, useRef, useState } from 'react';
import type { Story } from '../../content/types';
import { storyKey, type ScoredResponse } from '../../engine/types';
import { useServices } from '../services';
import { Caption, useSay } from '../speech';
import { BigButton } from '../components/BigButton';

interface Props {
  story: Story;
  substep: string;
  onComplete: (responses: ScoredResponse[]) => void;
}

export function StoryPart({ story, substep, onComplete }: Props) {
  const { audio } = useServices();
  const say = useSay();
  const [phase, setPhase] = useState<'title' | 'read' | 'ask'>('title');
  const [i, setI] = useState(0);
  const [responses, setResponses] = useState<ScoredResponse[]>([]);
  const [answered, setAnswered] = useState<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (phase === 'title') say(`Story time. This one is called ${story.title}. Read each line, then tap Next.`);
    if (phase === 'ask') {
      const q = story.questions[i];
      if (!q) onCompleteRef.current(responses);
      else say(q.prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, i]);

  const nextSentence = () => {
    if (i + 1 < story.sentences.length) setI(i + 1);
    else {
      setPhase('ask');
      setI(0);
    }
  };

  const q = story.questions[i];
  const answer = async (k: number) => {
    if (!q || answered !== null) return;
    const correct = k === q.answer;
    const rs = [...responses, { itemKey: storyKey(substep, story.title, i), activity: 'story-question' as const, correct, isReview: false, parentMarked: false }];
    setResponses(rs);
    if (correct) return nextQuestion(rs);
    setAnswered(k);
    await say(`The answer is: ${q.choices[q.answer]}.`);
  };

  const nextQuestion = (rs: ScoredResponse[]) => {
    setAnswered(null);
    if (i + 1 < story.questions.length) setI(i + 1);
    else onCompleteRef.current(rs);
  };

  if (phase === 'title') {
    return (
      <div className="stage" data-part="story-title">
        <Caption />
        <h2 className="bigtext">{story.title}</h2>
        <BigButton onClick={() => setPhase('read')}>Start</BigButton>
      </div>
    );
  }

  if (phase === 'read') {
    return (
      <div className="stage" data-part="story">
        <p className="bigtext">{story.sentences[i]}</p>
        <div className="row">
          <BigButton variant="quiet" onClick={() => audio.speak(story.sentences[i])}>Hear it</BigButton>
          <BigButton onClick={nextSentence}>Next</BigButton>
        </div>
        <p className="caption">{i + 1} of {story.sentences.length}</p>
      </div>
    );
  }

  if (!q) return null;
  return (
    <div className="stage" data-part="story-question">
      <Caption />
      <div className="row">
        {q.choices.map((c, k) => <BigButton key={k} variant={answered !== null && k === q.answer ? 'primary' : 'quiet'} onClick={() => answer(k)}>{c}</BigButton>)}
      </div>
      <div className="row">
        <BigButton variant="quiet" onClick={async () => { for (const c of q.choices) await audio.speak(c); }}>Hear the choices</BigButton>
        {answered !== null && <BigButton onClick={() => nextQuestion(responses)}>Next</BigButton>}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run the two part tests**

Run: `npx vitest run tests/ui/readaloud.test.tsx tests/ui/story.test.tsx`
Expected: PASS.

- [ ] **Step 4: Write the failing runner test**

`tests/ui/runner.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionRunner } from '../../src/ui/session/SessionRunner';
import { CONTENT } from '../../src/content';
import { MemoryStore } from '../../src/store/memory';
import { buildSession } from '../../src/engine/session';
import { initialState } from '../../src/engine/types';
import { seeded } from '../../src/engine/rng';
import { getCard } from '../../src/engine/availability';
import type { Profile } from '../../src/store/types';
import { renderWithServices } from './helpers';

const profile = (): Profile => ({ id: 'p1', name: 'Sam', color: 'sky', createdAt: 'd', state: initialState('1.1') });

describe('SessionRunner', () => {
  it('saves a partial session when the child stops early', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    const p = profile();
    await store.saveProfile(p);
    const onExit = vi.fn();
    renderWithServices(<SessionRunner profile={p} onExit={onExit} />, { store });
    await user.click(await screen.findByRole('button', { name: /stop for now/i }));
    expect(await screen.findByText(/nice work today/i)).toBeInTheDocument();
    const saved = (await store.listProfiles())[0];
    expect(saved.state.sessionsCompleted).toBe(1);
    expect(saved.state.lessonPending).toBe(false);
    const logs = await store.listLogs('p1');
    expect(logs.length).toBe(1);
    expect(logs[0].complete).toBe(false);
    await user.click(screen.getByRole('button', { name: /done/i }));
    expect(onExit).toHaveBeenCalled();
  });

  it('plays a whole session and records a complete log', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    const p = profile();
    await store.saveProfile(p);
    const plan = buildSession(CONTENT, p.state, seeded(1));
    const onExit = vi.fn();
    renderWithServices(<SessionRunner profile={p} onExit={onExit} />, { store, rng: seeded(1) });

    const click = async (name: string | RegExp) => user.click(await screen.findByRole('button', { name }));
    const tapOut = async (n: number) => {
      for (let k = 1; k <= n; k++) await click(`Sound ${k}`);
      await click('Blend');
    };
    const buildFrom = async (pieces: string[]) => {
      const tray = await screen.findByTestId('tray');
      for (const g of pieces) {
        const buttons = within(tray).getAllByRole('button', { name: g }).filter((b) => !b.className.includes('tile-dim'));
        await user.click(buttons[0]);
      }
      await click(/^done$/i);
    };

    // 1. sound cards
    for (let k = 0; k < plan.forwardCards.length; k++) await click(/that's it/i);
    for (const item of plan.reverseItems) await click(getCard(CONTENT, item.target).grapheme);

    // 2. lesson
    for (const step of plan.lesson) {
      if ('say' in step || 'show' in step || 'tap' in step) await click(/^next$/i);
      else await tapOut(CONTENT.substeps[0].words.find((w) => w.text === step.try)!.parts.length);
    }

    // 3. word work
    for (const item of plan.wordWork) {
      if (item.type === 'tap') await tapOut(item.word.parts.length);
      if (item.type === 'find') await click(item.word.text);
      if (item.type === 'build') await buildFrom(item.word.parts.map((x) => x.grapheme));
    }

    // 4. spelling
    for (const item of plan.spelling) {
      if (item.type === 'sound') await click(getCard(CONTENT, item.card).grapheme);
      if (item.type === 'word') await buildFrom(item.word.parts.map((x) => x.grapheme));
      if (item.type === 'sentence') await buildFrom(item.text.split(/\s+/));
    }

    // 5. read aloud with a grown-up
    await click(/^yes$/i);
    for (let k = 0; k < plan.readAloud.words.length + plan.readAloud.sentences.length; k++) await click(/got it/i);

    // 6. story
    await click(/^start$/i);
    for (let k = 0; k < plan.story.sentences.length; k++) await click(/^next$/i);
    for (const q of plan.story.questions) await click(q.choices[q.answer]);

    expect(await screen.findByText(/nice work today/i)).toBeInTheDocument();
    const saved = (await store.listProfiles())[0];
    expect(saved.state.sessionsCompleted).toBe(1);
    expect(saved.state.pendingReadAloud).toBe(false);
    const logs = await store.listLogs('p1');
    expect(logs[0].complete).toBe(true);
    expect(logs[0].readAloudDone).toBe(true);
    expect(logs[0].responses.every((r) => r.correct)).toBe(true);
    expect(logs[0].responses.filter((r) => r.activity === 'sound-reverse').length).toBe(plan.reverseItems.length);
    await click(/^done$/i);
    expect(onExit).toHaveBeenCalled();
  }, 30000);
});
```

- [ ] **Step 5: Run to see it fail, then implement SessionEnd and SessionRunner**

`src/ui/session/SessionEnd.tsx`:
```tsx
import { useEffect } from 'react';
import type { SessionPlan } from '../../engine/session';
import type { FinishResult } from '../../engine/progression';
import { useServices } from '../services';
import { useSay } from '../speech';
import { BigButton } from '../components/BigButton';
import { Path } from '../components/Path';

interface Props {
  plan: SessionPlan;
  result: FinishResult;
  onDone: () => void;
}

export function SessionEnd({ plan, result, onDone }: Props) {
  const { content } = useServices();
  const say = useSay();
  useEffect(() => {
    const to = result.advancedTo ? content.substeps.find((s) => s.id === result.advancedTo) : null;
    const extra = to ? ` You have finished ${plan.substepTitle}. Next time we start ${to.title}.` : '';
    say(`Nice work today.${extra}`);
  }, [say, result.advancedTo, plan.substepTitle, content.substeps]);

  return (
    <div className="screen" data-part="end">
      <div className="stage">
        <h2>Nice work today.</h2>
        <p className="caption">Today: sound cards, {plan.lessonMode === 'full' ? 'a new lesson' : 'a quick review'}, word work, spelling, {plan.readAloud.words.length ? 'reading out loud, ' : ''}and a story.</p>
        <Path current={result.state.currentSubstep} />
        <BigButton onClick={onDone}>Done</BigButton>
      </div>
    </div>
  );
}
```

`src/ui/session/SessionRunner.tsx`:
```tsx
import { useMemo, useState } from 'react';
import type { Profile } from '../../store/types';
import type { ScoredResponse, SessionLog } from '../../engine/types';
import { buildSession } from '../../engine/session';
import { finishSession, type FinishResult } from '../../engine/progression';
import { getSubstep } from '../../engine/availability';
import { useServices } from '../services';
import { BigButton } from '../components/BigButton';
import { SoundCardsPart } from './SoundCardsPart';
import { LessonPart } from './LessonPart';
import { WordWorkPart } from './WordWorkPart';
import { SpellingPart } from './SpellingPart';
import { ReadAloudPart } from './ReadAloudPart';
import { StoryPart } from './StoryPart';
import { SessionEnd } from './SessionEnd';

type PartName = 'sound' | 'lesson' | 'wordWork' | 'spelling' | 'readAloud' | 'story';

interface Props {
  profile: Profile;
  onExit: () => void;
}

export function SessionRunner({ profile, onExit }: Props) {
  const { content, store, rng, audio } = useServices();
  const plan = useMemo(() => buildSession(content, profile.state, rng), [content, profile.state, rng]);
  const order: PartName[] = plan.readAloudFirst
    ? ['readAloud', 'sound', 'lesson', 'wordWork', 'spelling', 'story']
    : ['sound', 'lesson', 'wordWork', 'spelling', 'readAloud', 'story'];
  const [partIndex, setPartIndex] = useState(0);
  const [responses, setResponses] = useState<ScoredResponse[]>([]);
  const [readAloudDone, setReadAloudDone] = useState(false);
  const [result, setResult] = useState<FinishResult | null>(null);
  const [finishing, setFinishing] = useState(false);

  const finalize = async (complete: boolean, rs: ScoredResponse[], raDone: boolean) => {
    if (finishing || result) return;
    setFinishing(true);
    audio.stop();
    const log: SessionLog = { sessionNumber: plan.sessionNumber, date: new Date().toISOString(), substep: plan.substep, complete, readAloudDone: raDone, responses: rs };
    const previous = await store.listLogs(profile.id);
    const out = finishSession(profile.state, log, previous, content);
    await store.appendLog(profile.id, log);
    await store.saveProfile({ ...profile, state: out.state });
    setResult(out);
  };

  const partDone = (rs: ScoredResponse[], raDone = readAloudDone) => {
    const all = [...responses, ...rs];
    setResponses(all);
    setReadAloudDone(raDone);
    if (partIndex + 1 < order.length) setPartIndex(partIndex + 1);
    else finalize(true, all, raDone);
  };

  if (result) return <SessionEnd plan={plan} result={result} onDone={onExit} />;

  const part = order[partIndex];
  const substep = getSubstep(content, plan.substep);
  return (
    <div className="screen">
      <div className="topbar">
        <span>{profile.name}</span>
        <BigButton variant="quiet" onClick={() => finalize(false, responses, readAloudDone)}>Stop for now</BigButton>
      </div>
      {part === 'sound' && <SoundCardsPart key="sound" forwardCards={plan.forwardCards} reverseItems={plan.reverseItems} onComplete={(rs) => partDone(rs)} />}
      {part === 'lesson' && <LessonPart key="lesson" steps={plan.lesson} substep={substep} onComplete={() => partDone([])} />}
      {part === 'wordWork' && <WordWorkPart key="wordWork" items={plan.wordWork} onComplete={(rs) => partDone(rs)} />}
      {part === 'spelling' && <SpellingPart key="spelling" items={plan.spelling} onComplete={(rs) => partDone(rs)} />}
      {part === 'readAloud' && <ReadAloudPart key="readAloud" words={plan.readAloud.words} sentences={plan.readAloud.sentences} substep={plan.substep} onComplete={(rs, done) => partDone(rs, done)} />}
      {part === 'story' && <StoryPart key="story" story={plan.story} substep={plan.substep} onComplete={(rs) => partDone(rs)} />}
    </div>
  );
}
```

Update `src/App.tsx` so the session screen renders the runner:
```tsx
import { useState } from 'react';
import type { Profile } from './store/types';
import { Home } from './ui/screens/Home';
import { SessionRunner } from './ui/session/SessionRunner';
import { SpeechProvider } from './ui/speech';

type Screen = { name: 'home' } | { name: 'session'; profile: Profile } | { name: 'parent'; profile: Profile };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const home = () => setScreen({ name: 'home' });
  return (
    <SpeechProvider>
      {screen.name === 'home' && <Home onStart={(profile) => setScreen({ name: 'session', profile })} onParent={(profile) => setScreen({ name: 'parent', profile })} />}
      {screen.name === 'session' && <SessionRunner profile={screen.profile} onExit={home} />}
      {screen.name === 'parent' && <div className="screen"><p>Grown-up area coming soon.</p><button className="big big-quiet" onClick={home}>Back</button></div>}
    </SpeechProvider>
  );
}
```

- [ ] **Step 6: Run everything, type check, build, commit**

Run: `npm test && npm run typecheck && npm run build`
Expected: PASS. The full-session test drives roughly 80 clicks; if it times out, raise its timeout rather than trimming the session. If a `find` item's choice button cannot be found by name because two choices share text with a "Hear it again" button, note that choices are exact-name matches and the helper uses a string, which Testing Library matches exactly.

```bash
git add -A
git commit -m "Add read-aloud with a grown-up, the story, the session end, and the runner that ties the six parts together

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 16: Parent area with progress view and manual move

**Files:**
- Create: `src/ui/screens/ParentArea.tsx`
- Modify: `src/App.tsx`
- Test: `tests/ui/parent.test.tsx`

**Interfaces:**
- Consumes: `Profile`, `Store`, `SessionLog`, `moveTo`, `accuracy`, `ADVANCE`, `Path`, `BigButton`.
- Produces: `ParentArea(props: { profile: Profile; onBack: () => void })`. Shows: the path, sessions in the last 14 days, current-substep solo accuracy over the last three complete sessions, the ten weakest items, the last read-aloud date, the substep's parent summary, and a "Move to" select with a "Move" button.

- [ ] **Step 1: Write the failing test**

`tests/ui/parent.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParentArea } from '../../src/ui/screens/ParentArea';
import { MemoryStore } from '../../src/store/memory';
import { initialState, type SessionLog } from '../../src/engine/types';
import { CARDS } from '../../src/content/cards';
import { cvc, cvcNonsense } from '../../src/content/build';
import type { Content } from '../../src/content/types';
import { CONTENT } from '../../src/content';
import { renderWithServices } from './helpers';

const twoSubsteps: Content = {
  cards: CARDS,
  substeps: [CONTENT.substeps[0], { ...CONTENT.substeps[0], id: '1.2', title: 'Second step', groups: [{ cards: ['b'], lesson: [] }], words: [cvc('bat'), cvcNonsense('bip')] }],
};

describe('ParentArea', () => {
  it('shows progress and moves the child to another substep', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    const profile = { id: 'p1', name: 'Sam', color: 'sky', createdAt: 'd', state: { ...initialState('1.1'), sessionsCompleted: 2, strengths: { 'word:1.1:map': { value: 0.1, lastSeen: 2 }, 'card:a': { value: 0.9, lastSeen: 2 } } } };
    await store.saveProfile(profile);
    const today = new Date().toISOString();
    const log = (n: number, correct: number, total: number, ra = false): SessionLog => ({
      sessionNumber: n, date: today, substep: '1.1', complete: true, readAloudDone: ra,
      responses: Array.from({ length: total }, (_, k) => ({ itemKey: 'word:1.1:map', activity: 'tap', correct: k < correct, isReview: false, parentMarked: false })),
    });
    await store.appendLog('p1', log(1, 8, 10));
    await store.appendLog('p1', log(2, 10, 10, true));

    const onBack = vi.fn();
    renderWithServices(<ParentArea profile={profile} onBack={onBack} />, { store, content: twoSubsteps });

    expect(await screen.findByText(/sessions in the last 14 days/i)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('map, a')).toBeInTheDocument();
    expect(screen.getByText(/last read-aloud/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/move to/i), '1.2');
    await user.click(screen.getByRole('button', { name: /^move$/i }));
    await waitFor(async () => expect((await store.listProfiles())[0].state.currentSubstep).toBe('1.2'));
    expect((await store.listProfiles())[0].state.lessonPending).toBe(true);
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run to see it fail, then implement**

`src/ui/screens/ParentArea.tsx`:
```tsx
import { useEffect, useMemo, useState } from 'react';
import type { Profile } from '../../store/types';
import type { SessionLog } from '../../engine/types';
import { accuracy, moveTo } from '../../engine/progression';
import { getSubstep } from '../../engine/availability';
import { useServices } from '../services';
import { BigButton } from '../components/BigButton';
import { Path } from '../components/Path';

interface Props {
  profile: Profile;
  onBack: () => void;
}

export function ParentArea({ profile: initial, onBack }: Props) {
  const { store, content } = useServices();
  const [profile, setProfile] = useState(initial);
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [target, setTarget] = useState(initial.state.currentSubstep);
  const [note, setNote] = useState('');

  useEffect(() => {
    store.listLogs(profile.id).then(setLogs);
  }, [store, profile.id]);

  const stats = useMemo(() => {
    const cutoff = Date.now() - 14 * 24 * 3600 * 1000;
    const recent = logs.filter((l) => new Date(l.date).getTime() >= cutoff).length;
    const here = logs.filter((l) => l.substep === profile.state.currentSubstep && l.complete).slice(-3);
    const acc = accuracy(here.flatMap((l) => l.responses).filter((r) => !r.isReview && !r.parentMarked));
    const weakest = Object.entries(profile.state.strengths)
      .sort((a, b) => a[1].value - b[1].value)
      .slice(0, 10)
      .map(([k]) => k.split(':').slice(-1)[0]);
    const lastRA = [...logs].reverse().find((l) => l.readAloudDone);
    return { recent, acc, weakest, lastRA: lastRA ? new Date(lastRA.date).toLocaleDateString() : 'never' };
  }, [logs, profile.state]);

  const move = async () => {
    const next = { ...profile, state: moveTo(profile.state, target) };
    await store.saveProfile(next);
    setProfile(next);
    setNote(`Moved to ${target}. The next session starts with its lesson.`);
  };

  const sub = getSubstep(content, profile.state.currentSubstep);

  return (
    <div className="screen">
      <div className="topbar">
        <span>Grown-up area: {profile.name}</span>
        <BigButton variant="quiet" onClick={onBack}>Back</BigButton>
      </div>
      <div className="stage">
        <Path current={profile.state.currentSubstep} />
        <p className="caption">{sub.parentSummary}</p>
        <dl className="stats">
          <div><dt>Sessions in the last 14 days</dt><dd>{stats.recent}</dd></div>
          <div><dt>Accuracy on current work (last 3 sessions)</dt><dd>{stats.acc === null ? 'no data yet' : `${Math.round(stats.acc * 100)}%`}</dd></div>
          <div><dt>Last read-aloud with a grown-up</dt><dd>{stats.lastRA}</dd></div>
          <div><dt>Needs the most practice</dt><dd>{stats.weakest.length ? stats.weakest.join(', ') : 'nothing yet'}</dd></div>
        </dl>
        <form className="card" onSubmit={(e) => { e.preventDefault(); move(); }}>
          <label>
            Move to
            <select value={target} onChange={(e) => setTarget(e.target.value)}>
              {content.substeps.map((s) => <option key={s.id} value={s.id}>{s.id} {s.title}</option>)}
            </select>
          </label>
          <button type="submit" className="big big-primary">Move</button>
          {note && <p className="caption">{note}</p>}
        </form>
      </div>
    </div>
  );
}
```

Update `src/App.tsx` to render it:
```tsx
import { ParentArea } from './ui/screens/ParentArea';
// ...
{screen.name === 'parent' && <ParentArea profile={screen.profile} onBack={home} />}
```
(Replace the placeholder `div` from Task 15 with that line and remove the now-unused placeholder markup.)

- [ ] **Step 3: Run everything, type check, build, commit**

Run: `npm test && npm run typecheck && npm run build`
Expected: PASS.

```bash
git add -A
git commit -m "Add the grown-up area with progress view and manual move between substeps

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 17: Run it for real and write the README

**Files:**
- Create: `README.md`, `.gitignore`

- [ ] **Step 1: Add a .gitignore and README**

`.gitignore`:
```
node_modules
dist
```

`README.md`:
```markdown
# Tapwords

A calm, self-guided structured-literacy reading app (Orton-Gillingham style) for tablets and laptops.

## Run it

    npm install
    npm run dev

Open the printed address on an iPad or in a desktop browser. Add a child, pick a starting point, tap their name.

## Check it

    npm test          # engine, content checker, screens
    npm run typecheck
    npm run build     # production build in dist/

## Where things live

- `src/content` — sound cards and one file per substep. Every file must pass the content checker (`tests/content`).
- `src/engine` — session assembly, scoring, review, advancement. No React, no browser.
- `src/store`, `src/audio` — device storage and voice, behind interfaces with test fakes.
- `src/ui` — screens and session parts.
- `docs/superpowers/specs` — the design. `docs/superpowers/plans` — build plans.
```

If `node_modules` or `dist` were committed in an earlier task, run `git rm -r --cached node_modules dist` before committing.

- [ ] **Step 2: Serve the production build and confirm the page loads**

Run: `npm run build && (npx vite preview --port 4173 & sleep 2; curl -s http://localhost:4173/ | head -20; kill %1)`
Expected: the HTML with `<title>Tapwords</title>` and a script tag pointing at the built bundle.

- [ ] **Step 3: Smoke-check in a real browser**

If a browser automation skill is available (`browser-harness`), open `http://localhost:4173/`, add a child named "Test", start a session, and confirm the first sound card appears with "Hear it", "That's it", "Not sure" buttons. Take a screenshot into the scratchpad directory. If no browser is available, say so in the task report; do not claim the check was done.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add README and ignore build output

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Plan self-review notes

**Spec coverage (plan 1 scope):** session shape and all six parts (Tasks 11 to 15); assembly proportions, nonsense minimum, lesson full/review, read-aloud queued first (Task 5); miss handling with tapping demo (Task 10, used in 13 and 14); stop early with partial log and `complete: false` (Task 15); strengths, decay, review floor (Tasks 3 and 4); advancement rule including read-aloud conditions and card groups (Task 6); parent controls: move, progress view (Task 16); profiles on one device (Tasks 7 and 9); audio with clip-or-voice fallback and cut-off on new sound (Task 8); presentation rules (Task 9 styles, no timers, no red X, no mid-session score); content checker rules (Task 2).

**Deferred to plan 2:** substeps 1.2 to 3.5, placement check screen (the rule itself is in Task 6), recording page, backup and restore, corrupt-data recovery prompt. **Deferred to plan 3:** PWA/offline, Playwright browser tests at tablet size, deployment, real-device check.

**Known simplifications to carry forward:** the word-work "build" tray is derived deterministically in the UI from the item index rather than from the plan; the spelling "word" tray comes from the plan. Both are acceptable, but plan 2 may move the word-work tray into `buildSession` for consistency.
