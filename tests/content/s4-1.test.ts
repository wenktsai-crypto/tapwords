import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { checkContent, tokenize } from '../../src/content/check';
import { cardMap } from '../../src/content/parts';
import { usableSentences, usableStories } from '../../src/engine/session';
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
import { SUBSTEP_3_5 } from '../../src/content/substeps/s3-5';
import { SUBSTEP_4_1 } from '../../src/content/substeps/s4-1';
import type { Content } from '../../src/content/types';

const content: Content = {
  cards: CARDS,
  substeps: [
    SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5, SUBSTEP_1_6,
    SUBSTEP_2_1, SUBSTEP_2_2, SUBSTEP_2_3, SUBSTEP_2_4, SUBSTEP_2_5,
    SUBSTEP_3_1, SUBSTEP_3_2, SUBSTEP_3_3, SUBSTEP_3_4, SUBSTEP_3_5,
    SUBSTEP_4_1,
  ],
};

describe('substep 4.1 content', () => {
  it('passes the content checker at production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });

  it('ends every real word with a silent e that is doing a job', () => {
    const cards = cardMap(CARDS);
    for (const w of SUBSTEP_4_1.words) {
      expect(w.parts[w.parts.length - 1].card, w.text).toBe('e_silent');
      expect(w.parts.filter((p) => cards.get(p.card)?.type === 'vce').length, w.text).toBe(1);
    }
  });

  it('teaches a before i, and keeps them in separate groups', () => {
    expect(SUBSTEP_4_1.groups.map((g) => g.cards)).toEqual([['a_e', 'e_silent'], ['i_e']]);
  });

  it('hits this section\'s content targets, not just the checker floor', () => {
    const real = SUBSTEP_4_1.words.filter((w) => w.kind === 'real');
    const cards = cardMap(CARDS);
    const usingCard = (id: string) => real.filter((w) => w.parts.some((p) => p.card === id)).length;
    expect(real.length).toBeGreaterThanOrEqual(30);
    expect(usingCard('a_e')).toBeGreaterThanOrEqual(16);
    expect(usingCard('i_e')).toBeGreaterThanOrEqual(16);
    expect(SUBSTEP_4_1.words.filter((w) => w.kind === 'nonsense').length).toBeGreaterThanOrEqual(15);
    expect(SUBSTEP_4_1.sentences.length).toBeGreaterThanOrEqual(12);
    expect(SUBSTEP_4_1.stories.length).toBeGreaterThanOrEqual(2);
    for (const st of SUBSTEP_4_1.stories) expect(st.questions.length, st.title).toBeGreaterThanOrEqual(2);
    // every part is either a card taught by this section or one taught earlier; no silent letter
    // ever stands alone, which cardMap would report as undefined
    for (const w of SUBSTEP_4_1.words) for (const p of w.parts) expect(cards.get(p.card), w.text).toBeDefined();
  });

  it('never asks a story question whose right answer sits anywhere but index 0', () => {
    for (const st of SUBSTEP_4_1.stories) {
      for (const q of st.questions) expect(q.answer, `${st.title}: ${q.prompt}`).toBe(0);
    }
  });

  it('gives group 1 a story and two sentences that use no i_e word', () => {
    const iWords = new Set(
      SUBSTEP_4_1.words.filter((w) => w.parts.some((p) => p.card === 'i_e')).map((w) => w.text.toLowerCase()),
    );
    expect(iWords.size).toBeGreaterThan(0);

    const sentences = usableSentences(content, '4.1', 0).filter((s) => s.substep === '4.1');
    const stories = usableStories(content, '4.1', 0).filter((s) => s.substep === '4.1');
    expect(sentences.length).toBeGreaterThanOrEqual(2);
    expect(stories.length).toBeGreaterThanOrEqual(1);

    const texts = [
      ...sentences.map((s) => s.text),
      ...stories.flatMap((s) => [s.story.title, ...s.story.sentences, ...s.story.questions.flatMap((q) => q.choices)]),
    ];
    for (const text of texts) {
      for (const token of tokenize(text)) {
        expect(iWords.has(token), `group 1 text "${text}" uses the i_e word "${token}"`).toBe(false);
      }
    }
  });

  it('keeps plurals and the program name out of the section', () => {
    const json = JSON.stringify(SUBSTEP_4_1);
    expect(json.toLowerCase()).not.toContain('wilson');
    for (const w of SUBSTEP_4_1.words) expect(w.text.endsWith('s'), w.text).toBe(false);
  });
});
