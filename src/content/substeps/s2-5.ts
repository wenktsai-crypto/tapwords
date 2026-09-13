import type { Substep } from '../types';
import { word, nonsense } from '../build';

export const SUBSTEP_2_5: Substep = {
  id: '2.5',
  title: 'Three-letter blends',
  parentSummary:
    'Your child learns three-letter blends at the start of a word, where three consonants in a row each still get their own tap, as in "strap" and "scrub". A digraph can be part of the blend too, so "shrimp" taps as sh, r, i, m, p.',
  groups: [
    {
      cards: [],
      lesson: [
        { say: 'Today three consonants stand in a row at the start of a word, and each one still gets its own tap.' },
        { show: ['s', 't', 'r', 'a', 'p'] },
        { say: 'Three taps come before the vowel, then the rest of the word taps as usual.' },
        { tap: 'strap' },
        { say: 'Your turn. Tap every sound in order, then swipe to say the word.' },
        { try: 'split' },
        { try: 'shrug' },
        { try: 'sprint' },
      ],
    },
  ],
  concepts: ['three-letter-blend'],
  sightWords: ['because', 'many', 'any', 'out'],
  words: [
    // str
    word('strap', 's,t,r,a,p'),
    word('strip', 's,t,r,i,p'),
    word('strut', 's,t,r,u,t'),
    word('strum', 's,t,r,u,m'),
    word('strand', 's,t,r,a,n,d'),
    // scr
    word('scrap', 's,c,r,a,p'),
    word('scrub', 's,c,r,u,b'),
    word('script', 's,c,r,i,p,t'),
    word('scrunch', 's,c,r,u,n,ch'),
    word('scram', 's,c,r,am'),
    // spr
    word('sprint', 's,p,r,i,n,t'),
    word('sprig', 's,p,r,i,g'),
    // spl
    word('splat', 's,p,l,a,t'),
    word('split', 's,p,l,i,t'),
    word('splint', 's,p,l,i,n,t'),
    word('splash', 's,p,l,a,sh'),
    // squ
    word('squint', 's,qu,i,n,t'),
    word('squish', 's,qu,i,sh'),
    // shr
    word('shrimp', 'sh,r,i,m,p'),
    word('shrub', 'sh,r,u,b'),
    word('shrug', 'sh,r,u,g'),
    // thr

    word('thrust', 'th,r,u,s,t'),
    word('thrash', 'th,r,a,sh'),
    word('throb', 'th,r,o,b'),
    word('thrush', 'th,r,u,sh'),

    // nonsense: same three-letter-blend shape
    nonsense('strib', 's,t,r,i,b'),
    nonsense('strug', 's,t,r,u,g'),
    nonsense('scrib', 's,c,r,i,b'),
    nonsense('scrant', 's,c,r,a,n,t'),
    nonsense('scrend', 's,c,r,e,n,d'),
    nonsense('sprub', 's,p,r,u,b'),
    nonsense('splon', 's,p,l,o,n'),
    nonsense('splad', 's,p,l,a,d'),
    nonsense('squend', 's,qu,e,n,d'),
    nonsense('shrup', 'sh,r,u,p'),
    nonsense('thrup', 'th,r,u,p'),
    nonsense('thrint', 'th,r,i,n,t'),
  ],
  sentences: [
    'The strap has a big rip.',
    'Dan can strum and hop.',
    'Sam and Jan strut to the shop.',
    'The shrimp has a big shell.',
    'Do you have a shrub in the shed?',
    'The duck can squint at the sun.',
    'A big splash is on the deck.',
    'The tub has many fish.',
    'Does Sam have any jam?',
    'The kid ran out because of the mud.',
    'A thrush can sit on a rock.',
  ],
  stories: [
    {
      title: 'The Big Sprint',
      sentences: [
        'Dan and Sam run in a big sprint.',
        'Sam has a rip in his strap.',
        'Dan can sprint to the shed.',
        'Sam is in the mud with a big splash.',
        'Dan is at the shed and not wet.',
        'Sam is wet, and Sam is sad.',
        'Dan can run to Sam in the mud.',
      ],
      questions: [
        { prompt: 'Who gets to the shed?', choices: ['Dan', 'Sam', 'the strap'], answer: 0 },
        { prompt: 'Who gets wet?', choices: ['Sam', 'Dan', 'the shed'], answer: 0 },
      ],
    },
    {
      title: 'The Duck and the Shrimp',
      sentences: [
        'The duck is in a shrub.',
        'A shrimp is in the mud.',
        'The duck can squint at the shrimp.',
        'The duck can hop in with a big splash.',
        'The shrimp is wet, and the duck is wet.',
        'The duck and the shrimp sit in the sun.',
      ],
      questions: [
        { prompt: 'Where is the duck at the start of the story?', choices: ['in a shrub', 'in the mud', 'on a rock'], answer: 0 },
        { prompt: 'What does the duck squint at?', choices: ['the shrimp', 'the shrub', 'the sun'], answer: 0 },
      ],
    },
  ],
};
