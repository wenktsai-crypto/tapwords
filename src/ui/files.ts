/** Hands a text file to the person: the share sheet where there is one (iPad), otherwise a download. */
export async function saveTextFile(name: string, text: string): Promise<void> {
  const blob = new Blob([text], { type: 'application/json' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (typeof File !== 'undefined' && nav.share && nav.canShare) {
    const file = new File([blob], name, { type: 'application/json' });
    if (nav.canShare({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: name });
        return;
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
      }
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
