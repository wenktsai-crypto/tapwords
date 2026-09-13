// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { StoryPart } from '../../src/ui/session/StoryPart';
import { FakeAudio } from '../../src/audio/fake';
import { renderWithServices } from './helpers';

const story = {
  title: 'Rat on a Log',
  sentences: ['A rat sat on a log.', 'The rat is fat.'],
  questions: [
    { prompt: 'Where did the rat sit?', choices: ['on a log', 'on a mat', 'on a lid'] as [string, string, string], answer: 0 as const },
    { prompt: 'What is the rat like?', choices: ['fat', 'sad', 'mad'] as [string, string, string], answer: 0 as const },
  ],
};

describe('StoryPart', () => {
  it('reads sentence by sentence then asks questions', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const audio = new FakeAudio();
    renderWithServices(<StoryPart story={story} substep="1.1" onComplete={onComplete} />, { audio });
    await user.click(await screen.findByRole('button', { name: /start/i }));
    expect(screen.getByText('A rat sat on a log.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /hear it/i }));
    expect(audio.spoken).toContain('A rat sat on a log.');
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => expect(audio.spoken).toContain('Where did the rat sit?'));
    await user.click(screen.getByRole('button', { name: 'on a mat' }));
    await user.click(await screen.findByRole('button', { name: /next/i }));
    await user.click(await screen.findByRole('button', { name: 'fat' }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toEqual([
      { itemKey: 'story:1.1:Rat on a Log:0', activity: 'story-question', correct: false, isReview: false, parentMarked: false },
      { itemKey: 'story:1.1:Rat on a Log:1', activity: 'story-question', correct: true, isReview: false, parentMarked: false },
    ]);
  });

  it('calls onComplete exactly once under StrictMode when there are no questions', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const noQuestionStory = { title: 'No Questions', sentences: ['One line.'], questions: [] };
    renderWithServices(
      <StrictMode>
        <StoryPart story={noQuestionStory} substep="1.1" onComplete={onComplete} />
      </StrictMode>,
    );
    await user.click(await screen.findByRole('button', { name: /start/i }));
    await user.click(await screen.findByRole('button', { name: /next/i }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete).toHaveBeenCalledWith([]);
  });
});
