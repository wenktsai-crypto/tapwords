import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent, tokenize } from '../../src/content/check';
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

  it('leaves the ed and ing endings to section 3.5', () => {
    // unpacking, kickboxing and disgusting once sat in this bank. The checker let them past only
    // because their concept tag was missing: the suffix itself is taught one section later.
    for (const w of SUBSTEP_3_4.words) {
      const last = w.parts[w.parts.length - 1].card;
      expect(['ed', 'ing'].includes(last), w.text).toBe(false);
    }
    const prose = [
      ...SUBSTEP_3_4.sentences,
      ...SUBSTEP_3_4.stories.flatMap((st) => [st.title, ...st.sentences, ...st.questions.flatMap((q) => q.choices)]),
    ];
    for (const text of prose) {
      for (const t of tokenize(text)) {
        // A base of four letters or more means the ending really is a suffix, so "bed", "shed"
        // and "thing" are left alone while "unpacking" and "landed" are caught.
        const base = t.replace(/(ing|ed)$/, '');
        expect(base !== t && base.length >= 4, `${text} -> ${t}`).toBe(false);
      }
    }
  });

  it('chunks every nonsense word the way it chunks the real ones', () => {
    const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
    // Blends English keeps together at the start of a syllable. A chunk boundary inside one of
    // these forces the chunk before it open, and Book 3 teaches closed syllables only.
    const keepTogether = ['bl', 'cl', 'fl', 'gl', 'pl', 'br', 'cr', 'dr', 'fr', 'gr', 'pr', 'tr'];
    for (const w of SUBSTEP_3_4.words.filter((x) => x.kind === 'nonsense')) {
      expect(w.syllables, `${w.text} has no syllables array`).toBeDefined();
      const cuts = [0, ...w.syllables!, w.parts.length];
      for (let i = 0; i + 1 < cuts.length; i++) {
        const chunk = w.parts.slice(cuts[i], cuts[i + 1]).map((p) => p.grapheme);
        expect(vowels.has(chunk[chunk.length - 1]), `${w.text} chunk ${chunk.join('')} is open`).toBe(false);
      }
      for (const cut of w.syllables!) {
        const pair = w.parts[cut - 1].grapheme + w.parts[cut].grapheme;
        expect(keepTogether.includes(pair), `${w.text} splits the blend "${pair}"`).toBe(false);
      }
    }
  });

  it('can reach the welded sounds the child has already been taught', () => {
    const taught = new Set(content.substeps.flatMap((s) => s.groups.flatMap((g) => g.cards)));
    for (const card of ['ing', 'ank', 'ind', 'old', 'ost', 'olt']) {
      expect(taught.has(card), `fixture is missing ${card}`).toBe(true);
    }
  });
});
