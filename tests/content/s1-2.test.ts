import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent } from '../../src/content/check';
import { SUBSTEP_1_1 } from '../../src/content/substeps/s1-1';
import { SUBSTEP_1_2 } from '../../src/content/substeps/s1-2';
import { availableWords } from '../../src/engine/availability';
import { usableStories } from '../../src/engine/session';
import type { Content } from '../../src/content/types';

const content: Content = { cards: CARDS, substeps: [SUBSTEP_1_1, SUBSTEP_1_2] };

describe('substep 1.2 content', () => {
  it('passes the content checker with production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });

  it('teaches its cards in the five ordered groups', () => {
    expect(SUBSTEP_1_2.groups.map((g) => g.cards)).toEqual([
      ['b', 'sh', 'u'],
      ['h', 'j', 'c', 'k', 'ck'],
      ['e', 'v', 'w'],
      ['x', 'y', 'z'],
      ['ch', 'th', 'qu', 'wh'],
    ]);
  });

  it('has enough words and a readable story at every group', () => {
    let previousReal = 0;
    let previousNonsense = 0;
    SUBSTEP_1_2.groups.forEach((_, gi) => {
      const here = availableWords(content, '1.2', gi).filter((w) => w.substep === '1.2');
      const real = here.filter((w) => w.word.kind === 'real').length;
      const nonsense = here.filter((w) => w.word.kind === 'nonsense').length;
      expect(real - previousReal, `group ${gi + 1} real words`).toBeGreaterThanOrEqual(6);
      expect(nonsense - previousNonsense, `group ${gi + 1} nonsense words`).toBeGreaterThanOrEqual(3);
      previousReal = real;
      previousNonsense = nonsense;
      expect(usableStories(content, '1.2', gi).some((s) => s.substep === '1.2'), `group ${gi + 1} story`).toBe(true);
    });
  });

  it('keeps every word to three sounds or fewer', () => {
    for (const w of SUBSTEP_1_2.words) expect(w.parts.length, w.text).toBeLessThanOrEqual(3);
  });
});
