import type { Substep } from '../types';
import { word, nonsense } from '../build';

export const SUBSTEP_2_1: Substep = {
  id: '2.1',
  title: 'Welded sounds: ang, ing, ong, ung, ank, ink, onk, unk',
  parentSummary:
    'Your child learns eight more welded chunks that always keep their letters together: ang, ing, ong, ung, ank, ink, onk, and unk. A word like "bang" is two taps, b and ang, and "pink" is two taps, p and ink.',
  groups: [
    {
      cards: ['ang', 'ing', 'ong', 'ung', 'ank', 'ink', 'onk', 'unk'],
      lesson: [
        { say: 'Today we meet eight new chunks. Each one welds a vowel to ng or nk, and we tap the whole chunk once.' },
        { show: ['ang', 'ing', 'ong', 'ung'] },
        { say: 'The g at the end never gets its own tap. It is stuck to the vowel before it, so bang is just two taps, b and ang.' },
        { tap: 'bang' },
        { try: 'king' },
        { try: 'song' },
        { show: ['ank', 'ink', 'onk', 'unk'] },
        { tap: 'pink' },
        { try: 'thank' },
        { try: 'junk' },
      ],
    },
  ],
  concepts: [],
  sightWords: ['your', 'there', 'their', 'who'],
  words: [
    // ang
    word('bang', 'b,ang'), word('fang', 'f,ang'), word('hang', 'h,ang'), word('rang', 'r,ang'), word('sang', 's,ang'),
    // ing
    word('king', 'k,ing'), word('ring', 'r,ing'), word('sing', 's,ing'), word('wing', 'w,ing'), word('thing', 'th,ing'),
    // ong
    word('long', 'l,ong'), word('song', 's,ong'), word('gong', 'g,ong'),
    // ung
    word('hung', 'h,ung'), word('lung', 'l,ung'), word('sung', 's,ung'),
    // ank
    word('bank', 'b,ank'), word('tank', 't,ank'), word('thank', 'th,ank'), word('sank', 's,ank'),
    // ink
    word('pink', 'p,ink'), word('sink', 's,ink'), word('wink', 'w,ink'), word('think', 'th,ink'),
    // onk
    word('honk', 'h,onk'), word('bonk', 'b,onk'),
    // unk
    word('junk', 'j,unk'), word('bunk', 'b,unk'), word('dunk', 'd,unk'),

    // Nonsense words, seven of the eight patterns. There is no made-up ink word on purpose: a
    // single consonant in front of ink always lands one letter away from a slur, and the real
    // words pink, sink, wink and think already give the child that chunk.
    nonsense('zang', 'z,ang'),
    nonsense('ving', 'v,ing'),
    nonsense('zong', 'z,ong'),
    nonsense('wung', 'w,ung'), nonsense('thung', 'th,ung'),
    nonsense('quank', 'qu,ank'),
    nonsense('fonk', 'f,onk'), nonsense('thonk', 'th,onk'),
    nonsense('zunk', 'z,unk'), nonsense('vunk', 'v,unk'),
  ],
  sentences: [
    'The king can sing a long song.',
    'A red hen has a big wing.',
    'Who has a pink fish?',
    'The bell rang and rang.',
    'Sam and Pam sing in the sun.',
    'The kid can dunk a doll in the tub.',
    'There is a pink bank on the bed.',
    'The man can honk at their duck.',
  ],
  stories: [
    {
      title: 'The King Who Can Sing',
      sentences: [
        'A king is on a big bed.',
        'A red hen is with the king.',
        'He can sing a long song.',
        'The king can wink at the hen.',
        'The hen can hop on the bed.',
        'The king and the hen sing a long song.',
      ],
      questions: [
        { prompt: 'What can the king sing?', choices: ['a long song', 'a big bed', 'a red hen'], answer: 0 },
        { prompt: 'Who can wink?', choices: ['the king', 'the hen', 'the bed'], answer: 0 },
      ],
    },
    {
      title: 'The Pink Sock in the Tank',
      sentences: [
        'Sam has a pink sock.',
        'Sam has a big tank.',
        'The sock can sink in the tank.',
        'The pink sock is in the tank.',
        'Sam and Pam sit at the tank.',
        'Pam has fun with the sock.',
        'Sam and Pam hang the sock in the sun.',
      ],
      questions: [
        { prompt: 'What is in the tank?', choices: ['the pink sock', 'the big tank', 'Pam'], answer: 0 },
        { prompt: 'Who has fun with the sock?', choices: ['Pam', 'Sam', 'the tank'], answer: 0 },
      ],
    },
  ],
};
