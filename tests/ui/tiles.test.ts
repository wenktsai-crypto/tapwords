import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { cardTypeFor } from '../../src/ui/tiles';

/** `cardTypeFor` is what colours a tile in the two places that have nothing but a letter on hand:
 * a lesson's `show` step and the tile tray. A lesson's `show` step names a card by its *drill face*
 * ("a_e"), not by its grapheme ("a"), so looking cards up by grapheme alone missed every silent-e
 * card and coloured it as a consonant in the very lesson that introduces it. */
describe('cardTypeFor', () => {
  it('colours a silent-e card as a vowel-consonant-e card, not a consonant', () => {
    for (const face of ['a_e', 'i_e', 'o_e', 'u_e', 'e_e']) {
      expect(cardTypeFor(CARDS, face), face).toBe('vce');
    }
  });

  it('still resolves a plain vowel to the plain vowel card, not to the vce card built on it', () => {
    // Every vce card has a plain vowel as its *grapheme*, so a lookup that also matches on
    // `display` must not let "a" fall through to the a_e card. The plain cards come first in
    // CARDS, and `.find` returns the first match, which is what keeps this true.
    for (const letter of ['a', 'e', 'i', 'o', 'u']) {
      expect(cardTypeFor(CARDS, letter), letter).toBe('vowel');
    }
  });

  it('puts every plain vowel card ahead of the vce card that shares its grapheme', () => {
    // The guard above holds only because of this ordering, so assert the ordering itself —
    // otherwise a future reshuffle of CARDS would break the colours with both tests green.
    for (const letter of ['a', 'e', 'i', 'o', 'u']) {
      const plain = CARDS.findIndex((c) => c.id === letter);
      const firstOther = CARDS.findIndex((c) => c.id !== letter && (c.grapheme === letter || c.display === letter));
      expect(plain, letter).toBeGreaterThanOrEqual(0);
      if (firstOther >= 0) expect(plain, letter).toBeLessThan(firstOther);
    }
  });

  it('leaves the other card types alone', () => {
    expect(cardTypeFor(CARDS, 'sh')).toBe('digraph');
    expect(cardTypeFor(CARDS, 'an')).toBe('welded');
    expect(cardTypeFor(CARDS, 'f')).toBe('consonant');
    // A letter with no card of its own is still sorted the old way.
    expect(cardTypeFor(CARDS, 'q')).toBe('consonant');
  });
});
