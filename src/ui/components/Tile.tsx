import { forwardRef, type Ref } from 'react';
import type { CardType } from '../../content/types';

interface Props {
  grapheme: string;
  type?: CardType;
  size?: 'normal' | 'large';
  selected?: boolean;
  dim?: boolean;
  onClick?: () => void;
  label?: string;
  className?: string;
}

/** Takes a ref so a screen can measure where a tile sits and draw between two of them. */
export const Tile = forwardRef<HTMLElement, Props>(function Tile(
  { grapheme, type = 'consonant', size = 'normal', selected, dim, onClick, label, className },
  ref,
) {
  const cls = ['tile', `tile-${type}`, `tile-${size}`, selected ? 'tile-selected' : '', dim ? 'tile-dim' : '', className ?? ''].filter(Boolean).join(' ');
  if (!onClick) return <span className={cls} ref={ref as Ref<HTMLSpanElement>}>{grapheme}</span>;
  return (
    <button type="button" className={cls} ref={ref as Ref<HTMLButtonElement>} onClick={onClick} aria-label={label ?? grapheme}>
      {grapheme}
    </button>
  );
});
