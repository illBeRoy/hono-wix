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
  const response = await app.request(request.functionName, {
    method: request.method,
    body: await request.body?.text(),
    headers: request.headers,
  });

  return {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: await response.text(),
  };
}
