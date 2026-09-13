import { describe, it, expect } from 'vitest';
import { checkContent, tokenize } from '../../src/content/check';
import { CARDS } from '../../src/content/cards';
import { cvc, cvcNonsense, word } from '../../src/content/build';
import type { Content, Substep } from '../../src/content/types';

const tiny = { real: 1, nonsense: 1, sentences: 1, stories: 1, questions: 1 };
const aQuestion = { prompt: 'q', choices: ['a', 'b', 'c'] as [string, string, string], answer: 0 as const };

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
    const s = sub({ groups: [{ cards: ['o', 'f'], lesson: [] }], words: [word('off', 'o,ff:f'), cvcNonsense('fo')], sentences: ['off'], stories: [{ title: 't', sentences: ['off'], questions: [aQuestion] }] });
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

  it('rejects a word part that names a card that does not exist', () => {
    const s = sub({ words: [word('map', 'm,a,p:zz'), cvcNonsense('mip')] });
    expect(checkContent(content(s), tiny).some((e) => e.includes('unknown card "zz"'))).toBe(true);
  });

  it('rejects a part whose grapheme is neither the card\'s grapheme nor a spelling rule', () => {
    const s = sub({ groups: [{ cards: ['m', 'a', 'p', 'q'], lesson: [{ try: 'map' }] }], words: [word('maq', 'm,a,q:p'), cvcNonsense('mip')], sentences: ['maq'], stories: [{ title: 't', sentences: ['maq'], questions: [aQuestion] }] });
    expect(checkContent(content(s), tiny).some((e) => e.includes('part "q" does not match card "p"'))).toBe(true);
  });

  it('rejects a group-1 lesson that shows a card taught in group 2, and accepts it in group 2', () => {
    const early = sub({
      groups: [
        { cards: ['m', 'a', 'p'], lesson: [{ show: ['m', 'a', 'p', 's'] }] },
        { cards: ['s', 't'], lesson: [{ try: 'map' }] },
      ],
    });
    expect(checkContent(content(early), tiny).some((e) => e.includes('shows "s"'))).toBe(true);
    const later = sub({
      groups: [
        { cards: ['m', 'a', 'p'], lesson: [] },
        { cards: ['s', 't'], lesson: [{ show: ['m', 'a', 'p', 's'] }, { try: 'map' }] },
      ],
    });
    expect(checkContent(content(later), tiny)).toEqual([]);
  });

  it('rejects a group-1 lesson that taps a word needing a group-2 card', () => {
    const s = sub({
      groups: [
        { cards: ['m', 'a', 'p'], lesson: [{ tap: 'tam' }] },
        { cards: ['s', 't'], lesson: [] },
      ],
      words: [cvc('map'), word('tam', 't,a,m'), cvcNonsense('mip')],
    });
    expect(checkContent(content(s), tiny).some((e) => e.includes('lesson word "tam"') && e.includes('"t"'))).toBe(true);
  });

  it('requires every story to have at least one question', () => {
    const s = sub({ stories: [{ title: 'Map', sentences: ['The map.'], questions: [] }] });
    expect(checkContent(content(s), tiny).some((e) => e.includes('question'))).toBe(true);
  });

  it('rejects the same word text appearing in two substeps, naming both', () => {
    const s2 = sub({ id: '1.2', groups: [{ cards: ['i'], lesson: [] }], words: [cvc('map'), cvcNonsense('sip')], sentences: ['The map.'] });
    const errors = checkContent(content(sub({}), s2), tiny);
    expect(errors.some((e) => e.includes('"map"') && e.includes('1.1') && e.includes('1.2'))).toBe(true);
  });

  it('enforces minimum counts', () => {
    const errors = checkContent(content(sub({})));
    expect(errors.some((e) => e.includes('real words'))).toBe(true);
    expect(errors.some((e) => e.includes('nonsense words'))).toBe(true);
    expect(errors.some((e) => e.includes('sentences'))).toBe(true);
  });

  it('requires a word ending in a welded sound to tap it as the welded card', () => {
    const s = sub({
      groups: [{ cards: ['m', 'a', 'p', 's', 't', 'h', 'am'], lesson: [{ try: 'map' }] }],
      words: [cvc('map'), cvcNonsense('tas'), word('ham', 'h,a,m')],
    });
    const errors = checkContent(content(s), tiny);
    expect(errors.some((e) => e.includes('"ham"') && e.includes('welded card "am"'))).toBe(true);
    const ok = sub({
      groups: [{ cards: ['m', 'a', 'p', 's', 't', 'h', 'am'], lesson: [{ try: 'map' }] }],
      words: [cvc('map'), cvcNonsense('tas'), word('ham', 'h,am')],
    });
    expect(checkContent(content(ok), tiny)).toEqual([]);
  });

  it('rejects a welded ending before its card is taught', () => {
    const errors = checkContent(content(sub({ words: [cvc('map'), cvcNonsense('tas'), word('pam', 'p,a,m')] })), tiny);
    expect(errors.some((e) => e.includes('"pam"') && e.includes('welded card "am"'))).toBe(true);
  });

  it('does not apply the welded rule to ild, ind, ost', () => {
    const s = sub({
      groups: [{ cards: ['m', 'a', 'p', 's', 't', 'o', 'l', 'c'], lesson: [{ try: 'map' }] }],
      words: [cvc('map'), cvcNonsense('tas'), cvc('cost')],
    });
    expect(checkContent(content(s), tiny)).toEqual([]);
  });

  it('validates syllable split points', () => {
    const bad = sub({ words: [cvc('map'), cvcNonsense('tas'), word('mapmat', 'm,a,p,m,a,t', { syllables: [0, 6] })] });
    const errors = checkContent(content(bad), tiny);
    expect(errors.some((e) => e.includes('"mapmat"') && e.includes('invalid syllables'))).toBe(true);
    const good = sub({ words: [cvc('map'), cvcNonsense('tas'), word('mapmat', 'm,a,p,m,a,t', { syllables: [3] })] });
    expect(checkContent(content(good), tiny)).toEqual([]);
  });
});
