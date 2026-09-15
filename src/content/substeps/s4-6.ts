import type { Substep, Word } from '../types';
import { word } from '../build';

/** Every word in this section's bank but the three exceptions is a base plus the s ending, so
 * the tag is added once here rather than repeated on forty lines. */
const plural = (text: string, spec: string, extra: Partial<Word> = {}): Word =>
  word(text, spec, { concepts: ['suffix-s'], ...extra });

/** The same, for a made-up base. `nonsense` in ../build takes no extra fields, and a nonsense
 * plural needs the suffix tag exactly as a real one does, so it is built through `word`. */
const nonsensePlural = (text: string, spec: string): Word =>
  word(text, spec, { kind: 'nonsense', concepts: ['suffix-s'] });

export const SUBSTEP_4_6: Substep = {
  id: '4.6',
  title: 'Adding s, and words that break the rule',
  parentSummary:
    'Your child adds s to words that already end in a silent e, so one cake becomes two cakes. The silent e does not move and nothing is dropped; the s simply goes on the end. The section also meets have, give and live, three words that look like silent e words but are not, and it says plainly that there are only three of them and she is meant to know them rather than work them out.',
  groups: [
    // No new card. There is no new sound here: the s ending was taught in 1.6 and the silent e
    // in 4.1, and this section is only the two of them meeting. The bank is the "current" set
    // for the sound drill, exactly as 3.1 to 3.4 do.
    {
      cards: [],
      lesson: [
        { say: 'You already add s to a word to say there is more than one. One hat, two hats.' },
        { say: 'Today you add it to a word that ends in a silent e. Nothing gets dropped and nothing moves.' },
        { show: ['s'] },
        { tap: 'cakes' },
        { say: 'One cake, two cakes. The a still says its name, the e at the end is still silent, and the s is one more sound after it.' },
        { say: 'The curved line is still there, doing the same job it always did. The s just sits behind it.' },
        { try: 'kites' },
        { try: 'ropes' },
        { try: 'grapes' },
        { try: 'mistakes' },
        { say: 'Listen to the end of each one. The s says sss every time, because the sound in front of it is a k, a p, a t or an f.' },
        { say: 'Now something else. Three words look like silent e words, and they are not.' },
        { tap: 'have' },
        { say: 'Have ends in an e, and the a does not say its name. It stays short, the way it sounds in hat.' },
        { say: 'Here is why. No word in English ends in a bare v, so a v at the end of a word always brings an e with it. That e belongs to the v. It is not a silent e doing a job.' },
        { say: 'So you tap have in three: h, then the short a, then the v and e as one sound.' },
        { try: 'give' },
        { try: 'live' },
        { say: 'That is the whole list. Have, give, live. Three words. You do not work them out, you just know them.' },
      ],
    },
  ],
  concepts: ['silent-e-exception'],
  // Nothing new is needed. have is already a sight word from 1.5, which is why the child can
  // read it in sentences long before today; here she meets it as a word she can tap and a
  // reason why it looks the way it does.
  sightWords: [],
  words: [
    // ---- Adding s to a silent-e base -------------------------------------------------------
    // A base may only end in k, p, t or f. Every other ending makes the plural say /z/, and the
    // s card has one recorded sound, /s/, which the app plays each time she taps it. The words
    // struck for that reason are listed in the report; rides, smiles, names, times, stones,
    // holes, tunes, cubes, waves, homes and lifetimes are all /z/ and none of them is here.

    // -ake, -ike, -oke
    plural('cakes', 'c,a:a_e,k,e:e_silent,s'),
    plural('bakes', 'b,a:a_e,k,e:e_silent,s'),
    plural('rakes', 'r,a:a_e,k,e:e_silent,s'),
    plural('lakes', 'l,a:a_e,k,e:e_silent,s'),
    plural('makes', 'm,a:a_e,k,e:e_silent,s'),
    plural('takes', 't,a:a_e,k,e:e_silent,s'),
    plural('flakes', 'f,l,a:a_e,k,e:e_silent,s'),
    plural('snakes', 's,n,a:a_e,k,e:e_silent,s'),
    plural('bikes', 'b,i:i_e,k,e:e_silent,s'),
    plural('likes', 'l,i:i_e,k,e:e_silent,s'),
    plural('spikes', 's,p,i:i_e,k,e:e_silent,s'),
    plural('jokes', 'j,o:o_e,k,e:e_silent,s'),

    // -ate, -ite, -ote
    plural('gates', 'g,a:a_e,t,e:e_silent,s'),
    plural('dates', 'd,a:a_e,t,e:e_silent,s'),
    plural('plates', 'p,l,a:a_e,t,e:e_silent,s'),
    plural('skates', 's,k,a:a_e,t,e:e_silent,s'),
    plural('kites', 'k,i:i_e,t,e:e_silent,s'),
    plural('bites', 'b,i:i_e,t,e:e_silent,s'),
    plural('notes', 'n,o:o_e,t,e:e_silent,s'),
    plural('votes', 'v,o:o_e,t,e:e_silent,s'),

    // -ape, -ipe, -ope
    plural('capes', 'c,a:a_e,p,e:e_silent,s'),
    plural('grapes', 'g,r,a:a_e,p,e:e_silent,s'),
    plural('shapes', 'sh,a:a_e,p,e:e_silent,s'),
    plural('wipes', 'w,i:i_e,p,e:e_silent,s'),
    plural('stripes', 's,t,r,i:i_e,p,e:e_silent,s'),
    plural('hopes', 'h,o:o_e,p,e:e_silent,s'),
    plural('ropes', 'r,o:o_e,p,e:e_silent,s'),

    // Two syllables. The child is comfortable with these, and the s ending behaves no
    // differently at the end of a long word than a short one. pan- and hand- are tapped as
    // separate letters, never with the welded an card: the welded rule is word-final, and 4.5
    // taps pancake, handshake and handmade the same way.
    plural('mistakes', 'm,i,s,t,a:a_e,k,e:e_silent,s', { syllables: [3] }),
    plural('cupcakes', 'c,u,p,c,a:a_e,k,e:e_silent,s', { syllables: [3] }),
    plural('pancakes', 'p,a,n,c,a:a_e,k,e:e_silent,s', { syllables: [3] }),
    plural('milkshakes', 'm,i,l,k,sh,a:a_e,k,e:e_silent,s', { syllables: [4] }),
    plural('handshakes', 'h,a,n,d,sh,a:a_e,k,e:e_silent,s', { syllables: [4] }),

    // ---- The three words that break the rule ----------------------------------------------
    // Tapped as an ordinary closed syllable. The "ve" is one sound on the v card, because
    // English never ends a word in a bare v; check.ts carries that as a spelling rule, the same
    // way it carries ff, ll, ss and zz.
    word('have', 'h,a,ve:v', { concepts: ['silent-e-exception'] }),
    word('give', 'g,i,ve:v', { concepts: ['silent-e-exception'] }),
    word('live', 'l,i,ve:v', { concepts: ['silent-e-exception'] }),

    // ---- Nonsense ---------------------------------------------------------------------------
    // A made-up silent-e base ending in k, p, t or f, plus the same s ending, tagged the same
    // way. Both the base and the plural were walked position by position against every letter
    // of the alphabet, then against one-letter deletions and insertions, then against
    // /usr/share/dict/words and against obscenities and slurs in English, Spanish, Portuguese
    // and French. Whole families died in that walk and the report lists them:
    //   -ape is gone with a single onset, because every _ape is one letter from a word for
    //     rape, and so is a blend whose second letter is r ("brape" loses its b to it);
    //   -ike is gone, because every single-onset _ike is one letter from a slur for a lesbian;
    //   -oke is gone, because "moke" is a racial slur and "coke" and "toke" are drug slang;
    //   -ite is gone, because every _ite is one letter from "bite", vulgar French;
    //   -ipe keeps only onsets that do not reach a slur: "dipe" reaches the same slur as -ike
    //     by one letter, and "nipe" loses its e to an ethnic slur.
    // Also struck: nake, yate, blate and dite, all real dictionary words; zite, an Italian
    // pasta; tipe and nite, colloquial spellings of type and night; and lafes, which a child
    // could take for a misspelling of laughs.
    //
    // Fix round 1 added zope(s) and glote(s), the section's first -o_e nonsense pair, walked the
    // same way. zope neighbors only ordinary -ope words (cope, dope, hope, lope, mope, nope,
    // pope, rope, sope, tope, zone); glote neighbors only obscure real words (globe, glove,
    // gloze, glome, glore, gote, lote, clote, plote, slote). Nothing obscene or slurring turned
    // up in either walk. "glote" is also the nonsense base taught in 4.4 (not this substep's
    // fixture); "glotes" is a different word text, so the two do not collide in the bank.
    nonsensePlural('vakes', 'v,a:a_e,k,e:e_silent,s'),
    nonsensePlural('zakes', 'z,a:a_e,k,e:e_silent,s'),
    nonsensePlural('glakes', 'g,l,a:a_e,k,e:e_silent,s'),
    nonsensePlural('plakes', 'p,l,a:a_e,k,e:e_silent,s'),
    nonsensePlural('smakes', 's,m,a:a_e,k,e:e_silent,s'),
    nonsensePlural('zates', 'z,a:a_e,t,e:e_silent,s'),
    nonsensePlural('zipes', 'z,i:i_e,p,e:e_silent,s'),
    nonsensePlural('vipes', 'v,i:i_e,p,e:e_silent,s'),
    nonsensePlural('mipes', 'm,i:i_e,p,e:e_silent,s'),
    nonsensePlural('fipes', 'f,i:i_e,p,e:e_silent,s'),
    nonsensePlural('zafes', 'z,a:a_e,f,e:e_silent,s'),
    nonsensePlural('mafes', 'm,a:a_e,f,e:e_silent,s'),
    nonsensePlural('jafes', 'j,a:a_e,f,e:e_silent,s'),
    nonsensePlural('zifes', 'z,i:i_e,f,e:e_silent,s'),
    nonsensePlural('hifes', 'h,i:i_e,f,e:e_silent,s'),
    nonsensePlural('zopes', 'z,o:o_e,p,e:e_silent,s'),
    nonsensePlural('glotes', 'g,l,o:o_e,t,e:e_silent,s'),
  ],
  sentences: [
    'Pam makes two cakes for the contest.',
    'Sam bakes cupcakes and pancakes.',
    'The kites went up over the pond.',
    'Dan hopes the snakes are in the box.',
    'We had grapes and milkshakes at the picnic.',
    'Nan takes the plates back to the cabin.',
    'Jan likes the red bikes best.',
    'The snakes have long stripes on them.',
    'Give the ropes to Sam.',
    'Zeke and Luke live on the hill.',
    'Pete makes notes about the pond.',
    'Flakes fell on the gates and on the path.',
    'Sam can not lift the ropes.',
    'The skates and the bikes are in the van.',
    'People make mistakes.',
    'The capes have spikes on them.',
    'Jan wipes the plates and the cups.',
    'Nan rakes the sand into a pile.',
    'People give handshakes at the contest.',
    'The shapes on the plates are red and gold.',
  ],
  stories: [
    {
      // Rewritten in the final fix wave. "Pam and the Cupcakes" was the fifth of five Book 4
      // stories on the same plot, and its closing line was 4.3's closing line with the nouns
      // swapped. Here the problem comes from the weather rather than from anyone's mistake, and
      // the resolution is that the day turns into a better one than the day that was planned.
      // Nothing is learned and nobody is corrected, which is the point.
      title: 'Flakes on the Gates',
      sentences: [
        'Sam woke up, and the hill was white.',
        'Flakes had come down on the camp, thick and fast.',
        'The flakes were up over the gates, and the path to the pond was not there.',
        'Nan said that the van could not come down the hill.',
        'The trip to the lakes was off.',
        'Sam was upset, as he had his skates in his pack.',
        'Then Jan said to come and check what was in the shed.',
        'In the shed were the big plastic plates from the picnic.',
        'Sam and Jan went up the slope with them.',
        'Sam sat on a plate and went down fast.',
        'Then Jan went down, and she went into a big bank of flakes.',
        'They did it again and again, up the slope and down.',
        'Then Nan came out with cupcakes and pancakes.',
        'Sam did not think about the lakes again.',
      ],
      questions: [
        {
          prompt: 'Why was the trip to the lakes off?',
          choices: [
            'the van could not come down the hill',
            'the plates were in the shed',
            'Sam had his skates in his pack',
          ],
          answer: 0,
        },
        {
          prompt: 'What did Sam and Jan use to go down the slope?',
          choices: ['the plates', 'the skates', 'the gates'],
          answer: 0,
        },
        {
          prompt: 'What did Nan come out with at the end?',
          choices: ['cupcakes and pancakes', 'plates from the picnic', 'skates in a pack'],
          answer: 0,
        },
      ],
    },
    {
      title: 'The Kites on the Hill',
      sentences: [
        'Sam and Dan went up the hill with two kites.',
        'The kites had red stripes and long ropes.',
        'It was a fine day, and the two kites went up well.',
        'Then the two ropes got in a twist.',
        'Sam did not stop, and the ropes got to be a big mess.',
        'Dan said that they had to stop and sit.',
        'They sat on the path and did it hand over hand.',
        'It was a long time, and Sam did want to give up.',
        'Then the ropes were not in a twist.',
        'The kites went back up over the pond.',
        'Dan said it was the best day on the hill yet.',
        'They sat on the path and had grapes while the two kites went up and up.',
      ],
      questions: [
        {
          prompt: 'What went wrong with the kites?',
          choices: ['the ropes got in a twist', 'the kites had red stripes', 'they sat on the path'],
          answer: 0,
        },
        {
          prompt: 'How did Sam and Dan fix it?',
          choices: ['they sat and did it hand over hand', 'they went up the hill', 'they did not stop'],
          answer: 0,
        },
        {
          prompt: 'What did Dan say at the end?',
          choices: ['it was the best day on the hill yet', 'they had to stop and sit', 'the ropes got in a twist'],
          answer: 0,
        },
      ],
    },
  ],
};
