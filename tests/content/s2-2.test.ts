import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent } from '../../src/content/check';
import { SUBSTEP_1_1 } from '../../src/content/substeps/s1-1';
import { SUBSTEP_1_2 } from '../../src/content/substeps/s1-2';
import { SUBSTEP_1_3 } from '../../src/content/substeps/s1-3';
import { SUBSTEP_1_4 } from '../../src/content/substeps/s1-4';
import { SUBSTEP_1_5 } from '../../src/content/substeps/s1-5';
import { SUBSTEP_2_2 } from '../../src/content/substeps/s2-2';
import type { Content } from '../../src/content/types';

const content: Content = {
  cards: CARDS,
  substeps: [SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5, SUBSTEP_2_2],
};

describe('substep 2.2 content', () => {
  it('passes the content checker at production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });

  it('taps four sounds in every word (five when an es is added)', () => {
    for (const w of SUBSTEP_2_2.words) {
      const n = w.parts.length;
      const es = w.concepts?.includes('suffix-es');
      expect(es ? n === 5 : n === 4, w.text).toBe(true);
    }
  });
});
