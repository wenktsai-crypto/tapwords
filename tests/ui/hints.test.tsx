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
