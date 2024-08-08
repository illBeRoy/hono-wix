import { describe, it } from 'node:test';
import assert from 'node:assert';
import app from '../src';

describe('My Hono App', () => {
  it('should respond to "hello"', async () => {
    const res = await app.request('/hello');
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { answer: 'world!' });
  });
});
