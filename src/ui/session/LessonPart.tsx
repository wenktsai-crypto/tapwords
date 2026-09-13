import { useEffect, useRef, useState } from 'react';
import type { LessonStep, Substep } from '../../content/types';
import { findWord } from '../../engine/availability';
import { useServices } from '../services';
import { Caption, useSay } from '../speech';
import { cardTypeFor } from '../tiles';
import { Tile } from '../components/Tile';
import { BigButton } from '../components/BigButton';
import { TapDots } from '../components/TapDots';

interface Props {
  steps: LessonStep[];
  substep: Substep;
  onComplete: () => void;
}

export function LessonPart({ steps, substep, onComplete }: Props) {
  const { content } = useServices();
  const say = useSay();
  const [i, setI] = useState(0);
  const [demoDone, setDemoDone] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const completedRef = useRef(false);
  const step = steps[i];

  useEffect(() => {
    setDemoDone(false);
    if (!step) {
      if (completedRef.current) return;
      completedRef.current = true;
      onCompleteRef.current();
      return;
    }
    // Deferred to the next microtask so that under StrictMode's dev-mode
    // mount/cleanup/remount, the throwaway first pass's cleanup can mark
    // itself cancelled before it actually speaks anything.
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        if (cancelled) return;
        if ('say' in step) return say(step.say);
        if ('try' in step) return say('Your turn. Tap each sound, then blend.');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [i, step, say]);

  const next = () => setI(i + 1);

  if (!step) return null;
  return (
    <div className="stage" data-part="lesson" data-testid="part" data-step={'say' in step ? 'say' : 'show' in step ? 'show' : 'tap' in step ? 'tap' : 'try'}>
      <Caption />
      {'say' in step && <BigButton onClick={next}>Next</BigButton>}
      {'show' in step && (
        <>
          <div className="row">
            {step.show.map((g, k) => (
              <Tile key={k} grapheme={g} type={cardTypeFor(content.cards, g)} size={step.show.length > 4 ? 'normal' : 'large'} />
            ))}
          </div>
          <BigButton onClick={next}>Next</BigButton>
        </>
      )}
      {'tap' in step && (
        <>
          <TapDots key={i} word={findWord(substep, step.tap)} mode="demo" onResult={() => setDemoDone(true)} />
          {demoDone && <BigButton onClick={next}>Next</BigButton>}
        </>
      )}
      {'try' in step && <TapDots key={i} word={findWord(substep, step.try)} mode="try" onResult={next} />}
    </div>
  );
}
