import type { Substep } from '../types';
import { word, nonsense } from '../build';

export const SUBSTEP_1_3: Substep = {
  id: '1.3',
  title: 'Three sounds with digraphs',
  parentSummary:
    'Your child practises three-sound words where two letters stand together and make one sound, such as sh in "hush" and ck in "deck". No new cards today: the work is hearing the pair as one sound and giving it one tap, at the start of a word or at the end.',
  groups: [
    {
      cards: [],
      lesson: [
        { say: 'No new cards today. Today we get faster at the letter pairs that make one sound.' },
        { show: ['sh', 'ch', 'th', 'ck'] },
        { say: 'Two letters standing side by side, one sound, one tap. The pair can come first or last in the word.' },
        { tap: 'shut' },
        { say: 'Your turn. Find the pair, tap it once, then finish the word.' },
        { try: 'chick' },
        { try: 'quack' },
        { try: 'mush' },
      ],
    },
  ],
  concepts: [],
  sightWords: ['she', 'he', 'we', 'be', 'me', 'they', 'of'],
  words: [
    // sh at the start and at the end
    word('shin', 'sh,i,n'), word('shut', 'sh,u,t'),
    word('cash', 'c,a,sh'), word('dash', 'd,a,sh'), word('mash', 'm,a,sh'),
    word('hush', 'h,u,sh'), word('mush', 'm,u,sh'), word('rush', 'r,u,sh'),
    // ch
    word('chick', 'ch,i,ck'), word('chug', 'ch,u,g'), word('chum', 'ch,u,m'),
    word('check', 'ch,e,ck'), word('such', 's,u,ch'),
    // th
    word('thud', 'th,u,d'), word('them', 'th,e,m'),
    word('math', 'm,a,th'), word('moth', 'm,o,th'),
    // wh and qu
    word('whiz', 'wh,i,z'), word('quack', 'qu,a,ck'),
    // ck at the end
    word('back', 'b,a,ck'), word('pack', 'p,a,ck'),
    word('lick', 'l,i,ck'), word('pick', 'p,i,ck'), word('sick', 's,i,ck'), word('tick', 't,i,ck'),
    word('deck', 'd,e,ck'), word('neck', 'n,e,ck'),
    word('lock', 'l,o,ck'),
    word('luck', 'l,u,ck'), word('tuck', 't,u,ck'),

    // nonsense: same three-sound shape, always with a pair
    nonsense('shom', 'sh,o,m'), nonsense('shup', 'sh,u,p'),
    nonsense('chet', 'ch,e,t'), nonsense('chog', 'ch,o,g'),
    nonsense('thip', 'th,i,p'), nonsense('thock', 'th,o,ck'),
    nonsense('whud', 'wh,u,d'), nonsense('quen', 'qu,e,n'), nonsense('quab', 'qu,a,b'),
    nonsense('zish', 'z,i,sh'), nonsense('yeth', 'y,e,th'), nonsense('wush', 'w,u,sh'),
  ],
  sentences: [
    'The chick is on the deck.',
    'She has a moth in a box.',
    'He shut the lid of the tub.',
    'We pick up the sock and the mug.',
    'The duck was sick and sad.',
    'They mash the fig with a rock.',
    'Math is not much fun.',
    'The chick is in the shed, and we hush.',
    'Tuck the cash in the red sock.',
  ],
  stories: [
    {
      title: 'The Chick and the Duck',
      sentences: [
        'A duck and a chick sit on a rock.',
        'The duck is in the mud.',
        'The duck has a quick dash in the mud.',
        'Mud is on the chick.',
        'The chick is wet.',
        'The chick and the duck rush to the deck.',
        'They nap in the sun on the deck.',
      ],
      questions: [
        { prompt: 'Who gets wet?', choices: ['the chick', 'the rock', 'the sun'], answer: 0 },
        { prompt: 'Where do the chick and the duck nap?', choices: ['on the deck', 'in the mud', 'in the shed'], answer: 0 },
      ],
    },
    {
      title: 'Cash in the Sock',
      sentences: [
        'The kid has cash in a red sock.',
        'The sock is in a box in the shed.',
        'A duck and a chick check the box.',
        'The duck is quick, and he has the sock.',
        'The kid and the duck run to the shop.',
        'The kid has a fig.',
        'The duck has a fish.',
        'They sit in the sun and chat.',
      ],
      questions: [
        { prompt: 'What is in the red sock?', choices: ['cash', 'a fig', 'a fish'], answer: 0 },
        { prompt: 'Where do the kid and the duck go?', choices: ['to the shop', 'to the shed', 'to the box'], answer: 0 },
      ],
    },
  ],
};
