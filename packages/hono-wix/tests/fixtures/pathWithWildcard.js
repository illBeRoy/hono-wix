import { Hono } from 'hono';

const app = new Hono();

app.get('/*', (c) => c.json({ response: 'world!' }));
app.get('/hello*', (c) => c.json({ response: 'world!' }));
app.get('/yo/*', (c) => c.json({ response: 'world!' }));

export default app;
