import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent, tokenize } from '../../src/content/check';
import { cardMap, silentPartners, syllableOf } from '../../src/content/parts';
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
import { SUBSTEP_4_5 } from '../../src/content/substeps/s4-5';
import type { Content } from '../../src/content/types';

// 4.4 is being written by another author at the same time, so it is not in this fixture. The
// checker runs over the sections this one actually depends on: everything up to 4.3, then 4.5.
const content: Content = {
  cards: CARDS,
  substeps: [
    SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5, SUBSTEP_1_6,
    SUBSTEP_2_1, SUBSTEP_2_2, SUBSTEP_2_3, SUBSTEP_2_4, SUBSTEP_2_5,
    SUBSTEP_3_1, SUBSTEP_3_2, SUBSTEP_3_3, SUBSTEP_3_4, SUBSTEP_3_5,
    SUBSTEP_4_1, SUBSTEP_4_2, SUBSTEP_4_3, SUBSTEP_4_5,
  ],
};

describe('substep 4.5 content', () => {
  it('passes the content checker at production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });

  it('gives every real word a syllable split, with the silent e inside one syllable', () => {
    const cards = cardMap(CARDS);
    for (const w of SUBSTEP_4_5.words.filter((w) => w.kind === 'real')) {
      expect(w.syllables?.length ?? 0, w.text).toBeGreaterThanOrEqual(1);
      const pairs = silentPartners(w, cards);
      expect(pairs.length, w.text).toBe(1);
      expect(syllableOf(w, pairs[0].vowel), w.text).toBe(syllableOf(w, pairs[0].silent));
    }
  });

  it('gives every nonsense word a two-syllable split too, so the pattern is the same', () => {
    const cards = cardMap(CARDS);
    for (const w of SUBSTEP_4_5.words.filter((w) => w.kind === 'nonsense')) {
      expect(w.syllables?.length, w.text).toBe(1);
      const pairs = silentPartners(w, cards);
      expect(pairs.length, w.text).toBe(1);
      expect(syllableOf(w, pairs[0].vowel), w.text).toBe(syllableOf(w, pairs[0].silent));
    }
  });

  it('ends every word with the silent e, and never opens a first syllable', () => {
    const cards = cardMap(CARDS);
    for (const w of SUBSTEP_4_5.words) {
      expect(w.parts[w.parts.length - 1].card, w.text).toBe('e_silent');
      // Exactly one vowel-consonant-e vowel: two would be two silent-e syllables in one word,
      // which this section does not teach.
      expect(w.parts.filter((p) => cards.get(p.card)?.type === 'vce').length, w.text).toBe(1);
      // The first syllable ends on a consonant. An open first syllable (e-lect) is Book 5.
      const firstNewSyllable = w.syllables![0];
      const lastOfFirst = cards.get(w.parts[firstNewSyllable - 1].card);
      expect(lastOfFirst?.type, w.text).not.toBe('vowel');
      expect(lastOfFirst?.type, w.text).not.toBe('vce');
    }
  });

  it('introduces no new card, because the pattern is already known', () => {
    expect(SUBSTEP_4_5.groups.map((g) => g.cards)).toEqual([[]]);
    expect(SUBSTEP_4_5.concepts).toEqual([]);
  });

  it("hits this section's content targets", () => {
    const real = SUBSTEP_4_5.words.filter((w) => w.kind === 'real');
    const cards = cardMap(CARDS);
    expect(real.length).toBeGreaterThanOrEqual(30);
    expect(SUBSTEP_4_5.words.filter((w) => w.kind === 'nonsense').length).toBeGreaterThanOrEqual(15);
    expect(SUBSTEP_4_5.sentences.length).toBeGreaterThanOrEqual(12);
    expect(SUBSTEP_4_5.stories.length).toBeGreaterThanOrEqual(2);
    for (const st of SUBSTEP_4_5.stories) expect(st.questions.length, st.title).toBeGreaterThanOrEqual(2);
    for (const w of SUBSTEP_4_5.words) for (const p of w.parts) expect(cards.get(p.card), w.text).toBeDefined();
  });

  it('never asks a story question whose right answer sits anywhere but index 0', () => {
    for (const st of SUBSTEP_4_5.stories) {
      for (const q of st.questions) expect(q.answer, `${st.title}: ${q.prompt}`).toBe(0);
    }
  });

  it('puts one sentence in each story element, so the story screen shows one at a time', () => {
    for (const st of SUBSTEP_4_5.stories) {
      for (const line of st.sentences) {
        expect(line.replace(/[.!?]+["']?\s*$/, ''), `${st.title}: ${line}`).not.toMatch(/[.!?]["']?\s/);
      }
    }
  });

  it('keeps plurals, suffixes and the program name out of the section', () => {
    const json = JSON.stringify(SUBSTEP_4_5);
    expect(json.toLowerCase()).not.toContain('wilson');
    for (const w of SUBSTEP_4_5.words) {
      expect(w.text.endsWith('s'), w.text).toBe(false);
      expect(w.text.endsWith('ed'), w.text).toBe(false);
      expect(w.text.endsWith('ing'), w.text).toBe(false);
    }
  });

  it('draws every answer choice from its own story', () => {
    for (const st of SUBSTEP_4_5.stories) {
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
    for (const st of SUBSTEP_4_5.stories) {
      for (const text of [st.title, ...st.questions.flatMap((q) => q.choices)]) {
        for (const token of tokenize(text)) {
          expect(taught.has(token), `"${text}" uses "${token}", which no section has taught`).toBe(true);
        }
      }
    }
  });

  it('spells a proper noun the way a child should see it', () => {
    for (const w of SUBSTEP_4_5.words) {
      if (w.text[0] === w.text[0].toUpperCase()) {
        expect(w.parts.map((p) => p.grapheme).join(''), w.text).toBe(w.text.toLowerCase());
      }
    }
  });
});
