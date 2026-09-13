import type { Recorder } from './types';

export class BrowserRecorder implements Recorder {
  private rec: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];

  supported() {
    return typeof MediaRecorder !== 'undefined' && typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
  }

  async start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.stream = stream;
    this.chunks = [];
    try {
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data);
      };
      rec.start();
      this.rec = rec;
    } catch (err) {
      stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
      this.rec = null;
      throw err;
    }
  }

  stop() {
    return new Promise<Blob>((resolve, reject) => {
      const rec = this.rec;
      if (!rec) return reject(new Error('not recording'));
      rec.onstop = () => {
        const type = rec.mimeType || 'audio/mp4';
        this.stream?.getTracks().forEach((t) => t.stop());
        this.stream = null;
        this.rec = null;
        resolve(new Blob(this.chunks, { type }));
      };
      rec.stop();
    });
  }
}
