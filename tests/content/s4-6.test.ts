import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent, tokenize } from '../../src/content/check';
import { cardMap } from '../../src/content/parts';
import { SUBSTEP_1_1 } from '../../src/content/substeps/s1-1';
import { SUBSTEP_1_2 } from '../../src/content/substeps/s1-2';
import { SUBSTEP_1_3 } from '../../src/content/substeps/s1-3';
import { SUBSTEP_1_4 } from '../../src/content/substeps/s1-4';
import { SUBSTEP_1_5 } from '../../src/content/substeps/s1-5';
import { SUBSTEP_1_6 } from '../../src/content/substeps/s1-6';
import { SUBSTEP_2_1 } from '../../src/content/substeps/s2-1';
import { SUBSTEP_2_2 } from '../../src/content/substeps/s2-2';
import { SUBSTEP_2_3 } from '../../src/content/substeps/s2-3';
import { SUBSTEP_2_4 } from '../../src/content/substeps/s2-4';
import { SUBSTEP_2_5 } from '../../src/content/substeps/s2-5';
import { SUBSTEP_3_1 } from '../../src/content/substeps/s3-1';
import { SUBSTEP_3_2 } from '../../src/content/substeps/s3-2';
import { SUBSTEP_3_3 } from '../../src/content/substeps/s3-3';
import { SUBSTEP_3_4 } from '../../src/content/substeps/s3-4';
import { SUBSTEP_3_5 } from '../../src/content/substeps/s3-5';
import { SUBSTEP_4_1 } from '../../src/content/substeps/s4-1';
import { SUBSTEP_4_2 } from '../../src/content/substeps/s4-2';
import { SUBSTEP_4_3 } from '../../src/content/substeps/s4-3';
import { SUBSTEP_4_4 } from '../../src/content/substeps/s4-4';
import { SUBSTEP_4_5 } from '../../src/content/substeps/s4-5';
import { SUBSTEP_4_6 } from '../../src/content/substeps/s4-6';
import type { Content } from '../../src/content/types';

/** Copied from src/content/substeps/s1-6.ts, where the s ending is first taught. */
const SUFFIX_S = 'suffix-s';
/** The concept this section introduces, for have, give and live. */
const EXCEPTION = 'silent-e-exception';

// The full teaching order up to and including this section. 4.4 and 4.5 were being written at
// the same time as 4.6 and so were left out of this fixture originally, which made it narrower
// than the app: words this section may legitimately lean on (plate, slope, white, while) read as
// untaught here while passing in production. Widened in the final fix wave, the same correction
// ruling R14 made for the Book 3 fixtures.
const content: Content = {
  cards: CARDS,
  substeps: [
    SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5, SUBSTEP_1_6,
    SUBSTEP_2_1, SUBSTEP_2_2, SUBSTEP_2_3, SUBSTEP_2_4, SUBSTEP_2_5,
    SUBSTEP_3_1, SUBSTEP_3_2, SUBSTEP_3_3, SUBSTEP_3_4, SUBSTEP_3_5,
    SUBSTEP_4_1, SUBSTEP_4_2, SUBSTEP_4_3, SUBSTEP_4_4, SUBSTEP_4_5,
    SUBSTEP_4_6,
  ],
};

describe('substep 4.6 content', () => {
  it('passes the content checker at production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });

  it('ends every plural in the s card and tags it as a suffix', () => {
    const plurals = SUBSTEP_4_6.words.filter((w) => w.concepts?.includes(SUFFIX_S));
    expect(plurals.length).toBeGreaterThanOrEqual(20);
    for (const w of plurals) expect(w.parts[w.parts.length - 1].card, w.text).toBe('s');
  });

  it('teaches exactly the three words that break the rule', () => {
    const exceptions = SUBSTEP_4_6.words.filter((w) => w.concepts?.includes(EXCEPTION)).map((w) => w.text);
    expect(exceptions.sort()).toEqual(['give', 'have', 'live']);
  });

  it('taps an exception word as a short vowel with the e folded into the v', () => {
    const have = SUBSTEP_4_6.words.find((w) => w.text === 'have')!;
    expect(have.parts.map((p) => `${p.grapheme}:${p.card}`)).toEqual(['h:h', 'a:a', 've:v']);
  });

  it('only adds s where the s says the sound on its card', () => {
    // The s card has one recorded sound, /s/. A base ending in any voiced sound would make the
    // plural say /z/, which the app cannot say and the child has not been taught. Only bases
    // ending k, p, t or f survive that, so this is the whole rule the section is allowed.
    for (const w of SUBSTEP_4_6.words) {
      if (!w.concepts?.includes(SUFFIX_S)) continue;
      const base = w.text.toLowerCase().replace(/s$/, '').replace(/e$/, '');
      expect(['k', 'p', 't', 'f'], w.text).toContain(base[base.length - 1]);
    }
  });

  it('keeps the s off the three exception words, which are single and not plural', () => {
    for (const w of SUBSTEP_4_6.words) {
      if (!w.concepts?.includes(EXCEPTION)) continue;
      expect(w.text.endsWith('s'), w.text).toBe(false);
      expect(w.concepts?.includes(SUFFIX_S), w.text).toBe(false);
    }
  });

  it('gives every plural exactly one silent e, still doing its job inside the word', () => {
    const cards = cardMap(CARDS);
    for (const w of SUBSTEP_4_6.words) {
      if (!w.concepts?.includes(SUFFIX_S)) continue;
      expect(w.parts.filter((p) => cards.get(p.card)?.type === 'silent').length, w.text).toBe(1);
      expect(w.parts.filter((p) => cards.get(p.card)?.type === 'vce').length, w.text).toBe(1);
    }
  });

  it('introduces no new card, because there is no new sound here', () => {
    expect(SUBSTEP_4_6.groups.flatMap((g) => g.cards)).toEqual([]);
    expect(SUBSTEP_4_6.concepts).toContain(EXCEPTION);
  });

  it("hits this section's content targets", () => {
    const cards = cardMap(CARDS);
    const real = SUBSTEP_4_6.words.filter((w) => w.kind === 'real');
    expect(real.length).toBeGreaterThanOrEqual(30);
    expect(SUBSTEP_4_6.words.filter((w) => w.kind === 'nonsense').length).toBeGreaterThanOrEqual(15);
    expect(SUBSTEP_4_6.sentences.length).toBeGreaterThanOrEqual(12);
    expect(SUBSTEP_4_6.stories.length).toBeGreaterThanOrEqual(2);
    for (const st of SUBSTEP_4_6.stories) expect(st.questions.length, st.title).toBeGreaterThanOrEqual(2);
    for (const w of SUBSTEP_4_6.words) for (const p of w.parts) expect(cards.get(p.card), w.text).toBeDefined();
  });

  it('never asks a story question whose right answer sits anywhere but index 0', () => {
    for (const st of SUBSTEP_4_6.stories) {
      for (const q of st.questions) expect(q.answer, `${st.title}: ${q.prompt}`).toBe(0);
    }
  });

  it('puts one sentence in each story element, so the story screen shows one at a time', () => {
    for (const st of SUBSTEP_4_6.stories) {
      for (const line of st.sentences) {
        expect(line.replace(/[.!?]+["']?\s*$/, ''), `${st.title}: ${line}`).not.toMatch(/[.!?]["']?\s/);
      }
    }
  });

  it('draws every answer choice from its own story', () => {
    for (const st of SUBSTEP_4_6.stories) {
      const inStory = new Set(st.sentences.flatMap((s) => tokenize(s)));
      for (const q of st.questions) {
        for (const choice of q.choices) {
          for (const token of tokenize(choice)) {
            expect(inStory.has(token), `${st.title}: choice "${choice}" uses "${token}", absent from the story`).toBe(true);
          }
        }
      }
    }
  });

  it('writes every story title and answer choice out of taught words only', () => {
    // The checker never looks at titles or choices, and the child reads both.
    const taught = new Set<string>();
    for (const s of content.substeps) {
      for (const w of s.words) if (w.kind === 'real') taught.add(w.text.toLowerCase());
      for (const sw of s.sightWords) taught.add(sw.toLowerCase());
    }
    for (const st of SUBSTEP_4_6.stories) {
      for (const text of [st.title, ...st.questions.flatMap((q) => q.choices)]) {
        for (const token of tokenize(text)) {
          expect(taught.has(token), `"${text}" uses "${token}", which no section has taught`).toBe(true);
        }
      }
    }
  });

  it('never writes the program name, and never says a consonant with a schwa', () => {
    const json = JSON.stringify(SUBSTEP_4_6);
    expect(json.toLowerCase()).not.toContain('wilson');
    const said = SUBSTEP_4_6.groups.flatMap((g) => g.lesson).flatMap((s) => ('say' in s ? [s.say] : []));
    for (const line of said) {
      expect(line, line).not.toMatch(/\b(buh|kuh|duh|guh|puh|tuh|vuh|zuh|muh|nuh|luh|ruh|fuh|huh|suh)\b/i);
    }
  });
});
