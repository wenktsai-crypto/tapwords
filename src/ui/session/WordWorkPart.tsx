import { useEffect, useRef, useState } from 'react';
import type { WordWorkItem } from '../../engine/session';
import { wordKey, type ScoredResponse } from '../../engine/types';
import { useServices, wait } from '../services';
import { Caption, useSay } from '../speech';
import { cardTypeFor } from '../tiles';
import { Tile } from '../components/Tile';
import { BigButton } from '../components/BigButton';
import { TapDots } from '../components/TapDots';
import { TileBuilder } from '../components/TileBuilder';
import { MissReview } from '../components/MissReview';

interface Props {
  items: WordWorkItem[];
  onComplete: (responses: ScoredResponse[]) => void;
  /** Called as each response is scored, so a session stopped mid-part keeps what was answered. */
  onProgress?: (response: ScoredResponse) => void;
}

export function WordWorkPart({ items, onComplete, onProgress }: Props) {
  const { audio, content, timing } = useServices();
  const say = useSay();
  const [i, setI] = useState(0);
  const [responses, setResponses] = useState<ScoredResponse[]>([]);
  const [miss, setMiss] = useState(false);
  const [preview, setPreview] = useState(false);
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);
  // Guards against a second click/tap resolving the same item twice
  // (e.g. a rapid double-tap) before the item advances. Reset per item.
  const answeredRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  const item = items[i];

  const finish = (rs: ScoredResponse[]) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinished(true);
    onCompleteRef.current(rs);
  };

  useEffect(() => {
    answeredRef.current = false;
    if (!item) {
      finish(responses);
      return;
    }
    // Set synchronously (not deferred below) so the word preview is visible
    // from this item's very first render, matching what "build" means.
    setPreview(item.type === 'build');
    let cancelled = false;
    // Deferred to the next microtask so that under StrictMode's dev-mode
    // mount/cleanup/remount, the throwaway first pass's cleanup can mark
    // itself cancelled before it actually speaks anything.
    Promise.resolve()
      .then(async () => {
        if (cancelled) return;
        if (item.type === 'tap') await say('Tap it out, then blend.');
        if (item.type === 'find') {
          await say('Find the word.');
          if (!cancelled) await audio.speak(item.word.text);
        }
        if (item.type === 'build') {
          try {
            await say('Look, then build the word.');
            if (!cancelled) await audio.speak(item.word.text);
          } finally {
            // The tray has to appear even when the voice failed, or the child is
            // left looking at a word preview with nothing to tap.
            await wait(timing.previewMs);
            if (!cancelled) setPreview(false);
          }
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const record = (correct: boolean) => {
    if (!item || answeredRef.current) return;
    answeredRef.current = true;
    const r: ScoredResponse = { itemKey: wordKey(item.substep, item.word.text), activity: item.type, correct, isReview: item.isReview, parentMarked: false };
    const rs = [...responses, r];
    setResponses(rs);
    onProgressRef.current?.(r);
    if (correct) advance(rs);
    else setMiss(true);
  };

  const advance = (rs: ScoredResponse[]) => {
    if (finishedRef.current) return;
    setMiss(false);
    if (i + 1 < items.length) setI(i + 1);
    else finish(rs);
  };

  if (finished || !item) return null;
  if (miss) return <MissReview key={i} word={item.word} onDone={() => advance(responses)} />;

  return (
    <div className="stage" data-part="word-work">
      <Caption />
      {item.type === 'tap' && <TapDots key={i} word={item.word} mode="try" onResult={record} />}
      {item.type === 'find' && (
        <>
          <div className="row">
            {item.choices.map((c) => <BigButton key={c} variant="quiet" onClick={() => record(c === item.word.text)}>{c}</BigButton>)}
          </div>
          <BigButton variant="quiet" onClick={() => audio.speak(item.word.text)}>Hear it again</BigButton>
        </>
      )}
      {item.type === 'build' && preview && (
        <div className="row">
          {item.word.parts.map((p, k) => <Tile key={k} grapheme={p.grapheme} type={cardTypeFor(content.cards, p.grapheme)} size="large" />)}
        </div>
      )}
      {item.type === 'build' && !preview && (
        <>
          <TileBuilder key={i} tray={buildTray(item.word.parts.map((p) => p.grapheme), content.cards.map((c) => c.grapheme), i)} expected={item.word.parts.map((p) => p.grapheme)} onDone={record} />
          <BigButton variant="quiet" onClick={() => audio.speak(item.word.text)}>Hear it again</BigButton>
        </>
      )}
    </div>
  );
}

/** Word graphemes plus two distractors, in a fixed order derived from the item index (no randomness in the UI). */
function buildTray(graphemes: string[], allGraphemes: string[], seed: number): string[] {
  const extras = allGraphemes.filter((g) => !graphemes.includes(g) && g.length === 1);
  const d1 = extras[seed % extras.length];
  const d2 = extras[(seed + 7) % extras.length];
  const tray = [...graphemes, d1, d2 === d1 ? extras[(seed + 3) % extras.length] : d2];
  // rotate so the answer is not simply the first tiles
  const r = (seed + 2) % tray.length;
  return [...tray.slice(r), ...tray.slice(0, r)];
}
