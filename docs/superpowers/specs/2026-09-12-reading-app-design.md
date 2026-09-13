# Structured Literacy Reading App — Design Spec

**Date:** 2026-09-12
**Status:** Draft for review
**Working name:** *Tapwords* (placeholder; rename freely). The app must not use the Wilson name, logo, or copyrighted materials. It is described as "structured literacy, Orton-Gillingham style."

---

## 1. Purpose

A calm, self-guided reading program for a small number of dyslexic children (initially one 9-year-old and a few friends), used on a tablet or laptop, that mirrors the *method* of the Wilson Reading System: a fixed daily lesson shape, sound cards, finger-tapping to segment and blend, controlled word lists (real and nonsense), spelling by sound, and decodable stories that use only sounds already taught.

The app is standalone: it teaches, drills, and decides when to move on. A parent is asked to sit in for one short read-aloud part of each session when available, because out-loud reading is the true test of decoding and the app cannot reliably judge it by listening.

### Success criteria

- A child can complete a full session alone on an iPad without adult help, except the read-aloud part.
- Every word, sentence, and story shown to a child uses only sounds and concepts from their current substep or earlier. This is enforced by an automated check.
- The child advances through substeps 1.1 to 3.5 based on measured accuracy, with review of earlier material mixed into every session.
- A parent can start a child at the right substep, see simple progress, move the child forward or back by hand, and back up and restore progress to another device.
- The app feels calm: one thing on screen at a time, no timers, no red X marks, no scores shown to the child mid-session.

### Explicitly out of scope for version one

- Steps 4 through 12 (content only; the engine must support them without code changes).
- Accounts, logins, cloud sync, or any server.
- Speech recognition.
- Handwriting or letter formation.
- A rich parent dashboard (a one-screen progress view is in scope).
- Points, streaks, unlockables, or other game mechanics.

---

## 2. Users and devices

- **Child (primary user).** Age roughly 7 to 11. Touch-first. Cannot be assumed to read instructions; all instructions are spoken.
- **Parent (secondary user).** Sets up a profile, runs the placement check, sits in for read-aloud, checks progress, records letter sounds if willing.
- **Devices.** iPad in Safari first; laptop browsers second. Minimum layout width 768px, with a usable fallback down to 400px. Installable to the home screen as a web app and usable offline after first load.
- **Profiles.** Multiple children per device. No passwords. Each profile has a name, an optional avatar color, a current substep, and progress history.

---

## 3. Content model

### 3.1 The sequence

Sixteen substeps, following the Wilson scope and sequence for Steps 1 to 3. Each substep is a data file that declares what it introduces and what it contains.

| Substep | Concept introduced |
|---|---|
| 1.1 | Consonants f, l, m, n, r, s (initial), d, g, p, t (final); short vowels a, i, o. Two- and three-sound blending and segmenting. |
| 1.2 | b, sh, u, h, j, c, k, ck, e, v, w, x, y, z, ch, th, qu, wh, introduced gradually in small groups. |
| 1.3 | Three-sound real words and nonsense syllables including digraphs (wish, chop, wet). |
| 1.4 | ff, ll, ss doubling rule; "all" (off, bill, miss, call). |
| 1.5 | Nasalized am, an (ham, fan). |
| 1.6 | Base word and suffix; adding -s and -es to three-sound words (bugs, chills, wishes, taxes). |
| 2.1 | Welded sounds ang, ing, ong, ung, ank, ink, onk, unk (bang, pink); suffix -s. |
| 2.2 | Four sounds in a closed syllable, with -s and -es (flag, steps, brushes). |
| 2.3 | Closed-syllable exceptions ild, ind, old, ost, olt (mold, host). |
| 2.4 | Five sounds in a closed syllable (spend, crafts, branches); common closed-syllable Latin base elements appear in word banks. |
| 2.5 | Three-letter blends, up to six sounds (sprint, scraps, stresses). |
| 3.1 | Two closed syllables, no blends, including compounds (sunset, limit, publish); schwa (wagon); five closed-syllable prefixes on simple bases (misfed, unlock). |
| 3.2 | Two closed syllables with blends (grandchild, problem); more prefixes; Latin bases (distrust, command). |
| 3.3 | Two closed syllables ending in ct (connect, district); prefixes on ct bases (conflict, object). |
| 3.4 | Multisyllabic words of closed syllables only (basketball, establish); prefixes on multisyllabic bases (disconnect). |
| 3.5 | -ed and -ing on unchanging closed-syllable bases (shifted, expanding). |

Substep 1.2 is special: it introduces many sounds "gradually." Its data file lists the sounds in ordered groups (for example: b, sh, u / h, j, c, k, ck / e, v, w / x, y, z / ch, th, qu, wh). The engine treats each group as a mini-substep for card introduction and word filtering, but the child sees it as one substep on the progress path.

### 3.2 What each substep file contains

- **id** (e.g. `"1.4"`), **title** (plain language, e.g. "Double letters: ff, ll, ss"), and **parentSummary** (two sentences a parent can read).
- **cards introduced**: list of sound-card ids.
- **concepts introduced**: tags such as `suffix-s`, `welded-ing`, `doubling-rule`, `two-syllable`.
- **mini-lesson script**: an ordered list of steps, each either `say` (text spoken by the app), `show` (tiles to display), `tap` (a word to demonstrate tapping), or `try` (a word the child must tap themselves).
- **word bank**: entries with `text`, `parts` (an ordered list of grapheme-and-card pairs, e.g. for "off": `o`→card `o`, `ff`→card `f`; the parts are also the tapping pattern, so "off" taps twice), `kind` (`real` or `nonsense`), and `syllables` (for step 3, the split points).
- **sentences**: each with text and an ordered list of the words it contains.
- **stories**: one or two, each with title, text broken into sentences, and one or two comprehension questions with three answer choices.
- **spelling sets**: sounds, words, and sentences used for dictation (may reference the word bank).

### 3.3 Sound cards

A single shared card list covers all steps. Each card has an id, the grapheme shown (e.g. `sh`, `ck`, `ing`), a keyword (e.g. "ship"), a phoneme label for the recording page, and a `type` (`consonant`, `vowel`, `digraph`, `welded`). Welded cards include all, am, an, the -ng and -nk family, and the 2.3 exceptions (ild, ind, old, ost, olt), each tapped as one unit. Blends are not cards; the method taps blends as separate sounds. Roughly 60 cards through step 3.

### 3.4 The content checker

A test that loads every substep file and fails the build if:

- any word's `parts` reference a card not introduced at or before that substep (respecting 1.2's ordered groups), or use a spelling such as `ff` or `ck` whose rule is not yet introduced;
- any word uses a concept tag not yet introduced;
- any sentence or story contains a word not in the word bank of that or an earlier substep, other than a small allowed list of high-frequency sight words declared per substep (Wilson introduces these deliberately; we will declare them the same way);
- any word's `parts` graphemes, joined in order, do not equal its `text`;
- a substep has fewer than the minimum content counts (20 real words, 10 nonsense words, 6 sentences, 1 story).

### 3.5 Authorship

All content is written for this project. Word lists, sentences, and stories will be original. The sequence and concepts follow the publicly documented Wilson scope and sequence, which is an ordering of English phonics facts, not copyrightable text. No Wilson cards, word cards, wordlists, or stories are copied.

---

## 4. The session

### 4.1 Shape

Every session has the same six parts in the same order. Target length 15 to 20 minutes. The app never shows a clock.

1. **Sound cards** (about 2 min). Forward drill: a card is shown, the child says the sound, taps to hear it, and taps "that's it" or "not sure." Reverse drill: the app plays a sound and the child taps the matching card from a set of three. Only the reverse drill is scored.
2. **Learn or review** (about 3 min). On the first session of a new substep, the mini-lesson script runs. On later sessions, a shorter review version runs (the `try` steps only). Tapping is demonstrated with on-screen finger dots: one dot per sound appears under the tiles, the child taps each dot in order and hears each sound, then swipes across to hear the blended word.
3. **Word work** (about 5 min). Three activity types, mixed: *tap it out* (word shown, child taps sounds in order, then swipes to blend; scored on correct number and order of taps); *hear it, find it* (word spoken, child picks it from three written choices that differ by one sound); *build it* (word spoken and shown briefly, tiles scrambled, child drags them into order). Roughly 12 items, at least a third nonsense words.
4. **Spelling** (about 4 min). *Sound to letter*: a sound plays, the child taps the matching tile from a row of four. *Word dictation*: a word plays, the child builds it from a tile tray containing the needed tiles plus two distractors. *Sentence order*: a sentence plays, its words appear shuffled as tiles, the child drags them into order. Roughly 10 items.
5. **Read to a grown-up** (about 4 min). The app asks, spoken, "Is a grown-up with you?" If yes: a list of 8 words then 3 sentences appear one at a time in large type; the child reads aloud; the parent taps "got it" or "missed it." If no: this part is skipped, the session continues, and the app queues one read-aloud check to be offered at the start of the next session. The child is never blocked by the absence of an adult.
6. **Story** (about 2 min). A decodable story appears one sentence at a time. The child reads it (silently or aloud). After each sentence the child may tap to hear it read. At the end, one or two comprehension questions with three picture-free text choices, spoken aloud. If a parent is present they may mark the reading as in part 5; otherwise the questions are the only scored element.

The session ends with a spoken "Nice work today," a short list of what was practiced, and the progress path showing today's position. No score is shown to the child.

### 4.2 How a session is assembled

The engine builds a session from the child's state before it starts:

- **Current-substep items** make up roughly 70 percent of cards, words, and spelling items.
- **Review items** make up the rest, drawn from all earlier substeps. Each card and word carries a *strength* score (see 5.2). Review draws preferentially from the weakest items, with a floor so that every earlier substep is touched at least once every few sessions.
- **Nonsense words** are at least one third of word-work items and one quarter of word-dictation items.
- The mini-lesson runs in full when the substep was reached in the previous session or the child was moved here by a parent; otherwise the review version runs.
- If a read-aloud check is queued from a skipped session, part 5 is offered first, before sound cards.

### 4.3 Handling a miss

A miss is never marked with red or an X. The app says "Let's look at that one," shows the word with tapping dots, taps it out with sound, and asks the child to try once more. The retry is not scored. Then the session moves on. The item's strength drops and it will reappear soon.

### 4.4 Stopping early

A "Stop for now" button is always available. Progress within the session is saved, and the next session starts a new session rather than resuming. Anything completed still counts.

---

## 5. Progression

### 5.1 Placement

On profile creation, the parent chooses one of:

- **Pick a starting point.** A plain-language list of the sixteen substeps with example words. The parent picks one, ideally after asking the tutor.
- **Placement check.** The parent sits with the child. The app shows short word lists (5 real, 3 nonsense) from substeps 1.1, 1.3, 1.6, 2.2, 2.5, 3.1, 3.4 in order, the parent marks each word, and the check stops at the first list below 75 percent. The app suggests starting at the last list that passed and lets the parent accept or change it.

### 5.2 Strength scores

Every card and word has a strength from 0 to 1 per child. A correct scored response raises it; a miss lowers it, more sharply. Items not seen for many sessions decay slowly toward the middle so they resurface in review. Parent-marked read-aloud results update the strength of those words the same way.

### 5.3 Advancing

The child advances from a substep when all of the following hold:

- At least three sessions completed at this substep.
- Over the last three sessions, scored solo accuracy on current-substep items is at least 90 percent.
- Over the last three sessions, scored solo accuracy on review items is at least 85 percent.
- Either the most recent read-aloud check at this substep scored at least 85 percent, or no read-aloud check has been done in the last five sessions (in which case the app advances anyway and shows the parent a note that read-aloud is the real test). A failed read-aloud therefore holds the child at the substep until a later one passes or five sessions go by without one.

Advancement happens at the end of a session. The next session opens with the new substep's mini-lesson. The app tells the child, spoken, "You've finished [title]. Tomorrow we start something new."

### 5.4 Parent controls

From a parent screen (behind a simple "hold to open" gesture, not a password): move the child to any substep, see the progress view, run or re-run the placement check, back up, restore, and record sounds. Moving a child manually resets the session count for the advancement rule.

### 5.5 Progress view

One screen per child: the path of sixteen substeps with the current one marked; sessions completed in the last two weeks; current-substep accuracy; a short list of the ten weakest cards and words; and the date of the last read-aloud check.

---

## 6. Audio

- **Sound clips.** Each card may have a recorded clip. The app ships with none and falls back to the device's built-in speech voice saying the phoneme label. A recording page in the parent area lists every card with a record button; the parent taps, says the sound, and can play it back or re-record. Clips are stored on the device with the profile data and included in backups.
- **Speech for everything else.** Instructions, mini-lessons, words, sentences, and stories use the browser's built-in speech synthesis. The app picks the best available English voice and speaks at a slightly slow rate. Any spoken text is also shown as a short caption a parent can read.
- **Failure handling.** If speech synthesis is unavailable or fails, the caption is shown for longer and a "read this to me" button lets the child tap to retry. The session never gets stuck waiting on audio.
- **Timing.** Sounds are never overlapped. A tap during speech cuts the speech and starts the new sound.

---

## 7. Presentation

- Large, plain sans-serif type (a font with distinct b/d/p/q shapes; final choice at implementation, candidates are Lexend and Atkinson Hyperlegible). Letter spacing widened. Line spacing 1.6 or more.
- One task per screen. The current tile, word, or sentence is the only large element.
- Neutral, warm, low-contrast background; high-contrast text. Vowels shown in a consistent second color on tiles, consonants in the base color, welded sounds and digraphs kept as single tiles.
- No animations that move text, except the tapping dots and blending swipe. Transitions are simple fades.
- Touch targets at least 64px. Everything the child does is a tap or a drag; no typing.
- Landscape orientation on tablets.

---

## 8. Technical design

### 8.1 Stack

- TypeScript, React, Vite. Static site, deployable to any static host (GitHub Pages, Netlify, or similar).
- Progressive web app: installable, offline after first load via a service worker.
- Storage: IndexedDB on the device via a small wrapper. Profiles, progress, session logs, and recorded clips.
- Tests: Vitest for engine and content checker; Playwright for browser flows at tablet size.
- No backend, no analytics, no third-party network calls at runtime.

### 8.2 Modules

```
src/
  content/        one file per substep, the shared card list, sight-word lists
  engine/         pure logic, no React, no browser APIs
    session.ts    builds a session plan from profile state + content
    scoring.ts    updates strength scores from responses
    progression.ts  advancement rule, placement logic
    review.ts     picks review items by strength
  audio/          speak(text), playCard(cardId), record(cardId); clip-or-TTS fallback
  store/          profiles, progress, backup/restore; IndexedDB behind an interface
  ui/
    screens/      Home, Session (one component per part), ParentArea, Progress, Record, Placement
    components/   Tile, TapDots, WordCard, ChoiceRow, TileTray, SpeakButton
  app.tsx         routing and profile context
tests/
  content.test.ts   the content checker
  engine/*.test.ts
  e2e/*.spec.ts
```

**Boundaries.** The engine never imports React or touches the browser; it takes plain data in and returns plain data. Screens never compute scores or pick items; they render a session plan and report responses to the engine. Audio and storage sit behind interfaces so the browser pieces can be swapped or faked in tests.

### 8.3 Key data shapes

- **Profile**: id, name, color, createdAt, currentSubstep, substepEnteredAt (session count), settings.
- **Strengths**: map of item id (card or word) to a number 0 to 1 and last-seen session number.
- **Session log**: one record per session with date, substep, and each scored response (item id, activity, correct, and for read-aloud, parent-marked).
- **Backup file**: JSON of all profiles, strengths, logs, and base64-encoded clips. Restore replaces or merges by profile id, with the parent asked which.

### 8.4 Error handling

- Storage write failure: the session continues in memory; the app shows a small non-blocking notice to the parent area and retries at the end of the session.
- Corrupt or missing profile data: the app offers restore from backup or a fresh start; it never silently discards data.
- Content load failure (should be impossible in a static build, but): show a plain error with a reload button.

---

## 9. Testing plan

- **Content checker** (the most important test): every rule in 3.4, run against every substep file, on every build.
- **Engine unit tests**: session assembly proportions and review selection; strength updates for correct, miss, decay, and parent-marked results; advancement rule for each condition true and false; placement suggestion for several marked patterns; mini-lesson full-vs-review selection.
- **Audio and store**: fake implementations used in tests; real implementations covered by the browser tests.
- **Browser tests** (Playwright, iPad-sized viewport): create a profile and pick a start point; complete a full session with the adult-present path; complete a full session with the adult-absent path and see the queued read-aloud next time; parent moves the child to a new substep and the next session opens with the mini-lesson; back up and restore into a fresh browser context.
- **Manual check before sharing**: one full session on a real iPad in Safari, home-screen install, and airplane-mode reopen.

---

## 10. Build order (for the implementation plan)

1. Project setup, content types, card list, substep 1.1 content, and the content checker.
2. Engine: session assembly, scoring, review, progression, placement. Tested without a UI.
3. Store and audio interfaces with fakes; real IndexedDB and speech implementations.
4. Screens: profile home, then session parts in order 1 to 6, then parent area, progress, record, placement.
5. Content for substeps 1.2 through 3.5, each passing the checker.
6. PWA packaging, browser tests, real-device check, deploy.

---

## 11. Open questions and assumptions

- **Name.** "Tapwords" is a placeholder. Any name is fine as long as it isn't "Wilson."
- **Voice quality.** iPad's built-in voices are acceptable for words and sentences. If they prove poor for a particular word, the content file can carry a phonetic respelling hint for the speech engine.
- **Tutor input.** The tutor may be willing to record the sound clips and confirm the child's starting substep. Neither is required to ship.
