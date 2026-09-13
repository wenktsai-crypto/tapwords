import type { Card, CardType } from './types';

function card(id: string, keyword: string, type: CardType, phonemeLabel?: string): Card {
  return { id, grapheme: id, keyword, type, phonemeLabel: phonemeLabel ?? `${id}, ${keyword}` };
}

export const CARDS: Card[] = [
  // Substep 1.1
  card('f', 'fun', 'consonant', 'fff'),
  card('l', 'lamp', 'consonant', 'lll'),
  card('m', 'man', 'consonant', 'mmm'),
  card('n', 'nut', 'consonant', 'nnn'),
  card('r', 'rat', 'consonant', 'rrr'),
  card('s', 'snake', 'consonant', 'sss'),
  card('d', 'dog', 'consonant'),
  card('g', 'game', 'consonant'),
  card('p', 'pan', 'consonant'),
  card('t', 'top', 'consonant'),
  card('a', 'apple', 'vowel', 'a, apple'),
  card('i', 'itch', 'vowel', 'i, itch'),
  card('o', 'octopus', 'vowel', 'o, octopus'),
  // Substep 1.2 (introduced gradually)
  card('b', 'bat', 'consonant'),
  card('sh', 'ship', 'digraph', 'shh'),
  card('u', 'up', 'vowel', 'u, up'),
  card('h', 'hat', 'consonant'),
  card('j', 'jug', 'consonant'),
  card('c', 'cat', 'consonant'),
  card('k', 'kite', 'consonant'),
  card('ck', 'sock', 'digraph'),
  card('e', 'Ed', 'vowel', 'e, Ed'),
  card('v', 'van', 'consonant', 'vvv'),
  card('w', 'wind', 'consonant'),
  card('x', 'fox', 'consonant', 'ks'),
  card('y', 'yellow', 'consonant'),
  card('z', 'zebra', 'consonant', 'zzz'),
  card('ch', 'chin', 'digraph'),
  card('th', 'thumb', 'digraph'),
  card('qu', 'queen', 'digraph', 'kw'),
  card('wh', 'whistle', 'digraph'),
  // Welded sounds, steps 1.4 to 2.3
  card('all', 'ball', 'welded'),
  card('am', 'ham', 'welded'),
  card('an', 'fan', 'welded'),
  card('ang', 'fang', 'welded'),
  card('ing', 'ring', 'welded'),
  card('ong', 'song', 'welded'),
  card('ung', 'lung', 'welded'),
  card('ank', 'bank', 'welded'),
  card('ink', 'pink', 'welded'),
  card('onk', 'honk', 'welded'),
  card('unk', 'junk', 'welded'),
  card('ild', 'wild', 'welded'),
  card('ind', 'find', 'welded'),
  card('old', 'cold', 'welded'),
  card('ost', 'most', 'welded'),
  card('olt', 'bolt', 'welded'),
];
