async function handleRequest(app, request) {
  const wixHttpFunctions = await import('wix-http-functions');

  const honoResponse = await app.request(request.functionName, {
    method: request.method,
    headers: request.headers,
    ...(['GET', 'HEAD'].includes(request.method.toUpperCase())
      ? {}
      : {
          body: await Promise.resolve()
            .then(() => request.body?.text())
            .catch(() => undefined),
        }),
  });

  return wixHttpFunctions.response({
    status: honoResponse.status,
    headers: Object.fromEntries(honoResponse.headers.entries()),
    body: await honoResponse.text(),
  });
}
