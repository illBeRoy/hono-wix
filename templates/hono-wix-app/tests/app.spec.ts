import { describe, it } from 'node:test';
import assert from 'node:assert';
import app from '../src';

describe('My Hono App', () => {
  it('should respond when making a request to index', async () => {
    const res = await app.request('/');
    assert.equal(res.status, 200);
    assert((await res.text()).includes('Hello! This is your Hono app.'));
  });
});
