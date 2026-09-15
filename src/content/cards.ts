import type { Card, CardType } from './types';

function card(id: string, keyword: string, type: CardType, phonemeLabel?: string): Card {
  return { id, grapheme: id, keyword, type, phonemeLabel: phonemeLabel ?? `${id}, ${keyword}` };
}

/** A long vowel that says its name because of a silent e later in the syllable. Inside a word the
 * tile shows the bare vowel, because that is what the child sees; the sound card shows "a_e". */
function vce(id: string, grapheme: string, keyword: string, phonemeLabel: string, extra: Partial<Card> = {}): Card {
  return { id, grapheme, display: `${grapheme}_e`, keyword, phonemeLabel, type: 'vce', ...extra };
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
  // Suffix taught in 3.5; tapped as one unit like a welded sound
  card('ed', 'landed', 'welded', 'ed, as in landed'),
  // Book 4: the silent-e syllable
  vce('a_e', 'a', 'cake', 'a says its name, ay'),
  vce('i_e', 'i', 'ride', 'i says its name, eye'),
  vce('o_e', 'o', 'hope', 'o says its name, oh'),
  vce('u_e', 'u', 'mule', 'u says its name, yoo'),
  vce('e_e', 'e', 'Pete', 'e says its name, ee'),
  // The second sound of the same spelling, as in rule. Never drilled as a card of its own,
  // because it would be indistinguishable from u_e in the deck.
  vce('u_e_oo', 'u', 'rule', 'u_e can also say oo', { drill: false }),
  { id: 'e_silent', grapheme: 'e', display: 'e', keyword: 'silent e', phonemeLabel: 'silent e', type: 'silent', drill: false },
];
