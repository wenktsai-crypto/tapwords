import type { Substep } from '../types';
import { word, nonsense } from '../build';

export const SUBSTEP_4_3: Substep = {
  id: '4.3',
  title: 'Silent e with e, and u_e saying oo',
  parentSummary:
    'This is the last vowel to get a silent e: e itself, as in Pete and theme. It is the rarest of the five, so the word list here is short on purpose rather than padded with words that would teach the wrong sound. The section also gives the u pattern its second sound, the oo in rule and flute, and teaches your child to try one sound and then the other when the first does not make a word she knows.',
  groups: [
    // One group, two cards. A group exists so the sound-card drill can bring in one new card
    // face at a time, and u_e_oo is not a new face: it is a second sound for the u_e card she
    // already has, never drilled on its own. A group of its own would drill nothing but e_e,
    // a card taught minutes earlier.
    {
      cards: ['e_e', 'u_e_oo'],
      lesson: [
        { say: 'You have used the silent e with four vowels now: a, i, o and u. One vowel is left, and it is the one you might not expect. It is e.' },
        { show: ['e_e'] },
        { say: 'Here is the new card. An e, then a gap where a consonant sits, then the silent e at the end.' },
        { say: 'The e at the end still says nothing. Its job is the same as ever: it reaches back and makes the first e say its name, ee.' },
        { tap: 'Pete' },
        { say: 'Pete has four letters and three sounds, the same shape as cake. The last e gets no dot, so you never tap it. The curved line shows the job it is doing.' },
        { say: 'This one is rare. There are only a handful of short words built this way, and you are about to meet most of them.' },
        { try: 'theme' },
        { try: 'eve' },
        { try: 'Steve' },
        { try: 'Zeke' },
        { say: 'Now something different. There is no new card here. The letters are ones you already know.' },
        { say: 'Think back to mule and cube. A u with a silent e says its name, yoo.' },
        { show: ['u_e'] },
        { say: 'Same letters, same silent e, and a second sound. This spelling can also say oo.' },
        { tap: 'rule' },
        { say: 'Rule has four letters and three sounds, exactly like mule. Only the middle sound is different.' },
        { say: 'So when you meet a u with a silent e, try one sound. If it does not make a word you know, back up and try the other one.' },
        { try: 'June' },
        { try: 'flute' },
        { try: 'prune' },
        { try: 'rude' },
      ],
    },
  ],
  // silent-e was introduced in 4.1 and concepts are cumulative.
  concepts: [],
  // Nothing new is needed: every word in the sentences and stories is either taught here or
  // already in an earlier bank or sight list.
  sightWords: [],
  words: [
    // e and silent e. This was the whole honest supply of one-syllable words at five, one short
    // of the checker's floor of 20 real words for the whole bank. Every other candidate breaks
    // the one-sound rule or belongs to a later section:
    //   these (s says /z/), scene (c says /s/), gene (g says /j/), cede (c says /s/),
    //   here and mere (the r takes the vowel over), use and fuse (s says /z/),
    //   sure, cure and pure (r-controlled, and /yoo/ besides).
    // compete, complete, concrete, athlete and stampede are real and honest, but they are two
    // syllables and are 4.5's to teach. Nothing here is padded to reach a target.
    // Ruling R42 approved one vetted spare, Crete: a proper noun (the island), one syllable,
    // honest to the card. It is never a tap/try target, a find target, or a distractor.
    word('Pete', 'p,e:e_e,t,e:e_silent'),
    word('Steve', 's,t,e:e_e,v,e:e_silent'),
    word('Zeke', 'z,e:e_e,k,e:e_silent'),
    word('Crete', 'c,r,e:e_e,t,e:e_silent'),
    word('theme', 'th,e:e_e,m,e:e_silent'),
    word('eve', 'e:e_e,v,e:e_silent'),

    // u and silent e saying /oo/. A word belongs here only if ordinary speech gives it /oo/ and
    // nothing else: the card plays one sound, and it must not contradict what she hears at home.
    // So tune, dune, duke and jute are all out — plenty of speakers say those with /yoo/ — as
    // are ruse, muse and fuse, where the s says /z/. The safest onsets are r, l, j and a blend,
    // which take no /yoo/ in any accent, and most of the list is built from them.
    // Ruling R42 approved one vetted spare, Yule: the y onset carries the /y/, and after y no
    // accent of English puts a /yoo/ reading on the u_e_oo card, so it reads /yool/, honest to
    // the card. It is never a tap/try target, a find target, or a distractor.
    word('rule', 'r,u:u_e_oo,l,e:e_silent'),
    word('rude', 'r,u:u_e_oo,d,e:e_silent'),
    word('rune', 'r,u:u_e_oo,n,e:e_silent'),
    word('lute', 'l,u:u_e_oo,t,e:e_silent'),
    word('Luke', 'l,u:u_e_oo,k,e:e_silent'),
    word('June', 'j,u:u_e_oo,n,e:e_silent'),
    word('Jude', 'j,u:u_e_oo,d,e:e_silent'),
    word('Yule', 'y,u:u_e_oo,l,e:e_silent'),
    word('juke', 'j,u:u_e_oo,k,e:e_silent'),
    word('dude', 'd,u:u_e_oo,d,e:e_silent'),
    word('flute', 'f,l,u:u_e_oo,t,e:e_silent'),
    word('fluke', 'f,l,u:u_e_oo,k,e:e_silent'),
    word('plume', 'p,l,u:u_e_oo,m,e:e_silent'),
    word('prune', 'p,r,u:u_e_oo,n,e:e_silent'),
    word('brute', 'b,r,u:u_e_oo,t,e:e_silent'),
    word('crude', 'c,r,u:u_e_oo,d,e:e_silent'),

    // Nonsense, the e pattern. Every one was walked position by position against every letter,
    // then against one-letter deletions and insertions, then against the dictionary and against
    // obscenities in English, Spanish, Portuguese and French.
    // Whole families had to go, not single words:
    //   -ebe, because "hebe" is a slur and every -ebe word is one letter from it (heve and hete
    //     died the same way);
    //   -ede, because unaccented "pede" is a French slur;
    //   -ene, because "pene" is Spanish for a part of the body, and -epe for the same kind of
    //     reason; -ese and -eze, because the s or z would say /z/, not the sound on the card.
    //   -ele, -ete and -eke are nearly empty for a different reason: a nonsense word may not be
    //     a sound-alike of a real one, and /eel/, /eet/ and /eek/ are crowded with real words.
    //     So beke is out (beak), meke and leke (meek, leek), reke (reek), weke (week), bete
    //     (beet), nete (neat), wete (wheat), beme (beam), befe (beef), refe (reef), kefe (kief).
    //   deke went for a different reason again: one letter from a slur.
    // c and g never sit in front of these vowels here, in a nonsense word or a real one: before
    // e they say /s/ and /j/, which is not what the cards say.
    nonsense('feve', 'f,e:e_e,v,e:e_silent'),
    nonsense('meve', 'm,e:e_e,v,e:e_silent'),
    nonsense('veve', 'v,e:e_e,v,e:e_silent'),
    nonsense('zeve', 'z,e:e_e,v,e:e_silent'),
    nonsense('keme', 'k,e:e_e,m,e:e_silent'),
    nonsense('veme', 'v,e:e_e,m,e:e_silent'),
    nonsense('zeme', 'z,e:e_e,m,e:e_silent'),
    nonsense('weme', 'w,e:e_e,m,e:e_silent'),
    nonsense('neke', 'n,e:e_e,k,e:e_silent'),
    nonsense('veke', 'v,e:e_e,k,e:e_silent'),
    nonsense('nefe', 'n,e:e_e,f,e:e_silent'),
    nonsense('mefe', 'm,e:e_e,f,e:e_silent'),
    nonsense('zete', 'z,e:e_e,t,e:e_silent'),

    // Nonsense, the u pattern. A nonsense u-e word is a trap: the child cannot know which of the
    // two sounds to try, and whichever she picks the app plays only one. These two escape the
    // trap by their first sound. After j and after r, no accent of English puts a /yoo/ in, so
    // /joom/ and /roov/ are the readings any reader gives them, and those are the sounds the
    // u_e_oo card plays. That rules out the whole -ute, -ude, -uke and -ube neighbourhood as
    // well, which is crowded with real words and rude ones (pute, puke, nuke, lube), and it
    // rules out rume and lume, which sound exactly like room and loom.
    nonsense('jume', 'j,u:u_e_oo,m,e:e_silent'),
    nonsense('ruve', 'r,u:u_e_oo,v,e:e_silent'),
  ],
  sentences: [
    'Pete had a flute in his pack.',
    'The rule is that we do not run on the path.',
    'Nan put a prune in the lunchbox.',
    'Steve went up to the pond in June.',
    'Zeke was rude to the man, and Jan was mad.',
    'That song has a sad theme.',
    'Jude can not ride the bike yet.',
    'The dude sat on a stone in the sun.',
    'Luke hit the ball, and it was a fluke.',
    'Pam saw a rune on the big rock.',
    'Sam made a crude hut in the sand.',
    'The big ox was a brute.',
    'Luke has a lute, and Pete has a flute.',
    'When Jan fell, a plume of sand went up.',
    'Jude hit the ball, and Luke got it.',
  ],
  stories: [
    {
      title: 'Pete and the Flute',
      sentences: [
        'In June, Nan gave Pete a flute.',
        'It was long and thin, and Pete did like it a lot.',
        'He sat on his bed and did a song on it.',
        'The song was a mess.',
        'Nan said the rule was to not rush.',
        'Pete had not rested, and he did rush.',
        'The flute went honk, and the cat ran up the hill.',
        'Then Pete did as Nan said.',
        'He did not rush, and the song came out well.',
        'At sunset, Pete did the song for Nan at the camp.',
        'Nan said it was the best song in the camp.',
        'Then the cat came back down the hill and sat with them.',
      ],
      questions: [
        {
          prompt: 'What did Nan give Pete in June?',
          choices: ['a flute', 'a song', 'a cat'],
          answer: 0,
        },
        {
          prompt: 'What was the rule Nan gave Pete?',
          choices: ['to not rush', 'to rush', 'to honk the flute'],
          answer: 0,
        },
        {
          prompt: 'Why did the song come out well at the end?',
          choices: ['Pete did not rush', 'the cat ran up the hill', 'Nan gave Pete the flute'],
          answer: 0,
        },
      ],
    },
    {
      title: 'Luke and the Rune',
      sentences: [
        'Luke and Jude went up the hill to camp.',
        'It was hot, and the path was long.',
        'Jude sat on a big rock and rested.',
        'Then Luke saw a rune cut into the rock.',
        'Luke said a king had cut it into the rock.',
        'Jude said it was a fluke, and not a rune.',
        'The two went back down the hill to tell Nan.',
        'Nan went up the hill with them.',
        'Nan said it was a rune, and it was very old.',
        'She said people did that a long time back.',
        'Luke was glad he was right, and Jude was glad to know.',
        'Every day after that, Luke and Jude went up the hill to check on the rune.',
      ],
      questions: [
        {
          prompt: 'What did Luke see cut into the rock?',
          choices: ['a rune', 'a king', 'a fluke'],
          answer: 0,
        },
        {
          prompt: 'What did Jude say it was?',
          choices: ['a fluke', 'a rune', 'a king'],
          answer: 0,
        },
        {
          prompt: 'Who said the rune was very old?',
          choices: ['Nan', 'Jude', 'Luke'],
          answer: 0,
        },
      ],
    },
  ],
};
