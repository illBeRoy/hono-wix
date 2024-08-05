import { Hono } from 'hono';

const app = new Hono();

app.get('/hello', async () => {});

app.post('/world', async () => {});

export default app;
