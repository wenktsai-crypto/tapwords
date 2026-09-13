import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent } from '../../src/content/check';
import { SUBSTEP_1_1 } from '../../src/content/substeps/s1-1';
import { SUBSTEP_1_2 } from '../../src/content/substeps/s1-2';
import { SUBSTEP_1_3 } from '../../src/content/substeps/s1-3';
import { SUBSTEP_1_4 } from '../../src/content/substeps/s1-4';
import { SUBSTEP_1_5 } from '../../src/content/substeps/s1-5';
import { SUBSTEP_2_4 } from '../../src/content/substeps/s2-4';
import type { Content } from '../../src/content/types';

const content: Content = {
  cards: CARDS,
  substeps: [SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5, SUBSTEP_2_4],
};

describe('substep 2.4 content', () => {
  it('passes the content checker at production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });

  it('gives every word exactly five tapped sounds', () => {
    for (const w of SUBSTEP_2_4.words) {
      expect(w.parts.length, w.text).toBe(5);
    }
  });
});
