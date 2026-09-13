import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent } from '../../src/content/check';
import { SUBSTEP_1_1 } from '../../src/content/substeps/s1-1';
import { SUBSTEP_1_2 } from '../../src/content/substeps/s1-2';
import { SUBSTEP_1_3 } from '../../src/content/substeps/s1-3';
import { SUBSTEP_1_4 } from '../../src/content/substeps/s1-4';
import { SUBSTEP_1_5 } from '../../src/content/substeps/s1-5';
import { SUBSTEP_2_1 } from '../../src/content/substeps/s2-1';
import { SUBSTEP_3_5 } from '../../src/content/substeps/s3-5';
import type { Content } from '../../src/content/types';

const content: Content = {
  cards: CARDS,
  substeps: [SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5, SUBSTEP_2_1, SUBSTEP_3_5],
};

describe('substep 3.5 content', () => {
  it('passes the content checker at production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });

  it('ends every real word in ed or ing, tagged with the matching suffix concept', () => {
    for (const w of SUBSTEP_3_5.words.filter((w) => w.kind === 'real')) {
      const last = w.parts[w.parts.length - 1].grapheme;
      expect(['ed', 'ing'], w.text).toContain(last);
      expect(w.concepts, w.text).toContain(last === 'ed' ? 'suffix-ed' : 'suffix-ing');
    }
  });
});
