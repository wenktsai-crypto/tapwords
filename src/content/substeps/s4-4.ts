import type { Substep } from '../types';
import { word, nonsense } from '../build';

export const SUBSTEP_4_4: Substep = {
  id: '4.4',
  title: 'Silent e after blends and digraphs',
  parentSummary:
    'Nothing new is taught here. Your child has already met the silent e with every vowel, and she has been reading blends like "st" and "fl" and letter pairs like "sh" and "ch" since Book 2. This section puts the two together, so the front of the word gets longer while the end of it behaves exactly as before.',
  groups: [
    // No cards. A section with nothing new to introduce uses its own word bank as the stand-in
    // set for the sound drill, exactly as 3.1 to 3.4 already do.
    {
      cards: [],
      lesson: [
        { say: 'There is no new card today, and there is nothing new to learn. Everything in this section is something you can already do.' },
        { say: 'You know the silent e. You know a blend, where two letters sit side by side and each one keeps its own sound, like the s and the t at the start of stop.' },
        { say: 'You know a letter team too, like sh and ch and th and wh, where two letters share one sound.' },
        { say: 'You have read a few words like that already, such as flute and prune in the last section. Today there is a whole list of them.' },
        { say: 'The front of the word gets longer. The end of the word does not change at all.' },
        { tap: 'shade' },
        { say: 'Shade has five letters and three sounds. The s and the h share one sound. The a says its name. The d makes the last sound, and the e at the end says nothing, so it gets no dot.' },
        { tap: 'snake' },
        { say: 'Snake has five letters and four sounds. This time the s and the n each keep a sound of their own, one straight after the other. That is a blend.' },
        { say: 'So the only thing that changed is how much sits in front of the vowel. Look to the end of the word first and spot the silent e. Then tap your way in from the start.' },
        { try: 'flame' },
        { try: 'stripe' },
        { try: 'globe' },
        { try: 'white' },
        { try: 'stroke' },
      ],
    },
  ],
  // silent-e was introduced in 4.1, blends in Book 2 and letter teams in 1.2. Concepts are
  // cumulative, so this section declares none of its own.
  concepts: [],
  // The sentences and stories here are written entirely out of words already taught and sight
  // words already declared, so this section asks for none of its own.
  sightWords: [],
  words: [
    // ---------------------------------------------------------------------------------------
    // Every real word below was said aloud twice, once for the s/z and c/g traps and once for
    // the vowel. Nothing here makes a letter take a sound the child has not been taught:
    //   * every s is /s/ (snake, skate, scale, slide, slime, spine, spike, stripe, stride,
    //     slope, stove, stole, smoke, stroke) - each one is a word-initial s, and no word in
    //     this bank carries a medial or final s, which is where /z/ hides;
    //   * every c is /k/, because it only ever stands before r or a (crane, scale);
    //   * every g is /g/, because it only ever stands before r, l or a (grape, glide, globe);
    //   * there is no z, no ge, no ce, and no r after a vowel.
    // Banned by name and kept out: chose, those, close, whose, nose, prose, prize (s says /z/);
    // stage, strange, change, cringe (g says /j/); place, space, trace, slice, price, twice,
    // spruce, chance (c says /s/); whole (irregular); store, shore, snore, chore, share, stare,
    // spare, share (the r takes the vowel over and no r-controlled card exists yet).
    // Every word below was also grepped against every other section's bank: no collisions.

    // a and silent e, behind a blend or a letter team.
    word('shape', 'sh,a:a_e,p,e:e_silent'),
    word('shade', 'sh,a:a_e,d,e:e_silent'),
    word('shake', 'sh,a:a_e,k,e:e_silent'),
    word('shave', 'sh,a:a_e,v,e:e_silent'),
    word('whale', 'wh,a:a_e,l,e:e_silent'),
    word('snake', 's,n,a:a_e,k,e:e_silent'),
    word('skate', 's,k,a:a_e,t,e:e_silent'),
    word('scale', 's,c,a:a_e,l,e:e_silent'),
    word('flame', 'f,l,a:a_e,m,e:e_silent'),
    word('frame', 'f,r,a:a_e,m,e:e_silent'),
    word('blame', 'b,l,a:a_e,m,e:e_silent'),
    word('blade', 'b,l,a:a_e,d,e:e_silent'),
    word('plane', 'p,l,a:a_e,n,e:e_silent'),
    word('plate', 'p,l,a:a_e,t,e:e_silent'),
    word('crane', 'c,r,a:a_e,n,e:e_silent'),
    word('grape', 'g,r,a:a_e,p,e:e_silent'),
    word('trade', 't,r,a:a_e,d,e:e_silent'),
    word('brave', 'b,r,a:a_e,v,e:e_silent'),

    // i and silent e.
    word('shine', 'sh,i:i_e,n,e:e_silent'),
    word('chime', 'ch,i:i_e,m,e:e_silent'),
    word('while', 'wh,i:i_e,l,e:e_silent'),
    word('white', 'wh,i:i_e,t,e:e_silent'),
    word('quite', 'qu,i:i_e,t,e:e_silent'),
    word('slide', 's,l,i:i_e,d,e:e_silent'),
    word('slime', 's,l,i:i_e,m,e:e_silent'),
    word('glide', 'g,l,i:i_e,d,e:e_silent'),
    word('spine', 's,p,i:i_e,n,e:e_silent'),
    word('spike', 's,p,i:i_e,k,e:e_silent'),
    word('drive', 'd,r,i:i_e,v,e:e_silent'),
    word('pride', 'p,r,i:i_e,d,e:e_silent'),
    // Three consonants in the onset. These are the point of the section, not decoration: the
    // child has read strap, strum and sprint since Book 2, so the only new thing is the e.
    word('stripe', 's,t,r,i:i_e,p,e:e_silent'),
    word('stride', 's,t,r,i:i_e,d,e:e_silent'),

    // o and silent e.
    word('globe', 'g,l,o:o_e,b,e:e_silent'),
    word('slope', 's,l,o:o_e,p,e:e_silent'),
    word('stove', 's,t,o:o_e,v,e:e_silent'),
    word('stole', 's,t,o:o_e,l,e:e_silent'),
    word('smoke', 's,m,o:o_e,k,e:e_silent'),
    word('choke', 'ch,o:o_e,k,e:e_silent'),
    word('broke', 'b,r,o:o_e,k,e:e_silent'),
    word('drove', 'd,r,o:o_e,v,e:e_silent'),
    word('stroke', 's,t,r,o:o_e,k,e:e_silent'),
    word('throne', 'th,r,o:o_e,n,e:e_silent'),

    // u and silent e. Almost every blend word for this pattern belongs to 4.3 already - flute,
    // prune, plume, brute and crude are all in that bank - and the /yoo/ sound behind a blend
    // barely exists. Flume is the one honest word left: every speaker says it with /oo/, so the
    // u_e_oo card plays exactly what she will hear.
    word('flume', 'f,l,u:u_e_oo,m,e:e_silent'),

    // ---------------------------------------------------------------------------------------
    // Nonsense. Every one opens with a blend or a letter team, the same as the real words, so
    // the practice is the section's own pattern and not 4.1's.
    //
    // Each candidate was walked mechanically: every position substituted with all 26 letters,
    // every one-letter deletion, every one-letter insertion at every gap, each result checked
    // against a slur and obscenity list in English, Spanish, Portuguese and French, and the word
    // itself plus base+s, +ing, +ed grepped against /usr/share/dict/words.
    //
    // Whole families died in the walk, not single words:
    //   * every "cha_e" word - chape, chame, chabe - is one substitution from a French vulgar
    //     term, and so is chote; the ch onset survives only in front of i and o here;
    //   * every "who_e" word - whobe, whofe, whome, whote - is one substitution from an English
    //     obscenity, so wh survives only in front of a and i;
    //   * swike and whike each delete to an ethnic slur, which is what killed a word in 4.1 too.
    // Killed as real dictionary words: swape, stape (stapes), clame, whame, blibe, stime, clote,
    // plote, slote. Killed by hand: thame, an English place name; plame and glame, which carry
    // the chunk "lame"; snafe, one letter from snafu; smike, a character in Dickens; and the
    // four the previous attempt had already rejected - shime, shide, slape and thape.
    // Fix round 1: chibe was cut because deleting the b gives "chie", a conjugated form of
    // French "chier" (a strong vulgarity). smibe replaced it and was walked clean - see the
    // task report for the full walk.

    // a and silent e.
    nonsense('blape', 'b,l,a:a_e,p,e:e_silent'),
    nonsense('flape', 'f,l,a:a_e,p,e:e_silent'),
    nonsense('glafe', 'g,l,a:a_e,f,e:e_silent'),
    nonsense('slafe', 's,l,a:a_e,f,e:e_silent'),
    nonsense('sname', 's,n,a:a_e,m,e:e_silent'),
    nonsense('stame', 's,t,a:a_e,m,e:e_silent'),
    nonsense('thafe', 'th,a:a_e,f,e:e_silent'),
    nonsense('whape', 'wh,a:a_e,p,e:e_silent'),

    // i and silent e.
    nonsense('blide', 'b,l,i:i_e,d,e:e_silent'),
    nonsense('blime', 'b,l,i:i_e,m,e:e_silent'),
    nonsense('plime', 'p,l,i:i_e,m,e:e_silent'),
    nonsense('clibe', 'c,l,i:i_e,b,e:e_silent'),
    nonsense('spibe', 's,p,i:i_e,b,e:e_silent'),
    nonsense('smibe', 's,m,i:i_e,b,e:e_silent'),
    nonsense('thike', 'th,i:i_e,k,e:e_silent'),

    // o and silent e.
    nonsense('blobe', 'b,l,o:o_e,b,e:e_silent'),
    nonsense('clofe', 'c,l,o:o_e,f,e:e_silent'),
    nonsense('smofe', 's,m,o:o_e,f,e:e_silent'),
    nonsense('stobe', 's,t,o:o_e,b,e:e_silent'),
    nonsense('glote', 'g,l,o:o_e,t,e:e_silent'),
    nonsense('thofe', 'th,o:o_e,f,e:e_silent'),
  ],
  sentences: [
    'The snake went down the slope in the sun.',
    'Nan put a grape on the plate.',
    'Sam broke the blade on his rake.',
    'The brave man went into the smoke.',
    'Pam drove the van up the hill.',
    'A big whale came up in the pond.',
    'Dan can skate very well.',
    'The white cat sat in the shade.',
    'Dan has a red stripe on his bike.',
    'The globe on the desk is quite big.',
    'The pan on the stove is hot.',
    'The plane went up over the hill.',
    'Dan stole a grape, and Pam was mad.',
    'Sam saw a bat glide from the shed.',
    'The flame from the lamp was hot.',
    'Sam can shape the mud into a dome.',
    'The king sat on his throne.',
    'Sam did the dishes while Nan was out.',
    'Nan put the print in a frame.',
    'Sam will trade his hat for a magnet.',
    'Pam went up the path with a long stride.',
    'The sun will shine on the pond.',
    'Nan can drive, but Sam can not.',
    'The bell will chime when the sun is up.',
    'Sam went down the flume into the water.',
    'The big crane can lift a lot.',
    'Pam will not blame Sam for the mess.',
    'Dan hit the ball with one big stroke.',
    'Do not choke on that grape.',
    'Nan put the fish on the scale.',
    'The big fish has a long spine.',
    'Sam hit the spike into the log.',
    'Pam will shake the box to find out what is in it.',
    'The slime on the rock was thick.',
    'Dan will slide down the slope.',
  ],
  stories: [
    {
      title: 'The Snake on the Slope',
      sentences: [
        'Nan and Sam and Dan went up the hill to camp.',
        'The path was long, and the sun was hot.',
        'Sam went up the path one step at a time.',
        'Then Sam saw a snake on the slope.',
        'It was long and thin, with a white stripe.',
        'Sam did not want to step on it.',
        'Dan said they should not shake the snake or poke it.',
        'Nan said they should step back and let it pass.',
        'Sam and Dan sat on a rock and did not run.',
        'After that, the snake went into the shade of a shrub.',
        'Then the two went up the path to the camp.',
        'Nan said they were brave to sit and let the snake pass.',
        'Now Sam can tell the tale of the snake on the slope.',
      ],
      questions: [
        {
          prompt: 'What did Sam see on the slope?',
          choices: ['a snake', 'a rock', 'a shrub'],
          answer: 0,
        },
        {
          prompt: 'What did Dan say they should not do?',
          choices: ['shake the snake', 'sit on a rock', 'run up the path'],
          answer: 0,
        },
        {
          prompt: 'Where did the snake go in the end?',
          choices: ['into the shade', 'up the path', 'to the camp'],
          answer: 0,
        },
      ],
    },
    {
      title: 'The Plane Sam Made',
      sentences: [
        'Sam and Nan had a box of scrap and tape in the shed.',
        'He did want to make a plane that can glide.',
        'Nan said he should cut it thin, or it will not glide.',
        'Sam did not want to do that, and he cut a big one.',
        'He put tape on it to hold the scrap.',
        'Then Sam went up the slope with it.',
        'He let the plane drop, and it went into the mud.',
        'Sam was sad, and he did want to quit.',
        'Nan said the plane was too big, as she had said before.',
        'This time Sam made a thin one from the scrap.',
        'It did glide, from the slope down to the pond.',
        'Nan said it was the best plane Sam had made.',
        'Now Sam will cut every plane thin, and every plane does glide.',
      ],
      questions: [
        {
          prompt: 'What did Sam want to make?',
          choices: ['a plane', 'a box', 'a slope'],
          answer: 0,
        },
        {
          prompt: 'Why did the first plane go into the mud?',
          choices: ['it was too big', 'it was too thin', 'it was in a box'],
          answer: 0,
        },
        {
          prompt: 'What did Nan say about the plane at the end?',
          choices: ['it was the best plane', 'it was too big', 'it did not glide'],
          answer: 0,
        },
      ],
    },
  ],
};
