import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { IdbStore } from '../../src/store/idb';
import { CorruptDataError } from '../../src/store/types';
import { storeContract } from './contract';

let n = 0;
describe('IdbStore', () => storeContract(() => new IdbStore(`test-db-${n++}`)));

describe('IdbStore corrupt data', () => {
  it('reports damaged profile data instead of returning it', async () => {
    const name = `tapwords-test-${Math.random()}`;
    const { createStore, set } = await import('idb-keyval');
    await set('profiles', { nope: true }, createStore(name, 'kv'));
    const s = new IdbStore(name);
    await expect(s.listProfiles()).rejects.toBeInstanceOf(CorruptDataError);
  });
});
