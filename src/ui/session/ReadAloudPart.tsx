import { useEffect, useRef, useState } from 'react';
import type { WordRef } from '../../engine/session';
import { sentenceKey, wordKey, type ScoredResponse } from '../../engine/types';
import { Caption, useSay } from '../speech';
import { BigButton } from '../components/BigButton';

interface Props {
  words: WordRef[];
  sentences: string[];
  substep: string;
  onComplete: (responses: ScoredResponse[], done: boolean) => void;
  /** Called as each response is scored, so a session stopped mid-part keeps what was answered. */
  onProgress?: (response: ScoredResponse) => void;
}

export function ReadAloudPart({ words, sentences, substep, onComplete, onProgress }: Props) {
  const say = useSay();
  const [phase, setPhase] = useState<'ask' | 'read'>('ask');
  const [i, setI] = useState(0);
  const [responses, setResponses] = useState<ScoredResponse[]>([]);
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);
  // Guards against a second click/tap resolving the same line twice
  // (e.g. a rapid double-tap) before the line advances. Reset per line.
  const answeredRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  const lines = [
    ...words.map((w) => ({ text: w.word.text, itemKey: wordKey(w.substep, w.word.text), isReview: w.isReview })),
    ...sentences.map((s) => ({ text: s, itemKey: sentenceKey(substep, s), isReview: false })),
  ];

  const finish = (rs: ScoredResponse[], done: boolean) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinished(true);
    onCompleteRef.current(rs, done);
  };

  useEffect(() => {
    answeredRef.current = false;
    let cancelled = false;
    // Deferred to the next microtask so that under StrictMode's dev-mode
    // mount/cleanup/remount, the throwaway first pass's cleanup can mark
    // itself cancelled before it actually speaks anything.
    Promise.resolve()
      .then(() => {
        if (cancelled) return;
        if (phase === 'ask') return say('Is a grown-up with you? It is time to read out loud.');
        if (phase === 'read' && i === 0) return say('Grown-up: tap "Got it" or "Missed it" after each line.');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, i]);

  const mark = (correct: boolean) => {
    if (finishedRef.current || answeredRef.current) return;
    answeredRef.current = true;
    const line = lines[i];
    const r: ScoredResponse = { itemKey: line.itemKey, activity: 'read-aloud', correct, isReview: line.isReview, parentMarked: true };
    const rs = [...responses, r];
    setResponses(rs);
    onProgressRef.current?.(r);
    if (i + 1 < lines.length) setI(i + 1);
    else finish(rs, true);
  };

  const startReading = () => {
    if (finishedRef.current || answeredRef.current) return;
    answeredRef.current = true;
    if (lines.length) setPhase('read');
    else finish([], true);
  };

  const skip = () => {
    if (finishedRef.current || answeredRef.current) return;
    answeredRef.current = true;
    finish([], false);
  };

  if (finished) return null;

  if (phase === 'ask') {
    return (
      <div className="stage" data-part="read-aloud-ask" data-testid="part">
        <Caption />
        <div className="row">
          <BigButton onClick={startReading}>Yes</BigButton>
          <BigButton variant="quiet" onClick={skip}>Not right now</BigButton>
        </div>
      </div>
    );
  }

  const line = lines[i];
  return (
    <div className="stage" data-part="read-aloud" data-testid="part">
      <Caption />
      <p className={line.text.includes(' ') ? 'bigtext' : 'bigword'}>{line.text}</p>
      <div className="row">
        <BigButton onClick={() => mark(true)}>Got it</BigButton>
        <BigButton variant="quiet" onClick={() => mark(false)}>Missed it</BigButton>
      </div>
      <p className="caption">{i + 1} of {lines.length}</p>
    </div>
  );
}
