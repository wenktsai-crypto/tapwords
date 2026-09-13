// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionRunner } from '../../src/ui/session/SessionRunner';
import { CONTENT } from '../../src/content';
import { MemoryStore } from '../../src/store/memory';
import { buildSession } from '../../src/engine/session';
import { initialState, type SessionLog } from '../../src/engine/types';
import { seeded } from '../../src/engine/rng';
import { getCard } from '../../src/engine/availability';
import type { Profile } from '../../src/store/types';
import { renderWithServices } from './helpers';

const profile = (): Profile => ({ id: 'p1', name: 'Sam', color: 'sky', createdAt: 'd', state: initialState('1.1') });

/** A store whose first `appendLog` call fails, then succeeds — for exercising the runner's
 * "Try again" retry path without a real network/storage failure. */
class FlakyStore extends MemoryStore {
  private failedOnce = false;
  async appendLog(profileId: string, log: SessionLog) {
    if (!this.failedOnce) {
      this.failedOnce = true;
      throw new Error('append failed');
    }
    return super.appendLog(profileId, log);
  }
}

/** A store whose `appendLog` never settles — for exercising the runner's save timeout. */
class StuckStore extends MemoryStore {
  async appendLog(_profileId: string, _log: SessionLog): Promise<void> {
    return new Promise<void>(() => {});
  }
}

/** A store whose first `appendLog` takes far longer than the runner will wait, but does write
 * in the end — the case where a save "fails" from the screen's point of view yet really landed. */
class SlowAppendStore extends MemoryStore {
  private slowed = false;
  async appendLog(profileId: string, log: SessionLog) {
    if (!this.slowed) {
      this.slowed = true;
      await new Promise((r) => setTimeout(r, 200));
    }
    return super.appendLog(profileId, log);
  }
}

describe('SessionRunner', () => {
  it('keeps the responses from the part in progress when the child stops early', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    const p = profile();
    await store.saveProfile(p);
    const plan = buildSession(CONTENT, p.state, seeded(1));
    renderWithServices(<SessionRunner profile={p} onExit={vi.fn()} />, { store, rng: seeded(1) });

    const click = async (name: string | RegExp) => user.click(await screen.findByRole('button', { name }));
    for (let k = 0; k < plan.forwardCards.length; k++) await click(/that's it/i);
    await click(getCard(CONTENT, plan.reverseItems[0].target).grapheme);
    await click(/stop for now/i);

    expect(await screen.findByText(/nice work today/i)).toBeInTheDocument();
    const logs = await store.listLogs('p1');
    expect(logs.length).toBe(1);
    expect(logs[0].complete).toBe(false);
    expect(logs[0].responses.filter((r) => r.activity === 'sound-reverse')).toHaveLength(1);
    expect(logs[0].responses[0]).toMatchObject({ activity: 'sound-reverse', correct: true });
  });

  it('does not save the session twice when a timed-out save actually landed', async () => {
    const user = userEvent.setup();
    const store = new SlowAppendStore();
    const p = profile();
    await store.saveProfile(p);
    renderWithServices(<SessionRunner profile={p} onExit={vi.fn()} saveTimeoutMs={20} />, { store });

    await user.click(await screen.findByRole('button', { name: /stop for now/i }));
    // The screen gives up after 20ms; the write itself lands at about 200ms.
    const tryAgain = await screen.findByRole('button', { name: /try again/i });
    await waitFor(async () => expect((await store.listLogs('p1')).length).toBe(1), { timeout: 2000 });
    await user.click(tryAgain);

    expect(await screen.findByText(/nice work today/i)).toBeInTheDocument();
    expect((await store.listLogs('p1')).length).toBe(1);
    expect((await store.listProfiles())[0].state.sessionsCompleted).toBe(1);
  });

  it('shows the retry screen when a save hangs past the timeout', async () => {
    const user = userEvent.setup();
    const store = new StuckStore();
    const p = profile();
    await store.saveProfile(p);
    renderWithServices(<SessionRunner profile={p} onExit={vi.fn()} saveTimeoutMs={20} />, { store });

    await user.click(await screen.findByRole('button', { name: /stop for now/i }));
    expect(await screen.findByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByText(/couldn't save that/i)).toBeInTheDocument();
  });

  it('saves a partial session when the child stops early', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    const p = profile();
    await store.saveProfile(p);
    const onExit = vi.fn();
    renderWithServices(<SessionRunner profile={p} onExit={onExit} />, { store });
    await user.click(await screen.findByRole('button', { name: /stop for now/i }));
    expect(await screen.findByText(/nice work today/i)).toBeInTheDocument();
    expect(screen.getByText(/you stopped early/i)).toBeInTheDocument();
    expect(screen.queryByText(/sound cards/i)).not.toBeInTheDocument();
    const saved = (await store.listProfiles())[0];
    expect(saved.state.sessionsCompleted).toBe(1);
    expect(saved.state.lessonPending).toBe(false);
    const logs = await store.listLogs('p1');
    expect(logs.length).toBe(1);
    expect(logs[0].complete).toBe(false);
    await user.click(screen.getByRole('button', { name: /done/i }));
    expect(onExit).toHaveBeenCalled();
  });

  it('saves exactly one log when "Stop for now" is clicked twice synchronously', async () => {
    const store = new MemoryStore();
    const p = profile();
    await store.saveProfile(p);
    const onExit = vi.fn();
    renderWithServices(<SessionRunner profile={p} onExit={onExit} />, { store });
    const stop = await screen.findByRole('button', { name: /stop for now/i });
    fireEvent.click(stop);
    fireEvent.click(stop);
    await waitFor(async () => expect((await store.listLogs('p1')).length).toBe(1));
    // give any further (incorrect) async finalize a chance to run before asserting
    await new Promise((r) => setTimeout(r, 0));
    expect((await store.listLogs('p1')).length).toBe(1);
  });

  it('plays a whole session and records a complete log', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    const p = profile();
    await store.saveProfile(p);
    const plan = buildSession(CONTENT, p.state, seeded(1));
    const onExit = vi.fn();
    renderWithServices(<SessionRunner profile={p} onExit={onExit} />, { store, rng: seeded(1) });

    const click = async (name: string | RegExp) => user.click(await screen.findByRole('button', { name }));
    const tapOut = async (n: number) => {
      for (let k = 1; k <= n; k++) await click(`Sound ${k}`);
      await click('Blend');
    };
    // Tray pieces are labelled by their text, or "<text> <n>" when the text repeats in the tray.
    const buildFrom = async (pieces: string[]) => {
      const tray = await screen.findByTestId('tray');
      for (const g of pieces) {
        const label = new RegExp(`^${g.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}( \\d+)?$`);
        const buttons = within(tray).getAllByRole('button', { name: label }).filter((b) => !b.className.includes('tile-dim'));
        await user.click(buttons[0]);
      }
      await click(/^done$/i);
    };

    // 1. sound cards
    for (let k = 0; k < plan.forwardCards.length; k++) await click(/that's it/i);
    for (const item of plan.reverseItems) await click(getCard(CONTENT, item.target).grapheme);

    // 2. lesson
    for (const step of plan.lesson) {
      if ('say' in step || 'show' in step || 'tap' in step) await click(/^next$/i);
      else await tapOut(CONTENT.substeps[0].words.find((w) => w.text === step.try)!.parts.length);
    }

    // 3. word work
    for (const item of plan.wordWork) {
      if (item.type === 'tap') await tapOut(item.word.parts.length);
      if (item.type === 'find') await click(item.word.text);
      if (item.type === 'build') await buildFrom(item.word.parts.map((x) => x.grapheme));
    }

    // 4. spelling
    for (const item of plan.spelling) {
      if (item.type === 'sound') await click(getCard(CONTENT, item.card).grapheme);
      if (item.type === 'word') await buildFrom(item.word.parts.map((x) => x.grapheme));
      if (item.type === 'sentence') await buildFrom(item.text.split(/\s+/));
    }

    // 5. read aloud with a grown-up
    await click(/^yes$/i);
    for (let k = 0; k < plan.readAloud.words.length + plan.readAloud.sentences.length; k++) await click(/got it/i);

    // 6. story
    await click(/^start$/i);
    for (let k = 0; k < plan.story.sentences.length; k++) await click(/^next$/i);
    for (const q of plan.story.questions) await click(q.choices[q.answer]);

    expect(await screen.findByText(/nice work today/i)).toBeInTheDocument();
    expect(screen.getByText(/sound cards/i)).toBeInTheDocument();
    expect(screen.getByText(/a story/i)).toBeInTheDocument();
    const saved = (await store.listProfiles())[0];
    expect(saved.state.sessionsCompleted).toBe(1);
    expect(saved.state.pendingReadAloud).toBe(false);
    const logs = await store.listLogs('p1');
    expect(logs[0].complete).toBe(true);
    expect(logs[0].readAloudDone).toBe(true);
    expect(logs[0].responses.every((r) => r.correct)).toBe(true);
    expect(logs[0].responses.filter((r) => r.activity === 'sound-reverse').length).toBe(plan.reverseItems.length);
    await click(/^done$/i);
    expect(onExit).toHaveBeenCalled();
  }, 30000);

  it('shows "Try again" after a failed save and saves exactly one log on retry', async () => {
    const user = userEvent.setup();
    const store = new FlakyStore();
    const p = profile();
    await store.saveProfile(p);
    const onExit = vi.fn();
    renderWithServices(<SessionRunner profile={p} onExit={onExit} />, { store });

    await user.click(await screen.findByRole('button', { name: /stop for now/i }));
    await user.click(await screen.findByRole('button', { name: /try again/i }));

    expect(await screen.findByText(/nice work today/i)).toBeInTheDocument();
    const logs = await store.listLogs('p1');
    expect(logs.length).toBe(1);
  });
});
