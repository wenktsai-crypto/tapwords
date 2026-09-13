import { describe, it, expect } from 'vitest';
import { MemoryStore } from '../../src/store/memory';
import { storeContract } from './contract';

describe('MemoryStore', () => storeContract(() => new MemoryStore()));
