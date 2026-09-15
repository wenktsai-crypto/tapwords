// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecordScreen } from '../../src/ui/screens/RecordScreen';
import { MemoryStore } from '../../src/store/memory';
import { FakeAudio, FakeRecorder } from '../../src/audio/fake';
import { renderWithServices } from './helpers';

describe('RecordScreen', () => {
  it('records a clip for a card, saves it, and can play it back', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    const audio = new FakeAudio();
    const recorder = new FakeRecorder();
    renderWithServices(<RecordScreen onBack={() => {}} />, { store, audio, recorder });

    const row = await screen.findByTestId('card-row-sh');
    expect(within(row).getByText(/not recorded/i)).toBeInTheDocument();
    await user.click(within(row).getByRole('button', { name: /record/i }));
    expect(recorder.starts).toBe(1);
    await user.click(within(row).getByRole('button', { name: /stop/i }));
    await waitFor(() => expect(within(row).getByText(/^recorded$/i)).toBeInTheDocument());
    expect(await store.listClipIds()).toEqual(['sh']);

    await user.click(within(row).getByRole('button', { name: /play/i }));
    expect(audio.played).toContain('sh');
  });

  it('explains when recording is not possible on this browser', async () => {
    class NoRecorder extends FakeRecorder { supported() { return false; } }
    renderWithServices(<RecordScreen onBack={() => {}} />, { recorder: new NoRecorder() });
    expect(await screen.findByText(/can't record/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^record/i })).toBeNull();
  });

  it('says so when the microphone cannot be used', async () => {
    const user = userEvent.setup();
    class DeniedRecorder extends FakeRecorder { async start() { throw new Error('denied'); } }
    renderWithServices(<RecordScreen onBack={() => {}} />, { recorder: new DeniedRecorder() });
    const row = await screen.findByTestId('card-row-f');
    await user.click(within(row).getByRole('button', { name: /record/i }));
    expect(await screen.findByText(/couldn't use the microphone/i)).toBeInTheDocument();
  });

  it('goes back', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    renderWithServices(<RecordScreen onBack={onBack} />);
    await user.click(await screen.findByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalled();
  });

  it('offers a recording slot for each sound, and none for the silent e', async () => {
    renderWithServices(<RecordScreen onBack={() => {}} />);
    expect(await screen.findByTestId('card-row-a_e')).toBeInTheDocument();
    expect(screen.queryByTestId('card-row-e_silent')).toBeNull();
    // u_e_oo (the /oo/ in "rule") is never drilled as a card of its own, but the grown-up must
    // still be able to record it — which is why this screen filters on type, not on isDrillable.
    // Without this line, a tidy-up to isDrillable would drop the sound and no test would notice.
    expect(screen.getByTestId('card-row-u_e_oo')).toBeInTheDocument();
  });
});
