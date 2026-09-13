import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent } from '../../src/content/check';
import { SUBSTEP_1_1 } from '../../src/content/substeps/s1-1';
import { SUBSTEP_1_2 } from '../../src/content/substeps/s1-2';
import { SUBSTEP_1_3 } from '../../src/content/substeps/s1-3';
import type { Content } from '../../src/content/types';

const content: Content = { cards: CARDS, substeps: [SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3] };
const DIGRAPHS = new Set(['sh', 'ch', 'th', 'wh', 'qu', 'ck']);

describe('substep 1.3 content', () => {
  it('passes the content checker with production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });
  it('introduces no new cards and uses a digraph in every real word', () => {
    expect(SUBSTEP_1_3.groups.flatMap((g) => g.cards)).toEqual([]);
    for (const w of SUBSTEP_1_3.words) {
      expect(w.parts.length, w.text).toBeLessThanOrEqual(3);
      if (w.kind === 'real') expect(w.parts.some((p) => DIGRAPHS.has(p.grapheme)), w.text).toBe(true);
    }
  });
});
