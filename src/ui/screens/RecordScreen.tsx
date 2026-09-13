import { useEffect, useState } from 'react';
import { useServices } from '../services';
import { cardTypeFor } from '../tiles';
import { Tile } from '../components/Tile';
import { BigButton } from '../components/BigButton';

interface Props {
  onBack: () => void;
}

/** One row per sound card. A grown-up records the sound in their own voice; the app then uses
 * that clip instead of the computer voice wherever the card is played (spec 6). */
export function RecordScreen({ onBack }: Props) {
  const { content, store, audio, recorder } = useServices();
  const [recorded, setRecorded] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<string | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    store.listClipIds().then((ids) => setRecorded(new Set(ids)), () => setNote("We couldn't read the saved recordings."));
  }, [store]);

  const start = async (id: string) => {
    if (active) return;
    setNote('');
    try {
      await recorder.start();
      setActive(id);
    } catch {
      setNote("We couldn't use the microphone. Check that this app is allowed to use it, then try again.");
    }
  };

  const stop = async (id: string) => {
    if (active !== id) return;
    try {
      const blob = await recorder.stop();
      await store.saveClip(id, blob);
      setRecorded((r) => new Set([...r, id]));
    } catch {
      setNote("We couldn't save that recording. Try again.");
    } finally {
      setActive(null);
    }
  };

  return (
    <div className="screen">
      <div className="topbar">
        <span>Record the sounds</span>
        <BigButton variant="quiet" onClick={onBack} disabled={active !== null}>Back</BigButton>
      </div>
      <div className="stage">
        <p className="caption">Tap Record, say the sound once, clearly, then tap Stop. Say the sound, not the letter name: "mmm", not "em". You can play it back and record again any time.</p>
        {!recorder.supported() && <p className="caption">This browser can't record. The computer voice will be used instead.</p>}
        {note && <p className="caption">{note}</p>}
        <ul className="cardlist">
          {content.cards.map((c) => {
            const isActive = active === c.id;
            return (
              <li key={c.id} className="cardrow" data-testid={`card-row-${c.id}`}>
                <Tile grapheme={c.grapheme} type={cardTypeFor(content.cards, c.grapheme)} />
                <span className="cardrow-keyword">{c.keyword}</span>
                <span className="cardrow-status">{recorded.has(c.id) ? 'Recorded' : 'Not recorded'}</span>
                <div className="row">
                  {recorder.supported() && !isActive && <BigButton variant="quiet" onClick={() => start(c.id)} disabled={active !== null}>Record</BigButton>}
                  {isActive && <BigButton onClick={() => stop(c.id)}>Stop</BigButton>}
                  {recorded.has(c.id) && <BigButton variant="quiet" onClick={() => audio.playCard(c.id)} disabled={active !== null}>Play</BigButton>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
