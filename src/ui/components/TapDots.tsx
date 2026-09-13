import { useEffect, useRef, useState } from 'react';
import type { Word } from '../../content/types';
import { useServices, wait } from '../services';
import { cardTypeFor } from '../tiles';
import { Tile } from './Tile';
import { BigButton } from './BigButton';

interface Props {
  word: Word;
  mode: 'demo' | 'try';
  onResult: (correct: boolean) => void;
}

export function TapDots({ word, mode, onResult }: Props) {
  const { audio, content, timing } = useServices();
  const [tapped, setTapped] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [blending, setBlending] = useState(false);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    setTapped(0);
    setWrong(false);
    setBlending(false);
    if (mode !== 'demo') return;
    let cancelled = false;
    (async () => {
      for (let i = 0; i < word.parts.length; i++) {
        if (cancelled) return;
        setTapped(i + 1);
        await audio.playCard(word.parts[i].card);
        await wait(timing.demoDelayMs);
      }
      if (cancelled) return;
      setBlending(true);
      await audio.speak(word.text);
      if (!cancelled) onResultRef.current(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [word, mode, audio, timing.demoDelayMs]);

  const tapDot = async (i: number) => {
    if (mode !== 'try' || tapped >= word.parts.length) return;
    if (i !== tapped) setWrong(true);
    setTapped(tapped + 1);
    await audio.playCard(word.parts[i].card);
  };

  const blend = async () => {
    if (blending) return;
    setBlending(true);
    await audio.speak(word.text);
    onResultRef.current(!wrong);
  };

  const done = tapped >= word.parts.length;
  return (
    <div className="tapdots">
      <div className="row">
        {word.parts.map((p, i) => (
          <Tile key={i} grapheme={p.grapheme} type={cardTypeFor(content.cards, p.grapheme)} selected={i < tapped} />
        ))}
      </div>
      <div className="dots">
        {word.parts.map((_, i) =>
          mode === 'try' ? (
            <button
              key={i}
              type="button"
              className={`dot ${i < tapped ? 'dot-lit' : ''}`}
              aria-label={`Sound ${i + 1}`}
              onClick={() => tapDot(i)}
            />
          ) : (
            <span key={i} className={`dot ${i < tapped ? 'dot-lit' : ''}`} aria-hidden="true" />
          ),
        )}
      </div>
      {mode === 'try' && done && !blending && <BigButton onClick={blend}>Blend</BigButton>}
      {blending && <p className="bigword">{word.text}</p>}
    </div>
  );
}
