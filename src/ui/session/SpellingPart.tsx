import { useEffect, useRef, useState } from 'react';
import type { SpellingItem } from '../../engine/session';
import { cardKey, sentenceKey, wordKey, type ScoredResponse } from '../../engine/types';
import { getCard } from '../../engine/availability';
import { cardDisplay } from '../../content/parts';
import { useServices } from '../services';
import { Caption, useSay } from '../speech';
import { Tile } from '../components/Tile';
import { BigButton } from '../components/BigButton';
import { TileBuilder } from '../components/TileBuilder';
import { MissReview } from '../components/MissReview';

interface Props {
  items: SpellingItem[];
  onComplete: (responses: ScoredResponse[]) => void;
  /** Called as each response is scored, so a session stopped mid-part keeps what was answered. */
  onProgress?: (response: ScoredResponse) => void;
}

export function SpellingPart({ items, onComplete, onProgress }: Props) {
  const { audio, content } = useServices();
  const say = useSay();
  const [i, setI] = useState(0);
  const [responses, setResponses] = useState<ScoredResponse[]>([]);
  const [feedback, setFeedback] = useState<'none' | 'sound' | 'word' | 'sentence'>('none');
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

  const hear = async () => {
    if (!item) return;
    if (item.type === 'sound') await audio.playCard(item.card);
    if (item.type === 'word') await audio.speak(item.word.text);
    if (item.type === 'sentence') await audio.speak(item.text);
  };

  useEffect(() => {
    answeredRef.current = false;
    if (!item) {
      finish(responses);
      return;
    }
    let cancelled = false;
    // Deferred to the next microtask so that under StrictMode's dev-mode
    // mount/cleanup/remount, the throwaway first pass's cleanup can mark
    // itself cancelled before it actually speaks anything.
    Promise.resolve()
      .then(async () => {
        if (cancelled) return;
        if (item.type === 'sound') await say('Tap the letter that makes this sound.');
        if (item.type === 'word') await say('Spell the word.');
        if (item.type === 'sentence') await say('Put the words in order.');
        if (!cancelled) await hear();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const advance = (rs: ScoredResponse[]) => {
    if (finishedRef.current) return;
    setFeedback('none');
    if (i + 1 < items.length) setI(i + 1);
    else finish(rs);
  };

  const record = async (correct: boolean) => {
    if (!item || answeredRef.current || feedback !== 'none') return;
    answeredRef.current = true;
    const base = { correct, parentMarked: false };
    const r: ScoredResponse =
      item.type === 'sound'
        ? { ...base, itemKey: cardKey(item.card), activity: 'spell-sound', isReview: item.isReview }
        : item.type === 'word'
          ? { ...base, itemKey: wordKey(item.substep, item.word.text), activity: 'spell-word', isReview: item.isReview }
          : { ...base, itemKey: sentenceKey(item.substep, item.text), activity: 'spell-sentence', isReview: false };
    const rs = [...responses, r];
    setResponses(rs);
    onProgressRef.current?.(r);
    if (correct) return advance(rs);
    setFeedback(item.type);
    await hear();
  };

  if (finished || !item) return null;

  if (feedback === 'word' && item.type === 'word') return <MissReview key={i} word={item.word} onDone={() => advance(responses)} />;

  return (
    <div className="stage" data-part="spelling" data-testid="part" data-item={item.type} data-answer={item.type === 'sound' ? item.card : item.type === 'word' ? item.word.parts.map((p) => p.grapheme).join(',') : item.text.split(/\s+/).join('|')}>
      <Caption />
      {item.type === 'sound' && (
        <div className="row">
          {item.choices.map((c) => {
            const card = getCard(content, c);
            // The card's own drill face, as SoundCardsPart shows it: a_e, not a. A silent-e card
            // and the plain vowel it is built on share a grapheme, and both can be choices in the
            // same row, so the grapheme would put two identical tiles on screen.
            return <Tile key={c} grapheme={cardDisplay(card)} type={card.type} size="large" selected={feedback === 'sound' && c === item.card} dim={feedback === 'sound' && c !== item.card} onClick={() => record(c === item.card)} />;
          })}
        </div>
      )}
      {item.type === 'word' && <TileBuilder key={i} tray={item.tray} expected={item.word.parts.map((p) => p.grapheme)} onDone={record} />}
      {item.type === 'sentence' && feedback === 'none' && <TileBuilder key={i} kind="chip" tray={item.words} expected={item.text.split(/\s+/)} onDone={record} />}
      {item.type === 'sentence' && feedback === 'sentence' && <p className="bigtext">{item.text}</p>}
      <div className="row">
        <BigButton variant="quiet" onClick={hear}>Hear it again</BigButton>
        {feedback !== 'none' && <BigButton onClick={() => advance(responses)}>Next</BigButton>}
      </div>
    </div>
  );
}
