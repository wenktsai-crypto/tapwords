import { describe, it, expect } from 'vitest';
import { CONTENT } from '../../src/content';
import { checkContent, MIN, tokenize } from '../../src/content/check';
import { word, nonsense } from '../../src/content/build';
import type { Substep, Word } from '../../src/content/types';
import { usableSentences, usableStories } from '../../src/engine/session';

describe('the whole program', () => {
  it('has the twenty-two substeps in teaching order', () => {
    expect(CONTENT.substeps.map((s) => s.id)).toEqual([
      '1.1', '1.2', '1.3', '1.4', '1.5', '1.6',
      '2.1', '2.2', '2.3', '2.4', '2.5',
      '3.1', '3.2', '3.3', '3.4', '3.5',
      '4.1', '4.2', '4.3', '4.4', '4.5', '4.6',
    ]);
  });

  it('passes the content checker at production minimums', () => {
    expect(checkContent(CONTENT, MIN)).toEqual([]);
  });

  it('introduces every card in exactly one substep group', () => {
    const seen = new Map<string, number>();
    for (const s of CONTENT.substeps) for (const g of s.groups) for (const c of g.cards) seen.set(c, (seen.get(c) ?? 0) + 1);
    for (const card of CONTENT.cards) expect(seen.get(card.id), `card ${card.id}`).toBe(1);
  });

  it('gives every substep and group a story of its own that the child can already read', () => {
    for (const s of CONTENT.substeps) {
      for (let g = 0; g < s.groups.length; g++) {
        const own = usableStories(CONTENT, s.id, g).filter((st) => st.substep === s.id);
        expect(own.length, `${s.id} group ${g}`).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('gives every substep and group at least two readable sentences of its own', () => {
    for (const s of CONTENT.substeps) {
      for (let g = 0; g < s.groups.length; g++) {
        const own = usableSentences(CONTENT, s.id, g).filter((t) => t.substep === s.id);
        expect(own.length, `${s.id} group ${g}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('never shows more than eight letter tiles at once in a lesson', () => {
    for (const s of CONTENT.substeps) {
      for (const g of s.groups) {
        for (const step of g.lesson) {
          if ('show' in step) expect(step.show.length, `${s.id} ${step.show.join('')}`).toBeLessThanOrEqual(8);
        }
      }
    }
  });

  it('refuses a nonsense word with no syllable break beside real words of the same length that have one', () => {
    // The real program is covered by the checker run above; this proves the rule actually bites,
    // because a guard nobody has watched fail proves nothing. Sections 3.2 and 3.5 shipped all 42
    // of their nonsense words with no gap while every real word beside them had one.
    const split = word('napsit', 'n,a,p,s,i,t', { syllables: [3] });
    const bad = nonsense('tavlop', 't,a,v,l,o,p');
    const good = nonsense('tavlop', 't,a,v,l,o,p', { syllables: [3] });
    const substep = (words: Word[]): Substep => ({
      id: 'x.1', title: 'x', parentSummary: 'x',
      groups: [{ cards: ['n', 'a', 'p', 's', 'i', 't', 'v', 'l', 'o'], lesson: [] }],
      concepts: [], sightWords: [], words, sentences: [], stories: [],
    });
    const min = { real: 0, nonsense: 0, sentences: 0, stories: 0, questions: 0 };
    const errs = checkContent({ cards: CONTENT.cards, substeps: [substep([split, bad])] }, min);
    expect(errs.some((e) => e.includes('"tavlop"') && e.includes('no syllables'))).toBe(true);
    expect(checkContent({ cards: CONTENT.cards, substeps: [substep([split, good])] }, min)).toEqual([]);
  });

  it('never mentions the Wilson name', () => {
    const text = JSON.stringify(CONTENT).toLowerCase();
    expect(text.includes('wilson')).toBe(false);
  });
});
