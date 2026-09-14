import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent } from '../../src/content/check';
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
import type { Content } from '../../src/content/types';

const content: Content = {
  cards: CARDS,
  substeps: [
    SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5, SUBSTEP_1_6,
    SUBSTEP_2_1, SUBSTEP_2_2, SUBSTEP_2_3, SUBSTEP_2_4, SUBSTEP_2_5,
    SUBSTEP_3_1,
  ],
};

describe('substep 3.1 content', () => {
  it('passes the content checker at production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });

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
});
