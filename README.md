# Tapwords

A calm, self-guided structured-literacy reading app (Orton-Gillingham style) for tablets and laptops.

## Run it on your own computer and iPad

    npm install
    npm run dev

Vite prints two addresses. On the iPad (same Wi-Fi as the computer), open the **Network** address in Safari. On the computer, open the Local one. Add a child, pick a starting point, tap their name.

For the finished, faster version:

    npm run build
    npm run preview

## Put it on the iPad's home screen

1. Open the **published** address in Safari on the iPad (see "Publish it" below). If you have not published yet, run `npm run build` then `npm run preview` on the computer and open the Network address it prints. Do not use the `npm run dev` address for this: that one needs the computer running and does not work offline.
2. Tap the Share button, then **Add to Home Screen**, then **Add**.
3. Open it from the home screen from now on. It works without internet after the first open.

Progress lives on that iPad. Each child's profile and history are saved there.

## Starting a child at the right place

When you add a child you can either pick a starting point from the list (each entry shows example words) or tap **Find the starting point with a short check**. Sit with your child: words appear one at a time, your child reads each out loud, and you tap **Got it** or **Missed it**. The check stops on its own when the words get too hard and suggests where to begin. You can change the suggestion before saving, and re-run the check any time from the grown-up area (hold the **Grown-ups** button next to the child's name).

## The silent e (Book 4)

Starting in Book 4, a word can have more letters than your child taps out loud — "cake" has four letters but only three taps, because the last e makes no sound at all. On screen that e is shown faded, with no dot under it, and a curved line runs from it back to the vowel earlier in the word. The line means "this e makes the vowel say its own name."

## Recording the sounds in your own voice

The app speaks with the device's built-in voice. If you would rather your child hear a person, open the grown-up area, tap **Record sounds**, and record each sound card once: tap **Record**, say the sound (the sound, not the letter name), tap **Stop**. Recordings are kept on the device and included in backups.

## Backing up and moving to another device

In the grown-up area, tap **Back up everything on this device**. On an iPad this opens the share sheet so you can save the file to Files or send it to yourself; on a computer it downloads. The file holds every child's progress and any recorded sounds.

To restore, open Tapwords on the other device, tap **Restore from a backup** on the first screen (or in the grown-up area), choose the file, then choose **Replace everything on this device** or **Add to what is here**. Adding keeps the children already on the device and overwrites only a child with the same identity as one in the backup.

If the app ever says the saved data is damaged, restore from a backup the same way, or hold **Start fresh** to clear it.

## Publish it so other families can use it

Tapwords is published at **https://wenktsai-crypto.github.io/tapwords/** from the `wenktsai-crypto/tapwords` repository. Every push to `main` republishes it.

To publish your own copy, the repository includes a GitHub Pages workflow:

1. Create a GitHub repository and push this project to its `main` branch.
2. In the repository settings, under Pages, set the source to **GitHub Actions**.
3. Every push to `main` builds, runs all the tests including the browser tests, and publishes. The address is `https://<your-username>.github.io/<repository-name>/`.

If your repository is named `<your-username>.github.io`, the address is just `https://<your-username>.github.io/`.

Send families that address; they follow the home-screen steps above.

## Check it

    npm test          # engine, content checker, screens, build output
    npm run typecheck
    npm run e2e       # real browser at tablet size: full session, offline reload, placement check, backup and restore

The first time, run `npx playwright install chromium` once to download the test browser.

## Before handing it to a family

- Open the address on a real iPad, add a child, and play one session end to end.
- Add it to the home screen, turn on Airplane Mode, and open it again.
- Do the read-aloud part once so a parent sees how marking works.

## Where things live

- `src/content` — sound cards and twenty-two substep files, one per substep. Every file must pass the content checker (`tests/content`).
- `src/engine` — session assembly, scoring, review, advancement. No React, no browser.
- `src/store`, `src/audio` — device storage and voice, behind interfaces with test fakes.
- `src/ui` — screens and session parts.
- `tests/e2e` — Playwright browser tests.
- `docs/superpowers/specs` — the design. `docs/superpowers/plans` — build plans.
