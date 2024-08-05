import { Context, Hono } from 'hono';

const app = new Hono();

interface Response {
  response: string;
}

app.get('/hello', (c: Context) => c.json<Response>({ response: 'world!' }));

export default app;
