import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent } from '../../src/content/check';
import { SUBSTEP_1_1 } from '../../src/content/substeps/s1-1';
import { SUBSTEP_1_2 } from '../../src/content/substeps/s1-2';
import { SUBSTEP_1_3 } from '../../src/content/substeps/s1-3';
import { SUBSTEP_1_4 } from '../../src/content/substeps/s1-4';
import { SUBSTEP_1_5 } from '../../src/content/substeps/s1-5';
import { SUBSTEP_3_1 } from '../../src/content/substeps/s3-1';
import { SUBSTEP_3_2 } from '../../src/content/substeps/s3-2';
import type { Content } from '../../src/content/types';

const content: Content = {
  cards: CARDS,
  substeps: [SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5, SUBSTEP_3_1, SUBSTEP_3_2],
};

describe('substep 3.2 content', () => {
  it('passes the content checker at production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });

  it('splits every real word into two closed syllables with a blend, and never ends in "ct"', () => {
    for (const w of SUBSTEP_3_2.words.filter((word) => word.kind === 'real')) {
      expect(w.syllables, w.text).toBeDefined();
      expect(w.syllables!.length, w.text).toBe(1);

      const boundary = w.syllables![0];
      const syllables = [w.parts.slice(0, boundary), w.parts.slice(boundary)];

      const hasBlend = syllables.some((syllable) => {
        const vowelIndex = syllable.findIndex((p) => 'aeiou'.includes(p.grapheme[0]) || p.card === 'am' || p.card === 'an');
        const onset = vowelIndex === -1 ? syllable.length : vowelIndex;
        const coda = vowelIndex === -1 ? 0 : syllable.length - vowelIndex - 1;
        return onset >= 2 || coda >= 2;
      });
      expect(hasBlend, w.text).toBe(true);

      expect(w.text.endsWith('ct'), w.text).toBe(false);
    }
  });

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
});
