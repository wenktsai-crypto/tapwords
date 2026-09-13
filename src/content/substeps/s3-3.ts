import type { Substep } from '../types';
import { word, nonsense } from '../build';

export const SUBSTEP_3_3: Substep = {
  id: '3.3',
  title: 'Words that end in ct',
  parentSummary:
    'Your child reads and spells words that end with the sounds c and t tapped right after each other, like "act" and "insect". Longer words such as "connect" and "subtract" build the same ending onto a base word.',
  groups: [
    {
      cards: [],
      lesson: [
        { say: 'Today we learn words that end with c and t said right together, like act.' },
        { show: ['a', 'c', 't'] },
        { say: 'At the end of these words, c gets its own tap and t gets its own tap, one right after the other.' },
        { tap: 'act' },
        { say: 'Your turn. Tap each sound in order, then swipe to say the word.' },
        { try: 'fact' },
        { try: 'insect' },
        { try: 'connect' },
      ],
    },
  ],
  concepts: ['ct-ending'],
  sightWords: ['after', 'before', 'people', 'water'],
  words: [
    // one-syllable bases
    word('act', 'a,c,t'),
    word('fact', 'f,a,c,t'),
    word('pact', 'p,a,c,t'),
    word('tact', 't,a,c,t'),
    word('duct', 'd,u,c,t'),
    word('tract', 't,r,a,c,t'),

    // two-syllable words, syllables mark where the second syllable begins
    word('insect', 'i,n,s,e,c,t', { syllables: [2] }),
    word('inspect', 'i,n,s,p,e,c,t', { syllables: [2] }),
    word('connect', 'c,o,n,n,e,c,t', { syllables: [3] }),
    word('collect', 'c,o,l,l,e,c,t', { syllables: [3] }),
    word('correct', 'c,o,r,r,e,c,t', { syllables: [3] }),
    word('expect', 'e,x,p,e,c,t', { syllables: [2] }),
    word('exact', 'e,x,a,c,t', { syllables: [2] }),
    word('impact', 'i,m,p,a,c,t', { syllables: [2] }),
    word('compact', 'c,o,m,p,a,c,t', { syllables: [3] }),
    word('contact', 'c,o,n,t,a,c,t', { syllables: [3] }),
    word('intact', 'i,n,t,a,c,t', { syllables: [2] }),
    word('object', 'o,b,j,e,c,t', { syllables: [2] }),
    word('subject', 's,u,b,j,e,c,t', { syllables: [3] }),
    word('contract', 'c,o,n,t,r,a,c,t', { syllables: [3] }),
    word('subtract', 's,u,b,t,r,a,c,t', { syllables: [3] }),
    word('instruct', 'i,n,s,t,r,u,c,t', { syllables: [2] }),
    word('conduct', 'c,o,n,d,u,c,t', { syllables: [3] }),
    word('district', 'd,i,s,t,r,i,c,t', { syllables: [3] }),
    word('instinct', 'i,n,s,t,i,n,c,t', { syllables: [2] }),
    word('distinct', 'd,i,s,t,i,n,c,t', { syllables: [3] }),
    word('extinct', 'e,x,t,i,n,c,t', { syllables: [2] }),

    // nonsense, same ct ending
    nonsense('vact', 'v,a,c,t'),
    nonsense('brect', 'b,r,e,c,t'),
    nonsense('flict', 'f,l,i,c,t'),
    nonsense('spect', 's,p,e,c,t'),
    nonsense('dract', 'd,r,a,c,t'),
    nonsense('gract', 'g,r,a,c,t'),
    nonsense('plect', 'p,l,e,c,t'),
    { ...nonsense('conflact', 'c,o,n,f,l,a,c,t'), syllables: [3] },
    { ...nonsense('disnect', 'd,i,s,n,e,c,t'), syllables: [3] },
    nonsense('vunct', 'v,u,n,c,t'),
    { ...nonsense('subplict', 's,u,b,p,l,i,c,t'), syllables: [3] },
    { ...nonsense('misduct', 'm,i,s,d,u,c,t'), syllables: [3] },
  ],
  sentences: [
    'Sam and Pam collect a bug.',
    'Sam can act as a duck and quack.',
    'We collect an insect in the sun.',
    'I expect Sam to collect the insect.',
    'She has the exact map.',
    'They connect the ball to the net.',
    'One duck can inspect the shell.',
    'Water can fill a red cup.',
    'People can inspect the wet mud.',
  ],
  stories: [
    {
      title: 'Sam and Pam Collect an Insect',
      sentences: [
        'Sam and Pam collect an insect.',
        'The insect is on a log.',
        'Sam can inspect the insect on the log.',
        'Pam has the insect in a cup.',
        'They connect the cup and the lid.',
        'The insect is intact in the cup.',
        'Sam and Pam have fun with the insect.',
      ],
      questions: [
        { prompt: 'What does Sam collect?', choices: ['an insect', 'a cup', 'a lid'], answer: 0 },
        {
          prompt: 'What do Sam and Pam connect?',
          choices: ['the cup and the lid', 'the insect and the log', 'the cup and the insect'],
          answer: 0,
        },
      ],
    },
    {
      title: 'Pam and Sam Inspect a Shell',
      sentences: [
        'Pam and Sam sit in the water.',
        'A duck can inspect the wet rock.',
        'Sam and Pam pick up a shell.',
        'The correct shell is big and intact.',
        'The duck can not collect the shell.',
        'Pam and Sam connect the shell to the cup.',
        'They have fun with the duck and the shell.',
      ],
      questions: [
        { prompt: 'What do Pam and Sam pick up?', choices: ['a shell', 'a duck', 'a rock'], answer: 0 },
        { prompt: 'Where do Pam and Sam sit?', choices: ['in the water', 'on the rock', 'in the cup'], answer: 0 },
      ],
    },
  ],
};
