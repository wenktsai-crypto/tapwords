# Design: deeper Book 3 practice, and Book 4 (silent e)

Date: 2026-09-13. Status: approved by the project owner, ready for planning.

Written for the sessions and agents that will build this, and for a tutor who
wants to check the teaching order without reading code.

## Why

Tapwords ships sixteen sections, 1.1 to 3.5, covering Books 1 to 3. The child
this was built for is now ten and working inside Book 3, so she is close to the
end of the material. Two things follow: she needs more to read at the level she
is on, and she needs the book after it.

Books 1 to 3 are entirely closed syllables — every vowel is short, and every
letter is part of a sound the child taps (two letters can share one sound and one
tap, as in "ship"). Book 4 is the first place a letter is part of no sound at all. "cake" has four letters and three sounds, and the final e
makes no sound at all; its job is to make the a say its name. So Book 4 is not
just new word lists. It needs a change to how a word is tapped.

## Scope

In scope:

1. Deepen the five existing Book 3 sections (3.1 to 3.5) with more words,
   sentences and stories, and clear the known polish items in those files.
2. Add Book 4 as six new sections, 4.1 to 4.6, teaching the vowel-consonant-e
   (silent e) syllable.
3. Change the tapping model so a silent letter is shown but never tapped, and
   draw the bridge line from the vowel to the silent e.

Out of scope, deliberately:

- Book 5 (open syllables) and everything after it. The owner chose to stop at
  Book 4 for now. The work in this spec builds the machinery Book 5 needs, so
  picking it up later is mostly content.
- Any change to session shape, progression, placement, recording, backup or
  publishing.
- Handwriting, and the program's ten-part lesson. Tapwords keeps its six parts.

## Decisions the owner made

- Silent e is shown dimmed with **no tap dot**, and a **curved bridge line**
  arcs from the vowel to it. "cake" is three taps. The alternative of a fourth
  silent tap was rejected: it would teach that a silent letter is a sound.
- Book 3 gets deepened; Book 5 waits.
- The child is comfortable with multi-syllable words, so Book 4 may use real
  two-syllable words at the program's normal pace rather than avoiding them.

## Decisions taken on the owner's behalf

- **u–e has two sounds.** *mule* is the card; *June, flute, rule, prune* are
  taught in 4.3 as a second sound of the same spelling, using a second card that
  shares the display "u_e" but is excluded from the sound-card drill. The
  alternative — two cards that look identical in the deck — would make the drill
  unanswerable.
- **Section titles and order** follow the program's publicly described scope and
  sequence, the same basis used for Books 1 to 3. The tutor should confirm them.
- Exception words *have, give, live* are taught in 4.6 as words that break the
  rule, not as sight words, so the child meets them with an explanation.

## Part one: deeper Book 3

No new sections and no new cards. Each of 3.1 to 3.5 grows:

| Per section | Today | Target |
|---|---|---|
| Real words | about 20 | 35 |
| Nonsense words | about 12 | 20 |
| Sentences | 9 | 18 |
| Stories | 2 | 4 |
| Questions per story | 2 | 2 or 3 |

Rules for the added content, unchanged from the first build:

- Every word must be decodable with cards taught at or before its own section,
  and must not already exist in another section's bank (the checker enforces
  both).
- Nonsense words: pronounceable, follow the section's pattern, never a real
  word, name or slang, never one letter from a rude word.

  **How to actually run that check**, because the obvious way misses things.
  Section 4.1's author did the walk twice; the first pass shipped `wike`, which
  is one letter from an ethnic slur, because it found a harmless neighbour
  (`like`) and stopped. Running it properly the second time also killed `kide`
  and `nipe`, each one letter from a different slur, and `mide` and `tade`,
  both real dictionary words. So:

  1. For **every position** in the word, substitute **every letter of the
     alphabet**, and keep going after a harmless neighbour turns up. One safe
     match proves nothing about the next substitution.
  2. Check the result against slurs and profanity, not only against words you
     happen to think of.
  3. Actually run a dictionary — `grep -ix '<word>' /usr/share/dict/words` —
     rather than relying on recall. Real but obscure words (`tave`, an archaic
     dialect verb) slip through otherwise.
  4. Read the word as a chunk as well as a whole: `distrunpock` ends on a
     displayed chunk one letter from a rude word, and `blenmafrosh` ends on
     real slang.
  5. Watch for colloquial spellings of real words. `dabbin` and `blastin` are
     not nonsense — they are real words with the g dropped, and a ten-year-old
     reads them on sight.
- Sentences and stories may use only taught words and declared sight words.
- Story titles and answer choices must be decodable. Question prompts are spoken
  by the app and may use any words.
- Every answer choice must be answerable from its own story, and exactly one
  choice may be defensible.
- Stories are authored with the correct answer first; the engine shuffles.

Polish to clear while in these files, from the handoff's known-issues list:

- Replace the "have fun" endings in the 3.3 and 3.4 stories.
- Replace answer distractors that are not drawn from their own story.
- Retire the bank words that are bookish for a ten-year-old: *complex, insult,
  husband, absent* (3.2); *misconduct, combatant, enlistment, investment,
  commitment, consultant* (3.4); and *vat, cam, sham, rind, volt*. Replace them
  with words of the same pattern and sound count.

## Part two: Book 4, six sections

Numbering matches the program so "she's on 4.2" means the same thing in both.

| Section | Title | Teaches | Example words |
|---|---|---|---|
| 4.1 | Silent e with a and i | cards `a_e`, `i_e` | cake, made, name, ride, smile, time |
| 4.2 | Silent e with o and u | cards `o_e`, `u_e` | hope, stone, woke, mule, cube, note |
| 4.3 | Silent e with e, and u–e's second sound | cards `e_e`, `u_e_oo` | eve, Pete, theme, June, flute, rule |
| 4.4 | Silent e after blends and digraphs | no new cards | stride, flame, globe, chose, while, shape |
| 4.5 | Long words with a silent-e syllable | no new cards | invite, reptile, stampede, compete, inside |
| 4.6 | Adding s, and words that break the rule | no new cards | cakes, kites, hopes — have, give, live |

Each section carries the same minimum the checker enforces on every existing
section (20 real words, 10 nonsense, 6 sentences, 1 story with 1 question), and
should aim comfortably past it: about 30 real words, 15 nonsense, 12 sentences
and 2 or 3 stories per section. That is less than the deepened Book 3 sections
ask for, because these are authored from nothing rather than grown.

Sections 4.4, 4.5 and 4.6 introduce no cards, so they use their own word bank as
the "current" set for the sound drill, exactly as 3.1 to 3.4 do today.

Sight words are declared per section and cumulative. Book 4 sections may add
sight words the stories need; keep the list short and justify each one.

Nonsense words in Book 4 follow the silent-e pattern — a consonant, a vowel, a
consonant, a silent e — and are held to the same safety bar.

One trap that applies to the whole program, not only Book 4: **a card has exactly
one recorded sound, and the app plays it every time that card is tapped.** So a
word is only usable in a lesson, a sentence or a story if every letter takes the
sound the child has been taught.

Two places this bites, both found by review rather than by any automated check:

- **s saying /z/.** *these, rose, nose, wise, chose, those, close, doze, prize,
  confuse, refuse, surprise* are all banned in Book 4; the s sound option is not
  taught until Book 6. Use *theme, eve, Pete, Steve* for e–e and *hope, stone,
  woke, globe* for o–e.
- **The three sounds of `ed`.** *landed* says /ed/, *jumped* says /t/, *filled*
  says /d/. The `ed` card carries the single sound /ed/, so the app says
  "jump-ed" for *jumped*. Only bases ending in **t** or **d** may appear
  anywhere in the section — the word bank included. (An earlier draft of this
  spec allowed other bases to sit in the bank "where the child reads them rather
  than hearing the app say them". That was wrong about the engine: word work
  draws its tap items from the bank and plays each card's sound as she taps it,
  so a bank word is heard card by card too.) The same reasoning bans plural *s*
  after anything but k, p, t or f in section 4.6.

This rule is invisible to `src/content/check.ts` and always will be — it is
about sound, not spelling. It belongs in every content brief.

## Part three: the code change

### Content types

`src/content/types.ts`:

```ts
export type CardType =
  | 'consonant' | 'vowel' | 'digraph' | 'welded'
  | 'vce'      // a long vowel that owes its sound to a silent e later in the syllable
  | 'silent';  // a letter that is shown but makes no sound and is never tapped

export interface Card {
  id: string;
  grapheme: string;    // the letters as they appear inside a word: "a" for the a_e card
  display?: string;    // what the sound-card tile shows: "a_e"; defaults to grapheme
  keyword: string;
  phonemeLabel: string;
  type: CardType;
  drill?: boolean;     // default true; false means never shown in the sound-card drill
}
```

`grapheme` stays the letters as they appear in a word, so `parts` still join to
spell the word and the existing checker rule holds unchanged. `display` exists
only for the tile in the card drill and the recording screen.

### New cards

```
a_e   grapheme a   display a_e   keyword cake   type vce
i_e   grapheme i   display i_e   keyword ride   type vce
o_e   grapheme o   display o_e   keyword hope   type vce
u_e   grapheme u   display u_e   keyword mule   type vce
e_e   grapheme e   display e_e   keyword Pete   type vce
u_e_oo grapheme u  display u_e   keyword rule   type vce   drill: false
e_silent grapheme e display e    keyword silent e  type silent  drill: false
```

A word is tapped as, for example, `cake` -> `c, a:a_e, k, e:e_silent`.

### Tapping

`src/ui/components/TapDots.tsx` today draws one tile and one dot per part, and
looks the tile's colour up by its letter. Both change:

- Tiles still render one per part, in order, but their type comes from
  `p.card`, not `p.grapheme`. A letter can now belong to more than one card
  (short e and silent e are both "e"), so a grapheme lookup is wrong.
- Dots render only for parts whose card is not `silent`. "cake" gets three.
- Demo playback iterates sounding parts only, so the app never pauses on a
  letter with nothing to say.
- Syllable-start marks, which are indexes into `parts`, must be mapped to the
  dot that belongs to that part.
- A silent tile renders dimmed.

A small helper belongs next to the content types, not in the component, so the
engine and the tests can use it:

```ts
export function isSilent(card: Card): boolean;
export function soundingParts(word: Word, cards: Card[]): WordPart[];
```

### The bridge line

An SVG overlay inside the tile row, absolutely positioned, with a quadratic
curve from the centre of the `vce` tile to the centre of the `silent` tile that
follows it in the same syllable. Geometry is measured from the tiles after
layout, so the line stays right at any word length or screen width, and is
recomputed on resize.

Under jsdom there is no layout, so the measured geometry is zero. The component
must render the overlay anyway, marked `data-testid="vce-bridge"`, and unit
tests assert it is present and connects the right two tiles by index rather
than asserting pixels. The Playwright suite checks it visually at iPad size.

The line is decorative: `aria-hidden`, and nothing about the activity depends
on it.

### Other screens

`src/ui/tiles.ts` gains a lookup by card id and keeps the grapheme lookup for
the two places that genuinely only have a letter (`TileBuilder`,
`LessonPart`'s `show` step). Word-level tiles in `TapDots` and `WordWorkPart`
switch to the card lookup.

`RecordScreen` and the sound-card drill show `display ?? grapheme`, so the
grown-up recording a sound sees "a_e" and not a bare "a".

### Engine

`src/engine/session.ts` builds the forward drill, the reverse drill and the
sound-spelling items from card ids. All three must skip cards with
`drill === false`, so the silent e and the second u–e sound are never drilled
as sounds. Everything else — word work, spelling, read-aloud, stories,
strength tracking, progression — is unchanged.

### Checker

`src/content/check.ts` gains three rules and one fix:

1. A `silent` part must be preceded, in the same syllable, by a `vce` part.
2. A `vce` part must be followed, in the same syllable, by exactly one `silent`
   part.
3. A card's `display` counts as introduced alongside its grapheme, so a lesson
   may `show: ['a_e']`.
4. The existing "part grapheme must match card grapheme" rule already passes
   for the new cards, because their grapheme is the in-word letter. No change,
   but the new-card tests must prove it.

Existing rules stay: welded endings, parts spelling the text, syllable indexes
in range, cards taught before use, one bank per word text, minimum counts,
sentences and stories built only from taught and sight words. No Book 4 word
ends in a welded ending, because every silent-e word ends in e.

The checker's blind spots do not change: story titles, question prompts and
answer choices are not scanned, and it cannot judge whether a nonsense word is
safe or a question has two defensible answers. Those stay a human job.

## How this gets verified

Nothing is called done without the command run and the output shown.

- `npm test` — the unit suite, 238 tests today. New tests: one file per new
  section under `tests/content/`, mirroring `s3-5.test.ts`; checker tests for
  each of the three new rules, including the failure cases; engine tests that
  no undrillable card reaches a drill; `TapDots` tests that "cake" has three
  dots and four tiles, that the silent tile carries no dot, and that the bridge
  overlay names the right tile pair.
- `npm run typecheck` and `npm run build`.
- `npm run e2e` — the iPad-sized browser suite, plus a new case that plays a
  Book 4 session end to end and checks the bridge line renders.
- A read-every-word review of all new content by a reviewer who is not its
  author, against the content rules above. This is what caught the real
  problems in the first build; the checker cannot replace it.
- Book 3 regression: the deepened sections must still pass their existing tests
  unchanged, and no word may move between banks.

## Risks

- **Teaching order.** The correlation to the program is from public knowledge,
  not a manual. The six titles appear in the app's "Start at" menu; the tutor
  should confirm them. Reordering is cheap, so this is not a blocker.
- **A child mid-section.** Deepening Book 3 adds words to banks she is already
  working through. Strength is tracked per word key, so new words simply start
  unseen; nothing she has already learned is lost. Removing the bookish words
  drops their strength records, which is harmless.
- **The bridge line on real hardware.** Measured geometry is the fragile part.
  The Playwright check at iPad size plus the owner's real-iPad pass are the
  guard.
