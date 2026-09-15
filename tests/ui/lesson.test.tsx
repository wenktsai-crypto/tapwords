// @vitest-environment jsdom
import { StrictMode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LessonPart } from '../../src/ui/session/LessonPart';
import { CONTENT } from '../../src/content';
import { FakeAudio } from '../../src/audio/fake';
import { renderWithServices } from './helpers';

describe('LessonPart', () => {
  it('runs say, show, tap and try steps then completes', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const audio = new FakeAudio();
    const steps = [{ say: 'Hello there.' }, { show: ['m', 'a', 'p'] }, { tap: 'map' }, { try: 'sit' }];
    renderWithServices(<LessonPart steps={steps} substep={CONTENT.substeps[0]} onComplete={onComplete} />, { audio });

    await waitFor(() => expect(audio.spoken).toContain('Hello there.'));
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('m')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /next/i }));
    // tap demo runs by itself, then Next appears
    await user.click(await screen.findByRole('button', { name: /next/i }));
    expect(audio.played).toEqual(['m', 'a', 'p']);
    await user.click(await screen.findByRole('button', { name: 'Sound 1' }));
    await user.click(screen.getByRole('button', { name: 'Sound 2' }));
    await user.click(screen.getByRole('button', { name: 'Sound 3' }));
    await user.click(await screen.findByRole('button', { name: 'Blend' }));
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
  });

  it('shows a silent-e card in vowel colour, not consonant colour', async () => {
    // Vowel colour is a taught cue (see the comment at styles.css `.tile-vce`), and the lesson
    // that introduces "a_e" is the first time the child ever sees it. A `show` step names the
    // card by its drill face, so this is the render that a grapheme-only lookup got wrong.
    const substep = CONTENT.substeps.find((s) => s.id === '4.1')!;
    const { container } = renderWithServices(
      <LessonPart steps={[{ show: ['a_e'] }]} substep={substep} onComplete={() => {}} />,
    );
    const tile = container.querySelector('.tile')!;
    expect(tile.textContent).toBe('a_e');
    expect(tile.className).toContain('tile-vce');
    expect(tile.className).not.toContain('tile-consonant');
  });

  it('completes immediately with no steps', async () => {
    const onComplete = vi.fn();
    renderWithServices(<LessonPart steps={[]} substep={CONTENT.substeps[0]} onComplete={onComplete} />);
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
  });

  it('calls onComplete exactly once under StrictMode with no steps', async () => {
    const onComplete = vi.fn();
    renderWithServices(
      <StrictMode>
        <LessonPart steps={[]} substep={CONTENT.substeps[0]} onComplete={onComplete} />
      </StrictMode>,
    );
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('speaks a say step exactly once under StrictMode', async () => {
    const audio = new FakeAudio();
    const onComplete = vi.fn();
    renderWithServices(
      <StrictMode>
        <LessonPart steps={[{ say: 'Hi' }]} substep={CONTENT.substeps[0]} onComplete={onComplete} />
      </StrictMode>,
      { audio },
    );
    await waitFor(() => expect(audio.spoken).toContain('Hi'));
    expect(audio.spoken.filter((s) => s === 'Hi')).toHaveLength(1);
  });

  it('replays tapping for a second try step with the same word', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const steps = [{ try: 'map' }, { try: 'map' }];
    renderWithServices(<LessonPart steps={steps} substep={CONTENT.substeps[0]} onComplete={onComplete} />);

    await user.click(await screen.findByRole('button', { name: 'Sound 1' }));
    await user.click(screen.getByRole('button', { name: 'Sound 2' }));
    await user.click(screen.getByRole('button', { name: 'Sound 3' }));
    await user.click(await screen.findByRole('button', { name: 'Blend' }));

    const sound1Again = await screen.findByRole('button', { name: 'Sound 1' });
    expect(sound1Again).toBeInTheDocument();
    await user.click(sound1Again);
    await user.click(screen.getByRole('button', { name: 'Sound 2' }));
    await user.click(screen.getByRole('button', { name: 'Sound 3' }));
    const blendAgain = await screen.findByRole('button', { name: 'Blend' });
    expect(blendAgain).toBeInTheDocument();
    await user.click(blendAgain);

    await waitFor(() => expect(onComplete).toHaveBeenCalled());
  });
  it('shrinks the tiles when a show step has more than four of them', async () => {
    const onComplete = vi.fn();
    const { unmount } = renderWithServices(
      <LessonPart steps={[{ show: ['b', 'a', 's', 'k', 'e', 't'] }]} substep={CONTENT.substeps[0]} onComplete={onComplete} />,
    );
    const six = screen.getAllByText(/^[baskept]$/).filter((el) => el.classList.contains('tile'));
    expect(six).toHaveLength(6);
    for (const tile of six) expect(tile.classList.contains('tile-normal')).toBe(true);
    unmount();

    renderWithServices(
      <LessonPart steps={[{ show: ['m', 'a', 'p'] }]} substep={CONTENT.substeps[0]} onComplete={onComplete} />,
    );
    const three = screen.getAllByText(/^[map]$/).filter((el) => el.classList.contains('tile'));
    expect(three).toHaveLength(3);
    for (const tile of three) expect(tile.classList.contains('tile-large')).toBe(true);
  });
});
