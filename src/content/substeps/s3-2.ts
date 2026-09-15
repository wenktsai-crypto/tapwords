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
    word('dustpan', 'd,u,s,t,p,an', { syllables: [4] }),
    word('handstand', 'h,a,n,d,s,t,a,n,d', { syllables: [4] }),
    word('frantic', 'f,r,a,n,t,i,c', { syllables: [4] }),
    word('splendid', 's,p,l,e,n,d,i,d', { syllables: [5] }),
    word('desktop', 'd,e,s,k,t,o,p', { syllables: [4] }),
    word('instant', 'i,n,s,t,a,n,t', { syllables: [2] }),
    word('expand', 'e,x,p,a,n,d', { syllables: [2] }),
    word('impress', 'i,m,p,r,e,ss:s', { syllables: [2] }),
    word('handoff', 'h,a,n,d,o,ff:f', { syllables: [4] }),
    word('windmill', 'w,i,n,d,m,i,ll:l', { syllables: [4] }),
    word('sandbox', 's,a,n,d,b,o,x', { syllables: [4] }),
    word('extend', 'e,x,t,e,n,d', { syllables: [2] }),

    word('softball', 's,o,f,t,b,all', { syllables: [4] }),

    // More real words in the same shape, added so the section has enough to read.
    word('sunblock', 's,u,n,b,l,o,ck', { syllables: [3] }),
    word('drumstick', 'd,r,u,m,s,t,i,ck', { syllables: [4] }),
    word('handbag', 'h,a,n,d,b,a,g', { syllables: [4] }),
    word('lipstick', 'l,i,p,s,t,i,ck', { syllables: [3] }),
    word('kickstand', 'k,i,ck,s,t,a,n,d', { syllables: [3] }),
    word('windsock', 'w,i,n,d,s,o,ck', { syllables: [4] }),
    word('lunchbox', 'l,u,n,ch,b,o,x', { syllables: [4] }),
    word('backdrop', 'b,a,ck,d,r,o,p', { syllables: [3] }),

    // Nonsense: same two-closed-syllable shape, always with a blend
    nonsense('clantof', 'c,l,a,n,t,o,f', { syllables: [4] }),
    nonsense('flondep', 'f,l,o,n,d,e,p', { syllables: [4] }),
    nonsense('dranlop', 'd,r,a,n,l,o,p', { syllables: [4] }),
    nonsense('flistub', 'f,l,i,s,t,u,b', { syllables: [4] }),
    nonsense('frandup', 'f,r,a,n,d,u,p', { syllables: [4] }),
    nonsense('plomkin', 'p,l,o,m,k,i,n', { syllables: [4] }),
    nonsense('scaltop', 's,c,a,l,t,o,p', { syllables: [4] }),
    nonsense('trubmit', 't,r,u,b,m,i,t', { syllables: [4] }),
    nonsense('vindrest', 'v,i,n,d,r,e,s,t', { syllables: [3] }),
    nonsense('wispram', 'w,i,s,p,r,am', { syllables: [3] }),
    nonsense('stubnet', 's,t,u,b,n,e,t', { syllables: [4] }),
    nonsense('clundip', 'c,l,u,n,d,i,p', { syllables: [4] }),
    nonsense('brantip', 'b,r,a,n,t,i,p', { syllables: [4] }),
    nonsense('clempot', 'c,l,e,m,p,o,t', { syllables: [4] }),
    nonsense('drenlip', 'd,r,e,n,l,i,p', { syllables: [4] }),
    nonsense('flampet', 'f,l,a,m,p,e,t', { syllables: [4] }),
    nonsense('grintub', 'g,r,i,n,t,u,b', { syllables: [4] }),
    nonsense('grustep', 'g,r,u,s,t,e,p', { syllables: [4] }),
    nonsense('trenlug', 't,r,e,n,l,u,g', { syllables: [4] }),
    nonsense('twindop', 't,w,i,n,d,o,p', { syllables: [4] }),
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
    'Sam has only one sandwich.',
    'A rabbit ran in the sandbox.',
    'Dan had sunblock on his neck at the picnic.',
    'Pam got the dustpan from the shed.',
    'Sam can fix the kickstand on his wagon.',
    'Dan put the windsock up on the shed.',
    'The lipstick was in the handbag.',
    'The drumstick fell in the mud.',
    'The lunchbox is on the desktop.',
    'The children ran to Dan for the handoff.',
  ],
  stories: [
    {
      title: 'The Pumpkin Contest',
      sentences: [
        'Sam has a fat pumpkin.',
        'Pam has a little pumpkin.',
        'Dan has a thin pumpkin in his basket.',
        'The children have a contest.',
        'Sam and Pam sit on a big blanket.',
        'Sam has a problem with his fat pumpkin.',
        'It can not sit on the blanket.',
        'The little pumpkin is on the blanket.',
        'Sam can hold the fat pumpkin on his lap.',
        'The fat pumpkin is the best, and the thin pumpkin is not.',
        'The contest is over.',
      ],
      questions: [
        // Every wrong answer here is a pumpkin that is really in the story. "the blanket" and
        // "the big blanket" used to stand in the third slot of the last two questions, and a
        // blanket is not a pumpkin, so a child could strike them out without reading a word.
        // The story had only two pumpkins, so there was nothing to swap them for; Dan's thin
        // one, in his basket rather than on the blanket, is the third real candidate.
        { prompt: 'Who has a fat pumpkin?', choices: ['Sam', 'Pam', 'Dan'], answer: 0 },
        {
          prompt: 'Which pumpkin sits on the blanket?',
          choices: ['the little pumpkin', 'the fat pumpkin', 'the thin pumpkin'],
          answer: 0,
        },
        {
          prompt: 'At the end, which pumpkin is the best?',
          choices: ['the fat pumpkin', 'the little pumpkin', 'the thin pumpkin'],
          answer: 0,
        },
      ],
    },
    {
      title: 'The Dentist and the Muffin',
      sentences: [
        'Dan went to the dentist with a muffin in his hand.',
        'On the path, the muffin fell in the mud.',
        'Dan sat on the step and was upset.',
        'The dentist said it was not a big problem.',
        'A splendid muffin was in his basket.',
        'The dentist let Dan have it.',
        'Dan had the splendid muffin in the sun and did not drop it.',
      ],
      questions: [
        {
          prompt: 'What happened to the first muffin?',
          choices: ['it fell in the mud', 'it was in the basket', 'it was in the sun'],
          answer: 0,
        },
        { prompt: 'Who was upset?', choices: ['Dan', 'the dentist', 'the muffin'], answer: 0 },
        {
          prompt: 'Where was the splendid muffin at the start?',
          choices: ['in the basket', 'in the mud', 'on the path'],
          answer: 0,
        },
      ],
    },
    {
      title: 'The Ball in the Sandbox',
      sentences: [
        'At the picnic, Sam and Dan went to the sandbox with a softball.',
        'The sun was hot, and Dan had sunblock on his neck.',
        'Sam hit the ball, and it went up in the sun.',
        'The ball fell in the sandbox with a thud.',
        'Dan ran to the sandbox, but the ball was in the sand.',
        'Sam put a hand in the sand, and Dan did too.',
        'Dan got the ball, and Sam got sand in his socks.',
        'Sam and Dan went back to the picnic with the ball.',
      ],
      questions: [
        {
          prompt: 'Where did the ball fall?',
          choices: ['in the sandbox', 'on his neck', 'in his socks'],
          answer: 0,
        },
        { prompt: 'What did Dan have on his neck?', choices: ['sunblock', 'sand', 'the softball'], answer: 0 },
        {
          prompt: 'What did Sam and Dan do at the end of the story?',
          choices: ['went back to the picnic', 'put a hand in the sand', 'hit the ball'],
          answer: 0,
        },
      ],
    },
    {
      title: 'The Drumstick in the Mud',
      sentences: [
        'Pam and Dan went to the shed to do a song.',
        'Pam got the trumpet, and Dan got his drumstick.',
        'Dan ran in the mud, and the drumstick fell from his hand.',
        'Dan was upset and frantic.',
        'Pam went back to the shed and got a rag and a dustpan.',
        'Dan put the drumstick in the dustpan, and Pam got the mud off it with the rag.',
        'Then Pam and Dan did the song, and it was a big hit.',
      ],
      questions: [
        {
          prompt: 'Where did the drumstick fall?',
          // "on the trumpet" was the odd one out: the trumpet is in the story but the word "on"
          // is not, so the choice was phrased out of words the story never uses. A drumstick
          // could plausibly fall in the bell of a trumpet, so the wrong answer still bites.
          choices: ['in the mud', 'in the shed', 'in the trumpet'],
          answer: 0,
        },
        { prompt: 'What did Pam use to get the mud off?', choices: ['the rag', 'the trumpet', 'the song'], answer: 0 },
        {
          prompt: 'How does the story end?',
          choices: ['Pam and Dan did the song', 'the drumstick fell in the mud', 'Dan was upset and frantic'],
          answer: 0,
        },
      ],
    },
  ],
};
