// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { BrowserRecorder } from '../../src/audio/recorder';

describe('BrowserRecorder', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('stops the microphone track and rejects when MediaRecorder cannot be constructed', async () => {
    const stop = vi.fn();
    const fakeStream = { getTracks: () => [{ stop }] };
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(fakeStream) },
    });
    class ThrowingMediaRecorder {
      constructor() {
        throw new Error('no codec');
      }
    }
    vi.stubGlobal('MediaRecorder', ThrowingMediaRecorder);

    const recorder = new BrowserRecorder();
    await expect(recorder.start()).rejects.toThrow('no codec');
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('records and stops normally, returning a blob and releasing the track', async () => {
    const stop = vi.fn();
    const fakeStream = { getTracks: () => [{ stop }] };
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(fakeStream) },
    });
    class FakeMediaRecorder {
      mimeType = 'audio/webm';
      ondataavailable: ((e: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      start() {
        this.ondataavailable?.({ data: new Blob(['x'], { type: 'audio/webm' }) });
      }
      stop() {
        this.onstop?.();
      }
    }
    vi.stubGlobal('MediaRecorder', FakeMediaRecorder);

    const recorder = new BrowserRecorder();
    await recorder.start();
    const blob = await recorder.stop();
    expect(blob.type).toBe('audio/webm');
    expect(stop).toHaveBeenCalledTimes(1);
  });
});
