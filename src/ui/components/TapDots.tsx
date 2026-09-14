import { useEffect, useRef, useState } from 'react';
import type { Word } from '../../content/types';
import { useServices, wait } from '../services';
import { cardMap, soundingIndexes } from '../../content/parts';
import { SoundTiles } from './SoundTiles';
import { BigButton } from './BigButton';

interface Props {
  word: Word;
  mode: 'demo' | 'try';
  onResult: (correct: boolean) => void;
}

export function TapDots({ word, mode, onResult }: Props) {
  const { audio, content, timing } = useServices();
  const sounding = soundingIndexes(word, cardMap(content.cards));
  const [tapped, setTapped] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [blending, setBlending] = useState(false);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;
  // Mirrors of the state above, read synchronously so rapid taps that land
  // before React commits a re-render (e.g. touch ghost clicks) can't read a
  // stale value and double-count or drop a tap.
  const tappedRef = useRef(0);
  const wrongRef = useRef(false);
  const blendingRef = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    setTapped(0);
    setWrong(false);
    setBlending(false);
    tappedRef.current = 0;
    wrongRef.current = false;
    blendingRef.current = false;
    if (mode !== 'demo') return;
    let cancelled = false;
    (async () => {
      for (let i = 0; i < sounding.length; i++) {
        if (cancelled) return;
        setTapped(i + 1);
        await audio.playCard(word.parts[sounding[i]].card);
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
    if (mode !== 'try' || tappedRef.current >= sounding.length) return;
    const next = tappedRef.current + 1;
    if (i !== tappedRef.current) {
      wrongRef.current = true;
      setWrong(true);
    }
    tappedRef.current = next;
    setTapped(next);
    await audio.playCard(word.parts[sounding[i]].card);
  };

  const blend = async () => {
    if (blendingRef.current) return;
    blendingRef.current = true;
    setBlending(true);
    await audio.speak(word.text);
    if (!mounted.current) return;
    onResultRef.current(!wrongRef.current);
  };

  const done = tapped >= sounding.length;
  const starts = new Set(word.syllables ?? []);
  const long = word.parts.length > 6;
  return (
    <div className={['tapdots', long ? 'tapdots-long' : ''].filter(Boolean).join(' ')}>
      <SoundTiles word={word} tapped={tapped} />
      <div className="dots">
        {sounding.map((partIndex, i) =>
          mode === 'try' ? (
            <button
              key={i}
              type="button"
              className={`dot ${i < tapped ? 'dot-lit' : ''} ${starts.has(partIndex) ? 'dot-syllable-start' : ''}`}
              aria-label={`Sound ${i + 1}`}
              onClick={() => tapDot(i)}
            />
          ) : (
            <span key={i} className={`dot ${i < tapped ? 'dot-lit' : ''} ${starts.has(partIndex) ? 'dot-syllable-start' : ''}`} aria-hidden="true" />
          ),
        )}
      </div>
      {mode === 'try' && done && !blending && <BigButton onClick={blend}>Blend</BigButton>}
      {blending && <p className="bigword">{word.text}</p>}
    </div>
  );
}
