import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent } from '../../src/content/check';
import { SUBSTEP_1_1 } from '../../src/content/substeps/s1-1';
import { SUBSTEP_1_2 } from '../../src/content/substeps/s1-2';
import { SUBSTEP_1_3 } from '../../src/content/substeps/s1-3';
import { SUBSTEP_1_4 } from '../../src/content/substeps/s1-4';
import { SUBSTEP_1_5 } from '../../src/content/substeps/s1-5';
import { SUBSTEP_2_3 } from '../../src/content/substeps/s2-3';
import type { Content } from '../../src/content/types';

const content: Content = {
  cards: CARDS,
  substeps: [SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5, SUBSTEP_2_3],
};

describe('substep 2.3 content', () => {
  it('passes the content checker at production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });

  it('ends every real word in one of the five exceptions (with an optional s)', () => {
    const ends = new Set(['ild', 'ind', 'old', 'ost', 'olt']);
    for (const w of SUBSTEP_2_3.words.filter((w) => w.kind === 'real')) {
      const parts = w.parts.map((p) => p.grapheme);
      const last = parts[parts.length - 1] === 's' ? parts[parts.length - 2] : parts[parts.length - 1];
      expect(ends.has(last), w.text).toBe(true);
    }
  });
});
