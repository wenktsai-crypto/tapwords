import type { Substep } from '../types';
import { cvc, cvcNonsense, word, nonsense } from '../build';

export const SUBSTEP_1_1: Substep = {
  id: '1.1',
  title: 'First sounds and short words',
  parentSummary:
    'Your child learns the sounds for f, l, m, n, r, s, d, g, p, t and the short vowels a, i, o. They tap out and blend words with two or three sounds, like "map" and "sit".',
  groups: [
    {
      cards: ['f', 'l', 'm', 'n', 'r', 's', 'd', 'g', 'p', 't', 'a', 'i', 'o'],
      lesson: [
        { say: 'Today we start with sounds. Each card shows a letter and makes one sound.' },
        { show: ['m', 'a', 'p'] },
        { say: 'Every word is made of sounds. Let us tap the word map. One tap for each sound, then swipe to blend.' },
        { tap: 'map' },
        { say: 'Now you try. Tap each sound in order, then swipe to say the word.' },
        { try: 'map' },
        { try: 'sit' },
        { try: 'log' },
      ],
    },
  ],
  concepts: [],
  sightWords: ['the', 'a', 'is', 'and', 'on', 'in'],
  words: [
    // real: initial f l m n r s, vowel a i o, final d g p t
    cvc('fat'), cvc('fad'), cvc('fig'), cvc('fit'), cvc('fog'),
    cvc('lap'), cvc('lad'), cvc('lag'), cvc('lid'), cvc('lip'), cvc('lit'), cvc('log'), cvc('lot'), cvc('lop'),
    cvc('map'), cvc('mat'), cvc('mad'), cvc('mid'), cvc('mop'),
    cvc('nap'), cvc('nag'), cvc('nit'), cvc('nod'), cvc('not'),
    cvc('rag'), cvc('rat'), cvc('rap'), cvc('rid'), cvc('rig'), cvc('rip'), cvc('rot'), cvc('rod'),
    cvc('sat'), cvc('sad'), cvc('sap'), cvc('sag'), cvc('sit'), cvc('sip'), cvc('sod'),
    word('at', 'a,t'), word('it', 'i,t'),
    // nonsense
    cvcNonsense('fip'), cvcNonsense('lod'), cvcNonsense('rog'), cvcNonsense('rop'), cvcNonsense('mot'),
    cvcNonsense('fod'), cvcNonsense('lig'), cvcNonsense('lat'), cvcNonsense('rit'), cvcNonsense('sog'),
    cvcNonsense('mig'), cvcNonsense('fot'), cvcNonsense('mog'),
    nonsense('ip', 'i,p'), nonsense('og', 'o,g'),
  ],
  sentences: [
    'The rat sat on a log.',
    'The map is on the mat.',
    'A fig is on the lid.',
    'The lad is mad.',
    'Sit on the log and nap.',
    'The rat is fat.',
    'Nod at the lad.',
    'The mop is in the fog.',
  ],
  stories: [
    {
      title: 'Rat on a Log',
      sentences: [
        'A rat is on a log.',
        'The rat is fat.',
        'The log is in the fog.',
        'A fig is in the fog.',
        'The fig is on the log.',
        'The fat rat is on the fig.',
      ],
      questions: [
        { prompt: 'Where is the rat at the start of the story?', choices: ['on a log', 'in the fog', 'on a rat'], answer: 0 },
        { prompt: 'What is on the log at the end?', choices: ['a fig', 'the fog', 'a log'], answer: 0 },
      ],
    },
    {
      title: 'The Lad and the Map',
      sentences: [
        'The lad is on the mat.',
        'The lad is sad.',
        'The map is not on the mat.',
        'The map is on the lid.',
        'The lad is at the map.',
      ],
      questions: [{ prompt: 'Where is the map?', choices: ['on the lid', 'on the mat', 'on the lad'], answer: 0 }],
    },
  ],
};
