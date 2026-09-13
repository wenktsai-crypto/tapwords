import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { word } from '../../src/content/build';
import { cardMap, cardDisplay, isDrillable, silentPartners, soundingIndexes, syllableOf } from '../../src/content/parts';

const cards = cardMap(CARDS);
const cake = word('cake', 'c,a:a_e,k,e:e_silent');
const invite = word('invite', 'i,n,v,i:i_e,t,e:e_silent', { syllables: [2] });

describe('word parts', () => {
  it('pairs a silent letter with the vowel it works on', () => {
    expect(silentPartners(cake, cards)).toEqual([{ vowel: 1, silent: 3 }]);
  });

  it('pairs within a syllable, not across one', () => {
    expect(silentPartners(invite, cards)).toEqual([{ vowel: 3, silent: 5 }]);
    expect(syllableOf(invite, 0)).toBe(0);
    expect(syllableOf(invite, 3)).toBe(1);
  });

  it('leaves a silent letter unpaired when no vowel-consonant-e vowel precedes it', () => {
    const bad = word('ake', 'a,k,e:e_silent');
    expect(silentPartners(bad, cards)).toEqual([]);
  });

  it('counts only the parts that make a sound', () => {
    expect(soundingIndexes(cake, cards)).toEqual([0, 1, 2]);
    expect(soundingIndexes(word('map', 'm,a,p'), cards)).toEqual([0, 1, 2]);
  });

  it('shows a silent-e vowel as the a_e pattern on its sound card, and as a bare letter in a word', () => {
    const aE = CARDS.find((c) => c.id === 'a_e')!;
    expect(aE.grapheme).toBe('a');
    expect(cardDisplay(aE)).toBe('a_e');
    expect(cardDisplay(CARDS.find((c) => c.id === 'm')!)).toBe('m');
  });

  it('keeps the silent e and the second u_e sound out of the card drill', () => {
    expect(isDrillable(CARDS.find((c) => c.id === 'e_silent')!)).toBe(false);
    expect(isDrillable(CARDS.find((c) => c.id === 'u_e_oo')!)).toBe(false);
    expect(isDrillable(CARDS.find((c) => c.id === 'a_e')!)).toBe(true);
    expect(isDrillable(CARDS.find((c) => c.id === 'm')!)).toBe(true);
  });
});
