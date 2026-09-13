import { useEffect } from 'react';
import type { SessionPlan } from '../../engine/session';
import type { FinishResult } from '../../engine/progression';
import { useServices } from '../services';
import { useSay } from '../speech';
import { BigButton } from '../components/BigButton';
import { Path } from '../components/Path';

interface Props {
  plan: SessionPlan;
  result: FinishResult;
  /** Plain-English labels for the parts actually completed this session, in order (e.g. ["sound
   * cards", "word work", "a story"]) — computed by the caller from what really happened, not
   * from the plan, so a session stopped early or a declined read-aloud is not misreported. */
  practiced: string[];
  onDone: () => void;
}

/** Joins plain-English items into "a, b, and c." style prose. */
function formatList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

export function SessionEnd({ plan, result, practiced, onDone }: Props) {
  const { content } = useServices();
  const say = useSay();
  useEffect(() => {
    let cancelled = false;
    // Deferred to the next microtask so that under StrictMode's dev-mode
    // mount/cleanup/remount, the throwaway first pass's cleanup can mark
    // itself cancelled before it actually speaks anything.
    Promise.resolve()
      .then(() => {
        if (cancelled) return;
        const to = result.advancedTo ? content.substeps.find((s) => s.id === result.advancedTo) : null;
        const extra = to ? ` You have finished ${plan.substepTitle}. Next time we start ${to.title}.` : '';
        return say(`Nice work today.${extra}`);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [say, result.advancedTo, plan.substepTitle, content.substeps]);

  return (
    <div className="screen" data-part="end">
      <div className="stage">
        <h2>Nice work today.</h2>
        <p className="caption">{practiced.length ? `Today: ${formatList(practiced)}.` : "You stopped early. That's okay."}</p>
        <Path current={result.state.currentSubstep} />
        <BigButton onClick={onDone}>Done</BigButton>
      </div>
    </div>
  );
}
