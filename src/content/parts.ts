import type { Card, Word } from './types';

export function cardMap(cards: Card[]): Map<string, Card> {
  return new Map(cards.map((c) => [c.id, c]));
}

/** The sound card's own face. A silent-e vowel is written "a" inside a word but drilled as "a_e". */
export function cardDisplay(card: Card): string {
  return card.display ?? card.grapheme;
}

/** A silent letter has no sound to drill, and a second sound of a spelling that already has a
 * card would make the drill unanswerable, so neither is ever shown as a card on its own. */
export function isDrillable(card: Card): boolean {
  return card.type !== 'silent' && card.drill !== false;
}

/** Which syllable a part belongs to. Syllable 0 runs up to the first index in word.syllables. */
export function syllableOf(word: Word, index: number): number {
  return (word.syllables ?? []).filter((start) => start <= index).length;
}

/** Pairs each silent letter with the vowel it works on: the nearest vowel-consonant-e vowel
 * before it in the same syllable. A silent letter with no such vowel, or a vowel with no silent
 * partner, is a content error; check.ts reports it and the screens simply draw no arc. */
export function silentPartners(word: Word, cards: Map<string, Card>): { vowel: number; silent: number }[] {
  const typeAt = (i: number) => cards.get(word.parts[i].card)?.type;
  const out: { vowel: number; silent: number }[] = [];
  word.parts.forEach((_, i) => {
    if (typeAt(i) !== 'silent') return;
    for (let j = i - 1; j >= 0; j--) {
      if (syllableOf(word, j) !== syllableOf(word, i)) break;
      if (typeAt(j) === 'vce') {
        out.push({ vowel: j, silent: i });
        return;
      }
    }
  });
  return out;
}

/** Indexes of the parts that make a sound, in order. These are the tap dots: "cake" has three. */
export function soundingIndexes(word: Word, cards: Map<string, Card>): number[] {
  return word.parts.map((_, i) => i).filter((i) => cards.get(word.parts[i].card)?.type !== 'silent');
}
