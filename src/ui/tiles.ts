import type { Card, CardType } from '../content/types';

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

export function cardTypeFor(cards: Card[], grapheme: string): CardType {
  const card = cards.find((c) => c.grapheme === grapheme);
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
