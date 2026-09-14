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
    word('backpack', 'b,a,ck,p,a,ck', { syllables: [3] }),
    word('catfish', 'c,a,t,f,i,sh', { syllables: [3] }),

    // A consonant doubled across the syllable boundary, tapped as two parts.
    word('napkin', 'n,a,p,k,i,n', { syllables: [3] }),
    word('rabbit', 'r,a,b,b,i,t', { syllables: [3] }),
    word('muffin', 'm,u,f,f,i,n', { syllables: [3] }),
    word('kitten', 'k,i,t,t,e,n', { syllables: [3] }),
    word('button', 'b,u,t,t,o,n', { syllables: [3] }),
    word('sudden', 's,u,d,d,e,n', { syllables: [3] }),
    word('happen', 'h,a,p,p,e,n', { syllables: [3] }),
    word('lesson', 'l,e,s,s,o,n', { syllables: [3], concepts: ['schwa'] }),
    word('hidden', 'h,i,d,d,e,n', { syllables: [3] }),
    word('mitten', 'm,i,t,t,e,n', { syllables: [3] }),
    word('cotton', 'c,o,t,t,o,n', { syllables: [3] }),
    word('tunnel', 't,u,n,n,e,l', { syllables: [3] }),
    word('kennel', 'k,e,n,n,e,l', { syllables: [3] }),

    // The ck digraph closing the first syllable.
    word('jacket', 'j,a,ck,e,t', { syllables: [3] }),
    word('pocket', 'p,o,ck,e,t', { syllables: [3] }),
    word('ticket', 't,i,ck,e,t', { syllables: [3] }),
    word('rocket', 'r,o,ck,e,t', { syllables: [3] }),

    // Plain two-syllable words, split between two single consonants.
    word('basket', 'b,a,s,k,e,t', { syllables: [3] }),
    word('magnet', 'm,a,g,n,e,t', { syllables: [3] }),
    word('comic', 'c,o,m,i,c', { syllables: [3] }),
    word('picnic', 'p,i,c,n,i,c', { syllables: [3] }),
    word('helmet', 'h,e,l,m,e,t', { syllables: [3] }),
    word('goblin', 'g,o,b,l,i,n', { syllables: [3] }),

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
    nonsense('zunmap', 'z,u,n,m,a,p'),
    nonsense('fesket', 'f,e,s,k,e,t'),
    nonsense('zubfek', 'z,u,b,f,e,k'),
    nonsense('vimlub', 'v,i,m,l,u,b'),
    nonsense('fabbit', 'f,a,b,b,i,t'),
    nonsense('cadmun', 'c,a,d,m,u,n'),
    nonsense('hupten', 'h,u,p,t,e,n'),
    nonsense('zoglit', 'z,o,g,l,i,t'),
    nonsense('mibbet', 'm,i,b,b,e,t'),
    nonsense('fudnak', 'f,u,d,n,a,k'),
    nonsense('zabbin', 'z,a,b,b,i,n'),
    nonsense('fennup', 'f,e,n,n,u,p'),
    nonsense('vacket', 'v,a,ck,e,t'),
    nonsense('tadon', 't,a,d,o,n'),
    nonsense('muzlop', 'm,u,z,l,o,p'),
    nonsense('wemtuck', 'w,e,m,t,u,ck'),
    nonsense('vozlin', 'v,o,z,l,i,n'),
    nonsense('zobkin', 'z,o,b,k,i,n'),
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
    'Sam can hand Dan a red backpack.',
    'A goblin is hidden in the tunnel.',
    'The kennel is not big, and it has a cotton mat.',
    'Does the rocket fit in the backpack?',
    'Sam can grab the helmet and hop to the kennel.',
    'The catfish is big, and it can swim fast.',
    'A goblin can help Sam pack the backpack.',
    'The rocket is hidden in the shed, not the tunnel.',
    'Sam has a cotton mitten and a helmet in the backpack.',
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
        'A kitten has the muffin now.',
      ],
      questions: [
        { prompt: 'Where is the rabbit?', choices: ['in a cabin', 'on a mat', 'at sunset'], answer: 0 },
        { prompt: 'What has the muffin at the end?', choices: ['the kitten', 'the rabbit', 'the mat'], answer: 0 },
      ],
    },
    {
      title: 'The Robin and the Wagon',
      sentences: [
        'A robin can sit on the wagon.',
        'A basket with a muffin is on the wagon.',
        'The robin can hop off the wagon with the muffin.',
        'The robin has the muffin, not the basket.',
        'The robin has a nap in the sun with the muffin.',
      ],
      questions: [
        { prompt: 'What is in the basket at the start?', choices: ['a muffin', 'a robin', 'a wagon'], answer: 0 },
        { prompt: 'Where did the muffin end up?', choices: ['with the robin', 'in the basket', 'on the wagon'], answer: 0 },
      ],
    },
    {
      title: 'The Goblin in the Tunnel',
      sentences: [
        'Sam has a helmet and a backpack.',
        'Sam can hop into a big tunnel.',
        'A goblin is in the tunnel too.',
        'The goblin has the backpack now.',
        'The goblin is not mad at Sam.',
        'The goblin can hand the backpack back to Sam.',
      ],
      questions: [
        { prompt: 'What did the goblin have?', choices: ['the backpack', 'the helmet', 'the tunnel'], answer: 0 },
        { prompt: 'What does the goblin do at the end?', choices: ['hand the backpack back to Sam', 'hop into the tunnel', 'have the helmet'], answer: 0 },
      ],
    },
    {
      title: 'The Catfish in the Bathtub',
      sentences: [
        'Sam has a big catfish in the bathtub.',
        'The catfish can swim fast in the tub.',
        'Sam has a net.',
        'Now the catfish is in the net.',
        'Now Sam and the net are at the pond.',
        'Sam can put the catfish back in the pond.',
        'Now the catfish is back in the pond, not the net.',
      ],
      questions: [
        { prompt: 'Where was the catfish at the start?', choices: ['in the bathtub', 'in the net', 'in the pond'], answer: 0 },
        { prompt: 'What did Sam use to catch the catfish?', choices: ['a net', 'a bathtub', 'a pond'], answer: 0 },
        { prompt: 'Where is the catfish at the end?', choices: ['in the pond', 'in the net', 'in the bathtub'], answer: 0 },
      ],
    },
  ],
};
