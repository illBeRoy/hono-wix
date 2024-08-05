import { Hono } from 'hono';

const app = new Hono();

app.get('/hello', (c) => c.json({}));

app.post('/hey', (c) => c.json({}));

app.put('/hi', (c) => c.json({}));

app.delete('/aloha', (c) => c.json({}));

export default app;
