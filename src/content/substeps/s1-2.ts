import type { Substep } from '../types';
import { cvc, cvcNonsense, word, nonsense } from '../build';

export const SUBSTEP_1_2: Substep = {
  id: '1.2',
  title: 'New sounds, a few at a time',
  parentSummary:
    'Your child learns the rest of the single consonants, b, h, j, c, k, v, w, x, y and z, plus the two remaining short vowels, u as in up and e as in Ed. They also meet the first letter pairs that are tapped as a single sound, sh, ck, ch, th, qu and wh, so a word like "bug" is three taps and "chip" is three taps too.',
  groups: [
    {
      cards: ['b', 'sh', 'u'],
      lesson: [
        { say: 'Three new cards today. B is the first sound in bat, s and h together are the first sound in ship, and u is the short vowel in up.' },
        { show: ['b', 'sh', 'u'] },
        { say: 'The letters s and h stand side by side and make one sound, so they get one tap, not two.' },
        { tap: 'bug' },
        { say: 'Your turn. Tap each sound in order, then swipe to say the word.' },
        { try: 'tub' },
        { try: 'ship' },
        { try: 'sun' },
      ],
    },
    {
      cards: ['h', 'j', 'c', 'k', 'ck'],
      lesson: [
        { say: 'Five new cards. H is the first sound in hat, j is the first sound in jug, and c, k and ck all make the same sound, the one at the start of cat.' },
        { show: ['h', 'j', 'c', 'k', 'ck'] },
        { say: 'We use ck at the end of a short word, right after the vowel, and it gets one tap.' },
        { tap: 'duck' },
        { say: 'Your turn. Listen for the sound you hear at the end of duck.' },
        { try: 'hat' },
        { try: 'jog' },
        { try: 'kick' },
      ],
    },
    {
      cards: ['e', 'v', 'w'],
      lesson: [
        { say: 'Three new cards. E is the short vowel in Ed, v is the first sound in vet, and w is the first sound in wig.' },
        { show: ['e', 'v', 'w'] },
        { say: 'Short e is easy to mix up with short i, so listen hard for the sound in the middle of bed.' },
        { tap: 'wet' },
        { say: 'Your turn. Say the vowel sound out loud before you swipe.' },
        { try: 'bed' },
        { try: 'vet' },
        { try: 'wig' },
      ],
    },
    {
      cards: ['x', 'y', 'z'],
      lesson: [
        { say: 'Three new cards. X is the last sound in fox, y is the first sound in yak, and z is the first sound in zip.' },
        { show: ['x', 'y', 'z'] },
        { say: 'X is the odd one out. One letter, two sounds squashed together, and still just one tap.' },
        { tap: 'fox' },
        { say: 'Your turn. The x at the end is still just one tap.' },
        { try: 'six' },
        { try: 'yes' },
        { try: 'zip' },
      ],
    },
    {
      cards: ['ch', 'th', 'qu', 'wh'],
      lesson: [
        { say: 'Four new pairs today: ch, th, qu and wh. Each pair gets one tap.' },
        { show: ['ch', 'th', 'qu', 'wh'] },
        { say: 'Two letters, one tap. The letter q always brings u along, and together they make the first sound in queen.' },
        { tap: 'chip' },
        { say: 'Your turn. Tap the pair once, then finish the word.' },
        { try: 'thin' },
        { try: 'quit' },
        { try: 'when' },
      ],
    },
  ],
  concepts: [],
  sightWords: ['to', 'has', 'his', 'was', 'I', 'you', 'as'],
  words: [
    // Group 1: b, sh, u
    cvc('bat'), cvc('big'), cvc('bud'), cvc('bug'),
    cvc('tub'), cvc('rub'), cvc('mud'), cvc('mug'), cvc('rug'),
    cvc('sun'), cvc('run'), cvc('fun'),
    word('up', 'u,p'), word('us', 'u,s'),
    word('ship', 'sh,i,p'), word('shop', 'sh,o,p'),
    word('fish', 'f,i,sh'), word('dish', 'd,i,sh'),
    cvcNonsense('bup'), nonsense('shob', 'sh,o,b'), cvcNonsense('lup'), cvcNonsense('mup'),

    // Group 2: h, j, c, k, ck
    cvc('hat'), cvc('hit'), cvc('hop'), cvc('hug'), cvc('hut'),
    cvc('jog'), cvc('jug'),
    cvc('cat'), cvc('cup'), cvc('cut'),
    cvc('kid'), cvc('kit'),
    word('kick', 'k,i,ck'), word('sock', 's,o,ck'), word('rock', 'r,o,ck'), word('duck', 'd,u,ck'),
    cvcNonsense('jop'), cvcNonsense('kib'), cvcNonsense('cug'), nonsense('gock', 'g,o,ck'),

    // Group 3: e, v, w
    cvc('bed'), cvc('red'), cvc('web'), cvc('wet'),
    cvc('pet'), cvc('pen'), cvc('ten'), cvc('hen'), cvc('jet'), cvc('net'),
    cvc('vet'), cvc('vat'),
    cvc('leg'), cvc('wig'), cvc('wag'),
    word('wish', 'w,i,sh'), word('shed', 'sh,e,d'),
    cvcNonsense('veb'), cvcNonsense('wug'), nonsense('vish', 'v,i,sh'), cvcNonsense('wep'),

    // Group 4: x, y, z
    cvc('box'), cvc('fox'), cvc('six'), cvc('mix'), cvc('fix'), cvc('wax'), word('ox', 'o,x'),
    cvc('yes'), cvc('yet'), cvc('yak'), cvc('yum'),
    cvc('zip'), cvc('zap'), cvc('zig'), cvc('zag'),
    cvcNonsense('zot'), cvcNonsense('zub'), cvcNonsense('yeb'), cvcNonsense('wix'),

    // Group 5: ch, th, qu, wh
    word('chip', 'ch,i,p'), word('chop', 'ch,o,p'), word('chin', 'ch,i,n'), word('chat', 'ch,a,t'),
    word('much', 'm,u,ch'), word('rich', 'r,i,ch'),
    word('thin', 'th,i,n'), word('thick', 'th,i,ck'), word('that', 'th,a,t'), word('this', 'th,i,s'), word('then', 'th,e,n'),
    word('with', 'w,i,th'), word('bath', 'b,a,th'), word('path', 'p,a,th'),
    word('quit', 'qu,i,t'), word('quiz', 'qu,i,z'), word('quick', 'qu,i,ck'),
    word('whip', 'wh,i,p'), word('when', 'wh,e,n'), word('which', 'wh,i,ch'),
    nonsense('chob', 'ch,o,b'), nonsense('thup', 'th,u,p'), nonsense('quib', 'qu,i,b'), nonsense('whep', 'wh,e,p'),
  ],
  sentences: [
    'The bug is in the tub.',
    'The big fish is in the dish.',
    'A bug in the mud has fun.',
    'The sun is up on the ship.',
    'You and I nap in the sun.',
    'The kid has a duck in his sock.',
    'Hop up and hug the cat.',
    'Hop to the rock and hop to the log.',
    'The red hen is wet.',
    'The wet vet has a red wig.',
    'I wish I was a big fish.',
    'Fix the box and zip it up.',
    'The ox is as big as a rock.',
    'The thin chip is in the dish.',
  ],
  stories: [
    {
      title: 'The Bug in the Tub',
      sentences: [
        'A bug is in the tub.',
        'The tub has mud in it.',
        'The bug is not sad.',
        'The bug has fun in the mud.',
        'A big rat sat on the tub.',
        'The rat and the bug nap in the sun.',
      ],
      questions: [
        { prompt: 'What is in the tub?', choices: ['a bug', 'a rat', 'a fish'], answer: 0 },
        { prompt: 'Where do the rat and the bug nap?', choices: ['in the sun', 'in the shop', 'on the mat'], answer: 0 },
      ],
    },
    {
      title: 'Chip the Duck',
      sentences: [
        'Chip is a duck with a red hat.',
        'Chip has a hut at the fish shop.',
        'This shop has fish in it.',
        'A thin cat sat on the hut.',
        'Chip was not mad at the cat.',
        'Chip and the cat chat in the sun.',
        'The cat and Chip nap on a big rug.',
      ],
      questions: [
        { prompt: 'Who sat on the hut?', choices: ['a thin cat', 'a big duck', 'a red hen'], answer: 0 },
        { prompt: 'What do Chip and the cat do at the end?', choices: ['nap on a rug', 'run to the shop', 'sit in the tub'], answer: 0 },
      ],
    },
  ],
};
