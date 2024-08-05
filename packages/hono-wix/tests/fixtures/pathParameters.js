import { Hono } from 'hono';

const app = new Hono();

app.get('/:id', (c) => c.json({ response: 'world!' }));

export default app;
