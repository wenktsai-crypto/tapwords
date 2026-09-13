import type { Substep } from '../types';
import { word, nonsense } from '../build';

export const SUBSTEP_3_2: Substep = {
  id: '3.2',
  title: 'Two syllables with blends',
  parentSummary:
    'Your child reads two-syllable words made of two closed syllables, where at least one syllable has a blend, two or more consonants said together, such as "problem" and "pumpkin". They keep tapping every sound in order, syllable by syllable, then swipe to blend each part and say the whole word.',
  groups: [
    {
      cards: [],
      lesson: [
        { say: 'Today some syllables have a blend too, two or more sounds squeezed together, and we still tap every sound.' },
        { show: ['p', 'r', 'o', 'b', 'l', 'e', 'm'] },
        { say: 'Problem has two syllables, prob and lem. The first syllable starts with the blend p and r together.' },
        { tap: 'problem' },
        { say: 'Your turn. Tap every sound in each syllable, then swipe to blend the whole word.' },
        { try: 'blanket' },
        { try: 'pumpkin' },
        { try: 'unplug' },
      ],
    },
  ],
  concepts: [],
  sightWords: ['little', 'over', 'only', 'other'],
  words: [
    // Real: two closed syllables, at least one with a blend
    word('problem', 'p,r,o,b,l,e,m', { syllables: [4] }),
    word('plastic', 'p,l,a,s,t,i,c', { syllables: [4] }),
    word('dentist', 'd,e,n,t,i,s,t', { syllables: [3] }),
    word('contest', 'c,o,n,t,e,s,t', { syllables: [3] }),
    word('children', 'ch,i,l,d,r,e,n', { syllables: [3] }),
    word('hundred', 'h,u,n,d,r,e,d', { syllables: [3] }),
    word('blanket', 'b,l,a,n,k,e,t', { syllables: [4] }),
    word('trumpet', 't,r,u,m,p,e,t', { syllables: [4] }),
    word('pumpkin', 'p,u,m,p,k,i,n', { syllables: [4] }),

    word('address', 'a,d,d,r,e,ss:s', { syllables: [2] }),
    word('unplug', 'u,n,p,l,u,g', { syllables: [2] }),
    word('command', 'c,o,m,m,a,n,d', { syllables: [3] }),
    word('invent', 'i,n,v,e,n,t', { syllables: [2] }),
    word('sandwich', 's,a,n,d,w,i,ch', { syllables: [4] }),
    word('absent', 'a,b,s,e,n,t', { syllables: [3] }),
    word('handstand', 'h,a,n,d,s,t,a,n,d', { syllables: [4] }),
    word('frantic', 'f,r,a,n,t,i,c', { syllables: [4] }),
    word('splendid', 's,p,l,e,n,d,i,d', { syllables: [5] }),
    word('pretzel', 'p,r,e,t,z,e,l', { syllables: [4] }),
    word('instant', 'i,n,s,t,a,n,t', { syllables: [2] }),
    word('expand', 'e,x,p,a,n,d', { syllables: [2] }),
    word('impress', 'i,m,p,r,e,ss:s', { syllables: [2] }),
    word('insult', 'i,n,s,u,l,t', { syllables: [2] }),
    word('windmill', 'w,i,n,d,m,i,ll:l', { syllables: [4] }),
    word('complex', 'c,o,m,p,l,e,x', { syllables: [3] }),
    word('extend', 'e,x,t,e,n,d', { syllables: [2] }),

    word('husband', 'h,u,s,b,a,n,d', { syllables: [3] }),

    // Nonsense: same two-closed-syllable shape, always with a blend
    nonsense('blastin', 'b,l,a,s,t,i,n'),
    nonsense('crimpet', 'c,r,i,m,p,e,t'),
    nonsense('dranlop', 'd,r,a,n,l,o,p'),
    nonsense('flistub', 'f,l,i,s,t,u,b'),
    nonsense('grendit', 'g,r,e,n,d,i,t'),
    nonsense('plomkin', 'p,l,o,m,k,i,n'),
    nonsense('scaltop', 's,c,a,l,t,o,p'),
    nonsense('trubmit', 't,r,u,b,m,i,t'),
    nonsense('vindrest', 'v,i,n,d,r,e,s,t'),
    nonsense('wispram', 'w,i,s,p,r,am'),
    nonsense('stubnet', 's,t,u,b,n,e,t'),
    nonsense('clundip', 'c,l,u,n,d,i,p'),
  ],
  sentences: [
    'Sam has a fat pumpkin.',
    'Pam has a little pumpkin.',
    'The children have a contest.',
    'Dan has a problem with his van.',
    'The kid has a basket and a pumpkin.',
    'The pumpkin is over the wall.',
    'The other kid has the trumpet.',
    'Dan does a handstand on the mat.',
    'Sam has only one pretzel.',
  ],
  stories: [
    {
      title: 'The Pumpkin Contest',
      sentences: [
        'Sam has a fat pumpkin.',
        'Pam has a little pumpkin.',
        'The children have a contest.',
        'Sam and Pam sit on a big blanket.',
        'Sam has a problem with his pumpkin.',
        'The pumpkin is over the mat.',
        'Pam is not sad.',
        'Sam and Pam have fun.',
      ],
      questions: [
        { prompt: 'Who has a fat pumpkin?', choices: ['Sam', 'Pam', 'the children'], answer: 0 },
        { prompt: 'What do the children have?', choices: ['a contest', 'a problem', 'a blanket'], answer: 0 },
      ],
    },
    {
      title: 'The Dentist and the Pretzel',
      sentences: [
        'Dan is sad and frantic.',
        'Dan has a big problem.',
        'The dentist is not mad.',
        'The dentist has a splendid pretzel.',
        'Dan does not have the problem.',
        'Dan has only one pretzel.',
        'Dan is not sad, and he has fun.',
      ],
      questions: [
        { prompt: 'What is Dan at first?', choices: ['sad', 'not sad', 'the dentist'], answer: 0 },
        { prompt: 'What does the dentist have?', choices: ['a splendid pretzel', 'a big problem', 'fun'], answer: 0 },
      ],
    },
  ],
};
