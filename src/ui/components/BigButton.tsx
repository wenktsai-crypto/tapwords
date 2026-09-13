import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'quiet';
  disabled?: boolean;
}

export function BigButton({ children, onClick, variant = 'primary', disabled }: Props) {
  return (
    <button type="button" className={`big big-${variant}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
