import type { Substep } from '../types';
import { word, nonsense } from '../build';

export const SUBSTEP_1_6: Substep = {
  id: '1.6',
  title: 'Adding s and es',
  parentSummary:
    'Your child learns to add s or es to the end of a word to show there is more than one, or that someone does something right now, as in "bugs" and "wishes." There are no new sounds today, only a new ending to tap after sounds they already know.',
  groups: [
    {
      cards: [],
      lesson: [
        { say: 'Adding s to a word means there is more than one, and s can sound like s or like z.' },
        { show: ['s'] },
        { tap: 'bugs' },
        { try: 'hats' },
        { try: 'dolls' },
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
    // Plain -s
    word('bugs', 'b,u,g,s', { concepts: ['suffix-s'] }),
    word('hats', 'h,a,t,s', { concepts: ['suffix-s'] }),
    word('cups', 'c,u,p,s', { concepts: ['suffix-s'] }),
    word('dogs', 'd,o,g,s', { concepts: ['suffix-s'] }),
    word('cats', 'c,a,t,s', { concepts: ['suffix-s'] }),
    word('pigs', 'p,i,g,s', { concepts: ['suffix-s'] }),
    word('hens', 'h,e,n,s', { concepts: ['suffix-s'] }),
    word('jets', 'j,e,t,s', { concepts: ['suffix-s'] }),
    word('lids', 'l,i,d,s', { concepts: ['suffix-s'] }),
    word('maps', 'm,a,p,s', { concepts: ['suffix-s'] }),
    // Doubled-letter bases plus -s
    word('bells', 'b,e,ll:l,s', { concepts: ['suffix-s'] }),
    word('hills', 'h,i,ll:l,s', { concepts: ['suffix-s'] }),
    word('dolls', 'd,o,ll:l,s', { concepts: ['suffix-s'] }),
    // Welded am/an bases plus -s
    word('fans', 'f,an,s', { concepts: ['suffix-s'] }),
    word('cans', 'c,an,s', { concepts: ['suffix-s'] }),
    word('hams', 'h,am,s', { concepts: ['suffix-s'] }),
    // Digraph bases plus -s
    word('ships', 'sh,i,p,s', { concepts: ['suffix-s'] }),
    word('chips', 'ch,i,p,s', { concepts: ['suffix-s'] }),
    word('chops', 'ch,o,p,s', { concepts: ['suffix-s'] }),
    word('sheds', 'sh,e,d,s', { concepts: ['suffix-s'] }),
    // ck bases plus -s
    word('kicks', 'k,i,ck,s', { concepts: ['suffix-s'] }),
    word('socks', 's,o,ck,s', { concepts: ['suffix-s'] }),
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
    nonsense('bips', 'b,i,p,s'), nonsense('wugs', 'w,u,g,s'), nonsense('fips', 'f,i,p,s'),
    nonsense('zibs', 'z,i,b,s'), nonsense('vads', 'v,a,d,s'), nonsense('nups', 'n,u,p,s'),
    nonsense('yems', 'y,e,m,s'), nonsense('wubs', 'w,u,b,s'),
    nonsense('shups', 'sh,u,p,s'), nonsense('vushes', 'v,u,sh,e,s'),
    nonsense('thoxes', 'th,o,x,e,s'), nonsense('jexes', 'j,e,x,e,s'),
  ],
  sentences: [
    'The bugs are on the maps.',
    'Six hens sit in the sheds.',
    'The cats and dogs nap on the hills.',
    'The fans and cans are in the box.',
    'The kid kicks the box up the hill.',
    'She fixes the ship and the fans.',
    'What is in the box?',
    'The pigs and hens ran into the shed.',
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
        'The dogs sit on the mat.',
        'The dogs and the cats wish for the dishes.',
        'The kid has fun with the box.',
      ],
      questions: [
        { prompt: 'What is in the box?', choices: ['socks', 'dishes', 'dogs'], answer: 0 },
        { prompt: 'What sits on the box?', choices: ['cats', 'dogs', 'dishes'], answer: 0 },
      ],
    },
    {
      title: 'The Dishes in the Boxes',
      sentences: [
        'Pam has six boxes in the shed.',
        'The dishes and cups are in the boxes.',
        'Pam fixes the lids on the boxes.',
        'A kid passes the hams to Pam.',
        'Pam misses, and the hams fall on the mat.',
        'Pam and the kid fill a box with hams.',
      ],
      questions: [
        { prompt: 'Who fixes the lids?', choices: ['Pam', 'the kid', 'the cats'], answer: 0 },
        { prompt: 'What falls on the mat?', choices: ['the hams', 'the dishes', 'the cups'], answer: 0 },
      ],
    },
  ],
};
