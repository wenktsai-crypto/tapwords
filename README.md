# Tapwords

A calm, self-guided structured-literacy reading app (Orton-Gillingham style) for tablets and laptops.

## Run it

    npm install
    npm run dev

Vite prints two addresses. On the computer itself, open the **Local** one.

To use it on an iPad, the iPad must be on the same Wi-Fi network as the computer. Open the
**Network** address Vite prints (it looks like `http://192.168.x.x:5173`) in Safari on the iPad.

Add a child, pick a starting point, tap their name.

For a faster, production-like copy on the iPad:

    npm run build && npx vite preview --host

and open the Network address that prints.

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
