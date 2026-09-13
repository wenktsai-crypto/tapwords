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
  const step = steps[i];

  useEffect(() => {
    setDemoDone(false);
    if (!step) {
      onCompleteRef.current();
      return;
    }
    if ('say' in step) say(step.say);
    if ('try' in step) say('Your turn. Tap each sound, then blend.');
  }, [i, step, say]);

  const next = () => setI(i + 1);

  if (!step) return null;
  return (
    <div className="stage" data-part="lesson">
      <Caption />
      {'say' in step && <BigButton onClick={next}>Next</BigButton>}
      {'show' in step && (
        <>
          <div className="row">
            {step.show.map((g, k) => <Tile key={k} grapheme={g} type={cardTypeFor(content.cards, g)} size="large" />)}
          </div>
          <BigButton onClick={next}>Next</BigButton>
        </>
      )}
      {'tap' in step && (
        <>
          <TapDots word={findWord(substep, step.tap)} mode="demo" onResult={() => setDemoDone(true)} />
          {demoDone && <BigButton onClick={next}>Next</BigButton>}
        </>
      )}
      {'try' in step && <TapDots word={findWord(substep, step.try)} mode="try" onResult={next} />}
    </div>
  );
}
