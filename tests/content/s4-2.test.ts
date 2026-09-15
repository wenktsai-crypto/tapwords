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
import { SUBSTEP_4_2 } from '../../src/content/substeps/s4-2';
import type { Content } from '../../src/content/types';

const content: Content = {
  cards: CARDS,
  substeps: [
    SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5, SUBSTEP_1_6,
    SUBSTEP_2_1, SUBSTEP_2_2, SUBSTEP_2_3, SUBSTEP_2_4, SUBSTEP_2_5,
    SUBSTEP_3_1, SUBSTEP_3_2, SUBSTEP_3_3, SUBSTEP_3_4, SUBSTEP_3_5,
    SUBSTEP_4_1, SUBSTEP_4_2,
  ],
};

describe('substep 4.2 content', () => {
  it('passes the content checker at production minimums', () => {
    expect(checkContent(content)).toEqual([]);
  });

  it('uses only the o and u silent-e vowels', () => {
    for (const w of SUBSTEP_4_2.words) {
      const vowel = w.parts.find((p) => p.card.endsWith('_e') && p.card !== 'e_silent');
      expect(['o_e', 'u_e'], w.text).toContain(vowel?.card);
    }
  });

  it('teaches o before u, and keeps them in separate groups', () => {
    expect(SUBSTEP_4_2.groups.map((g) => g.cards)).toEqual([['o_e'], ['u_e']]);
  });

  it('ends every word with a silent e that is doing a job', () => {
    const cards = cardMap(CARDS);
    for (const w of SUBSTEP_4_2.words) {
      expect(w.parts[w.parts.length - 1].card, w.text).toBe('e_silent');
      expect(w.parts.filter((p) => cards.get(p.card)?.type === 'vce').length, w.text).toBe(1);
    }
  });

  it("hits this section's content targets, not just the checker floor", () => {
    const real = SUBSTEP_4_2.words.filter((w) => w.kind === 'real');
    const cards = cardMap(CARDS);
    const usingCard = (id: string) => real.filter((w) => w.parts.some((p) => p.card === id)).length;
    expect(real.length).toBeGreaterThanOrEqual(30);
    // o_e carries the count: the u_e card taught here says /yoo/ only, and the short list of
    // real words that say /yoo/ without an untaught sound is mule, cube, cute, mute, fume.
    expect(usingCard('o_e')).toBeGreaterThanOrEqual(25);
    expect(usingCard('u_e')).toBeGreaterThanOrEqual(5);
    expect(SUBSTEP_4_2.words.filter((w) => w.kind === 'nonsense').length).toBeGreaterThanOrEqual(15);
    expect(SUBSTEP_4_2.sentences.length).toBeGreaterThanOrEqual(12);
    expect(SUBSTEP_4_2.stories.length).toBeGreaterThanOrEqual(2);
    for (const st of SUBSTEP_4_2.stories) expect(st.questions.length, st.title).toBeGreaterThanOrEqual(2);
    for (const w of SUBSTEP_4_2.words) for (const p of w.parts) expect(cards.get(p.card), w.text).toBeDefined();
  });

  it('never asks a story question whose right answer sits anywhere but index 0', () => {
    for (const st of SUBSTEP_4_2.stories) {
      for (const q of st.questions) expect(q.answer, `${st.title}: ${q.prompt}`).toBe(0);
    }
  });

  it('gives group 1 a story and two sentences that use no u_e word', () => {
    const uWords = new Set(
      SUBSTEP_4_2.words.filter((w) => w.parts.some((p) => p.card === 'u_e')).map((w) => w.text.toLowerCase()),
    );
    expect(uWords.size).toBeGreaterThan(0);

    const sentences = usableSentences(content, '4.2', 0).filter((s) => s.substep === '4.2');
    const stories = usableStories(content, '4.2', 0).filter((s) => s.substep === '4.2');
    expect(sentences.length).toBeGreaterThanOrEqual(2);
    expect(stories.length).toBeGreaterThanOrEqual(1);

    const texts = [
      ...sentences.map((s) => s.text),
      ...stories.flatMap((s) => [s.story.title, ...s.story.sentences, ...s.story.questions.flatMap((q) => q.choices)]),
    ];
    for (const text of texts) {
      for (const token of tokenize(text)) {
        expect(uWords.has(token), `group 1 text "${text}" uses the u_e word "${token}"`).toBe(false);
      }
    }
  });

  it('gives group 2 a story of its own that group 1 cannot yet read', () => {
    const atGroup1 = usableStories(content, '4.2', 0).filter((s) => s.substep === '4.2').length;
    const atGroup2 = usableStories(content, '4.2', 1).filter((s) => s.substep === '4.2').length;
    expect(atGroup2).toBeGreaterThan(atGroup1);
  });

  it('puts one sentence in each story element, so the story screen shows one at a time', () => {
    for (const st of SUBSTEP_4_2.stories) {
      for (const line of st.sentences) {
        expect(line.replace(/[.!?]+["']?\s*$/, ''), `${st.title}: ${line}`).not.toMatch(/[.!?]["']?\s/);
      }
    }
  });

  it('keeps plurals, suffixes and the program name out of the section', () => {
    const json = JSON.stringify(SUBSTEP_4_2);
    expect(json.toLowerCase()).not.toContain('wilson');
    for (const w of SUBSTEP_4_2.words) {
      expect(w.text.endsWith('s'), w.text).toBe(false);
      expect(w.text.endsWith('ed'), w.text).toBe(false);
      expect(w.text.endsWith('ing'), w.text).toBe(false);
    }
  });

  it('draws every answer choice from its own story', () => {
    for (const st of SUBSTEP_4_2.stories) {
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
});
