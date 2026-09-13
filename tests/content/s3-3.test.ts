import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent } from '../../src/content/check';
import { SUBSTEP_1_1 } from '../../src/content/substeps/s1-1';
import { SUBSTEP_1_2 } from '../../src/content/substeps/s1-2';
import { SUBSTEP_1_3 } from '../../src/content/substeps/s1-3';
import { SUBSTEP_1_4 } from '../../src/content/substeps/s1-4';
import { SUBSTEP_1_5 } from '../../src/content/substeps/s1-5';
import { SUBSTEP_3_3 } from '../../src/content/substeps/s3-3';
import type { Content } from '../../src/content/types';

const content: Content = {
  cards: CARDS,
  substeps: [SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5, SUBSTEP_3_3],
};

describe('substep 3.3 content', () => {
  it('passes the content checker at production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });

  it('ends every real word in ct, and gives valid syllables to longer words', () => {
    for (const w of SUBSTEP_3_3.words) {
      if (w.kind === 'real') {
        expect(w.text.endsWith('ct'), w.text).toBe(true);
      }
      if (w.parts.length > 5) {
        expect(w.syllables, w.text).toBeDefined();
        const syllables = w.syllables!;
        expect(syllables.length, w.text).toBeGreaterThan(0);
        syllables.forEach((x, i) => {
          expect(Number.isInteger(x), w.text).toBe(true);
          expect(x > 0 && x < w.parts.length, w.text).toBe(true);
          if (i > 0) expect(x > syllables[i - 1], w.text).toBe(true);
        });
      }
    }
  });

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
});
