import { useEffect, useState } from 'react';
import type { Word } from '../../content/types';
import { useSay } from '../speech';
import { TapDots } from './TapDots';

interface Props {
  word: Word;
  onDone: () => void;
}

export function MissReview({ word, onDone }: Props) {
  const say = useSay();
  const [phase, setPhase] = useState<'intro' | 'demo' | 'try'>('intro');

  useEffect(() => {
    let cancelled = false;
    const advance = () => {
      if (!cancelled) setPhase('demo');
    };
    say("Let's look at that one.").then(advance, advance);
    return () => {
      cancelled = true;
    };
  }, [say, word]);

  return (
    <div className="stage">
      <p className="caption">Let's look at that one.</p>
      {phase === 'demo' && <TapDots word={word} mode="demo" onResult={() => setPhase('try')} />}
      {phase === 'try' && <TapDots word={word} mode="try" onResult={() => onDone()} />}
    </div>
  );
}
