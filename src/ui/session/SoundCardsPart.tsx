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
}

export function SoundCardsPart({ forwardCards, reverseItems, onComplete }: Props) {
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

  const item = phase === 'reverse' ? reverseItems[i] : undefined;

  const finish = (rs: ScoredResponse[]) => {
    finishedRef.current = true;
    setFinished(true);
    onCompleteRef.current(rs);
  };

  useEffect(() => {
    if (phase === 'forward' && i === 0) say('Say the sound for each card. Tap "Hear it" to check.');
  }, [phase, i, say]);

  useEffect(() => {
    if (phase !== 'reverse') return;
    if (!item) {
      if (!finishedRef.current) finish(responses);
      return;
    }
    let cancelled = false;
    (async () => {
      await say('Which card makes this sound?');
      if (!cancelled) await audio.playCard(item.target);
    })();
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
    const rs = [...responses, { itemKey: cardKey(item.target), activity: 'sound-reverse' as const, correct, isReview: item.isReview, parentMarked: false }];
    setResponses(rs);
    if (correct) nextReverse(rs);
    else {
      setMissed(true);
      await audio.playCard(item.target);
    }
  };

  if (phase === 'forward') {
    const card = getCard(content, forwardCards[i]);
    return (
      <div className="stage" data-part="sound-forward">
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
    <div className="stage" data-part="sound-reverse">
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
