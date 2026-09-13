import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent } from '../../src/content/check';
import { SUBSTEP_1_1 } from '../../src/content/substeps/s1-1';
import { SUBSTEP_1_2 } from '../../src/content/substeps/s1-2';
import { SUBSTEP_1_3 } from '../../src/content/substeps/s1-3';
import { SUBSTEP_1_4 } from '../../src/content/substeps/s1-4';
import { SUBSTEP_1_5 } from '../../src/content/substeps/s1-5';
import { SUBSTEP_2_5 } from '../../src/content/substeps/s2-5';
import type { Content } from '../../src/content/types';

const content: Content = {
  cards: CARDS,
  substeps: [SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5, SUBSTEP_2_5],
};

describe('substep 2.5 content', () => {
  it('passes the content checker at production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });

  it('starts every real word with a three-letter blend', () => {
    const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
    for (const w of SUBSTEP_2_5.words.filter((w) => w.kind === 'real')) {
      const firstVowel = w.parts.findIndex((p) => vowels.has(p.grapheme));
      const lettersBefore = w.parts.slice(0, firstVowel).map((p) => p.grapheme).join('').length;
      expect(lettersBefore, w.text).toBeGreaterThanOrEqual(3);
      expect(w.parts.length, w.text).toBeLessThanOrEqual(7);
    }
  });
});
