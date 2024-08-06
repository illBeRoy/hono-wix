import type { Hono } from 'hono';

export interface WixHttpFunctionRequest {
  readonly functionName: string;
  readonly method: string;
  readonly query?: Record<string, string>;
  readonly headers?: Record<string, string>;
  readonly body?: {
    text(): Promise<string>;
  };
}

export interface WixHttpFunctionResponse {
  headers: Record<string, string>;
  body: string | Buffer;
  status: number;
}

export async function handleRequest(
  app: Hono,
  request: WixHttpFunctionRequest,
): Promise<WixHttpFunctionResponse> {
  // @ts-expect-error wix-http-functions is only available on the Headless runtime. that's why we dynamically import it, so it doesn't break tests / local use of the package by eagerly importing this module
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
