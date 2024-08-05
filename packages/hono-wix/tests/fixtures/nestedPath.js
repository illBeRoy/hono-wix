import { Hono } from 'hono';

const app = new Hono();

app.get('/hello/world', (c) => c.json({ response: 'world!' }));

export default app;
