import type { Substep } from '../types';
import { word, nonsense } from '../build';

export const SUBSTEP_1_6: Substep = {
  id: '1.6',
  title: 'Adding s and es',
  parentSummary:
    'Your child learns to add s or es to the end of a word to show there is more than one, or that someone does something right now, as in "ducks" and "wishes." There are no new sounds today, only a new ending to tap after sounds they already know.',
  groups: [
    {
      cards: [],
      lesson: [
        { say: 'Adding s to the end of a word means there is more than one. Today that s always says s, the sound at the start of snake.' },
        { show: ['s'] },
        { tap: 'hats' },
        { try: 'cups' },
        { try: 'socks' },
        { say: 'After sh, ch, x, s and z we add es instead, and it gets its own beat.' },
        { show: ['e', 's'] },
        { tap: 'wishes' },
        { try: 'boxes' },
        { try: 'dishes' },
      ],
    },
  ],
  concepts: ['suffix-s', 'suffix-es'],
  sightWords: ['are', 'were', 'what', 'into'],
  words: [
    // Plain -s. Every base here ends in a voiceless sound, so the s ending says s, never z.
    word('hats', 'h,a,t,s', { concepts: ['suffix-s'] }),
    word('cups', 'c,u,p,s', { concepts: ['suffix-s'] }),
    word('cats', 'c,a,t,s', { concepts: ['suffix-s'] }),
    word('jets', 'j,e,t,s', { concepts: ['suffix-s'] }),
    word('maps', 'm,a,p,s', { concepts: ['suffix-s'] }),
    word('huts', 'h,u,t,s', { concepts: ['suffix-s'] }),
    word('nets', 'n,e,t,s', { concepts: ['suffix-s'] }),
    word('pets', 'p,e,t,s', { concepts: ['suffix-s'] }),
    word('ducks', 'd,u,ck,s', { concepts: ['suffix-s'] }),
    word('rocks', 'r,o,ck,s', { concepts: ['suffix-s'] }),
    // Doubled-letter bases plus -s
    word('puffs', 'p,u,ff:f,s', { concepts: ['suffix-s'] }),
    word('huffs', 'h,u,ff:f,s', { concepts: ['suffix-s'] }),
    // Digraph bases plus -s
    word('ships', 'sh,i,p,s', { concepts: ['suffix-s'] }),
    word('chips', 'ch,i,p,s', { concepts: ['suffix-s'] }),
    word('chops', 'ch,o,p,s', { concepts: ['suffix-s'] }),
    word('shops', 'sh,o,p,s', { concepts: ['suffix-s'] }),
    word('moths', 'm,o,th,s', { concepts: ['suffix-s'] }),
    // ck bases plus -s
    word('kicks', 'k,i,ck,s', { concepts: ['suffix-s'] }),
    word('socks', 's,o,ck,s', { concepts: ['suffix-s'] }),
    word('packs', 'p,a,ck,s', { concepts: ['suffix-s'] }),
    word('locks', 'l,o,ck,s', { concepts: ['suffix-s'] }),
    word('decks', 'd,e,ck,s', { concepts: ['suffix-s'] }),
    // -es after sh, ch, x, s, z, and after the ss double
    word('wishes', 'w,i,sh,e,s', { concepts: ['suffix-es'] }),
    word('dishes', 'd,i,sh,e,s', { concepts: ['suffix-es'] }),
    word('fishes', 'f,i,sh,e,s', { concepts: ['suffix-es'] }),
    word('fixes', 'f,i,x,e,s', { concepts: ['suffix-es'] }),
    word('boxes', 'b,o,x,e,s', { concepts: ['suffix-es'] }),
    word('waxes', 'w,a,x,e,s', { concepts: ['suffix-es'] }),
    word('kisses', 'k,i,ss:s,e,s', { concepts: ['suffix-es'] }),
    word('misses', 'm,i,ss:s,e,s', { concepts: ['suffix-es'] }),
    word('passes', 'p,a,ss:s,e,s', { concepts: ['suffix-es'] }),

    // nonsense, same two patterns
    nonsense('bips', 'b,i,p,s'), nonsense('vots', 'v,o,t,s'), nonsense('fips', 'f,i,p,s'),
    nonsense('zuts', 'z,u,t,s'), nonsense('meps', 'm,e,p,s'), nonsense('vups', 'v,u,p,s'),
    nonsense('thips', 'th,i,p,s'), nonsense('keps', 'k,e,p,s'),
    nonsense('shups', 'sh,u,p,s'), nonsense('vushes', 'v,u,sh,e,s'),
    nonsense('thoxes', 'th,o,x,e,s'), nonsense('jexes', 'j,e,x,e,s'),
  ],
  sentences: [
    'The ducks are on the maps.',
    'Six pets sit in the shops.',
    'The cats and ducks nap on the rocks.',
    'The packs and locks are in the box.',
    'The kid kicks the box up the hill.',
    'She fixes the ship and the packs.',
    'What is in the box?',
    'The ducks and pets ran into the shed.',
    'The chips and dishes were in the box.',
  ],
  stories: [
    {
      title: 'The Box of Socks and Dishes',
      sentences: [
        'The kid has a big box.',
        'Six socks are in the box.',
        'The dishes are on the mat.',
        'The cats sit on the box.',
        'The ducks sit on the mat.',
        'The ducks and the cats wish for the dishes.',
        'The kid has fun with the box.',
      ],
      questions: [
        { prompt: 'What is in the box?', choices: ['socks', 'dishes', 'ducks'], answer: 0 },
        { prompt: 'What is on the box?', choices: ['cats', 'ducks', 'dishes'], answer: 0 },
      ],
    },
    {
      title: 'The Dishes in the Boxes',
      sentences: [
        'Pam has six boxes in the shed.',
        'The dishes and cups are in the boxes.',
        'Pam fixes the locks on the boxes.',
        'A kid passes the packs to Pam.',
        'Pam misses, and the packs fall on the mat.',
        'Pam and the kid fill a box with packs.',
      ],
      questions: [
        { prompt: 'Who fixes the locks?', choices: ['Pam', 'the kid', 'the dishes'], answer: 0 },
        { prompt: 'What is on the mat?', choices: ['the packs', 'the dishes', 'the cups'], answer: 0 },
      ],
    },
  ],
};
