import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent } from '../../src/content/check';
import { SUBSTEP_1_1 } from '../../src/content/substeps/s1-1';
import { SUBSTEP_1_2 } from '../../src/content/substeps/s1-2';
import { SUBSTEP_1_4 } from '../../src/content/substeps/s1-4';
import type { Content } from '../../src/content/types';

const content: Content = { cards: CARDS, substeps: [SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_4] };

describe('substep 1.4 content', () => {
  it('passes the content checker with production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });

  it('uses a doubled letter or all in every real word', () => {
    for (const w of SUBSTEP_1_4.words.filter((w) => w.kind === 'real')) {
      expect(w.parts.some((p) => ['ff', 'll', 'ss', 'zz', 'all'].includes(p.grapheme)), w.text).toBe(true);
    }
    expect(SUBSTEP_1_4.concepts).toContain('doubling');
  });
});
