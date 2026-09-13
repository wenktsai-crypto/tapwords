import type { CardType } from '../../content/types';

interface Props {
  grapheme: string;
  type?: CardType;
  size?: 'normal' | 'large';
  selected?: boolean;
  dim?: boolean;
  onClick?: () => void;
  label?: string;
}

export function Tile({ grapheme, type = 'consonant', size = 'normal', selected, dim, onClick, label }: Props) {
  const cls = ['tile', `tile-${type}`, `tile-${size}`, selected ? 'tile-selected' : '', dim ? 'tile-dim' : ''].filter(Boolean).join(' ');
  if (!onClick) return <span className={cls}>{grapheme}</span>;
  return (
    <button type="button" className={cls} onClick={onClick} aria-label={label ?? grapheme}>
      {grapheme}
    </button>
  );
}
