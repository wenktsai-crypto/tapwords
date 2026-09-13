import type { Substep } from '../types';
import { word, nonsense } from '../build';

export const SUBSTEP_1_5: Substep = {
  id: '1.5',
  title: 'The nose sounds am and an',
  parentSummary:
    'Your child learns the two welded sounds am and an. When a short a runs into m or n the vowel changes a little, so we keep the pair together and tap it once: "ham" is two taps, h and am, and "fan" is two taps, f and an.',
  groups: [
    {
      cards: ['am', 'an'],
      lesson: [
        { say: 'Today we meet two chunks that always stay together, am and an.' },
        { show: ['am', 'an'] },
        { say: 'We say m and n in the nose. When a comes just before them, the a sound changes a little. So we keep am and an together and tap them once.' },
        { tap: 'ham' },
        { say: 'Your turn. Tap the first sound, then tap the whole chunk at the end, then swipe to say the word.' },
        { try: 'fan' },
        { try: 'jam' },
        { try: 'van' },
      ],
    },
  ],
  concepts: [],
  sightWords: ['from', 'have', 'do', 'does'],
  words: [
    // Real words ending in the welded am. Names keep their capital letter here too, so a tile
    // row or a read-aloud line shows "Sam", not "sam"; their parts stay lower case.
    word('am', 'am'),
    word('ham', 'h,am'), word('jam', 'j,am'), word('ram', 'r,am'), word('yam', 'y,am'),
    word('dam', 'd,am'), word('cam', 'c,am'), word('bam', 'b,am'),
    word('wham', 'wh,am'), word('sham', 'sh,am'),
    word('Sam', 's,am'), word('Pam', 'p,am'),

    // Real words ending in the welded an.
    word('an', 'an'),
    word('fan', 'f,an'), word('man', 'm,an'), word('pan', 'p,an'), word('ran', 'r,an'),
    word('tan', 't,an'), word('van', 'v,an'), word('can', 'c,an'), word('ban', 'b,an'),
    word('than', 'th,an'),
    word('Dan', 'd,an'), word('Jan', 'j,an'), word('Nan', 'n,an'),

    // Nonsense words, same two patterns.
    nonsense('zam', 'z,am'), nonsense('vam', 'v,am'), nonsense('quam', 'qu,am'),
    nonsense('tham', 'th,am'), nonsense('cham', 'ch,am'),
    nonsense('lan', 'l,an'), nonsense('gan', 'g,an'), nonsense('zan', 'z,an'),
    nonsense('shan', 'sh,an'), nonsense('yan', 'y,an'), nonsense('whan', 'wh,an'),
    nonsense('quan', 'qu,an'),
  ],
  sentences: [
    'Sam has jam in a pan.',
    'The man ran to the van.',
    'I am not mad at the cat.',
    'Pam has ham and a yam in a dish.',
    'Can you run in the sun?',
    'The ram ran from the man.',
    'Dan has a tan hat.',
    'Does the cat have a yam?',
    'Nan and Jan sit in the van.',
  ],
  stories: [
    {
      title: 'Sam and Pam Have Jam',
      sentences: [
        'Sam has a big pan.',
        'Pam has ham and jam.',
        'The jam is in the pan.',
        'A red hen ran to the pan.',
        'The hen sat in the jam.',
        'The hen has jam on a leg.',
        'Sam and Pam do not have jam.',
        'Sam and Pam have ham in the sun.',
      ],
      questions: [
        { prompt: 'What did the hen sit in?', choices: ['the jam', 'the sun', 'the ham'], answer: 0 },
        { prompt: 'Who ran to the pan?', choices: ['a red hen', 'Sam', 'Pam'], answer: 0 },
      ],
    },
    {
      title: 'Dan and the Tan Van',
      sentences: [
        'Dan has a tan van.',
        'The van has a big fan in it.',
        'Dan ran to the van in the sun.',
        'A man and a cat sit in the van.',
        'The cat has a nap on a red rug.',
        'Dan does not have a map.',
        'The man has a map from the shop.',
        'Dan and the man have fun in the van.',
      ],
      questions: [
        { prompt: 'What does Dan have?', choices: ['a tan van', 'a map', 'a red rug'], answer: 0 },
        { prompt: 'Who has a map?', choices: ['the man', 'Dan', 'the cat'], answer: 0 },
      ],
    },
  ],
};
