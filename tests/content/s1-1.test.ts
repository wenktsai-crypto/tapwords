import { describe, it, expect } from 'vitest';
import { CONTENT } from '../../src/content';
import { checkContent } from '../../src/content/check';

describe('substep 1.1 content', () => {
  it('passes the content checker with production minimums', () => {
    expect(checkContent(CONTENT)).toEqual([]);
  });

  it('only uses 1.1 initial and final consonants by convention', () => {
    const s = CONTENT.substeps[0];
    for (const w of s.words) {
      const first = w.parts[0].card;
      const last = w.parts[w.parts.length - 1].card;
      if (w.parts.length === 3) expect(['f', 'l', 'm', 'n', 'r', 's'], w.text).toContain(first);
      expect(['d', 'g', 'p', 't'], w.text).toContain(last);
    }
  });
});
