import { describe, it, expect } from 'vitest';
import { FakeAudio } from '../../src/audio/fake';

describe('FakeAudio', () => {
  it('records what was spoken and played, in order', async () => {
    const a = new FakeAudio();
    await a.speak('hello');
    await a.playCard('sh');
    a.stop();
    expect(a.spoken).toEqual(['hello']);
    expect(a.played).toEqual(['sh']);
    expect(a.stops).toBe(1);
  });
});

import { FakeRecorder } from '../../src/audio/fake';

describe('FakeRecorder', () => {
  it('counts starts and stops and returns a small audio blob', async () => {
    const r = new FakeRecorder();
    expect(r.supported()).toBe(true);
    await r.start();
    const blob = await r.stop();
    expect(blob.size).toBeGreaterThan(0);
    expect(blob.type).toBe('audio/webm');
    expect(r.starts).toBe(1);
    expect(r.stops).toBe(1);
  });
});
