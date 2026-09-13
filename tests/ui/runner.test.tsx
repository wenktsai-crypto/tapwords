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

describe('SessionRunner', () => {
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
    const buildFrom = async (pieces: string[]) => {
      const tray = await screen.findByTestId('tray');
      for (const g of pieces) {
        const buttons = within(tray).getAllByRole('button', { name: g }).filter((b) => !b.className.includes('tile-dim'));
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
