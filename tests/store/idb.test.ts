import 'fake-indexeddb/auto';
import { describe } from 'vitest';
import { IdbStore } from '../../src/store/idb';
import { storeContract } from './contract';

let n = 0;
describe('IdbStore', () => storeContract(() => new IdbStore(`test-db-${n++}`)));
