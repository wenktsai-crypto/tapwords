import type { Substep, Word } from '../types';
import { word, nonsense } from '../build';

/** The shared nonsense() builder takes no extras, and every word in this section needs its
 * syllable split marked, so the split is added here rather than by changing a shared file. */
function longNonsense(text: string, spec: string, syllables: number[]): Word {
  return { ...nonsense(text, spec), syllables };
}

export const SUBSTEP_4_5: Substep = {
  id: '4.5',
  title: 'Long words with a silent-e syllable',
  parentSummary:
    'Your child has met the silent e in short words like cake and ride. Here the words get longer, and the silent e turns out to work on only one part of the word: in "cupcake" it makes the second a say its name and leaves the u at the front alone. The skill being practised is splitting a long word into two parts, reading each part on its own, and putting them back together.',
  groups: [
    // No new card. The whole job of this section is showing that the card she already has keeps
    // working when the word gets long, so there is one group and its card list is empty.
    {
      cards: [],
      lesson: [
        { say: 'There is no new card today. You have all five silent-e vowels, and today the words simply get longer.' },
        { say: 'A long word is read one part at a time. Each part has one vowel sound in it, and you read the front part, then the back part, then the whole word.' },
        { tap: 'cupcake' },
        { say: 'Cupcake is two parts. Cup, which you have read since the very first book, and cake, which you read when you met the silent e. Cup. Cake. Cupcake.' },
        { say: 'Look at where the silent e is. It sits at the end, and it works on the vowel in its own part of the word. It cannot reach the u in cup, so the u stays short.' },
        { tap: 'invite' },
        { say: 'Invite is in, and vite. The e at the end is a long way from the first i, so that first i says its short sound. In. Vite. Invite.' },
        { say: 'Here is how to start a long word. Find the silent e at the end first. Then cover the back part with a finger and read the front part on its own.' },
        { try: 'inside' },
        { try: 'pancake' },
        { try: 'reptile' },
        { try: 'sunshine' },
        { say: 'The front part of every word today ends on a consonant, so its vowel is short. That is true however long the word is.' },
        { try: 'compete' },
        { try: 'explode' },
        { try: 'stampede' },
        { say: 'Some of these words are made of two words you already know, joined up. When you spot one, read the two words and you have read the long one.' },
        { try: 'flagpole' },
        { try: 'milkshake' },
      ],
    },
  ],
  // silent-e was introduced in 4.1, and concepts are cumulative.
  concepts: [],
  // Nothing new is needed. Every word the sentences and stories use is taught here, or sits in an
  // earlier bank, or is already a declared sight word.
  sightWords: [],
  words: [
    // ---------------------------------------------------------------------------------------
    // Real words. Every one is two syllables, every one has exactly one silent-e syllable, and
    // every other syllable is closed (short vowel, ending on a consonant) or a welded ending she
    // already taps as one unit. An open first syllable — e-lect, po-lite, de-flate, u-nite — is
    // Book 5's job, so where a word could be split that way it is split closed instead
    // (es-cape, ig-nite) and where it cannot be, the word is left out.
    //
    // Struck from the brief's candidate list: homemade and lifetime, which have a silent-e
    // syllable on BOTH sides and so teach two patterns at once. bedtime was struck on the same
    // instruction in the first pass, but it in fact has only one silent-e syllable (bed is
    // closed, time is silent-e); fix round 1 corrected the ruling (R38) and added it back below.
    // Also left out: confuse, refuse, surprise, advise (s says /z/); decide, invoice (c says
    // /s/); entire, admire (r-controlled); daytime (ay is not taught); welcome and become (the
    // o_e card says /oh/ and those words say /uh/).
    // ---------------------------------------------------------------------------------------

    // in- and ig-: a closed first syllable, then the silent-e syllable.
    word('invite', 'i,n,v,i:i_e,t,e:e_silent', { syllables: [2] }),
    word('inside', 'i,n,s,i:i_e,d,e:e_silent', { syllables: [2] }),
    word('invade', 'i,n,v,a:a_e,d,e:e_silent', { syllables: [2] }),
    word('inflate', 'i,n,f,l,a:a_e,t,e:e_silent', { syllables: [2] }),
    word('inhale', 'i,n,h,a:a_e,l,e:e_silent', { syllables: [2] }),
    // include takes the rule sound of u-e, the oo in rule, not the yoo in mule.
    word('include', 'i,n,c,l,u:u_e_oo,d,e:e_silent', { syllables: [2] }),
    word('ignite', 'i,g,n,i:i_e,t,e:e_silent', { syllables: [2] }),

    // ex-, es- and up-: the same shape with a different closed syllable in front. The x says its
    // own taught sound, ks.
    word('exhale', 'e,x,h,a:a_e,l,e:e_silent', { syllables: [2] }),
    word('explode', 'e,x,p,l,o:o_e,d,e:e_silent', { syllables: [2] }),
    word('escape', 'e,s,c,a:a_e,p,e:e_silent', { syllables: [2] }),
    word('upgrade', 'u,p,g,r,a:a_e,d,e:e_silent', { syllables: [2] }),

    // com-, con- and rep-: a closed syllable ending on a nasal or a stop.
    word('compete', 'c,o,m,p,e:e_e,t,e:e_silent', { syllables: [3] }),
    word('complete', 'c,o,m,p,l,e:e_e,t,e:e_silent', { syllables: [3] }),
    word('concrete', 'c,o,n,c,r,e:e_e,t,e:e_silent', { syllables: [3] }),
    word('combine', 'c,o,m,b,i:i_e,n,e:e_silent', { syllables: [3] }),
    word('costume', 'c,o,s,t,u:u_e_oo,m,e:e_silent', { syllables: [3] }),
    word('reptile', 'r,e,p,t,i:i_e,l,e:e_silent', { syllables: [3] }),
    word('athlete', 'a,th,l,e:e_e,t,e:e_silent', { syllables: [2] }),
    // stam- is tapped s,t,a,m, not with the welded am card. The welded rule is word-final (see
    // check.ts and docs/HANDOFF.md), and every mid-word an/am in Books 1-3 is tapped as separate
    // letters: cannot, blanket, frantic, fantastic, Atlantic, Manhattan, cannonball. Welding it
    // here would change the motor routine for a syllable she already taps the other way.
    word('stampede', 's,t,a,m,p,e:e_e,d,e:e_silent', { syllables: [4] }),

    // Compound words: two words she can already read, joined. These are the easiest long words
    // in the section and the best place to start.
    word('cupcake', 'c,u,p,c,a:a_e,k,e:e_silent', { syllables: [3] }),
    word('pancake', 'p,a,n,c,a:a_e,k,e:e_silent', { syllables: [3] }),
    word('mistake', 'm,i,s,t,a:a_e,k,e:e_silent', { syllables: [3] }),
    word('sunshine', 's,u,n,sh,i:i_e,n,e:e_silent', { syllables: [3] }),
    word('handshake', 'h,a,n,d,sh,a:a_e,k,e:e_silent', { syllables: [4] }),
    word('milkshake', 'm,i,l,k,sh,a:a_e,k,e:e_silent', { syllables: [4] }),
    word('classmate', 'c,l,a,ss:s,m,a:a_e,t,e:e_silent', { syllables: [4] }),
    word('handmade', 'h,a,n,d,m,a:a_e,d,e:e_silent', { syllables: [4] }),
    word('hillside', 'h,i,ll:l,s,i:i_e,d,e:e_silent', { syllables: [3] }),
    word('bedside', 'b,e,d,s,i:i_e,d,e:e_silent', { syllables: [3] }),
    word('bedtime', 'b,e,d,t,i:i_e,m,e:e_silent', { syllables: [3] }),
    word('landslide', 'l,a,n,d,s,l,i:i_e,d,e:e_silent', { syllables: [4] }),
    word('backbone', 'b,a,ck,b,o:o_e,n,e:e_silent', { syllables: [3] }),
    word('wishbone', 'w,i,sh,b,o:o_e,n,e:e_silent', { syllables: [3] }),
    word('trombone', 't,r,o,m,b,o:o_e,n,e:e_silent', { syllables: [4] }),
    word('tadpole', 't,a,d,p,o:o_e,l,e:e_silent', { syllables: [3] }),
    word('flagpole', 'f,l,a,g,p,o:o_e,l,e:e_silent', { syllables: [4] }),
    word('pothole', 'p,o,t,h,o:o_e,l,e:e_silent', { syllables: [3] }),
    word('manhole', 'm,a,n,h,o:o_e,l,e:e_silent', { syllables: [3] }),
    word('bathrobe', 'b,a,th,r,o:o_e,b,e:e_silent', { syllables: [3] }),
    word('backstroke', 'b,a,ck,s,t,r,o:o_e,k,e:e_silent', { syllables: [3] }),
    word('bagpipe', 'b,a,g,p,i:i_e,p,e:e_silent', { syllables: [3] }),

    // ---------------------------------------------------------------------------------------
    // Nonsense words. Same shape as the real ones: a closed syllable, then a silent-e syllable,
    // with the split marked so the child reads each chunk on its own.
    //
    // Two whole vowels are kept out on purpose. u-e never appears, because a nonsense u-e word
    // gives the child no way to choose between yoo and oo and the app plays only one of them
    // (4.3 made the same call). e-e never appears, because the /ee/ chunks are crowded with real
    // words heard rather than seen — beke and beak, wete and wheat.
    //
    // Every word below was walked position by position with all twenty-six letters, then with
    // every one-letter deletion and insertion, against /usr/share/dict/words and against
    // obscenities and slurs in English, Spanish, Portuguese and French; the same walk was then
    // run on each displayed chunk on its own. Rejected by that walk, not by taste:
    //   fodzide  - "fod" is one letter from foda, Portuguese for a strong obscenity
    //   jumtife  - "jum" is one letter from cum; that kills every C-u-m chunk
    //   nupvide, mipdofe - "nup" and "mip" are each one letter from nip, an ethnic slur
    //   dunvide  - "dun" is one letter from hun
    //   hobzide, hodzide - "hob" and "hod" are each one letter from hoe
    //   chodvide - "chod" is one letter from a vulgarism
    //   nigdofe  - the first chunk is itself a slur fragment; caught by reading the chunk alone
    //   geltife  - g before e says /j/, which is not the sound on the g card
    //   any -ape chunk (mape, dape) - one letter from rape
    //   tupvide  - "tup" is itself British slang
    //   -ede, -ene, -ebe chunks - French and Spanish obscenity, and hebe, as 4.3 found
    //
    // Fix round 1: a second reviewer found four words the first walk missed, each carrying a
    // displayed chunk one letter from a slur or strong obscenity: thodvide (thod -> thot),
    // tibjome (tib -> tit; jome -> Spanish jode), hesvame (hes -> hos/hoes), nudjome
    // (jome -> Spanish jode). They are replaced below with shelvide, lubzome, velbade and
    // nudvipe, walked the same way (see the fix-round report for the full walk).
    // ---------------------------------------------------------------------------------------
    longNonsense('linvide', 'l,i,n,v,i:i_e,d,e:e_silent', [3]),
    longNonsense('lobzide', 'l,o,b,z,i:i_e,d,e:e_silent', [3]),
    longNonsense('bodzide', 'b,o,d,z,i:i_e,d,e:e_silent', [3]),
    longNonsense('shelvide', 'sh,e,l,v,i:i_e,d,e:e_silent', [3]),
    longNonsense('beltife', 'b,e,l,t,i:i_e,f,e:e_silent', [3]),
    longNonsense('jubtife', 'j,u,b,t,i:i_e,f,e:e_silent', [3]),
    longNonsense('zimvope', 'z,i,m,v,o:o_e,p,e:e_silent', [3]),
    longNonsense('welvope', 'w,e,l,v,o:o_e,p,e:e_silent', [3]),
    longNonsense('thubvope', 'th,u,b,v,o:o_e,p,e:e_silent', [3]),
    longNonsense('nudvipe', 'n,u,d,v,i:i_e,p,e:e_silent', [3]),
    longNonsense('lubzome', 'l,u,b,z,o:o_e,m,e:e_silent', [3]),
    longNonsense('tesdofe', 't,e,s,d,o:o_e,f,e:e_silent', [3]),
    longNonsense('tasvame', 't,a,s,v,a:a_e,m,e:e_silent', [3]),
    longNonsense('velbade', 'v,e,l,b,a:a_e,d,e:e_silent', [3]),
    longNonsense('pinzade', 'p,i,n,z,a:a_e,d,e:e_silent', [3]),
    longNonsense('shepzafe', 'sh,e,p,z,a:a_e,f,e:e_silent', [3]),
  ],
  sentences: [
    'Sam had a cupcake and a milkshake at the camp.',
    'The reptile sat on a hot rock in the sunshine.',
    'Nan will invite the children to the pond.',
    'Do not run inside the hut.',
    'The van hit a pothole on the path.',
    'Jan and Pam did compete in the contest.',
    'We put the flag up on the flagpole.',
    'A tadpole can not hop yet.',
    'The path is made of concrete.',
    'Sam gave Dan a handshake.',
    'His classmate did not come on the trip.',
    'The costume was red and long.',
    'Jan put the bathrobe on the bedside desk.',
    'Steve had to escape the hot sun.',
    'The landslide made a big mess on the path.',
    'Sam will upgrade the desktop.',
    'A pancake is best when it is hot.',
    'The stampede went up the hillside.',
    'The athlete did swim and run every day.',
    'Do not let the can explode in the hot sun.',
  ],
  stories: [
    {
      title: 'The Tadpole in the Pond',
      sentences: [
        'Sam and Jan went to the pond to check on the tadpole.',
        'It was in the mud at the side of the pond.',
        'Sam did want to take it home in a cup.',
        'Jan said that was a mistake.',
        'She said the pond was best for it.',
        'Sam did not want to do that.',
        'He sat on the rock and did think about it for a long time.',
        'Then he put the tadpole back in the mud.',
        'Every day, Sam and Jan went to check on it.',
        'In the sunshine, the tadpole was big and fat.',
        'Now it is a frog, and it can hop up on the rock at the side of the pond.',
        'Sam is glad he did not take it home.',
      ],
      questions: [
        {
          prompt: 'What were Sam and Jan checking on at the pond?',
          choices: ['the tadpole', 'the rock', 'the cup'],
          answer: 0,
        },
        {
          prompt: 'Why did Jan say that taking it home would be a mistake?',
          // Both wrong answers are things the story states outright, not recombinations of its
          // nouns: "It was in the mud at the side of the pond" and "Sam did want to take it home".
          choices: ['the pond was best for it', 'the tadpole was in the mud', 'Sam did want to take it home'],
          answer: 0,
        },
        {
          prompt: 'What can the tadpole do at the end of the story?',
          choices: ['it can hop', 'it can check the mud', 'it can take a cup home'],
          answer: 0,
        },
      ],
    },
    {
      // Rewritten in the final fix wave. The version that stood here was the third of five
      // Book 4 stories on one plot (rush, fail, slow down, succeed) and shared two phrases word
      // for word with 4.3's - "his song was a mess", "did not rush, and the song came out well".
      // The instruments, the contest and the one spot are kept, because the section's showcase
      // words live in them; the problem and the resolution are new. Nobody is at fault, nobody
      // rushes, and the answer comes from Sam having an idea rather than from taking advice.
      title: 'The Trombone and the Bagpipe',
      sentences: [
        'Sam had a trombone, and his classmate Jan had a bagpipe.',
        'The band at the camp had one spot, and the two of them did want it.',
        'The man said he would pick one of them at the contest.',
        'Sam went inside and did the song again and again.',
        'Jan sat on the hillside in the sunshine and did the same.',
        'On the day of the contest, Sam did the song on the trombone.',
        'The man said it was the best trombone he had.',
        'Then Jan did the song on the bagpipe, and the man said the same of that.',
        'He sat and did think for a long time, and then he said he could not pick.',
        'Sam said that the two of them could do the song at the same time.',
        'Up on the hillside, they did it again and again.',
        'The trombone went down where the bagpipe went up.',
        'The man came back and said the band had a spot for the two of them.',
        'When they did the song, the camp did stamp and yell.',
      ],
      questions: [
        {
          prompt: 'Which instrument did Jan have?',
          choices: ['a bagpipe', 'a trombone', 'a band'],
          answer: 0,
        },
        {
          prompt: 'What did Sam say when the man could not pick?',
          choices: [
            'the two of them could do the song at the same time',
            'the band had one spot',
            'he did the song again and again',
          ],
          answer: 0,
        },
        {
          prompt: 'What did the camp do when Sam and Jan did the song?',
          choices: ['the camp did stamp and yell', 'the camp did pick one of them', 'the camp sat on the hillside'],
          answer: 0,
        },
      ],
    },
  ],
};
