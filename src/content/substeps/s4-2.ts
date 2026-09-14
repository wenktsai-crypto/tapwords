import type { Substep } from '../types';
import { word, nonsense } from '../build';

export const SUBSTEP_4_2: Substep = {
  id: '4.2',
  title: 'Silent e with o and u',
  parentSummary:
    'Your child has already met the e that says nothing and makes the vowel in front of it say its name, as in "cake" and "ride". This section gives that same rule two more vowels: o, as in hope and stone, and u, as in mule and cube. The u-e pattern has a second sound, the one in "rule", and that is held back for the next section, so every u word here says yoo.',
  groups: [
    {
      cards: ['o_e'],
      lesson: [
        { say: 'You already know what a silent e does. It says nothing at all, and it makes the vowel in front of it say its name. Nothing about that rule changes today. Only the vowel changes.' },
        { show: ['o_e'] },
        { say: 'Here is the new card. An o, then a gap where a consonant sits, then the silent e.' },
        { say: 'When a word ends this way, the e reaches back and makes the o say its name, oh.' },
        { tap: 'hope' },
        { say: 'Hope has four letters and three sounds, exactly like cake. The e gets no dot, so you never tap it. The curved line shows the job it is doing.' },
        { say: 'Your turn. Look at the end of the word before you start, then tap the sounds in order.' },
        { try: 'home' },
        { try: 'note' },
        { try: 'rope' },
        { try: 'woke' },
      ],
    },
    {
      cards: ['u_e'],
      lesson: [
        { say: 'One more vowel, and again the rule is the same one you have been using. A silent e at the end, and the vowel in front of it says its name.' },
        { show: ['u_e'] },
        { say: 'The name of this letter is yoo. In a word like this one, yoo is what it says.' },
        { tap: 'mule' },
        { say: 'Mule has four letters and three sounds, the same shape as hope. Three dots, and the line running back from the e to the u.' },
        { say: 'Your turn. Leave the last e alone.' },
        { try: 'cube' },
        { try: 'cute' },
        { try: 'mute' },
        { try: 'fume' },
      ],
    },
  ],
  // silent-e was introduced in 4.1 and concepts are cumulative.
  concepts: [],
  // Nothing new is needed: every word the sentences and stories use is either taught by 4.2 or
  // already in an earlier bank or sight list.
  sightWords: [],
  words: [
    // Group 1: o and silent e. Every one of these says the long o, /oh/. Words where the o takes
    // some other sound are out, however they are spelled: gone, done, none, come, some, love,
    // dove, glove and one all say something else, and move, prove and lose say /oo/. Words where
    // an r follows the o (more, core, store) are r-controlled, not long o, and are out too. So is
    // every word where the s would say /z/: rose, nose, hose, chose, those, close, doze, pose.
    word('hope', 'h,o:o_e,p,e:e_silent'),
    word('rope', 'r,o:o_e,p,e:e_silent'),
    word('mope', 'm,o:o_e,p,e:e_silent'),
    word('home', 'h,o:o_e,m,e:e_silent'),
    word('dome', 'd,o:o_e,m,e:e_silent'),
    word('bone', 'b,o:o_e,n,e:e_silent'),
    word('cone', 'c,o:o_e,n,e:e_silent'),
    word('tone', 't,o:o_e,n,e:e_silent'),
    word('zone', 'z,o:o_e,n,e:e_silent'),
    word('lone', 'l,o:o_e,n,e:e_silent'),
    word('stone', 's,t,o:o_e,n,e:e_silent'),
    word('note', 'n,o:o_e,t,e:e_silent'),
    word('vote', 'v,o:o_e,t,e:e_silent'),
    word('hole', 'h,o:o_e,l,e:e_silent'),
    word('pole', 'p,o:o_e,l,e:e_silent'),
    word('mole', 'm,o:o_e,l,e:e_silent'),
    word('role', 'r,o:o_e,l,e:e_silent'),
    word('joke', 'j,o:o_e,k,e:e_silent'),
    word('poke', 'p,o:o_e,k,e:e_silent'),
    word('woke', 'w,o:o_e,k,e:e_silent'),
    word('spoke', 's,p,o:o_e,k,e:e_silent'),
    word('code', 'c,o:o_e,d,e:e_silent'),
    word('rode', 'r,o:o_e,d,e:e_silent'),
    word('mode', 'm,o:o_e,d,e:e_silent'),
    word('robe', 'r,o:o_e,b,e:e_silent'),
    word('cove', 'c,o:o_e,v,e:e_silent'),

    // Group 2: u and silent e, saying its name, /yoo/. This is a short list on purpose. The other
    // sound of u-e, the /oo/ in rule, June and flute, has its own card and waits for 4.3, so a
    // word a speaker might say either way (tube, duke, dune) cannot go here. "huge" is out as
    // well: its g says /j/, and the g card says /g/. "use", "fuse" and "muse" are out because
    // their s says /z/. "cure" and "pure" are out because the r takes the vowel over.
    word('mule', 'm,u:u_e,l,e:e_silent'),
    word('cube', 'c,u:u_e,b,e:e_silent'),
    word('cute', 'c,u:u_e,t,e:e_silent'),
    word('mute', 'm,u:u_e,t,e:e_silent'),
    word('fume', 'f,u:u_e,m,e:e_silent'),

    // Nonsense, group 1 pattern. Each one was walked letter by letter, every position against
    // every letter of the alphabet and every single-letter deletion, against the dictionary and
    // against rude words. The whole -oke family was dropped: noke and voke are one letter from
    // moke, coke and toke. wope was dropped because deleting its e leaves an ethnic slur. fome,
    // lofe, kope and gole were dropped as sound-alikes of foam, loaf, cope and goal, and bofe
    // because it is how "both" gets written in some dialects. The bar is not English-only:
    // jode and fode had to go as well, being everyday obscenities in Spanish and Portuguese,
    // the same reason pute was never a candidate.
    nonsense('vode', 'v,o:o_e,d,e:e_silent'),
    nonsense('zode', 'z,o:o_e,d,e:e_silent'),
    nonsense('pode', 'p,o:o_e,d,e:e_silent'),
    nonsense('nole', 'n,o:o_e,l,e:e_silent'),
    nonsense('jole', 'j,o:o_e,l,e:e_silent'),
    nonsense('zole', 'z,o:o_e,l,e:e_silent'),
    nonsense('zote', 'z,o:o_e,t,e:e_silent'),
    nonsense('fote', 'f,o:o_e,t,e:e_silent'),
    nonsense('gome', 'g,o:o_e,m,e:e_silent'),
    nonsense('zome', 'z,o:o_e,m,e:e_silent'),
    nonsense('nofe', 'n,o:o_e,f,e:e_silent'),

    // Nonsense, group 2 pattern. The -ube, -ude and -uke families were all dropped: they sit one
    // letter from lube, nude, rude, dude, nuke and puke. bume was dropped because deleting its e
    // leaves "bum", and fule because it sounds like "fuel".
    nonsense('hute', 'h,u:u_e,t,e:e_silent'),
    nonsense('vute', 'v,u:u_e,t,e:e_silent'),
    nonsense('vume', 'v,u:u_e,m,e:e_silent'),
    nonsense('hule', 'h,u:u_e,l,e:e_silent'),
  ],
  sentences: [
    // Readable at group 1: not one u_e word among them.
    'Nan put the note on the desk.',
    'Sam had a big hole in his sock.',
    'We rode up the hill in the sun.',
    'The rope was long and thick.',
    'I hope the cat can jump over the box.',
    'A big stone fell into the pond.',
    'Dan told us a joke at the picnic.',
    'The red robe was on the bed.',
    'Pam woke up when the bell rang.',
    // Group 2 adds u_e.
    'The mule went up the path with a big pack.',
    'Jan has a cute red cup.',
    'Sam put the cube in his pack.',
    'Do not mute the song.',
    'A fume came up from the hot pan.',
  ],
  stories: [
    {
      // Group 1 can read this one on its own: every silent-e word in it uses o, never u.
      title: 'The Cat in the Hole',
      sentences: [
        'Pam woke up on a hot day and let the cat out.',
        'At sunset the cat did not come back.',
        'Pam ran up and down the path, but the cat was not there.',
        'Then she saw a big stone, and a hole in the sand.',
        'The cat was in the hole, and he could not jump out.',
        'Pam ran home and told Dan.',
        'Dan came back with a long rope.',
        'He let the rope down into the hole.',
        'The cat got on the rope, and Dan lifted the cat out.',
        'Pam was glad, and she gave the cat a big hug.',
        'Then Dan put the big stone over the hole.',
        'Now the cat cannot fall in again.',
      ],
      questions: [
        {
          prompt: 'Where did Pam find the cat?',
          choices: ['in the hole', 'on the path', 'at home'],
          answer: 0,
        },
        {
          prompt: 'What did Dan let down into the hole?',
          choices: ['a rope', 'a stone', 'a cat'],
          answer: 0,
        },
        {
          prompt: 'What did Dan put over the hole at the end?',
          choices: ['a big stone', 'a long rope', 'the cat'],
          answer: 0,
        },
      ],
    },
    {
      title: 'The Mule and the Stone',
      sentences: [
        'Dan had a mule with a big red pack on his back.',
        'The mule was cute, but he was not quick.',
        'In the pack was a big yam for the mule.',
        'One hot day they went up the path to the camp on the hill.',
        'Then they came to a big stone in the path.',
        'The mule would not step over it.',
        'Dan did not want to run back down the long hill.',
        'He got a long rope out of the pack.',
        'Dan put the rope on the stone, and then on the mule.',
        'The mule went back down the path, and the big stone went too.',
        'The stone fell off the path and into the pond.',
        'Then Dan and the mule went on up the hill.',
        'At sunset they got to the camp.',
        'Dan gave the mule the big yam and a hug.',
      ],
      questions: [
        {
          prompt: 'What blocked the path up the hill?',
          choices: ['a big stone', 'a long rope', 'a red pack'],
          answer: 0,
        },
        {
          prompt: 'How did Dan get the stone out of the path?',
          choices: ['with the rope and the mule', 'with the pack', 'with a yam'],
          answer: 0,
        },
        {
          prompt: 'What did Dan give the mule at the camp?',
          choices: ['a big yam and a hug', 'a long rope', 'a red pack'],
          answer: 0,
        },
      ],
    },
  ],
};
