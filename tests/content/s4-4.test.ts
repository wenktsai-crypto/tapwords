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
import type { Content } from '../../src/content/types';

const content: Content = {
  cards: CARDS,
  substeps: [
    SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5, SUBSTEP_1_6,
    SUBSTEP_2_1, SUBSTEP_2_2, SUBSTEP_2_3, SUBSTEP_2_4, SUBSTEP_2_5,
    SUBSTEP_3_1, SUBSTEP_3_2, SUBSTEP_3_3, SUBSTEP_3_4, SUBSTEP_3_5,
    SUBSTEP_4_1, SUBSTEP_4_2, SUBSTEP_4_3, SUBSTEP_4_4,
  ],
};

describe('substep 4.4 content', () => {
  it('passes the content checker at production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });

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

  it('starts every nonsense word the same way, so the practice matches the pattern', () => {
    // The section's whole point is the onset, so a nonsense word that opened with a single
    // consonant would be 4.1 to 4.3 practice wearing this section's badge.
    const cards = cardMap(CARDS);
    for (const w of SUBSTEP_4_4.words.filter((w) => w.kind === 'nonsense')) {
      const first = cards.get(w.parts[0].card);
      const second = cards.get(w.parts[1].card);
      const isDigraph = first?.type === 'digraph';
      const isBlend = first?.type === 'consonant' && second?.type === 'consonant';
      expect(isDigraph || isBlend, w.text).toBe(true);
    }
  });

  it('introduces no new card, because there is nothing new to learn here', () => {
    expect(SUBSTEP_4_4.groups.map((g) => g.cards)).toEqual([[]]);
    expect(SUBSTEP_4_4.concepts).toEqual([]);
  });

  it('ends every word with a silent e that is doing a job', () => {
    const cards = cardMap(CARDS);
    for (const w of SUBSTEP_4_4.words) {
      expect(w.parts[w.parts.length - 1].card, w.text).toBe('e_silent');
      expect(w.parts.filter((p) => cards.get(p.card)?.type === 'vce').length, w.text).toBe(1);
    }
  });

  it("hits this section's content targets", () => {
    const real = SUBSTEP_4_4.words.filter((w) => w.kind === 'real');
    expect(real.length).toBeGreaterThanOrEqual(30);
    expect(SUBSTEP_4_4.words.filter((w) => w.kind === 'nonsense').length).toBeGreaterThanOrEqual(15);
    expect(SUBSTEP_4_4.sentences.length).toBeGreaterThanOrEqual(12);
    expect(SUBSTEP_4_4.stories.length).toBeGreaterThanOrEqual(2);
    for (const st of SUBSTEP_4_4.stories) expect(st.questions.length, st.title).toBeGreaterThanOrEqual(2);
    const cards = cardMap(CARDS);
    for (const w of SUBSTEP_4_4.words) for (const p of w.parts) expect(cards.get(p.card), w.text).toBeDefined();
  });

  it('practises more than one silent-e vowel, since all of them are already taught', () => {
    const cards = cardMap(CARDS);
    const vowels = new Set(
      SUBSTEP_4_4.words.flatMap((w) => w.parts.filter((p) => cards.get(p.card)?.type === 'vce').map((p) => p.card)),
    );
    expect(vowels.size).toBeGreaterThanOrEqual(3);
  });

  it('never asks a story question whose right answer sits anywhere but index 0', () => {
    for (const st of SUBSTEP_4_4.stories) {
      for (const q of st.questions) expect(q.answer, `${st.title}: ${q.prompt}`).toBe(0);
    }
  });

  it('puts one sentence in each story element, so the story screen shows one at a time', () => {
    for (const st of SUBSTEP_4_4.stories) {
      for (const line of st.sentences) {
        expect(line.replace(/[.!?]+["']?\s*$/, ''), `${st.title}: ${line}`).not.toMatch(/[.!?]["']?\s/);
      }
    }
  });

  it('keeps plurals, suffixes and the program name out of the section', () => {
    const json = JSON.stringify(SUBSTEP_4_4);
    expect(json.toLowerCase()).not.toContain('wilson');
    for (const w of SUBSTEP_4_4.words) {
      expect(w.text.endsWith('s'), w.text).toBe(false);
      expect(w.text.endsWith('ed'), w.text).toBe(false);
      expect(w.text.endsWith('ing'), w.text).toBe(false);
    }
  });

  it('never puts a schwa on a consonant in a spoken lesson line', () => {
    for (const g of SUBSTEP_4_4.groups) {
      for (const step of g.lesson) {
        if ('say' in step) expect(step.say).not.toMatch(/\b[a-z]uh\b/i);
      }
    }
  });

  it('draws every answer choice from its own story', () => {
    for (const st of SUBSTEP_4_4.stories) {
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
    for (const st of SUBSTEP_4_4.stories) {
      for (const text of [st.title, ...st.questions.flatMap((q) => q.choices)]) {
        for (const token of tokenize(text)) {
          expect(taught.has(token), `"${text}" uses "${token}", which no section has taught`).toBe(true);
        }
      }
    }
  });

  it('keeps a proper noun spelled the way a child should see it', () => {
    for (const w of SUBSTEP_4_4.words) {
      if (w.text[0] === w.text[0].toUpperCase()) {
        expect(w.parts.map((p) => p.grapheme).join(''), w.text).toBe(w.text.toLowerCase());
      }
    }
  });
});
