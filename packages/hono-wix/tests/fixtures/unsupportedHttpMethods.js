import { Hono } from 'hono';

const app = new Hono();

app.patch('/ptch', () => {});
app.head('/hd', () => {});
app.options('/opts', () => {});
app.connect('/cnct', () => {});
app.trace('/trc', () => {});

export default app;
