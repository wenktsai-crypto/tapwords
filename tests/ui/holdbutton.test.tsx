// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import { HoldButton } from '../../src/ui/components/HoldButton';

describe('HoldButton', () => {
  it('does not fire onHold if the button unmounts mid-hold', () => {
    const onHold = vi.fn();
    const { getByRole, unmount } = render(<HoldButton onHold={onHold}>Grown-ups (hold)</HoldButton>);
    const btn = getByRole('button', { name: /grown-ups/i });
    vi.useFakeTimers();
    try {
      fireEvent.pointerDown(btn);
      unmount();
      act(() => { vi.advanceTimersByTime(2000); });
      expect(onHold).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
