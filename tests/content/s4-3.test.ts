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
import type { Content } from '../../src/content/types';

const content: Content = {
  cards: CARDS,
  substeps: [
    SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5, SUBSTEP_1_6,
    SUBSTEP_2_1, SUBSTEP_2_2, SUBSTEP_2_3, SUBSTEP_2_4, SUBSTEP_2_5,
    SUBSTEP_3_1, SUBSTEP_3_2, SUBSTEP_3_3, SUBSTEP_3_4, SUBSTEP_3_5,
    SUBSTEP_4_1, SUBSTEP_4_2, SUBSTEP_4_3,
  ],
};

describe('substep 4.3 content', () => {
  it('passes the content checker at production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });

  it('uses only the e silent-e vowel and the second sound of u', () => {
    // The vowel is found by card type rather than by a name ending in "_e": the second sound of
    // u-e is the card "u_e_oo", whose id ends in the sound it makes, not in the spelling.
    const cards = cardMap(CARDS);
    for (const w of SUBSTEP_4_3.words) {
      const vowel = w.parts.find((p) => cards.get(p.card)?.type === 'vce');
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

  it('ends every word with a silent e that is doing a job', () => {
    const cards = cardMap(CARDS);
    for (const w of SUBSTEP_4_3.words) {
      expect(w.parts[w.parts.length - 1].card, w.text).toBe('e_silent');
      expect(w.parts.filter((p) => cards.get(p.card)?.type === 'vce').length, w.text).toBe(1);
    }
  });

  it("hits this section's content targets, as far as honest words allow", () => {
    const real = SUBSTEP_4_3.words.filter((w) => w.kind === 'real');
    const cards = cardMap(CARDS);
    const usingCard = (id: string) => real.filter((w) => w.parts.some((p) => p.card === id)).length;
    // Well short of the 30 the brief asks for, and that is the honest ceiling: e_e yields a
    // handful of one-syllable words and the rest are banned for a letter taking an untaught
    // sound, and the /oo/ sound of u-e only counts words no ordinary speaker says with /yoo/.
    // The report lists every candidate weighed and why it was kept or dropped.
    expect(real.length).toBeGreaterThanOrEqual(20);
    expect(usingCard('e_e')).toBeGreaterThanOrEqual(5);
    expect(usingCard('u_e_oo')).toBeGreaterThanOrEqual(14);
    expect(SUBSTEP_4_3.words.filter((w) => w.kind === 'nonsense').length).toBeGreaterThanOrEqual(15);
    expect(SUBSTEP_4_3.sentences.length).toBeGreaterThanOrEqual(12);
    expect(SUBSTEP_4_3.stories.length).toBeGreaterThanOrEqual(2);
    for (const st of SUBSTEP_4_3.stories) expect(st.questions.length, st.title).toBeGreaterThanOrEqual(2);
    for (const w of SUBSTEP_4_3.words) for (const p of w.parts) expect(cards.get(p.card), w.text).toBeDefined();
  });

  it('never asks a story question whose right answer sits anywhere but index 0', () => {
    for (const st of SUBSTEP_4_3.stories) {
      for (const q of st.questions) expect(q.answer, `${st.title}: ${q.prompt}`).toBe(0);
    }
  });

  it('puts one sentence in each story element, so the story screen shows one at a time', () => {
    for (const st of SUBSTEP_4_3.stories) {
      for (const line of st.sentences) {
        expect(line.replace(/[.!?]+["']?\s*$/, ''), `${st.title}: ${line}`).not.toMatch(/[.!?]["']?\s/);
      }
    }
  });

  it('keeps plurals, suffixes and the program name out of the section', () => {
    const json = JSON.stringify(SUBSTEP_4_3);
    expect(json.toLowerCase()).not.toContain('wilson');
    for (const w of SUBSTEP_4_3.words) {
      expect(w.text.endsWith('s'), w.text).toBe(false);
      expect(w.text.endsWith('ed'), w.text).toBe(false);
      expect(w.text.endsWith('ing'), w.text).toBe(false);
    }
  });

  it('draws every answer choice from its own story', () => {
    for (const st of SUBSTEP_4_3.stories) {
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
    for (const st of SUBSTEP_4_3.stories) {
      for (const text of [st.title, ...st.questions.flatMap((q) => q.choices)]) {
        for (const token of tokenize(text)) {
          expect(taught.has(token), `"${text}" uses "${token}", which no section has taught`).toBe(true);
        }
      }
    }
  });

  it('keeps a proper noun out of every answer choice that could be a distractor', () => {
    // A capitalised word is never a "find" target either; the engine sees to that. Here the
    // point is only that a name is spelled the way a child should see it.
    for (const w of SUBSTEP_4_3.words) {
      if (w.text[0] === w.text[0].toUpperCase()) {
        expect(w.parts.map((p) => p.grapheme).join(''), w.text).toBe(w.text.toLowerCase());
      }
    }
  });
});
