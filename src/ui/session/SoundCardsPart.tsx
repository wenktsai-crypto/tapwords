import { useEffect, useRef, useState } from 'react';
import type { ReverseItem } from '../../engine/session';
import { cardKey, type ScoredResponse } from '../../engine/types';
import { getCard } from '../../engine/availability';
import { useServices } from '../services';
import { Caption, useSay } from '../speech';
import { Tile } from '../components/Tile';
import { BigButton } from '../components/BigButton';

interface Props {
  forwardCards: string[];
  reverseItems: ReverseItem[];
  onComplete: (responses: ScoredResponse[]) => void;
  /** Called as each response is scored, so a session stopped mid-part keeps what was answered. */
  onProgress?: (response: ScoredResponse) => void;
}

export function SoundCardsPart({ forwardCards, reverseItems, onComplete, onProgress }: Props) {
  const { audio, content } = useServices();
  const say = useSay();
  const [phase, setPhase] = useState<'forward' | 'reverse'>(forwardCards.length > 0 ? 'forward' : 'reverse');
  const [i, setI] = useState(0);
  const [responses, setResponses] = useState<ScoredResponse[]>([]);
  const [missed, setMissed] = useState(false);
  const missedRef = useRef(false);
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  const item = phase === 'reverse' ? reverseItems[i] : undefined;

  const finish = (rs: ScoredResponse[]) => {
    finishedRef.current = true;
    setFinished(true);
    onCompleteRef.current(rs);
  };

  useEffect(() => {
    if (phase !== 'forward' || i !== 0) return;
    let cancelled = false;
    // Deferred to the next microtask so that under StrictMode's dev-mode
    // mount/cleanup/remount, the throwaway first pass's cleanup can mark
    // itself cancelled before it actually speaks anything. A failed voice
    // is swallowed: the cards are on screen either way.
    Promise.resolve()
      .then(() => {
        if (!cancelled) return say('Say the sound for each card. Tap "Hear it" to check.');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [phase, i, say]);

  useEffect(() => {
    if (phase !== 'reverse') return;
    if (!item) {
      if (!finishedRef.current) finish(responses);
      return;
    }
    let cancelled = false;
    Promise.resolve()
      .then(async () => {
        if (cancelled) return;
        await say('Which card makes this sound?');
        if (!cancelled) await audio.playCard(item.target);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, i]);

  const nextForward = () => {
    if (finishedRef.current) return;
    if (i + 1 < forwardCards.length) setI(i + 1);
    else {
      setPhase('reverse');
      setI(0);
    }
  };

  const nextReverse = (rs: ScoredResponse[]) => {
    if (finishedRef.current) return;
    missedRef.current = false;
    setMissed(false);
    if (i + 1 < reverseItems.length) setI(i + 1);
    else finish(rs);
  };

  const answer = async (choice: string) => {
    if (!item || missedRef.current || finishedRef.current) return;
    missedRef.current = true;
    const correct = choice === item.target;
    const r: ScoredResponse = { itemKey: cardKey(item.target), activity: 'sound-reverse', correct, isReview: item.isReview, parentMarked: false };
    const rs = [...responses, r];
    setResponses(rs);
    onProgressRef.current?.(r);
    if (correct) nextReverse(rs);
    else {
      setMissed(true);
      await audio.playCard(item.target);
    }
  };

  if (phase === 'forward') {
    const card = getCard(content, forwardCards[i]);
    return (
      <div className="stage" data-part="sound-forward" data-testid="part">
        <Caption />
        <Tile grapheme={card.grapheme} type={card.type} size="large" />
        <p className="caption">as in {card.keyword}</p>
        <div className="row">
          <BigButton variant="quiet" onClick={() => audio.playCard(card.id)}>Hear it</BigButton>
          <BigButton onClick={nextForward}>That's it</BigButton>
          <BigButton variant="quiet" onClick={nextForward}>Not sure</BigButton>
        </div>
      </div>
    );
  }

  if (finished || !item) return null;
  return (
    <div className="stage" data-part="sound-reverse" data-testid="part" data-answer={item.target}>
      <Caption />
      <div className="row">
        {item.choices.map((c) => {
          const card = getCard(content, c);
          return <Tile key={c} grapheme={card.grapheme} type={card.type} size="large" selected={missed && c === item.target} dim={missed && c !== item.target} onClick={() => answer(c)} />;
        })}
      </div>
      <div className="row">
        <BigButton variant="quiet" onClick={() => audio.playCard(item.target)}>Hear it again</BigButton>
        {missed && <BigButton onClick={() => nextReverse(responses)}>Next</BigButton>}
      </div>
    </div>
  );
}
