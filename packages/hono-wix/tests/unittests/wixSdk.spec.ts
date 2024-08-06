import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Hono } from 'hono';
import { fetchWithAuth } from '@wix/sdk/context';
import { handleRequest, wixSdk } from '../../src';
import { server } from '../testkits/server';

describe('the wixSdk() middleware', () => {
  it('the Wix SDK on the context should have the authorization header from the request', async () => {
    await using testServer = await server();

    const myWixAuth = 'eyJhbGci.eyJzdWIiO.SflKxwRJSMeKK';

    const app = new Hono();

    app.use(wixSdk());
    app.post('/useFetchWithAuth', async (c) => {
      await fetchWithAuth(testServer.url);
      return c.text('ok');
    });

    await handleRequest(app, {
      functionName: 'useFetchWithAuth',
      method: 'POST',
      headers: { Authorization: myWixAuth },
    });

    const [reqFromWixClient] = testServer.reqs();
    assert.equal(reqFromWixClient.headers.authorization, myWixAuth);
  });

  it('each request should have its own header regardless of other concurrent requests', async () => {
    await using testServer = await server();

    const auth1 = 'eyJhbGci.eyJzdWIiO.SflKxwRJSMeKK';
    const auth2 = 'CI6IkpXVCJ9.M0NTY3ODkw.Ok6yJV_';

    const app = new Hono();

    app.use(wixSdk());
    app.post('/useFetchWithAuth', async (c) => {
      const { timeToWait } = await c.req.json();
      await new Promise((res) => setTimeout(res, timeToWait)); // wait some time to allow other requests to maybe override the auth header while we wait (if we didn't implement this correctly)
      await fetchWithAuth(testServer.url);
      return c.text('ok');
    });

    const twoConcurrentRequests = [
      handleRequest(app, {
        functionName: 'useFetchWithAuth',
        method: 'POST',
        body: {
          text: () => Promise.resolve(JSON.stringify({ timeToWait: 50 })),
        },
        headers: { Authorization: auth1 },
      }),
      handleRequest(app, {
        functionName: 'useFetchWithAuth',
        method: 'POST',
        body: {
          text: () => Promise.resolve(JSON.stringify({ timeToWait: 10 })),
        },
        headers: { Authorization: auth2 },
      }),
    ];

    await Promise.all(twoConcurrentRequests);

    const [testServerReq1, testServerReq2] = testServer.reqs();
    assert.equal(testServerReq1.headers.authorization, auth2);
    assert.equal(testServerReq2.headers.authorization, auth1);
  });
});
