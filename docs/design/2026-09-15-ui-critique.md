# UI critique — Tapwords, 2026-09-15

Two independent assessments: a design review and a measured browser/detector pass.
Screenshots: 57 in critique-a/, 97 in critique-b/ (session scratchpad).

---

# Assessment A — Design Review: Tapwords

Reviewed live at http://localhost:4173/ on 2026-09-15. Two full sessions driven end-to-end (section 1.1 and section 4.1), plus the first-run empty state, add-child flow, grown-up area, placement check and record screen. Screenshots at 1024x768, 768x1024 and 400px are in this directory. Source read: `src/ui/styles.css` (222 lines), `src/ui/screens/`, `src/ui/session/`, `src/ui/components/`.

---

## 1. Design-specificity verdict

**Mixed, and the split is clean: the tiles are unmistakably this product; everything around them is a generic beige shell.**

Strip the tiles out and what remains — a cream page, a centred column, one green pill and a row of beige pills, a two-column `dl` of stats — would serve a meditation app, a pension calculator or a bakery's booking page unchanged. There is no mark, no illustration, no motif, no child-facing identity. The home screen is an `<h1>` that says "Tapwords" in the body font; the only visual identity in the whole product is a horse emoji in the `<title>` tag that never appears on screen.

But the moment a word row renders, the design becomes specific and defensible in a way very few products manage. `SoundTiles.tsx` + `.vce-bridge` (styles.css:199-212) draws a real teaching object: `c` `a` `k` `[dashed e]` with a green arc reaching from the vowel to the silent e, three dots below for three sounds and none under the e. That screen could not belong to any other product. The 26-line comment in `SoundTiles.tsx` explaining that a quadratic Bezier only reaches half its control offset, so `ARC_PULL 52` gives a 26px scoop, is the work of someone who cared whether the curve *reads as a curve joining two letters*. That is design specificity.

The verdict is therefore: the **core is grounded, the frame is not**. The warmth the owner is asking for should be spent on the frame — home, session-end, the grown-up area — and the polish should be spent on making the core's own signals survive an actual iPad screen. Which brings us to the largest problem in the app: those signals currently don't.

---

## 2. Nielsen's ten heuristics

| # | Heuristic | Score | Justification |
|---|---|---|---|
| 1 | Visibility of system status | **1** | There is no session progress anywhere — no "part 3 of 6", no time remaining. I tapped through **12 identical sound cards** then 6 reverse cards with no counter of any kind; only individual parts (`1 of 11`, `1 of 6`) show position, and only inside themselves. |
| 2 | Match with the real world | **3** | Copy is genuinely excellent and plain ("Say the sound, not the letter name: 'mmm', not 'em'"). Loses a point because the story is announced as "Story time" and looks like every other screen, and the end-of-session recap ("Today: sound cards, a new lesson, word work, spelling, reading out loud, and a story.") is a comma list a 7-year-old cannot read. |
| 3 | User control and freedom | **2** | "Stop for now" is always available and saves partial work — genuinely good. But there is no back/undo anywhere in a session: a mis-tapped "That's it" is unrecoverable, and after a wrong answer on a reverse sound card the correct tile is highlighted yet **tapping it does nothing** (`SoundCardsPart.tsx:97` — `missedRef` blocks it). The child's instinct to repair is refused. |
| 4 | Consistency and standards | **2** | The same beige pill is a word to decode ("fot / not / lot"), a navigation action ("Stop for now"), a self-assessment ("Not sure") and a settings button ("Record sounds"). Worse: after a wrong story question the correct answer turns solid green — the **same green, shape and row** as the "Next" button beside it (`StoryPart.tsx:136` + `:153`). Accent green means "correct" and "press me" simultaneously, at the moment of maximum confusion. |
| 5 | Error prevention | **3** | Strong. Hold-to-enter for the grown-up area, hold-to-confirm for destructive wipes, `disabled` on Save until a name exists, double-tap guards throughout the session code. Docked for the placement flow, where a child answering "Yes" to "Is a grown-up with you?" (the green primary) with nobody there proceeds to self-mark 11 read-aloud lines, silently corrupting the only accuracy figure the parent sees. |
| 6 | Recognition rather than recall | **2** | The "Start at" control is a native `<select>` with **22 options**, each a long string, truncated at 1024px to `1.1 First sounds and short words (for example: fat, fc`. The colour picker is a text dropdown listing the words `sky / moss / sand / plum` with **no colour shown anywhere** (`Home.tsx:117-119`), yet colour is the child's identity mark on the home screen. |
| 7 | Flexibility and efficiency | **n/a** | Operate mode, single task, one path. There is no expert path to build and none should exist. |
| 8 | Aesthetic and minimalist design | **2** | The restraint is real and correct. But minimalism has been achieved by omission rather than by design: `div.card`, `.builder` and `.tapdots` are applied in the markup and have **no CSS rule at all**, so the word-builder's answer row and its tray render as two undifferentiated rows of identical tiles with the "Done" button sitting on top of them. That is not minimalism, it is missing. |
| 9 | Error recovery | **1** | The worst dimension. A wrong answer produces no acknowledgement of *what* was wrong, no mark on the tile she chose, and one unvarying line — "Let's look at that one." — before an obligatory re-teach. See section 4. |
| 10 | Help and documentation | **3** | For the parent, genuinely good: `parentSummary` explains each section in plain English, the placement intro sets expectations honestly. For the child there is no help at all, but in this mode that is arguably right. |

---

## 3. Cognitive load

This is where the review gets serious, because two findings here are not "polish" — they cost the child working memory she needs for decoding.

### The tile — the most-used object in the app — is nearly invisible

Measured from `styles.css`:

| Pair | Contrast |
|---|---|
| White consonant tile `#ffffff` vs page `#f6f1e7` | **1.11 : 1** |
| Tile border `#d8d1c3` vs page | **1.33 : 1** |
| Peach vowel `#ffe2c4` vs page | **1.09 : 1** |
| Vowel `#ffe2c4` vs consonant `#ffffff` | **1.22 : 1** |
| Welded blue `#e4ecf7` vs consonant `#ffffff` | **1.17 : 1** |
| Quiet button `#e9e3d6` vs page `#f6f1e7` | **1.12 : 1** |

The brief says tile colour *is* the teaching signal. That signal is currently carried entirely by hue, at essentially identical lightness, on a screen a child uses at a kitchen table with a window behind her and iPad auto-brightness turned down. WCAG 1.4.11 asks 3:1 of any graphical object that carries meaning; every one of these is under 1.35. This is not an abstract compliance point — it means the app is asking a dyslexic child to sort letters into categories using a distinction her eye has to work to resolve, and that work comes out of the same budget as the decoding.

The same number explains why the whole interface reads as floating text rather than tappable objects: the quiet pill, which is the app's dominant affordance, is 1.12:1 against the page. Its shape is functionally invisible; it is legible only because there is black text inside it.

### The dots point at the wrong letters whenever a word contains a silent letter

Measured live on section 4.1, word **cake**:

```
tile centres: 377, 467, 557, 647   (c, a, k, e)
dot  centres: 420, 512, 604        (3 sounds)
```

Every dot is 43-47px right of the tile it stands for. Dot 1 — the /k/ in `c` — sits under the boundary between `c` and `a`. Dot 3 sits under the boundary between `k` and the silent `e`. The child taps a dot that is visually *between* two letters, in the exact lesson where she is being taught that the last letter gets no dot.

The cause is structural: `.row-tight` and `.dots` are two independently centred flex rows (styles.css:138, :174). When the counts match (three letters, three sounds) symmetry saves it. When a silent letter makes the counts differ — i.e. throughout all of Book 4 — every dot drifts. This is the single most pedagogy-damaging visual defect I found, and it is invisible in Books 1-3, which is presumably why it survived.

### Decision points with more than four visible options

- **`Start at` select, `Home.tsx:123`** — 22 options, each a truncated sentence, for the highest-stakes decision a parent makes. (The "short check" that exists to answer this question sits *below* it as a quiet button.)
- **`Move to` select, `ParentArea.tsx:121`** — the same 22.
- **`Path` component rendered to the child on the session-end screen** — 22 pills, 21 of them grey. See section 4.
- **Record screen** — 54 identical rows, no progress count, no "record the ones for the section she's on now first".

Within a session the child never faces more than four choices at once. That part is right.

### Attention spent on nothing

The forward sound-card screen offers three buttons: `Hear it`, `That's it`, `Not sure`. `That's it` and `Not sure` both call `nextForward` and **neither is recorded** (`SoundCardsPart.tsx:120-121`). Twelve times in a row, the child makes a self-assessment that has no consequence anywhere in the app. Either score it or remove it; asking a child who already feels bad at reading to judge herself twelve times for no reason is the most expensive kind of free.

### Two screens that look identical but have different stakes

The lesson's "try" step and word work's "tap" item are pixel-identical apart from the caption text ("Your turn. Tap each sound, then blend." / "Tap it out, then blend."). In the first, a wrong tap order costs nothing. In the second it is scored and triggers a forced re-teach. The child cannot tell which she is in.

---

## 4. Emotional journey

### The valley: getting one wrong

On a reverse sound card I deliberately tapped `i` when the answer was `a`. What happened (`09b-sound-reverse-MISS.png`):

- the tile she tapped is given **no mark of any kind** — it dims exactly like the other wrong choice;
- the correct tile gets a green outline;
- no words appear beyond the question that was already there;
- the correct tile is now dead to the touch, and a `Next` button she must find appears beside `Hear it again`.

There is no "not quite", no "listen again", no acknowledgement that anything happened. The screen simply reveals the answer and waits.

In word work and spelling it is worse in a different direction: every miss routes into `MissReview`, which says **"Let's look at that one."** — the same eight words, every time, in 20px caption grey — and then forces a full demo-plus-retry cycle. So the emotional arithmetic of a bad day is: *the more she gets wrong, the longer the session becomes, and the app says the same flat sentence each time*. A child who misses six words does roughly six extra cycles and hears "Let's look at that one." six times. Nothing in the app ever varies, ever notices a streak of misses, ever says "that one's tricky" or "you got the first two sounds right". There is no differentiation between her first miss of the session and her fifth.

### The peak

There isn't one. The nearest candidate is the story, and the story is six sentences at 44px on the same cream background with the same two buttons, no illustration, no page turn, no colour, no change of register. "Story time" is announced by the voice and then delivered as more of the same screen.

### The end — this is the most important finding in the report

`z-session-end.png`. After roughly twenty-five minutes of hard work, the last thing Mia sees is:

1. "Nice work today." — good, and spoken aloud.
2. "Today: sound cards, a new lesson, word work, spelling, reading out loud, and a story." — a comma list she cannot read.
3. **The entire Wilson scope and sequence: 22 pills, one green, twenty-one grey**, taking 500 of the 768 available pixels (`SessionEnd.tsx:54` renders the same `Path` component the grown-up area uses).
4. A `Done` button whose bottom edge sits at **791px in a 768px viewport** — measured. At iPad landscape, the only button on the end-of-session screen is below the fold and the page must be scrolled.

Apply the peak-end rule literally. The peak is nothing in particular; the end is a map of everything she has not done yet, rendered as twenty-one grey boxes, with the exit clipped off the bottom of the screen. For a child who already suspects she is bad at reading, that is not a neutral choice of content — it is an assessment delivered at the exact moment she is most tired and most open.

At 400px it is worse: the end screen becomes a long scroll of 22 pills.

### The parent's arc

A tired parent holding "Grown-ups" gets the *same* 22-pill path as the first thing on screen, occupying two-thirds of the viewport, before a single number. "Did she practise this week?" is below the fold, in a centred two-column `dl` where the answer ("1", "90%") is set at 24px, six pixels larger than its own label. The page is 1659px tall.

---

## 5. Genuine strengths

**1. The silent-e bridge (`src/ui/components/SoundTiles.tsx`, `styles.css:199-212`).** A green arc measured after layout, re-measured on resize and again after `document.fonts.ready`, refusing to draw when the pair wraps onto different lines, on a dashed tile that is dimmed to 0.7 rather than 0.35 because the author worked out that 0.35 gives 1.67:1 and 0.7 gives 3.06:1. This is a real teaching object, built by someone who checked their own work. It is the best thing in the product and the frame should be rebuilt to deserve it.

**2. The voice-caption pairing (`src/ui/speech.tsx`).** Every spoken instruction is mirrored as visible text via a single `SpeechProvider`, with `aria-live="polite"`, and every `say()` call is wrapped so a failed voice never blocks the screen. A child using this with the sound off, or on an iPad whose speech synthesis fails, loses nothing. That is a structural accessibility decision, not a bolt-on.

**3. The parent-facing copy, throughout.** "Makes one file with every child's progress and the recorded sounds. Save it to Files, iCloud, or email it to yourself." / "Say the sound, not the letter name: 'mmm', not 'em'." / "The check stops on its own when the words get too hard. It takes about five minutes." Not one sentence in the grown-up area needs a second reading. Most products claiming "plain English" do not come close.

**4. Touch targets.** Measured live: every button in a session is 64px or more, every tile 80px or more (160px in large mode). No exceptions found.

---

## 6. Priority issues

### P1 — The semantic tile colours are below the threshold at which they can be seen

**What:** White consonant tile is **1.11:1** against the page; its border is **1.33:1**; vowel-vs-consonant is **1.22:1**; welded-vs-consonant is **1.17:1**.
**Where:** `src/ui/styles.css:2-11` (`--bg`, `--tile`, `--tile-vowel`, `--tile-welded`), `:99` (`.tile` border `#d8d1c3`).
**Why it matters to Mia:** The brief is explicit that tile colour is the teaching signal — the child is being taught to *sort letters by category* and the colour is how the category is named. That signal is currently carried by hue alone at near-identical lightness. On a dimmed iPad, in daylight, or for a child with the reduced contrast sensitivity that often travels with dyslexia, "white means consonant" is a distinction she has to hunt for, and hunting costs the working memory the decoding needs.
**Fix that respects the pedagogy:** Do not change what any colour *means* and do not change the hues. Give every tile a real edge instead: raise `.tile`'s border to 3:1 or better against the page (a `--muted`-family stone, around `#8a7f6b`, measures 3.5:1), and let each tile type carry a *tinted* version of that same border — warm brown for vowel, slate for welded, keeping the dashed treatment for silent. The fills stay exactly as they are; the categories become legible at a glance; nothing gets louder, because a 2px edge adds no colour area. Same treatment on `.big-quiet` (currently 1.12:1 against the page) turns every button from floating text into an object.

### P2 — The end-of-session screen shows the child everything she has not done yet, and clips its own button

**What:** `Path` renders all 22 substeps, 21 grey, as the emotional payoff of the session; `Done` lands at y=791 in a 768px viewport.
**Where:** `src/ui/session/SessionEnd.tsx:54` (`<Path current={result.state.currentSubstep} />`), `src/ui/components/Path.tsx:6-12`, `styles.css:145-148`.
**Why it matters to Mia:** Peak-end. This is the last thing she feels and the thing that decides whether tomorrow's session is a fight. Twenty-one grey boxes is a progress bar read backwards. And she then has to scroll to leave.
**Fix:** Replace the full path with a **three-pill window** — the section she just finished, the one she is on, the one that comes next — plus one concrete, countable thing she did today ("You read 14 words and one story"). Keep the same pill vocabulary and the same accent green so nothing new is introduced. Reserve the full 22-pill path for the grown-up area, where it belongs. Give the screen `justify-content: flex-start` with the button pinned above the fold so `Done` is never clipped. Then, when a section is completed, let *that* be the one moment the app allows itself something extra: the newly-filled pill animating from grey to green. One movement, once per section, is not visual noise — it is the only reward in the product and it costs nothing in stimulation.

### P3 — The word builder has no visual structure at all, and the "Done" button sits on top of the tray

**What:** `TileBuilder` renders an answer row and a tray row as two identical `.row`s inside `<div className="builder">`. **`.builder` has no CSS rule.** Neither does `.tapdots`, nor `div.card`. The result (see `t-build-portrait.png`, `y-spelling-word-filled.png`, `t-build-phone.png`): the built word and the tray touch and visually interleave into a staggered grid of eight identical tiles, and the `Done` pill overlaps the tray tiles. The same missing-rule problem makes `Blend` overlap the tap dots (`p-lesson-try-tapped.png`).
**Where:** `src/ui/components/TileBuilder.tsx:46`, `src/ui/components/TapDots.tsx:85`, `src/ui/screens/BackupPanel.tsx:74,86`, `src/ui/screens/ParentArea.tsx:128`; nothing in `styles.css` matches any of them.
**Why it matters to Mia:** She is being asked to build a word left-to-right from pieces, and she cannot tell which row is her word. Two further consequences of the same missing structure: the answer row is `justify-content: center`, so **every letter she has already placed shifts left when she adds the next one** — for a dyslexic child tracking sequence, the word literally will not hold still; and the `Done` button covers pieces she still needs to reach.
**Fix:** Write the rule. `.builder { display:flex; flex-direction:column; gap:28px; align-items:center }` separates the rows and lifts `Done` clear. Give the answer row a recessed slot treatment — a `--quiet` inset strip with one empty outline per expected letter — so the word has a left-anchored home that does not move as it fills, and the tray reads unmistakably as "pieces to pick from". This is the single change that most improves how finished the app looks, and it adds no decoration. Add `.tapdots { display:flex; flex-direction:column; align-items:center; gap:20px }` at the same time.

### P4 — The dots do not line up with the letters they represent whenever a word has a silent letter

**What:** Measured on `cake`: tiles at 377/467/557/647, dots at 420/512/604 — every dot 43-47px right of its letter.
**Where:** `src/ui/components/TapDots.tsx:86-101` renders `SoundTiles` and `.dots` as two independently centred rows; `styles.css:138` (`.dots { gap: 28px }`, `.dot { 64px }`) against `:174` (`.row-tight { gap: 10px }`, `.tile { min-width: 80px }`).
**Why it matters to Mia:** Book 4's entire lesson is "this letter gets a dot, this one doesn't". The dots currently sit between letters, so the visual contradicts the sentence being spoken over it. Books 1-3 look fine only by the accident of equal counts.
**Fix:** Render one dot slot per *tile*, not per sound, and leave the silent slot empty — then the two rows share a grid and every dot is under its own letter by construction. `SoundTiles` already computes `soundingIndexes` and `silentPartners`, so the information is in hand. Keeps the pedagogy exactly (silent letters still get no dot) and makes it true visually as well as logically.

### P5 — The first screen a parent sees leads with the wrong button, and contains a broken swatch and a raw file input

**What:** On an empty device (`01-home-firstrun-ipad-land.png`): the only real action, "Add a child", is `variant="quiet"`; directly beneath it, at equal weight and with three lines of explanatory copy, sits **"Back up everything on this device"** — on a device with nothing on it. Below that, a raw, unstyled `<input type="file">` reading "Choose File / No file chosen" in system grey, roughly 30px tall. Once a child exists, her identity swatch (`.swatch-sky`, a 12px `border-left` applied to a `border-radius: 999px` pill with `border: none`) renders as a misshapen blue crescent poking out of the left end of the button — see `06-home-with-child.png`; it reads as a rendering glitch.
**Where:** `src/ui/screens/Home.tsx:102` (quiet primary), `:106` (full `BackupPanel` rather than `restoreOnly`), `src/ui/screens/BackupPanel.tsx:81-83` (bare file input), `src/ui/styles.css:153-156` (swatch).
**Why it matters to the parent:** This is the ten seconds that decide whether the app gets set up at all, at bedtime, one-handed. The screen currently presents two equal-weight options of which one is meaningless, and then shows a bare browser widget that makes the product look unfinished before anything has happened.
**Fix:** Make "Add a child" the accent primary and the only large object on the empty state; pass `restoreOnly` on first run so the backup button disappears until there is something to back up (`Home.tsx:106`); wrap the file input in the app's own quiet-pill button with the native control visually hidden; and change the swatch from `border-left` to a real element — a 32px round dot inside the pill, or `box-shadow: inset 12px 0 0 <colour>` — so it reads as an identity mark. While there, replace the colour `<select>` with four tappable colour dots: four options is exactly the case where a dropdown is the wrong control, and it is the one place the palette is allowed to be cheerful.

---

## 7. Persona red flags

### Mia, 7, finds reading hard and may already feel bad at it

- **She ends every session looking at 21 grey boxes.** Twenty-one things she hasn't done, as the reward for finishing. Then she has to scroll to press Done.
- **Being wrong produces silence.** No mark on what she chose, no change of tone, the same eight words every single time, and then *more work*. A bad day makes the session longer.
- **She cannot tell how much is left.** Twelve sound cards with no counter, then six more, then a lesson of unknown length, then word work of unknown length. "How much more?" is the most-asked question of any child doing homework and the app never answers it.
- **The words she must read are the smallest text on the screen.** On the "find the word" screen the three choices are 24px pills (`.big`); elsewhere in the same session a word she reads aloud is 72px (`.bigword`). The decoding target is set smaller than the navigation.
- **After a wrong answer, doing the right thing does nothing.** The correct tile lights up and is dead to the touch. Her instinct to tap it and fix it is refused (`SoundCardsPart.tsx:97`).
- **In Book 4, the dots point between the letters** she has just been told the dots belong to.
- **"Story time" looks like everything else.** No picture, no colour, no page. For a 7-year-old, story means pictures.
- **There is nothing of hers in the app.** No avatar, no name in her own colour that renders correctly, no collection, no thing that grew because she came back.

### A tired parent setting this up at bedtime

- **The first screen offers a backup of nothing** with equal weight to the only thing worth doing, and a raw "Choose File" widget below it.
- **The hardest decision comes as a truncated dropdown of 22 items**, with the tool that exists to answer it (`Find the starting point with a short check`) styled quieter and placed after it.
- **Picking a colour means reading the word "plum".**
- **The grown-up area leads with the whole Wilson curriculum** — 500 of 768 pixels — before any number. The page is 1659px tall; "did she practise this week?" is a scroll away.
- **The numbers are not sized like numbers.** "90%" at 24px under an 18px label, centred, in a field of beige.
- **"Needs the most practice" contradicts the session that just happened.** After one 90%-accuracy session it listed ten items: `a, m, n, i, s, mop, nod, rog, og, fit` — including nonsense strings (`rog`, `og`) a parent will try to practise as words. It always shows ten, regardless of whether ten things need practice.
- **Recording sounds means 54 identical rows** with no progress count and no way to do only the ones that matter this week. And in each row the `Record` control is `.big-quiet` (`#e9e3d6`) sitting on a `.cardrow` background of `#e9e3d6` — **identical colours** (`styles.css:135` vs `:215`) — so the only button in the row has no visible button shape at all.
- **"Is a grown-up with you?" defaults to the green Yes.** A child alone will tap it and self-mark 11 lines, and the parent's accuracy number silently becomes fiction.

---

## 8. Minor observations

- `div.card` is applied in four places and has no CSS rule; only `form.card` is styled (`styles.css:158`). The "Tools" block in the grown-up area and the whole backup panel are therefore bare stacks, not cards.
- `.cardrow` (`styles.css:215`) is the only container treatment in the product, and the record screen is visibly the most finished screen in the app as a result. Evidence that the missing container language is felt, not theoretical.
- `.tile-selected` is `outline: 4px` at `outline-offset: 2px` — 12px of outline in `row-tight`'s 10px gap, so adjacent lit tiles' outlines **merge into one continuous blob** (clearly visible on `c a k e` and `n o d`). This undercuts "one tile = one sound" at the exact moment all tiles are lit.
- In the build activity, the silent `e` renders as a solid peach `tile-vowel`, not `tile-silent` — verified live: `l:tile-consonant | a:tile-vowel | t:tile-consonant | e:tile-vowel`. `TileBuilder.tsx:40` resolves the type by *grapheme* (`cardTypeFor`), so it finds the plain vowel card. Two screens after the lesson taught her that the final e is dashed and silent and joined by an arc, she builds `late` with a solid peach e and no arc. Same word type, same session, contradictory signal.
- The accent green `#2f6f5e` carries four unrelated meanings: primary action, "you tapped this" (`tile-selected`), "this was the correct answer" (`StoryPart.tsx:136`), and the silent-e bridge. On the story-miss screen two of them appear as adjacent green pills.
- No focus styling is defined for `.big` or `.tile`, so the browser default blue ring appears — an off-palette colour, visible in most of the session screenshots.
- `MissReview` renders a `.stage` with no `data-part` attribute (`MissReview.tsx:27`), unlike every other part. Minor, but it is the one screen an automated walk-through cannot identify — which may be why its emotional flatness has gone unexamined.
- The document title carries a horse emoji that appears nowhere in the interface. There is a `manifest.webmanifest` and an `apple-touch-icon`, so the product has an identity on the iPad home screen and then drops it the moment it opens.
- `letter-spacing: 0.04em` on body and `0.12em` on `.bigword` is a good dyslexia choice, and Lexend loads correctly (verified `document.fonts.check('40px Lexend') === true`).
- Placement shows "(a made-up word)" on screen to a child sitting beside the parent. A child who *can* read it has been handed a hint; a child who cannot has been shown noise.

---

## 9. Provocative questions

**1. If the arc is the best idea in the product, why does it appear on exactly one screen out of the dozen where the child handles that word?** The lesson draws the bridge; the build activity does not, the spelling activity does not, the read-aloud does not, the story does not. The child is taught a visual law and then shown the same words all session with the law switched off. What would it cost to make `SoundTiles` the single way any word is ever rendered?

**2. The app can tell when she is having a bad run, and does nothing with it.** `WordWorkPart` holds every `ScoredResponse`, so after three misses in four items the app knows. It responds by adding a fourth forced re-teach. What if the interface noticed instead — one softer line, one easier item, one "let's stop here and come back tomorrow"? The mechanism exists; only the decision to use it is missing.

**3. What is the thing she comes back for?** There is no streak, no collection, no count, no artefact — nothing that is different because she showed up yesterday. The product currently relies entirely on a parent making her. Is that the intended retention model, or an omission? If a reward is added, the one that survives the low-stimulation constraint is probably *the path filling in* — the grey pills going green — which is already on screen and currently reads as a reproach rather than a record.

**4. Is "Not sure" honest?** It is offered twelve times a session, scores nothing, changes nothing, and is indistinguishable in effect from "That's it". A child who uses it truthfully is being taught that admitting uncertainty has no consequence. That is a strange lesson for a product whose whole premise is that admitting what you cannot read yet is how you get help.

**5. Who is the placement screen for?** Every control is the parent's; the only thing on it for the child is the word. It is the first thing she will ever see of the app, and it is a test with "Got it / Missed it" on it. Would the product be better if the child never saw the placement check at all — if the parent read the word from their own phone, or if the screen said something to *her* while the parent marked?

**6. The colour palette is deliberately calm; is the calm doing the work, or just the low contrast?** Everything measured above sits between 1.09:1 and 1.35:1 — including things that are meant to be read as distinct categories. There is a version of this app that is *warmer, more finished and easier for a child to look at* while being no louder at all, because it spends its contrast on edges and structure rather than on colour area. That is the version the owner is asking for, and it does not require giving up one inch of the calm.

---

# Assessment B — Detector + Browser Evidence
**Tapwords** · measured 2026-09-15 · Chrome (CDP), built app served from `dist/`

## How these numbers were produced

Every contrast figure below comes from one of two implementations that were cross-checked against
each other and against a known constant (`#000` on `#fff` = exactly 21.00):

1. **In-page** — `measure.js` injected into the live document. It parses `getComputedStyle`
   colours, composites `rgba`/`opacity` over the real ancestor chain, converts to WCAG 2.x
   relative luminance (`v/12.92` below 0.03928, else `((v+0.055)/1.055)^2.4`, weights
   0.2126/0.7152/0.0722) and returns `(L_hi+0.05)/(L_lo+0.05)`.
   File: `.../scratchpad/critique-b/measure.js`. Sanity check run in page:
   `__m.ratio([0,0,0,1],[255,255,255,1])` → `21`.
2. **Out-of-page** — an independent Python reimplementation (`python3 -c` snippets shown in the
   transcript) used to confirm the token-level pairs. Same pair `#2f6f5e`/`#ffffff`:
   JS `5.905057256985911`, Python `5.905`.

Every pixel size comes from `Element.getBoundingClientRect()` in the live page, not from CSS
inspection. Overflow comes from `document.documentElement.scrollWidth` vs `window.innerWidth`
plus a per-element scan for `rect.right > innerWidth` / `rect.left < 0`.

**Isolation note.** Another agent was driving the same Chrome against `http://localhost:4173`.
To avoid reading their tab, I served the identical `dist/` build on a second origin
(`python3 -m http.server 4273 --bind 127.0.0.1`, from `/Users/kaitsai/Claude Projects/Wilson app/dist`),
worked in my own tab there (separate IndexedDB), bound every `js()` call to my target id, and
captured screenshots with `Page.captureScreenshot` on my own attached session rather than the
"active tab" helper. Two early readings *were* contaminated before I noticed (a topbar that read
"Mia" instead of my own child "Rosa"); everything reported below was re-taken after the fix, and
the three known tile values reproduced exactly, which is the check that the right tab was read.

---

## 1. Detector findings

Command (exactly as specified):

```
cd "/Users/kaitsai/Claude Projects/Wilson app"
node /Users/kaitsai/.claude/skills/impeccable/scripts/detect.mjs --json src/ui
```

**Exit code 2. 4 findings. All one rule.**

| Severity | Count |
|---|---|
| error | 0 |
| **warning** | **4** |
| advisory | 0 (text mode prints none) |

| # | Rule | File:line | Snippet |
|---|---|---|---|
| 1 | `side-tab` | `src/ui/styles.css:153` | `border-left: 12px solid #7cb7e6` (`.swatch-sky`) |
| 2 | `side-tab` | `src/ui/styles.css:154` | `border-left: 12px solid #8fbf7f` (`.swatch-moss`) |
| 3 | `side-tab` | `src/ui/styles.css:155` | `border-left: 12px solid #e4c17a` (`.swatch-sand`) |
| 4 | `side-tab` | `src/ui/styles.css:156` | `border-left: 12px solid #b891c9` (`.swatch-plum`) |

Rule text: *"Thick colored border on one side of a card — the most recognizable tell of
AI-generated UIs."*

Confirmed stable: `--no-config` → 4; scanning all of `src` → 4; text mode lists the same 4 and
no advisory section.

### Detector capability caveats (stated, not skipped)

- Passing markup/component files only (`src/ui/components src/ui/screens src/ui/session
  src/ui/services.tsx src/App.tsx index.html`) returns **0 findings**, but prints to stderr:
  `impeccable detect: DEGRADED - HTML parser modules unavailable (htmlparser2, css-select,
  css-tree, domutils). Falling back to regex matching. Custom properties, selector matching and
  computed contrast are NOT evaluated; findings are an undercount.` The degradation is triggered
  by the HTML file; the `src/ui` directory scan printed no such warning, but per `--help`,
  non-HTML files are matched by **regex** in all cases — so the CSS scan also did not resolve
  custom properties or compute contrast. The contrast numbers in section 2 are mine, not the
  detector's.
- **URL mode is unavailable**: `detect.mjs --json http://localhost:4173/` exits 0 with `[]` and
  `Error: puppeteer is required for URL scanning. Install: npm install puppeteer`. I did not
  install it (no repository changes). A rendered-DOM detector pass was therefore **not** run.

### Which of the 4 are false positives for this product

**All four are false positives, for two independent reasons.**

1. **Not a card side-tab.** The rule targets a thick accent stripe on a *content card*. These
   sit on `.profile-row .big-primary` — a pill-shaped child-picker button on the Home screen
   (measured `331.8 × 64` at 1024 wide, `border-radius: 999px`). Measured in page: the stripe's
   colour `#7cb7e6` against the button's own fill `#2f6f5e` is **2.75:1**; against the page
   `#f6f1e7` it is 1.91:1. It reads as a colour tag on a rounded chip, not an AI-slop card rail.
2. **It is a functional identifier, not decoration.** The four colours are the child's chosen
   "sky / moss / sand / plum" identity, the same word the grown-up picked in the Add-a-child
   form. Removing or thinning it removes the affordance.

**However — a real defect hides behind the false positive, which the detector could not see.**
The four swatch colours are near-identical in luminance to each other:

| pair | ratio |
|---|---|
| sky `#7cb7e6` vs moss `#8fbf7f` | **1.02** |
| moss vs sand `#e4c17a` | 1.23 |
| sky vs plum `#b891c9` | 1.23 |
| sky vs sand | 1.25 |
| moss vs plum | 1.25 |
| sand vs plum | 1.54 |

and each against the button fill it sits on (`#2f6f5e`): sky 2.75, moss 2.79, sand 3.43,
plum 2.23 — three of four under the 3:1 non-text bar (WCAG 1.4.11). In greyscale or with a
common colour-vision deficiency the four children's tags are indistinguishable. The child's
**name is also on the button**, so this is not a colour-alone failure of 1.4.1 — but the colour
is carrying none of the load it was added for.

---

## 2. Contrast

All ratios computed, WCAG 2.x. "Bar" is 4.5:1 for text under 24px (or under 18.66px bold),
3:1 for large text and for meaningful non-text boundaries (1.4.11).

### 2a. Text / background — failures

| Where | Ink | On | Size | Ratio | Bar | Verdict |
|---|---|---|---|---|---|---|
| `.path li` (progress pills, non-current) — grown-up area, session-end | `#6b675e` | `#e9e3d6` | 16px / 400 & 600 | **4.41** | 4.5 | **FAIL** (21 of 22 pills) |
| `.cardrow-keyword` — Record sounds list | `#6b675e` | `#e9e3d6` | 22px / 400 | **4.41** | 4.5 | **FAIL** (×56 rows) |
| `.cardrow-status` ("Not recorded") | `#6b675e` | `#e9e3d6` | 16px / 400 | **4.41** | 4.5 | **FAIL** (×56 rows) |
| Spent tray tile, consonant (`.tile-dim`, `opacity:.35`) | `#b1afa9` eff. | `#f9f6ef` eff. | 40px / 600 | **2.04** | 3 | **FAIL** |
| Spent tray tile, vowel (`.tile-dim`) | `#cdaf8e` eff. | `#f9ecdb` eff. | 40px / 600 | **1.79** | 3 | **FAIL** |
| Disabled `.big-primary` ("Save", "Done") `opacity:.4` | `#cad7d0` eff. | `#a6bdb0` eff. | 24px | **1.35** | 3 | exempt¹ |
| Disabled `.big-quiet` ("Find the starting point") | `#a29e96` eff. | `#f1ebe0` eff. | 24px | **2.26** | 3 | exempt¹ |

¹ WCAG 1.4.3/1.4.11 exempt inactive controls, so these are not violations — but on the
Add-a-child form the *primary* action is the near-invisible element until a name is typed.

The `.tile-dim` pair is the sharpest finding because the codebase already knows about it.
`src/ui/styles.css` carries this comment:

> *"At the shared 0.35 the ink lands at 1.67:1 against the tile, well under the 3:1 WCAG asks of
> large text; 0.7 gives 3.06:1. Scoped, because `.tile-dim` is also the momentary feedback flash…"*

That fix was applied to `.tile-silent.tile-dim` only. The **spent tray tile in TileBuilder** still
runs at 0.35 and measures 2.04:1 (consonant) / **1.79:1** (vowel). Measured opacity ladder for the
consonant case: 0.35→2.04, 0.50→2.97, 0.60→3.93, 0.70→5.33. For the vowel case the ladder is
worse: 0.35→1.79, 0.60→2.89, **0.70→3.56** (first passing step).

### 2b. Text / background — passing (for completeness)

| Where | Ink | On | Size | Ratio | Bar |
|---|---|---|---|---|---|
| `h1` "Tapwords" | `#2b2a26` | `#f6f1e7` | 44px/700 | 12.76 | 3 |
| `h2` section heads | `#2b2a26` | `#f6f1e7` | 33px/700 | 12.76 | 3 |
| `.caption` (every instruction line) | `#6b675e` | `#f6f1e7` | 20px | **5.01** | 4.5 |
| `.topbar span` (child name) | `#6b675e` | `#f6f1e7` | 18px | **5.01** | 4.5 |
| `.bigword` (the word being read) | `#2b2a26` | `#f6f1e7` | 72px | 12.76 | 3 |
| `.bigtext` (story line) | `#2b2a26` | `#f6f1e7` | 44px | 12.76 | 3 |
| `.big-quiet` label | `#2b2a26` | `#e9e3d6` | 24px | 11.23 | 3 |
| `.big-primary` label | `#ffffff` | `#2f6f5e` | 24px | 5.91 | 3 |
| `.path-current` pill | `#ffffff` | `#2f6f5e` | 16px | 5.91 | 4.5 |
| consonant tile letter | `#2b2a26` | `#ffffff` | 40/96px | 14.36 | 3 |
| vowel & silent-e vowel tile letter | `#7a3d00` | `#ffe2c4` | 40/96px | 6.78 | 3 |
| welded / digraph tile letter | `#2b2a26` | `#e4ecf7` | 40px | 12.07 | 3 |
| silent-e "e" letter | `#6b675e` | `#ffffff` | 40px | 5.63 | 3 |
| form label | `#6b675e` | `#f6f1e7` | 18px | 5.01 | 4.5 |

`.caption` at 5.01 and `.topbar` at 5.01 are the thinnest passing margins in the app — a single
step darker on `--muted` and the three 4.41 failures above all clear too (`#635f56` → 4.97 on
`#e9e3d6`, and 5.53 on the page).

### 2c. Non-text: the letter tiles (the category-colour system)

This is the load-bearing one. The tile's **fill colour is the only thing that tells the child
vowel from consonant from welded**, so every pair below is a meaningful non-text contrast with a
3:1 bar. Measured on the live "Which card makes this sound?" screen and on the Record-sounds
screen, which renders one of every card type.

| A | B | Ratio | 3:1? |
|---|---|---|---|
| white (consonant / silent) `#ffffff` | page `#f6f1e7` | **1.13** | ✗ |
| vowel & silent-e vowel `#ffe2c4` | page `#f6f1e7` | **1.10** | ✗ |
| welded & digraph `#e4ecf7` | page `#f6f1e7` | **1.06** | ✗ |
| vowel `#ffe2c4` | white tile `#ffffff` | **1.24** | ✗ |
| welded `#e4ecf7` | white tile `#ffffff` | **1.19** | ✗ |
| welded `#e4ecf7` | vowel `#ffe2c4` | **1.04** | ✗ |
| tile border `#d8d1c3` (2px) | page `#f6f1e7` | **1.35** | ✗ |
| tile border `#d8d1c3` | white fill `#ffffff` | **1.52** | ✗ |
| tile border `#d8d1c3` | vowel fill `#ffe2c4` | **1.22** | ✗ |
| tile border `#d8d1c3` | welded fill `#e4ecf7` | **1.28** | ✗ |
| `.tile-selected` outline `#2f6f5e` 4px | page | **5.25** | ✓ |
| `.tile-selected` outline | white tile fill | **5.91** | ✓ |
| `.dot` border `#2f6f5e` 3px | page | **5.25** | ✓ |
| `.dot-lit` fill `#2f6f5e` | page | **5.25** | ✓ |
| `.big-quiet` button surface `#e9e3d6` (no border) | page `#f6f1e7` | **1.14** | ✗ |
| text input fill `#ffffff` / border `#d8d1c3` | page | 1.13 / **1.35** | ✗ |

**The three known values verify exactly**: white-tile-vs-page 1.13 ✓, vowel-vs-page 1.10 ✓,
vowel-vs-white 1.24 ✓ (in-page `__m.ratio` returned 1.126 / 1.102 / 1.241).

Three corrections/additions to the known set:
- The **welded/digraph** tile `#e4ecf7` is the *weakest* of the three, not the vowel: 1.06 vs
  page, 1.19 vs white, and **1.04 vs the vowel tile** — visually the same surface.
- **Welded and digraph share one colour** (`#e4ecf7`, ratio 1.00 to each other), so the colour
  system distinguishes three categories, not four.
- The **tile's 2px border is also under bar** at 1.35:1 vs page and 1.52:1 vs its own fill, so
  neither the fill nor the edge gives a low-vision child a 3:1 tile boundary. To reach 3:1 against
  the page the border would need roughly `#8e887c` (3.13 vs page, 3.52 vs white fill).

### 2d. Non-text: the silent-e bridge arc (Book 4's signature visual)

`.vce-bridge path` — `stroke: var(--accent)` `#2f6f5e`, `stroke-width: 4px`, **`opacity: 0.7`**.
Composited: `#6b9687` over the page `#f6f1e7`.

**Contrast vs page = 2.94:1 — just under the 3:1 bar.** Measured alpha ladder: 0.70→2.94,
0.75→3.23, 0.80→3.55, 1.00→5.25. Raising the opacity to 0.75 clears it.

---

## 3. Touch targets

Measured with `getBoundingClientRect()` on every `button / a[href] / input / select / textarea /
[role=button]` on each screen visited. **Nothing measured below 44×44 CSS px, at any of the three
viewports.** The app is unusually disciplined here.

| Element | Measured (1024×768) | At 390×844 |
|---|---|---|
| `.big` (every action button) | h = **64** exactly; widths 89.4 – 600 | 64 |
| smallest measured button ("fat", find-the-word) | **89.4 × 64** | wraps, still 64 tall |
| `.tile-large` (sound card) | **160 × 160** | 120 × 120 (`@media max-width:600px`) |
| `.tile-normal` (word tiles) | **80 × 80** (min-width 80) | **64 × 64** |
| `.tapdots-long .tile` (7+ part words) | 60 × 76 | 60 × 76 |
| `.dot` (tap-a-sound) | **64 × 64** | 64 × 64 |
| `.dots` gap between dots | 28px (`tapdots-long`: **4px**) | same |
| text input / select | 600 × **64** | full width × 64 |
| `.path li` pills | 290–301 × **38** | — (not interactive, `<li>`) |

**Two things near the edge, neither a failure:**

1. `.tapdots-long .tile` is **60 px wide** — 4px above the notional 44 bar but the narrowest
   interactive-adjacent box in the app, and it is the one shown for the hardest words.
2. `.tapdots-long .dots { gap: 4px }`. The dots are 64×64 with only **4px** between them.
   WCAG 2.2 SC 2.5.8 is satisfied by size, but for a child with motor difficulty, 4px of
   separation between nine same-looking 64px circles is the thinnest miss-margin in the product.

The `.path` pills are 38px tall but are `<li>` elements with no handler — correctly non-interactive.

---

## 4. Responsive behaviour

Viewports emulated via `Emulation.setDeviceMetricsOverride` at dSF 2.

### 1024 × 768 (iPad landscape) — clean
`scrollWidth 1024 === innerWidth 1024` on every screen visited (home, add-child, sound cards,
reverse cards, lesson word-map, word-work tap / find / build, spelling, read-aloud, story,
session end, grown-up area, placement, record, backup). Zero offenders. The grown-up area and
Record list scroll vertically (`scrollHeight` 1621 and 6080) as expected.

### 768 × 1024 (iPad portrait) — clean
`scrollWidth 768 === innerWidth 768` everywhere measured, including the 7-tile `.tilerow`
(row width 502, first tile at x = 133) and the 9-tile builder tray (wraps 7 + 2, no overflow).

### 390 × 844 (phone) — **the letter-tile row breaks**

This is the real responsive defect, and it is exactly where it was predicted.

`.tapdots > .tilerow` (the word map used in the lesson, word work and miss review) **lays out
wider than the viewport**: the row wraps onto two lines but the block it wraps inside is itself
wider than 390px, so it is centred with both ends hanging off the screen and the page scrolls
horizontally. (I measured the behaviour; I did not chase the exact cascade rule responsible.) Measured on section 4.5 words, `documentElement.scrollWidth` vs
`innerWidth` (390):

| Word | tiles | row width | row left…right | leftmost tile | scrollWidth | arc drawn? |
|---|---|---|---|---|---|---|
| `invite` | 6 | 454 | **−39 … 415** | `i` at −3…61 | **415** | **no** |
| `cupcake`, `pancake`, `reptile`, `sunshine`, `compete`, `explode`, `upgrade` | 7 | 426 | **−25 … 401** | — | **401** | **no** |
| `stampede`, `flagpole` | 8 | 494 | **−59 … 435** | `s` at **−29…31** (half off-screen) | **435** | **no** |
| `milkshake` | 9 | 494 | **−59 … 435** | `m` at **−33…27** (55% off-screen) | **435** | **no** |

Screenshot evidence: `61-tapdots-overflow-390x844.png` — a horizontal scrollbar is visible on the
right edge, the first dot is clipped at x = 0 and the last dot is cut off at the right.
The same component at the same moment renders correctly at 768 and 1024
(`61-tapdots-768x1024.png`, `61-tapdots-1024x768.png`, row width 502, first tile at x = 133/261).

**Consequence beyond the clipping:** because the row wraps onto two lines, `SoundTiles.measure()`
deliberately suppresses the arc (`if (Math.abs(a.top - b.top) > a.height / 2) continue;`).
Measured `arc: false` on every 4.5 word at 390px and `arc: true` on the same word at 768 and 1024.
**At phone width, Book 4's silent-e bridge never draws for long words** — the exact lesson that
visual exists to teach.

Note the contrast with `TileBuilder`'s tray, which is a plain `.row` and wraps cleanly at all three
widths (measured 9 tiles → 4 / 4 / 1 at 390px, no overflow). The defect is specific to
`.tapdots`/`.tilerow`.

### 390 × 844 — second break: the child's own name is clipped

`.profile-row` is `display:flex; flex-wrap: nowrap`. The child button is `flex: 1 1 0%`; its
sibling "Grown-ups (hold)" is `flex: 0 1 auto` and measures **256 px**. At 390 px the row is
342 px wide, so the child gets whatever is left:

| viewport | child button | `clientWidth` | `scrollWidth` | usable content box |
|---|---|---|---|---|
| 1024 × 768 | 331.8 × 64 | — | — | ~276 px |
| 768 × 1024 | 331.8 × 64 | — | — | ~276 px |
| **390 × 844** | **74 × 64** | 62 | **86** | **6 px** |
| 320 × 568 | 68 × 64 | 56 | 86 | **0 px** |

`padding: 12px 28px` alone consumes 56 px of a 62 px box, so the name renders into its own padding
and is visually cut: the screenshot `91-home-390-name-clipped.png` reads **"Ros"**, with the final
letter sliced by the pill. The page itself does not scroll (`scrollWidth 390 === innerWidth 390`),
so an overflow check alone would not catch it. Net effect at phone width: the grown-ups' escape
hatch is 256 px wide and the child's own button is 74 px, with their name unreadable.

### Everything else at 390 × 844
Home, add-child, sound cards, find-the-word, the builder tray, read-aloud, story, session end and
the whole grown-up area: `scrollWidth <= innerWidth`, no offenders, no small targets. The grown-up
area simply gets taller (`scrollHeight` 1621 → 3115).

Nothing else overflowed, collided or wrapped badly at 390: `.big` buttons wrap into the flex row,
body font drops 22 → 18px, tiles 80 → 64px, `.cardrow` grid collapses 4 columns → 2.

---

## 5. Focus states

Measured by dispatching real `Input.dispatchKeyEvent` Tab events with
`Emulation.setFocusEmulationEnabled`, then reading `getComputedStyle(document.activeElement)`
and `matches(':focus-visible')`.

- **The app ships no focus CSS at all.** `grep -n "focus" src/ui/styles.css` → nothing;
  the same grep over the built `dist/assets/*.css` → nothing. Every focus ring seen is Chrome's UA
  default.
- Chrome's default ring measured as `outline: auto 1px rgb(0, 95, 204)`, `outline-offset: 0px`,
  `box-shadow: none`. Contrast of that blue against the page = **5.32:1**; against the element it
  sits on 4.68 (`.big-quiet`), 4.82 (vowel tile), 5.98 (white tile). Passes 3:1 in Chrome.
- Tab order on the reverse-sound-card screen was logical and complete:
  `Stop for now → tile i → tile t → tile s → Hear it again → (browser chrome) → wrap`.
  `:focus-visible` matched `true` on every stop.
- **Risk, not measured here:** because there is zero authored focus style, the appearance is
  entirely UA-dependent. On the actual target device (iPad Safari) the ring differs and for
  `<button>` has historically been absent. I could only measure Chrome.
- **Nothing relies on colour alone for focus** — but two states do (see §6).

### Keyboard operability — one hard failure

**The grown-up area cannot be opened by keyboard.** `HoldButton` binds only
`onPointerDown / onPointerUp / onPointerLeave / onPointerCancel`; there is no `onClick`,
`onKeyDown`, or `aria-` state. Measured: focused `.hold`, dispatched a real `Enter` keyDown, held
**1.8 s** (threshold is 1500 ms), keyUp — screen unchanged. Repeated with `Space` — unchanged.
A real 2.2 s pointer hold at the same coordinates *did* open it. Screen-reader activation on iPad
(VoiceOver double-tap) synthesises a click, not a long pointerdown, so it is locked out the same
way. This gates placement, recordings, stats, the section picker and backup — SC 2.1.1.

---

## 6. Motion

Measured two ways: a scan of every element's computed `transition-duration` /
`animation-name` / `animation-duration` on a live session screen, and a full walk of every rule in
`document.styleSheets`.

- **Zero CSS transitions. Zero `@keyframes`. Zero animations.** Both scans returned `[]`.
- **No `prefers-reduced-motion` media query exists** — and none is needed for CSS, because nothing
  animates. Emulating `prefers-reduced-motion: reduce`
  (`Emulation.setEmulatedMedia`) flipped `matchMedia(...).matches` to `true` and changed nothing
  in the computed styles (still `[]`), confirming there is nothing to suppress.
- The only `transform` in the stylesheet is `button.tile:active { transform: scale(0.97) }` — an
  untweened press state, applied and removed instantly.
- **One timed, JS-driven change does exist and does not consult reduced-motion**: the demo
  word-map in `TapDots` lights each tile/dot in sequence with `await wait(timing.demoDelayMs)`
  (`DEFAULT_TIMING.demoDelayMs = 350`, `previewMs = 1500`, `pauseMs = 800`, in
  `src/ui/services.tsx:12`). It is instruction rather than decoration and cannot be paused or
  replayed; it is not a WCAG 2.2.2 issue (under 5 s, not looping), but it is the one thing in the
  product that moves on its own.

---

## 7. Screen-reader surface

Read from the live DOM and from `Accessibility.getFullAXTree`.

**Correct:**
- `.vce-bridge` (the arc) — `aria-hidden="true"` **and** `pointer-events: none`. Confirmed absent
  from the AX tree; only `c a k e` and the caption appear. This is exactly as intended.
- Decorative dots in *demo* mode — `<span class="dot" aria-hidden="true">`, correctly hidden.
- Interactive dots in *try* mode — real `<button aria-label="Sound 1|2|3…">`.
- Letter tiles are `<button aria-label="…">` when interactive, `<span>` when not.
- Answer-row tiles in the builder relabel to `aria-label="Remove f"` — good.
- Repeated tray pieces are disambiguated (`"e 1"`, `"e 2"`) — a deliberate, working touch.
- `.caption` carries `aria-live="polite"`; `.path` has `aria-label="Progress path"` and
  `aria-current="step"`.

**Gaps, all measured:**

1. **Tile category has no text equivalent.** `aria-label` is the bare grapheme (`"i"`, `"sh"`,
   `"all"`). Vowel / consonant / welded / digraph / silent — the whole point of the colour system —
   is announced identically. Combined with §2c (every category pair under 1.3:1) the category is
   conveyed by colour alone, at a contrast below the non-text bar. SC 1.4.1.
2. **The silent `e` announces as plain "e".** AX tree on the `cake` screen returns
   `StaticText "c" / "a" / "k" / "e"`. Its silence is carried only by a dashed border (1.52:1) and
   muted ink — with the arc hidden, a screen-reader user gets no cue at all.
3. **Tapped/untapped dot state is colour-only.** `.dot` → `.dot-lit` changes fill from transparent
   to `#2f6f5e`; the button has no `aria-pressed` and its label stays `"Sound 1"`. Verified before
   and after tapping.
4. **Spent tray tiles stay live, unlabelled controls.** In `TileBuilder`, a used piece gets
   `class="… tile-dim"` only — it is **not** `disabled`, has no `aria-disabled`, keeps the same
   `aria-label`, and remains in the tab order, while `pick()` silently no-ops. So a keyboard or
   VoiceOver user tabs onto dead buttons with no announced state. (Source:
   `src/ui/components/TileBuilder.tsx`, `pick()` early-returns on `used.includes(idx)`.)
5. **Story: the revealed answer is colour-only.** After a wrong answer, `StoryPart` re-renders the
   correct choice with `variant="primary"` — i.e. the same button, filled green instead of beige,
   with no text or `aria` change. The explanation ("The answer is: …") is spoken via
   `audio.speak`, so with sound off or hearing loss the only signal is the colour swap.
6. **`Sound 1/2/3` labels do not name the letter**, so a non-visual user cannot map a dot to a
   grapheme.
7. No landmarks (`<main>`, `<nav>`) and no `<h1>` on in-session screens — the session screens'
   first heading is `.caption`, a `<p>`.

---

## 8. Console

Capture method: a hook installed via `Page.addScriptToEvaluateOnNewDocument` (so it is present
before the app boots) that records `console.log/info/debug/warn/error`, `window.onerror`, and
`unhandledrejection` into `window.__cap`.

**Positive control run first** (so "empty" means something):
`console.warn('SELFTEST-warn'); console.error('SELFTEST-error'); setTimeout(()=>{null.x},0)` →
captured `[{warn: SELFTEST-warn}, {error: SELFTEST-error}, {uncaught: "Uncaught TypeError: Cannot
read properties of null (reading 'x')"}]`. The hook works.


**Result across a complete session** — one child created, section 4.5, walked end to end:
read-aloud gate → read-aloud (11 items) → sound cards (forward + reverse) → the full silent-e
lesson → word work (tap / find / build, with miss reviews) → spelling (sound / word / sentence) →
story "The Trombone and the Bagpipe" (15 sentences + 3 comprehension questions) → session-end
screen → back to Home. Plus, separately: Add-a-child, the grown-up area, the section picker and
Move, Record the sounds (56 rows), the placement check, and the backup/restore panel, at three
viewports.

### 0 console messages. No errors, no warnings, no uncaught exceptions, no unhandled rejections.

`window.__cap.length` → `0` at the end of the run, and `LOAD CONSOLE: []` immediately after the
page load that started it. Also zero React key/hydration warnings, zero `act()` warnings, zero
deprecation notices. This is unusual and worth saying plainly: for an app of this size it is a
clean result.

One behaviour worth noting that is *not* an error: `speechSynthesis.speaking` was observed stuck
at `true` while my tab was not the frontmost one, which stalls the audio promises the session
awaits. The app is already defended against this — `BrowserAudio.speak()` resolves on a watchdog
`setTimeout(finish, 1500 + text.length * 90)` as well as on `onend`/`onerror`
(`src/audio/browser.ts`) — so the session always continued. `playCard()`'s recorded-clip path
resolves on `onended`/`onerror`/`play().catch` but has **no** equivalent timeout; I could not
exercise it because no sounds were recorded.


---

## 8b. Story part and end screen (measured)

Reached by walking a complete 4.5 session. Screens: `story-title` → 15 × `story` (one sentence at
a time, `.bigtext` 44px) → 3 × `story-question` → session end.

| Element | Measured |
|---|---|
| story sentence `.bigtext` | `#2b2a26` on `#f6f1e7` = **12.76**, 44px, letter-spacing 0.08em |
| story caption "7 of 15" | `#6b675e` on `#f6f1e7` = **5.01**, 20px |
| question prompt (in `.caption`, `aria-live="polite"`) | 5.01, 20px |
| choice buttons `.big-quiet` | label 11.23; **surface vs page 1.14** (no border) |
| longest choice at 1024 | "the two of them could do the song at the same time" — **657 × 64** |
| `Hear it` / `Next` / `Hear the choices` | 64 tall, ≥ 89 wide |
| session-end `.path` pills | 290–301 × 38, non-current pills at **4.41** (fail) |
| session-end `Done` | 117.1 × 64 |

The story-question screen is where the colour-only reveal lives (§7.5): a wrong answer re-renders
the correct choice from `.big-quiet` `#e9e3d6` to `.big-primary` `#2f6f5e`. That is a 4.6:1
surface change, so it is *visible* — but it is the only visual difference, carries no text or
`aria` change, and the explanation is spoken.

## 8c. Backup / restore panel

- Buttons: "Back up everything on this device" **449.3 × 64**; the file input **600–700 × 64**;
  the restore confirm buttons are ordinary `.big` (64 tall).
- Caption text "Makes one file with every child's progress…" `#6b675e` on `#f6f1e7` = **5.01**.
- **No status message is announced.** Querying `[aria-live], [role=status], [role=alert]` across
  the whole grown-up area (which contains the backup panel) returns **`[]`** — zero live regions.
  The result of a backup or restore is rendered as a plain `<p class="caption">{note}</p>`
  (`src/ui/screens/BackupPanel.tsx`, last line of the component), unlike the in-session `Caption`
  which does carry `aria-live="polite"`. So "Backup saved: 1 child." and "We couldn't make the
  backup. Try again." are both silent to a screen reader. SC 4.1.3.
- I did **not** click "Back up everything" — it triggers a file download, and I did not want to
  write files on the user's machine as a side effect of an audit. The finding above is from the
  live DOM query plus the component source.

---

## 9. What I could not check, and why

- **Rendered-DOM detector pass.** `detect.mjs` URL mode needs Puppeteer, which is not installed
  (`Error: puppeteer is required for URL scanning`). Installing it would have modified the
  repository, which was out of bounds. The detector result above is therefore regex-mode only, and
  by the tool's own stderr message that is "an undercount, not a clean bill of health".
- **iPad Safari.** Everything was measured in Chrome via CDP. The focus-ring findings in
  particular are UA-specific: because the app authors no focus styles at all, Safari's behaviour
  could differ (historically, `<button>` gets no visible ring there). Not measurable from here.
- **Real touch / VoiceOver.** Hold-to-open was exercised with synthetic pointer events and
  synthetic key events. I could not run an actual VoiceOver rotor pass; the screen-reader findings
  come from the DOM and `Accessibility.getFullAXTree`, which is a good proxy but not the device.
- **Audio.** Every part is scaffolded by speech; I could not hear it, so "is the spoken cue
  sufficient where the visual one fails" is judged from the code path, not from listening.
- **Placement check beyond the first word.** I began it and measured the word screen, then
  cancelled rather than sit through 7 lists × 8 words.
- **The backup itself.** I measured and inspected the panel but did not press "Back up everything
  on this device", because it writes a file to the user's machine. Restore was likewise not run.
- **Story-question contrast in its *revealed* state.** I walked all three questions but answered
  them correctly (the correct choice is exposed as `data-answer` on the stage), so the
  wrong-answer reveal was not re-triggered for a live measurement; §8b's numbers for that state
  are the two button variants' own measured values.
- **Shared-browser contamination.** A second agent was driving the same Chrome. It closed my tab
  once mid-run and I lost an in-progress session; two early readings came back from its tab before
  I hardened every call to my own target id. Anything in this report was taken after that fix.
- **Colour-vision simulation.** I report measured luminance contrast; I did not run a deuteranopia
  /protanopia transform over the screenshots.

## 10. Screenshot index

All under `.../scratchpad/critique-b/`. Every one captured with `Page.captureScreenshot` bound to
my own tab session (the earlier "active tab" helper was proven unreliable in a shared browser).

| File | Screen | Viewport |
|---|---|---|
| `01-home-empty-1024x768.png` | Home, no children | 1024×768 |
| `02-addchild-1024x768.png`, `02b-addchild-focus-input-1024x768.png` | Add a child (+ focused field) | 1024×768 |
| `03-home-with-child-1024x768.png` | Home with one child + colour swatch | 1024×768 |
| `04-soundcards-1024x768.png`, `05-soundcards-reverse-1024x768.png` | Sound cards, forward + reverse | 1024×768 |
| `06-focus-tile-1024x768.png` | Keyboard focus ring on a letter tile | 1024×768 |
| `07-lesson-wordmap-1024x768.png` | Lesson word map (`map`) | 1024×768 |
| `08/09/10/11/12/13-wordwork-*.png` | Word work: tap, blend, find, look, build, built | 1024×768 |
| `14-missreview-1024x768.png` | "Let's look at that one" | 1024×768 |
| `20-grownup-area-1024x768.png` | Grown-up area (path, stats, tools) | 1024×768 |
| `21-record-1024x768.png` | Record the sounds (56 rows) | 1024×768 |
| `22-placement-1024x768.png`, `23-placement-word-1024x768.png` | Placement check intro + word | 1024×768 |
| `30-bridge-4.1-{1024x768,768x1024,390x844}.png` | Silent-e bridge arc, three viewports | all three |
| `40-session-end-1024x768.png` | End screen | 1024×768 |
| `41-readaloud-gate-1024x768.png`, `42-readaloud-{1024x768,768x1024,390x844}.png` | Read aloud | all three |
| `60-build-9tiles-{1024x768,768x1024,390x844}.png` | 9-tile builder tray (wraps correctly) | all three |
| **`61-tapdots-overflow-390x844.png`** | **the letter-tile row overflowing at phone width** | 390×844 |
| `61-tapdots-{768x1024,1024x768}.png` | same component, same moment, no overflow | 768/1024 |
| `70-S-*.png` | first (partial) session walk, one per distinct screen | 1024×768 |
| `80-*.png` | **the complete session walk** — `sound_forward`, `sound_reverse`, seven `lesson_*`, `word_work_{tap,find,build}`, `spelling_{sound,word,sentence}`, `story_title`, `story_1..7_of_15`, three `story_question_*` | 1024×768 |
| `90-home-backup-{1024x768,768x1024,390x844}.png` | Home with a child, three viewports | all three |
| **`91-home-390-name-clipped.png`** | **the child's name cut to "Ros" at phone width** | 390×844 |
| `92-grownup-{768x1024,390x844}.png` | Grown-up area, narrow viewports | 768 / 390 |
