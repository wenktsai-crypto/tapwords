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

## Publish it so other families can use it

The repository includes a GitHub Pages workflow. To publish:

1. Create a GitHub repository and push this project to its `main` branch.
2. In the repository settings, under Pages, set the source to **GitHub Actions**.
3. Every push to `main` builds, runs all the tests including the browser tests, and publishes. The address is `https://<your-username>.github.io/<repository-name>/`.

If your repository is named `<your-username>.github.io`, the address is just `https://<your-username>.github.io/`.

Send families that address; they follow the home-screen steps above.

## Check it

    npm test          # engine, content checker, screens, build output
    npm run typecheck
    npm run e2e       # real browser at tablet size: full session, offline reload

The first time, run `npx playwright install chromium` once to download the test browser.

## Before handing it to a family

- Open the address on a real iPad, add a child, and play one session end to end.
- Add it to the home screen, turn on Airplane Mode, and open it again.
- Do the read-aloud part once so a parent sees how marking works.

## Where things live

- `src/content` — sound cards and one file per substep. Every file must pass the content checker (`tests/content`).
- `src/engine` — session assembly, scoring, review, advancement. No React, no browser.
- `src/store`, `src/audio` — device storage and voice, behind interfaces with test fakes.
- `src/ui` — screens and session parts.
- `tests/e2e` — Playwright browser tests.
- `docs/superpowers/specs` — the design. `docs/superpowers/plans` — build plans.
