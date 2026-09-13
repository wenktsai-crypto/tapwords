import type { Substep } from '../types';
import { cvc, cvcNonsense, word, nonsense } from '../build';

export const SUBSTEP_2_2: Substep = {
  id: '2.2',
  title: 'Four sounds in a word',
  parentSummary:
    'Your child taps words that pack two consonant sounds next to each other, at the start or the end of the word, like "flag" and "jump". No new cards today: every sound still gets its own tap, so these words take four taps instead of three.',
  groups: [
    {
      cards: [],
      lesson: [
        { say: 'Today some words have two consonant sounds right next to each other, like the f and the l at the start of flag.' },
        { show: ['f', 'l', 'a', 'g'] },
        { say: 'Each sound in the pair still gets its own tap. Do not squash the two sounds into one.' },
        { tap: 'flag' },
        { say: 'Now you try. Tap every sound in order, even when two sounds sit side by side.' },
        { try: 'stop' },
        { try: 'jump' },
        { try: 'hand' },
        { try: 'brush' },
      ],
    },
  ],
  concepts: ['blend'],
  sightWords: ['two', 'too', 'very', 'come'],
  words: [
    // Real words: a consonant pair at the start, the end, or both, every word four taps.
    cvc('flag'), cvc('step'), cvc('stop'), cvc('spot'), cvc('slip'), cvc('clap'), cvc('drop'),
    cvc('grab'), cvc('trip'), cvc('swim'), cvc('snap'), cvc('plug'), cvc('glad'), cvc('club'),
    cvc('crab'), cvc('frog'), cvc('milk'), cvc('help'), cvc('jump'), cvc('lamp'), cvc('camp'),
    cvc('hand'), cvc('sand'), cvc('band'), cvc('land'), cvc('bend'), cvc('best'), cvc('fast'),
    cvc('must'), cvc('lift'), cvc('desk'), cvc('raft'), cvc('pond'),
    word('brush', 'b,r,u,sh'),

    // Nonsense words, same four-sound shape.
    cvcNonsense('flib'), cvcNonsense('stog'), cvcNonsense('plim'), cvcNonsense('trup'),
    cvcNonsense('drep'), cvcNonsense('snup'), cvcNonsense('glup'), cvcNonsense('tesk'),
    cvcNonsense('mulp'), cvcNonsense('vand'), cvcNonsense('brop'),
    nonsense('clesh', 'c,l,e,sh'),
  ],
  sentences: [
    'The frog can jump on the raft.',
    'The crab and the frog sit in the sand.',
    'The frog can swim fast in the pond.',
    'Grab the flag and run to the van.',
    'The kid can help the frog.',
    'The pen is on the desk.',
    'The frog can clap and jump.',
    'A crab has a red shell.',
    'The frog and the crab land on the raft.',
  ],
  stories: [
    {
      title: 'The Frog on the Raft',
      sentences: [
        'A frog sat on a raft.',
        'The raft was on a big pond.',
        'A crab sat on the raft too.',
        'The raft can not stop.',
        'The frog must jump fast.',
        'The frog can jump on the sand.',
        'The crab can jump on the sand too.',
        'The frog and the crab sit on the sand.',
      ],
      questions: [
        { prompt: 'Where did the frog sit?', choices: ['on a raft', 'on the sand', 'in the pond'], answer: 0 },
        { prompt: 'What did the frog do?', choices: ['jump fast', 'sit in the pond', 'stop the raft'], answer: 0 },
      ],
    },
    {
      title: 'The Crab and the Flag',
      sentences: [
        'A crab sat on the sand.',
        'A flag was on the sand too.',
        'The crab can grab the flag.',
        'A frog can jump on the sand.',
        'The frog and the crab have the flag.',
        'The crab can snap and hop.',
        'The frog and the crab jump fast.',
        'The frog and the crab sit and nap.',
      ],
      questions: [
        { prompt: 'What did the crab grab?', choices: ['the flag', 'the sand', 'the frog'], answer: 0 },
        { prompt: 'Who has the flag?', choices: ['the frog and the crab', 'the crab', 'the frog'], answer: 0 },
      ],
    },
  ],
};
