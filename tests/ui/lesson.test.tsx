// @vitest-environment jsdom
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

  it('completes immediately with no steps', async () => {
    const onComplete = vi.fn();
    renderWithServices(<LessonPart steps={[]} substep={CONTENT.substeps[0]} onComplete={onComplete} />);
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
  });
});
