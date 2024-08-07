import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Hono } from 'hono';
import { mockWixHttpFunctionsModule } from '../testkits/wixHttpFunctions';
import { handleRequest } from '../../src/runtime/handleRequest';

describe('hono-wix runtime library', () => {
  it('should proxy requests into the hono app', async () => {
    using wixHttpFunctions = await mockWixHttpFunctionsModule();

    const app = new Hono();
    app.get('/hello', (c) => c.json({ answer: 'world' }));

    const res = await handleRequest(app, {
      functionName: 'hello',
      method: 'GET',
    });

    assert.deepEqual(
      res,
      wixHttpFunctions.response({
        status: 200,
        headers: { 'content-type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ answer: 'world' }),
      }),
    );
  });

  it('should call the right endpoint', async () => {
    using wixHttpFunctions = await mockWixHttpFunctionsModule();

    const app = new Hono();
    app.get('/hello', (c) => c.json({ answer: 'i am wrong' }));
    app.get('/world', (c) => c.json({ answer: 'i am right!' }));

    const res = await handleRequest(app, {
      functionName: 'world',
      method: 'GET',
    });

    assert.deepEqual(
      res,
      wixHttpFunctions.response({
        status: 200,
        headers: { 'content-type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ answer: 'i am right!' }),
      }),
    );
  });

  it('should call the right method', async () => {
    using wixHttpFunctions = await mockWixHttpFunctionsModule();

    const app = new Hono();
    app.get('/hello', (c) => c.json({ answer: 'i am wrong' }));
    app.post('/hello', (c) => c.json({ answer: 'i am right!' }));

    const res = await handleRequest(app, {
      functionName: 'hello',
      method: 'POST',
    });

    assert.deepEqual(
      res,
      wixHttpFunctions.response({
        status: 200,
        headers: { 'content-type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ answer: 'i am right!' }),
      }),
    );
  });

  it('should pass the body in', async () => {
    using wixHttpFunctions = await mockWixHttpFunctionsModule();

    const app = new Hono();

    app.post('/echo', async (c) => {
      return c.json({ answer: await c.req.text() });
    });

    const res = await handleRequest(app, {
      functionName: 'echo',
      method: 'POST',
      body: {
        text: () => Promise.resolve('echo me please!'),
      },
    });

    assert.deepEqual(
      res,
      wixHttpFunctions.response({
        status: 200,
        headers: { 'content-type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ answer: 'echo me please!' }),
      }),
    );
  });

  it('should ignore the body if could not fetch from the request', async () => {
    using wixHttpFunctions = await mockWixHttpFunctionsModule();

    const app = new Hono();

    app.get('/iHaveNoBody', async (c) => {
      return c.json({ theBodyYouSentIs: await c.req.text() });
    });

    const res = await handleRequest(app, {
      functionName: 'iHaveNoBody',
      method: 'GET',
      body: {
        text: () => {
          throw new Error('No body in GET requests!');
        },
      },
    });

    assert.deepEqual(
      res,
      wixHttpFunctions.response({
        status: 200,
        headers: { 'content-type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ theBodyYouSentIs: '' }),
      }),
    );
  });

  it('should pass headers in', async () => {
    using wixHttpFunctions = await mockWixHttpFunctionsModule();

    const app = new Hono();

    app.post('/echoHeader', async (c) => {
      return c.json({ answer: await c.req.header('x-echo-me') });
    });

    const res = await handleRequest(app, {
      functionName: 'echoHeader',
      method: 'POST',
      headers: {
        'x-echo-me': 'header echoed successfully!',
      },
    });

    assert.deepEqual(
      res,
      wixHttpFunctions.response({
        status: 200,
        headers: { 'content-type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ answer: 'header echoed successfully!' }),
      }),
    );
  });

  it('should pass headers out', async () => {
    using wixHttpFunctions = await mockWixHttpFunctionsModule();

    const app = new Hono();

    app.get('/giveMeHeader', async (c) => {
      c.header('x-the-header', 'you got it!');
      return c.body(null);
    });

    const res = await handleRequest(app, {
      functionName: 'giveMeHeader',
      method: 'GET',
    });

    assert.deepEqual(
      res,
      wixHttpFunctions.response({
        status: 200,
        headers: { 'x-the-header': 'you got it!' },
        body: '',
      }),
    );
  });

  it('should respond with the right status', async () => {
    using wixHttpFunctions = await mockWixHttpFunctionsModule();

    const app = new Hono();

    app.get('/tryToEnter', async (c) => {
      return c.text('no entry!', 401);
    });

    const res = await handleRequest(app, {
      functionName: 'tryToEnter',
      method: 'GET',
    });

    assert.deepEqual(
      res,
      wixHttpFunctions.response({
        status: 401,
        headers: { 'content-type': 'text/plain; charset=UTF-8' },
        body: 'no entry!',
      }),
    );
  });
});
