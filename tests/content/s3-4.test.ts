import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent } from '../../src/content/check';
import { SUBSTEP_1_1 } from '../../src/content/substeps/s1-1';
import { SUBSTEP_1_2 } from '../../src/content/substeps/s1-2';
import { SUBSTEP_1_3 } from '../../src/content/substeps/s1-3';
import { SUBSTEP_1_4 } from '../../src/content/substeps/s1-4';
import { SUBSTEP_1_5 } from '../../src/content/substeps/s1-5';
import { SUBSTEP_3_4 } from '../../src/content/substeps/s3-4';
import type { Content } from '../../src/content/types';

const content: Content = {
  cards: CARDS,
  substeps: [SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5, SUBSTEP_3_4],
};

describe('substep 3.4 content', () => {
  it('passes the content checker at production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });

  it('has three or more closed syllables in every real word', () => {
    const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
    for (const w of SUBSTEP_3_4.words.filter((w) => w.kind === 'real')) {
      expect(w.syllables!.length, w.text).toBeGreaterThanOrEqual(2);
      const cuts = [0, ...w.syllables!, w.parts.length];
      for (let i = 0; i + 1 < cuts.length; i++) {
        const syl = w.parts.slice(cuts[i], cuts[i + 1]).map((p) => p.grapheme);
        const last = syl[syl.length - 1];
        const welded = ['all', 'am', 'an', 'ang', 'ing', 'ong', 'ung', 'ank', 'ink', 'onk', 'unk', 'ild', 'ind', 'old', 'ost', 'olt'].includes(last);
        expect(welded || !vowels.has(last), `${w.text} syllable ${syl.join('')} is open`).toBe(true);
      }
    }
  });
});
