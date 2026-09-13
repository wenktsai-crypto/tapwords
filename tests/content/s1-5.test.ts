import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent } from '../../src/content/check';
import { SUBSTEP_1_1 } from '../../src/content/substeps/s1-1';
import { SUBSTEP_1_2 } from '../../src/content/substeps/s1-2';
import { SUBSTEP_1_5 } from '../../src/content/substeps/s1-5';
import type { Content } from '../../src/content/types';

const content: Content = { cards: CARDS, substeps: [SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_5] };

describe('substep 1.5 content', () => {
  it('passes the content checker at production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });

  it('ends every real word in the welded am or an', () => {
    for (const w of SUBSTEP_1_5.words.filter((w) => w.kind === 'real')) {
      expect(['am', 'an'], w.text).toContain(w.parts[w.parts.length - 1].grapheme);
    }
  });
});
