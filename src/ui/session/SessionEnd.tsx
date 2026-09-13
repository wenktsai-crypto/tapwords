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
  onDone: () => void;
}

export function SessionEnd({ plan, result, onDone }: Props) {
  const { content } = useServices();
  const say = useSay();
  useEffect(() => {
    let cancelled = false;
    // Deferred to the next microtask so that under StrictMode's dev-mode
    // mount/cleanup/remount, the throwaway first pass's cleanup can mark
    // itself cancelled before it actually speaks anything.
    Promise.resolve().then(() => {
      if (cancelled) return;
      const to = result.advancedTo ? content.substeps.find((s) => s.id === result.advancedTo) : null;
      const extra = to ? ` You have finished ${plan.substepTitle}. Next time we start ${to.title}.` : '';
      say(`Nice work today.${extra}`);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [say, result.advancedTo, plan.substepTitle, content.substeps]);

  return (
    <div className="screen" data-part="end">
      <div className="stage">
        <h2>Nice work today.</h2>
        <p className="caption">Today: sound cards, {plan.lessonMode === 'full' ? 'a new lesson' : 'a quick review'}, word work, spelling, {plan.readAloud.words.length ? 'reading out loud, ' : ''}and a story.</p>
        <Path current={result.state.currentSubstep} />
        <BigButton onClick={onDone}>Done</BigButton>
      </div>
    </div>
  );
}
