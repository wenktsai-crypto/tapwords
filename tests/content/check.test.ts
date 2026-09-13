import { describe, it, expect } from 'vitest';
import { checkContent, tokenize } from '../../src/content/check';
import { CARDS } from '../../src/content/cards';
import { cvc, cvcNonsense, word } from '../../src/content/build';
import type { Content, Substep } from '../../src/content/types';

const tiny = { real: 1, nonsense: 1, sentences: 1, stories: 1 };

function sub(over: Partial<Substep>): Substep {
  return {
    id: '1.1',
    title: 'Test',
    parentSummary: '',
    groups: [{ cards: ['m', 'a', 'p', 's', 't'], lesson: [{ try: 'map' }] }],
    concepts: [],
    sightWords: ['the'],
    words: [cvc('map'), cvcNonsense('tas')],
    sentences: ['The map.'],
    stories: [{ title: 'Map', sentences: ['The map.'], questions: [{ prompt: 'q', choices: ['a', 'b', 'c'], answer: 0 }] }],
    ...over,
  };
}

function content(...substeps: Substep[]): Content {
  return { cards: CARDS, substeps };
}

describe('tokenize', () => {
  it('lowercases and strips punctuation', () => {
    expect(tokenize('The rat sat, on a log!')).toEqual(['the', 'rat', 'sat', 'on', 'a', 'log']);
  });
});

describe('checkContent', () => {
  it('accepts a valid substep', () => {
    expect(checkContent(content(sub({})), tiny)).toEqual([]);
  });

  it('rejects a word using a card not yet taught', () => {
    const errors = checkContent(content(sub({ words: [cvc('map'), cvc('sit'), cvcNonsense('mip')] })), tiny);
    expect(errors.some((e) => e.includes('"sit"') && e.includes('"i"'))).toBe(true);
  });

  it('rejects parts that do not spell the word', () => {
    const errors = checkContent(content(sub({ words: [word('map', 'm,a,t'), cvcNonsense('mip')] })), tiny);
    expect(errors.some((e) => e.includes('parts spell "mat"'))).toBe(true);
  });

  it('rejects a sentence with an untaught word', () => {
    const errors = checkContent(content(sub({ sentences: ['The cat.'] })), tiny);
    expect(errors.some((e) => e.includes('"cat"'))).toBe(true);
  });

  it('rejects ff before the doubling rule is taught', () => {
    const s = sub({ groups: [{ cards: ['o', 'f'], lesson: [] }], words: [word('off', 'o,ff:f'), cvcNonsense('fo')], sentences: ['off'], stories: [{ title: 't', sentences: ['off'], questions: [] }] });
    expect(checkContent(content(s), tiny).some((e) => e.includes('doubling'))).toBe(true);
    const ok = { ...s, concepts: ['doubling'] };
    expect(checkContent(content(ok), tiny)).toEqual([]);
  });

  it('rejects a word using an untaught concept', () => {
    const s = sub({ words: [cvc('map'), word('maps', 'm,a,p,s', { concepts: ['suffix-s'] }), cvcNonsense('mip')] });
    expect(checkContent(content(s), tiny).some((e) => e.includes('suffix-s'))).toBe(true);
  });

  it('rejects a lesson step that refers to a word not in the bank', () => {
    const s = sub({ groups: [{ cards: ['m', 'a', 'p'], lesson: [{ try: 'sat' }] }] });
    expect(checkContent(content(s), tiny).some((e) => e.includes('"sat"'))).toBe(true);
  });

  it('allows a later substep to use earlier words in sentences', () => {
    const s2 = sub({ id: '1.2', groups: [{ cards: ['i'], lesson: [] }], words: [cvc('sit'), cvcNonsense('sip')], sentences: ['The map.'] });
    expect(checkContent(content(sub({}), s2), tiny)).toEqual([]);
  });

  it('enforces minimum counts', () => {
    const errors = checkContent(content(sub({})));
    expect(errors.some((e) => e.includes('real words'))).toBe(true);
    expect(errors.some((e) => e.includes('nonsense words'))).toBe(true);
    expect(errors.some((e) => e.includes('sentences'))).toBe(true);
  });
});
