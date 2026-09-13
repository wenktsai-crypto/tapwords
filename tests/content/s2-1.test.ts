import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent } from '../../src/content/check';
import { SUBSTEP_1_1 } from '../../src/content/substeps/s1-1';
import { SUBSTEP_1_2 } from '../../src/content/substeps/s1-2';
import { SUBSTEP_1_3 } from '../../src/content/substeps/s1-3';
import { SUBSTEP_1_4 } from '../../src/content/substeps/s1-4';
import { SUBSTEP_1_5 } from '../../src/content/substeps/s1-5';
import { SUBSTEP_2_1 } from '../../src/content/substeps/s2-1';
import type { Content } from '../../src/content/types';

const content: Content = {
  cards: CARDS,
  substeps: [SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5, SUBSTEP_2_1],
};

describe('substep 2.1 content', () => {
  it('passes the content checker at production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });

  it('ends every real word in a welded ng or nk sound (with an optional s)', () => {
    const welded = new Set(['ang', 'ing', 'ong', 'ung', 'ank', 'ink', 'onk', 'unk']);
    for (const w of SUBSTEP_2_1.words.filter((w) => w.kind === 'real')) {
      const parts = w.parts.map((p) => p.grapheme);
      const last = parts[parts.length - 1] === 's' ? parts[parts.length - 2] : parts[parts.length - 1];
      expect(welded.has(last), w.text).toBe(true);
    }
  });
});
