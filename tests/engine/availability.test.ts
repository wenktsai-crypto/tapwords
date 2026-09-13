import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { cvc, cvcNonsense } from '../../src/content/build';
import type { Content, Substep } from '../../src/content/types';
import { availableCards, availableWords, findWord, getSubstep, substepIndex } from '../../src/engine/availability';
import { seeded, shuffle } from '../../src/engine/rng';

const s11: Substep = {
  id: '1.1', title: '', parentSummary: '', concepts: [], sightWords: [], sentences: [], stories: [],
  groups: [{ cards: ['m', 'a', 'p', 's', 't'], lesson: [] }],
  words: [cvc('map'), cvc('sat'), cvcNonsense('mip')],
};
const s12: Substep = {
  id: '1.2', title: '', parentSummary: '', concepts: [], sightWords: [], sentences: [], stories: [],
  groups: [
    { cards: ['b', 'i'], lesson: [] },
    { cards: ['u', 'h'], lesson: [] },
  ],
  words: [cvc('bat'), cvc('bit'), cvc('hut'), cvc('hat')],
};
const content: Content = { cards: CARDS, substeps: [s11, s12] };

describe('availability', () => {
  it('finds substeps and their index', () => {
    expect(getSubstep(content, '1.2').id).toBe('1.2');
    expect(substepIndex(content, '1.2')).toBe(1);
    expect(() => getSubstep(content, '9.9')).toThrow();
  });

  it('lists cards through the current group only', () => {
    expect(availableCards(content, '1.1', 0)).toEqual(['m', 'a', 'p', 's', 't']);
    expect(availableCards(content, '1.2', 0)).toEqual(['m', 'a', 'p', 's', 't', 'b', 'i']);
    expect(availableCards(content, '1.2', 1)).toContain('h');
  });

  it('filters current-substep words by the cards taught so far', () => {
    const texts = (g: number) => availableWords(content, '1.2', g).map((w) => w.word.text);
    expect(texts(0)).toEqual(['map', 'sat', 'mip', 'bat', 'bit']);
    expect(texts(1)).toContain('hut');
  });

  it('tags words with their substep', () => {
    const w = availableWords(content, '1.2', 1).find((x) => x.word.text === 'map');
    expect(w?.substep).toBe('1.1');
  });

  it('findWord returns the word or throws', () => {
    expect(findWord(s11, 'map').parts.length).toBe(3);
    expect(() => findWord(s11, 'zzz')).toThrow();
  });
});

describe('rng', () => {
  it('is deterministic for a seed', () => {
    expect(shuffle([1, 2, 3, 4, 5], seeded(7))).toEqual(shuffle([1, 2, 3, 4, 5], seeded(7)));
    expect(shuffle([1, 2, 3, 4, 5], seeded(7))).not.toEqual(shuffle([1, 2, 3, 4, 5], seeded(8)));
  });
});
