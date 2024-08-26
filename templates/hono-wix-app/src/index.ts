import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) =>
  c.html(
    'Hello! This is your Hono app. Get started by editing <pre>src/index.ts</pre>, or go over the <a href="/_dev/readme">README!</a>',
  ),
);

export default app;
