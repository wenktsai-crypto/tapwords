import { CONTENT } from './src/content/index';

const upTo = process.argv[2] ?? '4.6';
const known = new Set<string>();
for (const s of CONTENT.substeps) {
  for (const w of s.words) if (w.kind === 'real') known.add(w.text.toLowerCase());
  for (const sw of s.sightWords) known.add(sw.toLowerCase());
  if (s.id === upTo) break;
}
const list = [...known].sort();
console.log(`# ${list.length} words readable at ${upTo}`);
for (let i = 0; i < list.length; i += 12) console.log(list.slice(i, i + 12).join(' '));
