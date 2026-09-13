import { useRef, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onHold: () => void;
  ms?: number;
}

/** Fires onHold after the pointer is held down for `ms`. Lets a parent open the grown-up area without a password. */
export function HoldButton({ children, onHold, ms = 1500 }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = () => {
    cancel();
    timer.current = setTimeout(() => {
      timer.current = null;
      onHold();
    }, ms);
  };
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  return (
    <button
      type="button"
      className="big big-quiet hold"
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
}
