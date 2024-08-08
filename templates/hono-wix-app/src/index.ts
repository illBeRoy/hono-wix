import { Hono } from 'hono';

const app = new Hono();

app.get('/hello', (c) => c.json({ answer: 'world!' }));

export default app;
