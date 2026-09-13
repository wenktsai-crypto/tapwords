import { useServices } from '../services';

export function Path({ current }: { current: string }) {
  const { content } = useServices();
  return (
    <ol className="path" aria-label="Progress path">
      {content.substeps.map((s) => (
        <li key={s.id} className={s.id === current ? 'path-current' : ''} aria-current={s.id === current ? 'step' : undefined}>
          <span className="path-id">{s.id}</span> {s.title}
        </li>
      ))}
    </ol>
  );
}
