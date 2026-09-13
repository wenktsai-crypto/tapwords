# Tapwords

A calm, self-guided structured-literacy reading app (Orton-Gillingham style) for tablets and laptops.

## Run it

    npm install
    npm run dev

Open the printed address on an iPad or in a desktop browser. Add a child, pick a starting point, tap their name.

## Check it

    npm test          # engine, content checker, screens
    npm run typecheck
    npm run build     # production build in dist/

## Where things live

- `src/content` — sound cards and one file per substep. Every file must pass the content checker (`tests/content`).
- `src/engine` — session assembly, scoring, review, advancement. No React, no browser.
- `src/store`, `src/audio` — device storage and voice, behind interfaces with test fakes.
- `src/ui` — screens and session parts.
- `docs/superpowers/specs` — the design. `docs/superpowers/plans` — build plans.
