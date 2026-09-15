import type { Card, CardType } from '../content/types';

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

export function cardTypeFor(cards: Card[], grapheme: string): CardType {
  // A lesson's `show` step names a card by its drill face ("a_e"), which is the card's `display`,
  // not its `grapheme` ("a") — so match either. Order matters and is guarded by a test: the plain
  // vowel cards come first in CARDS, so a bare "a" still resolves to the plain a card and not to
  // the a_e card built on the same grapheme.
  const card = cards.find((c) => c.grapheme === grapheme || c.display === grapheme);
  if (card) return card.type;
  if (VOWELS.has(grapheme)) return 'vowel';
  return 'consonant';
}

/** A letter can belong to more than one card — short e and silent e are both "e" — so anywhere a
 * word's part is on screen, the card id is the only correct key. `cardTypeFor` stays for the two
 * places that genuinely have nothing but a letter: the tile tray and a lesson's `show` step. */
export function cardTypeById(cards: Card[], id: string): CardType {
  return cards.find((c) => c.id === id)?.type ?? 'consonant';
}
