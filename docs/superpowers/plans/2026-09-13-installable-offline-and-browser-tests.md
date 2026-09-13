# Installable, Offline, Browser Tests, and Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Tapwords installable to an iPad home screen, usable offline after the first load, covered by real-browser tests at tablet size, and ready to publish as a static site.

**Architecture:** `vite-plugin-pwa` generates the web-app manifest and a precaching service worker at build time (no runtime code of ours). Icons are committed PNGs generated once from an SVG by a script. Playwright drives the production build (`vite preview`) in headless Chromium at 1024x768 with touch; an "auto-player" helper reads small `data-*` hints the screens already render to answer every item correctly, so the specs never depend on randomness. A GitHub Actions workflow builds and publishes to GitHub Pages when the user chooses to push.

**Tech Stack:** vite-plugin-pwa 0.20+, @playwright/test 1.63 (Chromium 1243 is already in the machine's Playwright cache), GitHub Actions `actions/deploy-pages`.

**Spec:** `docs/superpowers/specs/2026-09-12-reading-app-design.md` (sections 2, 8.1, 9, 10 step 6, 11).

## Global Constraints

- The app must not use the Wilson name anywhere. Working name: Tapwords.
- Unit tests stay under `tests/**/*.test.ts(x)` and run with `npm test` (Vitest). Browser tests live under `tests/e2e/*.spec.ts` and run with `npm run e2e` (Playwright); Vitest must not pick them up.
- `npm test`, `npm run typecheck`, and `npm run build` must pass before every commit; from Task 3 on, `npm run e2e` must pass too.
- The production build must work when served from a sub-path (GitHub Pages serves at `/<repo>/`): Vite `base` and the PWA scope come from the `BASE_PATH` environment variable, defaulting to `/`.
- No network calls at runtime other than loading the app's own files (spec 8.1).
- Commit after every task with a plain-English message ending in `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Nothing is pushed to any remote in this plan. Creating a GitHub repository and publishing is a separate, user-approved step.

---

## File structure

```
vite.config.ts                       add VitePWA plugin, base from BASE_PATH, keep vitest config
index.html                           iOS meta tags, theme color
package.json                         scripts: e2e, icons; devDeps: vite-plugin-pwa, @playwright/test
playwright.config.ts                 tablet project, webServer = build + preview
public/icon.svg                      source icon
public/icons/icon-192.png, icon-512.png, maskable-512.png, apple-touch-icon.png
scripts/make-icons.mjs               renders icon.svg to the PNGs with Playwright's Chromium
src/ui/session/*.tsx                 data-item / data-answer / data-step hints (Task 1)
tests/e2e/helpers.ts                 addChild(), startSession(), autoPlay(), openGrownUps()
tests/e2e/session.spec.ts            create child; full session with a grown-up; stats afterwards
tests/e2e/flow.spec.ts               no grown-up → read-aloud offered first next time; parent move → full lesson; stop early persists
tests/e2e/offline.spec.ts            manifest + service worker present; reload while offline still works
.github/workflows/deploy.yml         build with BASE_PATH=/<repo>/ and publish to Pages
README.md                            install-to-home-screen steps, device checklist, publishing steps
```

---

### Task 1: Test hints on the session screens

**Files:**
- Modify: `src/ui/session/SoundCardsPart.tsx`, `src/ui/session/LessonPart.tsx`, `src/ui/session/WordWorkPart.tsx`, `src/ui/session/SpellingPart.tsx`, `src/ui/session/StoryPart.tsx`
- Test: `tests/ui/hints.test.tsx`

**Interfaces:**
- Produces, on the element that already carries `data-part`:
  - `data-part="sound-reverse"` → `data-answer="<target card id>"`
  - `data-part="lesson"` → `data-step="say|show|tap|try"`
  - `data-part="word-work"` → `data-item="tap|find|build"` and `data-answer` = the word text for `find`, the graphemes joined by `,` for `build`, the number of parts for `tap`
  - `data-part="spelling"` → `data-item="sound|word|sentence"` and `data-answer` = card id for `sound`, graphemes joined by `,` for `word`, tokens joined by `|` for `sentence`
  - `data-part="story-question"` → `data-answer="<correct choice text>"`
- These are plain attributes; nothing reads them inside the app.

- [ ] **Step 1: Write the failing test**

`tests/ui/hints.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SoundCardsPart } from '../../src/ui/session/SoundCardsPart';
import { WordWorkPart } from '../../src/ui/session/WordWorkPart';
import { SpellingPart } from '../../src/ui/session/SpellingPart';
import { StoryPart } from '../../src/ui/session/StoryPart';
import { LessonPart } from '../../src/ui/session/LessonPart';
import { CONTENT } from '../../src/content';
import { cvc } from '../../src/content/build';
import { renderWithServices } from './helpers';

describe('data hints for browser tests', () => {
  it('reverse drill exposes the target', async () => {
    renderWithServices(<SoundCardsPart forwardCards={[]} reverseItems={[{ target: 'm', choices: ['m', 'a', 'p'], isReview: false }]} onComplete={vi.fn()} />);
    const el = await screen.findByTestId('part');
    expect(el).toHaveAttribute('data-part', 'sound-reverse');
    expect(el).toHaveAttribute('data-answer', 'm');
  });

  it('word work exposes item type and answer', async () => {
    const user = userEvent.setup();
    renderWithServices(<WordWorkPart items={[{ type: 'find', word: cvc('sat'), substep: '1.1', isReview: false, choices: ['sad', 'sat', 'sap'] }, { type: 'build', word: cvc('log'), substep: '1.1', isReview: false }]} onComplete={vi.fn()} />);
    let el = await screen.findByTestId('part');
    expect(el).toHaveAttribute('data-item', 'find');
    expect(el).toHaveAttribute('data-answer', 'sat');
    await user.click(screen.getByRole('button', { name: 'sat' }));
    el = await screen.findByTestId('part');
    expect(el).toHaveAttribute('data-item', 'build');
    expect(el).toHaveAttribute('data-answer', 'l,o,g');
  });

  it('spelling exposes item type and answer', async () => {
    renderWithServices(<SpellingPart items={[{ type: 'sentence', text: 'The rat sat.', substep: '1.1', words: ['sat.', 'The', 'rat'] }]} onComplete={vi.fn()} />);
    const el = await screen.findByTestId('part');
    expect(el).toHaveAttribute('data-item', 'sentence');
    expect(el).toHaveAttribute('data-answer', 'The|rat|sat.');
  });

  it('story questions expose the correct choice', async () => {
    const user = userEvent.setup();
    const story = CONTENT.substeps[0].stories[0];
    renderWithServices(<StoryPart story={story} substep="1.1" onComplete={vi.fn()} />);
    await user.click(await screen.findByRole('button', { name: /start/i }));
    for (let k = 0; k < story.sentences.length; k++) await user.click(screen.getByRole('button', { name: /^next$/i }));
    const el = await screen.findByTestId('part');
    expect(el).toHaveAttribute('data-part', 'story-question');
    expect(el).toHaveAttribute('data-answer', story.questions[0].choices[story.questions[0].answer]);
  });

  it('lesson exposes the step type', async () => {
    renderWithServices(<LessonPart steps={[{ show: ['m'] }]} substep={CONTENT.substeps[0]} onComplete={vi.fn()} />);
    expect(await screen.findByTestId('part')).toHaveAttribute('data-step', 'show');
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run tests/ui/hints.test.tsx`
Expected: FAIL (no element with test id `part`).

- [ ] **Step 3: Add the attributes**

In each part, the outer `<div className="stage" data-part="...">` gains `data-testid="part"` and the hints:

- `SoundCardsPart.tsx`: forward stage: `data-testid="part"`. Reverse stage: `data-testid="part" data-answer={item.target}`.
- `LessonPart.tsx`: `data-testid="part" data-step={'say' in step ? 'say' : 'show' in step ? 'show' : 'tap' in step ? 'tap' : 'try'}`.
- `WordWorkPart.tsx`: `data-testid="part" data-item={item.type} data-answer={item.type === 'find' ? item.word.text : item.type === 'build' ? item.word.parts.map((p) => p.grapheme).join(',') : String(item.word.parts.length)}`.
- `SpellingPart.tsx`: `data-testid="part" data-item={item.type} data-answer={item.type === 'sound' ? item.card : item.type === 'word' ? item.word.parts.map((p) => p.grapheme).join(',') : item.text.split(/\s+/).join('|')}`.
- `StoryPart.tsx`: title, reading, and question stages all get `data-testid="part"`; the question stage adds `data-answer={q.choices[q.answer]}`.
- `ReadAloudPart.tsx`: both stages get `data-testid="part"` (no answer needed).

Do not add `data-testid` to `MissReview` (its stage is not a part).

- [ ] **Step 4: Run all tests, type check, commit**

Run: `npm test && npm run typecheck`
Expected: PASS (the existing tests are unaffected; `getByTestId('tray')` and `'answer'` remain unique).

```bash
git add -A
git commit -m "Add data hints to the session screens so browser tests can answer correctly

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Installable, offline-capable build

**Files:**
- Modify: `vite.config.ts`, `index.html`, `package.json`
- Create: `public/icon.svg`, `scripts/make-icons.mjs`, `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/maskable-512.png`, `public/icons/apple-touch-icon.png`
- Test: `tests/build/pwa.test.ts` (reads the built `dist/`)

**Interfaces:**
- Produces: `dist/manifest.webmanifest`, `dist/sw.js` precaching every built asset including the woff2 fonts; `npm run icons` regenerates the PNGs.

- [ ] **Step 1: Install dependencies and add scripts**

Run: `npm install -D vite-plugin-pwa@^0.20.5 @playwright/test@1.63.0`

`package.json` scripts become:
```json
"dev": "vite --host",
"build": "tsc --noEmit && vite build",
"preview": "vite preview --host",
"test": "vitest run",
"test:watch": "vitest",
"typecheck": "tsc --noEmit",
"e2e": "playwright test",
"icons": "node scripts/make-icons.mjs"
```

- [ ] **Step 2: Write the icon source and generator**

`public/icon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#f6f1e7"/>
  <rect x="96" y="96" width="320" height="320" rx="48" fill="#ffffff" stroke="#d8d1c3" stroke-width="12"/>
  <text x="256" y="336" text-anchor="middle" font-family="Lexend, Arial, sans-serif" font-size="220" font-weight="600" fill="#2f6f5e">t</text>
  <circle cx="176" cy="440" r="14" fill="#2f6f5e"/>
  <circle cx="256" cy="440" r="14" fill="#2f6f5e"/>
  <circle cx="336" cy="440" r="14" fill="#2f6f5e"/>
</svg>
```

`scripts/make-icons.mjs`:
```js
import { chromium } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const svg = readFileSync(resolve('public/icon.svg'), 'utf8');
const out = resolve('public/icons');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });

async function render(size, file, padding = 0) {
  await page.setViewportSize({ width: size, height: size });
  const inner = size - padding * 2;
  await page.setContent(`<body style="margin:0;background:#f6f1e7"><div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center"><div style="width:${inner}px;height:${inner}px">${svg}</div></div></body>`);
  await page.screenshot({ path: `${out}/${file}`, clip: { x: 0, y: 0, width: size, height: size } });
  console.log('wrote', file);
}

await render(192, 'icon-192.png');
await render(512, 'icon-512.png');
await render(512, 'maskable-512.png', 64);
await render(180, 'apple-touch-icon.png');
await browser.close();
```

Run: `npm run icons`
Expected: four PNG files written under `public/icons/`.

- [ ] **Step 3: Configure the PWA plugin and base path**

`vite.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Tapwords',
        short_name: 'Tapwords',
        description: 'A calm, self-guided reading program.',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'landscape',
        background_color: '#f6f1e7',
        theme_color: '#f6f1e7',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,webmanifest}'],
        navigateFallback: `${base}index.html`,
      },
    }),
  ],
  test: {
    environment: 'node',
    setupFiles: ['tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
```

`index.html` head becomes:
```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="theme-color" content="#f6f1e7" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Tapwords" />
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png" />
<link rel="icon" href="icon.svg" type="image/svg+xml" />
<title>Tapwords</title>
```
(Keep the existing viewport line's content if Task C5 of the earlier plan changed it; the important part is no `maximum-scale`.)

- [ ] **Step 4: Write the failing build test**

`tests/build/pwa.test.ts`:
```ts
import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

describe('production build is installable and offline-capable', () => {
  beforeAll(() => {
    execSync('npx vite build', { stdio: 'pipe' });
  }, 120000);

  it('emits a manifest with icons and standalone display', () => {
    const m = JSON.parse(readFileSync('dist/manifest.webmanifest', 'utf8'));
    expect(m.name).toBe('Tapwords');
    expect(m.display).toBe('standalone');
    expect(m.icons.length).toBeGreaterThanOrEqual(3);
    for (const i of m.icons) expect(existsSync(`dist/${i.src}`), i.src).toBe(true);
  });

  it('emits a service worker that precaches fonts and the page', () => {
    expect(existsSync('dist/sw.js')).toBe(true);
    const sw = readFileSync('dist/sw.js', 'utf8');
    expect(sw).toMatch(/\.woff2/);
    expect(sw).toMatch(/index\.html/);
    expect(readdirSync('dist/assets').some((f) => f.endsWith('.woff2'))).toBe(true);
  });

  it('links the manifest and iOS meta from index.html', () => {
    const html = readFileSync('dist/index.html', 'utf8');
    expect(html).toContain('manifest.webmanifest');
    expect(html).toContain('apple-mobile-web-app-capable');
    expect(html).not.toContain('maximum-scale');
  });
});
```

- [ ] **Step 5: Run it, then the whole suite, then commit**

Run: `npx vitest run tests/build/pwa.test.ts` then `npm test && npm run typecheck && npm run build`
Expected: PASS. If the woff2 check fails, confirm `@fontsource/lexend` css is imported in `src/main.tsx` (it is) so the font files are emitted under `dist/assets`.

```bash
git add -A
git commit -m "Make the app installable and usable offline: manifest, icons and a precaching service worker

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Playwright setup, helpers, and the full-session browser test

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/helpers.ts`, `tests/e2e/session.spec.ts`
- Modify: `.gitignore` (add `playwright-report`, `test-results`)

**Interfaces:**
- Produces:
```ts
export async function addChild(page: Page, name: string, substep = '1.1'): Promise<void>;
export async function startSession(page: Page, name: string): Promise<void>;
export async function openGrownUps(page: Page): Promise<void>;   // holds the button 1.8s
/** Plays the current session to the end screen, answering everything correctly. adult=false declines the read-aloud. */
export async function autoPlay(page: Page, opts?: { adult?: boolean; stopAfterParts?: number }): Promise<{ partsSeen: string[] }>;
```

- [ ] **Step 1: Write the config**

`playwright.config.ts`:
```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'tablet',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 }, hasTouch: true, isMobile: false },
    },
  ],
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
```

Add to `.gitignore`: `playwright-report` and `test-results`. Note: `npm run e2e` expects a fresh `dist/`; the README and CI run `npm run build` first. Add `"e2e": "npm run build && playwright test"` instead of the bare command so it is always fresh.

- [ ] **Step 2: Write the helpers**

`tests/e2e/helpers.ts`:
```ts
import { expect, type Page } from '@playwright/test';

export async function addChild(page: Page, name: string, substep = '1.1') {
  await page.goto('/');
  await page.getByRole('button', { name: /add a child/i }).click();
  await page.getByLabel(/name/i).fill(name);
  await page.getByLabel(/start/i).selectOption(substep);
  await page.getByRole('button', { name: /^save$/i }).click();
  await expect(page.getByRole('button', { name: new RegExp(`^${name}$`) })).toBeVisible();
}

export async function startSession(page: Page, name: string) {
  await page.getByRole('button', { name: new RegExp(`^${name}$`) }).click();
  await expect(page.getByRole('button', { name: /stop for now/i })).toBeVisible();
}

export async function openGrownUps(page: Page) {
  const btn = page.getByRole('button', { name: /grown-ups/i }).first();
  const box = await btn.boundingBox();
  if (!box) throw new Error('hold button not visible');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(1800);
  await page.mouse.up();
  await expect(page.getByText(/grown-up area/i)).toBeVisible();
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pieceName = (g: string) => new RegExp(`^${escape(g)}( \\d+)?$`);

async function buildFrom(page: Page, pieces: string[]) {
  const tray = page.getByTestId('tray');
  for (const g of pieces) {
    const candidates = tray.getByRole('button', { name: pieceName(g) });
    const n = await candidates.count();
    let clicked = false;
    for (let i = 0; i < n; i++) {
      const c = candidates.nth(i);
      if (!((await c.getAttribute('class')) ?? '').includes('tile-dim')) {
        await c.click();
        clicked = true;
        break;
      }
    }
    if (!clicked) throw new Error(`no free piece for ${g}`);
  }
  await page.getByRole('button', { name: /^done$/i }).click();
}

async function tapOut(page: Page, n: number) {
  for (let k = 1; k <= n; k++) await page.getByRole('button', { name: `Sound ${k}` }).click();
  await page.getByRole('button', { name: 'Blend' }).click();
}

export async function autoPlay(page: Page, opts: { adult?: boolean; stopAfterParts?: number } = {}) {
  const adult = opts.adult ?? true;
  const partsSeen: string[] = [];
  for (let guard = 0; guard < 400; guard++) {
    if (await page.getByText(/nice work today/i).isVisible().catch(() => false)) return { partsSeen };
    const part = page.getByTestId('part').first();
    await part.waitFor({ state: 'visible', timeout: 15_000 });
    const kind = (await part.getAttribute('data-part')) ?? '';
    if (partsSeen[partsSeen.length - 1] !== kind) partsSeen.push(kind);
    if (opts.stopAfterParts && new Set(partsSeen).size > opts.stopAfterParts) {
      await page.getByRole('button', { name: /stop for now/i }).click();
      await expect(page.getByText(/nice work today/i)).toBeVisible();
      return { partsSeen };
    }
    const answer = (await part.getAttribute('data-answer')) ?? '';
    switch (kind) {
      case 'sound-forward':
        await page.getByRole('button', { name: /that's it/i }).click();
        break;
      case 'sound-reverse':
        await part.getByRole('button', { name: new RegExp(`^${escape(answer)}$`) }).click();
        break;
      case 'lesson': {
        const step = await part.getAttribute('data-step');
        if (step === 'try') await tapOut(page, await part.getByRole('button', { name: /^Sound \d+$/ }).count());
        else await page.getByRole('button', { name: /^next$/i }).click();
        break;
      }
      case 'word-work': {
        const item = await part.getAttribute('data-item');
        if (item === 'tap') await tapOut(page, Number(answer));
        else if (item === 'find') await part.getByRole('button', { name: new RegExp(`^${escape(answer)}$`) }).click();
        else await buildFrom(page, answer.split(','));
        break;
      }
      case 'spelling': {
        const item = await part.getAttribute('data-item');
        if (item === 'sound') await part.getByRole('button', { name: new RegExp(`^${escape(answer)}$`) }).click();
        else if (item === 'word') await buildFrom(page, answer.split(','));
        else await buildFrom(page, answer.split('|'));
        break;
      }
      case 'read-aloud-ask':
        await page.getByRole('button', { name: adult ? /^yes$/i : /not right now/i }).click();
        break;
      case 'read-aloud':
        await page.getByRole('button', { name: /got it/i }).click();
        break;
      case 'story-title':
        await page.getByRole('button', { name: /^start$/i }).click();
        break;
      case 'story':
        await page.getByRole('button', { name: /^next$/i }).click();
        break;
      case 'story-question':
        await part.getByRole('button', { name: new RegExp(`^${escape(answer)}$`) }).click();
        break;
      default:
        throw new Error(`unknown part ${kind}`);
    }
  }
  throw new Error('autoPlay did not reach the end screen');
}
```

Note on `sound-reverse`: choices are Tile buttons whose accessible name is the grapheme; for 1.1 the grapheme equals the card id, so `data-answer` (a card id) matches. When plan 2 adds cards whose grapheme differs from the id, change the hint to the grapheme.

- [ ] **Step 3: Write the full-session spec**

`tests/e2e/session.spec.ts`:
```ts
import { test, expect } from '@playwright/test';
import { addChild, autoPlay, openGrownUps, startSession } from './helpers';

test('a child can be added and a whole session played with a grown-up', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await addChild(page, 'Sam');
  await startSession(page, 'Sam');
  const { partsSeen } = await autoPlay(page, { adult: true });
  expect(partsSeen).toEqual(['sound-forward', 'sound-reverse', 'lesson', 'word-work', 'spelling', 'read-aloud-ask', 'read-aloud', 'story-title', 'story', 'story-question']);
  await expect(page.getByText(/today: sound cards/i)).toBeVisible();
  await expect(page.getByText(/reading out loud/i)).toBeVisible();
  await page.getByRole('button', { name: /^done$/i }).click();

  await openGrownUps(page);
  await expect(page.getByText(/sessions in the last 14 days/i)).toBeVisible();
  await expect(page.locator('.stats')).toContainText('1');
  await expect(page.locator('.stats')).not.toContainText('never');
  expect(errors).toEqual([]);
});
```

- [ ] **Step 4: Run it**

Run: `npm run e2e`
Expected: 1 passed. If `openGrownUps` fails on the hold, raise the wait to 2000ms (the button fires at 1500ms). If the reverse-drill click fails because several tiles share a name, the answer hint should be unique among the three choices by construction.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add real-browser tests at tablet size with a helper that plays a whole session

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Browser tests for the skipped read-aloud, the parent move, and stopping early

**Files:**
- Create: `tests/e2e/flow.spec.ts`

- [ ] **Step 1: Write the spec**

`tests/e2e/flow.spec.ts`:
```ts
import { test, expect } from '@playwright/test';
import { addChild, autoPlay, openGrownUps, startSession } from './helpers';

test('when no grown-up is around, the read-aloud is offered first next time', async ({ page }) => {
  await addChild(page, 'Kim');
  await startSession(page, 'Kim');
  const first = await autoPlay(page, { adult: false });
  expect(first.partsSeen).not.toContain('read-aloud');
  await expect(page.getByText(/reading out loud/i)).not.toBeVisible();
  await page.getByRole('button', { name: /^done$/i }).click();

  await startSession(page, 'Kim');
  await expect(page.getByTestId('part')).toHaveAttribute('data-part', 'read-aloud-ask');
  const second = await autoPlay(page, { adult: true });
  expect(second.partsSeen[0]).toBe('read-aloud-ask');
  expect(second.partsSeen[1]).toBe('read-aloud');
  expect(second.partsSeen).toContain('lesson');
});

test('a parent can move the child, and the next session opens with the full lesson', async ({ page }) => {
  await addChild(page, 'Lee');
  await startSession(page, 'Lee');
  const first = await autoPlay(page, { adult: false });
  expect(first.partsSeen).toContain('lesson');
  await page.getByRole('button', { name: /^done$/i }).click();

  // second session: lesson is the short review (only "try" steps)
  await startSession(page, 'Lee');
  await autoPlay(page, { adult: false, stopAfterParts: 3 });
  await page.getByRole('button', { name: /^done$/i }).click();

  await openGrownUps(page);
  await page.getByLabel(/move to/i).selectOption('1.1');
  await page.getByRole('button', { name: /^move$/i }).click();
  await expect(page.getByText(/moved to 1\.1/i)).toBeVisible();
  await page.getByRole('button', { name: /back/i }).click();

  await startSession(page, 'Lee');
  // skip the sound cards, then the lesson must start with a spoken "say" step (full lesson)
  for (;;) {
    const part = page.getByTestId('part').first();
    await part.waitFor();
    const kind = await part.getAttribute('data-part');
    if (kind === 'lesson') break;
    if (kind === 'sound-forward') await page.getByRole('button', { name: /that's it/i }).click();
    else if (kind === 'sound-reverse') {
      const a = (await part.getAttribute('data-answer')) ?? '';
      await part.getByRole('button', { name: new RegExp(`^${a}$`) }).click();
    } else if (kind === 'read-aloud-ask') await page.getByRole('button', { name: /not right now/i }).click();
    else throw new Error(`unexpected part ${kind}`);
  }
  await expect(page.getByTestId('part')).toHaveAttribute('data-step', 'say');
});

test('stopping early keeps the child and the session', async ({ page }) => {
  await addChild(page, 'Ana');
  await startSession(page, 'Ana');
  await page.getByRole('button', { name: /that's it/i }).click();
  await page.getByRole('button', { name: /stop for now/i }).click();
  await expect(page.getByText(/you stopped early/i)).toBeVisible();
  await page.getByRole('button', { name: /^done$/i }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: /^Ana$/ })).toBeVisible();
  await openGrownUps(page);
  await expect(page.locator('.stats')).toContainText('1');
});
```

- [ ] **Step 2: Run, then commit**

Run: `npm run e2e`
Expected: 4 passed. Note: in the second test, after a session where the lesson mode was "review", moving to 1.1 sets `lessonPending`, so the third session's lesson starts with a `say` step; the first session's lesson also starts with `say` but that session's log is what makes the second session a review, which is what the `stopAfterParts: 3` run exercises.

```bash
git add -A
git commit -m "Add browser tests for the skipped read-aloud, the parent move and stopping early

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Browser test for offline use and installability signals

**Files:**
- Create: `tests/e2e/offline.spec.ts`

- [ ] **Step 1: Write the spec**

`tests/e2e/offline.spec.ts`:
```ts
import { test, expect } from '@playwright/test';
import { addChild } from './helpers';

test('the app links a manifest and registers a service worker', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', /manifest\.webmanifest/);
  const ready = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return Boolean(reg.active);
  });
  expect(ready).toBe(true);
  const manifest = await page.evaluate(async () => (await fetch('manifest.webmanifest')).json());
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
});

test('after the first load, the app still opens and keeps its data while offline', async ({ page, context }) => {
  await addChild(page, 'Ola');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    // give the precache a moment to finish
    await new Promise((r) => setTimeout(r, 1500));
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Tapwords' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Ola$/ })).toBeVisible();
  await page.getByRole('button', { name: /^Ola$/ }).click();
  await expect(page.getByRole('button', { name: /that's it/i })).toBeVisible();
  await context.setOffline(false);
});
```

- [ ] **Step 2: Run, then commit**

Run: `npm run e2e`
Expected: 6 passed. If the offline reload shows a browser error page, the precache did not finish before going offline: raise the wait, or wait until `caches.keys()` returns a workbox precache and the cache holds `index.html`.

```bash
git add -A
git commit -m "Add browser tests proving the app installs a service worker and works offline

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Publishing workflow and parent-facing instructions

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`

- [ ] **Step 1: Write the workflow**

`.github/workflows/deploy.yml`:
```yaml
name: Publish to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
      - run: BASE_PATH="/${GITHUB_REPOSITORY#*/}/" npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Extend the README**

Replace the "Run it" section and add two sections so the README reads:

```markdown
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

1. Open the app in Safari on the iPad.
2. Tap the Share button, then **Add to Home Screen**, then **Add**.
3. Open it from the home screen from now on. It works without internet after the first open.

Progress lives on that iPad. Each child's profile and history are saved there.

## Publish it so other families can use it

The repository includes a GitHub Pages workflow. To publish:

1. Create a GitHub repository and push this project to its `main` branch.
2. In the repository settings, under Pages, set the source to **GitHub Actions**.
3. Every push to `main` builds, runs the tests, and publishes. The address is `https://<your-username>.github.io/<repository-name>/`.

Send families that address; they follow the home-screen steps above.

## Check it

    npm test          # engine, content checker, screens, build output
    npm run typecheck
    npm run e2e       # real browser at tablet size: full session, offline reload

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
```

- [ ] **Step 3: Verify the sub-path build works**

Run: `BASE_PATH=/tapwords/ npm run build && grep -c '/tapwords/assets' dist/index.html && grep -o '"start_url":"[^"]*"' dist/manifest.webmanifest && npm run build`
Expected: the first grep prints a count of at least 1, the manifest's start_url is `/tapwords/`, and the final default build restores `dist/` to the root-path version.

- [ ] **Step 4: Run everything and commit**

Run: `npm test && npm run typecheck && npm run e2e`
Expected: all pass.

```bash
git add -A
git commit -m "Add the publishing workflow and parent-facing setup instructions

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Plan self-review notes

**Spec coverage:** installable and offline after first load (Task 2, proven by Task 5); browser tests for the spec's listed flows except backup/restore, which does not exist until plan 2 (Tasks 3 to 5); static-site deployment prepared without publishing (Task 6); real-device checklist in the README (Task 6). The `?seed` idea was rejected in favour of `data-*` hints so tests never depend on randomness (Task 1).

**Not in this plan:** the actual GitHub repository and first publish (needs the user's account and approval), a real-iPad check (needs a device), and the backup/restore browser test (plan 2).
