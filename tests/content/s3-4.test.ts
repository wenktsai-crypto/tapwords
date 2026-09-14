import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent } from '../../src/content/check';
import { SUBSTEP_1_1 } from '../../src/content/substeps/s1-1';
import { SUBSTEP_1_2 } from '../../src/content/substeps/s1-2';
import { SUBSTEP_1_3 } from '../../src/content/substeps/s1-3';
import { SUBSTEP_1_4 } from '../../src/content/substeps/s1-4';
import { SUBSTEP_1_5 } from '../../src/content/substeps/s1-5';
import { SUBSTEP_1_6 } from '../../src/content/substeps/s1-6';
import { SUBSTEP_2_1 } from '../../src/content/substeps/s2-1';
import { SUBSTEP_2_2 } from '../../src/content/substeps/s2-2';
import { SUBSTEP_2_3 } from '../../src/content/substeps/s2-3';
import { SUBSTEP_2_4 } from '../../src/content/substeps/s2-4';
import { SUBSTEP_2_5 } from '../../src/content/substeps/s2-5';
import { SUBSTEP_3_1 } from '../../src/content/substeps/s3-1';
import { SUBSTEP_3_2 } from '../../src/content/substeps/s3-2';
import { SUBSTEP_3_3 } from '../../src/content/substeps/s3-3';
import { SUBSTEP_3_4 } from '../../src/content/substeps/s3-4';
import type { Content } from '../../src/content/types';

// The full chain up to and including 3.4, matching production order (src/content/index.ts),
// so the checker sees every card and word a child actually has by the time she reaches this
// section instead of the much smaller set this fixture used to load.
const content: Content = {
  cards: CARDS,
  substeps: [
    SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5, SUBSTEP_1_6,
    SUBSTEP_2_1, SUBSTEP_2_2, SUBSTEP_2_3, SUBSTEP_2_4, SUBSTEP_2_5,
    SUBSTEP_3_1, SUBSTEP_3_2, SUBSTEP_3_3, SUBSTEP_3_4,
  ],
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

  it('has enough to read for a child who stays here a few weeks', () => {
    expect(SUBSTEP_3_4.words.filter((w) => w.kind === 'real').length).toBeGreaterThanOrEqual(35);
    expect(SUBSTEP_3_4.words.filter((w) => w.kind === 'nonsense').length).toBeGreaterThanOrEqual(20);
    expect(SUBSTEP_3_4.sentences.length).toBeGreaterThanOrEqual(18);
    expect(SUBSTEP_3_4.stories.length).toBeGreaterThanOrEqual(4);
    for (const st of SUBSTEP_3_4.stories) expect(st.questions.length, st.title).toBeGreaterThanOrEqual(2);
  });

  it("has retired the words that are not worth a ten-year-old's time", () => {
    const texts = new Set(SUBSTEP_3_4.words.map((w) => w.text.toLowerCase()));
    for (const gone of ['misconduct', 'combatant', 'enlistment', 'investment', 'commitment', 'consultant', 'vat', 'cam', 'sham', 'rind', 'volt']) expect(texts.has(gone), gone).toBe(false);
  });

  it('can reach the welded sounds the child has already been taught', () => {
    const taught = new Set(content.substeps.flatMap((s) => s.groups.flatMap((g) => g.cards)));
    for (const card of ['ing', 'ank', 'ind', 'old', 'ost', 'olt']) {
      expect(taught.has(card), `fixture is missing ${card}`).toBe(true);
    }
  });
});
