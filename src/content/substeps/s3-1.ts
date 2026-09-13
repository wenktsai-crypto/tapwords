import type { Substep } from '../types';
import { word, nonsense } from '../build';

export const SUBSTEP_3_1: Substep = {
  id: '3.1',
  title: 'Two syllables, no blends',
  parentSummary:
    'Your child learns to split a longer word into two short syllables, each with its own vowel sound, like "sunset" and "napkin". Along the way they also meet a few words with a prefix such as "un-" and words whose second syllable has a soft schwa vowel, such as "wagon".',
  groups: [
    {
      cards: [],
      lesson: [
        { say: 'Today we learn that some longer words are really two short words glued together.' },
        { show: ['s', 'u', 'n', 's', 'e', 't'] },
        { say: 'Each part has its own vowel, so tap the first part, then the second part, then swipe to blend the whole word.' },
        { tap: 'sunset' },
        { say: 'Your turn. Find the two parts and tap each one before you swipe.' },
        { try: 'napkin' },
        { try: 'rabbit' },
        { try: 'unlock' },
      ],
    },
  ],
  concepts: ['two-syllable', 'schwa', 'prefix'],
  sightWords: ['down', 'now', 'how', 'about'],
  words: [
    // Compounds: two short closed syllables glued together.
    word('sunset', 's,u,n,s,e,t', { syllables: [3] }),
    word('catnip', 'c,a,t,n,i,p', { syllables: [3] }),
    word('bathtub', 'b,a,th,t,u,b', { syllables: [3] }),
    word('laptop', 'l,a,p,t,o,p', { syllables: [3] }),

    // A consonant doubled across the syllable boundary, tapped as two parts.
    word('napkin', 'n,a,p,k,i,n', { syllables: [3] }),
    word('rabbit', 'r,a,b,b,i,t', { syllables: [3] }),
    word('muffin', 'm,u,f,f,i,n', { syllables: [3] }),
    word('kitten', 'k,i,t,t,e,n', { syllables: [3] }),
    word('button', 'b,u,t,t,o,n', { syllables: [3] }),
    word('sudden', 's,u,d,d,e,n', { syllables: [3] }),
    word('happen', 'h,a,p,p,e,n', { syllables: [3] }),
    word('lesson', 'l,e,s,s,o,n', { syllables: [3], concepts: ['schwa'] }),

    // The ck digraph closing the first syllable.
    word('jacket', 'j,a,ck,e,t', { syllables: [3] }),
    word('pocket', 'p,o,ck,e,t', { syllables: [3] }),
    word('ticket', 't,i,ck,e,t', { syllables: [3] }),

    // Plain two-syllable words, split between two single consonants.
    word('basket', 'b,a,s,k,e,t', { syllables: [3] }),
    word('magnet', 'm,a,g,n,e,t', { syllables: [3] }),
    word('comic', 'c,o,m,i,c', { syllables: [3] }),
    word('picnic', 'p,i,c,n,i,c', { syllables: [3] }),

    // A soft, unstressed second syllable (schwa).
    word('wagon', 'w,a,g,o,n', { syllables: [3], concepts: ['schwa'] }),
    word('lemon', 'l,e,m,o,n', { syllables: [3], concepts: ['schwa'] }),
    word('melon', 'm,e,l,o,n', { syllables: [3], concepts: ['schwa'] }),
    word('salad', 's,a,l,a,d', { syllables: [3], concepts: ['schwa'] }),
    word('robin', 'r,o,b,i,n', { syllables: [3], concepts: ['schwa'] }),
    word('cabin', 'c,a,b,i,n', { syllables: [3], concepts: ['schwa'] }),

    // Two short words glued together, and words with a prefix.
    word('cannot', 'c,a,n,n,o,t', { syllables: [3] }),
    word('upset', 'u,p,s,e,t', { syllables: [2] }),
    word('unlock', 'u,n,l,o,ck', { syllables: [2], concepts: ['prefix'] }),
    word('unfit', 'u,n,f,i,t', { syllables: [2], concepts: ['prefix'] }),
    word('unzip', 'u,n,z,i,p', { syllables: [2], concepts: ['prefix'] }),
    word('dismiss', 'd,i,s,m,i,ss:s', { syllables: [3], concepts: ['prefix'] }),
    word('misfit', 'm,i,s,f,i,t', { syllables: [3], concepts: ['prefix'] }),

    // Nonsense: same two-syllable shapes, never a real word.
    nonsense('napsit', 'n,a,p,s,i,t'),
    nonsense('lobbin', 'l,o,b,b,i,n'),
    nonsense('tudmap', 't,u,d,m,a,p'),
    nonsense('fesket', 'f,e,s,k,e,t'),
    nonsense('zubfek', 'z,u,b,f,e,k'),
    nonsense('vimlub', 'v,i,m,l,u,b'),
    nonsense('fabbit', 'f,a,b,b,i,t'),
    nonsense('cadmun', 'c,a,d,m,u,n'),
    nonsense('hupten', 'h,u,p,t,e,n'),
    nonsense('zoglit', 'z,o,g,l,i,t'),
    nonsense('mibbet', 'm,i,b,b,e,t'),
    nonsense('wusdak', 'w,u,s,d,a,k'),
  ],
  sentences: [
    'The rabbit has a muffin in the cabin.',
    'A robin can sit on the wagon.',
    'We have a picnic in the sun.',
    'Does the kitten have a red button?',
    'The kid can fix a jacket.',
    'Now the rabbit can hop to the wagon.',
    'How does the rabbit sit in the basket?',
    'The rabbit and the robin chat about the muffin.',
    'Down in the cabin the rabbit has a nap.',
  ],
  stories: [
    {
      title: 'The Rabbit in the Cabin',
      sentences: [
        'A rabbit is in a cabin at sunset.',
        'The rabbit has a big muffin.',
        'The muffin is on a red mat.',
        'The mat is in the cabin.',
        'Now the muffin is not on the mat.',
        'The rabbit is not sad.',
      ],
      questions: [
        { prompt: 'Where is the rabbit?', choices: ['in a cabin', 'on a mat', 'in the sun'], answer: 0 },
        { prompt: 'What did the rabbit have?', choices: ['a muffin', 'a mat', 'a cabin'], answer: 0 },
      ],
    },
    {
      title: 'The Robin and the Wagon',
      sentences: [
        'A robin can sit on the wagon.',
        'The robin can hop off the wagon.',
        'The wagon has a basket on it.',
        'The basket has a muffin in it.',
        'The robin has the muffin now.',
        'The muffin is not in the basket.',
        'The robin has a nap in the sun.',
      ],
      questions: [
        { prompt: 'What did the wagon have on it?', choices: ['a basket', 'a muffin', 'a robin'], answer: 0 },
        { prompt: 'Where did the muffin end up?', choices: ['with the robin', 'in the basket', 'on the wagon'], answer: 0 },
      ],
    },
  ],
};
