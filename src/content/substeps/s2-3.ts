import type { Substep } from '../types';
import { word, nonsense } from '../build';

export const SUBSTEP_2_3: Substep = {
  id: '2.3',
  title: 'The odd ones: ild, ind, old, ost, olt',
  parentSummary:
    'Your child learns five endings, ild, ind, old, ost and olt, where the vowel keeps its long sound even though the syllable looks closed, as in "wild" and "cold". Each ending stays together and gets one tap, just like the welded sounds learned before.',
  groups: [
    {
      cards: ['ild', 'ind', 'old', 'ost', 'olt'],
      lesson: [
        {
          say: 'Today we meet five chunks that break the short vowel rule. In ild, ind, old, ost and olt, the vowel says its own name even though the word looks closed.',
        },
        { show: ['ild', 'ind', 'old'] },
        { say: 'Tap the first sound, then tap the whole chunk at the end, then swipe to say the word.' },
        { tap: 'cold' },
        { try: 'find' },
        { try: 'wild' },
        { show: ['ost', 'olt'] },
        { tap: 'most' },
        { try: 'bolt' },
        { try: 'gold' },
      ],
    },
  ],
  concepts: [],
  sightWords: ['some', 'would', 'could', 'should'],
  words: [
    // ild
    word('wild', 'w,ild'), word('mild', 'm,ild'), word('child', 'ch,ild'),
    // ind
    word('find', 'f,ind'), word('kind', 'k,ind'), word('mind', 'm,ind'), word('bind', 'b,ind'),
    word('blind', 'b,l,ind'), word('grind', 'g,r,ind'), word('hind', 'h,ind'),
    // old
    word('old', 'old'), word('bold', 'b,old'), word('cold', 'c,old'), word('fold', 'f,old'),
    word('gold', 'g,old'), word('hold', 'h,old'), word('mold', 'm,old'), word('sold', 's,old'),
    word('told', 't,old'), word('scold', 's,c,old'),
    // ost
    word('most', 'm,ost'), word('host', 'h,ost'), word('post', 'p,ost'),
    // olt
    word('bolt', 'b,olt'), word('colt', 'c,olt'), word('jolt', 'j,olt'), word('molt', 'm,olt'),
    // nonsense, same five patterns
    nonsense('pild', 'p,ild'), nonsense('vild', 'v,ild'),
    nonsense('zind', 'z,ind'), nonsense('shind', 'sh,ind'),
    nonsense('dold', 'd,old'), nonsense('thold', 'th,old'), nonsense('yold', 'y,old'),
    nonsense('fost', 'f,ost'), nonsense('quost', 'qu,ost'), nonsense('chost', 'ch,ost'), nonsense('flost', 'f,l,ost'),
    nonsense('nolt', 'n,olt'),
  ],
  sentences: [
    'The child has a gold bolt.',
    'Sam is kind and bold.',
    'The old hen can hold a fan.',
    'Jan will not fold the map.',
    'The fox sat in the cold mud.',
    'Would Pam sell the old doll?',
    'Could the child find a gold van?',
    'Should Sam hold the wet fish?',
    'Sam will have some fun in the mud.',
  ],
  stories: [
    {
      title: 'The Gold Bolt',
      sentences: [
        'The child is in the cold.',
        'A gold bolt is in the mud.',
        'The child can find the gold bolt.',
        'The child can hold the gold bolt.',
        'The bolt is old and cold.',
        'The child and Sam sit in the sun.',
      ],
      questions: [
        { prompt: 'What is in the mud?', choices: ['a gold bolt', 'the sun', 'the cold'], answer: 0 },
        { prompt: 'Who can hold the gold bolt?', choices: ['the child', 'Sam', 'the bolt'], answer: 0 },
      ],
    },
    {
      title: 'The Bold Colt',
      sentences: [
        'Sam has a bold colt.',
        'The colt is not tall.',
        'Dan would sell the colt.',
        'Sam does not sell the colt.',
        'The colt is old and kind.',
        'The colt and Sam sit in the sun.',
      ],
      questions: [
        { prompt: 'Who has the bold colt?', choices: ['Sam', 'Dan', 'the sun'], answer: 0 },
        { prompt: 'Who would sell the colt?', choices: ['Dan', 'Sam', 'the colt'], answer: 0 },
      ],
    },
  ],
};
