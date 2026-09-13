import { useState } from 'react';
import { useServices } from '../services';
import { cardTypeFor } from '../tiles';
import { Tile } from './Tile';
import { BigButton } from './BigButton';

interface Props {
  tray: string[];
  expected: string[];
  kind?: 'tile' | 'chip';
  onDone: (correct: boolean) => void;
}

export function TileBuilder({ tray, expected, kind = 'tile', onDone }: Props) {
  const { content } = useServices();
  const [used, setUsed] = useState<number[]>([]);
  const joiner = kind === 'tile' ? '' : ' ';

  // When the same piece appears twice in the tray ("tot"), plain letter labels would be
  // ambiguous to a screen reader and to tests, so repeats are numbered. Pieces that appear
  // once keep the bare letter.
  const totals = new Map<string, number>();
  for (const t of tray) totals.set(t, (totals.get(t) ?? 0) + 1);
  const seen = new Map<string, number>();
  const trayLabels = tray.map((t) => {
    const n = (seen.get(t) ?? 0) + 1;
    seen.set(t, n);
    return (totals.get(t) ?? 0) > 1 ? `${t} ${n}` : t;
  });

  const pick = (idx: number) => {
    if (used.includes(idx) || used.length >= expected.length) return;
    setUsed([...used, idx]);
  };
  const unpick = (pos: number) => setUsed(used.filter((_, k) => k !== pos));
  const finish = () => onDone(used.map((k) => tray[k]).join(joiner) === expected.join(joiner));

  const piece = (text: string, props: { onClick: () => void; dim?: boolean; label?: string }) =>
    kind === 'tile' ? (
      <Tile grapheme={text} type={cardTypeFor(content.cards, text)} onClick={props.onClick} dim={props.dim} label={props.label} />
    ) : (
      <button type="button" className={`big big-quiet ${props.dim ? 'tile-dim' : ''}`} onClick={props.onClick} aria-label={props.label ?? text}>{text}</button>
    );

  return (
    <div className="builder">
      <div className="row" data-testid="answer">
        {used.length === 0 && <span className="caption">Tap the pieces in order</span>}
        {used.map((k, pos) => <span key={pos}>{piece(tray[k], { onClick: () => unpick(pos), label: `Remove ${tray[k]}` })}</span>)}
      </div>
      <div className="row" data-testid="tray">
        {tray.map((t, idx) => <span key={idx}>{piece(t, { onClick: () => pick(idx), dim: used.includes(idx), label: trayLabels[idx] })}</span>)}
      </div>
      <BigButton onClick={finish} disabled={used.length !== expected.length}>Done</BigButton>
    </div>
  );
}
