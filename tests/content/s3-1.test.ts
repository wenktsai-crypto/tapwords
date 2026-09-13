import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent } from '../../src/content/check';
import { SUBSTEP_1_1 } from '../../src/content/substeps/s1-1';
import { SUBSTEP_1_2 } from '../../src/content/substeps/s1-2';
import { SUBSTEP_1_3 } from '../../src/content/substeps/s1-3';
import { SUBSTEP_1_4 } from '../../src/content/substeps/s1-4';
import { SUBSTEP_1_5 } from '../../src/content/substeps/s1-5';
import { SUBSTEP_3_1 } from '../../src/content/substeps/s3-1';
import type { Content } from '../../src/content/types';

const content: Content = {
  cards: CARDS,
  substeps: [SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5, SUBSTEP_3_1],
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
});
