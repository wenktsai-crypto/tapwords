import type { Card, CardType } from '../content/types';

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

export function cardTypeFor(cards: Card[], grapheme: string): CardType {
  const card = cards.find((c) => c.grapheme === grapheme);
  if (card) return card.type;
  if (VOWELS.has(grapheme)) return 'vowel';
  return 'consonant';
}
