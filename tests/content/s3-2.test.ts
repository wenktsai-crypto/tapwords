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
import type { Content } from '../../src/content/types';

const content: Content = {
  cards: CARDS,
  substeps: [
    SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5, SUBSTEP_1_6,
    SUBSTEP_2_1, SUBSTEP_2_2, SUBSTEP_2_3, SUBSTEP_2_4, SUBSTEP_2_5,
    SUBSTEP_3_1, SUBSTEP_3_2,
  ],
};

describe('substep 3.2 content', () => {
  it('passes the content checker at production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });

  it('splits every word, made-up ones included, into two closed syllables with a blend, and never ends in "ct"', () => {
    // Nonsense words are the purest decoding test, so they need the syllable gap at least as
    // much as the real words beside them. All 20 of this section's shipped without one.
    const byId = new Map(CARDS.map((c) => [c.id, c]));
    for (const w of SUBSTEP_3_2.words) {
      expect(w.syllables, w.text).toBeDefined();
      expect(w.syllables!.length, w.text).toBe(1);

      const boundary = w.syllables![0];
      const syllables = [w.parts.slice(0, boundary), w.parts.slice(boundary)];

      // Closed, both halves: Book 3 pulls a consonant left rather than leave a first syllable
      // open, because an open syllable would make the vowel say its name (R21).
      for (const syllable of syllables) {
        const last = syllable[syllable.length - 1];
        expect(byId.get(last.card)?.type, `${w.text}: syllable ending "${last.grapheme}"`).not.toBe('vowel');
      }

      const hasBlend = syllables.some((syllable) => {
        const vowelIndex = syllable.findIndex((p) => 'aeiou'.includes(p.grapheme[0]) || p.card === 'am' || p.card === 'an');
        const onset = vowelIndex === -1 ? syllable.length : vowelIndex;
        const coda = vowelIndex === -1 ? 0 : syllable.length - vowelIndex - 1;
        return onset >= 2 || coda >= 2;
      });
      expect(hasBlend, w.text).toBe(true);

      expect(w.text.endsWith('ct'), w.text).toBe(false);
    }
  });

  it('has enough to read for a child who stays here a few weeks', () => {
    expect(SUBSTEP_3_2.words.filter((w) => w.kind === 'real').length).toBeGreaterThanOrEqual(35);
    expect(SUBSTEP_3_2.words.filter((w) => w.kind === 'nonsense').length).toBeGreaterThanOrEqual(20);
    expect(SUBSTEP_3_2.sentences.length).toBeGreaterThanOrEqual(18);
    expect(SUBSTEP_3_2.stories.length).toBeGreaterThanOrEqual(4);
    for (const st of SUBSTEP_3_2.stories) expect(st.questions.length, st.title).toBeGreaterThanOrEqual(2);
  });

  it('draws every answer choice from its own story', () => {
    // A wrong answer chosen because it is absent from the story teaches the child that skimming
    // works. Two of story 1's used to offer a blanket where the question asked about a pumpkin.
    for (const st of SUBSTEP_3_2.stories) {
      const inStory = new Set(st.sentences.flatMap((s) => tokenize(s)));
      for (const q of st.questions) {
        for (const choice of q.choices) {
          for (const token of tokenize(choice)) {
            expect(inStory.has(token), `${st.title}: choice "${choice}" uses "${token}", absent from the story`).toBe(true);
          }
        }
      }
    }
  });

  it("has retired the words that are not worth a ten-year-old's time", () => {
    const texts = new Set(SUBSTEP_3_2.words.map((w) => w.text.toLowerCase()));
    for (const gone of ['complex', 'insult', 'husband', 'absent', 'vat', 'cam', 'sham', 'rind', 'volt']) expect(texts.has(gone), gone).toBe(false);
  });
});
